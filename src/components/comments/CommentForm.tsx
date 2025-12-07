'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { trackComment } from '@/libs/Analytics';

type CommentFormProps = {
  campaignId: string;
  parentId?: string | null;
  onCommentAdded?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

/**
 * Comment form component for creating new comments or replies
 * Validates: Requirements 6.2, 6.3
 */
export function CommentForm({
  campaignId,
  parentId = null,
  onCommentAdded,
  onCancel,
  placeholder = '分享你的使用经验和注意事项...',
  autoFocus = false,
}: CommentFormProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Requirement 6.2: Check authentication
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Requirement 6.3: Submit comment
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          content: content.trim(),
          parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '提交评论失败');
      }

      // Track comment submission (Requirement 16.3)
      trackComment(campaignId, !!parentId);

      // Clear form and notify parent
      setContent('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交评论失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">
          请先
          {' '}
          <button
            onClick={() => router.push('/sign-in')}
            className="text-blue-600 hover:underline"
          >
            登录
          </button>
          {' '}
          以发表评论
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        {/* User Avatar */}
        {user?.imageUrl && (
          <img
            src={user.imageUrl}
            alt={user.username || 'User'}
            className="size-10 rounded-full"
          />
        )}

        {/* Comment Input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={parentId ? 2 : 4}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            disabled={isSubmitting}
          />

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              支持 Markdown 格式
            </p>

            <div className="flex gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  取消
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? '提交中...' : parentId ? '回复' : '发表评论'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
