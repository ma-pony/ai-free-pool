/**
 * Empty State Component
 * 情感化的空状态设计
 */
'use client';

import Link from 'next/link';

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon = '🔍',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      {/* Icon */}
      <div className="animate-in fade-in mb-4 text-6xl opacity-50 duration-500">
        {icon}
      </div>

      {/* Title */}
      <h3 className="animate-in fade-in mb-2 text-xl font-semibold text-gray-900 duration-700">
        {title}
      </h3>

      {/* Description */}
      <p className="animate-in fade-in mb-6 max-w-md text-gray-600 duration-1000">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && (actionHref || onAction) && (
        actionHref
          ? (
              <Link
                href={actionHref}
                className="animate-in fade-in rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-all duration-1000 hover:bg-primary-700 hover:shadow-lg active:scale-95"
              >
                {actionLabel}
              </Link>
            )
          : (
              <button
                onClick={onAction}
                className="animate-in fade-in rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-all duration-1000 hover:bg-primary-700 hover:shadow-lg active:scale-95"
              >
                {actionLabel}
              </button>
            )
      )}
    </div>
  );
}
