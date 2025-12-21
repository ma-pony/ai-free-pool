'use client';

import type { Campaign } from '@/types/Campaign';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PendingCampaignList } from '@/components/admin/PendingCampaignList';

export default function AdminPendingPage() {
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchPendingCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns?status=pending');
      const data = await response.json();

      if (data.success) {
        setPendingCampaigns(data.data);
      } else {
        setError('Failed to load pending campaigns');
      }
    } catch (err) {
      setError('Failed to load pending campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending campaigns
  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchPendingCampaigns();
  }, [fetchPendingCampaigns]);

  const handleApprove = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/approve`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list
        await fetchPendingCampaigns();
      } else {
        alert(result.error?.message || 'Failed to approve campaign');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to approve campaign');
    }
  };

  const handleReject = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/reject`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list
        await fetchPendingCampaigns();
      } else {
        alert(result.error?.message || 'Failed to reject campaign');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject campaign');
    }
  };

  const handleEditTranslation = async (
    campaignId: string,
    locale: 'zh' | 'en',
    title: string,
    description: string | null,
  ) => {
    try {
      // Get the current campaign
      const campaign = pendingCampaigns.find(c => c.id === campaignId);
      if (!campaign) {
        return;
      }

      // Update the translation
      const updatedTranslations = campaign.translations?.map(t =>
        t.locale === locale
          ? { ...t, title, description, isAiGenerated: false }
          : t,
      ) || [];

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: updatedTranslations,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the list
        await fetchPendingCampaigns();
      } else {
        alert(result.error?.message || 'Failed to update translation');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update translation');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading pending campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Campaigns</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve user-submitted campaigns (
          {pendingCampaigns.length}
          {' '}
          pending)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Pending Campaigns List */}
      {pendingCampaigns.length === 0
        ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <svg
                className="mx-auto size-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending campaigns</h3>
              <p className="mt-1 text-sm text-gray-500">
                All submissions have been reviewed.
              </p>
            </div>
          )
        : (
            <PendingCampaignList
              campaigns={pendingCampaigns}
              onApprove={handleApprove}
              onReject={handleReject}
              onEditTranslation={handleEditTranslation}
            />
          )}
    </div>
  );
}
