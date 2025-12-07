'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type RecentActivity = {
  id: string;
  type: 'campaign' | 'reaction' | 'comment' | 'bookmark';
  campaignTitle: string;
  campaignSlug: string;
  timestamp: string;
  details?: string;
};

type OverviewTabProps = {
  userId: string;
};

/**
 * Overview tab component showing user statistics and recent activity
 * Validates: Requirements 17.1, 17.2, 17.7
 */
export function OverviewTab({ userId }: OverviewTabProps) {
  const t = useTranslations('Profile');
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, [userId]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      // TODO: Implement API endpoint for recent activity
      // For now, show empty state
      setActivities([]);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'campaign':
        return (
          <svg className="size-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'reaction':
        return (
          <svg className="size-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="size-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'bookmark':
        return (
          <svg className="size-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'campaign':
        return t('activity_submitted_campaign');
      case 'reaction':
        return t('activity_reacted_to');
      case 'comment':
        return t('activity_commented_on');
      case 'bookmark':
        return t('activity_bookmarked');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('overview_title')}
        </h2>
        <p className="mt-2 text-gray-600">{t('overview_description')}</p>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          {t('recent_activity')}
        </h3>

        {loading
          ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            )
          : activities.length === 0
            ? (
                <p className="text-sm text-gray-500">
                  {t('recent_activity_empty')}
                </p>
              )
            : (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-1 shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {getActivityText(activity)}
                          {' '}
                          <Link
                            href={`/campaigns/${activity.campaignSlug}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {activity.campaignTitle}
                          </Link>
                        </p>
                        {activity.details && (
                          <p className="mt-1 text-xs text-gray-500">{activity.details}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg
                className="size-8 text-blue-500"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('campaigns_submitted')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {t('view_in_submitted_tab')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg
                className="size-8 text-yellow-500"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('campaigns_bookmarked')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {t('view_in_bookmarks_tab')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
