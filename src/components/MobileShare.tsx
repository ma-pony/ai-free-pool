/**
 * Mobile Share Component
 * Validates: Requirements 14.7
 *
 * Integrates native share API for mobile devices
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trackShare } from '@/libs/Analytics';
import { MobileButton } from './MobileButton';

type MobileShareProps = {
  title: string;
  text: string;
  url: string;
  campaignId?: string;
  variant?: 'button' | 'icon';
  className?: string;
};

export function MobileShare({
  title,
  text,
  url,
  campaignId,
  variant = 'button',
  className = '',
}: MobileShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleShare = async () => {
    if (!canShare) {
      setShowFallback(true);
      return;
    }

    setIsSharing(true);

    try {
      await navigator.share({
        title,
        text,
        url,
      });

      // Track successful share
      if (campaignId) {
        trackShare(campaignId, 'native_share');
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        setShowFallback(true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const t = useTranslations('Share');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert(t('linkCopied'));
      setShowFallback(false);

      // Track copy link
      if (campaignId) {
        trackShare(campaignId, 'copy_link');
      }
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleShare}
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-700 transition-all hover:bg-gray-100 active:scale-95 active:bg-gray-200 ${className}`}
          aria-label={t('share')}
          disabled={isSharing}
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>

        {/* Fallback Modal */}
        {showFallback && (
          <div className="bg-opacity-50 animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-black p-4 duration-200">
            <div className="animate-in slide-in-from-bottom w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl duration-300">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('share')}</h3>

              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="flex min-h-[48px] w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:bg-gray-50 active:bg-gray-100"
                >
                  <svg className="size-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-gray-900">{t('copyLink')}</span>
                </button>

                <button
                  onClick={() => setShowFallback(false)}
                  className="min-h-[48px] w-full rounded-lg bg-gray-100 px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-200 active:bg-gray-300"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <MobileButton
      onClick={handleShare}
      variant="outline"
      size="md"
      loading={isSharing}
      className={className}
      icon={(
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      )}
    >
      {t('share')}
    </MobileButton>
  );
}
