'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';
import { CommentForm } from './CommentForm';
import { EmojiReactionButtons } from './EmojiReactionButtons';

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
  createdAt: Date | string; // Can be Date object or ISO string from API
  updatedAt: Date | string; // Can be Date object or ISO string from API
  deletedAt?: Date | string | null;
  user?: CommentUser;
  replies?: Comment[];
};

type CommentItemProps = {
  comment: Comment;
  onCommentAdded?: () => void;
  depth?: number;
};

/**
 * Individual comment item with reactions and replies
 * Validates: Requirements 6.1, 6.4, 6.5-6.9
 */
export function CommentItem({
  comment,
  onCommentAdded,
  depth = 0,
}: CommentItemProps) {
  const { isSignedIn, userId } = useAuth();
  const { user: currentUser } = useUser();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = isSignedIn && userId === comment.userId;
  const maxDepth = 2; // Maximum nesting level

  const handleEdit = async () => {
    if (!editContent.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/comment/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditing(false);
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/comments/comment/${comment.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  // Format relative time
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <div className={`${depth > 0 ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        {/* User Avatar */}
        <div className="shrink-0">
          {comment.user?.imageUrl
            ? (
                <img
                  src={comment.user.imageUrl}
                  alt={comment.user.username || 'User'}
                  className="size-10 rounded-full"
                />
              )
            : (
                <div className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                  {comment.user?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
        </div>

        {/* Comment Content */}
        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            {/* Header */}
            <div className="mb-2 flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {comment.user?.username || '匿名用户'}
              </span>

              {/* Useful Badge - Requirement 6.9 */}
              {comment.isMarkedUseful && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  <svg
                    className="size-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  有用
                </span>
              )}

              <span className="text-sm text-gray-500">{timeAgo}</span>

              {new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                <span className="text-xs text-gray-400">(已编辑)</span>
              )}
            </div>

            {/* Content */}
            {isEditing
              ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleEdit}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditContent(comment.content);
                        }}
                        className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )
              : (
                  <div className="whitespace-pre-wrap text-gray-700">
                    {comment.content}
                  </div>
                )}

            {/* Actions */}
            {!isEditing && (
              <div className="mt-3 flex items-center gap-4">
                {/* Emoji Reactions - Requirements 6.5-6.7 */}
                <EmojiReactionButtons commentId={comment.id} />

                <div className="ml-auto flex items-center gap-2 text-sm">
                  {/* Reply Button */}
                  {depth < maxDepth && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      回复
                    </button>
                  )}

                  {/* Edit/Delete for owner - Requirement 6.4 */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        编辑
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-gray-600 hover:text-red-600 disabled:opacity-50"
                      >
                        {isDeleting ? '删除中...' : '删除'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reply Form - Requirement 6.8 */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                campaignId={comment.campaignId}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                placeholder="写下你的回复..."
                autoFocus
              />
            </div>
          )}

          {/* Nested Replies - Requirement 6.8 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onCommentAdded={onCommentAdded}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
