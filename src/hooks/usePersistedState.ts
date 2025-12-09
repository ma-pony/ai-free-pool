/**
 * 状态持久化 Hook
 * 解决问题：筛选器状态刷新后丢失
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

type StorageType = 'local' | 'session';

export function usePersistedState<T>(
  key: string,
  initialValue: T,
  storage: StorageType = 'local',
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return storage === 'local' ? localStorage : sessionStorage;
  }, [storage]);

  const [state, setState] = useState<T>(() => {
    const storageObj = getStorage();
    if (!storageObj) {
      return initialValue;
    }
    try {
      const item = storageObj.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    const storageObj = getStorage();
    if (!storageObj) {
      return;
    }
    try {
      storageObj.setItem(key, JSON.stringify(state));
    } catch {
      // Storage quota exceeded
    }
  }, [key, state, getStorage]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      return typeof value === 'function'
        ? (value as (prev: T) => T)(prev)
        : value;
    });
  }, []);

  const clearValue = useCallback(() => {
    const storageObj = getStorage();
    if (storageObj) {
      storageObj.removeItem(key);
    }
    setState(initialValue);
  }, [key, initialValue, getStorage]);

  return [state, setValue, clearValue];
}

export function useFilterExpandState(
  filterKey: string,
  defaultExpanded: Record<string, boolean> = {},
) {
  const [expandedSections, setExpandedSections] = usePersistedState<Record<string, boolean>>(
    `filter-expand-${filterKey}`,
    defaultExpanded,
    'session',
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, [setExpandedSections]);

  const isExpanded = useCallback((section: string) => {
    return expandedSections[section] ?? defaultExpanded[section] ?? false;
  }, [expandedSections, defaultExpanded]);

  return { expandedSections, toggleSection, isExpanded, setExpandedSections };
}
