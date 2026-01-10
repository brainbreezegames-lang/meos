'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { closeApp, goHome } = useMobileNav();
  const containerRef = useRef<HTMLDivElement>(null);

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
      isEdgeSwipe = startX <= 30;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isEdgeSwipe) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);

      if (deltaX > 80 && deltaX > deltaY) {
        if ('vibrate' in navigator) navigator.vibrate(5);
        closeApp();
      }
      isEdgeSwipe = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [closeApp]);

  // Handle bottom swipe for home
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isBottomSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startY = touch.clientY;
      isBottomSwipe = touch.clientY >= window.innerHeight - 50;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isBottomSwipe) return;

      const touch = e.changedTouches[0];
      const deltaY = startY - touch.clientY;

      if (deltaY > 50) {
        if ('vibrate' in navigator) navigator.vibrate(5);
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
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
      style={{ backgroundColor: '#121218' }}
      initial={{ x: '100%', opacity: 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Debug - remove later */}
      <div style={{
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        padding: 20,
        background: 'red',
        color: 'white',
        zIndex: 9999,
        borderRadius: 8
      }}>
        DEBUG: AppView rendered for {item.label}
      </div>

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
        <div
          className="w-32 h-1 rounded-full"
          style={{ background: 'rgba(255, 255, 255, 0.3)' }}
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
