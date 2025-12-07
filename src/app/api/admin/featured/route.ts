import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  expireFeaturedCampaigns,
  getFeaturedCampaigns,
  removeFeaturedCampaign,
  setFeaturedCampaign,
} from '@/services/CampaignService';
import { getAllFeaturedStats } from '@/services/FeaturedCampaignService';

/**
 * GET /api/admin/featured
 * Get all featured campaigns with statistics
 * Validates: Requirements 12.1, 12.5
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    // Get featured campaigns
    const campaigns = await getFeaturedCampaigns();

    // Get statistics for each campaign
    const stats = await getAllFeaturedStats(startDate, endDate);

    // Combine campaigns with their stats
    const campaignsWithStats = campaigns.map((campaign) => {
      const campaignStats = stats.find(s => s.campaignId === campaign.id);
      return {
        ...campaign,
        stats: campaignStats || {
          impressions: 0,
          clicks: 0,
          clickThroughRate: 0,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: campaignsWithStats,
    });
  } catch (error) {
    console.error('Error fetching featured campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured campaigns' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/featured
 * Set a campaign as featured
 * Validates: Requirements 12.1
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const body = await request.json();
    const { campaignId, featuredUntil } = body;

    if (!campaignId || !featuredUntil) {
      return NextResponse.json(
        { error: 'campaignId and featuredUntil are required' },
        { status: 400 },
      );
    }

    const campaign = await setFeaturedCampaign(
      campaignId,
      new Date(featuredUntil),
    );

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error('Error setting featured campaign:', error);

    if (error instanceof Error && error.message.includes('Only published campaigns')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to set featured campaign' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/featured
 * Remove featured status from a campaign
 * Validates: Requirements 12.1
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId is required' },
        { status: 400 },
      );
    }

    const campaign = await removeFeaturedCampaign(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error('Error removing featured campaign:', error);
    return NextResponse.json(
      { error: 'Failed to remove featured campaign' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/featured/expire
 * Manually trigger expiration of featured campaigns
 * Validates: Requirements 12.3
 */
export async function PATCH(_request: NextRequest) {
  try {
    // Check admin authentication
    const { requireAdmin } = await import('@/utils/ApiAdminAuth');
    const adminCheck = await requireAdmin();

    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const count = await expireFeaturedCampaigns();

    return NextResponse.json({
      success: true,
      data: {
        expiredCount: count,
      },
    });
  } catch (error) {
    console.error('Error expiring featured campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to expire featured campaigns' },
      { status: 500 },
    );
  }
}
