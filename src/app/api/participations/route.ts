import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getParticipationsByUser,
  markAsParticipated,
} from '@/services/ParticipationService';

/**
 * GET /api/participations - Get all participations for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participations = await getParticipationsByUser(userId);

    return NextResponse.json({
      success: true,
      data: participations,
      count: participations.length,
    });
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participations' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/participations - Mark a campaign as participated
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, notes } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 },
      );
    }

    const participation = await markAsParticipated({
      userId,
      campaignId,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: participation,
    });
  } catch (error) {
    console.error('Error marking participation:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to mark participation' },
      { status: 500 },
    );
  }
}
