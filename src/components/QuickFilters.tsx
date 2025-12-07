/**
 * Quick Filters Component
 * 快速筛选标签 - 常用筛选条件
 */
'use client';

import { useTranslations } from 'next-intl';

type QuickFilter = {
  id: string;
  label: string;
  icon: string;
  filter: {
    sortBy?: 'latest' | 'popular' | 'expiring_soon' | 'highest_credit';
    difficultyLevel?: 'easy' | 'medium' | 'hard';
  };
};

type QuickFiltersProps = {
  activeFilter: string;
  onFilterChange: (filterId: string, filter: QuickFilter['filter']) => void;
};

export default function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps) {
  const t = useTranslations('Campaigns');

  const quickFilters: QuickFilter[] = [
    {
      id: 'all',
      label: t('quickFilter_all'),
      icon: '🌟',
      filter: { sortBy: 'latest' },
    },
    {
      id: 'new_user',
      label: t('quickFilter_new_user'),
      icon: '🎁',
      filter: { difficultyLevel: 'easy', sortBy: 'latest' },
    },
    {
      id: 'expiring_soon',
      label: t('quickFilter_expiring_soon'),
      icon: '⏰',
      filter: { sortBy: 'expiring_soon' },
    },
    {
      id: 'high_credit',
      label: t('quickFilter_high_credit'),
      icon: '💰',
      filter: { sortBy: 'highest_credit' },
    },
    {
      id: 'popular',
      label: t('quickFilter_popular'),
      icon: '🔥',
      filter: { sortBy: 'popular' },
    },
  ];

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {quickFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id, filter.filter)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'scale-105 bg-primary-600 text-white shadow-md'
                : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 active:scale-95'
            }`}
          >
            <span className="text-base">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
