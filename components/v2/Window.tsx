'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TrafficLights } from './TrafficLights';

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
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
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
            background: 'var(--color-bg-base)',
            border: '2px solid var(--color-border-default)',
            borderRadius: isMaximized ? 0 : 'var(--window-radius, 14px)',
            boxShadow: isActive ? 'var(--shadow-window)' : 'var(--shadow-md)',
            overflow: 'hidden',
            cursor: isMaximized ? 'default' : 'grab',
            opacity: isActive ? 1 : 0.95,
          }}
          whileDrag={{
            cursor: 'grabbing',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Title Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              background: 'var(--color-bg-subtle)',
              borderBottom: '1px solid var(--color-border-subtle)',
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
                  fontSize: 'var(--font-size-base, 13px)',
                  fontWeight: 'var(--font-weight-medium, 500)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: 'var(--letter-spacing-tight, -0.02em)',
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
