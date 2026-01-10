'use client';

import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasTouchScreen: boolean;
  isLoading: boolean;
}

export function useMobileDetection(): MobileDetectionResult {
  const [result, setResult] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    hasTouchScreen: false,
    isLoading: true,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || '';

    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const isMediumScreen = window.innerWidth <= 1024 && window.innerWidth > 768;

    // Mobile = small screen + touch OR mobile user agent
    const isMobile = (isSmallScreen && hasTouchScreen) || isIOS || (isAndroid && isSmallScreen);
    const isTablet = isMediumScreen && hasTouchScreen;

    setResult({
      isMobile,
      isTablet,
      isIOS,
      isAndroid,
      hasTouchScreen,
      isLoading: false,
    });

    // Listen for resize events
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 768;
      const mediumScreen = window.innerWidth <= 1024 && window.innerWidth > 768;

      setResult(prev => ({
        ...prev,
        isMobile: (smallScreen && prev.hasTouchScreen) || prev.isIOS || (prev.isAndroid && smallScreen),
        isTablet: mediumScreen && prev.hasTouchScreen,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return result;
}

// Server-side detection helper (for use in server components)
export function detectMobileFromUserAgent(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}
