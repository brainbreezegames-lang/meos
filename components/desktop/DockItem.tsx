'use client';

import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import Image from 'next/image';
import type { DockItem as DockItemType } from '@/types';

interface DockItemProps {
  item: DockItemType;
  index: number;
  hoveredIndex: number | null;
  mouseX: number | null;
  dockRef: RefObject<HTMLDivElement | null>;
  onHover: (hovered: boolean) => void;
}

const BASE_SIZE = 52;
const MAX_SIZE = 72;
const MAGNIFICATION_RANGE = 160; // pixels from center where magnification applies

export function DockItem({ item, index, hoveredIndex, mouseX, dockRef, onHover }: DockItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  const scale = useSpring(1, {
    stiffness: 400,
    damping: 30,
    mass: 0.5
  });

  const translateY = useSpring(0, {
    stiffness: 400,
    damping: 30,
    mass: 0.5
  });

  // Calculate distance-based scale
  const getScale = useCallback(() => {
    if (mouseX === null || !itemRef.current || !dockRef.current) return 1;

    const itemRect = itemRef.current.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2 - dockRect.left;
    const distance = Math.abs(mouseX - itemCenter);

    if (distance > MAGNIFICATION_RANGE) return 1;

    // Smooth falloff using cosine
    const scaleValue = 1 + (MAX_SIZE / BASE_SIZE - 1) * Math.cos((distance / MAGNIFICATION_RANGE) * (Math.PI / 2));
    return Math.max(1, Math.min(MAX_SIZE / BASE_SIZE, scaleValue));
  }, [mouseX, dockRef]);

  useEffect(() => {
    const newScale = getScale();
    scale.set(newScale);
    translateY.set(-(newScale - 1) * BASE_SIZE * 0.5);
  }, [mouseX, hoveredIndex, getScale, scale, translateY]);

  const handleClick = () => {
    if (item.actionType === 'url') {
      window.open(item.actionValue, '_blank', 'noopener,noreferrer');
    } else if (item.actionType === 'email') {
      window.location.href = `mailto:${item.actionValue}`;
    } else if (item.actionType === 'download') {
      window.open(item.actionValue, '_blank');
    }
  };

  const handleMouseEnter = () => {
    onHover(true);
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 300);
  };

  const handleMouseLeave = () => {
    onHover(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const isEmoji = item.icon.length <= 4 && /\p{Emoji}/u.test(item.icon);
  const isHovered = hoveredIndex === index;

  return (
    <motion.button
      ref={itemRef}
      className="relative flex items-center justify-center focus:outline-none"
      style={{
        width: BASE_SIZE,
        height: BASE_SIZE,
        transformOrigin: 'bottom center',
        scale,
        y: translateY,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileTap={{ scale: 0.92 }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            className="dock-tooltip absolute bottom-full mb-3 px-3.5 py-2 rounded-lg text-[11px] font-semibold whitespace-nowrap pointer-events-none z-50"
            style={{
              background: 'var(--bg-tooltip)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: 'var(--text-on-dark)',
              boxShadow: `
                0 8px 32px -4px rgba(0, 0, 0, 0.4),
                0 0 0 0.5px var(--border-glass-inner),
                inset 0 0 0 0.5px var(--border-glass-outer)
              `,
              letterSpacing: '0.01em',
            }}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}
          >
            {item.label}
            {/* Arrow */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--bg-tooltip)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon Container */}
      <div
        className="dock-icon w-full h-full rounded-[13px] flex items-center justify-center overflow-hidden relative"
        style={{
          background: isEmoji
            ? 'var(--bg-elevated)'
            : 'transparent',
          boxShadow: isEmoji
            ? 'var(--shadow-item)'
            : `0 4px 16px -3px rgba(0, 0, 0, 0.15), 0 0 0 0.5px var(--border-glass-inner)`,
          border: isEmoji ? '1px solid var(--border-light)' : undefined,
        }}
      >
        {isEmoji ? (
          <span
            className="text-[28px] select-none"
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
            }}
          >
            {item.icon}
          </span>
        ) : (
          <>
            <Image
              src={item.icon}
              alt={item.label}
              fill
              className="object-cover"
              sizes={`${MAX_SIZE}px`}
              draggable={false}
            />
            {/* Shine overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }}
            />
          </>
        )}
      </div>

      {/* Active indicator dot */}
      <motion.div
        className="dock-icon-indicator absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
        style={{
          background: 'var(--text-secondary)',
          boxShadow: '0 0 4px var(--border-glass-inner)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 * index }}
      />
    </motion.button>
  );
}
