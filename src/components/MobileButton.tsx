/**
 * Mobile-Optimized Button Component
 * Validates: Requirements 14.2, 14.3
 *
 * Button component optimized for mobile touch interactions
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type MobileButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}: MobileButtonProps) {
  const baseClass = 'inline-flex items-center justify-center font-medium rounded-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 size-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}
