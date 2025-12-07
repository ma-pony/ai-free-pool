/**
 * Responsive Grid Component
 * Validates: Requirements 14.1, 14.2
 *
 * A grid component that automatically adjusts columns based on screen size
 */

import { RESPONSIVE_CLASSES } from '@/utils/ResponsiveHelpers';

type ResponsiveGridProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gridClass = columns === 1
    ? RESPONSIVE_CLASSES.grid.one
    : columns === 2
      ? RESPONSIVE_CLASSES.grid.two
      : columns === 3
        ? RESPONSIVE_CLASSES.grid.three
        : RESPONSIVE_CLASSES.grid.four;

  const gapClass = RESPONSIVE_CLASSES.gap[gap];

  return (
    <div className={`${gridClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}
