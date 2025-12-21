/**
 * 简化版活动卡片组件
 * 解决问题：CampaignCard 信息过载
 *
 * 设计原则：
 * - 希克定律：减少选择，加快决策
 * - 渐进式披露：核心信息优先，详情点击查看
 * - 44px 最小触摸目标
 */

'use client';

import type { Campaign } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ParticipationButton } from '@/components/ParticipationButton';
import { trackCampaignClick } from '@/libs/Analytics';

type CampaignCardCompactProps = {
  campaign: Campaign;
  locale: string;
  showPlatform?: boolean;
  showBookmark?: boolean;
  showParticipation?: boolean;
};

export function CampaignCardCompact({
  campaign,
  locale,
  showPlatform = true,
  showBookmark = true,
  showParticipation = true,
}: CampaignCardCompactProps) {
  const t = useTranslations('Index');

  const translation = campaign.translations?.find(tr => tr.locale === locale)
    || campaign.translations?.[0];

  // 计算过期状态
  const expiryInfo = React.useMemo(() => {
    if (!campaign.endDate) {
      return { status: 'none', label: '' };
    }

    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: t('expired') || '已过期' };
    }
    if (diffDays <= 3) {
      return { status: 'urgent', label: `${diffDays}${t('days_left') || '天后过期'}` };
    }
    if (diffDays <= 7) {
      return { status: 'soon', label: `${diffDays}${t('days_left') || '天后过期'}` };
    }
    return { status: 'normal', label: '' };
  }, [campaign.endDate, t]);

  const handleClick = () => {
    trackCampaignClick(
      campaign.id,
      translation?.title || 'Untitled',
      campaign.platform?.name || 'Unknown',
    );
  };

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      onClick={handleClick}
      className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:scale-[0.99]"
    >
      {/* 平台Logo */}
      {showPlatform && campaign.platform?.logo && (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={campaign.platform.logo}
            alt={campaign.platform.name}
            fill
            className="object-contain p-1.5"
            sizes="48px"
            loading="lazy"
          />
        </div>
      )}

      {/* 主要内容 */}
      <div className="min-w-0 flex-1">
        {/* 标题行 */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {translation?.title || 'Untitled Campaign'}
          </h3>

          {/* Featured 标记 */}
          {campaign.isFeatured && (
            <span className="shrink-0 text-yellow-500">⭐</span>
          )}
        </div>

        {/* 平台名称 */}
        {showPlatform && (campaign.platform || campaign.pendingPlatform) && (
          <p className="mb-2 text-sm text-gray-500">
            {campaign.platform?.name || campaign.pendingPlatform?.name}
          </p>
        )}

        {/* 底部信息行 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 免费额度 - 核心信息 */}
          {campaign.freeCredit && (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
              💰
              {' '}
              {campaign.freeCredit}
            </span>
          )}

          {/* 过期状态 */}
          {expiryInfo.status !== 'none' && expiryInfo.status !== 'normal' && (
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${
              expiryInfo.status === 'expired'
                ? 'bg-red-100 text-red-800'
                : expiryInfo.status === 'urgent'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
            >
              ⏰
              {' '}
              {expiryInfo.label}
            </span>
          )}

          {/* 难度 - 简化显示 */}
          {campaign.difficultyLevel && (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm ${
              campaign.difficultyLevel === 'easy'
                ? 'bg-green-50 text-green-700'
                : campaign.difficultyLevel === 'medium'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700'
            }`}
            >
              {campaign.difficultyLevel === 'easy' ? '😊' : campaign.difficultyLevel === 'medium' ? '😐' : '😰'}
            </span>
          )}
        </div>
      </div>

      {/* 右侧操作区 */}
      <div className="flex shrink-0 items-center gap-2 self-center">
        {/* 参与按钮 */}
        {showParticipation && (
          <ParticipationButton campaignId={campaign.id} compact={true} />
        )}

        {/* 收藏按钮 */}
        {showBookmark && (
          <BookmarkButton campaignId={campaign.id} compact={true} />
        )}

        {/* 箭头指示 */}
        <div className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500">
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
