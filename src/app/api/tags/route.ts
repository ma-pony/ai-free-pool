import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { createTag, getTags, getTagsWithCounts } from '@/services/TagService';
import { CreateTagSchema } from '@/validations/CampaignValidation';

/**
 * GET /api/tags
 * List all tags with optional filters
 * Validates: Requirements 10.1, 10.3, 10.4
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'category' | 'ai_model' | 'general' | null;
    const search = searchParams.get('search');
    const hasActiveCampaigns = searchParams.get('hasActiveCampaigns') === 'true';
    const withCounts = searchParams.get('withCounts') === 'true';

    const filters = {
      ...(type && { type }),
      ...(search && { search }),
      ...(hasActiveCampaigns && { hasActiveCampaigns }),
    };

    // If withCounts is requested, return tags with campaign counts
    if (withCounts) {
      const tags = await getTagsWithCounts(filters);
      return NextResponse.json({
        success: true,
        data: tags,
      });
    }

    const tags = await getTags(filters);

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    logger.error`Error fetching tags: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tags
 * Create a new tag (admin only)
 * Validates: Requirements 10.1, 10.2
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Return error response
    }

    const { userId } = adminCheck;

    const json = await request.json();
    const parse = CreateTagSchema.safeParse(json);

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

    const tag = await createTag(parse.data);

    logger.info(`Tag created: ${tag.name} (${tag.id}) by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: tag,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error`Error creating tag: ${error}`;

    // Handle duplicate slug/name error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tag',
      },
      { status: 500 },
    );
  }
}
