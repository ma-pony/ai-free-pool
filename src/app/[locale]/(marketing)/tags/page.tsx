'use client';

import type { Tag } from '@/types/Campaign';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TagCloud } from '@/components/TagCloud';
import { TagListView } from '@/components/TagListView';

type TagWithCount = Tag & { campaignCount: number };

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud');
  const fetchedRef = useRef(false);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags?withCounts=true&hasActiveCampaigns=true');
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
      } else {
        setError('Failed to load tags');
      }
    } catch (err) {
      setError('Failed to load tags');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchTags();
  }, [fetchTags]);

  const handleTagClick = (tag: Tag) => {
    // Navigate to campaigns page with tag filter
    router.push(`/campaigns?tag=${tag.slug}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading tags...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Tags</h1>
        <p className="mt-2 text-gray-600">
          Explore campaigns by categories, AI models, and other tags
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => setViewMode('cloud')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'cloud'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          type="button"
        >
          Cloud View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          type="button"
        >
          List View
        </button>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {viewMode === 'cloud'
          ? (
              <TagCloud tags={tags} onTagClick={handleTagClick} />
            )
          : (
              <TagListView tags={tags} onTagClick={handleTagClick} />
            )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{tags.length}</div>
          <div className="text-sm text-gray-600">Total Tags</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">
            {tags.filter(t => t.type === 'category').length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">
            {tags.filter(t => t.type === 'ai_model').length}
          </div>
          <div className="text-sm text-gray-600">AI Models</div>
        </div>
      </div>
    </div>
  );
}
