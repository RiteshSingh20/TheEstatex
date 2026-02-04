import CryptoJS from "crypto-js";
import { mediaSecurityManager } from './mediaSecurityManager';

const SECRET_KEY =
  import.meta.env.VITE_SECRET_KEY || "your-secret-key-change-this";

// Legacy function - use mediaSecurityManager for new implementations
export function encryptUrl(url: string): string {
  const timestamp = Date.now();
  const data = `${url}|${timestamp}`;
  const hash = CryptoJS.HmacSHA256(data, SECRET_KEY).toString();
  return btoa(data) + "." + hash;
}

// New secure media URL function
export async function getSecureMediaUrl(url: string): Promise<string> {
  return await mediaSecurityManager.getSecureUrl(url);
}

// Batch secure multiple URLs
export async function getSecureMediaUrls(urls: string[]): Promise<string[]> {
  const results = await Promise.allSettled(urls.map(url => getSecureMediaUrl(url)));
  return results.map((result, index) => 
    result.status === 'fulfilled' ? result.value : urls[index]
  );
}

// Check if URL needs securing
export function needsSecuring(url: string): boolean {
  return mediaSecurityManager.isValidMediaUrl(url);
}

// Preload signed URL for better performance
export async function preloadSecureUrl(url: string): Promise<void> {
  try {
    await mediaSecurityManager.getSecureUrl(url);
  } catch (error) {
    console.warn('Failed to preload secure URL:', error);
  }
}
