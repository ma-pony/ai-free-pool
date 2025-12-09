/**
 * 统一空状态组件 V2
 * 解决问题：空状态设计不统一
 *
 * 提供多种预设样式和自定义选项
 */

'use client';

import Link from 'next/link';
import { Button } from '../atoms/Button';

type EmptyStateVariant = 'default' | 'search' | 'filter' | 'error' | 'offline';

type EmptyStateProps = {
  variant?: EmptyStateVariant;
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
};

// 预设配置
const PRESETS: Record<EmptyStateVariant, { icon: string; defaultTitle: string }> = {
  default: {
    icon: '📭',
    defaultTitle: '暂无内容',
  },
  search: {
    icon: '🔍',
    defaultTitle: '未找到结果',
  },
  filter: {
    icon: '🎯',
    defaultTitle: '没有匹配的内容',
  },
  error: {
    icon: '😵',
    defaultTitle: '出错了',
  },
  offline: {
    icon: '📡',
    defaultTitle: '网络连接失败',
  },
};

export function EmptyStateV2({
  variant = 'default',
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  const preset = PRESETS[variant];
  const displayIcon = icon || preset.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {/* 图标 */}
      <div className="mb-4 text-6xl">{displayIcon}</div>

      {/* 标题 */}
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        {title || preset.defaultTitle}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="mb-6 max-w-md text-gray-600">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            actionHref ? (
              <Link href={actionHref}>
                <Button variant="primary">
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button variant="primary" onClick={onAction}>
                {actionLabel}
              </Button>
            )
          )}

          {secondaryActionLabel && (
            secondaryActionHref ? (
              <Link href={secondaryActionHref}>
                <Button variant="outline">
                  {secondaryActionLabel}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// 预设组件
export function SearchEmptyState({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyStateV2
      variant="search"
      title={query ? `未找到 "${query}" 相关结果` : '未找到结果'}
      description="试试其他关键词，或者调整筛选条件"
      actionLabel="清除搜索"
      onAction={onClear}
    />
  );
}

export function FilterEmptyState({
  onClearFilters,
}: {
  onClearFilters?: () => void;
}) {
  return (
    <EmptyStateV2
      variant="filter"
      title="没有匹配的内容"
      description="当前筛选条件下没有找到内容，试试调整筛选条件"
      actionLabel="清除筛选"
      onAction={onClearFilters}
    />
  );
}

export function ErrorEmptyState({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <EmptyStateV2
      variant="error"
      title="加载失败"
      description="抱歉，加载内容时出现问题，请稍后重试"
      actionLabel="重试"
      onAction={onRetry}
    />
  );
}
