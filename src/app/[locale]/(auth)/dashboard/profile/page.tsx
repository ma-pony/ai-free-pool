import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ProfileAchievements } from '@/components/profile/ProfileAchievements';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { getUserContributionStats } from '@/services/UserService';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Profile',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ProfilePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user contribution statistics
  const stats = await getUserContributionStats(user.id);

  const t = await getTranslations({
    locale,
    namespace: 'Profile',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Achievement Badge - 成就系统 */}
      <ProfileAchievements bookmarkCount={stats.totalBookmarks} />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('page_title')}</h1>
        <p className="mt-2 text-gray-600">{t('page_description')}</p>
      </div>

      {/* Profile Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar - User Info */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Avatar */}
            <div className="mb-4 flex justify-center">
              {user.imageUrl
                ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || user.username || 'User'}
                      className="size-24 rounded-full border-4 border-gray-100"
                    />
                  )
                : (
                    <div className="flex size-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-600">
                      {(user.fullName || user.username || 'U')[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
            </div>

            {/* User Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.fullName || user.username || 'User'}
              </h2>
              {user.username && (
                <p className="text-sm text-gray-500">
                  @
                  {user.username}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {t('member_since')}
                {' '}
                {new Date(user.createdAt).toLocaleDateString(locale)}
              </p>
            </div>

            {/* Contribution Statistics */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">
                {t('contribution_stats')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('submitted_campaigns')}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    {stats.submittedCampaigns}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('total_reactions')}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {stats.totalReactions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('total_comments')}
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                    {stats.totalComments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t('total_bookmarks')}
                  </span>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                    {stats.totalBookmarks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Tabs */}
        <div className="lg:col-span-3">
          <ProfileTabs userId={user.id} locale={locale} />
        </div>
      </div>
    </div>
  );
}
