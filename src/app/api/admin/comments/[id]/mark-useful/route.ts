import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { markCommentAsUseful } from '@/services/CommentService';

/**
 * POST /api/admin/comments/[id]/mark-useful
 * Mark a comment as useful (admin only)
 * Validates: Requirements 6.9
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { isUseful } = body;

    // Validate input
    if (typeof isUseful !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isUseful must be a boolean' },
        { status: 400 },
      );
    }

    // Mark comment as useful (Requirement 6.9)
    const comment = await markCommentAsUseful(id, isUseful);

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
    console.error('Error marking comment as useful:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark comment as useful',
      },
      { status: 500 },
    );
  }
}
