import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logger } from '@/libs/Logger';
import {
  deleteCampaign,
  getCampaignById,
  updateCampaign,
} from '@/services/CampaignService';
import { UpdateCampaignSchema } from '@/validations/CampaignValidation';

/**
 * GET /api/campaigns/[id]
 * Get a single campaign by ID
 * Validates: Requirements 2.1
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    logger.error`Error fetching campaign: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaign',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/campaigns/[id]
 * Update a campaign (admin only)
 * Validates: Requirements 2.5
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Parallel: auth + params + body parsing
    const [{ userId }, { id }, json] = await Promise.all([
      auth(),
      params,
      request.json(),
    ]);

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
    // For now, any authenticated user can update campaigns

    const parse = UpdateCampaignSchema.safeParse(json);

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

    const campaign = await updateCampaign(id, parse.data);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Campaign updated: ${campaign.slug} (${campaign.id}) by user ${userId}`);

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    logger.error`Error updating campaign: ${error}`;

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
        error: 'Failed to update campaign',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Soft delete a campaign (admin only)
 * Validates: Requirements 2.6
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Parallel: auth + params
    const [{ userId }, { id }] = await Promise.all([auth(), params]);

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
    // For now, any authenticated user can delete campaigns

    const success = await deleteCampaign(id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        },
        { status: 404 },
      );
    }

    logger.info(`Campaign soft deleted: ${id} by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    logger.error`Error deleting campaign: ${error}`;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete campaign',
      },
      { status: 500 },
    );
  }
}
