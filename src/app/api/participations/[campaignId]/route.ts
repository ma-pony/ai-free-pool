import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getParticipation,
  removeParticipation,
  toggleParticipation,
} from '@/services/ParticipationService';

/**
 * GET /api/participations/[campaignId] - Check if user has participated in a campaign
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    // Parallel: auth + params
    const [{ userId }, { campaignId }] = await Promise.all([auth(), params]);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participation = await getParticipation(userId, campaignId);

    return NextResponse.json({
      success: true,
      data: {
        participated: participation !== null,
        participation,
      },
    });
  } catch (error) {
    console.error('Error checking participation:', error);
    return NextResponse.json(
      { error: 'Failed to check participation' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/participations/[campaignId] - Remove a participation record
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    // Parallel: auth + params
    const [{ userId }, { campaignId }] = await Promise.all([auth(), params]);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const removed = await removeParticipation(userId, campaignId);

    if (!removed) {
      return NextResponse.json({ error: 'Participation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Participation removed successfully',
    });
  } catch (error) {
    console.error('Error removing participation:', error);
    return NextResponse.json(
      { error: 'Failed to remove participation' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/participations/[campaignId] - Toggle participation status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    // Parallel: auth + params + body parsing
    const [{ userId }, { campaignId }, bodyResult] = await Promise.all([
      auth(),
      params,
      request.json().catch(() => ({})),
    ]);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = bodyResult?.notes as string | undefined;
    const result = await toggleParticipation(userId, campaignId, notes);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error toggling participation:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to toggle participation' },
      { status: 500 },
    );
  }
}
