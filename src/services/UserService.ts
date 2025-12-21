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
 * Optimized: Parallel queries instead of sequential
 */
export async function getUserContributionStats(userId: string): Promise<UserContributionStats> {
  try {
    // Execute all queries in parallel
    const [campaignsResult, reactionsResult, commentsResult, bookmarksResult] = await Promise.all([
      db.select({ count: count() }).from(campaigns).where(eq(campaigns.submittedBy, userId)),
      db.select({ count: count() }).from(reactions).where(eq(reactions.userId, userId)),
      db.select({ count: count() }).from(comments).where(eq(comments.userId, userId)),
      db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.userId, userId)),
    ]);

    return {
      submittedCampaigns: campaignsResult[0]?.count ?? 0,
      totalReactions: reactionsResult[0]?.count ?? 0,
      totalComments: commentsResult[0]?.count ?? 0,
      totalBookmarks: bookmarksResult[0]?.count ?? 0,
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
 * Optimized: Uses batch user lookup instead of N+1 individual queries
 */
export async function getUserDisplayNames(userIds: string[]): Promise<Map<string, string>> {
  const displayNames = new Map<string, string>();

  if (userIds.length === 0) {
    return displayNames;
  }

  try {
    const client = await clerkClient();

    // Use Clerk's batch user list API instead of individual getUser calls
    const { data: users } = await client.users.getUserList({
      userId: userIds,
      limit: userIds.length,
    });

    for (const user of users) {
      // Priority: username > full name > first name > email prefix > 'Anonymous'
      let displayName = 'Anonymous';

      if (user.username) {
        displayName = user.username;
      } else if (user.firstName && user.lastName) {
        displayName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstName) {
        displayName = user.firstName;
      } else if (user.emailAddresses && user.emailAddresses.length > 0) {
        const email = user.emailAddresses[0]?.emailAddress;
        if (email) {
          displayName = email.split('@')[0] || 'User';
        }
      }

      displayNames.set(user.id, displayName);
    }

    // Set default for any users not found
    for (const userId of userIds) {
      if (!displayNames.has(userId)) {
        displayNames.set(userId, 'Anonymous');
      }
    }
  } catch (error) {
    console.error('Failed to get user display names:', error);
    // Set defaults for all users on error
    for (const userId of userIds) {
      displayNames.set(userId, 'Anonymous');
    }
  }

  return displayNames;
}
