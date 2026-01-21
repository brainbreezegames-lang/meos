'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  FolderOpen,
  Share2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { FileType } from './GoOSFileIcon';
import { PublishStatus } from './GoOSPublishToggle';
import { AccessLevel } from '@/contexts/GoOSContext';

// Menu dimensions for positioning calculations
const MENU_WIDTH = 200;
const MENU_ITEM_HEIGHT = 32;
const MENU_PADDING = 4;
const VIEWPORT_PADDING = 8;

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  dividerAfter?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

// Keep full interface for backward compatibility
interface GoOSFileContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  fileType: FileType;
  fileStatus?: PublishStatus;
  accessLevel?: AccessLevel;
  onOpen: () => void;
  onOpenAsPage?: () => void;
  onOpenAsPresent?: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDelete: () => void;
  onTogglePublish?: () => void;
  onToggleLock?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  canPaste?: boolean;
}

export function GoOSFileContextMenu({
  isOpen,
  position,
  onClose,
  fileType,
  fileStatus,
  // These props are accepted for backward compatibility but not displayed in the simplified menu
  accessLevel: _accessLevel,
  onOpenAsPage: _onOpenAsPage,
  onOpenAsPresent: _onOpenAsPresent,
  onCut: _onCut,
  onPaste: _onPaste,
  onToggleLock: _onToggleLock,
  onExport: _onExport,
  canPaste: _canPaste,
  // Used props
  onOpen,
  onRename,
  onDuplicate,
  onCopy,
  onDelete,
  onTogglePublish,
  onShare,
}: GoOSFileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const isFolder = fileType === 'folder';
  const isDraft = fileStatus === 'draft';

  // Simplified, user-friendly menu items
  const items: ContextMenuItem[] = useMemo(() => {
    const menuItems: ContextMenuItem[] = [
      {
        id: 'open',
        label: isFolder ? 'Open' : 'Edit',
        icon: isFolder ? <FolderOpen size={15} strokeWidth={1.75} /> : <Edit3 size={15} strokeWidth={1.75} />,
        onClick: onOpen,
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: <Edit3 size={15} strokeWidth={1.75} />,
        shortcut: '⏎',
        onClick: onRename,
        dividerAfter: true,
      },
    ];

    // Only show publish toggle for files (not folders)
    if (!isFolder && onTogglePublish) {
      menuItems.push({
        id: 'publish',
        label: isDraft ? 'Publish' : 'Unpublish',
        icon: isDraft ? <Eye size={15} strokeWidth={1.75} /> : <EyeOff size={15} strokeWidth={1.75} />,
        onClick: onTogglePublish,
      });
    }

    // Share option
    if (onShare) {
      menuItems.push({
        id: 'share',
        label: 'Share',
        icon: <Share2 size={15} strokeWidth={1.75} />,
        onClick: onShare,
        dividerAfter: true,
      });
    }

    // Common actions
    menuItems.push(
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: <Copy size={15} strokeWidth={1.75} />,
        shortcut: '⌘D',
        onClick: onDuplicate,
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy size={15} strokeWidth={1.75} />,
        shortcut: '⌘C',
        onClick: onCopy,
        dividerAfter: true,
      },
      {
        id: 'delete',
        label: 'Move to Trash',
        icon: <Trash2 size={15} strokeWidth={1.75} />,
        shortcut: '⌘⌫',
        onClick: onDelete,
        danger: true,
      }
    );

    return menuItems;
  }, [isFolder, isDraft, onOpen, onRename, onTogglePublish, onShare, onDuplicate, onCopy, onDelete]);

  // Calculate divider count for height estimation
  const dividerCount = items.filter(item => item.dividerAfter).length;
  const estimatedHeight = (items.length * MENU_ITEM_HEIGHT) + (MENU_PADDING * 2) + (dividerCount * 9);

  // macOS-style viewport-aware positioning
  useEffect(() => {
    if (!isOpen) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Flip horizontally if too close to right edge
    if (x + MENU_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      x = Math.max(VIEWPORT_PADDING, x - MENU_WIDTH);
    }

    // Flip vertically if too close to bottom edge
    if (y + estimatedHeight + VIEWPORT_PADDING > viewportHeight) {
      y = Math.max(VIEWPORT_PADDING, y - estimatedHeight);
    }

    // Ensure minimum distance from edges
    x = Math.max(VIEWPORT_PADDING, Math.min(x, viewportWidth - MENU_WIDTH - VIEWPORT_PADDING));
    y = Math.max(VIEWPORT_PADDING, Math.min(y, viewportHeight - estimatedHeight - VIEWPORT_PADDING));

    setAdjustedPosition({ x, y });
  }, [isOpen, position, estimatedHeight]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, onClose]);

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      setHoveredId(null);

      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      // Small delay to prevent immediate close on the same click that opened it
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, handleKeyDown]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;

    setPressedId(item.id);

    // Brief visual feedback before closing
    setTimeout(() => {
      item.onClick();
      onClose();
    }, 80);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label="Context menu"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{
            duration: 0.12,
            ease: [0.2, 0, 0, 1], // Custom ease for snappy feel
          }}
          style={{
            position: 'fixed',
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            zIndex: 9999,
            width: MENU_WIDTH,
            background: goOSTokens.colors.paper,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 8,
            boxShadow: `
              0 0 0 1px ${goOSTokens.colors.border},
              0 8px 30px rgba(23, 20, 18, 0.12),
              0 2px 8px rgba(23, 20, 18, 0.08)
            `,
            padding: `${MENU_PADDING}px 0`,
            overflow: 'hidden',
            outline: 'none',
            transformOrigin: 'top left',
          }}
        >
          {items.map((item) => {
            const isHovered = hoveredId === item.id;
            const isPressed = pressedId === item.id;

            return (
              <React.Fragment key={item.id}>
                <motion.button
                  role="menuitem"
                  aria-disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => !item.disabled && setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onMouseDown={() => !item.disabled && setPressedId(item.id)}
                  onMouseUp={() => setPressedId(null)}
                  disabled={item.disabled}
                  animate={{
                    backgroundColor: isPressed
                      ? item.danger
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(255, 119, 34, 0.15)'
                      : isHovered
                      ? item.danger
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(255, 119, 34, 0.08)'
                      : 'rgba(255, 255, 255, 0)',
                    scale: isPressed ? 0.98 : 1,
                  }}
                  transition={{ duration: 0.1 }}
                  style={{
                    width: `calc(100% - 8px)`,
                    height: MENU_ITEM_HEIGHT,
                    margin: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0 8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 5,
                    cursor: item.disabled ? 'default' : 'pointer',
                    fontFamily: goOSTokens.fonts.body,
                    fontSize: 13,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    color: item.danger
                      ? goOSTokens.colors.status.error
                      : item.disabled
                      ? goOSTokens.colors.text.muted
                      : goOSTokens.colors.text.primary,
                    opacity: item.disabled ? 0.4 : 1,
                    textAlign: 'left',
                    outline: 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      color: item.danger
                        ? goOSTokens.colors.status.error
                        : isHovered
                          ? goOSTokens.colors.accent.primary
                          : goOSTokens.colors.text.secondary,
                      transition: 'color 0.1s ease',
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.shortcut && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: goOSTokens.colors.text.muted,
                        fontFamily: goOSTokens.fonts.mono,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.shortcut}
                    </span>
                  )}
                </motion.button>
                {item.dividerAfter && (
                  <div
                    role="separator"
                    style={{
                      height: 1,
                      background: goOSTokens.colors.border,
                      margin: '4px 12px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GoOSFileContextMenu;
