import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CampaignCard from '@/components/CampaignCard';
import { getCampaigns } from '@/services/CampaignService';
import { getTagBySlug } from '@/services/TagService';

/**
 * Category Page with Semantic URL
 * Validates: Requirements 15.6, 15.7, 15.8
 *
 * Displays campaigns filtered by category using semantic URLs
 * URL format: /category/{slug}
 */

// Enable ISR: revalidate every 60 seconds
export const revalidate = 60;

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag || tag.type !== 'category') {
    return {
      title: 'Category Not Found',
    };
  }

  const { generateMetadata: generateSeoMetadata } = await import('@/utils/SeoHelpers');

  return generateSeoMetadata({
    title: `${tag.name} - AI Free Campaigns`,
    description: `Discover free AI credits and campaigns in the ${tag.name} category. Find the best AI tools and services offering free tiers.`,
    keywords: [
      tag.name,
      'AI',
      'free credits',
      'free tier',
      'campaigns',
      'category',
    ],
    url: `/category/${tag.slug}`,
    type: 'website',
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag || tag.type !== 'category') {
    notFound();
  }

  // Fetch campaigns with this category tag
  const campaigns = await getCampaigns({
    status: 'published',
    categoryTags: [tag.slug],
    includeExpired: false,
    limit: 100,
  });

  // Generate JSON-LD structured data
  const { generateBreadcrumbJsonLd } = await import('@/utils/SeoHelpers');
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/tags' },
    { name: tag.name, url: `/category/${tag.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="transition-colors hover:text-blue-600">
              Home
            </a>
            <span>/</span>
            <a href="/tags" className="transition-colors hover:text-blue-600">
              Categories
            </a>
            <span>/</span>
            <span className="font-medium text-gray-900">{tag.name}</span>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900">{tag.name}</h1>
          <p className="mt-2 text-lg text-gray-600">
            Discover free AI campaigns in the
            {' '}
            {tag.name}
            {' '}
            category
          </p>

          {/* Statistics */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <span>{campaigns.length}</span>
            <span>{campaigns.length === 1 ? 'Campaign' : 'Campaigns'}</span>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {campaigns.length > 0
          ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map(campaign => (
                  <Suspense key={campaign.id} fallback={<CampaignCardSkeleton />}>
                    <CampaignCard campaign={campaign} locale={locale} showPlatform />
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No campaigns found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  There are no active campaigns in this category yet.
                </p>
                <a
                  href="/campaigns"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Browse All Campaigns
                </a>
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
