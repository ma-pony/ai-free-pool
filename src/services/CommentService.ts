import { clerkClient } from '@clerk/nextjs/server';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { campaigns, comments } from '@/models/Schema';

export type CommentUser = {
  id: string;
  username: string;
  imageUrl?: string;
};

export type Comment = {
  id: string;
  campaignId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  isMarkedUseful: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  user?: CommentUser;
  replies?: Comment[];
};

export type CreateCommentInput = {
  campaignId: string;
  userId: string;
  content: string;
  parentId?: string | null;
};

export type UpdateCommentInput = {
  content?: string;
  isMarkedUseful?: boolean;
};

/**
 * Enrich comments with user data from Clerk
 */
async function enrichCommentsWithUserData(commentList: Comment[]): Promise<Comment[]> {
  // Get unique user IDs
  const userIds = new Set<string>();
  const collectUserIds = (comments: Comment[]) => {
    for (const comment of comments) {
      userIds.add(comment.userId);
      if (comment.replies && comment.replies.length > 0) {
        collectUserIds(comment.replies);
      }
    }
  };
  collectUserIds(commentList);

  // Fetch user data from Clerk
  const userMap = new Map<string, CommentUser>();
  try {
    const client = await clerkClient();
    const userPromises = Array.from(userIds).map(async (userId) => {
      try {
        const user = await client.users.getUser(userId);
        return {
          id: userId,
          username: user.username || user.fullName || user.firstName || 'Anonymous',
          imageUrl: user.imageUrl,
        };
      } catch (error) {
        // If user not found, return default
        return {
          id: userId,
          username: 'Anonymous',
          imageUrl: undefined,
        };
      }
    });

    const users = await Promise.all(userPromises);
    for (const user of users) {
      userMap.set(user.id, user);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

  // Attach user data to comments
  const attachUserData = (comments: Comment[]): Comment[] => {
    return comments.map((comment) => {
      const user = userMap.get(comment.userId);
      return {
        ...comment,
        user,
        replies: comment.replies ? attachUserData(comment.replies) : [],
      };
    });
  };

  return attachUserData(commentList);
}

/**
 * Get all comments for a campaign
 * Validates: Requirements 6.1, 6.4
 */
export async function getCommentsByCampaign(campaignId: string): Promise<Comment[]> {
  // Get all non-deleted comments for the campaign
  const allComments = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.campaignId, campaignId),
        isNull(comments.deletedAt),
      ),
    )
    .orderBy(desc(comments.createdAt));

  // Build a nested structure with replies
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create all comment objects
  for (const comment of allComments) {
    const commentObj: Comment = {
      id: comment.id,
      campaignId: comment.campaignId,
      userId: comment.userId,
      parentId: comment.parentId,
      content: comment.content,
      isMarkedUseful: comment.isMarkedUseful,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt,
      replies: [],
    };
    commentMap.set(comment.id, commentObj);
  }

  // Second pass: build the tree structure
  for (const comment of commentMap.values()) {
    if (comment.parentId) {
      // This is a reply, add it to parent's replies
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies!.push(comment);
      }
    } else {
      // This is a root comment
      rootComments.push(comment);
    }
  }

  // Enrich with user data (Requirement 6.4)
  return enrichCommentsWithUserData(rootComments);
}

/**
 * Get a single comment by ID
 * Validates: Requirements 6.1
 */
export async function getCommentById(id: string): Promise<Comment | null> {
  const result = await db
    .select()
    .from(comments)
    .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const comment = result[0]!;
  return {
    id: comment.id,
    campaignId: comment.campaignId,
    userId: comment.userId,
    parentId: comment.parentId,
    content: comment.content,
    isMarkedUseful: comment.isMarkedUseful,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    deletedAt: comment.deletedAt,
  };
}

/**
 * Create a new comment
 * Validates: Requirements 6.2, 6.3
 */
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  // Verify campaign exists and is not deleted
  const campaign = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), isNull(campaigns.deletedAt)))
    .limit(1);

  if (campaign.length === 0) {
    throw new Error(`Campaign with ID "${input.campaignId}" not found`);
  }

  // If this is a reply, verify parent comment exists and belongs to same campaign
  // Validates: Requirements 6.8, Property 12
  if (input.parentId) {
    const parentComment = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, input.parentId), isNull(comments.deletedAt)))
      .limit(1);

    if (parentComment.length === 0) {
      throw new Error(`Parent comment with ID "${input.parentId}" not found`);
    }

    // Verify parent belongs to the same campaign (Property 12)
    if (parentComment[0]!.campaignId !== input.campaignId) {
      throw new Error('Parent comment must belong to the same campaign');
    }
  }

  // Create comment (Requirement 6.3)
  const [comment] = await db
    .insert(comments)
    .values({
      campaignId: input.campaignId,
      userId: input.userId,
      content: input.content,
      parentId: input.parentId || null,
      isMarkedUseful: false,
    })
    .returning();

  return {
    id: comment!.id,
    campaignId: comment!.campaignId,
    userId: comment!.userId,
    parentId: comment!.parentId,
    content: comment!.content,
    isMarkedUseful: comment!.isMarkedUseful,
    createdAt: comment!.createdAt,
    updatedAt: comment!.updatedAt,
    deletedAt: comment!.deletedAt,
  };
}

/**
 * Update a comment
 * Validates: Requirements 6.4
 */
export async function updateComment(
  id: string,
  userId: string,
  input: UpdateCommentInput,
): Promise<Comment | null> {
  // Check if comment exists and is not deleted
  const existing = await getCommentById(id);
  if (!existing) {
    return null;
  }

  // Verify user owns the comment (only owner can edit content)
  if (input.content !== undefined && existing.userId !== userId) {
    throw new Error('Only the comment author can edit the content');
  }

  // Update comment
  const [updated] = await db
    .update(comments)
    .set({
      ...(input.content !== undefined && { content: input.content }),
      ...(input.isMarkedUseful !== undefined && { isMarkedUseful: input.isMarkedUseful }),
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  if (!updated) {
    return null;
  }

  return {
    id: updated.id,
    campaignId: updated.campaignId,
    userId: updated.userId,
    parentId: updated.parentId,
    content: updated.content,
    isMarkedUseful: updated.isMarkedUseful,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    deletedAt: updated.deletedAt,
  };
}

/**
 * Delete a comment (soft delete)
 * Validates: Requirements 6.4
 */
export async function deleteComment(id: string, userId: string): Promise<boolean> {
  const existing = await getCommentById(id);
  if (!existing) {
    return false;
  }

  // Verify user owns the comment
  if (existing.userId !== userId) {
    throw new Error('Only the comment author can delete the comment');
  }

  // Soft delete by setting deletedAt timestamp
  const result = await db
    .update(comments)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  return result.length > 0;
}

/**
 * Mark a comment as useful (admin only)
 * Validates: Requirements 6.9
 */
export async function markCommentAsUseful(id: string, isUseful: boolean): Promise<Comment | null> {
  const existing = await getCommentById(id);
  if (!existing) {
    return null;
  }

  const [updated] = await db
    .update(comments)
    .set({
      isMarkedUseful: isUseful,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, id))
    .returning();

  if (!updated) {
    return null;
  }

  return {
    id: updated.id,
    campaignId: updated.campaignId,
    userId: updated.userId,
    parentId: updated.parentId,
    content: updated.content,
    isMarkedUseful: updated.isMarkedUseful,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    deletedAt: updated.deletedAt,
  };
}

/**
 * Get all comments by a user
 */
export async function getCommentsByUser(userId: string): Promise<Comment[]> {
  const result = await db
    .select()
    .from(comments)
    .where(and(eq(comments.userId, userId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.createdAt));

  return result.map(comment => ({
    id: comment.id,
    campaignId: comment.campaignId,
    userId: comment.userId,
    parentId: comment.parentId,
    content: comment.content,
    isMarkedUseful: comment.isMarkedUseful,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    deletedAt: comment.deletedAt,
  }));
}

/**
 * Get comment count for a campaign
 */
export async function getCommentCount(campaignId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(
      and(
        eq(comments.campaignId, campaignId),
        isNull(comments.deletedAt),
      ),
    );

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Get comment count for a user
 */
export async function getUserCommentCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments)
    .where(
      and(
        eq(comments.userId, userId),
        isNull(comments.deletedAt),
      ),
    );

  return result.length > 0 ? Number(result[0]!.count) : 0;
}
