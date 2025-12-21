'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type SubmittedCampaign = {
  id: string;
  slug: string;
  status: 'pending' | 'published' | 'rejected' | 'expired';
  createdAt: string;
  platform: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  pendingPlatform?: {
    name: string;
    slug: string;
    website?: string;
    description?: string;
  } | null;
  translations: Array<{
    locale: string;
    title: string;
    description: string | null;
  }>;
};

type SubmittedTabProps = {
  userId: string;
  locale: string;
};

/**
 * Submitted campaigns tab component
 * Validates: Requirements 17.5, 4.7
 */
export function SubmittedTab({ userId, locale }: SubmittedTabProps) {
  const t = useTranslations('Profile');
  const [campaigns, setCampaigns] = useState<SubmittedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent duplicate fetches in Strict Mode
  const fetchedRef = useRef(false);

  const fetchSubmittedCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaigns submitted by the current user (Requirement 4.7)
      const response = await fetch(`/api/campaigns?submittedBy=${userId}&includeExpired=true`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
      } else {
        setError('Failed to load submitted campaigns');
      }
    } catch (err) {
      console.error('Error fetching submitted campaigns:', err);
      setError('Failed to load submitted campaigns');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Prevent duplicate fetch in Strict Mode
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;

    fetchSubmittedCampaigns();
  }, [fetchSubmittedCampaigns]);

  const getCampaignTitle = (campaign: SubmittedCampaign) => {
    const translation = campaign.translations.find(t => t.locale === locale);
    return translation?.title || campaign.translations[0]?.title || 'Untitled';
  };

  const getStatusBadge = (status: SubmittedCampaign['status']) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳',
        label: t('status_pending'),
      },
      published: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
        label: t('status_published'),
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌',
        label: t('status_rejected'),
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: '⏰',
        label: t('status_expired'),
      },
    };

    const badge = badges[status];
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.icon}
        {' '}
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchSubmittedCampaigns}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto size-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t('no_submissions')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('no_submissions_description')}
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/submit-campaign"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('submit_campaign')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('submitted_title')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('submitted_count', { count: campaigns.length })}
        </p>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const title = getCampaignTitle(campaign);

          return (
            <div
              key={campaign.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/campaigns/${campaign.slug}`}
                    className="group"
                  >
                    <div className="flex items-center gap-3">
                      {campaign.platform?.logo && (
                        <img
                          src={campaign.platform.logo}
                          alt={campaign.platform.name}
                          className="size-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                            {title}
                          </h3>
                          {getStatusBadge(campaign.status)}
                          {campaign.pendingPlatform && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              🆕 New Platform
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {campaign.platform?.name || campaign.pendingPlatform?.name || 'Unknown Platform'}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <p className="mt-2 text-xs text-gray-400">
                    {t('submitted_on')}
                    {' '}
                    {new Date(campaign.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('view_details')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
