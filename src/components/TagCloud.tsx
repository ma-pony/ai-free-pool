'use client';

import type { Tag } from '@/types/Campaign';

type TagWithCount = Tag & { campaignCount: number };

type TagCloudProps = {
  tags: TagWithCount[];
  onTagClick?: (tag: Tag) => void;
  maxTags?: number;
};

export function TagCloud({ tags, onTagClick, maxTags = 50 }: TagCloudProps) {
  // Sort by campaign count and limit
  const sortedTags = [...tags]
    .sort((a, b) => b.campaignCount - a.campaignCount)
    .slice(0, maxTags);

  // Calculate font sizes based on campaign count
  const maxCount = Math.max(...sortedTags.map(t => t.campaignCount), 1);
  const minCount = Math.min(...sortedTags.map(t => t.campaignCount), 1);

  const getFontSize = (count: number) => {
    if (maxCount === minCount) {
      return 'text-base';
    }

    const ratio = (count - minCount) / (maxCount - minCount);

    if (ratio > 0.8) {
      return 'text-2xl';
    }
    if (ratio > 0.6) {
      return 'text-xl';
    }
    if (ratio > 0.4) {
      return 'text-lg';
    }
    if (ratio > 0.2) {
      return 'text-base';
    }
    return 'text-sm';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'text-blue-600 hover:text-blue-800';
      case 'ai_model':
        return 'text-purple-600 hover:text-purple-800';
      case 'general':
        return 'text-gray-600 hover:text-gray-800';
      default:
        return 'text-gray-600 hover:text-gray-800';
    }
  };

  if (sortedTags.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No tags available
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {sortedTags.map(tag => (
        <button
          key={tag.id}
          onClick={() => onTagClick?.(tag)}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors ${getFontSize(tag.campaignCount)} ${getTypeColor(tag.type)} hover:bg-gray-100`}
          type="button"
        >
          <span>{tag.name}</span>
          <span className="text-xs text-gray-500">
            (
            {tag.campaignCount}
            )
          </span>
        </button>
      ))}
    </div>
  );
}
