'use client';

import type { Campaign, CampaignListFilters, ConditionTag, Tag } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { CampaignCardCompact } from '@/components/campaign';
import CampaignCardSkeleton from '@/components/CampaignCardSkeleton';
import { CampaignFilters } from '@/components/CampaignFilters';
import { FilterEmptyState, SearchEmptyState } from '@/components/common';
import { FilterBottomSheet, FilterTriggerButton } from '@/components/filter';
import QuickFilters from '@/components/QuickFilters';

type CampaignListClientProps = {
  initialCampaigns: Campaign[];
  initialFilters: CampaignListFilters;
  availableCategories: Tag[];
  availableAiModels: string[];
  availableConditions: ConditionTag[];
  availablePlatforms: Platform[];
};

export function CampaignListClient({
  initialCampaigns,
  initialFilters,
  availableCategories,
  availableAiModels,
  availableConditions,
  availablePlatforms,
}: CampaignListClientProps) {
  const t = useTranslations('Campaigns');
  const locale = useLocale();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [filters, setFilters] = useState<CampaignListFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialCampaigns.length >= (initialFilters.limit || 20));
  const [page, setPage] = useState(1);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');

  // 移动端筛选器状态
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // 计算已选筛选数量
  const activeFilterCount = useMemo(() => {
    return [
      filters.difficultyLevel,
      filters.platformIds?.length,
      filters.categoryTags?.length,
      filters.aiModels?.length,
      filters.conditionTags?.length,
    ].filter(Boolean).length;
  }, [filters]);

  // 判断是否有搜索词
  const hasSearchQuery = Boolean(filters.search);

  // 更新 URL
  const updateURL = useCallback((newFilters: CampaignListFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.difficultyLevel) {
      params.set('difficulty', newFilters.difficultyLevel);
    }
    if (newFilters.platformIds?.length) {
      params.set('platforms', newFilters.platformIds.join(','));
    }
    if (newFilters.categoryTags?.length) {
      params.set('categories', newFilters.categoryTags.join(','));
    }
    if (newFilters.aiModels?.length) {
      params.set('aiModels', newFilters.aiModels.join(','));
    }
    if (newFilters.conditionTags?.length) {
      params.set('conditions', newFilters.conditionTags.join(','));
    }
    if (newFilters.sortBy && newFilters.sortBy !== 'latest') {
      params.set('sortBy', newFilters.sortBy);
    }

    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/${locale}/campaigns${newURL}`, { scroll: false });
  }, [locale, router]);

  // 获取活动
  const fetchCampaigns = useCallback(async (newFilters: CampaignListFilters, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('status', 'published');
      if (newFilters.search) {
        params.append('search', newFilters.search);
      }
      if (newFilters.difficultyLevel) {
        params.append('difficultyLevel', newFilters.difficultyLevel);
      }
      if (newFilters.platformIds?.length) {
        params.append('platforms', newFilters.platformIds.join(','));
      }
      if (newFilters.categoryTags?.length) {
        params.append('categories', newFilters.categoryTags.join(','));
      }
      if (newFilters.aiModels?.length) {
        params.append('aiModels', newFilters.aiModels.join(','));
      }
      if (newFilters.conditionTags?.length) {
        params.append('conditions', newFilters.conditionTags.join(','));
      }
      if (newFilters.sortBy) {
        params.append('sortBy', newFilters.sortBy);
      }
      if (newFilters.limit) {
        params.append('limit', newFilters.limit.toString());
      }
      if (newFilters.offset) {
        params.append('offset', newFilters.offset.toString());
      }

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      const newCampaigns = data.data || [];

      if (append) {
        setCampaigns(prev => [...prev, ...newCampaigns]);
      } else {
        setCampaigns(newCampaigns);
      }

      setHasMore(newCampaigns.length >= (newFilters.limit || 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理筛选变更
  const handleFilterChange = useCallback((newFilters: CampaignListFilters) => {
    setFilters(newFilters);
    setPage(1);
    updateURL(newFilters);
    fetchCampaigns({ ...newFilters, offset: 0 }, false);
  }, [fetchCampaigns, updateURL]);

  // 清除所有筛选
  const handleClearFilters = useCallback(() => {
    handleFilterChange({
      status: 'published',
      includeExpired: false,
      includeDeleted: false,
      sortBy: 'latest',
    });
  }, [handleFilterChange]);

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    handleFilterChange({
      ...filters,
      search: undefined,
    });
  }, [filters, handleFilterChange]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    const newPage = page + 1;
    const offset = (newPage - 1) * (filters.limit || 20);
    setPage(newPage);
    fetchCampaigns({ ...filters, offset }, true);
  }, [page, filters, fetchCampaigns]);

  // 排序选项
  const sortOptions = [
    { value: 'latest', label: t('sortLatest') },
    { value: 'popular', label: t('sortPopular') },
    { value: 'expiring_soon', label: t('sortExpiringSoon') },
    { value: 'highest_credit', label: t('sortHighestCredit') },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* 桌面端筛选侧边栏 */}
        <div className="hidden lg:col-span-1 lg:block">
          <CampaignFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            availableCategories={availableCategories}
            availableAiModels={availableAiModels}
            availableConditions={availableConditions}
            availablePlatforms={availablePlatforms}
            showSidebar={true}
          />
        </div>

        {/* 活动列表 */}
        <div className="lg:col-span-3">
          {/* 快捷筛选 */}
          <QuickFilters
            activeFilter={activeQuickFilter}
            onFilterChange={(filterId, filter) => {
              setActiveQuickFilter(filterId);
              const newFilters: CampaignListFilters = {
                status: 'published',
                includeExpired: false,
                includeDeleted: false,
                search: filters.search,
                platformIds: filters.platformIds,
                categoryTags: filters.categoryTags,
                aiModels: filters.aiModels,
                conditionTags: filters.conditionTags,
                ...filter,
              };
              handleFilterChange(newFilters);
            }}
          />

          {/* 移动端筛选触发按钮 */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <FilterTriggerButton
              activeCount={activeFilterCount}
              onClick={() => setIsFilterSheetOpen(true)}
            />

            {/* 排序下拉 */}
            <select
              value={filters.sortBy || 'latest'}
              onChange={e => handleFilterChange({
                ...filters,
                sortBy: e.target.value as CampaignListFilters['sortBy'],
              })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 结果统计（桌面端） */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-gray-600">
              {loading && page === 1
                ? t('loading')
                : t('resultsCount', { count: campaigns.length })}
            </p>

            <select
              value={filters.sortBy || 'latest'}
              onChange={e => handleFilterChange({
                ...filters,
                sortBy: e.target.value as CampaignListFilters['sortBy'],
              })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 错误状态 */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {/* 加载状态 */}
          {loading && page === 1 && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* 活动列表 */}
          {(!loading || page > 1) && (
            <>
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <CampaignCardCompact
                      key={campaign.id}
                      campaign={campaign}
                      locale={locale}
                      showPlatform={true}
                    />
                  ))}
                </div>
              ) : (
                // 统一空状态
                hasSearchQuery ? (
                  <SearchEmptyState
                    query={filters.search}
                    onClear={handleClearSearch}
                  />
                ) : activeFilterCount > 0 ? (
                  <FilterEmptyState onClearFilters={handleClearFilters} />
                ) : (
                  <SearchEmptyState onClear={handleClearFilters} />
                )
              )}

              {/* 加载更多 */}
              {hasMore && campaigns.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading && page > 1 ? (
                      <>
                        <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t('loadingMore')}</span>
                      </>
                    ) : (
                      <span>{t('loadMore')}</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 移动端底部抽屉筛选器 */}
      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onApply={() => {
          handleFilterChange(filters);
        }}
        availableCategories={availableCategories}
        availableAiModels={availableAiModels}
        availableConditions={availableConditions}
        availablePlatforms={availablePlatforms}
      />
    </div>
  );
}
