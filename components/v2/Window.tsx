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
 * Uses ONLY CSS variables from design-system.css
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
          padding: isMaximized ? 0 : 'var(--ds-space-10)',
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
            top: isMaximized ? 28 : initialPosition.y,
            left: isMaximized ? 0 : initialPosition.x,
            width: isMaximized ? '100%' : initialSize.width,
            height: isMaximized ? 'calc(100% - 28px)' : initialSize.height,
            minWidth: minSize.width,
            minHeight: minSize.height,
            zIndex: isActive ? zIndex + 100 : zIndex,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--ds-window-bg)',
            border: '2px solid var(--ds-window-border)',
            borderRadius: isMaximized ? 0 : 'var(--ds-window-radius)',
            boxShadow: isActive ? 'var(--ds-shadow-window-active)' : 'var(--ds-shadow-window)',
            overflow: 'hidden',
            cursor: isMaximized ? 'default' : 'grab',
            opacity: isActive ? 1 : 0.95,
          }}
          whileDrag={{
            cursor: 'grabbing',
            boxShadow: 'var(--ds-shadow-window-drag)',
          }}
        >
          {/* Title Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-space-3)',
              padding: 'var(--ds-space-3) var(--ds-space-4)',
              background: 'var(--ds-window-header-bg)',
              borderBottom: '1px solid var(--ds-border-subtle)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              flexShrink: 0,
            }}
          >
            <TrafficLights
              onClose={handleClose}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
            />

            {/* Window title */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-space-2)',
              }}
            >
              {icon && (
                <span style={{ display: 'flex', color: 'var(--ds-text-secondary)' }}>
                  {icon}
                </span>
              )}
              <span
                style={{
                  fontSize: 'var(--ds-text-sm)',
                  fontWeight: 'var(--ds-weight-medium)',
                  fontFamily: 'var(--ds-font-body)',
                  color: 'var(--ds-text-primary)',
                  letterSpacing: 'var(--ds-tracking-tight)',
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
              background: 'var(--ds-surface-base)',
            }}
          >
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
