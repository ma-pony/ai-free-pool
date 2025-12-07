import type { MetadataRoute } from 'next';
import { getCampaigns } from '@/services/CampaignService';
import { getPlatforms } from '@/services/PlatformService';
import { getBaseUrl } from '@/utils/Helpers';

/**
 * Dynamic Sitemap Generation
 * Validates: Requirements 15.4
 *
 * Generates a sitemap.xml file that includes:
 * - Static pages (home, campaigns list, etc.)
 * - Dynamic campaign pages
 * - Dynamic platform pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/campaigns`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // Fetch all published campaigns
  const campaigns = await getCampaigns({
    status: 'published',
    includeExpired: false,
    includeDeleted: false,
    limit: 1000, // Get all campaigns
  });

  const campaignPages: MetadataRoute.Sitemap = campaigns.map(campaign => ({
    url: `${baseUrl}/campaigns/${campaign.slug}`,
    lastModified: campaign.updatedAt || campaign.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: campaign.isFeatured ? 0.9 : 0.8,
  }));

  // Fetch all active platforms
  const platforms = await getPlatforms({
    status: 'active',
  });

  const platformPages: MetadataRoute.Sitemap = platforms.map(platform => ({
    url: `${baseUrl}/platforms/${platform.slug}`,
    lastModified: platform.updatedAt || platform.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Fetch all category tags for semantic URLs
  const { getTags } = await import('@/services/TagService');
  const categoryTags = await getTags({
    type: 'category',
    hasActiveCampaigns: true,
  });

  const categoryPages: MetadataRoute.Sitemap = categoryTags.map(tag => ({
    url: `${baseUrl}/category/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...campaignPages, ...platformPages, ...categoryPages];
}
