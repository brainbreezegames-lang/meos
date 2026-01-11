'use client';

import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { haptic } from '@/components/ui/Delight';

interface AppIconProps {
  id: string;
  icon: string;
  label: string;
  onTap: () => void;
  onLongPress?: () => void;
  isEditing?: boolean;
  size?: number;
}

const LONG_PRESS_DURATION = 500;

export function AppIcon({
  id,
  icon,
  label,
  onTap,
  onLongPress,
  isEditing = false,
  size = 60,
}: AppIconProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const isImageIcon = icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
  const cornerRadius = size * 0.22;
  // Ensure minimum 44px touch target
  const touchTargetSize = Math.max(size + 20, 44);

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePressStart = () => {
    setIsPressed(true);
    longPressTriggeredRef.current = false;

    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        onLongPress();
        if ('vibrate' in navigator) navigator.vibrate(10);
      }, LONG_PRESS_DURATION);
    }
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    clearLongPress();
  };

  const handleClick = () => {
    if (longPressTriggeredRef.current || isEditing) {
      longPressTriggeredRef.current = false;
      return;
    }
    haptic('light');
    setShowTapGlow(true);
    setTimeout(() => setShowTapGlow(false), 300);
    onTap();
  };

  const [showTapGlow, setShowTapGlow] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isEditing) {
        onTap();
      }
    }
  };

  const [imageError, setImageError] = useState(false);

  return (
    <motion.button
      type="button"
      data-app-id={id}
      aria-label={`Open ${label}${isEditing ? ' (editing mode)' : ''}`}
      aria-pressed={isPressed}
      className="flex flex-col items-center select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl"
      style={{
        width: touchTargetSize,
        minHeight: touchTargetSize + 24, // Account for label
        background: 'transparent',
        border: 'none',
        padding: 0,
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      animate={isEditing && !prefersReducedMotion ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
      transition={isEditing && !prefersReducedMotion ? { duration: 0.12, repeat: Infinity, repeatType: 'reverse' } : {}}
    >
      {/* Icon container */}
      <motion.div
        className="relative overflow-hidden flex items-center justify-center"
        animate={{ scale: isPressed && !prefersReducedMotion ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          width: size,
          height: size,
          borderRadius: cornerRadius,
          background: isImageIcon && !imageError
            ? 'transparent'
            : 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
          boxShadow: isPressed
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : showTapGlow
              ? '0 0 24px rgba(255, 255, 255, 0.5), 0 6px 20px rgba(0, 0, 0, 0.25)'
              : '0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)',
          border: '0.5px solid rgba(255, 255, 255, 0.15)',
          transition: 'box-shadow 0.15s ease-out',
        }}
        aria-hidden="true"
      >
        {isImageIcon && !imageError ? (
          <img
            src={icon}
            alt=""
            className="w-full h-full object-cover"
            style={{ borderRadius: cornerRadius }}
            draggable={false}
            onError={() => setImageError(true)}
          />
        ) : (
          <span style={{ fontSize: size * 0.5 }} role="img" aria-hidden="true">
            {imageError ? '📁' : icon}
          </span>
        )}

        {/* Delete badge */}
        {isEditing && (
          <motion.div
            className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-danger, #FF3B30)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            aria-label="Delete app"
          >
            <span className="text-xs font-bold" style={{ color: 'var(--text-on-accent, white)' }}>−</span>
          </motion.div>
        )}
      </motion.div>

      {/* Label */}
      <span
        className="text-center mt-1.5"
        style={{
          fontSize: 11,
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          color: 'var(--text-on-image, white)',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          maxWidth: size + 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
