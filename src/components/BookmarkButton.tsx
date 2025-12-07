'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SuccessFeedback from '@/components/SuccessFeedback';
import { trackBookmark as trackBookmarkAnalytics } from '@/libs/Analytics';
import { useSocialMediaPromptContext } from './SocialMediaPromptProvider';

type BookmarkButtonProps = {
  campaignId: string;
  initialBookmarked?: boolean;
  variant?: 'default' | 'icon-only';
  compact?: boolean;
  className?: string;
};

/**
 * Bookmark button component
 * Validates: Requirements 7.1, 7.3, 7.4
 */
export function BookmarkButton({
  campaignId,
  initialBookmarked = false,
  variant = 'default',
  compact = false,
  className = '',
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { trackBookmark } = useSocialMediaPromptContext();

  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

  // Fetch bookmark status if not provided
  useEffect(() => {
    if (isSignedIn && initialBookmarked === undefined) {
      fetchBookmarkStatus();
    }
  }, [campaignId, isSignedIn]);

  const fetchBookmarkStatus = async () => {
    try {
      const response = await fetch(`/api/bookmarks/${campaignId}`);
      const data = await response.json();

      if (data.success) {
        setIsBookmarked(data.data.bookmarked);
      }
    } catch (error) {
      console.error('Error fetching bookmark status:', error);
    }
  };

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
      // Toggle bookmark (Requirement 7.4)
      const response = await fetch(`/api/bookmarks/${campaignId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setIsBookmarked(data.data.bookmarked);

        // 触发心跳动画和成功反馈
        if (data.data.bookmarked) {
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 800);

          // 显示成功反馈
          setShowSuccessFeedback(true);
          setTimeout(() => setShowSuccessFeedback(false), 2000);
        }

        // Track bookmark event (Requirement 16.4)
        trackBookmarkAnalytics(campaignId, data.data.bookmarked ? 'added' : 'removed');

        // Track bookmark for social media prompt (Requirement 13.3)
        if (data.data.bookmarked) {
          trackBookmark();
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon-only' || compact) {
    return (
      <>
        {showSuccessFeedback && <SuccessFeedback message="收藏成功！" />}
        <button
          onClick={handleBookmark}
          disabled={isLoading}
          className={`button-press rounded-full p-2 transition-all ${
            isBookmarked
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
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
        </button>
      </>
    );
  }

  return (
    <>
      {showSuccessFeedback && <SuccessFeedback message="收藏成功！" />}
      <button
        onClick={handleBookmark}
        disabled={isLoading}
        className={`button-press flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
          isBookmarked
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
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
      </button>
    </>
  );
}
