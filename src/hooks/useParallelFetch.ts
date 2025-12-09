/**
 * 并行数据获取 Hook
 * 解决问题：详情页数据获取串行
 *
 * 支持并行获取多个数据源，提升性能
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

type FetchConfig<T> = {
  key: string;
  fetcher: () => Promise<T>;
  enabled?: boolean;
};

type ParallelFetchResult<T extends Record<string, unknown>> = {
  data: { [K in keyof T]: T[K] | null };
  loading: boolean;
  errors: { [K in keyof T]?: Error };
  refetch: () => void;
};

export function useParallelFetch<T extends Record<string, unknown>>(
  configs: { [K in keyof T]: FetchConfig<T[K]> },
): ParallelFetchResult<T> {
  const [states, setStates] = useState<{ [K in keyof T]: FetchState<T[K]> }>(() => {
    const initial = {} as { [K in keyof T]: FetchState<T[K]> };
    for (const key of Object.keys(configs) as (keyof T)[]) {
      initial[key] = { data: null, loading: true, error: null };
    }
    return initial;
  });

  const fetchAll = useCallback(async () => {
    const keys = Object.keys(configs) as (keyof T)[];

    // 重置所有状态为 loading
    setStates((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        if (configs[key].enabled !== false) {
          next[key] = { ...next[key], loading: true, error: null };
        }
      }
      return next;
    });

    // 并行执行所有请求
    const promises = keys.map(async (key) => {
      const config = configs[key];
      if (config.enabled === false) {
        return { key, data: null, error: null };
      }

      try {
        const data = await config.fetcher();
        return { key, data, error: null };
      } catch (error) {
        return { key, data: null, error: error as Error };
      }
    });

    const results = await Promise.all(promises);

    // 更新状态
    setStates((prev) => {
      const next = { ...prev };
      for (const result of results) {
        next[result.key as keyof T] = {
          data: result.data,
          loading: false,
          error: result.error,
        };
      }
      return next;
    });
  }, [configs]);

  // Initial fetch on mount
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      void fetchAll();
    }
  }, [fetchAll]);

  // 计算聚合状态
  const loading = Object.values(states).some(s => (s as FetchState<unknown>).loading);
  const data = {} as { [K in keyof T]: T[K] | null };
  const errors = {} as { [K in keyof T]?: Error };

  for (const key of Object.keys(states) as (keyof T)[]) {
    data[key] = states[key].data;
    if (states[key].error) {
      errors[key] = states[key].error!;
    }
  }

  return {
    data,
    loading,
    errors,
    refetch: fetchAll,
  };
}

// 简化版：单个请求
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Memoize deps to create stable reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedDeps = useMemo(() => deps, deps);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedDeps]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
