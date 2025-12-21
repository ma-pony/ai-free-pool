'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type BookmarkWithCampaign = {
  id: string;
  userId: string;
  campaignId: string;
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

type BookmarksTabProps = {
  userId: string;
  locale: string;
};

/**
 * Bookmarks tab component
 * Validates: Requirements 7.5, 7.6
 */
export function BookmarksTab({ userId: _userId, locale }: BookmarksTabProps) {
  const t = useTranslations('Profile');
  const [bookmarks, setBookmarks] = useState<BookmarkWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent duplicate fetches in Strict Mode
  const fetchedRef = useRef(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bookmarks');
      const data = await response.json();

      if (data.success) {
        setBookmarks(data.data);
      } else {
        setError('Failed to load bookmarks');
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks');
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

    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemoveBookmark = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${campaignId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setBookmarks(prev => prev.filter(b => b.campaignId !== campaignId));
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const getCampaignTitle = (campaign: BookmarkWithCampaign['campaign']) => {
    const translation = campaign.translations.find(t => t.locale === locale);
    return translation?.title || campaign.translations[0]?.title || 'Untitled';
  };

  const isExpired = (campaign: BookmarkWithCampaign['campaign']) => {
    return (
      campaign.status === 'expired'
      || (campaign.endDate && new Date(campaign.endDate) < new Date())
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
          onClick={fetchBookmarks}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t('no_bookmarks')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('no_bookmarks_description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('bookmarks_title')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('bookmarks_count', { count: bookmarks.length })}
        </p>
      </div>

      <div className="space-y-4">
        {bookmarks.map((bookmark) => {
          const campaign = bookmark.campaign;
          const expired = isExpired(campaign);
          const title = getCampaignTitle(campaign);

          return (
            <div
              key={bookmark.id}
              className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
                expired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              }`}
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
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {campaign.platform?.name || campaign.pendingPlatform?.name || 'Unknown Platform'}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-3 flex items-center gap-2">
                    {/* Expired status badge (Requirement 7.6) */}
                    {expired && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        ⏰
                        {' '}
                        {t('expired')}
                      </span>
                    )}

                    {/* Featured badge */}
                    {campaign.isFeatured && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        ⭐
                        {' '}
                        {t('featured')}
                      </span>
                    )}

                    {/* End date */}
                    {campaign.endDate && !expired && (
                      <span className="text-xs text-gray-500">
                        {t('expires')}
                        :
                        {new Date(campaign.endDate).toLocaleDateString(locale)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove bookmark button */}
                <button
                  type="button"
                  onClick={() => handleRemoveBookmark(campaign.id)}
                  className="ml-4 rounded-full p-2 text-blue-600 hover:bg-blue-100"
                  aria-label={t('remove_bookmark')}
                  title={t('remove_bookmark')}
                >
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
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
