import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { campaignEmojiReactions, campaigns } from '@/models/Schema';

/**
 * POST /api/campaigns/[id]/emoji-reactions/[emoji]
 * Add an emoji reaction to a campaign
 * Optimized: parallel queries + upsert pattern
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; emoji: string }> },
) {
  try {
    // Check authentication and get params in parallel
    const [authResult, resolvedParams] = await Promise.all([
      auth(),
      params,
    ]);

    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id: campaignId, emoji } = resolvedParams;
    const decodedEmoji = decodeURIComponent(emoji);

    // Run campaign check and existing reaction check in parallel
    const [campaign, existing] = await Promise.all([
      db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(and(eq(campaigns.id, campaignId), isNull(campaigns.deletedAt)))
        .limit(1),
      db
        .select({ id: campaignEmojiReactions.id })
        .from(campaignEmojiReactions)
        .where(
          and(
            eq(campaignEmojiReactions.campaignId, campaignId),
            eq(campaignEmojiReactions.userId, userId),
            eq(campaignEmojiReactions.emoji, decodedEmoji),
          ),
        )
        .limit(1),
    ]);

    if (campaign.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 },
      );
    }

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already reacted with this emoji' },
        { status: 400 },
      );
    }

    // Add reaction
    await db.insert(campaignEmojiReactions).values({
      campaignId,
      userId,
      emoji: decodedEmoji,
    });

    return NextResponse.json({
      success: true,
      message: 'Reaction added successfully',
    });
  } catch (error) {
    console.error('Error adding campaign emoji reaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add reaction',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/campaigns/[id]/emoji-reactions/[emoji]
 * Remove an emoji reaction from a campaign
 * Optimized: parallel auth + params resolution
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; emoji: string }> },
) {
  try {
    // Check authentication and get params in parallel
    const [authResult, resolvedParams] = await Promise.all([
      auth(),
      params,
    ]);

    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id: campaignId, emoji } = resolvedParams;
    const decodedEmoji = decodeURIComponent(emoji);

    // Remove reaction - single query
    const result = await db
      .delete(campaignEmojiReactions)
      .where(
        and(
          eq(campaignEmojiReactions.campaignId, campaignId),
          eq(campaignEmojiReactions.userId, userId),
          eq(campaignEmojiReactions.emoji, decodedEmoji),
        ),
      )
      .returning({ id: campaignEmojiReactions.id });

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reaction not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Error removing campaign emoji reaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove reaction',
      },
      { status: 500 },
    );
  }
}
