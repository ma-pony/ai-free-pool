/**
 * SearchBox Component
 * 搜索框组件 - 支持 Hero 和普通两种样式
 */
'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SearchBoxProps = {
  variant?: 'hero' | 'default';
  placeholder?: string;
  className?: string;
};

export default function SearchBox({
  variant = 'default',
  placeholder,
  className = '',
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations('Index');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/campaigns?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const inputPlaceholder = placeholder || t('hero_search_placeholder');

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSearch} className={`flex gap-3 ${className}`}>
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={inputPlaceholder}
            className={`w-full rounded-xl border-2 bg-white/10 px-5 py-3.5 text-base text-white placeholder-white/60 backdrop-blur-sm transition-all focus:outline-none ${
              isFocused
                ? 'border-white/50 bg-white/20 shadow-lg'
                : 'border-white/30'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-lg text-white/60 transition-colors hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-2xl shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="搜索"
        >
          🔍
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={inputPlaceholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700 active:scale-95"
      >
        🔍
      </button>
    </form>
  );
}
