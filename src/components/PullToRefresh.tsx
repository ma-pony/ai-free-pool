/**
 * Pull to Refresh Component
 * Validates: Requirements 14.5
 *
 * Implements pull-to-refresh functionality for mobile devices
 */

'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type PullToRefreshProps = {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
};

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh when scrolled to top
      if (window.scrollY === 0 && e.touches[0]) {
        startY.current = e.touches[0].clientY;
        setCanPull(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing || !e.touches[0]) {
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Only pull down
      if (distance > 0 && window.scrollY === 0) {
        // Prevent default scroll behavior
        e.preventDefault();

        // Apply resistance to pull distance
        const resistance = 0.5;
        setPullDistance(Math.min(distance * resistance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull || isRefreshing) {
        return;
      }

      setCanPull(false);

      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, isRefreshing, pullDistance, threshold, onRefresh, disabled]);

  const showRefreshIndicator = pullDistance > 0 || isRefreshing;
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorRotation = isRefreshing ? 360 : (pullDistance / threshold) * 360;

  return (
    <div ref={containerRef} className="relative">
      {/* Refresh Indicator */}
      {showRefreshIndicator && (
        <div
          className="absolute top-0 right-0 left-0 z-10 flex items-center justify-center transition-all"
          style={{
            height: `${Math.min(pullDistance, threshold)}px`,
            opacity: indicatorOpacity,
          }}
        >
          <div
            className={`flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${indicatorRotation}deg)`,
            }}
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: canPull ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
