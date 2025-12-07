import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CampaignCard from '@/components/CampaignCard';
import { getCampaigns } from '@/services/CampaignService';
import { getPlatformBySlug } from '@/services/PlatformService';

// Enable ISR: revalidate every 60 seconds
export const revalidate = 60;

type PlatformPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PlatformPageProps) {
  const { locale, slug } = await params;
  const platform = await getPlatformBySlug(slug);

  if (!platform) {
    return {
      title: 'Platform Not Found',
    };
  }

  const { generatePlatformMetadata } = await import('@/utils/SeoHelpers');
  return generatePlatformMetadata(platform, locale);
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { locale, slug } = await params;
  const platform = await getPlatformBySlug(slug);

  if (!platform) {
    notFound();
  }

  // Fetch campaigns for this platform
  const [activeCampaigns, expiredCampaigns] = await Promise.all([
    getCampaigns({
      platformId: platform.id,
      status: 'published',
      includeExpired: false,
    }),
    getCampaigns({
      platformId: platform.id,
      status: 'expired',
      includeExpired: true,
    }),
  ]);

  const t = await getTranslations({ locale, namespace: 'Platform' });

  // Generate JSON-LD structured data
  const { generatePlatformJsonLd } = await import('@/utils/SeoHelpers');
  const platformJsonLd = generatePlatformJsonLd(platform);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(platformJsonLd) }}
      />

      {/* Platform Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            {/* Platform Logo */}
            {platform.logo && (
              <div className="shrink-0">
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-contain"
                />
              </div>
            )}

            {/* Platform Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{platform.name}</h1>
              {platform.description && (
                <p className="mt-2 text-lg text-gray-600">{platform.description}</p>
              )}

              {/* Social Links */}
              <div className="mt-4 flex flex-wrap gap-4">
                {platform.website && (
                  <a
                    href={platform.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {t('website')}
                  </a>
                )}
                {platform.socialLinks?.twitter && (
                  <a
                    href={platform.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter
                  </a>
                )}
                {platform.socialLinks?.github && (
                  <a
                    href={platform.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub
                  </a>
                )}
                {platform.socialLinks?.discord && (
                  <a
                    href={platform.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Discord
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="text-2xl font-bold text-blue-900">{activeCampaigns.length}</div>
              <div className="text-sm text-blue-700">{t('activeCampaigns')}</div>
            </div>
            <div className="rounded-lg bg-gray-100 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {activeCampaigns.length + expiredCampaigns.length}
              </div>
              <div className="text-sm text-gray-700">{t('totalCampaigns')}</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <div className="text-2xl font-bold text-green-900">
                {/* This will be calculated from reactions when available */}
                -
              </div>
              <div className="text-sm text-green-700">{t('userReactions')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">{t('activeCampaigns')}</h2>

        {activeCampaigns.length > 0
          ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeCampaigns.map(campaign => (
                  <Suspense key={campaign.id} fallback={<CampaignCardSkeleton />}>
                    <CampaignCard campaign={campaign} locale={locale} showPlatform={false} />
                  </Suspense>
                ))}
              </div>
            )
          : (
              <div className="rounded-lg bg-white p-12 text-center shadow">
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noActiveCampaigns')}</h3>
                <p className="mt-2 text-sm text-gray-500">{t('noActiveCampaignsDescription')}</p>
              </div>
            )}

        {/* Expired Campaigns (Collapsed) */}
        {expiredCampaigns.length > 0 && (
          <div className="mt-12">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('expiredCampaigns')}
                  {' '}
                  (
                  {expiredCampaigns.length}
                  )
                </h2>
                <svg
                  className="size-6 text-gray-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {expiredCampaigns.map(campaign => (
                  <Suspense key={campaign.id} fallback={<CampaignCardSkeleton />}>
                    <CampaignCard campaign={campaign} locale={locale} showPlatform={false} />
                  </Suspense>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-lg bg-white p-6 shadow">
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      <div className="mt-4 h-3 w-full rounded bg-gray-200"></div>
      <div className="mt-2 h-3 w-5/6 rounded bg-gray-200"></div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded bg-gray-200"></div>
        <div className="h-6 w-16 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
