'use client';

import type { Comment } from './CommentItem';
import { CommentItem } from './CommentItem';

type CommentListProps = {
  comments: Comment[];
  onCommentAdded?: () => void;
};

/**
 * List of comments with nesting support
 * Validates: Requirements 6.1, 6.8
 */
export function CommentList({ comments, onCommentAdded }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">还没有评论，来发表第一条评论吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
}
