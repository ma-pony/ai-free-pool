/**
 * Mobile Detection Hook
 * Validates: Requirements 14.1
 *
 * Hook to detect mobile devices and viewport changes
 */

'use client';

import { useEffect, useState } from 'react';

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // Initial check
    checkDevice();

    // Listen for resize events
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isMobile || isTablet,
  };
}

/**
 * Hook to detect if device supports touch
 */
export function useTouchDetect() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window
      || navigator.maxTouchPoints > 0
      // @ts-ignore - for older browsers
      || navigator.msMaxTouchPoints > 0,
    );
  }, []);

  return isTouch;
}

/**
 * Hook to detect device orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      );
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect if user is on iOS
 */
export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    );
  }, []);

  return isIOS;
}

/**
 * Hook to detect if user is on Android
 */
export function useIsAndroid() {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(/Android/.test(navigator.userAgent));
  }, []);

  return isAndroid;
}
