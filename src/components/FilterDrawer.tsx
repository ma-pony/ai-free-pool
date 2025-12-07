'use client';

import type { CampaignListFilters } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FilterSidebar } from './FilterSidebar';

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: CampaignListFilters;
  onFilterChange: (filters: CampaignListFilters) => void;
  availableCategories?: Array<{ id: string; name: string; slug: string }>;
  availableAiModels?: string[];
  availableConditions?: Array<{ id: string; name: string; slug: string }>;
  availablePlatforms?: Array<{ id: string; name: string; slug: string }>;
};

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  availableCategories,
  availableAiModels,
  availableConditions,
  availablePlatforms,
}: FilterDrawerProps) {
  const t = useTranslations('Filters');

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-opacity-50 animate-in fade-in fixed inset-0 z-40 bg-black transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="animate-in slide-in-from-right fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl duration-300">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="safe-area-top flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
            <button
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-95"
              aria-label={t('filters')}
            >
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4">
            <FilterSidebar
              filters={filters}
              onFilterChange={onFilterChange}
              availableCategories={availableCategories}
              availableAiModels={availableAiModels}
              availableConditions={availableConditions}
              availablePlatforms={availablePlatforms}
            />
          </div>

          {/* Footer */}
          <div className="safe-area-bottom border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="min-h-[48px] w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:scale-[0.98] active:bg-blue-800"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
