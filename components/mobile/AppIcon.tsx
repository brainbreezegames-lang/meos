'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AppIconProps {
  id: string;
  icon: string;
  label: string;
  onTap: () => void;
  onLongPress?: () => void;
  isEditing?: boolean;
  size?: number;
}

export function AppIcon({
  id: _id,
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

  const isImageIcon = icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
  const cornerRadius = size * 0.22;

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
      }, 500);
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
    if ('vibrate' in navigator) navigator.vibrate(3);
    onTap();
  };

  return (
    <motion.div
      className="flex flex-col items-center select-none cursor-pointer"
      style={{ width: size + 20 }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onClick={handleClick}
      animate={isEditing ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
      transition={isEditing ? { duration: 0.12, repeat: Infinity, repeatType: 'reverse' } : {}}
    >
      {/* Icon container */}
      <motion.div
        className="relative overflow-hidden flex items-center justify-center"
        animate={{ scale: isPressed ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          width: size,
          height: size,
          borderRadius: cornerRadius,
          background: isImageIcon
            ? 'transparent'
            : 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
          boxShadow: isPressed
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15)',
          border: '0.5px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {isImageIcon ? (
          <img
            src={icon}
            alt={label}
            className="w-full h-full object-cover"
            style={{ borderRadius: cornerRadius }}
            draggable={false}
          />
        ) : (
          <span style={{ fontSize: size * 0.5 }}>{icon}</span>
        )}

        {/* Delete badge */}
        {isEditing && (
          <motion.div
            className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center bg-red-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="text-white text-xs font-bold">−</span>
          </motion.div>
        )}
      </motion.div>

      {/* Label */}
      <span
        className="text-center mt-1.5 text-white"
        style={{
          fontSize: 11,
          fontWeight: 500,
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          maxWidth: size + 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
