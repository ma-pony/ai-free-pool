import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { trackClick, trackImpression } from '@/services/FeaturedCampaignService';

/**
 * POST /api/featured/track
 * Track featured campaign impression or click
 * Validates: Requirements 12.4
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { campaignId, type, sessionId } = body;

    if (!campaignId || !type) {
      return NextResponse.json(
        { error: 'campaignId and type are required' },
        { status: 400 },
      );
    }

    if (type !== 'impression' && type !== 'click') {
      return NextResponse.json(
        { error: 'type must be either "impression" or "click"' },
        { status: 400 },
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for')
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Track the event
    if (type === 'impression') {
      await trackImpression(
        campaignId,
        userId || undefined,
        sessionId,
        ipAddress,
        userAgent,
      );
    } else {
      await trackClick(
        campaignId,
        userId || undefined,
        sessionId,
        ipAddress,
        userAgent,
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        tracked: type,
        campaignId,
      },
    });
  } catch (error) {
    console.error('Error tracking featured campaign event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 },
    );
  }
}
