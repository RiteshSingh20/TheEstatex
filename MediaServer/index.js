const fetch = require("node-fetch");
const crypto = require("crypto");

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key-change-this";

function createToken(url) {
  const timestamp = Date.now();
  const data = `${url}|${timestamp}`;
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + hash;
}

function verifyToken(token) {
  try {
    const [dataPart, hashPart] = token.split('.');
    const data = Buffer.from(dataPart, 'base64').toString('utf8');
    const [url, timestamp] = data.split('|');
    
    const expectedHash = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
    
    if (hashPart !== expectedHash) return null;
    
    const age = Date.now() - parseInt(timestamp);
    if (age > 3600000) return null; // 1 hour expiry
    
    return url;
  } catch (error) {
    return null;
  }
}

exports.MediaServer = async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type, Range");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { token, url: directUrl } = req.query;

  let url;
  
  if (token) {
    url = verifyToken(token);
    if (!url) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }
  } else if (directUrl) {
    url = directUrl;
  } else {
    res.status(400).json({ error: "Token or URL parameter is required" });
    return;
  }

  try {
    const headers = {};
    if (req.headers.range) {
      headers.Range = req.headers.range;
    }

    const response = await fetch(url, { headers });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    response.body.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resource" });
  }
};
