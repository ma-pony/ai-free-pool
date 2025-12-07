'use client';

import type { Campaign } from '@/types/Campaign';
import { useEffect, useState } from 'react';
import { VerificationNeededList } from '@/components/admin/VerificationNeededList';

export default function AdminVerificationNeededPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationNeeded();
  }, []);

  const fetchVerificationNeeded = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/verification-needed');
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
      } else {
        setError('Failed to load campaigns needing verification');
      }
    } catch (err) {
      setError('Failed to load campaigns needing verification');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/verify`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        await fetchVerificationNeeded();
      } else {
        alert(result.error?.message || 'Failed to verify campaign');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to verify campaign');
    }
  };

  const handleMarkExpired = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'expired',
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchVerificationNeeded();
      } else {
        alert(result.error?.message || 'Failed to mark campaign as expired');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to mark campaign as expired');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campaigns Needing Verification</h1>
        <p className="mt-1 text-sm text-gray-600">
          These campaigns have been flagged by users as expired or having incorrect information (
          {campaigns.length}
          {' '}
          campaigns)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Campaigns List */}
      {campaigns.length === 0
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns need verification</h3>
              <p className="mt-1 text-sm text-gray-500">
                All campaigns are verified and up to date.
              </p>
            </div>
          )
        : (
            <VerificationNeededList
              campaigns={campaigns}
              onVerify={handleVerify}
              onMarkExpired={handleMarkExpired}
            />
          )}
    </div>
  );
}
