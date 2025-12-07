'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Stats = {
  totalCampaigns: number;
  activePlatforms: number;
  communityContributions: number;
};

export default function Statistics() {
  const t = useTranslations('Index');
  const [stats, setStats] = useState<Stats>({
    totalCampaigns: 0,
    activePlatforms: 0,
    communityContributions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // For now, we'll use placeholder data
      // In production, this would fetch from an API endpoint
      setStats({
        totalCampaigns: 156,
        activePlatforms: 42,
        communityContributions: 1234,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-xl bg-gray-200 p-8" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Total Campaigns */}
      <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 text-center transition-all hover:border-primary-500 hover:shadow-lg">
        <div className="mb-2 text-5xl font-bold text-primary-600 transition-transform group-hover:scale-110">
          {stats.totalCampaigns}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {t('stat_total_campaigns')}
        </div>
      </div>

      {/* Active Platforms */}
      <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 text-center transition-all hover:border-primary-500 hover:shadow-lg">
        <div className="mb-2 text-5xl font-bold text-green-600 transition-transform group-hover:scale-110">
          {stats.activePlatforms}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {t('stat_active_platforms')}
        </div>
      </div>

      {/* Community Contributions */}
      <div className="group rounded-xl border-2 border-gray-200 bg-white p-8 text-center transition-all hover:border-primary-500 hover:shadow-lg">
        <div className="mb-2 text-5xl font-bold text-orange-600 transition-transform group-hover:scale-110">
          {stats.communityContributions}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {t('stat_community_contributions')}
        </div>
      </div>
    </div>
  );
}
