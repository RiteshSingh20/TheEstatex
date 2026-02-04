import express from "express";
import crypto from "crypto";
import { Storage } from "@google-cloud/storage";
import NodeCache from "node-cache";

const app = express();
const storage = new Storage();

// Enhanced cache with compression support
const urlCache = new NodeCache({ 
  stdTTL: 600, 
  checkperiod: 120,
  maxKeys: 10000,
  useClones: false 
});

const SECRET_KEY = process.env.SECRET_KEY || "change-me";
const ALLOWED_ORIGINS = ["https://theestatex.com", "http://localhost:5173"];
const BUCKET_NAME = "estatexd4p.firebasestorage.app";
const URL_TTL = 15 * 60;
const MAX_CHUNK_SIZE = 512 * 1024; // 512KB chunks for better performance
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

function verifyToken(token) {
  try {
    const [dataPart, hashPart] = token.split(".");
    const data = Buffer.from(dataPart, "base64").toString("utf8");
    const [url, timestamp] = data.split("|");

    const expectedHash = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(data)
      .digest("hex");

    if (hashPart !== expectedHash) return null;
    if (Date.now() - Number(timestamp) > 60 * 60 * 1000) return null;

    return url;
  } catch {
    return null;
  }
}

function isValidRequest(req) {
  const referer = req.headers.referer || req.headers.referrer;
  if (!referer) return false;
  return ALLOWED_ORIGINS.some((origin) => referer.startsWith(origin));
}

function extractObjectPath(firebaseUrl) {
  const match = firebaseUrl.match(/\/o\/(.+?)\?/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

// Enhanced CORS and security headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Range, Cache-Control");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.options("*", (_, res) => res.sendStatus(200));

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    cache: { keys: urlCache.keys().length }
  });
});

// BATCH ENDPOINT: Handle multiple URLs at once
app.post("/batch-signed-urls", express.json({ limit: '1mb' }), async (req, res) => {
  if (!isValidRequest(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { tokens } = req.body;
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: "Tokens array required" });
  }

  if (tokens.length > 100) { // Increased limit
    return res.status(400).json({ error: "Maximum 100 URLs per batch" });
  }

  const results = await Promise.allSettled(
    tokens.map(async (token) => {
      const firebaseUrl = verifyToken(token);
      if (!firebaseUrl) throw new Error("Invalid token");

      const objectPath = extractObjectPath(firebaseUrl);
      if (!objectPath) throw new Error("Invalid URL");

      const cached = urlCache.get(objectPath);
      if (cached) return { token, signedUrl: cached, cached: true };

      const file = storage.bucket(BUCKET_NAME).file(objectPath);
      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + URL_TTL * 1000,
      });

      urlCache.set(objectPath, signedUrl);
      return { token, signedUrl, cached: false };
    })
  );

  const response = {
    results: results.map((result, index) => ({
      token: tokens[index],
      success: result.status === "fulfilled",
      signedUrl: result.status === "fulfilled" ? result.value.signedUrl : null,
      cached: result.status === "fulfilled" ? result.value.cached : false,
      error: result.status === "rejected" ? result.reason.message : null,
    })),
    expires: Date.now() + URL_TTL * 1000,
  };

  res.json(response);
});

// OPTIMIZED SINGLE URL ENDPOINT
app.get("/signed-url", async (req, res) => {
  if (!isValidRequest(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token required" });
  }

  const firebaseUrl = verifyToken(token);
  if (!firebaseUrl) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const objectPath = extractObjectPath(firebaseUrl);
  if (!objectPath) {
    return res.status(400).json({ error: "Invalid Firebase URL" });
  }

  try {
    const cached = urlCache.get(objectPath);
    if (cached) {
      return res.json({
        signedUrl: cached,
        expires: Date.now() + URL_TTL * 1000,
        cached: true,
      });
    }

    const file = storage.bucket(BUCKET_NAME).file(objectPath);
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + URL_TTL * 1000,
    });

    urlCache.set(objectPath, signedUrl);

    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");

    res.json({
      signedUrl,
      expires: Date.now() + URL_TTL * 1000,
      cached: false,
    });
  } catch (err) {
    console.error(`Error generating signed URL:`, err);
    return res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

// ENHANCED STREAMING ENDPOINT: Optimized for largest files
app.get("/", async (req, res) => {
  const requestId = crypto.randomUUID();

  if (!isValidRequest(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token required" });
  }

  const firebaseUrl = verifyToken(token);
  if (!firebaseUrl) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const objectPath = extractObjectPath(firebaseUrl);
  if (!objectPath) {
    return res.status(400).json({ error: "Invalid Firebase URL" });
  }

  try {
    const file = storage.bucket(BUCKET_NAME).file(objectPath);
    const [metadata] = await file.getMetadata();
    const fileSize = parseInt(metadata.size || "0");
    const isPDF = objectPath.toLowerCase().endsWith('.pdf');

    // Enhanced PDF streaming with adaptive chunking
    if (isPDF) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'private, max-age=300');
      res.setHeader('Accept-Ranges', 'bytes');

      const range = req.headers.range;
      
      if (range) {
        // Handle range requests with optimized chunk sizes
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : start + MAX_CHUNK_SIZE - 1;
        
        // Adaptive chunk sizing based on file size
        const chunkSize = fileSize > LARGE_FILE_THRESHOLD ? MAX_CHUNK_SIZE : Math.min(MAX_CHUNK_SIZE * 2, 1024 * 1024);
        end = Math.min(end, start + chunkSize - 1, fileSize - 1);
        
        const contentLength = (end - start) + 1;
        
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', contentLength);
        
        const stream = file.createReadStream({ start, end });
        
        stream.on('error', (err) => {
          console.error(`[${requestId}] Range stream error:`, err);
          if (!res.headersSent) {
            res.status(500).end();
          }
        });
        
        return stream.pipe(res);
      }
      
      // No range header - send complete small files, force chunking for large files
      if (fileSize > 5 * 1024 * 1024) { // 5MB+
        // For large files, redirect to signed URL to avoid chunking issues
        const [signedUrl] = await file.getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + URL_TTL * 1000,
        });
        return res.redirect(302, signedUrl);
      }
      
      // Small PDFs - stream complete file
      res.setHeader('Content-Length', metadata.size);
      const stream = file.createReadStream();
      
      stream.on('error', (err) => {
        console.error(`[${requestId}] Full stream error:`, err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      
      return stream.pipe(res);
    }

    // Non-PDF files - optimized handling
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + URL_TTL * 1000,
    });

    // Always redirect large non-PDF files
    if (fileSize > 10 * 1024 * 1024) {
      return res.redirect(302, signedUrl);
    }

    // Stream small non-PDF files
    const fetch = (await import("node-fetch")).default;
    const upstream = await fetch(signedUrl, {
      headers: req.headers.range ? { Range: req.headers.range } : undefined,
    });

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(502).json({ error: "Upstream fetch failed" });
    }

    // Copy headers
    ["content-type", "content-length", "content-range", "accept-ranges"].forEach((header) => {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    });

    res.setHeader("Cache-Control", "private, max-age=300");
    res.status(upstream.status);
    upstream.body.pipe(res);
    
  } catch (err) {
    console.error(`[${requestId}] Error:`, err);
    return res.status(500).json({ error: "Failed to stream media" });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  urlCache.flushAll();
  process.exit(0);
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Enhanced Media Gateway running on ${PORT}`);
  console.log(`Max chunk size: ${MAX_CHUNK_SIZE / 1024}KB`);
  console.log(`Large file threshold: ${LARGE_FILE_THRESHOLD / 1024 / 1024}MB`);
});

// Enhanced server configuration
server.timeout = 300000; // 5 minutes
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds