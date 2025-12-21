'use client';

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBookmarkOptional } from '@/components/BookmarkProvider';
import SuccessFeedback from '@/components/SuccessFeedback';
import { trackBookmark as trackBookmarkAnalytics } from '@/libs/Analytics';
import { useSocialMediaPromptContext } from './SocialMediaPromptProvider';

type BookmarkButtonProps = {
  campaignId: string;
  variant?: 'default' | 'icon-only';
  compact?: boolean;
  className?: string;
};

/**
 * Bookmark button component
 * Uses BookmarkProvider context for batch status checking (avoids N+1)
 * Validates: Requirements 7.1, 7.3, 7.4
 */
export function BookmarkButton({
  campaignId,
  variant = 'default',
  compact = false,
  className = '',
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { trackBookmark } = useSocialMediaPromptContext();
  const t = useTranslations('Common');
  const bookmarkContext = useBookmarkOptional();

  // Get bookmark status from context (batch loaded)
  const isBookmarked = bookmarkContext?.hasBookmarked(campaignId) ?? false;

  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Requirement 7.1: Check authentication
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      let newBookmarked = false;

      // Use context's toggle if available
      if (bookmarkContext) {
        newBookmarked = await bookmarkContext.toggleBookmark(campaignId);
      } else {
        // Fallback: direct API call if context not available
        const response = await fetch(`/api/bookmarks/${campaignId}`, {
          method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
          newBookmarked = data.data.bookmarked;
        }
      }

      // 触发心跳动画和成功反馈
      if (newBookmarked) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 800);
        setShowSuccessFeedback(true);
        setTimeout(() => setShowSuccessFeedback(false), 2000);
      }

      // Track bookmark event (Requirement 16.4)
      trackBookmarkAnalytics(campaignId, newBookmarked ? 'added' : 'removed');

      // Track bookmark for social media prompt (Requirement 13.3)
      if (newBookmarked) {
        trackBookmark();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tooltipText = isBookmarked
    ? t('bookmark_tooltip_done')
    : t('bookmark_tooltip');
  const successMessage = t('bookmark_added');

  if (variant === 'icon-only' || compact) {
    return (
      <>
        {showSuccessFeedback && <SuccessFeedback message={successMessage} />}
        <button
          onClick={handleBookmark}
          disabled={isLoading}
          className={`button-press group/btn relative rounded-full p-2 transition-all ${
            isBookmarked
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
          title={tooltipText}
          aria-label={tooltipText}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${compact ? 'size-4' : 'size-5'} ${showAnimation ? 'animate-heartbeat' : ''}`}
            fill={isBookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {/* Tooltip - positioned to the left to avoid being clipped by parent overflow */}
          <span className="pointer-events-none absolute top-1/2 right-full z-50 mr-2 -translate-y-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
            {tooltipText}
          </span>
        </button>
      </>
    );
  }

  return (
    <>
      {showSuccessFeedback && <SuccessFeedback message={successMessage} />}
      <button
        onClick={handleBookmark}
        disabled={isLoading}
        className={`button-press group/btn relative flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
          isBookmarked
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
        title={tooltipText}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`size-5 ${showAnimation ? 'animate-heartbeat' : ''}`}
          fill={isBookmarked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className="font-medium">{isBookmarked ? '已收藏' : '收藏'}</span>
        {/* Tooltip */}
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
          {tooltipText}
        </span>
      </button>
    </>
  );
}
