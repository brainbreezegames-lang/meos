'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const [position, setPosition] = useState({ x: widget.positionX, y: widget.positionY });
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);
  const hasDragged = useRef(false);
  const currentPositionRef = useRef({ x: widget.positionX, y: widget.positionY });

  // Sync position with widget prop changes (only when not dragging)
  useEffect(() => {
    if (!isDragging) {
      const newPos = { x: widget.positionX, y: widget.positionY };
      currentPositionRef.current = newPos;
      setPosition(newPos);
    }
  }, [widget.positionX, widget.positionY, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isOwner) return;
    if (e.button !== 0) return; // Only left click

    // Don't interfere with form inputs at all
    const target = e.target as HTMLElement;
    const isFormInput = target.closest('input, textarea, select, [contenteditable="true"]');
    if (isFormInput) return;

    // Track start position (don't preventDefault yet - let clicks work)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: position.x,
      elemY: position.y,
    };
    hasDragged.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;

      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;

      // Only commit to drag after moving beyond threshold (5px)
      if (!hasDragged.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        hasDragged.current = true;
        setIsDragging(true);
      }

      if (!hasDragged.current) return;

      // Convert pixel delta to percentage
      const deltaXPercent = (deltaX / window.innerWidth) * 100;
      const deltaYPercent = (deltaY / window.innerHeight) * 100;

      // Calculate new position - NO SNAPPING, exact position
      const newX = dragStartRef.current.elemX + deltaXPercent;
      const newY = dragStartRef.current.elemY + deltaYPercent;

      // Clamp to keep on screen (0-100%)
      const clampedX = Math.max(0, Math.min(100, newX));
      const clampedY = Math.max(0, Math.min(100, newY));

      currentPositionRef.current = { x: clampedX, y: clampedY };
      setPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const wasActualDrag = hasDragged.current;
      setIsDragging(false);

      // Save the final position if we actually dragged (use ref for current value)
      if (wasActualDrag && onPositionChange) {
        onPositionChange(currentPositionRef.current.x, currentPositionRef.current.y);
      }

      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isOwner, position, onPositionChange]);

  if (!widget.isVisible && !isOwner) {
    return null;
  }

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 9999 : 100,
        cursor: isOwner ? (isDragging ? 'grabbing' : 'grab') : 'default',
        opacity: widget.isVisible ? 1 : 0.5,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}

      {/* Owner controls - show on hover */}
      {isOwner && !isDragging && (
        <div
          className="absolute -top-2 -right-2 flex gap-1"
          style={{ opacity: 0, transition: 'opacity 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
        >
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: 'var(--color-accent-primary)',
                border: '2px solid var(--color-text-primary)',
                color: 'var(--color-bg-base)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: 'var(--color-bg-base)',
                border: '2px solid var(--color-text-primary)',
                color: 'var(--color-text-primary)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
