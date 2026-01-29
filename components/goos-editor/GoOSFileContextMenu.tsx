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
  Presentation,
  FileText,
} from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { FileType } from './GoOSFileIcon';
import { PublishStatus } from './GoOSPublishToggle';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';
import { SPRING, contextMenu as contextMenuVariants } from '@/lib/animations';

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
  // These props are accepted for backward compatibility but not used
  accessLevel: _accessLevel,
  onCut: _onCut,
  onPaste: _onPaste,
  onToggleLock: _onToggleLock,
  onExport: _onExport,
  canPaste: _canPaste,
  // Used props
  onOpen,
  onOpenAsPage,
  onOpenAsPresent,
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

  // Menu items
  const items: ContextMenuItem[] = useMemo(() => {
    const menuItems: ContextMenuItem[] = [
      {
        id: 'open',
        label: isFolder ? 'Open' : 'Edit',
        icon: isFolder ? <FolderOpen size={15} strokeWidth={1.75} /> : <Edit3 size={15} strokeWidth={1.75} />,
        onClick: onOpen,
      },
    ];

    // View modes for notes and case studies
    if (!isFolder && (fileType === 'note' || fileType === 'case-study')) {
      if (onOpenAsPage) {
        menuItems.push({
          id: 'openAsPage',
          label: 'View as Page',
          icon: <FileText size={15} strokeWidth={1.75} />,
          onClick: onOpenAsPage,
        });
      }
      if (onOpenAsPresent) {
        menuItems.push({
          id: 'present',
          label: 'Present',
          icon: <Presentation size={15} strokeWidth={1.75} />,
          onClick: onOpenAsPresent,
        });
      }
    }

    menuItems.push({
      id: 'rename',
      label: 'Rename',
      icon: <Edit3 size={15} strokeWidth={1.75} />,
      shortcut: '⏎',
      onClick: onRename,
      dividerAfter: true,
    });

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
  }, [isFolder, isDraft, fileType, onOpen, onOpenAsPage, onOpenAsPresent, onRename, onTogglePublish, onShare, onDuplicate, onCopy, onDelete]);

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

  // Play sound when menu opens
  useEffect(() => {
    if (isOpen) {
      playSound('expand');
    }
  }, [isOpen]);

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
    // Play appropriate sound based on action type
    if (item.danger) {
      playSound('delete');
    } else {
      playSound('click');
    }

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
          initial={contextMenuVariants.initial}
          animate={contextMenuVariants.animate}
          exit={contextMenuVariants.exit}
          transition={SPRING.snappy}
          style={{
            position: 'fixed',
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            zIndex: 9999,
            width: MENU_WIDTH,
            background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
            backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            borderRadius: 'var(--radius-md, 14px)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            padding: `${MENU_PADDING + 2}px 0`,
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
                        : 'var(--color-accent-primary-light)'
                      : isHovered
                      ? item.danger
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'var(--color-accent-primary-subtle)'
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
                    borderRadius: 8,
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
                      background: 'var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
                      margin: '6px 12px',
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
