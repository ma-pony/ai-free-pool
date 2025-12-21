import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { campaignEmojiReactions } from '@/models/Schema';

/**
 * POST /api/campaigns/emoji-reactions/batch
 * Get emoji reactions for multiple campaigns in a single request
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

    // Get reaction stats grouped by campaign and emoji
    const reactionStats = await db
      .select({
        campaignId: campaignEmojiReactions.campaignId,
        emoji: campaignEmojiReactions.emoji,
        count: sql<number>`count(*)::int`,
      })
      .from(campaignEmojiReactions)
      .where(inArray(campaignEmojiReactions.campaignId, limitedIds))
      .groupBy(campaignEmojiReactions.campaignId, campaignEmojiReactions.emoji);

    // Get user's reactions if authenticated
    let userReactions: Array<{ campaignId: string; emoji: string }> = [];
    if (userId) {
      userReactions = await db
        .select({
          campaignId: campaignEmojiReactions.campaignId,
          emoji: campaignEmojiReactions.emoji,
        })
        .from(campaignEmojiReactions)
        .where(
          and(
            inArray(campaignEmojiReactions.campaignId, limitedIds),
            eq(campaignEmojiReactions.userId, userId),
          ),
        );
    }

    // Build result map
    const result: Record<string, Array<{
      emoji: string;
      count: number;
      userReacted: boolean;
    }>> = {};

    // Initialize all campaigns with empty arrays
    for (const id of limitedIds) {
      result[id] = [];
    }

    // Create a map for easier lookup
    const statsMap: Record<string, Record<string, number>> = {};
    for (const row of reactionStats) {
      if (!statsMap[row.campaignId]) {
        statsMap[row.campaignId] = {};
      }
      statsMap[row.campaignId]![row.emoji] = Number(row.count);
    }

    // Create user reaction lookup
    const userReactionSet = new Set(
      userReactions.map(ur => `${ur.campaignId}:${ur.emoji}`),
    );

    // Build final result
    for (const [campaignId, emojiCounts] of Object.entries(statsMap)) {
      result[campaignId] = Object.entries(emojiCounts).map(([emoji, count]) => ({
        emoji,
        count,
        userReacted: userReactionSet.has(`${campaignId}:${emoji}`),
      }));
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching batch emoji reactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emoji reactions' },
      { status: 500 },
    );
  }
}
