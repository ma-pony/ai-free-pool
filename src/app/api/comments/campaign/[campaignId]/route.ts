import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCommentsByCampaign } from '@/services/CommentService';

/**
 * GET /api/comments/campaign/[campaignId]
 * Get all comments for a campaign
 * Validates: Requirements 6.1
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await params;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'campaignId is required' },
        { status: 400 },
      );
    }

    // Get all comments with nested replies (Requirement 6.1)
    const comments = await getCommentsByCampaign(campaignId);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comments',
      },
      { status: 500 },
    );
  }
}
