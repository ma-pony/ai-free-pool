import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { createPlatform, getPlatforms } from '@/services/PlatformService';
import { CreatePlatformSchema } from '@/validations/PlatformValidation';

/**
 * GET /api/platforms
 * List all platforms with optional filters
 * Validates: Requirements 1.3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search');

    // Handle 'all' status by not passing status filter
    const filters = {
      ...(statusParam && statusParam !== 'all' && { status: statusParam as 'active' | 'inactive' }),
      ...(search && { search }),
    };

    const platforms = await getPlatforms(filters);

    return NextResponse.json({
      success: true,
      data: platforms,
    });
  } catch (error) {
    logger.error`Error fetching platforms: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch platforms',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/platforms
 * Create a new platform (admin only)
 * Validates: Requirements 1.1
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
    // For now, any authenticated user can create platforms

    const json = await request.json();
    const parse = CreatePlatformSchema.safeParse(json);

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

    const platform = await createPlatform(parse.data);

    logger.info(`Platform created: ${platform.name} (${platform.id})`);

    return NextResponse.json(
      {
        success: true,
        data: platform,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating platform:', error);
    logger.error`Error creating platform: ${error}`;

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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create platform',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
