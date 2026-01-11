'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DockItem } from './DockItem';
import type { DockItem as DockItemType } from '@/types';

interface DockProps {
  items: DockItemType[];
}

export function Dock({ items }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  // Keyboard navigation for dock - moves focus between items
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    const currentIndex = itemRefs.current.findIndex(ref => ref === document.activeElement);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    itemRefs.current[nextIndex]?.focus();
  }, [items.length]);

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
    <motion.nav
      className="fixed bottom-5 left-1/2 z-[100]"
      initial={prefersReducedMotion ? { x: '-50%' } : { y: 100, x: '-50%' }}
      animate={{ y: 0, x: '-50%' }}
      transition={prefersReducedMotion ? { duration: 0.15 } : {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: 0.2
      }}
      aria-label="Application dock"
    >
      <div
        ref={dockRef}
        role="toolbar"
        aria-label="Quick launch applications"
        className="dock flex items-end gap-1 px-3 pb-2.5 pt-2"
        style={{
          borderRadius: '22px',
          background: 'var(--bg-dock)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: 'var(--shadow-dock)',
          border: '1px solid var(--border-glass-outer)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
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
      </div>

      {/* Reflection/glow underneath */}
      <div
        className="dock-reflection absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[20px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, var(--border-glass-inner) 0%, transparent 70%)',
          filter: 'blur(10px)',
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
    </motion.nav>
  );
}
