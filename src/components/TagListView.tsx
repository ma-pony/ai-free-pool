'use client';

import type { Tag } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type TagWithCount = Tag & { campaignCount: number };

type TagListViewProps = {
  tags: TagWithCount[];
  onTagClick?: (tag: Tag) => void;
};

export function TagListView({ tags, onTagClick }: TagListViewProps) {
  const t = useTranslations('Sort');
  const [typeFilter, setTypeFilter] = useState<'all' | 'category' | 'ai_model' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('count');

  const filteredTags = tags.filter((tag) => {
    if (typeFilter === 'all') {
      return true;
    }
    return tag.type === typeFilter;
  });

  const sortedTags = [...filteredTags].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.campaignCount - a.campaignCount;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'category':
        return 'Category';
      case 'ai_model':
        return 'AI Model';
      case 'general':
        return 'General';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'bg-blue-100 text-blue-800';
      case 'ai_model':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              typeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            All Tags
          </button>
          <button
            onClick={() => setTypeFilter('category')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              typeFilter === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            Categories
          </button>
          <button
            onClick={() => setTypeFilter('ai_model')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              typeFilter === 'ai_model'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            AI Models
          </button>
          <button
            onClick={() => setTypeFilter('general')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              typeFilter === 'general'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            type="button"
          >
            General
          </button>
        </div>

        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'name' | 'count')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="count">{t('mostPopular')}</option>
            <option value="name">{t('alphabetical')}</option>
          </select>
        </div>
      </div>

      {/* Tag List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTags.length === 0
          ? (
              <div className="col-span-full py-8 text-center text-gray-500">
                No tags found
              </div>
            )
          : (
              sortedTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => onTagClick?.(tag)}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
                  type="button"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{tag.name}</h3>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getTypeColor(tag.type)}`}
                      >
                        {getTypeLabel(tag.type)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {tag.campaignCount}
                      {' '}
                      {tag.campaignCount === 1 ? 'campaign' : 'campaigns'}
                    </p>
                  </div>
                  <svg
                    className="size-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))
            )}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-500">
        Showing
        {' '}
        {sortedTags.length}
        {' '}
        of
        {' '}
        {tags.length}
        {' '}
        tags
      </div>
    </div>
  );
}
