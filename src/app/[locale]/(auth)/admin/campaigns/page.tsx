'use client';

import type { Campaign } from '@/types/Campaign';
import type { CreateCampaignInput } from '@/validations/CampaignValidation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CampaignForm } from '@/components/admin/CampaignForm';
import { CampaignList } from '@/components/admin/CampaignList';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns?includeDeleted=false');
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
      } else {
        setError('Failed to load campaigns');
      }
    } catch (err) {
      setError('Failed to load campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch campaigns
  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreate = () => {
    setEditingCampaign(undefined);
    setShowForm(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreateCampaignInput) => {
    try {
      const url = editingCampaign
        ? `/api/campaigns/${editingCampaign.id}`
        : '/api/campaigns';

      const method = editingCampaign ? 'PUT' : 'POST';

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
        setEditingCampaign(undefined);
        await fetchCampaigns();
      } else {
        alert(result.error || 'Failed to save campaign');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save campaign');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchCampaigns();
      } else {
        alert(result.error || 'Failed to delete campaign');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete campaign');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCampaign(undefined);
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
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage AI free credit campaigns and activities
            </p>
          </div>
          {!showForm && (
            <button
              onClick={handleCreate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              type="button"
            >
              + New Campaign
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
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <CampaignForm
                campaign={editingCampaign}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          )
        : (
            <CampaignList
              initialCampaigns={campaigns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
    </div>
  );
}
