'use client';

import type { Comment } from './CommentItem';
import { useEffect, useState } from 'react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

type CommentSectionProps = {
  campaignId: string;
  initialComments?: Comment[];
};

/**
 * Main comment section component
 * Validates: Requirements 6.1-6.9
 */
export function CommentSection({
  campaignId,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/campaign/${campaignId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '加载评论失败');
      }

      setComments(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载评论失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments on mount if not provided
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [campaignId]);

  const handleCommentAdded = () => {
    // Refresh comments after adding/editing/deleting
    fetchComments();
  };

  // Count total comments including replies
  const countComments = (commentList: Comment[]): number => {
    let count = commentList.length;
    for (const comment of commentList) {
      if (comment.replies && comment.replies.length > 0) {
        count += countComments(comment.replies);
      }
    }
    return count;
  };

  const totalComments = countComments(comments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          评论
          {' '}
          {totalComments > 0 && `(${totalComments})`}
        </h2>
      </div>

      {/* Comment Form */}
      <CommentForm
        campaignId={campaignId}
        onCommentAdded={handleCommentAdded}
      />

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchComments}
            className="mt-2 text-sm text-red-700 underline hover:text-red-800"
          >
            重试
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}

      {/* Comments List */}
      {!isLoading && !error && (
        <CommentList comments={comments} onCommentAdded={handleCommentAdded} />
      )}
    </div>
  );
}
