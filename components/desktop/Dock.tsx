'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DockItem } from './DockItem';
import type { DockItem as DockItemType } from '@/types';

interface DockProps {
  items: DockItemType[];
}

export function Dock({ items }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      setMouseX(e.clientX - rect.left);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setMouseX(null);
  };

  return (
    <motion.div
      className="fixed bottom-5 left-1/2 z-[100]"
      initial={{ y: 100, x: '-50%' }}
      animate={{ y: 0, x: '-50%' }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.2
      }}
    >
      <motion.div
        ref={dockRef}
        className="flex items-end gap-1 px-3 pb-2.5 pt-2"
        style={{
          borderRadius: '22px',
          background: `
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.45) 0%,
              rgba(255, 255, 255, 0.25) 100%
            )
          `,
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: `
            0 20px 60px -15px rgba(0, 0, 0, 0.35),
            0 10px 30px -10px rgba(0, 0, 0, 0.2),
            0 0 0 0.5px rgba(255, 255, 255, 0.4),
            inset 0 0 0 0.5px rgba(255, 255, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.6)
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((item, index) => (
          <DockItem
            key={item.id}
            item={item}
            index={index}
            hoveredIndex={hoveredIndex}
            mouseX={mouseX}
            dockRef={dockRef}
            onHover={(hovered) => setHoveredIndex(hovered ? index : null)}
          />
        ))}
      </motion.div>

      {/* Reflection/glow underneath */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[20px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />
    </motion.div>
  );
}
