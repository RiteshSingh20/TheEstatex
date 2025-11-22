import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle } from '../utils/formSubmissionUtils';

// Custom hook for performance optimization
export const usePerformanceOptimization = () => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    lastRenderTimeRef.current = Date.now();
  });

  const getRenderStats = useCallback(() => ({
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
  }), []);

  return { getRenderStats };
};

// Custom hook for debounced state updates
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] => {
  const [immediateValue, setImmediateValue] = React.useState(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState(initialValue);

  const debouncedSetValue = useMemo(
    () => debounce((value: T) => setDebouncedValue(value), delay),
    [delay]
  );

  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
    debouncedSetValue(value);
  }, [debouncedSetValue]);

  return [immediateValue, setValue, debouncedValue];
};

// Custom hook for throttled callbacks
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T => {
  return useMemo(
    () => throttle(callback, delay) as T,
    [callback, delay]
  );
};

// Custom hook for memoized calculations
export const useMemoizedCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};

// Custom hook for preventing unnecessary re-renders
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// Custom hook for managing object URLs with cleanup
export const useObjectURL = () => {
  const urlsRef = useRef<Set<string>>(new Set());

  const createObjectURL = useCallback((file: File): string => {
    try {
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);
      return url;
    } catch (error) {
      console.error('Failed to create object URL:', error);
      return '';
    }
  }, []);

  const revokeObjectURL = useCallback((url: string) => {
    try {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
    } catch (error) {
      console.warn('Failed to revoke object URL:', error);
    }
  }, []);

  const revokeAllObjectURLs = useCallback(() => {
    urlsRef.current.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke object URL:', error);
      }
    });
    urlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      revokeAllObjectURLs();
    };
  }, [revokeAllObjectURLs]);

  return { createObjectURL, revokeObjectURL, revokeAllObjectURLs };
};

// Custom hook for error boundaries
export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, errorInfo?: any) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // You can add error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    return error;
  }, []);

  const safeExecute = useCallback(async <T>(
    fn: () => Promise<T> | T,
    fallback?: T
  ): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      return fallback;
    }
  }, [handleError]);

  return { handleError, safeExecute };
};

// Custom hook for component lifecycle tracking
export const useLifecycleLogger = (componentName: string) => {
  const mountTimeRef = useRef<number>();
  const renderCountRef = useRef(0);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    console.log(`${componentName} mounted at:`, new Date().toISOString());

    return () => {
      const mountTime = mountTimeRef.current;
      const lifespan = mountTime ? Date.now() - mountTime : 0;
      console.log(`${componentName} unmounted after ${lifespan}ms, ${renderCountRef.current} renders`);
    };
  }, [componentName]);

  useEffect(() => {
    renderCountRef.current += 1;
  });
};

// Custom hook for preventing memory leaks in async operations
export const useAsyncOperation = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | undefined> => {
    try {
      const result = await asyncFn();
      
      if (isMountedRef.current && onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      if (isMountedRef.current && onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      return undefined;
    }
  }, []);

  return { executeAsync, isMounted: () => isMountedRef.current };
};