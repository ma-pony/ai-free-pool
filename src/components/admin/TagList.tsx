'use client';

import type { Tag } from '@/types/Campaign';
import { useState } from 'react';

type TagWithCount = Tag & { campaignCount?: number };

type TagListProps = {
  initialTags: TagWithCount[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
};

export function TagList({ initialTags, onEdit, onDelete }: TagListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'category' | 'ai_model' | 'general'>('all');

  const filteredTags = initialTags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      || tag.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tag.type === typeFilter;
    return matchesSearch && matchesType;
  });

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={typeFilter}
          onChange={e =>
            setTypeFilter(e.target.value as 'all' | 'category' | 'ai_model' | 'general')}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="category">Category</option>
          <option value="ai_model">AI Model</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Tag List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Tag Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Campaigns
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTags.length === 0
              ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No tags found
                    </td>
                  </tr>
                )
              : (
                  filteredTags.map(tag => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{tag.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTypeColor(tag.type)}`}
                        >
                          {getTypeLabel(tag.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-gray-600">{tag.slug}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tag.campaignCount !== undefined
                          ? (
                              <span className="font-medium">{tag.campaignCount}</span>
                            )
                          : (
                              <span className="text-gray-400">-</span>
                            )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => onEdit(tag)}
                          className="mr-3 text-blue-600 hover:text-blue-900"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${tag.name}"?`)) {
                              onDelete(tag.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing
        {' '}
        {filteredTags.length}
        {' '}
        of
        {' '}
        {initialTags.length}
        {' '}
        tags
      </div>
    </div>
  );
}
