/**
 * 移动端底部抽屉筛选器
 * 解决问题：移动端筛选器体验差
 *
 * 设计原则：
 * - 底部抽屉模式，符合移动端操作习惯
 * - 支持滑动关闭手势
 * - 实时显示已选筛选数量
 */

'use client';

import type { CampaignListFilters, ConditionTag, Tag } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

type FilterBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: CampaignListFilters;
  onFilterChange: (filters: CampaignListFilters) => void;
  onApply: () => void;
  availableCategories?: Tag[];
  availableAiModels?: string[];
  availableConditions?: ConditionTag[];
  availablePlatforms?: Platform[];
};

export function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  availableCategories = [],
  availableAiModels = [],
  availableConditions = [],
  availablePlatforms = [],
}: FilterBottomSheetProps) {
  const t = useTranslations('Filters');
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 计算已选筛选数量
  const activeFilterCount = [
    filters.difficultyLevel,
    filters.platformIds?.length,
    filters.categoryTags?.length,
    filters.aiModels?.length,
    filters.conditionTags?.length,
  ].filter(Boolean).length;

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 滑动关闭手势
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setStartY(touch.clientY);
      setIsDragging(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) {
      return;
    }
    const touch = e.touches[0];
    if (touch) {
      const diff = touch.clientY - startY;
      if (diff > 0) {
        setCurrentY(diff);
      }
    }
  }, [isDragging, startY]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
  }, [currentY, onClose]);

  // 重置筛选
  const handleReset = () => {
    onFilterChange({
      status: 'published',
      includeExpired: false,
      includeDeleted: false,
      sortBy: 'latest',
    });
  };

  // 应用并关闭
  const handleApply = () => {
    onApply();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 底部抽屉 */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl bg-white shadow-2xl transition-transform duration-300"
        style={{
          transform: `translateY(${currentY}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 拖动指示器 */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
            {activeFilterCount > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={handleReset}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
            type="button"
          >
            {t('clearAll')}
          </button>
        </div>

        {/* 筛选内容 */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-4">
          {/* 难度等级 */}
          <FilterSection title={t('difficultyLevel')}>
            <div className="flex flex-wrap gap-2">
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <FilterChip
                  key={level}
                  label={t(`difficulty_${level}`)}
                  icon={level === 'easy' ? '😊' : level === 'medium' ? '😐' : '😰'}
                  isSelected={filters.difficultyLevel === level}
                  onClick={() => onFilterChange({
                    ...filters,
                    difficultyLevel: filters.difficultyLevel === level ? undefined : level,
                  })}
                />
              ))}
            </div>
          </FilterSection>

          {/* 平台 */}
          {availablePlatforms.length > 0 && (
            <FilterSection title={t('platforms')} count={filters.platformIds?.length}>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map(platform => (
                  <FilterChip
                    key={platform.id}
                    label={platform.name}
                    isSelected={filters.platformIds?.includes(platform.id) || false}
                    onClick={() => {
                      const current = filters.platformIds || [];
                      const updated = current.includes(platform.id)
                        ? current.filter(id => id !== platform.id)
                        : [...current, platform.id];
                      onFilterChange({
                        ...filters,
                        platformIds: updated.length > 0 ? updated : undefined,
                      });
                    }}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* 分类 */}
          {availableCategories.length > 0 && (
            <FilterSection title={t('categories')} count={filters.categoryTags?.length}>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    isSelected={filters.categoryTags?.includes(category.slug) || false}
                    onClick={() => {
                      const current = filters.categoryTags || [];
                      const updated = current.includes(category.slug)
                        ? current.filter(s => s !== category.slug)
                        : [...current, category.slug];
                      onFilterChange({
                        ...filters,
                        categoryTags: updated.length > 0 ? updated : undefined,
                      });
                    }}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* AI 模型 */}
          {availableAiModels.length > 0 && (
            <FilterSection title={t('aiModels')} count={filters.aiModels?.length}>
              <div className="flex flex-wrap gap-2">
                {availableAiModels.map(model => (
                  <FilterChip
                    key={model}
                    label={model}
                    isSelected={filters.aiModels?.includes(model) || false}
                    onClick={() => {
                      const current = filters.aiModels || [];
                      const updated = current.includes(model)
                        ? current.filter(m => m !== model)
                        : [...current, model];
                      onFilterChange({
                        ...filters,
                        aiModels: updated.length > 0 ? updated : undefined,
                      });
                    }}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* 条件标签 */}
          {availableConditions.length > 0 && (
            <FilterSection title={t('conditions')} count={filters.conditionTags?.length}>
              <div className="flex flex-wrap gap-2">
                {availableConditions.map(condition => (
                  <FilterChip
                    key={condition.id}
                    label={condition.name}
                    isSelected={filters.conditionTags?.includes(condition.slug) || false}
                    onClick={() => {
                      const current = filters.conditionTags || [];
                      const updated = current.includes(condition.slug)
                        ? current.filter(s => s !== condition.slug)
                        : [...current, condition.slug];
                      onFilterChange({
                        ...filters,
                        conditionTags: updated.length > 0 ? updated : undefined,
                      });
                    }}
                  />
                ))}
              </div>
            </FilterSection>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="safe-area-bottom border-t border-gray-200 p-4">
          <button
            onClick={handleApply}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            type="button"
          >
            {t('apply')}
            {' '}
            {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>
    </>
  );
}

// 筛选区块组件
function FilterSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {count && count > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// 筛选标签组件
function FilterChip({
  label,
  icon,
  isSelected,
  onClick,
}: {
  label: string;
  icon?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {isSelected && (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
