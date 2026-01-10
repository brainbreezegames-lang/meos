'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem as DesktopItemType } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContextSafe } from '@/contexts/WindowContext';
import { ContextMenu, useContextMenu } from '@/components/editing/ContextMenu';

interface EditableDesktopItemProps {
  item: DesktopItemType;
  onClick: (event: React.MouseEvent) => void;
  zIndex: number;
  onBringToFront: () => void;
}

export function EditableDesktopItem({
  item,
  onClick,
  zIndex,
  onBringToFront,
}: EditableDesktopItemProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContextSafe();
  const isOwner = context?.isOwner ?? false;
  const isWindowOpen = windowContext?.isItemOpen(item.id) ?? false;

  const [isDragging, setIsDragging] = useState(false);
  const [visualPos, setVisualPos] = useState({ x: item.positionX, y: item.positionY });
  const dragDataRef = useRef({
    startMouseX: 0,
    startMouseY: 0,
    startItemX: 0,
    startItemY: 0,
    currentX: item.positionX,
    currentY: item.positionY,
    hasDragged: false
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const { position: contextMenuPos, showContextMenu, hideContextMenu } = useContextMenu();

  // Sync visual position with props when not dragging
  useEffect(() => {
    if (!isDragging) {
      // Only update if the props are actually different from our current tracked position
      // This prevents snapping back to old values during the brief moment after drag ends
      const data = dragDataRef.current;
      const propsMatch = Math.abs(item.positionX - data.currentX) < 0.1 &&
                         Math.abs(item.positionY - data.currentY) < 0.1;

      if (!propsMatch) {
        // Props changed from external source, sync to them
        setVisualPos({ x: item.positionX, y: item.positionY });
        data.currentX = item.positionX;
        data.currentY = item.positionY;
      }
    }
  }, [item.positionX, item.positionY, isDragging]);

  // Reset hasDragged when edit mode changes (so clicks work after exiting edit mode)
  useEffect(() => {
    if (!isOwner) {
      dragDataRef.current.hasDragged = false;
    }
  }, [isOwner]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isOwner) return;
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();
    onBringToFront();

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    dragDataRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startItemX: item.positionX,
      startItemY: item.positionY,
      currentX: item.positionX,
      currentY: item.positionY,
      hasDragged: false,
    };

    setIsDragging(true);
  }, [isOwner, item.positionX, item.positionY, onBringToFront]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const data = dragDataRef.current;

      const deltaXPx = e.clientX - data.startMouseX;
      const deltaYPx = e.clientY - data.startMouseY;

      if (Math.abs(deltaXPx) > 3 || Math.abs(deltaYPx) > 3) {
        data.hasDragged = true;
      }

      const deltaXPercent = (deltaXPx / parentRect.width) * 100;
      const deltaYPercent = (deltaYPx / parentRect.height) * 100;

      const newX = Math.max(2, Math.min(98, data.startItemX + deltaXPercent));
      const newY = Math.max(2, Math.min(98, data.startItemY + deltaYPercent));

      data.currentX = newX;
      data.currentY = newY;

      setVisualPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      const data = dragDataRef.current;

      if (data.hasDragged && context) {
        // Update context first, then set isDragging false
        // This ensures the new position is committed before we allow syncing
        context.updateItemPosition(item.id, data.currentX, data.currentY);
      }

      // Small delay to let the context update propagate before we stop dragging
      // This prevents the useEffect from resetting to old values
      requestAnimationFrame(() => {
        setIsDragging(false);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, context, item.id]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    console.log('EditableDesktopItem click:', {
      itemId: item.id,
      isOwner,
      hasDragged: dragDataRef.current.hasDragged,
      willTriggerOnClick: !isOwner || !dragDataRef.current.hasDragged
    });

    // Only block the click if we JUST dragged (during this mouse interaction)
    // If not in edit mode, always allow clicks
    if (!isOwner || !dragDataRef.current.hasDragged) {
      onClick(e);
    }
    // Reset hasDragged after click so future clicks work
    dragDataRef.current.hasDragged = false;
  }, [onClick, isOwner, item.id]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isOwner) {
      e.preventDefault();
      showContextMenu(e);
    }
  }, [isOwner, showContextMenu]);

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
      <div
        ref={containerRef}
        className="absolute flex flex-col items-center gap-2 select-none"
        style={{
          left: `${visualPos.x}%`,
          top: `${visualPos.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: isDragging ? 9999 : zIndex,
          cursor: isDragging ? 'grabbing' : isOwner ? 'grab' : 'pointer',
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Icon Thumbnail - Uses CSS variables for border-radius and shadows */}
        <motion.div
          className="relative w-[76px] h-[76px] overflow-hidden"
          style={{
            borderRadius: 'var(--radius-lg)',
            boxShadow: isDragging
              ? 'var(--shadow-item-hover)'
              : 'var(--shadow-item)',
          }}
          animate={{
            y: isDragging ? -8 : 0,
            scale: isDragging ? 1.08 : 1,
          }}
          whileHover={{ scale: isDragging ? 1.08 : 1.05 }}
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

          {/* Hover highlight */}
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
            }}
          />
        </motion.div>

        {/* Label */}
        <span
          className="px-2 py-0.5 font-medium text-white text-center leading-tight max-w-[90px] truncate pointer-events-none"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-body)',
            borderRadius: 'var(--radius-sm)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.6)',
            background: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {item.label}
        </span>

        {/* Open window indicator */}
        <AnimatePresence>
          {isWindowOpen && (
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 6px var(--accent-primary), 0 0 12px var(--accent-primary)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Owner indicator */}
        {isOwner && !isDragging && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background: 'var(--accent-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 1l1 1M1 7l.5-2L5.5 1l1 1-4 4-2 .5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

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
