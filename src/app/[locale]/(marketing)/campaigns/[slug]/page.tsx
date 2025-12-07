import type { Campaign } from '@/types/Campaign';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookmarkButton } from '@/components/BookmarkButton';
import { CommentSection } from '@/components/comments/CommentSection';
import CountdownTimer from '@/components/CountdownTimer';
import PopularityIndicator from '@/components/PopularityIndicator';
import { ReactionButtons } from '@/components/ReactionButtons';
import { ShareButton } from '@/components/ShareButton';
import { getCampaignBySlug, getCampaigns } from '@/services/CampaignService';
import { getUserDisplayName } from '@/services/UserService';

type CampaignDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Campaign Detail Page - Server-Side Rendering (SSR)
 * Validates: Requirements 2.1-2.12, 19.6
 *
 * Uses SSR (Server-Side Rendering) to:
 * - Fetch fresh data on every request for real-time accuracy
 * - Display up-to-date reactions and comments
 * - Ensure users always see the latest campaign status
 *
 * Displays complete campaign information including:
 * - Campaign header with platform info
 * - Key information card with all details
 * - Full description
 * - CTA button to official link
 * - Reaction buttons (task 18.2)
 * - Comment section (task 18.3)
 * - Related campaigns (task 18.4)
 */
export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations('CampaignDetail');

  // Fetch campaign data
  const campaign = await getCampaignBySlug(slug);

  if (!campaign || campaign.status !== 'published') {
    notFound();
  }

  // Get translation for current locale, fallback to first available
  const translation = campaign.translations?.find(tr => tr.locale === locale)
    || campaign.translations?.[0];

  if (!translation) {
    notFound();
  }

  // Calculate expiration status
  const isExpired = campaign.endDate && new Date(campaign.endDate) < new Date();
  const isExpiringSoon = campaign.endDate
    && new Date(campaign.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Fetch related campaigns (same platform)
  const samePlatformCampaigns = await getCampaigns({
    platformId: campaign.platformId,
    status: 'published',
    limit: 6,
  });

  // Filter out current campaign
  const filteredSamePlatform = samePlatformCampaigns.filter(c => c.id !== campaign.id);

  // Fetch campaigns from same category if available
  let sameCategoryCampaigns: Campaign[] = [];
  if (campaign.tags && campaign.tags.length > 0) {
    const categoryTags = campaign.tags.filter(t => t.type === 'category');
    if (categoryTags.length > 0) {
      sameCategoryCampaigns = await getCampaigns({
        categoryTags: categoryTags.map(t => t.slug),
        status: 'published',
        limit: 6,
      });
      // Filter out current campaign and campaigns already in same platform list
      sameCategoryCampaigns = sameCategoryCampaigns.filter(
        c => c.id !== campaign.id && !filteredSamePlatform.some(p => p.id === c.id),
      );
    }
  }

  // Combine and limit to 3 total related campaigns
  const relatedCampaigns = [
    ...filteredSamePlatform.slice(0, 2),
    ...sameCategoryCampaigns.slice(0, 1),
  ].slice(0, 3);

  // Get submitter display name
  let submitterName: string | null = null;
  if (campaign.submittedBy) {
    submitterName = await getUserDisplayName(campaign.submittedBy);
  }

  // Generate JSON-LD structured data
  const {
    generateCampaignJsonLd,
    generateBreadcrumbJsonLd,
  } = await import('@/utils/SeoHelpers');

  const campaignJsonLd = generateCampaignJsonLd(campaign, locale);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: t('home'), url: '/' },
    { name: t('campaigns'), url: '/campaigns' },
    { name: translation.title, url: `/campaigns/${campaign.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      {campaignJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="transition-colors hover:text-blue-600">
              {t('home')}
            </Link>
            <span>/</span>
            <Link href="/campaigns" className="transition-colors hover:text-blue-600">
              {t('campaigns')}
            </Link>
            <span>/</span>
            <span className="line-clamp-1 font-medium text-gray-900">
              {translation.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Campaign Header */}
            <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
              {/* Platform Info */}
              {campaign.platform && (
                <div className="mb-6 flex items-center gap-4">
                  {campaign.platform.logo && (
                    <div className="relative size-16 overflow-hidden rounded-xl bg-gray-100 shadow-sm md:size-20">
                      <Image
                        src={campaign.platform.logo}
                        alt={campaign.platform.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 64px, 80px"
                        priority
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/platforms/${campaign.platform.slug}`}
                      className="text-lg font-semibold text-gray-700 transition-colors hover:text-blue-600 md:text-xl"
                    >
                      {campaign.platform.name}
                    </Link>
                    {campaign.platform.website && (
                      <a
                        href={campaign.platform.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-600"
                      >
                        <span>🌐</span>
                        <span>{new URL(campaign.platform.website).hostname}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Campaign Title */}
              <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                {translation.title}
              </h1>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <BookmarkButton campaignId={campaign.id} compact={false} />
                <ShareButton
                  title={translation.title}
                  description={translation.description || ''}
                  shareLabel={t('share')}
                />
              </div>
            </div>

            {/* Description */}
            {translation.description && (
              <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  {t('description')}
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                    {translation.description}
                  </p>
                </div>
                {translation.isAiGenerated && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <span>✨</span>
                    <span>{t('aiTranslated')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Reaction Buttons - Task 18.2 */}
            <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {t('isThisStillValid')}
              </h2>
              <ReactionButtons campaignId={campaign.id} />
            </div>

            {/* Comment Section - Task 18.3 */}
            <div className="rounded-xl bg-white p-6 shadow-md md:p-8">
              <CommentSection campaignId={campaign.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Countdown Timer - 紧迫感设计 */}
            {campaign.endDate && !isExpired && (
              <CountdownTimer endDate={new Date(campaign.endDate)} />
            )}

            {/* Popularity Indicator - 热度指示器 */}
            <PopularityIndicator
              viewCount={(campaign as any).viewCount || 0}
              bookmarkCount={(campaign as any).bookmarkCount || 0}
              reactionCount={(campaign as any).reactionCount || 0}
              compact={false}
            />

            {/* Key Information Card */}
            <div className="sticky top-4 rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {t('keyInformation')}
              </h2>

              <div className="space-y-4">
                {/* Free Credit */}
                {campaign.freeCredit && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div className="flex-1">
                      <div className="mb-1 text-sm text-gray-600">{t('freeCredit')}</div>
                      <div className="text-lg font-semibold text-green-600">
                        {campaign.freeCredit}
                      </div>
                    </div>
                  </div>
                )}

                {/* Valid Until */}
                {campaign.endDate && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏰</span>
                    <div className="flex-1">
                      <div className="mb-1 text-sm text-gray-600">{t('validUntil')}</div>
                      <div className={`text-lg font-semibold ${
                        isExpired
                          ? 'text-red-600'
                          : isExpiringSoon
                            ? 'text-orange-600'
                            : 'text-blue-600'
                      }`}
                      >
                        {formatDate(campaign.endDate)}
                        {isExpired && (
                          <span className="ml-2 text-sm">
                            (
                            {t('expired')}
                            )
                          </span>
                        )}
                        {isExpiringSoon && !isExpired && (
                          <span className="ml-2 text-sm">
                            (
                            {t('expiringSoon')}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Difficulty */}
                {campaign.difficultyLevel && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div className="flex-1">
                      <div className="mb-1 text-sm text-gray-600">{t('difficulty')}</div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                          campaign.difficultyLevel === 'easy'
                            ? 'bg-green-100 text-green-800'
                            : campaign.difficultyLevel === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                        >
                          <span>
                            {campaign.difficultyLevel === 'easy' ? '😊' : campaign.difficultyLevel === 'medium' ? '😐' : '😰'}
                          </span>
                          <span className="capitalize">{t(campaign.difficultyLevel)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Condition Tags */}
                {campaign.conditionTags && campaign.conditionTags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🏷️</span>
                    <div className="flex-1">
                      <div className="mb-2 text-sm text-gray-600">{t('conditions')}</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.conditionTags.map(ct => (
                          <span
                            key={ct.id}
                            className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                          >
                            {ct.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Models */}
                {campaign.aiModels && campaign.aiModels.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div className="flex-1">
                      <div className="mb-2 text-sm text-gray-600">{t('aiModels')}</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.aiModels.map((model, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Usage Limits */}
                {campaign.usageLimits && (
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <div className="mb-1 text-sm text-gray-600">{t('usageLimits')}</div>
                      <div className="text-sm text-gray-700">
                        {campaign.usageLimits}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <a
                href={campaign.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full transform items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
              >
                <span className="text-xl">🚀</span>
                <span>{t('getStarted')}</span>
              </a>

              {/* Submitted By */}
              {submitterName && (
                <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600">
                  <span>
                    {t('submittedBy')}
                    :
                    {' '}
                  </span>
                  <span className="font-medium text-gray-900">
                    {submitterName}
                  </span>
                </div>
              )}
            </div>

            {/* Related Campaigns - Task 18.4 */}
            {relatedCampaigns.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  {t('relatedCampaigns')}
                </h2>
                <div className="space-y-4">
                  {relatedCampaigns.map(relatedCampaign => (
                    <div key={relatedCampaign.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <Link
                        href={`/campaigns/${relatedCampaign.slug}`}
                        className="group block"
                      >
                        {/* Platform badge if different from current */}
                        {relatedCampaign.platformId !== campaign.platformId && relatedCampaign.platform && (
                          <div className="mb-2 flex items-center gap-2">
                            {relatedCampaign.platform.logo && (
                              <div className="relative size-5 overflow-hidden rounded">
                                <Image
                                  src={relatedCampaign.platform.logo}
                                  alt={relatedCampaign.platform.name}
                                  fill
                                  className="object-contain"
                                  sizes="20px"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {relatedCampaign.platform.name}
                            </span>
                          </div>
                        )}
                        <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                          {relatedCampaign.translations?.find(t => t.locale === locale)?.title
                            || relatedCampaign.translations?.[0]?.title}
                        </h3>
                        {relatedCampaign.freeCredit && (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                            <span>💰</span>
                            <span>{relatedCampaign.freeCredit}</span>
                          </div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
                {filteredSamePlatform.length > 0 && (
                  <Link
                    href={`/platforms/${campaign.platform?.slug}`}
                    className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {t('viewAllFromPlatform')}
                    {' '}
                    →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
// Validates: Requirements 15.1, 15.2, 15.3
export async function generateMetadata({ params }: CampaignDetailPageProps) {
  const { locale, slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    return {
      title: 'Campaign Not Found',
    };
  }

  const { generateCampaignMetadata } = await import('@/utils/SeoHelpers');
  return generateCampaignMetadata(campaign, locale);
}
