'use client';

import type { Campaign } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import CampaignSelector from './CampaignSelector';

type CampaignWithStats = Campaign & {
  stats: {
    impressions: number;
    clicks: number;
    clickThroughRate: number;
  };
};

export default function FeaturedCampaignList() {
  const t = useTranslations('Admin');
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetFeaturedModal, setShowSetFeaturedModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [featuredUntil, setFeaturedUntil] = useState('');
  const fetchedRef = useRef(false);

  const fetchFeaturedCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/featured');

      // Check if response is HTML (redirect to login)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        throw new Error('Authentication required. Please refresh the page and sign in.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch featured campaigns' }));
        throw new Error(errorData.error || 'Failed to fetch featured campaigns');
      }

      const data = await response.json();
      setCampaigns(data.data || []);
    } catch (err) {
      console.error('Error fetching featured campaigns:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchFeaturedCampaigns();
  }, [fetchFeaturedCampaigns]);

  const handleRemoveFeatured = async (campaignId: string) => {
    if (!confirm(t('confirm_remove_featured'))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/featured?campaignId=${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove featured status');
      }

      await fetchFeaturedCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSetFeatured = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaignId || !featuredUntil) {
      return;
    }

    try {
      const response = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          featuredUntil,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set featured campaign');
      }

      setShowSetFeaturedModal(false);
      setSelectedCampaignId(null);
      setFeaturedUntil('');
      await fetchFeaturedCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleExpireFeatured = async () => {
    if (!confirm(t('confirm_expire_featured'))) {
      return;
    }

    try {
      const response = await fetch('/api/admin/featured', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to expire featured campaigns');
      }

      const data = await response.json();
      alert(`${data.data.expiredCount} campaigns expired`);
      await fetchFeaturedCampaigns();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setShowSetFeaturedModal(true)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
        >
          {t('set_featured_campaign')}
        </button>
        <button
          type="button"
          onClick={handleExpireFeatured}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          {t('expire_featured_campaigns')}
        </button>
      </div>

      {/* Featured Campaigns List */}
      {campaigns.length === 0
        ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              {t('no_featured_campaigns')}
            </div>
          )
        : (
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {campaign.platform?.logo && (
                          <img
                            src={campaign.platform.logo}
                            alt={campaign.platform.name}
                            className="size-12 rounded object-contain"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">
                            {campaign.translations?.[0]?.title || 'Untitled'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {campaign.platform?.name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm text-gray-600">{t('featured_until')}</p>
                          <p className="font-medium">
                            {campaign.featuredUntil
                              ? new Date(campaign.featuredUntil).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('impressions')}</p>
                          <p className="font-medium">{campaign.stats.impressions}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('clicks')}</p>
                          <p className="font-medium">{campaign.stats.clicks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('ctr')}</p>
                          <p className="font-medium">
                            {campaign.stats.clickThroughRate.toFixed(2)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFeatured(campaign.id)}
                      className="ml-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      {t('remove_featured')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* Set Featured Modal */}
      {showSetFeaturedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{t('set_featured_campaign')}</h2>
            <form onSubmit={handleSetFeatured} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('select_campaign')}
                </label>
                <CampaignSelector
                  value={selectedCampaignId}
                  onChange={(campaignId) => {
                    setSelectedCampaignId(campaignId);
                  }}
                  placeholder={t('search_and_select_campaign')}
                />
              </div>
              <div>
                <label htmlFor="featuredUntil" className="block text-sm font-medium text-gray-700">
                  {t('featured_until')}
                </label>
                <input
                  type="datetime-local"
                  id="featuredUntil"
                  value={featuredUntil}
                  onChange={e => setFeaturedUntil(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
                >
                  {t('set_featured')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSetFeaturedModal(false);
                    setSelectedCampaignId(null);
                    setFeaturedUntil('');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
