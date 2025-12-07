import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { campaigns, featuredClicks, featuredImpressions } from '@/models/Schema';

export type FeaturedCampaignStats = {
  campaignId: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
};

/**
 * Track a featured campaign impression
 * Validates: Requirements 12.4
 */
export async function trackImpression(
  campaignId: string,
  userId?: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await db.insert(featuredImpressions).values({
    campaignId,
    userId: userId || null,
    sessionId: sessionId || null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
}

/**
 * Track a featured campaign click
 * Validates: Requirements 12.4
 */
export async function trackClick(
  campaignId: string,
  userId?: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  await db.insert(featuredClicks).values({
    campaignId,
    userId: userId || null,
    sessionId: sessionId || null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
}

/**
 * Get statistics for a featured campaign
 * Validates: Requirements 12.5
 */
export async function getCampaignStats(
  campaignId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<FeaturedCampaignStats> {
  const dateConditions = [];

  if (startDate) {
    dateConditions.push(gte(featuredImpressions.createdAt, startDate));
  }

  if (endDate) {
    dateConditions.push(sql`${featuredImpressions.createdAt} <= ${endDate}`);
  }

  // Get impression count
  const impressionResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(featuredImpressions)
    .where(
      and(
        eq(featuredImpressions.campaignId, campaignId),
        ...dateConditions,
      ),
    );

  const impressions = impressionResult[0]?.count || 0;

  // Get click count
  const clickDateConditions = [];

  if (startDate) {
    clickDateConditions.push(gte(featuredClicks.createdAt, startDate));
  }

  if (endDate) {
    clickDateConditions.push(sql`${featuredClicks.createdAt} <= ${endDate}`);
  }

  const clickResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(featuredClicks)
    .where(
      and(
        eq(featuredClicks.campaignId, campaignId),
        ...clickDateConditions,
      ),
    );

  const clicks = clickResult[0]?.count || 0;

  // Calculate click-through rate
  const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;

  return {
    campaignId,
    impressions,
    clicks,
    clickThroughRate: Math.round(clickThroughRate * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Get statistics for all featured campaigns
 * Validates: Requirements 12.5
 */
export async function getAllFeaturedStats(
  startDate?: Date,
  endDate?: Date,
): Promise<FeaturedCampaignStats[]> {
  // Get all currently featured campaigns
  const featuredCampaigns = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.isFeatured, true));

  // Get stats for each campaign
  const stats = await Promise.all(
    featuredCampaigns.map(campaign =>
      getCampaignStats(campaign.id, startDate, endDate),
    ),
  );

  return stats;
}

/**
 * Get aggregated statistics for all featured campaigns
 * Validates: Requirements 12.5
 */
export async function getAggregatedStats(
  startDate?: Date,
  endDate?: Date,
): Promise<{
  totalImpressions: number;
  totalClicks: number;
  averageClickThroughRate: number;
}> {
  const stats = await getAllFeaturedStats(startDate, endDate);

  const totalImpressions = stats.reduce((sum, s) => sum + s.impressions, 0);
  const totalClicks = stats.reduce((sum, s) => sum + s.clicks, 0);
  const averageClickThroughRate
    = stats.length > 0
      ? stats.reduce((sum, s) => sum + s.clickThroughRate, 0) / stats.length
      : 0;

  return {
    totalImpressions,
    totalClicks,
    averageClickThroughRate: Math.round(averageClickThroughRate * 100) / 100,
  };
}
