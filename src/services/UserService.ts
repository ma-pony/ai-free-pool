import { clerkClient } from '@clerk/nextjs/server';
import { count, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { bookmarks, campaigns, comments, reactions } from '@/models/Schema';

/**
 * User contribution statistics
 */
export type UserContributionStats = {
  submittedCampaigns: number;
  totalReactions: number;
  totalComments: number;
  totalBookmarks: number;
};

/**
 * Get user contribution statistics
 */
export async function getUserContributionStats(userId: string): Promise<UserContributionStats> {
  try {
    // Get submitted campaigns count
    const [campaignsResult] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.submittedBy, userId));

    // Get reactions count
    const [reactionsResult] = await db
      .select({ count: count() })
      .from(reactions)
      .where(eq(reactions.userId, userId));

    // Get comments count
    const [commentsResult] = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.userId, userId));

    // Get bookmarks count
    const [bookmarksResult] = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    return {
      submittedCampaigns: campaignsResult?.count ?? 0,
      totalReactions: reactionsResult?.count ?? 0,
      totalComments: commentsResult?.count ?? 0,
      totalBookmarks: bookmarksResult?.count ?? 0,
    };
  } catch (error) {
    console.error('Failed to get user contribution stats:', error);
    return {
      submittedCampaigns: 0,
      totalReactions: 0,
      totalComments: 0,
      totalBookmarks: 0,
    };
  }
}

/**
 * Get user display name by user ID
 * Returns username, full name, or email prefix as fallback
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Priority: username > full name > first name > email prefix > 'Anonymous'
    if (user.username) {
      return user.username;
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.emailAddresses && user.emailAddresses.length > 0) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (email) {
        // Return email prefix (before @) for privacy
        return email.split('@')[0] || 'User';
      }
    }

    return 'Anonymous';
  } catch (error) {
    console.error('Failed to get user display name:', error);
    return 'Anonymous';
  }
}

/**
 * Get multiple users' display names
 * Returns a map of userId -> displayName
 */
export async function getUserDisplayNames(userIds: string[]): Promise<Map<string, string>> {
  const displayNames = new Map<string, string>();

  // Fetch all users in parallel
  const promises = userIds.map(async (userId) => {
    const displayName = await getUserDisplayName(userId);
    displayNames.set(userId, displayName);
  });

  await Promise.all(promises);

  return displayNames;
}
