'use client';

import type { Platform } from '@/types/Platform';
import type { CreatePlatformInput } from '@/validations/PlatformValidation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PlatformForm } from '@/components/admin/PlatformForm';
import { PlatformList } from '@/components/admin/PlatformList';

export default function AdminPlatformsPage() {
  const t = useTranslations('Admin');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | undefined>();
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchPlatforms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platforms?status=all');
      const data = await response.json();

      if (data.success) {
        setPlatforms(data.data);
      } else {
        setError('Failed to load platforms');
      }
    } catch (err) {
      setError('Failed to load platforms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch platforms
  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleCreate = () => {
    setEditingPlatform(undefined);
    setShowForm(true);
  };

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreatePlatformInput) => {
    try {
      const url = editingPlatform
        ? `/api/platforms/${editingPlatform.id}`
        : '/api/platforms';

      const method = editingPlatform ? 'PUT' : 'POST';

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
        setEditingPlatform(undefined);
        await fetchPlatforms();
      } else {
        alert(result.error || 'Failed to save platform');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save platform');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/platforms/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchPlatforms();
      } else {
        alert(result.error || 'Failed to delete platform');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete platform');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlatform(undefined);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('platform_management')}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t('platform_management_desc')}
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              type="button"
            >
              {t('new_platform')}
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
                {editingPlatform ? t('edit_platform') : t('create_platform')}
              </h2>
              <PlatformForm
                platform={editingPlatform}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          )
        : (
            <PlatformList
              initialPlatforms={platforms}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
    </div>
  );
}
