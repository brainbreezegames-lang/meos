'use client';

import { useState } from 'react';
import { DockItem } from './DockItem';
import type { DockItem as DockItemType } from '@/types';

interface DockProps {
  items: DockItemType[];
}

export function Dock({ items }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className="flex items-end gap-1.5 px-3 py-2 rounded-[20px]"
        style={{
          background: 'var(--bg-dock)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid var(--border-glass-outer)',
          boxShadow: `
            var(--shadow-dock),
            inset 0 0 0 1px var(--border-glass-inner)
          `,
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {items.map((item, index) => (
          <DockItem
            key={item.id}
            item={item}
            isHovered={hoveredIndex !== null}
            neighborDistance={hoveredIndex !== null ? index - hoveredIndex : 99}
            onHover={(hovered) => setHoveredIndex(hovered ? index : null)}
          />
        ))}
      </div>
    </div>
  );
}
