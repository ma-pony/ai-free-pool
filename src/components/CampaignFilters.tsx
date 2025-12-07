'use client';

import type { CampaignListFilters } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FilterDrawer } from './FilterDrawer';
import { FilterSidebar } from './FilterSidebar';
import { SearchBar } from './SearchBar';

type CampaignFiltersProps = {
  filters: CampaignListFilters;
  onFilterChange: (filters: CampaignListFilters) => void;
  availableCategories?: Array<{ id: string; name: string; slug: string }>;
  availableAiModels?: string[];
  availableConditions?: Array<{ id: string; name: string; slug: string }>;
  availablePlatforms?: Array<{ id: string; name: string; slug: string }>;
  showSidebar?: boolean; // Desktop sidebar
};

export function CampaignFilters({
  filters,
  onFilterChange,
  availableCategories = [],
  availableAiModels = [],
  availableConditions = [],
  availablePlatforms = [],
  showSidebar = true,
}: CampaignFiltersProps) {
  const t = useTranslations('Filters');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSearch = (query: string) => {
    onFilterChange({
      ...filters,
      search: query || undefined,
    });
  };

  const activeFilterCount = [
    filters.difficultyLevel,
    filters.platformIds?.length,
    filters.categoryTags?.length,
    filters.aiModels?.length,
    filters.conditionTags?.length,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar and Mobile Filter Button */}
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchBar
            initialValue={filters.search || ''}
            onSearch={handleSearch}
            placeholder={t('searchPlaceholder')}
          />
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none lg:hidden"
        >
          <svg
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>{t('filters')}</span>
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      {showSidebar && (
        <div className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            availableCategories={availableCategories}
            availableAiModels={availableAiModels}
            availableConditions={availableConditions}
            availablePlatforms={availablePlatforms}
          />
        </div>
      )}

      {/* Mobile Drawer */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        availableCategories={availableCategories}
        availableAiModels={availableAiModels}
        availableConditions={availableConditions}
        availablePlatforms={availablePlatforms}
      />
    </div>
  );
}
