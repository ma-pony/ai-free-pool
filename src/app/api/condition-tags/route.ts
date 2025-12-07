import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { createConditionTag, getConditionTags } from '@/services/ConditionTagService';
import { CreateConditionTagSchema } from '@/validations/CampaignValidation';

/**
 * GET /api/condition-tags
 * List all condition tags with optional filters
 * Validates: Requirements 2.7, 2.12
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'requirement' | 'benefit' | null;
    const search = searchParams.get('search');

    const filters = {
      ...(type && { type }),
      ...(search && { search }),
    };

    const tags = await getConditionTags(filters);

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    logger.error`Error fetching condition tags: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch condition tags',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/condition-tags
 * Create a new condition tag (admin only)
 * Validates: Requirements 2.7
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

    // TODO: Add admin role check when role system is implemented
    // For now, any authenticated user can create condition tags

    const json = await request.json();
    const parse = CreateConditionTagSchema.safeParse(json);

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

    const tag = await createConditionTag(parse.data);

    logger.info(`Condition tag created: ${tag.name} (${tag.id}) by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: tag,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error`Error creating condition tag: ${error}`;

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
        error: 'Failed to create condition tag',
      },
      { status: 500 },
    );
  }
}
