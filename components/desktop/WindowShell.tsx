'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useDragControls, useReducedMotion, AnimatePresence } from 'framer-motion';
import { WINDOW, TITLE_BAR, TITLE_BAR_DARK, ANIMATION, SPRING, REDUCED_MOTION } from './windowStyles';
import { TrafficLights } from './TrafficLights';
import { playSound } from '@/lib/sounds';

/**
 * UNIFIED WINDOW SHELL - Single source of truth for ALL windows
 *
 * ALL goOS windows MUST use this component. No exceptions.
 * This ensures:
 * - Consistent traffic lights (close/minimize/maximize)
 * - Consistent drag behavior (Framer Motion)
 * - Consistent border radius, shadows, backgrounds
 * - Consistent animations
 */

export interface WindowShellProps {
  children: React.ReactNode;

  // Identity
  id?: string;
  title: string;
  icon?: React.ReactNode;

  // Window state
  isActive?: boolean;
  isMaximized?: boolean;
  zIndex?: number;

  // Callbacks
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;

  // Appearance
  variant?: 'light' | 'dark'; // Title bar style: light = cream, dark = dark brown
  titleBarContent?: React.ReactNode; // Extra content after title in title bar
  titleBarRight?: React.ReactNode; // Content on right side of title bar
  hideTrafficLights?: boolean;
  showAllTrafficLights?: boolean; // Show minimize/maximize or just close

  // Sizing
  width?: string | number;
  height?: string | number;
  minWidth?: number;
  minHeight?: number;
  defaultPosition?: { x: number; y: number }; // For initial offset from center

  // Footer
  footer?: React.ReactNode;
}

export function WindowShell({
  children,
  id,
  title,
  icon,
  isActive = true,
  isMaximized = false,
  zIndex = 100,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  variant = 'dark',
  titleBarContent,
  titleBarRight,
  hideTrafficLights = false,
  showAllTrafficLights = true,
  width = 'min(800px, 90vw)',
  height = 'min(600px, 80vh)',
  minWidth = 320,
  minHeight = 200,
  defaultPosition = { x: 0, y: 0 },
  footer,
}: WindowShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Title bar config based on variant
  const titleBar = variant === 'dark' ? TITLE_BAR_DARK : TITLE_BAR;

  // Start drag from title bar
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (isMaximized) return;
    dragControls.start(e);
    playSound('drag');
  }, [dragControls, isMaximized]);

  // Handle window focus
  const handleWindowClick = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  // Animation props
  const animationProps = prefersReducedMotion
    ? {
        initial: ANIMATION.reducedInitial,
        animate: ANIMATION.reducedAnimate,
        exit: ANIMATION.reducedExit,
        transition: ANIMATION.reducedTransition,
      }
    : {
        initial: ANIMATION.initial,
        animate: ANIMATION.animate,
        exit: ANIMATION.exit,
        transition: ANIMATION.transition,
      };

  return (
    <>
      {/* Constraints container - covers viewport */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex,
        }}
      />

      {/* Window positioning container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex,
          padding: isMaximized ? 0 : 'var(--spacing-window-padding, 40px)',
          paddingTop: isMaximized ? 'var(--menubar-height, 36px)' : 'calc(var(--menubar-height, 36px) + 20px)',
          paddingBottom: isMaximized ? 'var(--zen-dock-offset, 80px)' : 'calc(var(--zen-dock-offset, 80px) + 20px)',
        }}
      >
        <motion.div
          role="dialog"
          aria-label={title}
          aria-modal="false"
          {...animationProps}
          drag={!isMaximized}
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.1}
          dragConstraints={constraintsRef}
          onMouseDown={handleWindowClick}
          style={{
            position: 'relative',
            width: isMaximized ? '100%' : width,
            height: isMaximized ? '100%' : height,
            minWidth: isMaximized ? undefined : minWidth,
            minHeight: isMaximized ? undefined : minHeight,
            x: isMaximized ? 0 : defaultPosition.x,
            y: isMaximized ? 0 : defaultPosition.y,

            // Window styles from unified system
            background: WINDOW.background,
            border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
            borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
            boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
            opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,

            // Layout
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {/* Title Bar */}
          <div
            onPointerDown={handleDragStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${titleBar.paddingX}px`,
              height: titleBar.height,
              background: titleBar.background,
              borderBottom: titleBar.borderBottom,
              // No border-radius here - outer container handles it with overflow: hidden
              gap: 12,
              cursor: isMaximized ? 'default' : 'grab',
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            {/* Traffic Lights */}
            {!hideTrafficLights && (
              <TrafficLights
                onClose={onClose}
                onMinimize={onMinimize}
                onMaximize={onMaximize}
                isMaximized={isMaximized}
                showAll={showAllTrafficLights}
                variant="macos"
              />
            )}

            {/* Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              {icon}
              <span
                style={{
                  fontSize: titleBar.titleFontSize,
                  fontWeight: titleBar.titleFontWeight,
                  fontFamily: 'var(--font-body)',
                  color: titleBar.titleColor,
                  letterSpacing: titleBar.titleLetterSpacing,
                  opacity: isActive ? titleBar.titleOpacityActive : titleBar.titleOpacityInactive,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </span>

              {/* Extra content after title */}
              {titleBarContent}
            </div>

            {/* Right side content */}
            {titleBarRight && (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onPointerDown={(e) => e.stopPropagation()} // Don't drag when clicking these
              >
                {titleBarRight}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderTop: '1px solid var(--color-border-subtle)',
                background: 'var(--color-bg-subtle)',
                fontSize: 'var(--font-size-xs, 10px)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                flexShrink: 0,
              }}
            >
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

export default WindowShell;
