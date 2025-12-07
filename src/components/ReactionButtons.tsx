'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackReaction } from '@/libs/Analytics';

export type ReactionType = 'still_works' | 'expired' | 'info_incorrect';

export type ReactionStats = {
  stillWorks: number;
  expired: number;
  infoIncorrect: number;
  total: number;
};

type ReactionButtonsProps = {
  campaignId: string;
  initialStats?: ReactionStats;
  initialUserReaction?: ReactionType | null;
};

/**
 * Reaction buttons component
 * Validates: Requirements 5.1-5.7
 */
export function ReactionButtons({
  campaignId,
  initialStats,
  initialUserReaction,
}: ReactionButtonsProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<ReactionStats>(
    initialStats || {
      stillWorks: 0,
      expired: 0,
      infoIncorrect: 0,
      total: 0,
    },
  );
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    initialUserReaction || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data if not provided
  useEffect(() => {
    if (!initialStats || !initialUserReaction) {
      fetchReactions();
    }
  }, [campaignId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/reactions/${campaignId}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setUserReaction(data.data.userReaction?.type || null);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (type: ReactionType) => {
    // Requirement 5.2: Check authentication
    if (!isSignedIn) {
      // Redirect to sign-in page
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      // Requirement 5.5: If clicking the same reaction, remove it
      if (userReaction === type) {
        const response = await fetch(`/api/reactions/${campaignId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setStats(data.data.stats);
          setUserReaction(null);
        }
      } else {
        // Requirement 5.3, 5.6: Add or update reaction
        const response = await fetch('/api/reactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId,
            type,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStats(data.data.stats);
          setUserReaction(type);

          // Track reaction event (Requirement 16.3)
          trackReaction(campaignId, type);
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate percentages for display (Requirement 5.7)
  const getPercentage = (count: number) => {
    if (stats.total === 0) {
      return 0;
    }
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">这个活动还有效吗？</h3>

      <div className="flex flex-col gap-3">
        {/* Still Works Button */}
        <button
          onClick={() => handleReaction('still_works')}
          disabled={isLoading}
          className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 transition-all ${
            userReaction === 'still_works'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="font-medium">仍然有效</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {getPercentage(stats.stillWorks)}
              %
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
              {stats.stillWorks}
            </span>
          </div>
        </button>

        {/* Expired Button */}
        <button
          onClick={() => handleReaction('expired')}
          disabled={isLoading}
          className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 transition-all ${
            userReaction === 'expired'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">❌</span>
            <span className="font-medium">已失效</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {getPercentage(stats.expired)}
              %
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
              {stats.expired}
            </span>
          </div>
        </button>

        {/* Info Incorrect Button */}
        <button
          onClick={() => handleReaction('info_incorrect')}
          disabled={isLoading}
          className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 transition-all ${
            userReaction === 'info_incorrect'
              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span className="font-medium">信息有误</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {getPercentage(stats.infoIncorrect)}
              %
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
              {stats.infoIncorrect}
            </span>
          </div>
        </button>
      </div>

      {!isSignedIn && (
        <p className="text-sm text-gray-500">
          请先登录以提交反馈
        </p>
      )}
    </div>
  );
}
