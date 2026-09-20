import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Data fetching with the four states every screen needs:
 * loading, error, empty and ready.
 */
export function useApi(fetcher, deps = [], { immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcherRef.current(...args);
      if (!mounted.current) return null;
      // Guards against a misbehaving proxy/server returning an HTML error
      // page for an API route instead of JSON or a rejected request — in
      // that case axios hands back a raw string, which would otherwise
      // silently replace the expected array/object shape.
      const next = response?.data ?? response ?? null;
      setData(typeof next === 'string' ? initialData : next);
      setMeta(response?.meta ?? null);
      return response;
    } catch (err) {
      if (mounted.current) setError(err);
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, meta, loading, error, refetch: run, setData };
}
