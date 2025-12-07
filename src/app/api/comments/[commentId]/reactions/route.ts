import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCommentReactions } from '@/services/CommentReactionService';

/**
 * GET /api/comments/[commentId]/reactions
 * Get all reactions for a comment
 * Validates: Requirements 6.6
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    const { commentId } = await params;

    // Get current user (optional - to mark which reactions they've added)
    const { userId } = await auth();

    // Get reactions
    const reactions = await getCommentReactions(commentId, userId || undefined);

    return NextResponse.json({
      success: true,
      data: reactions,
    });
  } catch (error) {
    console.error('Error getting comment reactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reactions',
      },
      { status: 500 },
    );
  }
}
