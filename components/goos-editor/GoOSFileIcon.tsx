'use client';

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { FileText, Presentation, Folder, Lock } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { PublishStatus } from './GoOSPublishToggle';
import { AccessLevel } from '@/contexts/GoOSContext';

// Throttle function for performance
function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

export type FileType = 'note' | 'case-study' | 'folder';

interface GoOSFileIconProps {
  id: string;
  type: FileType;
  title: string;
  status?: PublishStatus;
  accessLevel?: AccessLevel;
  isSelected?: boolean;
  isRenaming?: boolean;
  onClick?: (e: React.MouseEvent, fileId: string) => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRename?: (newTitle: string) => void;
  position: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }, fileId: string) => void;
  isDraggedOver?: boolean;
  onDragStart?: (fileId: string) => void;
  onDrag?: (info: { x: number; y: number }, fileId: string) => void;
}

export const GoOSFileIcon = memo(function GoOSFileIcon({
  id,
  type,
  title,
  status,
  accessLevel,
  isSelected = false,
  isRenaming = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRename,
  position,
  onPositionChange,
  isDraggedOver = false,
  onDragStart: onDragStartProp,
  onDrag,
}: GoOSFileIconProps) {
  const isLocked = accessLevel === 'locked';
  const [renameValue, setRenameValue] = useState(title);
  // Local state for position - this is the single source of truth during drag
  const [localPosition, setLocalPosition] = useState({ x: position.x, y: position.y });
  const [isDragging, setIsDragging] = useState(false);
  const [isAppearing, setIsAppearing] = useState(true);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);
  const hasDragged = useRef(false);

  // Refs for callbacks to avoid stale closures
  const onPositionChangeRef = useRef(onPositionChange);
  const onDragStartRef = useRef(onDragStartProp);
  const onDragRef = useRef(onDrag);

  // Keep refs updated
  onPositionChangeRef.current = onPositionChange;
  onDragStartRef.current = onDragStartProp;
  onDragRef.current = onDrag;

  // Sync local position with prop changes (only when NOT dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalPosition({ x: position.x, y: position.y });
    }
  }, [position.x, position.y, isDragging]);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAppearing(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Throttle onDrag callback for performance (16ms = ~60fps)
  const throttledOnDrag = useMemo(
    () => onDrag ? throttle(onDrag, 16) : undefined,
    [onDrag]
  );

  const getIcon = () => {
    switch (type) {
      case 'case-study':
        return <Presentation size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} />;
      case 'folder':
        return <Folder size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} fill={goOSTokens.colors.accent.pale} />;
      default:
        return <FileText size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'case-study':
        return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
      case 'folder':
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      default:
        return 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)';
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== title) {
      onRename?.(renameValue.trim());
    } else {
      setRenameValue(title);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isRenaming) return;
    if (e.button !== 0) return; // Only left click

    e.preventDefault();
    e.stopPropagation();

    // Get parent container for percentage calculations
    const parent = (e.target as HTMLElement).closest('[data-goos-desktop]') || document.body;
    const parentRect = parent.getBoundingClientRect();

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: localPosition.x,
      elemY: localPosition.y,
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
        onDragStartRef.current?.(id);
      }

      if (!hasDragged.current) return;

      // Convert pixel delta to percentage
      const deltaXPercent = (deltaX / parentRect.width) * 100;
      const deltaYPercent = (deltaY / parentRect.height) * 100;

      // Calculate new position - NO SNAPPING, exact position
      const newX = dragStartRef.current.elemX + deltaXPercent;
      const newY = dragStartRef.current.elemY + deltaYPercent;

      // Clamp to keep on screen (0-95% for x, 0-90% for y to account for icon size)
      const clampedX = Math.max(0, Math.min(95, newX));
      const clampedY = Math.max(0, Math.min(90, newY));

      setLocalPosition({ x: clampedX, y: clampedY });

      // Notify for folder hit-testing
      throttledOnDrag?.({ x: clampedX, y: clampedY }, id);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const wasActualDrag = hasDragged.current;
      setIsDragging(false);

      // Save the final position if we actually dragged
      if (wasActualDrag && dragStartRef.current) {
        onPositionChangeRef.current?.(localPosition, id);
      }

      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [id, isRenaming, localPosition, throttledOnDrag]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // If we dragged, don't trigger click
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    onClick?.(e, id);
  }, [onClick, id]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${title} ${type === 'folder' ? 'folder' : type === 'case-study' ? 'case study' : 'note'}${isSelected ? ', selected' : ''}`}
      aria-selected={isSelected}
      data-file-id={id}
      data-file-type={type}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDoubleClick?.();
        }
      }}
      style={{
        position: 'absolute',
        top: `${localPosition.y}%`,
        left: `${localPosition.x}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        width: 80,
        zIndex: isDragging ? 1000 : 1,
        opacity: isAppearing ? 0 : 1,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        background: isSelected
          ? `${goOSTokens.colors.accent.primary}20`
          : isDraggedOver && type === 'folder'
          ? `${goOSTokens.colors.accent.primary}15`
          : 'transparent',
        border: isSelected
          ? `2px solid ${goOSTokens.colors.accent.primary}`
          : isDraggedOver && type === 'folder'
          ? `2px dashed ${goOSTokens.colors.accent.primary}`
          : '2px solid transparent',
        transition: isDragging
          ? 'transform 0.1s ease'
          : 'opacity 0.3s ease, transform 0.15s ease, background 0.15s, border 0.15s',
        outline: 'none',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          background: getIconBg(),
          border: `2px solid ${goOSTokens.colors.border}`,
          boxShadow: goOSTokens.shadows.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {getIcon()}

        {/* Draft indicator for files */}
        {type !== 'folder' && status === 'draft' && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: goOSTokens.colors.accent.primary,
              border: `1.5px solid ${goOSTokens.colors.border}`,
            }}
            title="Draft"
          />
        )}

        {/* Lock indicator */}
        {type !== 'folder' && isLocked && (
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#6b7280',
              border: `1.5px solid ${goOSTokens.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Locked - requires purchase"
          >
            <Lock size={9} color="white" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Title or Rename Input */}
      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') {
              setRenameValue(title);
              onRename?.(title);
            }
          }}
          style={{
            width: '100%',
            padding: '2px 4px',
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            textAlign: 'center',
            background: goOSTokens.colors.paper,
            border: `1.5px solid ${goOSTokens.colors.accent.primary}`,
            borderRadius: 3,
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          style={{
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            fontWeight: 500,
            color: goOSTokens.colors.text.primary,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '2px 4px',
            borderRadius: 3,
            background: isSelected ? goOSTokens.colors.accent.pale : 'transparent',
          }}
          title={title}
        >
          {title}
        </span>
      )}
    </div>
  );
});

export default GoOSFileIcon;
