'use client';

import type { CampaignListFilters } from '@/types/Campaign';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type FilterSidebarProps = {
  filters: CampaignListFilters;
  onFilterChange: (filters: CampaignListFilters) => void;
  availableCategories?: Array<{ id: string; name: string; slug: string }>;
  availableAiModels?: string[];
  availableConditions?: Array<{ id: string; name: string; slug: string }>;
  availablePlatforms?: Array<{ id: string; name: string; slug: string }>;
};

export function FilterSidebar({
  filters,
  onFilterChange,
  availableCategories = [],
  availableAiModels = [],
  availableConditions = [],
  availablePlatforms = [],
}: FilterSidebarProps) {
  const t = useTranslations('Filters');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    difficulty: true,
    platforms: false,
    categories: true,
    aiModels: false,
    conditions: false,
    sort: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    onFilterChange({
      ...filters,
      difficultyLevel: filters.difficultyLevel === difficulty ? undefined : difficulty,
    });
  };

  const handleCategoryToggle = (slug: string) => {
    const currentCategories = filters.categoryTags || [];
    const newCategories = currentCategories.includes(slug)
      ? currentCategories.filter(c => c !== slug)
      : [...currentCategories, slug];

    onFilterChange({
      ...filters,
      categoryTags: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleAiModelToggle = (model: string) => {
    const currentModels = filters.aiModels || [];
    const newModels = currentModels.includes(model)
      ? currentModels.filter(m => m !== model)
      : [...currentModels, model];

    onFilterChange({
      ...filters,
      aiModels: newModels.length > 0 ? newModels : undefined,
    });
  };

  const handleConditionToggle = (slug: string) => {
    const currentConditions = filters.conditionTags || [];
    const newConditions = currentConditions.includes(slug)
      ? currentConditions.filter(c => c !== slug)
      : [...currentConditions, slug];

    onFilterChange({
      ...filters,
      conditionTags: newConditions.length > 0 ? newConditions : undefined,
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    const currentPlatforms = filters.platformIds || [];
    const newPlatforms = currentPlatforms.includes(platformId)
      ? currentPlatforms.filter(p => p !== platformId)
      : [...currentPlatforms, platformId];

    onFilterChange({
      ...filters,
      platformIds: newPlatforms.length > 0 ? newPlatforms : undefined,
    });
  };

  const handleSortChange = (sortBy: 'latest' | 'popular' | 'expiring_soon' | 'highest_credit') => {
    onFilterChange({
      ...filters,
      sortBy,
    });
  };

  const handleReset = () => {
    onFilterChange({
      status: 'published',
      includeExpired: false,
      includeDeleted: false,
    });
  };

  const hasActiveFilters
    = filters.difficultyLevel
      || (filters.platformIds && filters.platformIds.length > 0)
      || (filters.categoryTags && filters.categoryTags.length > 0)
      || (filters.aiModels && filters.aiModels.length > 0)
      || (filters.conditionTags && filters.conditionTags.length > 0);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('filters')}</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Difficulty Level */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('difficulty')}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>{t('difficultyLevel')}</span>
          <span className="text-gray-500">{expandedSections.difficulty ? '−' : '+'}</span>
        </button>
        {expandedSections.difficulty && (
          <div className="space-y-2">
            {(['easy', 'medium', 'hard'] as const).map(level => (
              <label key={level} className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={filters.difficultyLevel === level}
                  onChange={() => handleDifficultyChange(level)}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{t(`difficulty_${level}`)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Platforms */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('platforms')}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>{t('platforms')}</span>
          <div className="flex items-center gap-2">
            {filters.platformIds && filters.platformIds.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {filters.platformIds.length}
              </span>
            )}
            <span className="text-gray-500">{expandedSections.platforms ? '−' : '+'}</span>
          </div>
        </button>
        {expandedSections.platforms && (
          <div className="space-y-2">
            {availablePlatforms.length > 0
              ? (
                  availablePlatforms.map(platform => (
                    <label key={platform.id} className="flex cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={filters.platformIds?.includes(platform.id) || false}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{platform.name}</span>
                    </label>
                  ))
                )
              : (
                  <p className="text-sm text-gray-500 italic">{t('noPlatforms')}</p>
                )}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>{t('categories')}</span>
          <div className="flex items-center gap-2">
            {filters.categoryTags && filters.categoryTags.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {filters.categoryTags.length}
              </span>
            )}
            <span className="text-gray-500">{expandedSections.categories ? '−' : '+'}</span>
          </div>
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {availableCategories.length > 0
              ? (
                  availableCategories.map(category => (
                    <label key={category.id} className="flex cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={filters.categoryTags?.includes(category.slug) || false}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))
                )
              : (
                  <p className="text-sm text-gray-500 italic">{t('noCategories')}</p>
                )}
          </div>
        )}
      </div>

      {/* AI Models */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('aiModels')}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>{t('aiModels')}</span>
          <div className="flex items-center gap-2">
            {filters.aiModels && filters.aiModels.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {filters.aiModels.length}
              </span>
            )}
            <span className="text-gray-500">{expandedSections.aiModels ? '−' : '+'}</span>
          </div>
        </button>
        {expandedSections.aiModels && (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableAiModels.length > 0
              ? (
                  availableAiModels.map(model => (
                    <label key={model} className="flex cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={filters.aiModels?.includes(model) || false}
                        onChange={() => handleAiModelToggle(model)}
                        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{model}</span>
                    </label>
                  ))
                )
              : (
                  <p className="text-sm text-gray-500 italic">{t('noAiModels')}</p>
                )}
          </div>
        )}
      </div>

      {/* Conditions */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('conditions')}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>{t('conditions')}</span>
          <div className="flex items-center gap-2">
            {filters.conditionTags && filters.conditionTags.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {filters.conditionTags.length}
              </span>
            )}
            <span className="text-gray-500">{expandedSections.conditions ? '−' : '+'}</span>
          </div>
        </button>
        {expandedSections.conditions && (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {availableConditions.length > 0 ? (
              <>
                {/* 按类型分组显示 */}
                {(() => {
                  const requirements = availableConditions.filter(c => c.type === 'requirement');
                  const benefits = availableConditions.filter(c => c.type === 'benefit');

                  return (
                    <>
                      {requirements.length > 0 && (
                        <div>
                          <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                            {t('requirements') || '要求'}
                          </div>
                          <div className="space-y-1">
                            {requirements.map(condition => (
                              <label key={condition.id} className="flex cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={filters.conditionTags?.includes(condition.slug) || false}
                                  onChange={() => handleConditionToggle(condition.slug)}
                                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{condition.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {benefits.length > 0 && (
                        <div>
                          <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
                            {t('benefits') || '优势'}
                          </div>
                          <div className="space-y-1">
                            {benefits.map(condition => (
                              <label key={condition.id} className="flex cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={filters.conditionTags?.includes(condition.slug) || false}
                                  onChange={() => handleConditionToggle(condition.slug)}
                                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{condition.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">{t('noConditions')}</p>
            )}
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('sort')}
          className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        >
          <span>{t('sortBy')}</span>
          <span className="text-gray-500">{expandedSections.sort ? '−' : '+'}</span>
        </button>
        {expandedSections.sort && (
          <div className="space-y-2">
            {[
              { value: 'latest', labelKey: 'sort_latest' },
              { value: 'popular', labelKey: 'sort_popular' },
              { value: 'expiring_soon', labelKey: 'sort_expiring_soon' },
              { value: 'highest_credit', labelKey: 'sort_highest_credit' },
            ].map(option => (
              <label key={option.value} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="sortBy"
                  checked={filters.sortBy === option.value || (!filters.sortBy && option.value === 'latest')}
                  onChange={() => handleSortChange(option.value as any)}
                  className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{t(option.labelKey)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
