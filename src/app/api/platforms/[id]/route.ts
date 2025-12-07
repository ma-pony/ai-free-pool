import type { NextRequest } from 'next/server';
import type { UpdatePlatformInput } from '@/validations/PlatformValidation';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import {
  deletePlatform,
  getPlatformById,
  updatePlatform,
} from '@/services/PlatformService';
import { UpdatePlatformSchema } from '@/validations/PlatformValidation';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/platforms/[id]
 * Get a single platform by ID
 * Validates: Requirements 1.4
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const platform = await getPlatformById(id);

    if (!platform) {
      return NextResponse.json(
        {
          success: false,
          error: 'Platform not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: platform,
    });
  } catch (error) {
    logger.error`Error fetching platform: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch platform',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/platforms/[id]
 * Update a platform (admin only)
 * Validates: Requirements 1.5
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
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

    const { id } = await context.params;
    const json = await request.json();
    const parse = UpdatePlatformSchema.safeParse(json);

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

    // Cast to remove null from the type
    const updateData = parse.data as UpdatePlatformInput;
    const platform = await updatePlatform(id, updateData);

    if (!platform) {
      return NextResponse.json(
        {
          success: false,
          error: 'Platform not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Platform updated: ${platform.name} (${platform.id})`);

    return NextResponse.json({
      success: true,
      data: platform,
    });
  } catch (error) {
    logger.error`Error updating platform: ${error}`;

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
        error: 'Failed to update platform',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/platforms/[id]
 * Delete a platform (soft delete by setting status to inactive)
 * Admin only
 * Validates: Requirements 1.1
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
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

    const { id } = await context.params;
    const success = await deletePlatform(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Platform not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Platform deleted (soft): ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Platform deleted successfully',
    });
  } catch (error) {
    logger.error`Error deleting platform: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete platform',
      },
      { status: 500 },
    );
  }
}
