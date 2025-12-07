'use client';

import type { Campaign } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { trackFeaturedClick, trackFeaturedImpression } from '@/libs/Analytics';

type FeaturedCarouselProps = {
  locale: string;
};

export default function FeaturedCarousel({ locale }: FeaturedCarouselProps) {
  const t = useTranslations('Index');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Generate sessionId only on client side to avoid hydration mismatch
  useEffect(() => {
    setSessionId(`session-${Date.now()}-${Math.random()}`);
  }, []);

  useEffect(() => {
    fetchFeaturedCampaigns();
  }, []);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (campaigns.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % campaigns.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [campaigns.length]);

  // Track impressions when campaigns are displayed
  useEffect(() => {
    if (campaigns.length > 0 && campaigns[currentIndex]) {
      trackImpression(campaigns[currentIndex].id);
      // Also track analytics impression
      trackFeaturedImpression(campaigns[currentIndex].id, currentIndex);
    }
  }, [currentIndex, campaigns]);

  const fetchFeaturedCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns?isFeatured=true&limit=5');

      if (!response.ok) {
        throw new Error('Failed to fetch featured campaigns');
      }

      const data = await response.json();
      setCampaigns(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (campaignId: string) => {
    try {
      await fetch('/api/featured/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          type: 'impression',
          sessionId,
        }),
      });
    } catch (err) {
      console.error('Failed to track impression:', err);
    }
  };

  const trackClick = async (campaignId: string) => {
    try {
      await fetch('/api/featured/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          type: 'click',
          sessionId,
        }),
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  };

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + campaigns.length) % campaigns.length);
  }, [campaigns.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % campaigns.length);
  }, [campaigns.length]);

  const handleCampaignClick = (campaign: Campaign) => {
    trackClick(campaign.id);
    // Track analytics click
    trackFeaturedClick(campaign.id, currentIndex);
    window.location.href = `/campaigns/${campaign.slug}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || campaigns.length === 0) {
    return null; // Don't show carousel if there are no featured campaigns
  }

  const currentCampaign = campaigns[currentIndex];

  if (!currentCampaign) {
    return null;
  }

  const translation = currentCampaign.translations?.find(t => t.locale === locale)
    || currentCampaign.translations?.[0];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
      {/* Featured Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md">
        <span>⭐</span>
        <span>{t('featured')}</span>
      </div>

      {/* Campaign Content */}
      <div className="relative p-8 md:p-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* Platform Logo */}
            {currentCampaign.platform?.logo && (
              <div className="shrink-0">
                <div className="relative size-20 overflow-hidden rounded-lg bg-white shadow-md md:size-24">
                  <Image
                    src={currentCampaign.platform.logo}
                    alt={currentCampaign.platform.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 80px, 96px"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Campaign Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="mb-2 text-sm font-medium text-orange-600">
                {currentCampaign.platform?.name}
              </p>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                {translation?.title || 'Untitled Campaign'}
              </h3>
              {translation?.description && (
                <p className="mb-4 line-clamp-2 text-gray-700">
                  {translation.description}
                </p>
              )}

              {/* Campaign Details */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                {currentCampaign.freeCredit && (
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                    <span className="text-lg">💰</span>
                    <span className="font-semibold text-gray-900">
                      {currentCampaign.freeCredit}
                    </span>
                  </div>
                )}
                {currentCampaign.endDate && (
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                    <span className="text-lg">⏰</span>
                    <span className="text-sm text-gray-700">
                      {t('expires')}
                      :
                      {new Date(currentCampaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={() => handleCampaignClick(currentCampaign)}
                className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
              >
                {t('view_details')}
                {' '}
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {campaigns.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:scale-110 hover:bg-white"
            aria-label="Previous campaign"
          >
            <svg
              className="size-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:scale-110 hover:bg-white"
            aria-label="Next campaign"
          >
            <svg
              className="size-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {campaigns.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {campaigns.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`size-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-orange-500'
                  : 'bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to campaign ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
