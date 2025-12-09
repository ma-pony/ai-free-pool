/**
 * 移动端筛选触发按钮
 * 配合 FilterBottomSheet 使用
 */

'use client';

import { useTranslations } from 'next-intl';

type FilterTriggerButtonProps = {
  activeCount: number;
  onClick: () => void;
};

export function FilterTriggerButton({ activeCount, onClick }: FilterTriggerButtonProps) {
  const t = useTranslations('Filters');

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
    >
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <span>{t('filters')}</span>
      {activeCount > 0 && (
        <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}
