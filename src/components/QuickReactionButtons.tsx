'use client';

import type { ReactionType } from '@/services/ReactionService';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type QuickReactionButtonsProps = {
  campaignId: string;
  onReactionAdded?: () => void;
  compact?: boolean;
};

/**
 * Quick Reaction Buttons
 * Allows users to quickly provide feedback on campaigns
 */
export function QuickReactionButtons({
  campaignId,
  onReactionAdded,
  compact = false,
}: QuickReactionButtonsProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const t = useTranslations('Reactions');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReaction = async (type: ReactionType) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
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

      if (!response.ok) {
        throw new Error('Failed to submit reaction');
      }

      // Notify parent component to refresh stats
      if (onReactionAdded) {
        onReactionAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('still_works');
          }}
          disabled={submitting}
          className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 active:bg-green-200 disabled:opacity-50"
          title={t('stillWorks')}
        >
          <span>✅</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('expired');
          }}
          disabled={submitting}
          className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 active:bg-red-200 disabled:opacity-50"
          title={t('expired')}
        >
          <span>❌</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('info_incorrect');
          }}
          disabled={submitting}
          className="flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-100 active:bg-yellow-200 disabled:opacity-50"
          title={t('infoIncorrect')}
        >
          <span>📝</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">{t('beFirstToReact')}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('still_works');
          }}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 active:bg-green-200 disabled:opacity-50"
        >
          <span className="text-lg">✅</span>
          <span>{t('stillWorks')}</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('expired');
          }}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 active:bg-red-200 disabled:opacity-50"
        >
          <span className="text-lg">❌</span>
          <span>{t('expired')}</span>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleReaction('info_incorrect');
          }}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 active:bg-yellow-200 disabled:opacity-50"
        >
          <span className="text-lg">📝</span>
          <span>{t('infoIncorrect')}</span>
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
