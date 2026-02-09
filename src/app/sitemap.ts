import type { MetadataRoute } from 'next';
import { getCampaigns } from '@/services/CampaignService';
import { getPlatforms } from '@/services/PlatformService';
import { AppConfig } from '@/utils/AppConfig';
import { getBaseUrl } from '@/utils/Helpers';

/**
 * Dynamic Sitemap Generation with i18n support
 * Generates sitemap.xml with multi-language URLs and alternates
 */

function buildAlternates(path: string, baseUrl: string) {
  return {
    languages: Object.fromEntries(
      AppConfig.locales.map(l => [
        l,
        l === AppConfig.defaultLocale
          ? `${baseUrl}${path}`
          : `${baseUrl}/${l}${path}`,
      ]),
    ),
  };
}

function buildLocalizedEntries(
  path: string,
  baseUrl: string,
  opts: { lastModified?: Date; changeFrequency?: MetadataRoute.Sitemap[0]['changeFrequency']; priority?: number },
): MetadataRoute.Sitemap {
  const alternates = buildAlternates(path, baseUrl);
  return AppConfig.locales.map(locale => ({
    url: locale === AppConfig.defaultLocale
      ? `${baseUrl}${path}`
      : `${baseUrl}/${locale}${path}`,
    lastModified: opts.lastModified || new Date(),
    changeFrequency: opts.changeFrequency || 'weekly',
    priority: opts.priority || 0.5,
    alternates,
  }));
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Static pages with i18n
  const staticPages: MetadataRoute.Sitemap = [
    ...buildLocalizedEntries('/', baseUrl, { changeFrequency: 'daily', priority: 1.0 }),
    ...buildLocalizedEntries('/campaigns', baseUrl, { changeFrequency: 'hourly', priority: 0.9 }),
    ...buildLocalizedEntries('/tags', baseUrl, { changeFrequency: 'daily', priority: 0.7 }),
  ];

  // Dynamic campaign pages
  const campaigns = await getCampaigns({
    status: 'published',
    includeExpired: false,
    includeDeleted: false,
    limit: 1000,
  });

  const campaignPages: MetadataRoute.Sitemap = campaigns.flatMap(campaign =>
    buildLocalizedEntries(`/campaigns/${campaign.slug}`, baseUrl, {
      lastModified: campaign.updatedAt || campaign.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: campaign.isFeatured ? 0.9 : 0.8,
    }),
  );

  // Dynamic platform pages
  const platforms = await getPlatforms({
    status: 'active',
  });

  const platformPages: MetadataRoute.Sitemap = platforms.flatMap(platform =>
    buildLocalizedEntries(`/platforms/${platform.slug}`, baseUrl, {
      lastModified: platform.updatedAt || platform.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );

  // Category pages
  const { getTags } = await import('@/services/TagService');
  const categoryTags = await getTags({
    type: 'category',
    hasActiveCampaigns: true,
  });

  const categoryPages: MetadataRoute.Sitemap = categoryTags.flatMap(tag =>
    buildLocalizedEntries(`/category/${tag.slug}`, baseUrl, {
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  return [...staticPages, ...campaignPages, ...platformPages, ...categoryPages];
}
