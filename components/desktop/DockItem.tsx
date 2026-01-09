'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { DockItem as DockItemType } from '@/types';

interface DockItemProps {
  item: DockItemType;
  isHovered: boolean;
  neighborDistance: number; // -2, -1, 0, 1, 2 (0 = this is hovered)
  onHover: (hovered: boolean) => void;
}

function getScale(distance: number): number {
  if (distance === 0) return 1.35;
  if (Math.abs(distance) === 1) return 1.15;
  if (Math.abs(distance) === 2) return 1.05;
  return 1;
}

function getTranslateY(distance: number): number {
  if (distance === 0) return -12;
  if (Math.abs(distance) === 1) return -4;
  if (Math.abs(distance) === 2) return -2;
  return 0;
}

export function DockItem({ item, isHovered, neighborDistance, onHover }: DockItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (item.actionType === 'url') {
      window.open(item.actionValue, '_blank', 'noopener,noreferrer');
    } else if (item.actionType === 'email') {
      window.location.href = `mailto:${item.actionValue}`;
    } else if (item.actionType === 'download') {
      window.open(item.actionValue, '_blank');
    }
  };

  const scale = isHovered ? getScale(neighborDistance) : 1;
  const translateY = isHovered ? getTranslateY(neighborDistance) : 0;

  const isEmoji = item.icon.length <= 4 && /\p{Emoji}/u.test(item.icon);

  return (
    <motion.button
      className="relative flex items-center justify-center"
      style={{ transformOrigin: 'bottom center' }}
      animate={{
        scale,
        y: translateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      onMouseEnter={() => {
        onHover(true);
        setTimeout(() => setShowTooltip(true), 200);
      }}
      onMouseLeave={() => {
        onHover(false);
        setShowTooltip(false);
      }}
      onClick={handleClick}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && neighborDistance === 0 && (
          <motion.div
            className="absolute bottom-full mb-2 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none"
            style={{
              background: 'var(--bg-tooltip)',
              backdropFilter: 'blur(20px)',
              color: 'var(--text-on-dark)',
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {item.label}
            {/* Arrow */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid var(--bg-tooltip)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: isEmoji
            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 247, 0.9) 100%)'
            : 'transparent',
          boxShadow: isEmoji
            ? '0 2px 8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            : 'none',
        }}
      >
        {isEmoji ? (
          <span className="text-[26px]">{item.icon}</span>
        ) : (
          <Image
            src={item.icon}
            alt={item.label}
            width={48}
            height={48}
            className="object-cover rounded-xl"
          />
        )}
      </div>
    </motion.button>
  );
}
