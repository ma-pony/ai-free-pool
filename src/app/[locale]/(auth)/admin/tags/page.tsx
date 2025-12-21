'use client';

import type { Tag } from '@/types/Campaign';
import type { CreateTagInput } from '@/validations/CampaignValidation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TagForm } from '@/components/admin/TagForm';
import { TagList } from '@/components/admin/TagList';

type TagWithCount = Tag & { campaignCount?: number };

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>();
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags?withCounts=true');
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

  // Fetch tags
  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchTags();
  }, [fetchTags]);

  const handleCreate = () => {
    setEditingTag(undefined);
    setShowForm(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreateTagInput) => {
    try {
      const url = editingTag ? `/api/tags/${editingTag.id}` : '/api/tags';

      const method = editingTag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingTag(undefined);
        await fetchTags();
      } else {
        alert(result.error || 'Failed to save tag');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save tag');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchTags();
      } else {
        alert(result.error || 'Failed to delete tag');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete tag');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTag(undefined);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tag Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage campaign tags for categorization and filtering
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              type="button"
            >
              + New Tag
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form or List */}
      {showForm
        ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h2>
              <TagForm tag={editingTag} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          )
        : (
            <TagList initialTags={tags} onEdit={handleEdit} onDelete={handleDelete} />
          )}
    </div>
  );
}
