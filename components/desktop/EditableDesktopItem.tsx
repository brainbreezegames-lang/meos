'use client';

import React, { useState, useRef, memo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem as DesktopItemType } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { ContextMenu, useContextMenu } from '@/components/editing/ContextMenu';

interface EditableDesktopItemProps {
  item: DesktopItemType;
  onClick: (event: React.MouseEvent) => void;
  zIndex: number;
  onBringToFront: () => void;
}

function EditableDesktopItemComponent({
  item,
  onClick,
  zIndex,
  onBringToFront,
}: EditableDesktopItemProps) {
  const context = useEditContextSafe();
  const isOwner = context?.isOwner ?? false;

  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const { position: contextMenuPos, showContextMenu, hideContextMenu } = useContextMenu();

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setHasDragged(false);
    onBringToFront();
  };

  const handleDragStart = () => {
    if (!isOwner) return;
    setIsDragging(true);
  };

  const handleDrag = () => {
    if (!isOwner) return;
    setHasDragged(true);
  };

  const handleDragEnd = () => {
    if (!isOwner) return;
    setIsDragging(false);

    // Calculate new position as percentage
    if (hasDragged && containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const rect = containerRef.current.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      // Get the current center of the item
      const centerX = rect.left + rect.width / 2 - parentRect.left;
      const centerY = rect.top + rect.height / 2 - parentRect.top;

      // Convert to percentage
      const newX = Math.max(5, Math.min(95, (centerX / parentRect.width) * 100));
      const newY = Math.max(5, Math.min(95, (centerY / parentRect.height) * 100));

      // Update position
      context?.updateItemPosition(item.id, newX, newY);

      // Reset motion values
      x.set(0);
      y.set(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only open window if we didn't drag
    if (!hasDragged) {
      onClick(e);
    }
    e.stopPropagation();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isOwner) {
      showContextMenu(e);
    }
  };

  // Context menu items
  const contextMenuItems = [
    {
      label: 'Open',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 8.5v4.5a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4.5" strokeLinecap="round" />
          <path d="M10 2h4v4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2L8 8" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => onClick({ stopPropagation: () => {} } as React.MouseEvent),
    },
    {
      label: 'Duplicate',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="5" width="9" height="9" rx="1" />
          <path d="M3 11V3a1 1 0 011-1h8" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => context?.duplicateItem(item.id),
    },
    { separator: true, label: '', onClick: () => {} },
    {
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1" strokeLinecap="round" />
          <path d="M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => context?.deleteItem(item.id),
      danger: true,
    },
  ];

  return (
    <>
      <motion.div
        ref={containerRef}
        drag={isOwner}
        dragMomentum={false}
        dragElastic={0}
        onPointerDown={handlePointerDown}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className="absolute flex flex-col items-center gap-2 select-none group touch-none"
        style={{
          left: `${item.positionX}%`,
          top: `${item.positionY}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isDragging ? 1000 : zIndex,
          x,
          y,
          cursor: isDragging ? 'grabbing' : isOwner ? 'grab' : 'pointer',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: isDragging ? 1 : 1.05 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      >
        {/* Icon Thumbnail */}
        <motion.div
          className="relative w-[76px] h-[76px] rounded-[18px] overflow-hidden"
          style={{
            boxShadow: isDragging
              ? '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2)'
              : '0 8px 32px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
          animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.label}
            fill
            className="object-cover pointer-events-none"
            sizes="76px"
            draggable={false}
          />

          {/* Owner glow on hover */}
          {isOwner && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, transparent 50%)',
                boxShadow: 'inset 0 0 0 2px rgba(0, 122, 255, 0.3)',
              }}
            />
          )}

          {/* Regular hover highlight */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
            }}
          />
        </motion.div>

        {/* Label */}
        <span
          className="px-2 py-0.5 text-[11px] font-medium text-white text-center leading-tight max-w-[90px] truncate rounded pointer-events-none"
          style={{
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.6)',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {item.label}
        </span>

        {/* Owner indicator (subtle edit icon) */}
        {isOwner && !isDragging && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'rgba(0, 122, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 1l1 1M1 7l.5-2L5.5 1l1 1-4 4-2 .5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </motion.div>

      {/* Context Menu */}
      {isOwner && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenuPos}
          onClose={hideContextMenu}
        />
      )}
    </>
  );
}

// Memoized version to prevent unnecessary re-renders
export const EditableDesktopItem = memo(EditableDesktopItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.positionX === nextProps.item.positionX &&
    prevProps.item.positionY === nextProps.item.positionY &&
    prevProps.item.label === nextProps.item.label &&
    prevProps.item.thumbnailUrl === nextProps.item.thumbnailUrl &&
    prevProps.zIndex === nextProps.zIndex
  );
});
