/**
 * 可滑动轮播组件
 * 解决问题：FeaturedCarousel 没有滑动手势
 *
 * 支持：
 * - 左右滑动切换
 * - 自动播放
 * - 指示器点击
 * - 键盘导航
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHorizontalSwipe } from '@/hooks/useSwipe';

type SwipeableCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  className?: string;
};

export function SwipeableCarousel<T>({
  items,
  renderItem,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
  className = '',
}: SwipeableCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemCount = items.length;

  // 下一张
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % itemCount);
  }, [itemCount]);

  // 上一张
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  // 跳转到指定索引
  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 滑动手势
  const { handlers, state } = useHorizontalSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
    threshold: 50,
  });

  // 自动播放
  useEffect(() => {
    if (!autoPlay || isPaused || itemCount <= 1) {
      return;
    }

    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isPaused, goToNext, itemCount]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [goToNext, goToPrev]);

  if (itemCount === 0) {
    return null;
  }

  // 计算滑动偏移
  const swipeOffset = state.isSwiping ? state.deltaX : 0;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Carousel"
      aria-roledescription="carousel"
    >
      {/* 轮播内容 */}
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`,
          transitionDuration: state.isSwiping ? '0ms' : '300ms',
        }}
        {...handlers}
      >
        {items.map((item, index) => (
          <div
            key={`slide-${index}`}
            className="w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${itemCount}`}
          >
            {renderItem(item, index, index === currentIndex)}
          </div>
        ))}
      </div>

      {/* 左右箭头 */}
      {showArrows && itemCount > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute top-1/2 left-2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition-all hover:scale-110 hover:bg-white active:scale-95"
            aria-label="Previous slide"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute top-1/2 right-2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition-all hover:scale-110 hover:bg-white active:scale-95"
            aria-label="Next slide"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 指示器 */}
      {showIndicators && itemCount > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {items.map((_, index) => (
            <button
              type="button"
              key={`indicator-${index}`}
              onClick={() => goToIndex(index)}
              className={`size-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
