import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { rejectCampaign } from '@/services/CampaignService';

/**
 * POST /api/admin/campaigns/[id]/reject
 * Reject a pending campaign
 * Validates: Requirements 4.6
 */
export async function POST(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const campaign = await rejectCampaign(params.id);

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Campaign not found',
            statusCode: 404,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message: 'Campaign rejected successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Campaign rejection error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          statusCode: 500,
        },
      },
      { status: 500 },
    );
  }
}
