'use client';

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Desktop, DesktopItem as DesktopItemType } from '@/types';

interface EditableDesktopCanvasProps {
  desktop: Desktop;
  selectedItemId: string | null;
  onSelectItem: (item: DesktopItemType) => void;
  onMoveItem: (id: string, x: number, y: number) => void;
}

function DraggableItem({
  item,
  isSelected,
  onSelect,
}: {
  item: DesktopItemType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      className="absolute flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
      style={{
        left: `${item.positionX}%`,
        top: `${item.positionY}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Thumbnail */}
      <motion.div
        className="relative w-20 h-20 rounded-[14px] overflow-hidden"
        style={{
          boxShadow: isSelected ? `0 0 0 3px var(--accent-primary), var(--shadow-item)` : 'var(--shadow-item)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        whileHover={{
          scale: 1.08,
          boxShadow: isSelected
            ? `0 0 0 3px var(--accent-primary), var(--shadow-item-hover)`
            : 'var(--shadow-item-hover)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Image
          src={item.thumbnailUrl}
          alt={item.label}
          fill
          className="object-cover pointer-events-none"
          sizes="80px"
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

      {/* Selection indicator */}
      {isSelected && (
        <div
          className="absolute -inset-2 rounded-2xl border-2 pointer-events-none"
          style={{ borderColor: 'var(--accent-primary)' }}
        />
      )}
    </motion.div>
  );
}

export function EditableDesktopCanvas({
  desktop,
  selectedItemId,
  onSelectItem,
  onMoveItem,
}: EditableDesktopCanvasProps) {
  const [_draggedId, setDraggedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const id = active.id as string;

      if (delta.x === 0 && delta.y === 0) {
        setDraggedId(null);
        return;
      }

      const item = desktop.items.find((i) => i.id === id);
      if (!item) {
        setDraggedId(null);
        return;
      }

      // Get container dimensions
      const container = document.getElementById('desktop-canvas');
      if (!container) {
        setDraggedId(null);
        return;
      }

      const rect = container.getBoundingClientRect();

      // Calculate new position as percentage
      const deltaXPercent = (delta.x / rect.width) * 100;
      const deltaYPercent = (delta.y / rect.height) * 100;

      const newX = Math.max(5, Math.min(95, item.positionX + deltaXPercent));
      const newY = Math.max(5, Math.min(95, item.positionY + deltaYPercent));

      onMoveItem(id, newX, newY);
      setDraggedId(null);
    },
    [desktop.items, onMoveItem]
  );

  const backgroundStyle = desktop.backgroundUrl
    ? {
        backgroundImage: `url(${desktop.backgroundUrl})`,
        backgroundSize: desktop.backgroundPosition,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)',
      };

  return (
    <div
      id="desktop-canvas"
      className="fixed inset-0 pt-14 pr-80"
      style={backgroundStyle}
      onClick={() => onSelectItem(null as unknown as DesktopItemType)}
    >
      {/* Overlay */}
      {desktop.backgroundOverlay && (
        <div
          className="absolute inset-0"
          style={{ background: desktop.backgroundOverlay }}
        />
      )}

      {/* Items */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative w-full h-full">
          {desktop.items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelectItem(item)}
            />
          ))}
        </div>
      </DndContext>

      {/* Empty state */}
      {desktop.items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <span className="text-3xl text-white/50">+</span>
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">Add your first project</p>
              <p className="text-white/60 text-sm">
                Click &quot;+ Add&quot; in the sidebar to get started
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
