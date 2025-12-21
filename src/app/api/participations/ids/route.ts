import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getParticipatedCampaignIds } from '@/services/ParticipationService';

/**
 * GET /api/participations/ids - Get all participated campaign IDs for the authenticated user
 * This endpoint is optimized for batch checking participation status
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignIds = await getParticipatedCampaignIds(userId);

    return NextResponse.json({
      success: true,
      data: campaignIds,
    });
  } catch (error) {
    console.error('Error fetching participation IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participation IDs' },
      { status: 500 },
    );
  }
}
