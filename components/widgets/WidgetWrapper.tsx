'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Widget } from '@/types';

interface WidgetWrapperProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function WidgetWrapper({
  widget,
  isOwner = false,
  onEdit,
  onPositionChange,
  children,
  className = '',
}: WidgetWrapperProps) {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    setIsDragging(false);
    if (onPositionChange && constraintsRef.current) {
      const rect = constraintsRef.current.getBoundingClientRect();
      const x = ((info.point.x - rect.left) / rect.width) * 100;
      const y = ((info.point.y - rect.top) / rect.height) * 100;
      onPositionChange(
        Math.max(2, Math.min(98, x)),
        Math.max(2, Math.min(98, y))
      );
    }
  };

  if (!widget.isVisible && !isOwner) {
    return null;
  }

  return (
    <motion.div
      ref={constraintsRef}
      className={`absolute ${className}`}
      style={{
        left: `${widget.positionX}%`,
        top: `${widget.positionY}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 9999 : 100,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: widget.isVisible ? 1 : 0.5,
        scale: 1,
      }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      drag={isOwner}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
    >
      <div className="relative">
        {children}

        {/* Owner edit button */}
        {isOwner && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit?.();
            }}
            className="absolute flex items-center justify-center"
            style={{
              top: '-6px',
              right: '-6px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--bg-solid, white)',
              border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
              color: 'var(--text-secondary, #666)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10,
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
      </div>
    </motion.div>
  );
}
