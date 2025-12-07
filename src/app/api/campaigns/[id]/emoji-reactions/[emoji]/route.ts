import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { campaignEmojiReactions, campaigns } from '@/models/Schema';

/**
 * POST /api/campaigns/[id]/emoji-reactions/[emoji]
 * Add an emoji reaction to a campaign
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; emoji: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id: campaignId, emoji } = await params;

    // Decode emoji from URL
    const decodedEmoji = decodeURIComponent(emoji);

    // Verify campaign exists
    const campaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, campaignId), isNull(campaigns.deletedAt)))
      .limit(1);

    if (campaign.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 },
      );
    }

    // Check if user already reacted with this emoji
    const existing = await db
      .select()
      .from(campaignEmojiReactions)
      .where(
        and(
          eq(campaignEmojiReactions.campaignId, campaignId),
          eq(campaignEmojiReactions.userId, userId),
          eq(campaignEmojiReactions.emoji, decodedEmoji),
        ),
      )
      .limit(1);

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
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; emoji: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { id: campaignId, emoji } = await params;

    // Decode emoji from URL
    const decodedEmoji = decodeURIComponent(emoji);

    // Remove reaction
    const result = await db
      .delete(campaignEmojiReactions)
      .where(
        and(
          eq(campaignEmojiReactions.campaignId, campaignId),
          eq(campaignEmojiReactions.userId, userId),
          eq(campaignEmojiReactions.emoji, decodedEmoji),
        ),
      )
      .returning();

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
