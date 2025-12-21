'use client';

import type { ReactionStats as ReactionStatsType } from '@/services/ReactionService';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { QuickReactionButtons } from './QuickReactionButtons';
import { useReactionOptional } from './ReactionProvider';

type ReactionStatsProps = {
  campaignId: string;
  compact?: boolean;
  stats?: ReactionStatsType; // Optional pre-fetched stats
};

/**
 * Display reaction statistics
 * Uses ReactionProvider context for batch loading (avoids N+1)
 * Validates: Requirements 5.7
 */
export function ReactionStats({ campaignId, compact = false, stats: initialStats }: ReactionStatsProps) {
  const t = useTranslations('Reactions');
  const reactionContext = useReactionOptional();

  // Get stats from context if available
  const contextData = reactionContext?.getReactionData(campaignId);
  const contextStats = contextData?.stats;

  const [stats, setStats] = useState<ReactionStatsType | null>(initialStats || contextStats || null);
  const [loading, setLoading] = useState(!initialStats && !contextStats);

  // Update stats when context data changes
  useEffect(() => {
    if (contextStats && !initialStats) {
      setStats(contextStats);
      setLoading(false);
    }
  }, [contextStats, initialStats]);

  // Fallback: fetch individually only if no context and no initial stats
  useEffect(() => {
    if (initialStats || contextStats || reactionContext) {
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/reactions/${campaignId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.stats) {
            setStats(result.data.stats);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reaction stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [campaignId, initialStats, contextStats, reactionContext]);

  const refreshStats = async () => {
    try {
      const response = await fetch(`/api/reactions/${campaignId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.stats) {
          setStats(result.data.stats);
          // Update context if available
          if (reactionContext && result.data) {
            reactionContext.updateReaction(campaignId, {
              stats: result.data.stats,
              userReaction: result.data.userReaction?.type || null,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh reaction stats:', error);
    }
  };

  if (loading) {
    return compact
      ? (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{t('loading')}</span>
          </div>
        )
      : null;
  }

  // Show quick reaction buttons if no stats or total is 0
  if (!stats || stats.total === 0) {
    return (
      <QuickReactionButtons
        campaignId={campaignId}
        compact={compact}
        onReactionAdded={refreshStats}
      />
    );
  }

  const getPercentage = (count: number) => {
    if (!stats || stats.total === 0) {
      return 0;
    }
    return Math.round((count / stats.total) * 100);
  };

  if (compact) {
    // Compact view for campaign cards
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-sm">✅</span>
          <span className="font-medium text-green-700">
            {getPercentage(stats.stillWorks)}
            %
          </span>
          <span className="text-gray-500">
            (
            {stats.stillWorks}
            )
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">❌</span>
          <span className="font-medium text-red-700">
            {getPercentage(stats.expired)}
            %
          </span>
          <span className="text-gray-500">
            (
            {stats.expired}
            )
          </span>
        </div>
        {stats.infoIncorrect > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm">📝</span>
            <span className="font-medium text-yellow-700">
              {getPercentage(stats.infoIncorrect)}
              %
            </span>
            <span className="text-gray-500">
              (
              {stats.infoIncorrect}
              )
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <span className="font-medium">{t('stillWorks')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {getPercentage(stats.stillWorks)}
            %
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {stats.stillWorks}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">❌</span>
          <span className="font-medium">{t('expired')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {getPercentage(stats.expired)}
            %
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {stats.expired}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <span className="font-medium">{t('infoIncorrect')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {getPercentage(stats.infoIncorrect)}
            %
          </span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            {stats.infoIncorrect}
          </span>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="text-sm text-gray-500">
            {t('totalReactions')}
            :
            {stats.total}
          </p>
        </div>
      )}
    </div>
  );
}
