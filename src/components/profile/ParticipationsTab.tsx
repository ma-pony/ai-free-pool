'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type ParticipationWithCampaign = {
  id: string;
  userId: string;
  campaignId: string;
  participatedAt: string;
  notes: string | null;
  createdAt: string;
  campaign: {
    id: string;
    slug: string;
    status: string;
    endDate: string | null;
    isFeatured: boolean;
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
};

type ParticipationsTabProps = {
  userId: string;
  locale: string;
};

/**
 * Participations tab component
 * Shows campaigns the user has participated in
 */
export function ParticipationsTab({ userId: _userId, locale }: ParticipationsTabProps) {
  const t = useTranslations('Profile');
  const [participations, setParticipations] = useState<ParticipationWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent duplicate fetches in Strict Mode
  const fetchedRef = useRef(false);

  const fetchParticipations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/participations');
      const data = await response.json();

      if (data.success) {
        setParticipations(data.data);
      } else {
        setError('Failed to load participations');
      }
    } catch (err) {
      console.error('Error fetching participations:', err);
      setError('Failed to load participations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent duplicate fetch in Strict Mode
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;

    fetchParticipations();
  }, [fetchParticipations]);

  const handleRemoveParticipation = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/participations/${campaignId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setParticipations(prev => prev.filter(p => p.campaignId !== campaignId));
      }
    } catch (err) {
      console.error('Error removing participation:', err);
    }
  };

  const getCampaignTitle = (campaign: ParticipationWithCampaign['campaign']) => {
    const translation = campaign.translations.find(t => t.locale === locale);
    return translation?.title || campaign.translations[0]?.title || 'Untitled';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchParticipations}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (participations.length === 0) {
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t('no_participations')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('no_participations_description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('participations_title')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('participations_count', { count: participations.length })}
        </p>
      </div>

      <div className="space-y-4">
        {participations.map((participation) => {
          const campaign = participation.campaign;
          const title = getCampaignTitle(campaign);

          return (
            <div
              key={participation.id}
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
                        <h3 className="font-medium text-gray-900 group-hover:text-green-600">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {campaign.platform?.name || campaign.pendingPlatform?.name || 'Unknown Platform'}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-3 flex items-center gap-2">
                    {/* Participated date */}
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      ✓
                      {' '}
                      {t('participated_on')}
                      :
                      {' '}
                      {formatDate(participation.participatedAt)}
                    </span>

                    {/* Featured badge */}
                    {campaign.isFeatured && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        ⭐
                        {' '}
                        {t('featured')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove participation button */}
                <button
                  type="button"
                  onClick={() => handleRemoveParticipation(campaign.id)}
                  className="ml-4 rounded-full p-2 text-green-600 hover:bg-green-100"
                  aria-label={t('remove_participation')}
                  title={t('remove_participation')}
                >
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
