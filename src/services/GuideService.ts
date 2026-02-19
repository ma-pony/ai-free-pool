import type { Campaign } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { getCampaigns } from './CampaignService';
import { getPlatforms } from './PlatformService';

export type GuidePlatformGroup = {
  platform: Platform;
  campaigns: Campaign[];
};

export type GuideData = {
  slug: string;
  platformGroups: GuidePlatformGroup[];
  totalPlatforms: number;
  totalCampaigns: number;
};

const SUPPORTED_GUIDES = ['free-ai-credits-2026'] as const;

export function isSupportedGuide(slug: string): boolean {
  return (SUPPORTED_GUIDES as readonly string[]).includes(slug);
}

export async function getGuideBySlug(slug: string): Promise<GuideData | null> {
  if (!isSupportedGuide(slug)) return null;

  const [activePlatforms, publishedCampaigns] = await Promise.all([
    getPlatforms({ status: 'active' }),
    getCampaigns({ status: 'published', includeExpired: false, includeDeleted: false, limit: 500 }),
  ]);

  const platformMap = new Map<string, GuidePlatformGroup>();
  for (const platform of activePlatforms) {
    platformMap.set(platform.id, { platform, campaigns: [] });
  }

  for (const campaign of publishedCampaigns) {
    if (campaign.platformId && platformMap.has(campaign.platformId)) {
      platformMap.get(campaign.platformId)!.campaigns.push(campaign);
    }
  }

  const platformGroups = Array.from(platformMap.values()).filter(g => g.campaigns.length > 0);

  return {
    slug,
    platformGroups,
    totalPlatforms: platformGroups.length,
    totalCampaigns: publishedCampaigns.length,
  };
}
