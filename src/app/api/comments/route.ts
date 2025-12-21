import type { NextRequest } from 'next/server';
import type { CreateCommentInput } from '@/services/CommentService';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createComment,

} from '@/services/CommentService';

/**
 * POST /api/comments
 * Create a new comment or reply
 * Validates: Requirements 6.2, 6.3, 6.8
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

    const { campaignId, content, parentId } = body;

    // Validate input
    if (!campaignId || !content) {
      return NextResponse.json(
        { success: false, error: 'campaignId and content are required' },
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

    const input: CreateCommentInput = {
      campaignId,
      userId,
      content: content.trim(),
      parentId: parentId || null,
    };

    // Create comment (Requirement 6.3)
    const comment = await createComment(input);

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment',
      },
      { status: 500 },
    );
  }
}
