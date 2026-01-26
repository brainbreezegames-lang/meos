'use client';

import React, { useState, useCallback, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem as DesktopItemType } from '@/types';
import { SparkleEffect, haptic } from '@/components/ui/Delight';

interface DesktopItemProps {
  item: DesktopItemType;
  onClick: (event: React.MouseEvent) => void;
  isEditing?: boolean;
}

export const DesktopItem = memo(function DesktopItem({ item, onClick, isEditing = false }: DesktopItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showClickEffect, setShowClickEffect] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Trigger delight effects
    setShowClickEffect(true);
    haptic('light');
    setTimeout(() => setShowClickEffect(false), 600);
    onClick(e);
  }, [onClick]);

  return (
    <motion.button
      onClick={handleClick}
      aria-label={`Open ${item.label}${isEditing ? ' (editing mode)' : ''}`}
      className="absolute flex flex-col items-center gap-2.5 p-3 rounded-2xl group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={false}
      whileHover={prefersReducedMotion ? {} : { y: -6 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
      transition={prefersReducedMotion ? { duration: 0 } : {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.8
      }}
    >
      {/* Click celebration effect */}
      <SparkleEffect
        trigger={showClickEffect}
        config={{
          count: 10,
          spread: 50,
          colors: ['var(--accent-primary)', '#FFD700', '#4ECDC4', '#FF6B6B', '#A78BFA'],
          duration: 500,
        }}
      />

      {/* Thumbnail Container */}
      <motion.div
        className="relative"
        whileHover={prefersReducedMotion ? {} : { scale: 1.12 }}
        transition={prefersReducedMotion ? { duration: 0 } : {
          type: 'spring',
          stiffness: 400,
          damping: 25
        }}
      >
        {/* Outer glow on hover - bolder accent color */}
        <div
          className="absolute -inset-4 rounded-[24px] opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, var(--accent-primary) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -inset-3 rounded-[22px] opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
          aria-hidden="true"
        />

        {/* Thumbnail */}
        <div
          className="relative w-[76px] h-[76px] rounded-[16px] overflow-hidden"
          style={{
            boxShadow: `
              0 8px 32px -4px rgba(0, 0, 0, 0.3),
              0 4px 12px -2px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.08)
            `,
          }}
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.label}
            fill
            className="object-cover"
            sizes="76px"
            draggable={false}
          />

          {/* Glass overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
            style={{
              background: `
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.25) 0%,
                  rgba(255, 255, 255, 0.05) 40%,
                  transparent 60%
                )
              `,
            }}
          />

          {/* Inner shadow for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>

        {/* Reflection effect */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[60px] h-[8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
      </motion.div>

      {/* Label - uses unified label system for any wallpaper */}
      <div className="relative">
        <span
          className="block text-[12px] font-bold text-center max-w-[100px] leading-[1.3] px-2.5 py-1.5 rounded-lg tracking-tight group-hover:scale-105 transition-transform duration-200"
          style={{
            color: 'var(--label-text)',
            textShadow: 'var(--label-shadow)',
            background: 'var(--label-bg)',
            backdropFilter: 'var(--label-blur)',
            WebkitBackdropFilter: 'var(--label-blur)',
          }}
        >
          {item.label}
        </span>
      </div>

      {/* Selection ring for editing mode */}
      {isEditing && (
        <motion.div
          className="absolute -inset-2 rounded-2xl pointer-events-none"
          style={{
            border: '2px dashed var(--accent-primary)',
            borderColor: 'color-mix(in srgb, var(--accent-primary) 60%, transparent)',
            background: 'color-mix(in srgb, var(--accent-primary) 5%, transparent)',
          }}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
});
