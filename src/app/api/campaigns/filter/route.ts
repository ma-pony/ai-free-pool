import type { NextRequest } from 'next/server';
import type { CampaignListFilters } from '@/types/Campaign';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getCampaigns } from '@/services/CampaignService';

/**
 * GET /api/campaigns/filter
 * Filter campaigns by multiple criteria
 * Validates: Requirements 9.2-9.8
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filter parameters
    const filters: CampaignListFilters = {
      // Status filter (Requirement 9.6)
      status: (searchParams.get('status') as 'pending' | 'published' | 'rejected' | 'expired' | null) || undefined,

      // Platform filter
      platformId: searchParams.get('platformId') || undefined,

      // Search query
      search: searchParams.get('search') || searchParams.get('q') || undefined,

      // Featured filter
      isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,

      // Difficulty level filter (Requirement 9.4)
      difficultyLevel: (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null) || undefined,

      // Category tags filter (Requirement 9.2)
      categoryTags: searchParams.get('categories')?.split(',').filter(Boolean) || undefined,

      // AI models filter (Requirement 9.3)
      aiModels: searchParams.get('aiModels')?.split(',').filter(Boolean) || undefined,

      // Condition tags filter (Requirement 9.4, 9.5)
      conditionTags: searchParams.get('conditions')?.split(',').filter(Boolean) || undefined,

      // Sort option (Requirement 9.7)
      sortBy: (searchParams.get('sortBy') as 'latest' | 'popular' | 'expiring_soon' | 'highest_credit' | null) || 'latest',

      // Pagination
      limit: searchParams.get('limit') ? Number.parseInt(searchParams.get('limit')!, 10) : 20,
      offset: searchParams.get('offset') ? Number.parseInt(searchParams.get('offset')!, 10) : 0,

      // By default, exclude expired and deleted campaigns
      includeExpired: searchParams.get('includeExpired') === 'true',
      includeDeleted: false,
    };

    // Validate pagination parameters
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 100',
        },
        { status: 400 },
      );
    }

    if (filters.offset && filters.offset < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offset must be non-negative',
        },
        { status: 400 },
      );
    }

    // Apply filters (Requirement 9.8: Multi-filter conjunction - AND logic)
    const campaigns = await getCampaigns(filters);

    logger.info(`Filter applied: ${JSON.stringify(filters)} - ${campaigns.length} results`);

    return NextResponse.json({
      success: true,
      data: {
        filters,
        count: campaigns.length,
        campaigns,
      },
    });
  } catch (error) {
    logger.error`Error filtering campaigns: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to filter campaigns',
      },
      { status: 500 },
    );
  }
}
