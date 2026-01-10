'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DockItem } from '@/types';

interface MobileDockProps {
  items: DockItem[];
  onItemTap: (item: DockItem) => void;
  maxItems?: number;
}

export function MobileDock({ items, onItemTap, maxItems = 4 }: MobileDockProps) {
  const displayItems = items.slice(0, maxItems);
  const iconSize = 60;

  return (
    <div
      className="mx-4 mb-2 px-4 py-3 rounded-[28px] flex items-center justify-evenly"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      }}
    >
      {displayItems.map((item, index) => (
        <MobileDockIcon
          key={item.id}
          item={item}
          size={iconSize}
          onTap={() => onItemTap(item)}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}

interface MobileDockIconProps {
  item: DockItem;
  size: number;
  onTap: () => void;
  delay?: number;
}

function MobileDockIcon({ item, size, onTap, delay = 0 }: MobileDockIconProps) {
  const isImageIcon = item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:');

  return (
    <motion.button
      onClick={onTap}
      className="flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      whileTap={{ scale: 0.9 }}
    >
      <div
        className="overflow-hidden flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.225,
          background: isImageIcon ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        {isImageIcon ? (
          <img
            src={item.icon}
            alt={item.label}
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
            {item.icon}
          </span>
        )}
      </div>
    </motion.button>
  );
}
