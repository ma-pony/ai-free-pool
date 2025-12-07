/**
 * HeroStats Component
 * Hero 区域统计数据展示
 */
'use client';

import { useTranslations } from 'next-intl';

type HeroStatsProps = {
  totalCampaigns?: number;
  activePlatforms?: number;
  communityContributions?: number;
};

export default function HeroStats({
  totalCampaigns = 0,
  activePlatforms = 0,
  communityContributions = 0,
}: HeroStatsProps) {
  const t = useTranslations('Index');

  const stats = [
    {
      value: totalCampaigns,
      label: t('stat_total_campaigns'),
      icon: '🎯',
    },
    {
      value: activePlatforms,
      label: t('stat_active_platforms'),
      icon: '🏢',
    },
    {
      value: communityContributions,
      label: t('stat_community_contributions'),
      icon: '👥',
      format: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v),
    },
  ];

  return (
    <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
        <span>📊</span>
        <span>{t('hero_stats_title')}</span>
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="mb-1 text-2xl font-bold text-white">
              {stat.format ? stat.format(stat.value) : stat.value}
            </div>
            <div className="text-xs text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
