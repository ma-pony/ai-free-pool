import type { Campaign } from '@/types/Campaign';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  campaigns,
  reactions,
} from '@/models/Schema';

export type ReactionType = 'still_works' | 'expired' | 'info_incorrect';

export type Reaction = {
  id: string;
  campaignId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
};

export type ReactionStats = {
  stillWorks: number;
  expired: number;
  infoIncorrect: number;
  total: number;
};

export type CreateReactionInput = {
  campaignId: string;
  userId: string;
  type: ReactionType;
};

export type UpdateReactionInput = {
  type: ReactionType;
};

/**
 * Get all reactions for a campaign
 * Validates: Requirements 5.7
 */
export async function getReactionsByCampaign(campaignId: string): Promise<Reaction[]> {
  const result = await db
    .select()
    .from(reactions)
    .where(eq(reactions.campaignId, campaignId))
    .orderBy(reactions.createdAt);

  return result as Reaction[];
}

/**
 * Get reaction statistics for a campaign
 * Validates: Requirements 5.7, Property 10
 */
export async function getReactionStats(campaignId: string): Promise<ReactionStats> {
  const result = await db
    .select({
      type: reactions.type,
      count: sql<number>`count(*)::int`,
    })
    .from(reactions)
    .where(eq(reactions.campaignId, campaignId))
    .groupBy(reactions.type);

  const stats: ReactionStats = {
    stillWorks: 0,
    expired: 0,
    infoIncorrect: 0,
    total: 0,
  };

  for (const row of result) {
    const count = Number(row.count);
    stats.total += count;

    switch (row.type) {
      case 'still_works':
        stats.stillWorks = count;
        break;
      case 'expired':
        stats.expired = count;
        break;
      case 'info_incorrect':
        stats.infoIncorrect = count;
        break;
    }
  }

  return stats;
}

/**
 * Get user's reaction for a campaign
 * Validates: Requirements 5.4
 */
export async function getUserReaction(
  campaignId: string,
  userId: string,
): Promise<Reaction | null> {
  const result = await db
    .select()
    .from(reactions)
    .where(and(eq(reactions.campaignId, campaignId), eq(reactions.userId, userId)))
    .limit(1);

  return result.length > 0 ? (result[0] as Reaction) : null;
}

/**
 * Create or update a reaction
 * Validates: Requirements 5.3, 5.6, Property 9
 * If user already has a reaction, it will be updated to the new type
 */
export async function addOrUpdateReaction(input: CreateReactionInput): Promise<Reaction> {
  // Verify campaign exists and is not deleted
  const campaign = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), isNull(campaigns.deletedAt)))
    .limit(1);

  if (campaign.length === 0) {
    throw new Error(`Campaign with ID "${input.campaignId}" not found`);
  }

  // Check if user already has a reaction for this campaign
  const existing = await getUserReaction(input.campaignId, input.userId);

  if (existing) {
    // Update existing reaction (Requirement 5.6)
    const [updated] = await db
      .update(reactions)
      .set({
        type: input.type,
        updatedAt: new Date(),
      })
      .where(eq(reactions.id, existing.id))
      .returning();

    // Check if verification is needed after update
    await checkVerificationNeeded(input.campaignId);

    return updated as Reaction;
  }

  // Create new reaction (Requirement 5.3)
  const [reaction] = await db
    .insert(reactions)
    .values({
      campaignId: input.campaignId,
      userId: input.userId,
      type: input.type,
    })
    .returning();

  // Check if verification is needed after creation
  await checkVerificationNeeded(input.campaignId);

  return reaction as Reaction;
}

/**
 * Remove a user's reaction
 * Validates: Requirements 5.5
 */
export async function removeReaction(campaignId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(reactions)
    .where(and(eq(reactions.campaignId, campaignId), eq(reactions.userId, userId)))
    .returning();

  // Check if verification status needs to be updated after removal
  if (result.length > 0) {
    await checkVerificationNeeded(campaignId);
  }

  return result.length > 0;
}

/**
 * Check if a campaign needs verification based on reaction statistics
 * Validates: Requirements 5.8, Property 11
 * If expired reactions exceed still_works by more than 50%, mark for verification
 */
export async function checkVerificationNeeded(campaignId: string): Promise<boolean> {
  const stats = await getReactionStats(campaignId);

  // If there are no reactions, no verification needed
  if (stats.total === 0) {
    return false;
  }

  // Calculate if expired reactions exceed still_works by more than 50%
  // Requirement 5.8: "已失效反馈数量超过有效反馈数量的 50%"
  const needsVerification = stats.expired > stats.stillWorks * 1.5;

  // Update the needsVerification flag
  await db
    .update(campaigns)
    .set({
      needsVerification,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  return needsVerification;
}

/**
 * Get reaction stats for multiple campaigns in a single query
 * Optimized batch version to avoid N+1 queries
 */
export async function getBatchReactionStats(campaignIds: string[]): Promise<Map<string, ReactionStats>> {
  if (campaignIds.length === 0) {
    return new Map();
  }

  const result = await db
    .select({
      campaignId: reactions.campaignId,
      type: reactions.type,
      count: sql<number>`count(*)::int`,
    })
    .from(reactions)
    .where(sql`${reactions.campaignId} = ANY(${campaignIds})`)
    .groupBy(reactions.campaignId, reactions.type);

  // Build stats map
  const statsMap = new Map<string, ReactionStats>();

  // Initialize all campaigns with empty stats
  for (const campaignId of campaignIds) {
    statsMap.set(campaignId, {
      stillWorks: 0,
      expired: 0,
      infoIncorrect: 0,
      total: 0,
    });
  }

  // Populate stats from query results
  for (const row of result) {
    const stats = statsMap.get(row.campaignId)!;
    const count = Number(row.count);
    stats.total += count;

    switch (row.type) {
      case 'still_works':
        stats.stillWorks = count;
        break;
      case 'expired':
        stats.expired = count;
        break;
      case 'info_incorrect':
        stats.infoIncorrect = count;
        break;
    }
  }

  return statsMap;
}

/**
 * Get campaigns that need verification
 * Validates: Requirements 5.9
 * Optimized: Uses batch query instead of N+1 individual queries
 */
export async function getCampaignsNeedingVerification(): Promise<
  Array<{
    campaignId: string;
    stats: ReactionStats;
  }>
> {
  // Get all campaigns marked as needing verification
  const campaignsNeedingVerification = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.needsVerification, true),
        eq(campaigns.status, 'published'),
        isNull(campaigns.deletedAt),
      ),
    );

  if (campaignsNeedingVerification.length === 0) {
    return [];
  }

  // Get stats for all campaigns in a single batch query
  const campaignIds = campaignsNeedingVerification.map(c => c.id);
  const statsMap = await getBatchReactionStats(campaignIds);

  return campaignIds.map(campaignId => ({
    campaignId,
    stats: statsMap.get(campaignId)!,
  }));
}

/**
 * Get all reactions by a user
 */
export async function getReactionsByUser(userId: string): Promise<Reaction[]> {
  const result = await db
    .select()
    .from(reactions)
    .where(eq(reactions.userId, userId))
    .orderBy(reactions.createdAt);

  return result as Reaction[];
}

/**
 * Mark a campaign as verified (clear the needsVerification flag)
 * This should be called by admins after reviewing a flagged campaign
 */
export async function markCampaignAsVerified(campaignId: string): Promise<boolean> {
  const result = await db
    .update(campaigns)
    .set({
      needsVerification: false,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId))
    .returning();

  return result.length > 0;
}

/**
 * Get count of campaigns needing verification
 * Useful for admin dashboard badges
 */
export async function getVerificationNeededCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.needsVerification, true),
        eq(campaigns.status, 'published'),
        isNull(campaigns.deletedAt),
      ),
    );

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Get campaigns needing verification with full campaign details
 * Optimized: Uses batch queries instead of N+1 individual queries
 * Validates: Requirements 5.9
 */
export async function getCampaignsNeedingVerificationWithDetails(): Promise<
  Array<{
    campaign: Campaign;
    stats: ReactionStats;
  }>
> {
  // Get all campaigns marked as needing verification with full details
  const campaignsNeedingVerification = await db.query.campaigns.findMany({
    where: and(
      eq(campaigns.needsVerification, true),
      eq(campaigns.status, 'published'),
      isNull(campaigns.deletedAt),
    ),
    with: {
      platform: true,
      translations: true,
      conditionTags: {
        with: {
          tag: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (campaignsNeedingVerification.length === 0) {
    return [];
  }

  // Get stats for all campaigns in a single batch query
  const campaignIds = campaignsNeedingVerification.map(c => c.id);
  const statsMap = await getBatchReactionStats(campaignIds);

  // Transform and return results
  return campaignsNeedingVerification.map((campaign) => {
    const transformedCampaign = {
      ...campaign,
      pendingPlatform: null,
      conditionTags: campaign.conditionTags?.map(ct => ct.tag) || [],
      tags: campaign.tags?.map(t => t.tag) || [],
    } as unknown as Campaign;

    return {
      campaign: transformedCampaign,
      stats: statsMap.get(campaign.id)!,
    };
  });
}
