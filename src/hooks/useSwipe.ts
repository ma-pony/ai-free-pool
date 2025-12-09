/**
 * 滑动手势 Hook
 * 解决问题：手势支持有限
 *
 * 支持左右滑动、上下滑动检测
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

type SwipeConfig = {
  threshold?: number; // 触发滑动的最小距离
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
};

type SwipeState = {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
  direction: SwipeDirection;
};

export function useSwipe(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
  } = config;

  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null,
  });

  const stateRef = useRef(state);

  // Update ref in effect to avoid render-time mutation
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    setState({
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!stateRef.current.isSwiping) {
      return;
    }

    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;

    // 判断方向
    let direction: SwipeDirection = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setState(prev => ({
      ...prev,
      deltaX,
      deltaY,
      direction,
    }));
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { deltaX, deltaY, direction } = stateRef.current;

    // 检查是否超过阈值
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > threshold || absY > threshold) {
      if (direction === 'left' && absX > absY) {
        onSwipeLeft?.();
      } else if (direction === 'right' && absX > absY) {
        onSwipeRight?.();
      } else if (direction === 'up' && absY > absX) {
        onSwipeUp?.();
      } else if (direction === 'down' && absY > absX) {
        onSwipeDown?.();
      }

      onSwipe?.(direction);
    }

    setState(prev => ({
      ...prev,
      isSwiping: false,
      deltaX: 0,
      deltaY: 0,
    }));
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    state: {
      isSwiping: state.isSwiping,
      deltaX: state.deltaX,
      deltaY: state.deltaY,
      direction: state.direction,
    },
  };
}

// 简化版：只检测水平滑动
export function useHorizontalSwipe(config: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}) {
  return useSwipe({
    ...config,
    onSwipeUp: undefined,
    onSwipeDown: undefined,
  });
}
