import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { commentReactions, comments } from '@/models/Schema';

export type CommentReaction = {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
};

export type CommentReactionStats = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

export type CreateCommentReactionInput = {
  commentId: string;
  userId: string;
  emoji: string;
};

/**
 * Get all reactions for a comment with aggregated counts
 * Validates: Requirements 6.6
 */
export async function getCommentReactions(
  commentId: string,
  userId?: string,
): Promise<CommentReactionStats[]> {
  // Get all reactions for the comment
  const reactions = await db
    .select()
    .from(commentReactions)
    .where(eq(commentReactions.commentId, commentId));

  // Aggregate by emoji
  const emojiMap = new Map<string, { count: number; userReacted: boolean }>();

  for (const reaction of reactions) {
    const existing = emojiMap.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      if (userId && reaction.userId === userId) {
        existing.userReacted = true;
      }
    } else {
      emojiMap.set(reaction.emoji, {
        count: 1,
        userReacted: userId ? reaction.userId === userId : false,
      });
    }
  }

  // Convert to array
  return Array.from(emojiMap.entries()).map(([emoji, data]) => ({
    emoji,
    count: data.count,
    userReacted: data.userReacted,
  }));
}

/**
 * Add an emoji reaction to a comment
 * Validates: Requirements 6.5, Property 13
 */
export async function addCommentReaction(
  input: CreateCommentReactionInput,
): Promise<CommentReaction> {
  // Verify comment exists and is not deleted
  const comment = await db
    .select()
    .from(comments)
    .where(and(eq(comments.id, input.commentId), isNull(comments.deletedAt)))
    .limit(1);

  if (comment.length === 0) {
    throw new Error(`Comment with ID "${input.commentId}" not found`);
  }

  // Validate emoji (basic validation - should be 1-10 characters)
  if (!input.emoji || input.emoji.length === 0 || input.emoji.length > 10) {
    throw new Error('Invalid emoji');
  }

  // Check if user already reacted with this emoji (Property 13)
  const existing = await db
    .select()
    .from(commentReactions)
    .where(
      and(
        eq(commentReactions.commentId, input.commentId),
        eq(commentReactions.userId, input.userId),
        eq(commentReactions.emoji, input.emoji),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // User already reacted with this emoji, return existing
    return {
      id: existing[0]!.id,
      commentId: existing[0]!.commentId,
      userId: existing[0]!.userId,
      emoji: existing[0]!.emoji,
      createdAt: existing[0]!.createdAt,
    };
  }

  // Create reaction (Requirement 6.5)
  const [reaction] = await db
    .insert(commentReactions)
    .values({
      commentId: input.commentId,
      userId: input.userId,
      emoji: input.emoji,
    })
    .returning();

  return {
    id: reaction!.id,
    commentId: reaction!.commentId,
    userId: reaction!.userId,
    emoji: reaction!.emoji,
    createdAt: reaction!.createdAt,
  };
}

/**
 * Remove an emoji reaction from a comment
 * Validates: Requirements 6.7
 */
export async function removeCommentReaction(
  commentId: string,
  userId: string,
  emoji: string,
): Promise<boolean> {
  // Delete the reaction
  const result = await db
    .delete(commentReactions)
    .where(
      and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.userId, userId),
        eq(commentReactions.emoji, emoji),
      ),
    )
    .returning();

  return result.length > 0;
}

/**
 * Get all reactions by a user
 */
export async function getReactionsByUser(userId: string): Promise<CommentReaction[]> {
  const reactions = await db
    .select()
    .from(commentReactions)
    .where(eq(commentReactions.userId, userId));

  return reactions.map(reaction => ({
    id: reaction.id,
    commentId: reaction.commentId,
    userId: reaction.userId,
    emoji: reaction.emoji,
    createdAt: reaction.createdAt,
  }));
}

/**
 * Get reaction count for a comment
 */
export async function getCommentReactionCount(commentId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(commentReactions)
    .where(eq(commentReactions.commentId, commentId));

  return result.length > 0 ? Number(result[0]!.count) : 0;
}

/**
 * Check if user has reacted to a comment with a specific emoji
 */
export async function hasUserReacted(
  commentId: string,
  userId: string,
  emoji: string,
): Promise<boolean> {
  const result = await db
    .select()
    .from(commentReactions)
    .where(
      and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.userId, userId),
        eq(commentReactions.emoji, emoji),
      ),
    )
    .limit(1);

  return result.length > 0;
}
