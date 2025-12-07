import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { createCampaign, getCampaigns } from '@/services/CampaignService';
import { CreateCampaignSchema } from '@/validations/CampaignValidation';

/**
 * GET /api/campaigns
 * List all campaigns with optional filters
 * Validates: Requirements 2.1-2.6
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as
      | 'pending'
      | 'published'
      | 'rejected'
      | 'expired'
      | null;
    const platformId = searchParams.get('platformId');
    const search = searchParams.get('search');
    const isFeatured = searchParams.get('isFeatured');
    const difficultyLevel = searchParams.get('difficultyLevel') as
      | 'easy'
      | 'medium'
      | 'hard'
      | null;
    const submittedBy = searchParams.get('submittedBy');
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // New filter parameters (Requirements 9.2-9.7)
    const platformIds = searchParams.get('platforms')?.split(',').filter(Boolean);
    const categoryTags = searchParams.get('categories')?.split(',').filter(Boolean);
    const aiModels = searchParams.get('aiModels')?.split(',').filter(Boolean);
    const conditionTags = searchParams.get('conditions')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') as 'latest' | 'popular' | 'expiring_soon' | 'highest_credit' | null;
    const limit = searchParams.get('limit') ? Number.parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? Number.parseInt(searchParams.get('offset')!, 10) : undefined;

    const filters = {
      ...(status && { status }),
      ...(platformId && { platformId }),
      ...(platformIds && { platformIds }),
      ...(search && { search }),
      ...(isFeatured !== null && { isFeatured: isFeatured === 'true' }),
      ...(difficultyLevel && { difficultyLevel }),
      ...(submittedBy && { submittedBy }),
      ...(categoryTags && { categoryTags }),
      ...(aiModels && { aiModels }),
      ...(conditionTags && { conditionTags }),
      ...(sortBy && { sortBy }),
      ...(limit && { limit }),
      ...(offset !== undefined && { offset }),
      includeExpired,
      includeDeleted,
    };

    const campaigns = await getCampaigns(filters);

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    logger.error`Error fetching campaigns: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign (user submission or admin)
 * Validates: Requirements 2.1, 4.1, 4.2, 4.3, 4.4
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 },
      );
    }

    const json = await request.json();
    const parse = CreateCampaignSchema.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: z.treeifyError(parse.error),
        },
        { status: 422 },
      );
    }

    // Set submittedBy to current user if not provided
    const campaignData = {
      ...parse.data,
      submittedBy: parse.data.submittedBy || userId,
    };

    const campaign = await createCampaign(campaignData);

    logger.info(`Campaign created: ${campaign.slug} (${campaign.id}) by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error`Error creating campaign: ${error}`;

    // Handle duplicate slug error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 },
      );
    }

    // Handle platform not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create campaign',
      },
      { status: 500 },
    );
  }
}
