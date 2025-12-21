'use client';

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useParticipationOptional } from '@/components/ParticipationProvider';
import SuccessFeedback from '@/components/SuccessFeedback';

type ParticipationButtonProps = {
  campaignId: string;
  variant?: 'default' | 'icon-only';
  compact?: boolean;
  className?: string;
};

/**
 * Participation button component
 * Allows users to mark campaigns they have participated in
 * Uses ParticipationProvider context for batch status checking (avoids N+1)
 */
export function ParticipationButton({
  campaignId,
  variant = 'default',
  compact = false,
  className = '',
}: ParticipationButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const t = useTranslations('Common');
  const participationContext = useParticipationOptional();

  // Get participation status from context (batch loaded)
  const hasParticipated = participationContext?.hasParticipated(campaignId) ?? false;

  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

  const handleParticipation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      // Use context's toggle if available, otherwise call API directly
      if (participationContext) {
        const newParticipated = await participationContext.toggleParticipation(campaignId);

        if (newParticipated) {
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 800);
          setShowSuccessFeedback(true);
          setTimeout(() => setShowSuccessFeedback(false), 2000);
        }
      } else {
        // Fallback: direct API call if context not available
        const response = await fetch(`/api/participations/${campaignId}`, {
          method: 'POST',
        });
        const data = await response.json();

        if (data.success && data.data.participated) {
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 800);
          setShowSuccessFeedback(true);
          setTimeout(() => setShowSuccessFeedback(false), 2000);
        }
      }
    } catch (error) {
      console.error('Error toggling participation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tooltipText = hasParticipated
    ? t('participation_tooltip_done')
    : t('participation_tooltip');
  const successMessage = t('participation_added');

  if (variant === 'icon-only' || compact) {
    return (
      <>
        {showSuccessFeedback && <SuccessFeedback message={successMessage} />}
        <button
          onClick={handleParticipation}
          disabled={isLoading}
          className={`button-press group/btn relative rounded-full p-2 transition-all ${
            hasParticipated
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
          title={tooltipText}
          aria-label={tooltipText}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${compact ? 'size-4' : 'size-5'} ${showAnimation ? 'animate-heartbeat' : ''}`}
            fill={hasParticipated ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
        onClick={handleParticipation}
        disabled={isLoading}
        className={`button-press group/btn relative flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
          hasParticipated
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
        title={tooltipText}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`size-5 ${showAnimation ? 'animate-heartbeat' : ''}`}
          fill={hasParticipated ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">{hasParticipated ? '已参与' : '标记参与'}</span>
        {/* Tooltip */}
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/btn:opacity-100">
          {tooltipText}
        </span>
      </button>
    </>
  );
}
