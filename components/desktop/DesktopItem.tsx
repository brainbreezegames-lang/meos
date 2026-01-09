'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem as DesktopItemType } from '@/types';

interface DesktopItemProps {
  item: DesktopItemType;
  onClick: (event: React.MouseEvent) => void;
  isEditing?: boolean;
}

export function DesktopItem({ item, onClick, isEditing = false }: DesktopItemProps) {
  return (
    <motion.button
      onClick={(e) => onClick(e)}
      className="absolute flex flex-col items-center gap-2 p-2 rounded-lg group focus:outline-none"
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Thumbnail */}
      <motion.div
        className="relative w-20 h-20 rounded-[14px] overflow-hidden"
        style={{
          boxShadow: 'var(--shadow-item)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        whileHover={{
          scale: 1.08,
          boxShadow: 'var(--shadow-item-hover)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Image
          src={item.thumbnailUrl}
          alt={item.label}
          fill
          className="object-cover"
          sizes="80px"
        />

        {/* Subtle inner glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
      </motion.div>

      {/* Label */}
      <span
        className="text-[11px] font-medium text-center max-w-[100px] leading-tight px-1.5 py-0.5 rounded text-shadow-desktop"
        style={{
          color: 'var(--text-on-image)',
          background: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        {item.label}
      </span>

      {/* Edit mode indicator */}
      {isEditing && (
        <div
          className="absolute -inset-1 rounded-xl border-2 border-dashed pointer-events-none"
          style={{ borderColor: 'var(--accent-primary)' }}
        />
      )}
    </motion.button>
  );
}
