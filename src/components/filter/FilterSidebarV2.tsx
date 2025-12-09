/**
 * FilterSidebar V2 - 带状态持久化
 * 解决问题：筛选器展开状态刷新后丢失
 */

'use client';

import type { CampaignListFilters, ConditionTag, Tag } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { useTranslations } from 'next-intl';
import { useFilterExpandState } from '@/hooks/usePersistedState';

type FilterSidebarV2Props = {
  filters: CampaignListFilters;
  onFilterChange: (filters: CampaignListFilters) => void;
  availableCategories?: Tag[];
  availableAiModels?: string[];
  availableConditions?: ConditionTag[];
  availablePlatforms?: Platform[];
};

export function FilterSidebarV2({
  filters,
  onFilterChange,
  availableCategories = [],
  availableAiModels = [],
  availableConditions = [],
  availablePlatforms = [],
}: FilterSidebarV2Props) {
  const t = useTranslations('Filters');

  // 使用持久化的展开状态
  const { isExpanded, toggleSection } = useFilterExpandState('campaign-filters', {
    difficulty: true,
    platforms: true,
    categories: true,
    aiModels: false,
    conditions: false,
    sort: true,
  });

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    onFilterChange({
      ...filters,
      difficultyLevel: filters.difficultyLevel === difficulty ? undefined : difficulty,
    });
  };

  const handleCategoryToggle = (slug: string) => {
    const current = filters.categoryTags || [];
    const updated = current.includes(slug)
      ? current.filter(c => c !== slug)
      : [...current, slug];
    onFilterChange({
      ...filters,
      categoryTags: updated.length > 0 ? updated : undefined,
    });
  };

  const handleAiModelToggle = (model: string) => {
    const current = filters.aiModels || [];
    const updated = current.includes(model)
      ? current.filter(m => m !== model)
      : [...current, model];
    onFilterChange({
      ...filters,
      aiModels: updated.length > 0 ? updated : undefined,
    });
  };

  const handleConditionToggle = (slug: string) => {
    const current = filters.conditionTags || [];
    const updated = current.includes(slug)
      ? current.filter(c => c !== slug)
      : [...current, slug];
    onFilterChange({
      ...filters,
      conditionTags: updated.length > 0 ? updated : undefined,
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    const current = filters.platformIds || [];
    const updated = current.includes(platformId)
      ? current.filter(p => p !== platformId)
      : [...current, platformId];
    onFilterChange({
      ...filters,
      platformIds: updated.length > 0 ? updated : undefined,
    });
  };

  const handleSortChange = (sortBy: 'latest' | 'popular' | 'expiring_soon' | 'highest_credit') => {
    onFilterChange({ ...filters, sortBy });
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
            type="button"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Difficulty Level */}
      <FilterSection
        title={t('difficultyLevel')}
        isExpanded={isExpanded('difficulty')}
        onToggle={() => toggleSection('difficulty')}
      >
        <div className="space-y-2">
          {(['easy', 'medium', 'hard'] as const).map(level => (
            <FilterCheckbox
              key={level}
              label={t(`difficulty_${level}`)}
              checked={filters.difficultyLevel === level}
              onChange={() => handleDifficultyChange(level)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Platforms */}
      {availablePlatforms.length > 0 && (
        <FilterSection
          title={t('platforms')}
          count={filters.platformIds?.length}
          isExpanded={isExpanded('platforms')}
          onToggle={() => toggleSection('platforms')}
        >
          <div className="space-y-2">
            {availablePlatforms.map(platform => (
              <FilterCheckbox
                key={platform.id}
                label={platform.name}
                checked={filters.platformIds?.includes(platform.id) || false}
                onChange={() => handlePlatformToggle(platform.id)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Categories */}
      {availableCategories.length > 0 && (
        <FilterSection
          title={t('categories')}
          count={filters.categoryTags?.length}
          isExpanded={isExpanded('categories')}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-2">
            {availableCategories.map(category => (
              <FilterCheckbox
                key={category.id}
                label={category.name}
                checked={filters.categoryTags?.includes(category.slug) || false}
                onChange={() => handleCategoryToggle(category.slug)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* AI Models */}
      {availableAiModels.length > 0 && (
        <FilterSection
          title={t('aiModels')}
          count={filters.aiModels?.length}
          isExpanded={isExpanded('aiModels')}
          onToggle={() => toggleSection('aiModels')}
        >
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableAiModels.map(model => (
              <FilterCheckbox
                key={model}
                label={model}
                checked={filters.aiModels?.includes(model) || false}
                onChange={() => handleAiModelToggle(model)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Conditions */}
      {availableConditions.length > 0 && (
        <FilterSection
          title={t('conditions')}
          count={filters.conditionTags?.length}
          isExpanded={isExpanded('conditions')}
          onToggle={() => toggleSection('conditions')}
        >
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {availableConditions.map(condition => (
              <FilterCheckbox
                key={condition.id}
                label={condition.name}
                checked={filters.conditionTags?.includes(condition.slug) || false}
                onChange={() => handleConditionToggle(condition.slug)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sort Options */}
      <FilterSection
        title={t('sortBy')}
        isExpanded={isExpanded('sort')}
        onToggle={() => toggleSection('sort')}
        noBorder
      >
        <div className="space-y-2">
          {[
            { value: 'latest', labelKey: 'sort_latest' as const },
            { value: 'popular', labelKey: 'sort_popular' as const },
            { value: 'expiring_soon', labelKey: 'sort_expiring_soon' as const },
            { value: 'highest_credit', labelKey: 'sort_highest_credit' as const },
          ].map(option => (
            <FilterRadio
              key={option.value}
              name="sortBy"
              label={t(option.labelKey)}
              checked={filters.sortBy === option.value || (!filters.sortBy && option.value === 'latest')}
              onChange={() => handleSortChange(option.value as 'latest' | 'popular' | 'expiring_soon' | 'highest_credit')}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// 筛选区块组件
function FilterSection({
  title,
  count,
  isExpanded,
  onToggle,
  noBorder = false,
  children,
}: {
  title: string;
  count?: number;
  isExpanded: boolean;
  onToggle: () => void;
  noBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`mb-4 ${noBorder ? '' : 'border-b border-gray-200 pb-4'}`}>
      <button
        onClick={onToggle}
        className="mb-2 flex w-full items-center justify-between text-sm font-medium text-gray-900"
        type="button"
      >
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {count && count > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {count}
            </span>
          )}
          <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
        </div>
      </button>
      {isExpanded && children}
    </div>
  );
}

// 复选框组件
function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
}

// 单选框组件
function FilterRadio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center rounded px-1 py-1 transition-colors hover:bg-gray-50">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-4 border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
}
