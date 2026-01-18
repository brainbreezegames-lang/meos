'use client';

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation, Folder } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { PublishStatus } from './GoOSPublishToggle';

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
  const [renameValue, setRenameValue] = useState(title);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

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
    if (isRenaming) return;
    if (e.button !== 0) return;

    // Don't prevent default immediately - let the browser handle potential double-clicks
    // We'll only prevent default once we detect actual dragging (movement > threshold)

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;
    dragOffsetRef.current = { x: 0, y: 0 };

    // Track if we've committed to dragging (moved beyond threshold)
    let isDragCommitted = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isMountedRef.current) return;

      const dx = moveEvent.clientX - dragStartPos.current.x;
      const dy = moveEvent.clientY - dragStartPos.current.y;

      // Only commit to dragging once we've moved beyond threshold
      if (!isDragCommitted && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isDragCommitted = true;
        hasDragged.current = true;
        setIsDragging(true);
        onDragStartProp?.(id);
      }

      if (!isDragCommitted) return;

      dragOffsetRef.current = { x: dx, y: dy };
      setDragOffset({ x: dx, y: dy });

      // Use throttled callback for folder hit-testing
      throttledOnDrag?.(
        { x: position.x + dx + 40, y: position.y + dy + 40 },
        id
      );
    };

    const handleMouseUp = () => {
      cleanup();

      if (!isMountedRef.current) return;

      setIsDragging(false);

      if (hasDragged.current) {
        onPositionChange?.(
          {
            x: position.x + dragOffsetRef.current.x,
            y: position.y + dragOffsetRef.current.y,
          },
          id
        );
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
  }, [id, isRenaming, position, onDragStartProp, throttledOnDrag, onPositionChange]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    onClick?.(e, id);
  }, [onClick, id]);

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
        top: currentY,
        left: currentX,
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
