'use client';

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  // Store callbacks in refs to avoid stale closures during drag
  const onPositionChangeRef = useRef(onPositionChange);
  const onDragStartRef = useRef(onDragStartProp);
  const positionRef = useRef(position);

  // Keep refs updated
  onPositionChangeRef.current = onPositionChange;
  onDragStartRef.current = onDragStartProp;
  positionRef.current = position;

  // Throttle onDrag callback for performance (16ms = ~60fps)
  const throttledOnDrag = useMemo(
    () => onDrag ? throttle(onDrag, 16) : undefined,
    [onDrag]
  );

  // Cleanup event listeners on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'case-study':
        return <Presentation size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} />;
      case 'folder':
        return <Folder size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} fill={goOSTokens.colors.accent.orangePale} />;
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
    console.log('[GoOSFileIcon] mouseDown:', { id, position: positionRef.current, hasOnPositionChange: !!onPositionChangeRef.current });
    if (isRenaming) return;
    if (e.button !== 0) return;

    // Capture position at drag start
    const startPosition = { ...positionRef.current };

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
    dragOffsetRef.current = { x: 0, y: 0 };

    // Get parent container dimensions for converting pixels to percentages
    const parent = (e.target as HTMLElement).closest('[data-goos-desktop]') || document.body;
    const parentRect = parent.getBoundingClientRect();

    // Track if we've committed to dragging (moved beyond threshold)
    let isDragCommitted = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMountedRef.current) return;

      const dxPx = moveEvent.clientX - dragStartPos.current.x;
      const dyPx = moveEvent.clientY - dragStartPos.current.y;

      // Only commit to dragging once we've moved beyond threshold (5px)
      if (!isDragCommitted && (Math.abs(dxPx) > 5 || Math.abs(dyPx) > 5)) {
        isDragCommitted = true;
        hasDragged.current = true;
        setIsDragging(true);
        onDragStartRef.current?.(id);
      }

      if (!isDragCommitted) return;

      // Convert pixel offset to percentage of parent container
      const dxPercent = (dxPx / parentRect.width) * 100;
      const dyPercent = (dyPx / parentRect.height) * 100;

      dragOffsetRef.current = { x: dxPercent, y: dyPercent };
      setDragOffset({ x: dxPercent, y: dyPercent });

      // Use throttled callback for folder hit-testing
      // Pass the current position in percentages (same units as folder positions)
      const currentPosPercent = {
        x: startPosition.x + dxPercent,
        y: startPosition.y + dyPercent,
      };
      throttledOnDrag?.(currentPosPercent, id);
    };

    const handleMouseUp = () => {
      cleanup();

      if (!isMountedRef.current) return;

      setIsDragging(false);

      if (hasDragged.current) {
        // Calculate new position in percentages, clamped to valid range
        const newX = Math.max(0, Math.min(95, startPosition.x + dragOffsetRef.current.x));
        const newY = Math.max(0, Math.min(90, startPosition.y + dragOffsetRef.current.y));
        console.log('[GoOSFileIcon] mouseUp - calling onPositionChange:', { id, newX, newY, hasCallback: !!onPositionChangeRef.current });
        onPositionChangeRef.current?.(
          { x: newX, y: newY },
          id
        );
      } else {
        console.log('[GoOSFileIcon] mouseUp - no drag detected');
      }

      setDragOffset({ x: 0, y: 0 });
    };

    const cleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cleanupRef.current = null;
    };

    // Store cleanup function for unmount
    cleanupRef.current = cleanup;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [id, isRenaming, throttledOnDrag]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    onClick?.(e, id);
  }, [onClick, id]);

  // Position is in percentages (0-100), dragOffset is also in percentages now
  const currentX = position.x + dragOffset.x;
  const currentY = position.y + dragOffset.y;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${title} ${type === 'folder' ? 'folder' : type === 'case-study' ? 'case study' : 'note'}${isSelected ? ', selected' : ''}`}
      aria-selected={isSelected}
      data-file-id={id}
      data-file-type={type}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isDragging ? 1.05 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
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
        top: `${currentY}%`,
        left: `${currentX}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        width: 80,
        zIndex: isDragging ? 1000 : 1,
        background: isSelected
          ? `${goOSTokens.colors.accent.orange}20`
          : isDraggedOver && type === 'folder'
          ? `${goOSTokens.colors.accent.orange}15`
          : 'transparent',
        border: isSelected
          ? `2px solid ${goOSTokens.colors.accent.orange}`
          : isDraggedOver && type === 'folder'
          ? `2px dashed ${goOSTokens.colors.accent.orange}`
          : '2px solid transparent',
        transition: isDragging ? 'none' : 'background 0.15s, border 0.15s',
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
              background: goOSTokens.colors.accent.orange,
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
            border: `1.5px solid ${goOSTokens.colors.accent.orange}`,
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
            background: isSelected ? goOSTokens.colors.accent.orangePale : 'transparent',
          }}
          title={title}
        >
          {title}
        </span>
      )}
    </motion.div>
  );
});

export default GoOSFileIcon;
