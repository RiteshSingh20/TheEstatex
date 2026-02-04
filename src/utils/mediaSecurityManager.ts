import CryptoJS from "crypto-js";

const SECRET_KEY =
  import.meta.env.VITE_SECRET_KEY || "your-secret-key-change-this";
const MEDIA_SERVER_URL = "https://signed-media-gateway-6g67budntq-el.a.run.app";

// Cache for 12 minutes (shorter than server TTL)
const CACHE_TTL = 12 * 60 * 1000;

export interface SecureMediaOptions {
  allowDirectAccess?: boolean;
  cacheControl?: string;
  useBatch?: boolean;
}

export class MediaSecurityManager {
  private static instance: MediaSecurityManager;
  private urlCache = new Map<string, { signedUrl: string; expires: number }>();
  private pendingRequests = new Map<string, Promise<string>>();
  private batchQueue: string[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  static getInstance(): MediaSecurityManager {
    if (!MediaSecurityManager.instance) {
      MediaSecurityManager.instance = new MediaSecurityManager();
    }
    return MediaSecurityManager.instance;
  }

  createToken(url: string): string {
    const timestamp = Date.now();
    const data = `${url}|${timestamp}`;
    const hash = CryptoJS.HmacSHA256(data, SECRET_KEY).toString();
    return btoa(data) + "." + hash;
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const urls = this.batchQueue.splice(0, 50);
    const tokens = urls.map(url => this.createToken(url));

    try {
      const response = await fetch(`${MEDIA_SERVER_URL}/batch-signed-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': window.location.origin
        },
        body: JSON.stringify({ tokens })
      });

      if (response.ok) {
        const data = await response.json();
        data.results.forEach((result: any, index: number) => {
          if (result.success && result.signedUrl) {
            const cacheExpiry = data.expires ? 
              Math.min(data.expires - 60000, Date.now() + CACHE_TTL) :
              Date.now() + CACHE_TTL;
            
            this.urlCache.set(urls[index], {
              signedUrl: result.signedUrl,
              expires: cacheExpiry
            });
          }
        });
      }
    } catch (error) {
      console.error('Batch request failed:', error);
    }
  }

  async getSecureUrl(
    originalUrl: string,
    options: SecureMediaOptions = {}
  ): Promise<string> {
    const { allowDirectAccess = false } = options;

    if (allowDirectAccess) {
      return originalUrl;
    }

    // Check cache first
    const cached = this.urlCache.get(originalUrl);
    if (cached && Date.now() < cached.expires) {
      return cached.signedUrl;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(originalUrl);
    if (pending) {
      return pending;
    }

    // Add to batch queue for bulk processing
    if (!this.batchQueue.includes(originalUrl)) {
      this.batchQueue.push(originalUrl);
    }

    // Set batch timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    this.batchTimeout = setTimeout(() => this.processBatch(), 50); // 50ms batch window

    // Create individual request promise
    const requestPromise = this.getSingleUrl(originalUrl);
    this.pendingRequests.set(originalUrl, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(originalUrl);
    }
  }

  private async getSingleUrl(originalUrl: string): Promise<string> {
    try {
      const token = this.createToken(originalUrl);
      const response = await fetch(`${MEDIA_SERVER_URL}/signed-url?token=${token}`, {
        method: 'GET',
        headers: {
          'Referer': window.location.origin
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.signedUrl) {
          const cacheExpiry = data.expires ? 
            Math.min(data.expires - 60000, Date.now() + CACHE_TTL) :
            Date.now() + CACHE_TTL;
            
          this.urlCache.set(originalUrl, {
            signedUrl: data.signedUrl,
            expires: cacheExpiry
          });
          return data.signedUrl;
        }
      }

      throw new Error(`Server responded with ${response.status}`);
    } catch (error) {
      console.error('Error getting signed URL:', error);
      // NEVER return original URL - return placeholder instead
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
    }
  }

  clearCache(): void {
    this.urlCache.clear();
    this.pendingRequests.clear();
    this.batchQueue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  async preloadUrls(urls: string[]): Promise<void> {
    const uncachedUrls = urls.filter(url => {
      const cached = this.urlCache.get(url);
      return !cached || Date.now() >= cached.expires;
    });

    if (uncachedUrls.length === 0) return;

    for (let i = 0; i < uncachedUrls.length; i += 50) {
      const batch = uncachedUrls.slice(i, i + 50);
      const tokens = batch.map(url => this.createToken(url));

      try {
        const response = await fetch(`${MEDIA_SERVER_URL}/batch-signed-urls`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': window.location.origin
          },
          body: JSON.stringify({ tokens })
        });

        if (response.ok) {
          const data = await response.json();
          data.results.forEach((result: any, index: number) => {
            if (result.success && result.signedUrl) {
              const cacheExpiry = data.expires ? 
                Math.min(data.expires - 60000, Date.now() + CACHE_TTL) :
                Date.now() + CACHE_TTL;
              
              this.urlCache.set(batch[index], {
                signedUrl: result.signedUrl,
                expires: cacheExpiry
              });
            }
          });
        }
      } catch (error) {
        console.error('Preload batch failed:', error);
      }
    }
  }

  isValidMediaUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only Firebase Storage URLs are supported by the new server
      return urlObj.hostname === 'firebasestorage.googleapis.com';
    } catch {
      return false;
    }
  }
}

export const mediaSecurityManager = MediaSecurityManager.getInstance();
