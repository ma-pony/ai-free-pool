import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCampaignById } from '@/services/CampaignService';
import { getCampaignsNeedingVerification } from '@/services/ReactionService';

/**
 * GET /api/admin/verification-needed
 * Get campaigns that need verification based on user reactions
 * Validates: Requirements 5.9
 */
export async function GET(_request: NextRequest) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get campaigns needing verification
    const needsVerification = await getCampaignsNeedingVerification();

    // Fetch full campaign details
    const campaignsWithDetails = await Promise.all(
      needsVerification.map(async (item) => {
        const campaign = await getCampaignById(item.campaignId);
        return {
          campaign,
          stats: item.stats,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: campaignsWithDetails,
    });
  } catch (error) {
    console.error('Error getting campaigns needing verification:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get campaigns needing verification',
      },
      { status: 500 },
    );
  }
}
