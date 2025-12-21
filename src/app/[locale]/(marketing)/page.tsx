import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import CampaignCard from '@/components/CampaignCard';
import { CampaignListWrapper } from '@/components/CampaignListWrapper';
import CategoryLinks from '@/components/CategoryLinks';
import EmptyState from '@/components/EmptyState';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import HeroHotCampaigns from '@/components/HeroHotCampaigns';
import HeroStats from '@/components/HeroStats';
import SearchBox from '@/components/SearchBox';
import SocialMediaCTA from '@/components/SocialMediaCTA';
import { getCampaigns } from '@/services/CampaignService';
import { getStatistics } from '@/services/StatisticsService';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Homepage - Static Site Generation with ISR
 * Validates: Requirements 19.6
 *
 * Uses ISR (Incremental Static Regeneration) to:
 * - Generate static pages at build time for fast initial load
 * - Revalidate every 60 seconds to keep content fresh
 * - Serve cached pages for better performance
 */
export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  const { generateMetadata: generateSeoMetadata } = await import('@/utils/SeoHelpers');

  return generateSeoMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: [
      'AI',
      'free credits',
      'free tier',
      'OpenAI',
      'Claude',
      'Gemini',
      'AI tools',
      'free AI',
      'AI campaigns',
    ],
    url: '/',
    type: 'website',
  });
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  // Fetch recent campaigns (limit to 6 for better UX - 希克定律)
  const recentCampaigns = await getCampaigns({
    status: 'published',
    sortBy: 'latest',
    limit: 6,
  });

  // Fetch hot campaigns for Hero section
  const hotCampaigns = await getCampaigns({
    status: 'published',
    sortBy: 'popular',
    limit: 3,
  });

  // Fetch statistics
  let stats = { totalCampaigns: 0, activePlatforms: 0, communityContributions: 0 };
  try {
    stats = await getStatistics();
  } catch {
    // Use default values if statistics service fails
  }

  // Generate JSON-LD structured data
  const { generateWebsiteJsonLd } = await import('@/utils/SeoHelpers');
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <div className="space-y-12 md:space-y-16 lg:space-y-20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Hero Section - 双栏布局 */}
      <section
        className="relative overflow-hidden rounded-2xl px-6 py-12 text-white shadow-2xl md:px-12 md:py-16 lg:py-20"
        style={{ background: 'linear-gradient(to bottom right, #2563eb, #3730a3)' }}
      >
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* 左侧：核心信息 */}
            <div>
              <h1 className="mb-4 text-3xl leading-tight font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                {t('hero_title')}
              </h1>
              <p className="mb-8 text-base leading-relaxed text-white/90 md:text-lg lg:text-xl">
                {t('hero_subtitle')}
              </p>

              {/* Search Bar */}
              <div className="mb-6">
                <SearchBox variant="hero" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/campaigns"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-600 shadow-lg transition-all hover:scale-105 hover:shadow-2xl active:scale-100"
                >
                  <span>🎯</span>
                  <span>{t('hero_cta')}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/dashboard/submit-campaign"
                  className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/20 active:scale-95"
                >
                  <span>✨</span>
                  <span>{t('hero_submit') || '提交活动'}</span>
                </Link>
              </div>
            </div>

            {/* 右侧：统计 + 热门活动 */}
            <div className="hidden lg:block">
              <HeroStats
                totalCampaigns={stats.totalCampaigns}
                activePlatforms={stats.activePlatforms}
                communityContributions={stats.communityContributions}
              />
              <HeroHotCampaigns campaigns={hotCampaigns} locale={locale} />
            </div>
          </div>

          {/* 移动端统计数据 */}
          <div className="mt-10 lg:hidden">
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-white">{stats.totalCampaigns}</div>
                <div className="text-xs leading-tight text-white/70">{t('stat_total_campaigns')}</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-white">{stats.activePlatforms}</div>
                <div className="text-xs leading-tight text-white/70">{t('stat_active_platforms')}</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-white">
                  {stats.communityContributions >= 1000
                    ? `${(stats.communityContributions / 1000).toFixed(1)}K`
                    : stats.communityContributions}
                </div>
                <div className="text-xs leading-tight text-white/70">{t('stat_community_contributions')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Featured Campaigns Carousel */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('featured_campaigns_title')}
          </h2>
        </div>
        <FeaturedCarousel locale={locale} />
      </section>

      {/* Category Quick Links */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-900">
            {t('categories_title')}
          </h2>
        </div>
        <CategoryLinks />
      </section>

      {/* Recent Campaigns */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('recent_campaigns_title')}
          </h2>
          <Link
            href="/campaigns"
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            {t('view_all')}
            {' '}
            →
          </Link>
        </div>

        {recentCampaigns.length > 0
          ? (
              <CampaignListWrapper campaignIds={recentCampaigns.map(c => c.id)}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recentCampaigns.map(campaign => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      locale={locale}
                      showPlatform
                    />
                  ))}
                </div>
              </CampaignListWrapper>
            )
          : (
              <EmptyState
                icon="🎯"
                title={t('no_campaigns')}
                description="还没有找到心仪的活动？试试调整筛选条件，或者提交一个新发现！"
                actionLabel="浏览所有活动"
                actionHref="/campaigns"
              />
            )}
      </section>

      {/* Social Media CTA */}
      <section>
        <SocialMediaCTA />
      </section>
    </div>
  );
};
