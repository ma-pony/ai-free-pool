import type { NextRequest } from 'next/server';
import type { CreateReactionInput } from '@/services/ReactionService';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  addOrUpdateReaction,

  getReactionStats,
} from '@/services/ReactionService';

/**
 * POST /api/reactions
 * Add or update a user's reaction to a campaign
 * Validates: Requirements 5.2, 5.3, 5.6
 */
export async function POST(request: NextRequest) {
  try {
    // Parallel: auth + body parsing
    const [{ userId }, body] = await Promise.all([
      auth(),
      request.json(),
    ]);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { campaignId, type } = body;

    // Validate input
    if (!campaignId || !type) {
      return NextResponse.json(
        { success: false, error: 'campaignId and type are required' },
        { status: 400 },
      );
    }

    if (!['still_works', 'expired', 'info_incorrect'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type' },
        { status: 400 },
      );
    }

    const input: CreateReactionInput = {
      campaignId,
      userId,
      type,
    };

    // Add or update reaction
    const reaction = await addOrUpdateReaction(input);

    // Get updated stats
    const stats = await getReactionStats(campaignId);

    return NextResponse.json({
      success: true,
      data: {
        reaction,
        stats,
      },
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add reaction',
      },
      { status: 500 },
    );
  }
}
