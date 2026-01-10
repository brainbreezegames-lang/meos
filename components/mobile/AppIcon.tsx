'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AppIconProps {
  id: string;
  icon: string; // URL or emoji
  label: string;
  onTap: () => void;
  onLongPress?: () => void;
  isEditing?: boolean;
  size?: number;
}

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

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    longPressTriggeredRef.current = false;

    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        onLongPress();
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }, 500);
    }
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!longPressTriggeredRef.current) {
      onTap();
    }
  }, [onTap]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press if finger moves
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Check if icon is an image URL or emoji
  const isImageIcon = icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      style={{ width: size + 16 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
      animate={isEditing ? { rotate: [-1, 1, -1] } : { rotate: 0 }}
      transition={isEditing ? { duration: 0.15, repeat: Infinity, repeatType: 'reverse' } : {}}
    >
      {/* Icon container */}
      <motion.div
        className="relative"
        animate={{
          scale: isPressed ? 0.9 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        <div
          className="overflow-hidden flex items-center justify-center"
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.225, // iOS corner radius ratio
            background: isImageIcon ? 'transparent' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 0 0 0.5px rgba(255, 255, 255, 0.1)',
          }}
        >
          {isImageIcon ? (
            <img
              src={icon}
              alt={label}
              className="w-full h-full object-cover"
              style={{ borderRadius: size * 0.225 }}
              draggable={false}
            />
          ) : (
            <span
              style={{
                fontSize: size * 0.5,
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
              }}
            >
              {icon}
            </span>
          )}
        </div>

        {/* Delete badge (when editing) */}
        {isEditing && (
          <motion.div
            className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255, 59, 48, 0.9)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <span className="text-white text-xs font-bold">−</span>
          </motion.div>
        )}
      </motion.div>

      {/* Label */}
      <span
        className="text-center leading-tight truncate w-full px-1"
        style={{
          fontSize: 11,
          color: 'white',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
