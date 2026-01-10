'use client';

import { useRef, useEffect, useCallback } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onEdgeSwipeLeft?: () => void; // Swipe from left edge (back gesture)
  onEdgeSwipeBottom?: () => void; // Swipe up from bottom (home gesture)
  onLongPress?: (x: number, y: number) => void;
  edgeThreshold?: number;
  swipeThreshold?: number;
  longPressDelay?: number;
  enabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isEdgeLeft: boolean;
  isEdgeBottom: boolean;
}

export function useIOSGestures(config: GestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onEdgeSwipeLeft,
    onEdgeSwipeBottom,
    onLongPress,
    edgeThreshold = 20,
    swipeThreshold = 50,
    longPressDelay = 500,
    enabled = true,
  } = config;

  const touchStateRef = useRef<TouchState | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      const isEdgeLeft = touch.clientX <= edgeThreshold;
      const isEdgeBottom = touch.clientY >= window.innerHeight - 34; // Home indicator area

      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isEdgeLeft,
        isEdgeBottom,
      };

      longPressTriggeredRef.current = false;

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          if (touchStateRef.current) {
            longPressTriggeredRef.current = true;
            onLongPress(touchStateRef.current.startX, touchStateRef.current.startY);
            // Haptic feedback if available
            if ('vibrate' in navigator) {
              navigator.vibrate(10);
            }
          }
        }, longPressDelay);
      }
    },
    [enabled, edgeThreshold, onLongPress, longPressDelay]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStateRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStateRef.current.startX;
      const deltaY = touch.clientY - touchStateRef.current.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Cancel long press if finger moved
      if (distance > 10) {
        clearLongPressTimer();
      }
    },
    [enabled, clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStateRef.current) return;

      clearLongPressTimer();

      // Don't process swipe if long press was triggered
      if (longPressTriggeredRef.current) {
        touchStateRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStateRef.current.startX;
      const deltaY = touch.clientY - touchStateRef.current.startY;
      const duration = Date.now() - touchStateRef.current.startTime;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const isHorizontal = absX > absY;
      const isFastEnough = duration < 500;

      // Edge gestures take priority
      if (touchStateRef.current.isEdgeLeft && deltaX > swipeThreshold && onEdgeSwipeLeft) {
        onEdgeSwipeLeft();
        touchStateRef.current = null;
        return;
      }

      if (touchStateRef.current.isEdgeBottom && deltaY < -swipeThreshold && onEdgeSwipeBottom) {
        onEdgeSwipeBottom();
        touchStateRef.current = null;
        return;
      }

      // Regular swipes
      if (isFastEnough) {
        if (isHorizontal && absX > swipeThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else if (!isHorizontal && absY > swipeThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStateRef.current = null;
    },
    [
      enabled,
      clearLongPressTimer,
      swipeThreshold,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onEdgeSwipeLeft,
      onEdgeSwipeBottom,
    ]
  );

  const handleTouchCancel = useCallback(() => {
    clearLongPressTimer();
    touchStateRef.current = null;
    longPressTriggeredRef.current = false;
  }, [clearLongPressTimer]);

  useEffect(() => {
    if (!enabled) return;

    const options = { passive: true };

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    document.addEventListener('touchcancel', handleTouchCancel, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, clearLongPressTimer]);
}

// Hook for element-specific gesture handling
export function useElementGestures<T extends HTMLElement>(config: GestureConfig) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !config.enabled) return;

    let touchState: TouchState | null = null;
    let longPressTimer: NodeJS.Timeout | null = null;
    let longPressTriggered = false;

    const handleStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchState = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isEdgeLeft: false,
        isEdgeBottom: false,
      };

      longPressTriggered = false;

      if (config.onLongPress) {
        longPressTimer = setTimeout(() => {
          if (touchState) {
            longPressTriggered = true;
            config.onLongPress!(touchState.startX, touchState.startY);
            if ('vibrate' in navigator) {
              navigator.vibrate(10);
            }
          }
        }, config.longPressDelay || 500);
      }
    };

    const handleMove = (e: TouchEvent) => {
      if (!touchState) return;

      const touch = e.touches[0];
      const distance = Math.sqrt(
        Math.pow(touch.clientX - touchState.startX, 2) + Math.pow(touch.clientY - touchState.startY, 2)
      );

      if (distance > 10 && longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const handleEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (!touchState || longPressTriggered) {
        touchState = null;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const threshold = config.swipeThreshold || 50;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold && config.onSwipeRight) config.onSwipeRight();
        else if (deltaX < -threshold && config.onSwipeLeft) config.onSwipeLeft();
      } else {
        if (deltaY > threshold && config.onSwipeDown) config.onSwipeDown();
        else if (deltaY < -threshold && config.onSwipeUp) config.onSwipeUp();
      }

      touchState = null;
    };

    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchmove', handleMove, { passive: true });
    element.addEventListener('touchend', handleEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [config]);

  return ref;
}
