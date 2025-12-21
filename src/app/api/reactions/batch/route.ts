import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { reactions } from '@/models/Schema';

/**
 * POST /api/reactions/batch
 * Get reaction stats for multiple campaigns in a single request
 * Avoids N+1 problem when loading campaign lists
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { campaignIds } = body as { campaignIds: string[] };

    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {},
      });
    }

    // Limit to prevent abuse
    const limitedIds = campaignIds.slice(0, 100);

    // Get reaction stats grouped by campaign and type
    const reactionStats = await db
      .select({
        campaignId: reactions.campaignId,
        type: reactions.type,
        count: sql<number>`count(*)::int`,
      })
      .from(reactions)
      .where(inArray(reactions.campaignId, limitedIds))
      .groupBy(reactions.campaignId, reactions.type);

    // Get user's reactions if authenticated
    let userReactions: Array<{ campaignId: string; type: string }> = [];
    if (userId) {
      userReactions = await db
        .select({
          campaignId: reactions.campaignId,
          type: reactions.type,
        })
        .from(reactions)
        .where(
          and(
            inArray(reactions.campaignId, limitedIds),
            eq(reactions.userId, userId),
          ),
        );
    }

    // Build result map
    const result: Record<string, {
      stats: { stillWorks: number; expired: number; infoIncorrect: number; total: number };
      userReaction: string | null;
    }> = {};

    // Initialize all campaigns with empty stats
    for (const id of limitedIds) {
      result[id] = {
        stats: { stillWorks: 0, expired: 0, infoIncorrect: 0, total: 0 },
        userReaction: null,
      };
    }

    // Fill in stats
    for (const row of reactionStats) {
      const entry = result[row.campaignId];
      if (entry) {
        const count = Number(row.count);
        entry.stats.total += count;
        switch (row.type) {
          case 'still_works':
            entry.stats.stillWorks = count;
            break;
          case 'expired':
            entry.stats.expired = count;
            break;
          case 'info_incorrect':
            entry.stats.infoIncorrect = count;
            break;
        }
      }
    }

    // Fill in user reactions
    for (const ur of userReactions) {
      const entry = result[ur.campaignId];
      if (entry) {
        entry.userReaction = ur.type;
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching batch reactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reactions' },
      { status: 500 },
    );
  }
}
