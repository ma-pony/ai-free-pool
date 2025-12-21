import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getBookmarkedCampaignIds } from '@/services/BookmarkService';

/**
 * GET /api/bookmarks/ids - Get all bookmarked campaign IDs for the authenticated user
 * This endpoint is optimized for batch checking bookmark status
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignIds = await getBookmarkedCampaignIds(userId);

    return NextResponse.json({
      success: true,
      data: campaignIds,
    });
  } catch (error) {
    console.error('Error fetching bookmark IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark IDs' },
      { status: 500 },
    );
  }
}
