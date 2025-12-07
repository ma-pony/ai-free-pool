import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import {
  deleteConditionTag,
  getConditionTagById,
  updateConditionTag,
} from '@/services/ConditionTagService';
import { UpdateConditionTagSchema } from '@/validations/CampaignValidation';

/**
 * GET /api/condition-tags/[id]
 * Get a single condition tag by ID
 * Validates: Requirements 2.7
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tag = await getConditionTagById(id);

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Condition tag not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    logger.error`Error fetching condition tag: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch condition tag',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/condition-tags/[id]
 * Update a condition tag (admin only)
 * Validates: Requirements 2.7
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    // For now, any authenticated user can update condition tags

    const { id } = await params;
    const json = await request.json();
    const parse = UpdateConditionTagSchema.safeParse(json);

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

    const tag = await updateConditionTag(id, parse.data);

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Condition tag not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Condition tag updated: ${tag.name} (${tag.id}) by user ${userId}`);

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    logger.error`Error updating condition tag: ${error}`;

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
        error: 'Failed to update condition tag',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/condition-tags/[id]
 * Delete a condition tag (admin only)
 * Validates: Requirements 2.7
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    // For now, any authenticated user can delete condition tags

    const { id } = await params;
    const success = await deleteConditionTag(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Condition tag not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Condition tag deleted: ${id} by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Condition tag deleted successfully',
    });
  } catch (error) {
    logger.error`Error deleting condition tag: ${error}`;

    // Handle foreign key constraint error
    if (error instanceof Error && error.message.includes('associated with')) {
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
        error: 'Failed to delete condition tag',
      },
      { status: 500 },
    );
  }
}
