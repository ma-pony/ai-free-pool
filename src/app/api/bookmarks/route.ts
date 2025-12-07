import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  createBookmark,
  getBookmarksByUser,
} from '@/services/BookmarkService';

/**
 * GET /api/bookmarks - Get all bookmarks for the authenticated user
 * Validates: Requirements 7.5
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarks = await getBookmarksByUser(userId);

    return NextResponse.json({
      success: true,
      data: bookmarks,
      count: bookmarks.length,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bookmarks - Create a new bookmark
 * Validates: Requirements 7.1, 7.2
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 },
      );
    }

    const bookmark = await createBookmark({
      userId,
      campaignId,
    });

    return NextResponse.json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 },
    );
  }
}
