import CryptoJS from 'crypto-js';

const MEDIA_PROXY_URL = import.meta.env.VITE_MEDIA_PROXY_URL || 'https://signed-media-gateway-6g67budntq-el.a.run.app';
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'EstateX2024SecureMedia9f8a7b6c5d4e3f2a1b0c';

// Cache for signed URLs
const urlCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function createToken(firebaseUrl: string): string {
  const timestamp = Date.now().toString();
  const data = `${firebaseUrl}|${timestamp}`;
  const dataBase64 = btoa(data);
  const hash = CryptoJS.HmacSHA256(data, SECRET_KEY).toString();
  return `${dataBase64}.${hash}`;
}

export async function getSecureMediaUrl(firebaseUrl: string): Promise<string> {
  if (!firebaseUrl || !firebaseUrl.includes('firebase')) {
    return firebaseUrl;
  }

  // Check cache first
  const cached = urlCache.get(firebaseUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  try {
    const token = createToken(firebaseUrl);
    const response = await fetch(`${MEDIA_PROXY_URL}/signed-url?token=${encodeURIComponent(token)}`);
    
    if (!response.ok) {
      console.warn('Failed to get signed URL, using original:', firebaseUrl);
      return firebaseUrl;
    }

    const data = await response.json();
    
    // Cache the result
    urlCache.set(firebaseUrl, {
      url: data.signedUrl,
      timestamp: Date.now()
    });

    return data.signedUrl;
  } catch (error) {
    console.warn('Error getting signed URL, using original:', error);
    return firebaseUrl;
  }
}

export async function getSecureMediaUrls(firebaseUrls: string[]): Promise<string[]> {
  // For thumbnails, use direct streaming endpoint
  return firebaseUrls.map(url => {
    if (!url || !url.includes('firebase')) {
      return url;
    }
    const token = createToken(url);
    return `${MEDIA_PROXY_URL}/?token=${encodeURIComponent(token)}`;
  });
}