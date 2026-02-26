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

// Platform-specific SEO detail guides
export const PLATFORM_GUIDE_SLUGS = ['chatgpt', 'claude', 'gemini'] as const;
export type PlatformGuideSlug = typeof PLATFORM_GUIDE_SLUGS[number];

// Map guide slug to platform slugs in DB
const PLATFORM_GUIDE_MAP: Record<PlatformGuideSlug, string[]> = {
  chatgpt: ['openai'],
  claude: ['anthropic'],
  gemini: ['google-ai-studio', 'google-cloud-vertex-ai'],
};

export function isSupportedGuide(slug: string): boolean {
  return (SUPPORTED_GUIDES as readonly string[]).includes(slug);
}

export function isPlatformGuide(slug: string): slug is PlatformGuideSlug {
  return (PLATFORM_GUIDE_SLUGS as readonly string[]).includes(slug);
}

export type PlatformGuideData = {
  slug: PlatformGuideSlug;
  platforms: Platform[];
  campaigns: Campaign[];
  totalCampaigns: number;
};

export async function getPlatformGuideBySlug(slug: string): Promise<PlatformGuideData | null> {
  if (!isPlatformGuide(slug)) {
    return null;
  }

  const platformSlugs = PLATFORM_GUIDE_MAP[slug];
  const { getPlatformBySlug } = await import('./PlatformService');

  const platformResults = await Promise.all(
    platformSlugs.map(s => getPlatformBySlug(s)),
  );
  const platforms = platformResults.filter((p): p is Platform => p !== null);

  if (platforms.length === 0) {
    return null;
  }

  const campaignResults = await Promise.all(
    platforms.map(p =>
      getCampaigns({ platformId: p.id, status: 'published', includeExpired: false, includeDeleted: false }),
    ),
  );
  const campaigns = campaignResults.flat();

  return {
    slug,
    platforms,
    campaigns,
    totalCampaigns: campaigns.length,
  };
}

export async function getGuideBySlug(slug: string): Promise<GuideData | null> {
  if (!isSupportedGuide(slug)) {
    return null;
  }

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
