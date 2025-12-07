'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DashboardStats = {
  totalCampaigns: number;
  totalUsers: number;
  totalComments: number;
  pendingCampaigns: number;
  verificationNeeded: number;
  totalReactions: number;
  todayCampaigns: number;
  todayUsers: number;
  todayComments: number;
  todayReactions: number;
};

type RecentActivity = {
  id: string;
  type: 'submission' | 'verification' | 'approval';
  message: string;
  timestamp: string;
  actionUrl?: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setRecentActivity(data.data.recentActivity || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of platform statistics and recent activity
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Campaigns */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="size-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Campaigns</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.totalCampaigns || 0}</div>
                    {stats && stats.todayCampaigns > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +
                        {stats.todayCampaigns}
                        {' '}
                        today
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</div>
                    {stats && stats.todayUsers > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +
                        {stats.todayUsers}
                        {' '}
                        today
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="size-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Comments</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.totalComments || 0}</div>
                    {stats && stats.todayComments > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +
                        {stats.todayComments}
                        {' '}
                        today
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="size-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Pending</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.pendingCampaigns || 0}</div>
                    {stats && stats.pendingCampaigns > 0 && (
                      <Link
                        href="/admin/pending"
                        className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Review
                      </Link>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Needed */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="size-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Verify</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.verificationNeeded || 0}</div>
                    {stats && stats.verificationNeeded > 0 && (
                      <Link
                        href="/admin/verification-needed"
                        className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Check
                      </Link>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Reactions */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="size-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Reactions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats?.totalReactions || 0}</div>
                    {stats && stats.todayReactions > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +
                        {stats.todayReactions}
                        {' '}
                        today
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/campaigns"
              className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Campaign
            </Link>
            <Link
              href="/admin/platforms"
              className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              New Platform
            </Link>
            <Link
              href="/admin/import"
              className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="size-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Bulk Import
            </Link>
            <Link
              href="/admin/featured"
              className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg className="size-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Set Featured
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          {recentActivity.length === 0
            ? (
                <p className="mt-4 text-sm text-gray-500">No recent activity</p>
              )
            : (
                <div className="mt-4 flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {recentActivity.map(activity => (
                      <li key={activity.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="shrink-0">
                            {activity.type === 'submission' && (
                              <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                                <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'verification' && (
                              <div className="flex size-8 items-center justify-center rounded-full bg-yellow-100">
                                <svg className="size-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                            )}
                            {activity.type === 'approval' && (
                              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                                <svg className="size-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-sm text-gray-500">{activity.timestamp}</p>
                          </div>
                          {activity.actionUrl && (
                            <div>
                              <Link
                                href={activity.actionUrl}
                                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                              >
                                View
                              </Link>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
