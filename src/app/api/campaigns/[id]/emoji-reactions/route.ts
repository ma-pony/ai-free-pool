import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { campaignEmojiReactions } from '@/models/Schema';

/**
 * GET /api/campaigns/[id]/emoji-reactions
 * Get all emoji reactions for a campaign
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: campaignId } = await params;
    const { userId } = await auth();

    // Get reaction stats grouped by emoji
    const reactionStats = await db
      .select({
        emoji: campaignEmojiReactions.emoji,
        count: sql<number>`count(*)::int`,
      })
      .from(campaignEmojiReactions)
      .where(eq(campaignEmojiReactions.campaignId, campaignId))
      .groupBy(campaignEmojiReactions.emoji);

    // Get user's reactions if authenticated
    let userReactions: string[] = [];
    if (userId) {
      const userReactionRows = await db
        .select({ emoji: campaignEmojiReactions.emoji })
        .from(campaignEmojiReactions)
        .where(
          and(
            eq(campaignEmojiReactions.campaignId, campaignId),
            eq(campaignEmojiReactions.userId, userId),
          ),
        );
      userReactions = userReactionRows.map(r => r.emoji);
    }

    // Combine stats with user reaction status
    const reactions = reactionStats.map(stat => ({
      emoji: stat.emoji,
      count: Number(stat.count),
      userReacted: userReactions.includes(stat.emoji),
    }));

    return NextResponse.json({
      success: true,
      data: reactions,
    });
  } catch (error) {
    console.error('Error getting campaign emoji reactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reactions',
      },
      { status: 500 },
    );
  }
}
