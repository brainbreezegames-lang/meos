'use client';

import React, { useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { DockItem } from '@/types';

interface MobileDockProps {
  items: DockItem[];
  onItemTap: (item: DockItem) => void;
  maxItems?: number;
}

export function MobileDock({ items, onItemTap, maxItems = 4 }: MobileDockProps) {
  const displayItems = items.slice(0, maxItems);
  const iconSize = 56;

  return (
    <motion.div
      className="mx-4 mb-2 relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Multi-layer glass effect */}
      <div
        className="absolute inset-0 rounded-[32px]"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          transform: 'scale(1.02)',
        }}
      />
      <div
        className="absolute inset-0 rounded-[30px]"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transform: 'scale(1.01)',
        }}
      />

      {/* Main dock surface */}
      <div
        className="relative px-5 py-4 rounded-[28px] flex items-center justify-evenly"
        style={{
          background: `linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.18) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.12) 100%
          )`,
          backdropFilter: 'blur(60px) saturate(200%)',
          WebkitBackdropFilter: 'blur(60px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 8px 20px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Top highlight */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />

        {displayItems.map((item, index) => (
          <MobileDockIcon
            key={item.id}
            item={item}
            size={iconSize}
            onTap={() => onItemTap(item)}
            delay={0.3 + index * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface MobileDockIconProps {
  item: DockItem;
  size: number;
  onTap: () => void;
  delay?: number;
}

function MobileDockIcon({ item, size, onTap, delay = 0 }: MobileDockIconProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isImageIcon = item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:');
  const cornerRadius = size * 0.22;

  // Spring animation for press
  const pressProgress = useSpring(isPressed ? 1 : 0, { stiffness: 600, damping: 30 });
  const scale = useTransform(pressProgress, [0, 1], [1, 0.85]);
  const y = useTransform(pressProgress, [0, 1], [0, 4]);

  return (
    <motion.button
      onClick={onTap}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      className="flex flex-col items-center justify-center relative"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      style={{ scale, y }}
    >
      {/* Glow effect on press */}
      <motion.div
        className="absolute inset-0 rounded-[13px]"
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          filter: 'blur(20px)',
          transform: 'scale(1.2)',
        }}
        animate={{ opacity: isPressed ? 0.6 : 0 }}
        transition={{ duration: 0.15 }}
      />

      <div
        className="overflow-hidden flex items-center justify-center relative"
        style={{
          width: size,
          height: size,
          borderRadius: cornerRadius,
          background: isImageIcon
            ? 'transparent'
            : `linear-gradient(145deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.1) 50%,
                rgba(255, 255, 255, 0.2) 100%)`,
          boxShadow: isPressed
            ? `
                0 2px 8px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `
            : `
                0 8px 24px rgba(0, 0, 0, 0.2),
                0 2px 8px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.25),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `,
          border: '0.5px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Glass highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.35) 0%,
              transparent 40%,
              transparent 60%,
              rgba(255, 255, 255, 0.08) 100%
            )`,
            borderRadius: cornerRadius,
          }}
        />

        {isImageIcon ? (
          <img
            src={item.icon}
            alt={item.label}
            className="w-full h-full object-cover"
            style={{ borderRadius: cornerRadius }}
            draggable={false}
          />
        ) : (
          <span
            className="relative z-10"
            style={{
              fontSize: size * 0.52,
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
            }}
          >
            {item.icon}
          </span>
        )}

        {/* Press highlight */}
        {isPressed && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)',
              borderRadius: cornerRadius,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>
    </motion.button>
  );
}
