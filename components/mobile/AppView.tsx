'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { AppHeader } from './AppHeader';
import { AppContent } from './AppContent';
import { useMobileNav } from '@/contexts/MobileNavigationContext';
import { DesktopItem, BlockData } from '@/types';

interface AppViewProps {
  item: DesktopItem;
  renderBlock?: (block: BlockData) => React.ReactNode;
  rightAction?: React.ReactNode;
}

export function AppView({ item, renderBlock, rightAction }: AppViewProps) {
  const { closeApp, goHome, state } = useMobileNav();
  const containerRef = useRef<HTMLDivElement>(null);

  // Edge swipe for back gesture
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0.5]);
  const scale = useTransform(x, [0, 100], [1, 0.95]);

  // Handle edge swipe back
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let isEdgeSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isEdgeSwipe = startX <= 20;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEdgeSwipe) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);

      // Only track horizontal swipes
      if (deltaX > 0 && deltaX > deltaY) {
        x.set(deltaX);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isEdgeSwipe) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;

      if (deltaX > 100) {
        closeApp();
      }

      x.set(0);
      isEdgeSwipe = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [closeApp, x]);

  // Handle bottom swipe for home
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isBottomSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startY = touch.clientY;
      // Check if touch is near bottom of screen (home indicator area)
      isBottomSwipe = touch.clientY >= window.innerHeight - 34;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isBottomSwipe) return;

      const touch = e.changedTouches[0];
      const deltaY = startY - touch.clientY;

      if (deltaY > 50) {
        goHome();
      }

      isBottomSwipe = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goHome]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(20, 20, 25, 1) 0%, rgba(30, 30, 35, 1) 100%)',
        x,
        opacity,
        scale,
      }}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 0.8,
      }}
    >
      {/* Header */}
      <AppHeader
        title={item.windowTitle || item.label}
        subtitle={item.windowSubtitle || undefined}
        onBack={closeApp}
        rightAction={rightAction}
      />

      {/* Content */}
      <AppContent item={item} renderBlock={renderBlock} />

      {/* Home indicator */}
      <div className="flex-shrink-0 flex justify-center pb-2 pt-1">
        <motion.div
          className="w-32 h-1 rounded-full"
          style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          whileHover={{ background: 'rgba(255, 255, 255, 0.5)' }}
        />
      </div>

      {/* Safe area bottom */}
      <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
    </motion.div>
  );
}

// Wrapper that handles AnimatePresence
export function AppViewContainer({
  renderBlock,
  rightAction,
}: {
  renderBlock?: (block: BlockData) => React.ReactNode;
  rightAction?: React.ReactNode;
}) {
  const { state } = useMobileNav();

  return (
    <AnimatePresence mode="wait">
      {state.screen === 'app' && state.activeApp && (
        <AppView
          key={state.activeApp.id}
          item={state.activeApp}
          renderBlock={renderBlock}
          rightAction={rightAction}
        />
      )}
    </AnimatePresence>
  );
}
