import express from "express";
import crypto from "crypto";
import { Storage } from "@google-cloud/storage";
import NodeCache from "node-cache";

const app = express();
const storage = new Storage();

// In-memory cache for signed URLs (10 minutes)
const urlCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const SECRET_KEY = process.env.SECRET_KEY || "change-me";
const ALLOWED_ORIGINS = ["https://theestatex.com", "http://localhost:5173"];
const BUCKET_NAME = "estatexd4p.firebasestorage.app";
const URL_TTL = 15 * 60;

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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Range");
  next();
});

app.options("*", (_, res) => res.sendStatus(200));

// BATCH ENDPOINT: Handle multiple URLs at once
app.post("/batch-signed-urls", express.json(), async (req, res) => {
  if (!isValidRequest(req)) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { tokens } = req.body;
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: "Tokens array required" });
  }

  if (tokens.length > 50) {
    return res.status(400).json({ error: "Maximum 50 URLs per batch" });
  }

  const results = await Promise.allSettled(
    tokens.map(async (token) => {
      const firebaseUrl = verifyToken(token);
      if (!firebaseUrl) throw new Error("Invalid token");

      const objectPath = extractObjectPath(firebaseUrl);
      if (!objectPath) throw new Error("Invalid URL");

      // Check cache first
      const cached = urlCache.get(objectPath);
      if (cached) return { token, signedUrl: cached, cached: true };

      const file = storage.bucket(BUCKET_NAME).file(objectPath);
      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + URL_TTL * 1000,
      });

      // Cache the result
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
    // Check cache first
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

    // Cache the result
    urlCache.set(objectPath, signedUrl);

    // Add security headers to prevent URL leakage
    res.setHeader(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");

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

// FALLBACK ENDPOINT: Proxy streaming (only for special cases)
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

    // For PDFs, use chunked streaming to handle large files
    if (isPDF) {
      try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'private, max-age=300');
        res.setHeader('Accept-Ranges', 'bytes');
        
        // Handle range requests for chunked delivery
        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1048576, fileSize - 1); // 1MB chunks
          const chunksize = (end - start) + 1;
          
          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
          res.setHeader('Content-Length', chunksize);
          
          const stream = file.createReadStream({ start, end });
          return stream.pipe(res);
        }
        
        // No range - send first chunk to trigger range requests
        const end = Math.min(1048575, fileSize - 1);
        res.status(206);
        res.setHeader('Content-Range', `bytes 0-${end}/${fileSize}`);
        res.setHeader('Content-Length', end + 1);
        
        const stream = file.createReadStream({ start: 0, end });
        return stream.pipe(res);
        
      } catch (err) {
        console.error(`[${requestId}] PDF error:`, err);
        return res.status(500).json({ error: 'Failed to process PDF' });
      }
    }

    // For non-PDFs, use signed URL approach
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + URL_TTL * 1000,
    });

    // Redirect large non-PDF files
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

    [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ].forEach((header) => {
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Signed Media Gateway running on ${PORT}`);
});
