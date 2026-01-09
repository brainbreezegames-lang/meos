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
      className="absolute flex flex-col items-center gap-2.5 p-3 rounded-2xl group focus:outline-none select-none"
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={false}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.94 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 0.8
      }}
    >
      {/* Thumbnail Container */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.12 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25
        }}
      >
        {/* Outer glow on hover */}
        <div
          className="absolute -inset-3 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
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

      {/* Label */}
      <div className="relative">
        <span
          className="block text-[11px] font-semibold text-center max-w-[90px] leading-[1.3] px-2 py-1 rounded-md tracking-tight"
          style={{
            color: '#FFFFFF',
            textShadow: `
              0 1px 3px rgba(0, 0, 0, 0.8),
              0 0 20px rgba(0, 0, 0, 0.6),
              0 0 40px rgba(0, 0, 0, 0.4)
            `,
            background: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
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
            border: '2px dashed rgba(0, 122, 255, 0.6)',
            background: 'rgba(0, 122, 255, 0.05)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
}
