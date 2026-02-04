import { useState, useEffect, useCallback, useMemo } from 'react';
import { mediaSecurityManager, SecureMediaOptions } from '../utils/mediaSecurityManager';

interface UseSecureMediaResult {
  secureUrl: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useSecureMedia = (
  originalUrl: string | null,
  options: SecureMediaOptions = {}
): UseSecureMediaResult => {
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

  const generateSecureUrl = useCallback(async () => {
    if (!originalUrl) {
      setSecureUrl(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!mediaSecurityManager.isValidMediaUrl(originalUrl)) {
        throw new Error('Invalid media URL domain');
      }

      const secure = await mediaSecurityManager.getSecureUrl(originalUrl, memoizedOptions);
      setSecureUrl(secure);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get signed URL');
      setSecureUrl(null);
    } finally {
      setLoading(false);
    }
  }, [originalUrl, memoizedOptions]);

  useEffect(() => {
    generateSecureUrl();
  }, [generateSecureUrl]);

  const refresh = useCallback(() => {
    generateSecureUrl();
  }, [generateSecureUrl]);

  return { secureUrl, loading, error, refresh };
};