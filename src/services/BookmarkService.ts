import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { bookmarks, campaigns } from '@/models/Schema';

export type Bookmark = {
  id: string;
  userId: string;
  campaignId: string;
  createdAt: Date;
};

export type BookmarkWithCampaign = Bookmark & {
  campaign: {
    id: string;
    slug: string;
    status: string;
    endDate: Date | null;
    isFeatured: boolean;
    platform: {
      id: string;
      name: string;
      logo: string | null;
    };
    translations: Array<{
      locale: string;
      title: string;
      description: string | null;
    }>;
  };
};

export type CreateBookmarkInput = {
  userId: string;
  campaignId: string;
};

/**
 * Get all bookmarks for a user
 * Validates: Requirements 7.5
 */
export async function getBookmarksByUser(userId: string): Promise<BookmarkWithCampaign[]> {
  const result = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    with: {
      campaign: {
        with: {
          platform: true,
          translations: true,
        },
      },
    },
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
  });

  // Filter out bookmarks for deleted campaigns
  return result.filter(b => b.campaign && !(b.campaign as any).deletedAt) as BookmarkWithCampaign[];
}

/**
 * Get a specific bookmark
 * Validates: Requirements 7.1
 */
export async function getBookmark(
  userId: string,
  campaignId: string,
): Promise<Bookmark | null> {
  const result = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.campaignId, campaignId)))
    .limit(1);

  return result.length > 0 ? (result[0] as Bookmark) : null;
}

/**
 * Check if a user has bookmarked a campaign
 * Validates: Requirements 7.3
 */
export async function hasBookmarked(userId: string, campaignId: string): Promise<boolean> {
  const bookmark = await getBookmark(userId, campaignId);
  return bookmark !== null;
}

/**
 * Create a bookmark
 * Validates: Requirements 7.1, 7.2, Property 14
 * Only one bookmark per user-campaign combination (enforced by unique constraint)
 */
export async function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  // Verify campaign exists and is not deleted
  const campaign = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), isNull(campaigns.deletedAt)))
    .limit(1);

  if (campaign.length === 0) {
    throw new Error(`Campaign with ID "${input.campaignId}" not found`);
  }

  // Check if bookmark already exists
  const existing = await getBookmark(input.userId, input.campaignId);
  if (existing) {
    // Return existing bookmark (idempotent operation)
    return existing;
  }

  // Create new bookmark
  const [bookmark] = await db
    .insert(bookmarks)
    .values({
      userId: input.userId,
      campaignId: input.campaignId,
    })
    .returning();

  return bookmark as Bookmark;
}

/**
 * Remove a bookmark
 * Validates: Requirements 7.4
 */
export async function removeBookmark(userId: string, campaignId: string): Promise<boolean> {
  const result = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.campaignId, campaignId)))
    .returning();

  return result.length > 0;
}

/**
 * Toggle bookmark (add if not exists, remove if exists)
 * Validates: Requirements 7.1, 7.4
 */
export async function toggleBookmark(
  userId: string,
  campaignId: string,
): Promise<{ bookmarked: boolean; bookmark: Bookmark | null }> {
  const existing = await getBookmark(userId, campaignId);

  if (existing) {
    // Remove bookmark
    await removeBookmark(userId, campaignId);
    return { bookmarked: false, bookmark: null };
  }

  // Create bookmark
  const bookmark = await createBookmark({ userId, campaignId });
  return { bookmarked: true, bookmark };
}

/**
 * Get bookmark count for a campaign
 */
export async function getBookmarkCount(campaignId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookmarks)
    .where(eq(bookmarks.campaignId, campaignId));

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Get total bookmark count for a user
 * Validates: Requirements 17.7
 */
export async function getUserBookmarkCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Get bookmarks with expired status
 * Validates: Requirements 7.6
 */
export async function getBookmarksWithExpiredStatus(
  userId: string,
): Promise<
  Array<{
    bookmark: Bookmark;
    isExpired: boolean;
  }>
> {
  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    with: {
      campaign: {
        columns: {
          id: true,
          status: true,
          endDate: true,
        },
      },
    },
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
  });

  return userBookmarks
    .filter(b => b.campaign && !(b.campaign as any).deletedAt)
    .map((b) => {
      const campaign = b.campaign as { id: string; status: string; endDate: Date | null };
      return {
        bookmark: {
          id: b.id,
          userId: b.userId,
          campaignId: b.campaignId,
          createdAt: b.createdAt,
        },
        isExpired:
          campaign.status === 'expired'
          || (campaign.endDate !== null && new Date(campaign.endDate) < new Date()),
      };
    });
}

/**
 * Remove all bookmarks for a campaign (used when campaign is deleted)
 */
export async function removeAllBookmarksForCampaign(campaignId: string): Promise<number> {
  const result = await db
    .delete(bookmarks)
    .where(eq(bookmarks.campaignId, campaignId))
    .returning();

  return result.length;
}

/**
 * Get all bookmarked campaign IDs for a user (useful for batch status checking)
 * This is optimized to avoid N+1 queries when displaying campaign lists
 */
export async function getBookmarkedCampaignIds(userId: string): Promise<string[]> {
  const result = await db
    .select({ campaignId: bookmarks.campaignId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));

  return result.map(r => r.campaignId);
}
