'use client';

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { PublishStatus } from './GoOSPublishToggle';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';
import { getPremiumIcon } from './PremiumIcons';

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

// Deterministic rotation from file ID for image cards
function getRotationFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return (hash % 9) - 4; // -4 to +4 degrees
}

export type FileType = 'note' | 'case-study' | 'folder' | 'cv' | 'image' | 'link' | 'embed' | 'download' | 'game' | 'board' | 'sheet' | 'slides';

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
  // Image-specific props
  imageUrl?: string;
  // Link-specific props
  linkUrl?: string;
}

export const GoOSFileIcon = memo(function GoOSFileIcon({
  id,
  type,
  title,
  // status is accepted but not visually rendered on icons
  status: _status,
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
  imageUrl,
  linkUrl,
}: GoOSFileIconProps) {
  const isLocked = accessLevel === 'locked';
  const [renameValue, setRenameValue] = useState(title);
  // Local state for position - this is the single source of truth during drag
  const [localPosition, setLocalPosition] = useState({ x: position.x, y: position.y });
  const [isDragging, setIsDragging] = useState(false);
  const [isAppearing, setIsAppearing] = useState(true);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);
  const hasDragged = useRef(false);
  // Track current position during drag to avoid stale closure
  const currentPositionRef = useRef({ x: position.x, y: position.y });
  // Track active drag listeners for cleanup on unmount
  const dragListenersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);

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
      currentPositionRef.current = { x: position.x, y: position.y };
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

  // Get favicon URL from a link URL
  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Use Google's favicon service for high-quality favicons
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  const isImageCard = type === 'image' && !!imageUrl;
  const cardRotation = useMemo(() => isImageCard ? getRotationFromId(id) : 0, [id, isImageCard]);

  // Use premium icons that respond to IconStyleContext settings
  const getIcon = () => {
    const faviconUrl = linkUrl ? getFaviconUrl(linkUrl) : null;
    return getPremiumIcon(type, {
      size: 52,
      imageUrl: isImageCard ? undefined : imageUrl, // Don't pass imageUrl if rendering as card
      faviconUrl,
    });
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

    // Use ref to get current position to avoid stale closure
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: currentPositionRef.current.x,
      elemY: currentPositionRef.current.y,
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
        playSound('drag');
        onDragStartRef.current?.(id);
      }

      if (!hasDragged.current) return;

      // Convert pixel delta to percentage
      const deltaXPercent = (deltaX / parentRect.width) * 100;
      const deltaYPercent = (deltaY / parentRect.height) * 100;

      // Calculate new position - NO SNAPPING, exact position
      const newX = dragStartRef.current.elemX + deltaXPercent;
      const newY = dragStartRef.current.elemY + deltaYPercent;

      // Free dragging - minimal clamp just to keep partially visible
      const clampedX = Math.max(-5, Math.min(100, newX));
      const clampedY = Math.max(-5, Math.min(100, newY));

      // Update both state and ref (ref is used in mouseUp to avoid stale closure)
      setLocalPosition({ x: clampedX, y: clampedY });
      currentPositionRef.current = { x: clampedX, y: clampedY };

      // Notify for folder hit-testing
      throttledOnDrag?.({ x: clampedX, y: clampedY }, id);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dragListenersRef.current = null;

      const wasActualDrag = hasDragged.current;
      setIsDragging(false);

      // Save the final position if we actually dragged
      // Use currentPositionRef instead of localPosition to avoid stale closure
      if (wasActualDrag && dragStartRef.current) {
        playSound('drop');
        onPositionChangeRef.current?.(currentPositionRef.current, id);
      }

      dragStartRef.current = null;
    };

    dragListenersRef.current = { move: handleMouseMove, up: handleMouseUp };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [id, isRenaming, throttledOnDrag]);

  // Cleanup drag listeners on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (dragListenersRef.current) {
        window.removeEventListener('mousemove', dragListenersRef.current.move);
        window.removeEventListener('mouseup', dragListenersRef.current.up);
      }
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // If we dragged, don't trigger click
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    playSound('click');
    onClick?.(e, id);
  }, [onClick, id]);

  const handleDoubleClick = useCallback(() => {
    playSound('pop');
    onDoubleClick?.();
  }, [onDoubleClick]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${title} ${type === 'folder' ? 'folder' : type === 'case-study' ? 'case study' : type === 'cv' ? 'CV' : 'note'}${isSelected ? ', selected' : ''}`}
      aria-selected={isSelected}
      data-file-id={id}
      data-file-type={type}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDoubleClick();
        }
      }}
      style={{
        position: 'absolute',
        top: `${localPosition.y}%`,
        left: `${localPosition.x}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isImageCard ? 8 : 6,
        padding: isImageCard ? 0 : 8,
        borderRadius: isImageCard ? 12 : 8,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        width: isImageCard ? 200 : 100,
        zIndex: isDragging ? 1000 : 10,
        opacity: isAppearing ? 0 : 1,
        transform: isDragging
          ? `scale(1.05) rotate(${cardRotation}deg)`
          : `scale(1) rotate(${cardRotation}deg)`,
        background: isImageCard
          ? 'transparent'
          : isSelected
          ? `${goOSTokens.colors.accent.primary}20`
          : isDraggedOver && type === 'folder'
          ? `${goOSTokens.colors.accent.primary}15`
          : 'transparent',
        border: isImageCard
          ? (isSelected ? `2px solid ${goOSTokens.colors.accent.primary}` : '2px solid transparent')
          : isSelected
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
      {/* Image card or standard icon */}
      {isImageCard ? (
        <div
          style={{
            width: '100%',
            background: '#ffffff',
            borderRadius: 12,
            padding: 6,
            boxShadow: isDragging
              ? '0 20px 40px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.15)'
              : '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
            transition: 'box-shadow 0.2s ease',
            position: 'relative',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              borderRadius: 8,
              display: 'block',
            }}
            draggable={false}
          />

          {/* Lock indicator */}
          {isLocked && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                border: '2px solid #fff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Locked - requires purchase"
            >
              <Lock size={11} color="white" strokeWidth={2.5} />
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            width: 52,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            filter: isDragging ? 'drop-shadow(0 8px 16px rgba(23, 20, 18, 0.2))' : 'drop-shadow(0 2px 4px rgba(23, 20, 18, 0.08))',
            transition: 'filter 0.15s ease',
          }}
        >
          {getIcon()}

          {/* Lock indicator */}
          {type !== 'folder' && isLocked && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                border: '1.5px solid #fff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
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
      )}

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
            padding: '3px 6px',
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            fontWeight: 500,
            textAlign: 'center',
            background: 'var(--bg-elevated, #fff)',
            color: 'var(--text-primary, #171412)',
            border: '2px solid var(--color-accent-primary, #ff7722)',
            borderRadius: 6,
            outline: 'none',
            boxShadow: '0 2px 8px rgba(255, 119, 34, 0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          style={{
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            fontWeight: 600,
            color: isSelected ? '#fff' : 'var(--label-text, #ffffff)',
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            wordBreak: 'break-word' as const,
            lineHeight: '1.3',
            padding: '3px 6px',
            borderRadius: 6,
            background: isSelected
              ? 'var(--color-accent-primary, #ff7722)'
              : 'var(--label-bg, rgba(0, 0, 0, 0.4))',
            backdropFilter: isSelected ? 'none' : 'var(--label-blur, blur(12px) saturate(150%))',
            WebkitBackdropFilter: isSelected ? 'none' : 'var(--label-blur, blur(12px) saturate(150%))',
            textShadow: isSelected ? 'none' : 'var(--label-shadow, 0 1px 3px rgba(0, 0, 0, 0.9))',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
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
