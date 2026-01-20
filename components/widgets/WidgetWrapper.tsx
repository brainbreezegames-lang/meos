'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import type { Widget } from '@/types';

interface WidgetWrapperProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function WidgetWrapper({
  widget,
  isOwner = false,
  onEdit,
  onDelete,
  onPositionChange,
  children,
  className = '',
}: WidgetWrapperProps) {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: widget.positionX, y: widget.positionY });

  // Update start position when widget position changes externally
  useEffect(() => {
    startPosRef.current = { x: widget.positionX, y: widget.positionY };
  }, [widget.positionX, widget.positionY]);

  const handleDragStart = () => {
    setIsDragging(true);
    startPosRef.current = { x: widget.positionX, y: widget.positionY };
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);

    if (!onPositionChange) return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Convert drag offset (pixels) to percentage
    const deltaXPercent = (info.offset.x / viewportWidth) * 100;
    const deltaYPercent = (info.offset.y / viewportHeight) * 100;

    // Calculate new position
    const newX = startPosRef.current.x + deltaXPercent;
    const newY = startPosRef.current.y + deltaYPercent;

    // Clamp to viewport bounds (2% to 98%)
    const clampedX = Math.max(2, Math.min(98, newX));
    const clampedY = Math.max(2, Math.min(98, newY));

    // Update position - no snapping, stays exactly where released
    onPositionChange(clampedX, clampedY);
  };

  if (!widget.isVisible && !isOwner) {
    return null;
  }

  return (
    <motion.div
      ref={elementRef}
      className={`fixed ${className}`}
      style={{
        left: `${widget.positionX}%`,
        top: `${widget.positionY}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 9999 : 100,
        cursor: isOwner ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: widget.isVisible ? 1 : 0.5,
        scale: 1,
        x: 0,
        y: 0,
      }}
      transition={{ duration: 0.2 }}
      drag={isOwner}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
    >
      {children}

      {/* Owner controls - show on hover */}
      {isOwner && (
        <div
          className="absolute -top-2 -right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            opacity: isDragging ? 0 : undefined,
          }}
        >
          {onEdit && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit();
              }}
              className="flex items-center justify-center"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: '#2B4AE2',
                border: '2px solid #2B4AE2',
                color: 'white',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
              className="flex items-center justify-center"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: 'white',
                border: '2px solid #2B4AE2',
                color: '#2B4AE2',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
              }}
              whileHover={{ scale: 1.1, background: '#fee2e2' }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
