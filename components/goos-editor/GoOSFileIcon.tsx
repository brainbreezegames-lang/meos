'use client';

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { Lock } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { PublishStatus } from './GoOSPublishToggle';
import { AccessLevel } from '@/contexts/GoOSContext';

// ============================================================================
// BEAUTIFUL FILE ICONS - macOS Big Sur inspired with goOS warmth
// ============================================================================

// Note icon - Paper with folded corner, warm cream gradient
function NoteIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Paper shadow */}
      <path
        d="M10 8C10 6.34315 11.3431 5 13 5H27L34 12V36C34 37.6569 32.6569 39 31 39H13C11.3431 39 10 37.6569 10 36V8Z"
        fill="rgba(23, 20, 18, 0.08)"
        transform="translate(1, 1)"
      />
      {/* Paper body */}
      <path
        d="M10 8C10 6.34315 11.3431 5 13 5H27L34 12V36C34 37.6569 32.6569 39 31 39H13C11.3431 39 10 37.6569 10 36V8Z"
        fill="url(#noteGradient)"
      />
      {/* Folded corner */}
      <path
        d="M27 5V10C27 11.1046 27.8954 12 29 12H34L27 5Z"
        fill="url(#foldGradient)"
      />
      {/* Corner fold shadow */}
      <path
        d="M27 5L34 12L27 12V5Z"
        fill="rgba(23, 20, 18, 0.06)"
      />
      {/* Text lines */}
      <rect x="14" y="17" width="16" height="2" rx="1" fill="rgba(23, 20, 18, 0.12)" />
      <rect x="14" y="22" width="12" height="2" rx="1" fill="rgba(23, 20, 18, 0.08)" />
      <rect x="14" y="27" width="14" height="2" rx="1" fill="rgba(23, 20, 18, 0.08)" />
      <rect x="14" y="32" width="8" height="2" rx="1" fill="rgba(23, 20, 18, 0.06)" />
      {/* Border */}
      <path
        d="M10 8C10 6.34315 11.3431 5 13 5H27L34 12V36C34 37.6569 32.6569 39 31 39H13C11.3431 39 10 37.6569 10 36V8Z"
        stroke="rgba(23, 20, 18, 0.15)"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id="noteGradient" x1="10" y1="5" x2="34" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFDF7" />
          <stop offset="1" stopColor="#F5F0E4" />
        </linearGradient>
        <linearGradient id="foldGradient" x1="27" y1="5" x2="34" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0EBE0" />
          <stop offset="1" stopColor="#E8E3D8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Case Study icon - Presentation with chart, purple accent
function CaseStudyIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Board shadow */}
      <rect x="7" y="7" width="30" height="24" rx="3" fill="rgba(23, 20, 18, 0.08)" transform="translate(1, 1)" />
      {/* Board body */}
      <rect x="7" y="6" width="30" height="24" rx="3" fill="url(#caseGradient)" />
      {/* Screen area */}
      <rect x="10" y="9" width="24" height="15" rx="2" fill="url(#screenGradient)" />
      {/* Chart bars */}
      <rect x="13" y="18" width="4" height="4" rx="0.5" fill="#3d2fa9" opacity="0.9" />
      <rect x="19" y="14" width="4" height="8" rx="0.5" fill="#ff7722" opacity="0.9" />
      <rect x="25" y="16" width="4" height="6" rx="0.5" fill="#3d2fa9" opacity="0.7" />
      {/* Chart line overlay */}
      <path d="M13 17L17 15L23 13L29 14" stroke="#ff7722" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Stand */}
      <path d="M22 30V36" stroke="rgba(23, 20, 18, 0.25)" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="22" cy="37" rx="6" ry="2" fill="rgba(23, 20, 18, 0.1)" />
      {/* Border */}
      <rect x="7" y="6" width="30" height="24" rx="3" stroke="rgba(23, 20, 18, 0.15)" strokeWidth="1" fill="none" />
      <defs>
        <linearGradient id="caseGradient" x1="7" y1="6" x2="37" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDFCF8" />
          <stop offset="1" stopColor="#F3EFE5" />
        </linearGradient>
        <linearGradient id="screenGradient" x1="10" y1="9" x2="34" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FAFAF8" />
          <stop offset="1" stopColor="#F5F3ED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// CV icon - Professional document with avatar, green accent
function CVIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document shadow */}
      <path
        d="M9 7C9 5.34315 10.3431 4 12 4H32C33.6569 4 35 5.34315 35 7V37C35 38.6569 33.6569 40 32 40H12C10.3431 40 9 38.6569 9 37V7Z"
        fill="rgba(23, 20, 18, 0.08)"
        transform="translate(1, 1)"
      />
      {/* Document body */}
      <path
        d="M9 7C9 5.34315 10.3431 4 12 4H32C33.6569 4 35 5.34315 35 7V37C35 38.6569 33.6569 40 32 40H12C10.3431 40 9 38.6569 9 37V7Z"
        fill="url(#cvGradient)"
      />
      {/* Top accent bar */}
      <rect x="9" y="4" width="26" height="6" rx="2" fill="url(#cvAccentGradient)" />
      {/* Avatar circle */}
      <circle cx="17" cy="17" r="5" fill="url(#avatarGradient)" />
      {/* Avatar silhouette */}
      <circle cx="17" cy="15.5" r="2" fill="rgba(255, 255, 255, 0.9)" />
      <ellipse cx="17" cy="20" rx="3" ry="2" fill="rgba(255, 255, 255, 0.9)" />
      {/* Name placeholder */}
      <rect x="25" y="14" width="7" height="2.5" rx="1" fill="rgba(23, 20, 18, 0.15)" />
      <rect x="25" y="18" width="5" height="1.5" rx="0.75" fill="rgba(23, 20, 18, 0.08)" />
      {/* Content lines */}
      <rect x="13" y="26" width="18" height="2" rx="1" fill="rgba(23, 20, 18, 0.1)" />
      <rect x="13" y="30" width="14" height="2" rx="1" fill="rgba(23, 20, 18, 0.07)" />
      <rect x="13" y="34" width="16" height="2" rx="1" fill="rgba(23, 20, 18, 0.07)" />
      {/* Border */}
      <path
        d="M9 7C9 5.34315 10.3431 4 12 4H32C33.6569 4 35 5.34315 35 7V37C35 38.6569 33.6569 40 32 40H12C10.3431 40 9 38.6569 9 37V7Z"
        stroke="rgba(23, 20, 18, 0.15)"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id="cvGradient" x1="9" y1="4" x2="35" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFEFA" />
          <stop offset="1" stopColor="#F5F2E8" />
        </linearGradient>
        <linearGradient id="cvAccentGradient" x1="9" y1="4" x2="35" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22c55e" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="avatarGradient" x1="12" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a3e635" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Folder icon - Classic folder with depth and warmth
function FolderIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folder shadow */}
      <path
        d="M5 14C5 12.3431 6.34315 11 8 11H17L20 8H36C37.6569 8 39 9.34315 39 11V32C39 33.6569 37.6569 35 36 35H8C6.34315 35 5 33.6569 5 32V14Z"
        fill="rgba(23, 20, 18, 0.1)"
        transform="translate(1, 1)"
      />
      {/* Back folder tab */}
      <path
        d="M8 11H16L19 8H36C37.6569 8 39 9.34315 39 11V14H5V14C5 12.3431 6.34315 11 8 11Z"
        fill="url(#folderTabGradient)"
      />
      {/* Main folder body */}
      <path
        d="M5 14H39V32C39 33.6569 37.6569 35 36 35H8C6.34315 35 5 33.6569 5 32V14Z"
        fill="url(#folderGradient)"
      />
      {/* Folder front flap highlight */}
      <path
        d="M5 16C5 14.8954 5.89543 14 7 14H37C38.1046 14 39 14.8954 39 16V17H5V16Z"
        fill="rgba(255, 255, 255, 0.3)"
      />
      {/* Inner shadow */}
      <path
        d="M7 18H37V31C37 32.1046 36.1046 33 35 33H9C7.89543 33 7 32.1046 7 31V18Z"
        fill="rgba(23, 20, 18, 0.03)"
      />
      {/* Border */}
      <path
        d="M8 11H16L19 8H36C37.6569 8 39 9.34315 39 11V32C39 33.6569 37.6569 35 36 35H8C6.34315 35 5 33.6569 5 32V14C5 12.3431 6.34315 11 8 11Z"
        stroke="rgba(23, 20, 18, 0.18)"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id="folderGradient" x1="5" y1="14" x2="39" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD699" />
          <stop offset="0.5" stopColor="#FFCC80" />
          <stop offset="1" stopColor="#FFB84D" />
        </linearGradient>
        <linearGradient id="folderTabGradient" x1="5" y1="8" x2="39" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE0B2" />
          <stop offset="1" stopColor="#FFD180" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Image icon - Photo frame with mountain/sun
function ImageIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="9" width="30" height="26" rx="3" fill="rgba(23, 20, 18, 0.08)" />
      <rect x="6" y="8" width="30" height="26" rx="3" fill="url(#imageFrameGradient)" />
      <rect x="9" y="11" width="24" height="20" rx="1" fill="#E8F4FD" />
      <circle cx="16" cy="17" r="3" fill="#FFD54F" />
      <path d="M9 31L18 21L24 26L33 18V31H9Z" fill="url(#mountainGradient)" />
      <defs>
        <linearGradient id="imageFrameGradient" x1="6" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5F5F5" />
          <stop offset="1" stopColor="#E0E0E0" />
        </linearGradient>
        <linearGradient id="mountainGradient" x1="9" y1="18" x2="33" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#66BB6A" />
          <stop offset="1" stopColor="#43A047" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Link icon - Chain link
function LinkIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="16" fill="url(#linkBgGradient)" />
      <path
        d="M18 22H26M20 18H17C14.7909 18 13 19.7909 13 22C13 24.2091 14.7909 26 17 26H20M24 18H27C29.2091 18 31 19.7909 31 22C31 24.2091 29.2091 26 27 26H24"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="linkBgGradient" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5C6BC0" />
          <stop offset="1" stopColor="#3949AB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Embed icon - Code/play button
function EmbedIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="32" height="24" rx="4" fill="url(#embedBgGradient)" />
      <path d="M19 16V28L29 22L19 16Z" fill="white" />
      <defs>
        <linearGradient id="embedBgGradient" x1="6" y1="10" x2="38" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E53935" />
          <stop offset="1" stopColor="#C62828" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Download icon - File with arrow
function DownloadIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 8C12 6.34315 13.3431 5 15 5H25L32 12V36C32 37.6569 30.6569 39 29 39H15C13.3431 39 12 37.6569 12 36V8Z"
        fill="rgba(23, 20, 18, 0.08)"
        transform="translate(1, 1)"
      />
      <path
        d="M12 8C12 6.34315 13.3431 5 15 5H25L32 12V36C32 37.6569 30.6569 39 29 39H15C13.3431 39 12 37.6569 12 36V8Z"
        fill="url(#downloadGradient)"
      />
      <path d="M25 5V10C25 11.1046 25.8954 12 27 12H32L25 5Z" fill="#B0BEC5" />
      <path d="M22 18V28M22 28L18 24M22 28L26 24" stroke="#546E7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="downloadGradient" x1="12" y1="5" x2="32" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECEFF1" />
          <stop offset="1" stopColor="#CFD8DC" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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

export type FileType = 'note' | 'case-study' | 'folder' | 'cv' | 'image' | 'link' | 'embed' | 'download';

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
  imageUrl,
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

  const getIcon = () => {
    switch (type) {
      case 'image':
        // Show actual image thumbnail
        if (imageUrl) {
          return (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                overflow: 'hidden',
                background: 'rgba(23, 20, 18, 0.04)',
                border: '1px solid rgba(23, 20, 18, 0.08)',
                boxShadow: '0 2px 8px rgba(23, 20, 18, 0.1)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                draggable={false}
              />
            </div>
          );
        }
        // Fallback to generic image icon
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="8" width="32" height="28" rx="3" fill="rgba(23, 20, 18, 0.08)" transform="translate(1, 1)" />
            <rect x="6" y="8" width="32" height="28" rx="3" fill="url(#imgGradient)" />
            <circle cx="15" cy="17" r="4" fill="#ff7722" opacity="0.8" />
            <path d="M6 28L14 22L20 26L28 18L38 26V33C38 34.6569 36.6569 36 35 36H9C7.34315 36 6 34.6569 6 33V28Z" fill="#22c55e" opacity="0.7" />
            <rect x="6" y="8" width="32" height="28" rx="3" stroke="rgba(23, 20, 18, 0.15)" strokeWidth="1" fill="none" />
            <defs>
              <linearGradient id="imgGradient" x1="6" y1="8" x2="38" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFDF7" />
                <stop offset="1" stopColor="#F5F0E4" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'case-study':
        return <CaseStudyIcon />;
      case 'folder':
        return <FolderIcon />;
      case 'cv':
        return <CVIcon />;
      default:
        return <NoteIcon />;
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

      // Update both state and ref (ref is used in mouseUp to avoid stale closure)
      setLocalPosition({ x: clampedX, y: clampedY });
      currentPositionRef.current = { x: clampedX, y: clampedY };

      // Notify for folder hit-testing
      throttledOnDrag?.({ x: clampedX, y: clampedY }, id);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const wasActualDrag = hasDragged.current;
      setIsDragging(false);

      // Save the final position if we actually dragged
      // Use currentPositionRef instead of localPosition to avoid stale closure
      if (wasActualDrag && dragStartRef.current) {
        onPositionChangeRef.current?.(currentPositionRef.current, id);
      }

      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [id, isRenaming, throttledOnDrag]);

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
      aria-label={`${title} ${type === 'folder' ? 'folder' : type === 'case-study' ? 'case study' : type === 'cv' ? 'CV' : 'note'}${isSelected ? ', selected' : ''}`}
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
      {/* Icon - Beautiful macOS-style SVG icons */}
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

        {/* Draft indicator - orange dot */}
        {type !== 'folder' && status === 'draft' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9500 0%, #ff7722 100%)',
              border: '1.5px solid #fff',
              boxShadow: '0 1px 3px rgba(255, 119, 34, 0.4)',
            }}
            title="Draft"
          />
        )}

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
            background: '#fff',
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
            fontWeight: 500,
            color: 'var(--color-text-primary, #171412)',
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '3px 6px',
            borderRadius: 6,
            background: isSelected
              ? 'var(--color-accent-primary, #ff7722)'
              : 'rgba(251, 249, 239, 0.85)',
            backdropFilter: isSelected ? 'none' : 'blur(8px)',
            WebkitBackdropFilter: isSelected ? 'none' : 'blur(8px)',
            boxShadow: '0 1px 3px rgba(23, 20, 18, 0.08)',
            ...(isSelected && { color: '#fff' }),
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
