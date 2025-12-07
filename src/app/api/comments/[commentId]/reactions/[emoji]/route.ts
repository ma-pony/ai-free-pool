import type { NextRequest } from 'next/server';
import type { CreateCommentReactionInput } from '@/services/CommentReactionService';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  addCommentReaction,

  removeCommentReaction,
} from '@/services/CommentReactionService';

/**
 * POST /api/comments/[commentId]/reactions/[emoji]
 * Add an emoji reaction to a comment
 * Validates: Requirements 6.5, Property 13
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string; emoji: string }> },
) {
  try {
    // Check authentication (Requirement 6.5)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { commentId, emoji } = await params;

    // Decode emoji from URL (in case it's URL encoded)
    const decodedEmoji = decodeURIComponent(emoji);

    const input: CreateCommentReactionInput = {
      commentId,
      userId,
      emoji: decodedEmoji,
    };

    // Add reaction (Requirement 6.5, Property 13)
    const reaction = await addCommentReaction(input);

    return NextResponse.json({
      success: true,
      data: reaction,
    });
  } catch (error) {
    console.error('Error adding comment reaction:', error);
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
 * DELETE /api/comments/[commentId]/reactions/[emoji]
 * Remove an emoji reaction from a comment
 * Validates: Requirements 6.7
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string; emoji: string }> },
) {
  try {
    // Check authentication (Requirement 6.7)
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { commentId, emoji } = await params;

    // Decode emoji from URL (in case it's URL encoded)
    const decodedEmoji = decodeURIComponent(emoji);

    // Remove reaction (Requirement 6.7)
    const removed = await removeCommentReaction(commentId, userId, decodedEmoji);

    if (!removed) {
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
    console.error('Error removing comment reaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove reaction',
      },
      { status: 500 },
    );
  }
}
