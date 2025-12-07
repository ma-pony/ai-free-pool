import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getBookmark,
  removeBookmark,
  toggleBookmark,
} from '@/services/BookmarkService';

/**
 * GET /api/bookmarks/[campaignId] - Check if user has bookmarked a campaign
 * Validates: Requirements 7.3
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await params;
    const bookmark = await getBookmark(userId, campaignId);

    return NextResponse.json({
      success: true,
      data: {
        bookmarked: bookmark !== null,
        bookmark,
      },
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to check bookmark' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bookmarks/[campaignId] - Remove a bookmark
 * Validates: Requirements 7.4
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await params;
    const removed = await removeBookmark(userId, campaignId);

    if (!removed) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bookmarks/[campaignId]/toggle - Toggle bookmark
 * Validates: Requirements 7.1, 7.4
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await params;
    const result = await toggleBookmark(userId, campaignId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 },
    );
  }
}
