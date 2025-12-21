import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { campaigns, userParticipatedCampaigns } from '@/models/Schema';

export type Participation = {
  id: string;
  userId: string;
  campaignId: string;
  participatedAt: Date;
  notes: string | null;
  createdAt: Date;
};

export type ParticipationWithCampaign = Participation & {
  campaign: {
    id: string;
    slug: string;
    status: string;
    endDate: Date | null;
    isFeatured: boolean;
    platform: {
      id: string;
      name: string;
      logo: string | null;
    } | null;
    translations: Array<{
      locale: string;
      title: string;
      description: string | null;
    }>;
  };
};

export type CreateParticipationInput = {
  userId: string;
  campaignId: string;
  notes?: string;
};

/**
 * Get all participations for a user
 */
export async function getParticipationsByUser(userId: string): Promise<ParticipationWithCampaign[]> {
  try {
    const result = await db.query.userParticipatedCampaigns.findMany({
      where: eq(userParticipatedCampaigns.userId, userId),
      with: {
        campaign: {
          with: {
            platform: true,
            translations: true,
          },
        },
      },
      orderBy: (participations, { desc }) => [desc(participations.participatedAt)],
    });

    // Filter out participations for deleted campaigns
    return result.filter(p => p.campaign && !(p.campaign as any).deletedAt) as ParticipationWithCampaign[];
  } catch (error) {
    console.error('Error in getParticipationsByUser:', error);
    throw error;
  }
}

/**
 * Get a specific participation record
 */
export async function getParticipation(
  userId: string,
  campaignId: string,
): Promise<Participation | null> {
  const result = await db
    .select()
    .from(userParticipatedCampaigns)
    .where(and(
      eq(userParticipatedCampaigns.userId, userId),
      eq(userParticipatedCampaigns.campaignId, campaignId),
    ))
    .limit(1);

  return result.length > 0 ? (result[0] as Participation) : null;
}

/**
 * Check if a user has participated in a campaign
 */
export async function hasParticipated(userId: string, campaignId: string): Promise<boolean> {
  const participation = await getParticipation(userId, campaignId);
  return participation !== null;
}

/**
 * Mark a campaign as participated
 * Only one participation per user-campaign combination (enforced by unique constraint)
 */
export async function markAsParticipated(input: CreateParticipationInput): Promise<Participation> {
  // Verify campaign exists and is not deleted
  const campaign = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), isNull(campaigns.deletedAt)))
    .limit(1);

  if (campaign.length === 0) {
    throw new Error(`Campaign with ID "${input.campaignId}" not found`);
  }

  // Check if participation already exists
  const existing = await getParticipation(input.userId, input.campaignId);
  if (existing) {
    // Return existing participation (idempotent operation)
    return existing;
  }

  // Create new participation record
  const [participation] = await db
    .insert(userParticipatedCampaigns)
    .values({
      userId: input.userId,
      campaignId: input.campaignId,
      notes: input.notes || null,
    })
    .returning();

  return participation as Participation;
}

/**
 * Remove a participation record
 */
export async function removeParticipation(userId: string, campaignId: string): Promise<boolean> {
  const result = await db
    .delete(userParticipatedCampaigns)
    .where(and(
      eq(userParticipatedCampaigns.userId, userId),
      eq(userParticipatedCampaigns.campaignId, campaignId),
    ))
    .returning();

  return result.length > 0;
}

/**
 * Toggle participation (mark if not exists, remove if exists)
 */
export async function toggleParticipation(
  userId: string,
  campaignId: string,
  notes?: string,
): Promise<{ participated: boolean; participation: Participation | null }> {
  const existing = await getParticipation(userId, campaignId);

  if (existing) {
    // Remove participation
    await removeParticipation(userId, campaignId);
    return { participated: false, participation: null };
  }

  // Create participation
  const participation = await markAsParticipated({ userId, campaignId, notes });
  return { participated: true, participation };
}

/**
 * Get participation count for a campaign
 */
export async function getParticipationCount(campaignId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userParticipatedCampaigns)
    .where(eq(userParticipatedCampaigns.campaignId, campaignId));

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Get total participation count for a user
 */
export async function getUserParticipationCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userParticipatedCampaigns)
    .where(eq(userParticipatedCampaigns.userId, userId));

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Get all participated campaign IDs for a user (useful for filtering)
 */
export async function getParticipatedCampaignIds(userId: string): Promise<string[]> {
  const result = await db
    .select({ campaignId: userParticipatedCampaigns.campaignId })
    .from(userParticipatedCampaigns)
    .where(eq(userParticipatedCampaigns.userId, userId));

  return result.map(r => r.campaignId);
}

/**
 * Remove all participations for a campaign (used when campaign is deleted)
 */
export async function removeAllParticipationsForCampaign(campaignId: string): Promise<number> {
  const result = await db
    .delete(userParticipatedCampaigns)
    .where(eq(userParticipatedCampaigns.campaignId, campaignId))
    .returning();

  return result.length;
}
