'use client';

import type { Campaign } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { trackCampaignClick } from '@/libs/Analytics';
import { BookmarkButton } from './BookmarkButton';
import { CampaignEmojiReactions } from './CampaignEmojiReactions';
import { ParticipationButton } from './ParticipationButton';
import { ReactionStats } from './ReactionStats';

type CampaignCardProps = {
  campaign: Campaign;
  locale: string;
  showPlatform?: boolean;
  isFeatured?: boolean;
  showReactions?: boolean;
  showBookmark?: boolean;
  showParticipation?: boolean;
};

/**
 * Campaign Card Component
 * Validates: Requirements 2.1-2.12, 5.1-5.7, 7.1-7.4
 *
 * Displays campaign information including:
 * - Platform logo and name
 * - Campaign title and description
 * - Free credit amount
 * - Expiration date with status
 * - Difficulty level
 * - Condition tags
 * - Reaction statistics (optional)
 * - Bookmark button (optional)
 */
export default function CampaignCard({
  campaign,
  locale,
  showPlatform = true,
  isFeatured = false,
  showReactions = true,
  showBookmark = true,
  showParticipation = true,
}: CampaignCardProps) {
  const t = useTranslations('Index');

  // Get translation for current locale, fallback to first available
  const translation = campaign.translations?.find(tr => tr.locale === locale)
    || campaign.translations?.[0];

  // Calculate expiration status - use useMemo to avoid hydration issues
  const { isExpired, isExpiringSoon, daysUntilExpiry } = React.useMemo(() => {
    if (!campaign.endDate) {
      return { isExpired: false, isExpiringSoon: false, daysUntilExpiry: null };
    }

    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isExpired: diffTime < 0,
      isExpiringSoon: diffDays > 0 && diffDays <= 7,
      daysUntilExpiry: diffDays > 0 ? diffDays : null,
    };
  }, [campaign.endDate]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleClick = () => {
    // Track campaign click event (Requirement 16.2)
    trackCampaignClick(
      campaign.id,
      translation?.title || 'Untitled Campaign',
      campaign.platform?.name || 'Unknown Platform',
    );
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track external link click
    trackCampaignClick(
      campaign.id,
      translation?.title || 'Untitled Campaign',
      campaign.platform?.name || 'Unknown Platform',
    );

    // Open external link in new tab
    window.open(campaign.officialLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`group card-hover-effect animate-fade-in-up relative rounded-xl border-2 bg-white shadow-md ${
      isFeatured || campaign.isFeatured
        ? 'border-yellow-400 bg-linear-to-br from-yellow-50 to-orange-50'
        : 'border-gray-200 hover:border-blue-300'
    }`}
    >
      {/* Top Right Actions */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 sm:top-4 sm:right-4">
        {/* Featured Badge */}
        {(isFeatured || campaign.isFeatured) && (
          <div className="flex items-center gap-1 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-medium text-white shadow-md sm:px-3">
            <span>⭐</span>
            <span className="hidden sm:inline">{t('featured')}</span>
          </div>
        )}

        {/* Quick Participation Button */}
        {showParticipation && (
          <div className="shrink-0">
            <ParticipationButton campaignId={campaign.id} compact={true} className="shadow-md" />
          </div>
        )}

        {/* Quick Bookmark Button */}
        {showBookmark && (
          <div className="shrink-0">
            <BookmarkButton campaignId={campaign.id} compact={true} className="shadow-md" />
          </div>
        )}
      </div>

      {/* Card Content - Clickable area */}
      <Link href={`/campaigns/${campaign.slug}`} className="block p-4 sm:p-6" onClick={handleClick}>
        {/* Platform Info */}
        {showPlatform && (campaign.platform || campaign.pendingPlatform) && (
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            {campaign.platform?.logo && (
              <div className="relative size-10 overflow-hidden rounded-lg bg-gray-100 shadow-sm sm:size-12">
                <Image
                  src={campaign.platform.logo}
                  alt={campaign.platform.name}
                  fill
                  className="object-contain p-1.5"
                  sizes="(max-width: 640px) 40px, 48px"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1">
              <span className="text-xs font-semibold text-gray-700 sm:text-sm">
                {campaign.platform?.name || campaign.pendingPlatform?.name}
              </span>
            </div>
          </div>
        )}

        {/* Campaign Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 sm:mb-3 sm:text-xl">
          {translation?.title || 'Untitled Campaign'}
        </h3>

        {/* Campaign Description */}
        {translation?.description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600 sm:mb-4">
            {translation.description}
          </p>
        )}

        {/* Free Credit - 突出显示 */}
        {campaign.freeCredit && (
          <div className="mb-4 rounded-lg border-2 border-green-200 bg-linear-to-r from-green-50 to-emerald-50 p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <div className="flex-1">
                <div className="mb-0.5 text-xs font-medium text-green-700">免费额度</div>
                <div className="text-lg font-bold text-green-800">{campaign.freeCredit}</div>
              </div>
            </div>
          </div>
        )}

        {/* Key Info - 精简展示 */}
        <div className="flex flex-wrap gap-2">
          {/* Expiration Date */}
          {campaign.endDate && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
              isExpired
                ? 'bg-red-100 text-red-800'
                : isExpiringSoon
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
            >
              <span>⏰</span>
              <span>
                {isExpired
                  ? 'Expired'
                  : isExpiringSoon && daysUntilExpiry
                    ? `${daysUntilExpiry}天后过期`
                    : formatDate(campaign.endDate)}
              </span>
            </div>
          )}

          {/* Top Condition Tag - 只显示最重要的1个 */}
          {campaign.conditionTags && campaign.conditionTags.length > 0 && campaign.conditionTags[0] && (
            <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800">
              🏷️
              {' '}
              {campaign.conditionTags[0].name}
            </span>
          )}
        </div>
      </Link>

      {/* Quick Action Button - Go to Official Link (Outside Link) */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <button
          type="button"
          onClick={handleExternalLinkClick}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98] sm:mt-4"
        >
          <span>🚀</span>
          <span>{t('goToCampaign') || '前往活动'}</span>
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Footer with Reactions */}
      {showReactions && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 sm:px-6 sm:py-3">
          <div className="space-y-2">
            <ReactionStats campaignId={campaign.id} compact={true} />
            <CampaignEmojiReactions campaignId={campaign.id} compact={true} />
          </div>
        </div>
      )}
    </div>
  );
}
