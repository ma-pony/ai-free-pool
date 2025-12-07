import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getCampaigns } from '@/services/CampaignService';

/**
 * GET /api/campaigns/search
 * Search campaigns across platform name, title, and description
 * Validates: Requirements 9.1
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 },
      );
    }

    // Search with the query parameter
    const campaigns = await getCampaigns({
      search: query.trim(),
      // By default, only return published campaigns for search
      status: 'published',
      includeExpired: false,
      includeDeleted: false,
    });

    logger.info(`Search performed: "${query}" - ${campaigns.length} results`);

    return NextResponse.json({
      success: true,
      data: {
        query,
        count: campaigns.length,
        campaigns,
      },
    });
  } catch (error) {
    logger.error`Error searching campaigns: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search campaigns',
      },
      { status: 500 },
    );
  }
}
