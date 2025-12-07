'use client';

import type { Campaign, CampaignListFilters, ConditionTag, Tag } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import CampaignCard from '@/components/CampaignCard';
import CampaignCardSkeleton from '@/components/CampaignCardSkeleton';
import { CampaignFilters } from '@/components/CampaignFilters';
import EmptyState from '@/components/EmptyState';
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

  // Update URL when filters change
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

  // Fetch campaigns when filters change
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

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: CampaignListFilters) => {
    setFilters(newFilters);
    setPage(1);
    updateURL(newFilters);
    fetchCampaigns({ ...newFilters, offset: 0 }, false);
  }, [fetchCampaigns, updateURL]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    const newPage = page + 1;
    const offset = (newPage - 1) * (filters.limit || 20);
    setPage(newPage);
    fetchCampaigns({ ...filters, offset }, true);
  }, [page, filters, fetchCampaigns]);

  // Sort options
  const sortOptions = [
    { value: 'latest', label: t('sortLatest') },
    { value: 'popular', label: t('sortPopular') },
    { value: 'expiring_soon', label: t('sortExpiringSoon') },
    { value: 'highest_credit', label: t('sortHighestCredit') },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-gray-600">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar (Desktop) */}
        <div className="lg:col-span-1">
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

        {/* Campaign List */}
        <div className="lg:col-span-3">
          {/* Quick Filters */}
          <QuickFilters
            activeFilter={activeQuickFilter}
            onFilterChange={(filterId, filter) => {
              setActiveQuickFilter(filterId);
              // 快捷筛选时，保留基础筛选条件，但应用新的快捷筛选
              const newFilters: CampaignListFilters = {
                status: 'published',
                includeExpired: false,
                includeDeleted: false,
                // 保留搜索、平台、分类、AI模型、条件标签
                search: filters.search,
                platformIds: filters.platformIds,
                categoryTags: filters.categoryTags,
                aiModels: filters.aiModels,
                conditionTags: filters.conditionTags,
                // 应用快捷筛选
                ...filter,
              };
              handleFilterChange(newFilters);
            }}
          />

          {/* Mobile Search and Filter */}
          <div className="mb-4 lg:hidden">
            <CampaignFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              availableCategories={availableCategories}
              availableAiModels={availableAiModels}
              availableConditions={availableConditions}
              availablePlatforms={availablePlatforms}
              showSidebar={false}
            />
          </div>

          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {loading && page === 1
                ? t('loading')
                : t('resultsCount', { count: campaigns.length })}
            </p>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy || 'latest'}
                onChange={e => handleFilterChange({
                  ...filters,
                  sortBy: e.target.value as CampaignListFilters['sortBy'],
                })}
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="size-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-center gap-2">
                <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading State (Initial) - 使用骨架屏 */}
          {loading && page === 1 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
              {[1, 2, 3, 4].map(i => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Campaign Cards Grid */}
          {!loading || page > 1 ? (
            <>
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      locale={locale}
                      showPlatform={true}
                      isFeatured={campaign.isFeatured}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State - 情感化设计 */
                <EmptyState
                  icon="🔍"
                  title={t('noCampaigns')}
                  description={t('noCampaignsDescription')}
                  actionLabel={t('clearFilters')}
                  onAction={() => handleFilterChange({
                    status: 'published',
                    includeExpired: false,
                    includeDeleted: false,
                    sortBy: 'latest',
                  })}
                />
              )}

              {/* Load More Button */}
              {hasMore && campaigns.length > 0 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading && page > 1
                      ? (
                          <>
                            <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t('loadingMore')}</span>
                          </>
                        )
                      : (
                          <>
                            <span>{t('loadMore')}</span>
                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
