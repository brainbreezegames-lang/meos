'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';

interface WindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  children: React.ReactNode;
  onClose?: () => void;
  onFocus?: () => void;
  zIndex?: number;
}

/**
 * macOS-style draggable window
 * Uses ONLY CSS variables from design-system.css (--color-*, --shadow-*, etc.)
 */
export function Window({
  id,
  title,
  icon,
  isActive = false,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  minSize = { width: 300, height: 200 },
  children,
  onClose,
  onFocus,
  zIndex = 300,
}: WindowProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const handleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  if (isMinimized) {
    return null;
  }

  return (
    <>
      {/* Drag constraints container */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed',
          inset: 0,
          padding: isMaximized ? 0 : 40,
          pointerEvents: 'none',
          zIndex: zIndex - 1,
        }}
      />

      <AnimatePresence>
        <motion.div
          data-window-id={id}
          onClick={onFocus}
          drag={!isMaximized}
          dragConstraints={constraintsRef}
          dragElastic={0.05}
          dragMomentum={false}
          initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
          animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
          exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
          transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
          style={{
            position: 'fixed',
            top: isMaximized ? 'var(--menubar-height, 36px)' : initialPosition.y,
            left: isMaximized ? 0 : initialPosition.x,
            width: isMaximized ? '100%' : initialSize.width,
            height: isMaximized ? 'calc(100% - var(--menubar-height, 36px))' : initialSize.height,
            minWidth: minSize.width,
            minHeight: minSize.height,
            zIndex: isActive ? zIndex + 100 : zIndex,
            display: 'flex',
            flexDirection: 'column',
            background: WINDOW.background,
            border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
            borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
            boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
            overflow: 'hidden',
            cursor: isMaximized ? 'default' : 'grab',
            opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
          }}
          whileDrag={{
            cursor: 'grabbing',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Title Bar - Unified 52px height */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: `0 ${TITLE_BAR.paddingX}px`,
              height: TITLE_BAR.height,
              background: TITLE_BAR.background,
              borderBottom: TITLE_BAR.borderBottom,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              flexShrink: 0,
            }}
          >
            <TrafficLights
              onClose={handleClose}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              isMaximized={isMaximized}
            />

            {/* Window title */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {icon && (
                <span style={{ display: 'flex', color: 'var(--color-text-secondary)' }}>
                  {icon}
                </span>
              )}
              <span
                style={{
                  fontSize: TITLE_BAR.titleFontSize,
                  fontWeight: TITLE_BAR.titleFontWeight,
                  color: TITLE_BAR.titleColor,
                  letterSpacing: TITLE_BAR.titleLetterSpacing,
                  opacity: isActive ? TITLE_BAR.titleOpacityActive : TITLE_BAR.titleOpacityInactive,
                }}
              >
                {title}
              </span>
            </div>

            {/* Spacer to balance traffic lights */}
            <div style={{ width: 52 }} />
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              background: 'var(--color-bg-white)',
            }}
          >
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
