import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getReactionStats,
  getUserReaction,
  removeReaction,
} from '@/services/ReactionService';

/**
 * GET /api/reactions/[campaignId]
 * Get reaction statistics and user's reaction for a campaign
 * Validates: Requirements 5.4, 5.7
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    // Parallel: auth + params
    const [{ userId }, { campaignId }] = await Promise.all([auth(), params]);

    // Parallel: stats + user reaction (if authenticated)
    const [stats, userReaction] = await Promise.all([
      getReactionStats(campaignId),
      userId ? getUserReaction(campaignId, userId) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        userReaction,
      },
    });
  } catch (error) {
    console.error('Error getting reactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reactions',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/reactions/[campaignId]
 * Remove user's reaction from a campaign
 * Validates: Requirements 5.5
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    // Parallel: auth + params
    const [{ userId }, { campaignId }] = await Promise.all([auth(), params]);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Remove reaction (Requirement 5.5)
    const removed = await removeReaction(campaignId, userId);

    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Reaction not found' },
        { status: 404 },
      );
    }

    // Get updated stats
    const stats = await getReactionStats(campaignId);

    return NextResponse.json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove reaction',
      },
      { status: 500 },
    );
  }
}
