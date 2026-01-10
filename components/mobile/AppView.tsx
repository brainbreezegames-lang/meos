'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useMobileNav } from '@/contexts/MobileNavigationContext';
import { DesktopItem, BlockData } from '@/types';
import { AppHeader } from './AppHeader';
import { AppContent } from './AppContent';

interface AppViewProps {
  item: DesktopItem;
  renderBlock?: (block: BlockData) => React.ReactNode;
  rightAction?: React.ReactNode;
}

export function AppView({ item, renderBlock, rightAction }: AppViewProps) {
  const { closeApp } = useMobileNav();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  // iOS-style parallax transforms for back gesture
  const backgroundX = useTransform(dragX, [0, 300], [0, 80]);
  const backgroundScale = useTransform(dragX, [0, 300], [0.94, 1]);
  const shadowOpacity = useTransform(dragX, [0, 300], [0.5, 0]);
  const edgeGlowOpacity = useTransform(dragX, [0, 50], [0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 400) {
      if ('vibrate' in navigator) navigator.vibrate(5);
      closeApp();
    }
  };

  return (
    <>
      {/* Shadow layer - iOS depth effect */}
      <motion.div
        className="fixed inset-0 z-[99] pointer-events-none"
        style={{
          opacity: shadowOpacity,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%)',
        }}
      />

      {/* Main app view - draggable */}
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
        style={{
          x: dragX,
          background: 'linear-gradient(180deg, #1c1c1e 0%, #000000 100%)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{
          x: '100%',
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 40,
          }
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 40,
          mass: 0.8,
        }}
      >
        {/* Edge glow indicator for swipe */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
          style={{
            opacity: edgeGlowOpacity,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
          }}
        />

        {/* Header */}
        <AppHeader
          item={item}
          onBack={closeApp}
          rightAction={rightAction}
        />

        {/* Scrollable content */}
        <AppContent
          item={item}
          renderBlock={renderBlock}
        />

        {/* iOS Home Indicator */}
        <div
          className="flex-shrink-0 flex justify-center"
          style={{
            paddingTop: 8,
            paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)',
          }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 134,
              height: 5,
              background: 'rgba(255, 255, 255, 0.25)',
            }}
            whileHover={{ background: 'rgba(255, 255, 255, 0.4)' }}
          />
        </div>
      </motion.div>
    </>
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
