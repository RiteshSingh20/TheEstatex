import { useState, useEffect, useCallback } from 'react';
import { mediaSecurityManager } from '../utils/mediaSecurityManager';

interface UseBatchSecureMediaResult {
  secureUrls: Record<string, string>;
  loading: boolean;
  error: string | null;
  loadedCount: number;
  totalCount: number;
}

export const useBatchSecureMedia = (
  urls: string[]
): UseBatchSecureMediaResult => {
  const [secureUrls, setSecureUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const loadUrls = useCallback(async () => {
    if (!urls.length) return;

    setLoading(true);
    setError(null);
    setLoadedCount(0);

    try {
      // Preload all URLs
      await mediaSecurityManager.preloadUrls(urls);

      // Get individual URLs
      const results: Record<string, string> = {};
      let loaded = 0;

      for (const url of urls) {
        try {
          const secureUrl = await mediaSecurityManager.getSecureUrl(url);
          results[url] = secureUrl;
          loaded++;
          setLoadedCount(loaded);
        } catch (err) {
          console.warn('Failed to load URL:', url, err);
          results[url] = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg=='; // Error placeholder
          loaded++;
          setLoadedCount(loaded);
        }
      }

      setSecureUrls(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [urls]);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  return {
    secureUrls,
    loading,
    error,
    loadedCount,
    totalCount: urls.length
  };
};