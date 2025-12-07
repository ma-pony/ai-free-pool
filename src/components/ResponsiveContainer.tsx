/**
 * Responsive Container Component
 * Validates: Requirements 14.1
 *
 * A flexible container component that adapts to different screen sizes
 */

import { RESPONSIVE_CLASSES } from '@/utils/ResponsiveHelpers';

type ResponsiveContainerProps = {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
};

export function ResponsiveContainer({
  children,
  maxWidth = 'xl',
  padding = true,
  className = '',
}: ResponsiveContainerProps) {
  const paddingClass = padding ? RESPONSIVE_CLASSES.containerPadding : '';
  const maxWidthClass = RESPONSIVE_CLASSES.maxWidth[maxWidth];

  return (
    <div className={`mx-auto w-full ${maxWidthClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}
