/**
 * BookmarkButton V2 - 带 Toast 反馈
 * 解决问题：BookmarkButton 点击后没有 Toast 提示
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/feedback/Toast';

type BookmarkButtonV2Props = {
  campaignId: string;
  compact?: boolean;
  className?: string;
  initialBookmarked?: boolean;
};

export function BookmarkButtonV2({
  campaignId,
  compact = false,
  className = '',
  initialBookmarked,
}: BookmarkButtonV2Props) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const t = useTranslations('Common');
  const { showToast } = useToast();

  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(initialBookmarked === undefined);

  // 检查收藏状态
  useEffect(() => {
    if (!isSignedIn || initialBookmarked !== undefined) {
      setIsChecking(false);
      return;
    }

    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/bookmarks/${campaignId}`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch {
        // 静默失败
      } finally {
        setIsChecking(false);
      }
    };

    checkBookmarkStatus();
  }, [campaignId, isSignedIn, initialBookmarked]);

  // 切换收藏状态
  const toggleBookmark = useCallback(async () => {
    if (!isSignedIn) {
      showToast('info', t('login_required') || '请先登录');
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/bookmarks/${campaignId}`, { method });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        showToast(
          'success',
          isBookmarked
            ? (t('bookmark_removed') || '已取消收藏')
            : (t('bookmark_added') || '已添加到收藏'),
        );
      } else {
        throw new Error('Failed to toggle bookmark');
      }
    } catch {
      showToast('error', t('bookmark_error') || '操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, isBookmarked, isSignedIn, router, showToast, t]);

  // 加载中状态
  if (isChecking) {
    return (
      <div className={`animate-pulse ${compact ? 'size-9' : 'h-10 w-24'} rounded-lg bg-gray-200 ${className}`} />
    );
  }

  // 紧凑模式
  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleBookmark}
        disabled={isLoading}
        className={`
          flex size-9 items-center justify-center rounded-lg
          transition-all duration-200 active:scale-95
          ${isBookmarked
        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        aria-label={isBookmarked ? '取消收藏' : '添加收藏'}
        aria-pressed={isBookmarked}
      >
        {isLoading ? (
          <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg
            className="size-5"
            fill={isBookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )}
      </button>
    );
  }

  // 完整模式
  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`
        inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2
        font-medium transition-all duration-200 active:scale-[0.98]
        ${isBookmarked
      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      aria-pressed={isBookmarked}
    >
      {isLoading ? (
        <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg
          className="size-5"
          fill={isBookmarked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      <span>{isBookmarked ? '已收藏' : '收藏'}</span>
    </button>
  );
}
