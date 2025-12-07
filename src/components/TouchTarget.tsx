/**
 * Touch Target Component
 * Validates: Requirements 14.2, 14.3
 *
 * Ensures minimum touch target size of 44x44px for mobile accessibility
 */

import type { ComponentProps, ReactNode } from 'react';

type TouchTargetProps = {
  children: ReactNode;
  as?: 'button' | 'a' | 'div';
  className?: string;
  minSize?: 'sm' | 'md' | 'lg';
} & ComponentProps<'button'> & ComponentProps<'a'> & ComponentProps<'div'>;

const MIN_SIZES = {
  sm: 'min-h-[36px] min-w-[36px]', // 36px - for compact UIs
  md: 'min-h-[44px] min-w-[44px]', // 44px - WCAG recommended
  lg: 'min-h-[48px] min-w-[48px]', // 48px - for primary actions
} as const;

export function TouchTarget({
  children,
  as: Component = 'button',
  className = '',
  minSize = 'md',
  ...props
}: TouchTargetProps) {
  const sizeClass = MIN_SIZES[minSize];
  const baseClass = 'inline-flex items-center justify-center touch-manipulation';

  return (
    <Component
      className={`${baseClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
