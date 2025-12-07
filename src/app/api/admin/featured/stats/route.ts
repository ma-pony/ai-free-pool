import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getAggregatedStats,
  getCampaignStats,
} from '@/services/FeaturedCampaignService';

/**
 * GET /api/admin/featured/stats
 * Get statistics for featured campaigns
 * Validates: Requirements 12.5
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check

    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    // If campaignId is provided, get stats for that campaign
    if (campaignId) {
      const stats = await getCampaignStats(campaignId, startDate, endDate);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Otherwise, get aggregated stats for all featured campaigns
    const aggregatedStats = await getAggregatedStats(startDate, endDate);
    return NextResponse.json({
      success: true,
      data: aggregatedStats,
    });
  } catch (error) {
    console.error('Error fetching featured campaign stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 },
    );
  }
}
