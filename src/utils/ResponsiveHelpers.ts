/**
 * Responsive Utilities
 * Validates: Requirements 14.1
 *
 * Helper utilities for responsive design and mobile optimization
 */

/**
 * Tailwind breakpoints for reference:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */

export const BREAKPOINTS = {
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
} as const;

/**
 * Check if current viewport is mobile
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if current viewport is tablet
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get responsive grid columns based on viewport
 */
export function getResponsiveColumns(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
): number {
  if (isMobileViewport()) {
    return mobile;
  }
  if (isTabletViewport()) {
    return tablet;
  }
  return desktop;
}

/**
 * Common responsive class patterns
 */
export const RESPONSIVE_CLASSES = {
  // Container padding
  containerPadding: 'px-4 sm:px-6 lg:px-8',

  // Section spacing
  sectionSpacing: 'py-8 sm:py-12 lg:py-16',

  // Grid layouts
  grid: {
    one: 'grid grid-cols-1',
    two: 'grid grid-cols-1 sm:grid-cols-2',
    three: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    four: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },

  // Gap spacing
  gap: {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-10',
  },

  // Text sizes
  text: {
    'xs': 'text-xs sm:text-sm',
    'sm': 'text-sm sm:text-base',
    'base': 'text-base sm:text-lg',
    'lg': 'text-lg sm:text-xl',
    'xl': 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
  },

  // Touch targets (minimum 44x44px for mobile)
  touchTarget: 'min-h-[44px] min-w-[44px]',

  // Hide on mobile
  hideOnMobile: 'hidden md:block',

  // Hide on desktop
  hideOnDesktop: 'block md:hidden',

  // Flex direction
  flexCol: 'flex flex-col',
  flexColToRow: 'flex flex-col md:flex-row',

  // Width constraints
  maxWidth: {
    'sm': 'max-w-screen-sm',
    'md': 'max-w-screen-md',
    'lg': 'max-w-screen-lg',
    'xl': 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    'full': 'max-w-full',
  },
} as const;

/**
 * Generate responsive class string
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
