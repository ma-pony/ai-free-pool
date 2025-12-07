import { auth } from '@clerk/nextjs/server';
import { and, count, eq, gte, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { campaigns, comments, reactions } from '@/models/Schema';

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 },
      );
    }

    // TODO: Add admin role check
    // For now, allow all authenticated users

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch statistics
    const [
      totalCampaignsResult,
      todayCampaignsResult,
      pendingCampaignsResult,
      verificationNeededResult,
      totalCommentsResult,
      todayCommentsResult,
      totalReactionsResult,
      todayReactionsResult,
    ] = await Promise.all([
      // Total campaigns
      db.select({ count: count() }).from(campaigns).where(isNull(campaigns.deletedAt)),

      // Today's campaigns
      db.select({ count: count() }).from(campaigns).where(
        and(
          isNull(campaigns.deletedAt),
          gte(campaigns.createdAt, today),
        ),
      ),

      // Pending campaigns
      db.select({ count: count() }).from(campaigns).where(
        and(
          eq(campaigns.status, 'pending'),
          isNull(campaigns.deletedAt),
        ),
      ),

      // Campaigns needing verification (status = 'published' but needs verification flag)
      // For now, we'll use a simple count of campaigns with status 'published'
      // In a real implementation, you'd have a needsVerification flag
      db.select({ count: count() }).from(campaigns).where(
        and(
          eq(campaigns.status, 'published'),
          isNull(campaigns.deletedAt),
        ),
      ).then(() => ({ count: 0 })), // Placeholder

      // Total comments
      db.select({ count: count() }).from(comments).where(isNull(comments.deletedAt)),

      // Today's comments
      db.select({ count: count() }).from(comments).where(
        and(
          isNull(comments.deletedAt),
          gte(comments.createdAt, today),
        ),
      ),

      // Total reactions
      db.select({ count: count() }).from(reactions),

      // Today's reactions
      db.select({ count: count() }).from(reactions).where(
        gte(reactions.createdAt, today),
      ),
    ]);

    // Get unique users count (from Clerk or a users table if you have one)
    // For now, we'll use a placeholder
    const totalUsers = 0; // TODO: Implement user count
    const todayUsers = 0; // TODO: Implement today's user count

    // Get recent activity
    // For now, we'll return empty array
    // In a real implementation, you'd fetch recent submissions, approvals, etc.
    const recentActivity: any[] = [];

    const stats = {
      totalCampaigns: totalCampaignsResult[0]?.count || 0,
      totalUsers,
      totalComments: totalCommentsResult[0]?.count || 0,
      pendingCampaigns: pendingCampaignsResult[0]?.count || 0,
      verificationNeeded: verificationNeededResult?.count || 0,
      totalReactions: totalReactionsResult[0]?.count || 0,
      todayCampaigns: todayCampaignsResult[0]?.count || 0,
      todayUsers,
      todayComments: todayCommentsResult[0]?.count || 0,
      todayReactions: todayReactionsResult[0]?.count || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch admin statistics',
        },
      },
      { status: 500 },
    );
  }
}
