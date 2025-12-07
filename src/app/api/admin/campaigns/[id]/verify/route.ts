import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { markCampaignAsVerified } from '@/services/ReactionService';

/**
 * POST /api/admin/campaigns/[id]/verify
 * Mark a campaign as verified (clear needsVerification flag)
 * Validates: Requirements 5.9
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { id } = await params;

    // Mark campaign as verified
    const success = await markCampaignAsVerified(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign marked as verified',
    });
  } catch (error) {
    console.error('Error marking campaign as verified:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark campaign as verified',
      },
      { status: 500 },
    );
  }
}
