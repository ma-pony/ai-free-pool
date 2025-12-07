import type { NextRequest } from 'next/server';
import type { UpdateCommentInput } from '@/services/CommentService';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  deleteComment,
  getCommentById,
  updateComment,

} from '@/services/CommentService';

/**
 * GET /api/comments/comment/[id]
 * Get a single comment by ID
 * Validates: Requirements 6.1
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 },
      );
    }

    const comment = await getCommentById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comment',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/comments/comment/[id]
 * Update a comment
 * Validates: Requirements 6.4
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { content } = body;

    // Validate input
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'content is required' },
        { status: 400 },
      );
    }

    // Validate content is not empty or just whitespace
    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content cannot be empty' },
        { status: 400 },
      );
    }

    const input: UpdateCommentInput = {
      content: content.trim(),
    };

    // Update comment (Requirement 6.4)
    const comment = await updateComment(id, userId, input);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);

    // Handle authorization errors
    if (error instanceof Error && error.message.includes('Only the comment author')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update comment',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/comments/comment/[id]
 * Delete a comment (soft delete)
 * Validates: Requirements 6.4
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 },
      );
    }

    // Delete comment (Requirement 6.4)
    const success = await deleteComment(id, userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);

    // Handle authorization errors
    if (error instanceof Error && error.message.includes('Only the comment author')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete comment',
      },
      { status: 500 },
    );
  }
}
