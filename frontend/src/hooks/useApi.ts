import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (err: Error) => void;
}

/**
 * Custom hook for making API requests with loading, error, and refetch states.
 */
export function useApi<T>(
  url: string | (() => Promise<T>),
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      let result: T;
      if (typeof url === 'function') {
        result = await url();
      } else {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || body.error || `HTTP ${res.status}`);
        }
        result = await res.json();
      }

      setState({ data: result, isLoading: false, error: null });
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setState({ data: null, isLoading: false, error: errorMsg });
      if (onError) onError(err);
      throw err;
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (immediate && typeof url === 'string') {
      execute();
    }
  }, [execute, immediate, url]);

  return {
    ...state,
    refetch: execute,
  };
}
