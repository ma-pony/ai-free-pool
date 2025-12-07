import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import { deleteTag, getTagById, updateTag } from '@/services/TagService';
import { UpdateTagSchema } from '@/validations/CampaignValidation';

/**
 * GET /api/tags/[id]
 * Get a single tag by ID
 * Validates: Requirements 10.1
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tag = await getTagById(id);

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    logger.error`Error fetching tag: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tag',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/tags/[id]
 * Update a tag (admin only)
 * Validates: Requirements 10.1, 10.2
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const json = await request.json();
    const parse = UpdateTagSchema.safeParse(json);

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

    const tag = await updateTag(id, parse.data);

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Tag updated: ${tag.name} (${tag.id}) by user ${userId}`);

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    logger.error`Error updating tag: ${error}`;

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
        error: 'Failed to update tag',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/tags/[id]
 * Delete a tag (admin only)
 * Validates: Requirements 10.1
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

    const { id } = await params;
    const success = await deleteTag(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Tag deleted: ${id} by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    logger.error`Error deleting tag: ${error}`;

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
        error: 'Failed to delete tag',
      },
      { status: 500 },
    );
  }
}
