'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Edit3,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  FolderOpen,
  Share,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { FileType } from './GoOSFileIcon';
import { PublishStatus } from './GoOSPublishToggle';
import { AccessLevel } from '@/contexts/GoOSContext';

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

interface GoOSFileContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  fileType: FileType;
  fileStatus?: PublishStatus;
  accessLevel?: AccessLevel;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onCut: () => void;
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
  accessLevel,
  onOpen,
  onRename,
  onDuplicate,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onTogglePublish,
  onToggleLock,
  onExport,
  onShare,
  canPaste = false,
}: GoOSFileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const isFolder = fileType === 'folder';
  const isDraft = fileStatus === 'draft';
  const isLocked = accessLevel === 'locked';

  const items: ContextMenuItem[] = [
    {
      id: 'open',
      label: isFolder ? 'Open Folder' : 'Open',
      icon: isFolder ? <FolderOpen size={14} /> : <ExternalLink size={14} />,
      shortcut: '↵',
      onClick: onOpen,
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <Edit3 size={14} />,
      shortcut: '↵',
      onClick: onRename,
      dividerAfter: true,
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy size={14} />,
      shortcut: '⌘C',
      onClick: onCopy,
    },
    {
      id: 'cut',
      label: 'Cut',
      icon: <Scissors size={14} />,
      shortcut: '⌘X',
      onClick: onCut,
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard size={14} />,
      shortcut: '⌘V',
      onClick: () => onPaste?.(),
      disabled: !canPaste || !isFolder,
      dividerAfter: true,
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy size={14} />,
      shortcut: '⌘D',
      onClick: onDuplicate,
    },
  ];

  // Add file-specific items
  if (!isFolder) {
    items.push(
      {
        id: 'toggle-publish',
        label: isDraft ? 'Publish' : 'Unpublish',
        icon: isDraft ? <Eye size={14} /> : <EyeOff size={14} />,
        onClick: () => onTogglePublish?.(),
        dividerAfter: true,
      },
      {
        id: 'export',
        label: 'Export as PDF',
        icon: <Download size={14} />,
        onClick: () => onExport?.(),
      },
      {
        id: 'share',
        label: 'Share Link',
        icon: <Share size={14} />,
        onClick: () => onShare?.(),
      },
      {
        id: 'toggle-lock',
        label: isLocked ? 'Unlock' : 'Lock',
        icon: isLocked ? <Unlock size={14} /> : <Lock size={14} />,
        onClick: () => onToggleLock?.(),
        dividerAfter: true,
      }
    );
  }

  // Add delete at the end
  items.push({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 size={14} />,
    shortcut: '⌫',
    onClick: onDelete,
    danger: true,
  });

  const enabledItems = items.filter(item => !item.disabled);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % enabledItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev - 1 < 0 ? enabledItems.length - 1 : prev - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const item = enabledItems[focusedIndex];
        if (item && !item.disabled) {
          item.onClick();
          onClose();
        }
        break;
    }
  }, [isOpen, onClose, enabledItems, focusedIndex]);

  // Focus management and event listeners
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      const handleClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeyDown);

      setTimeout(() => menuRef.current?.focus(), 0);

      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, handleKeyDown]);

  const getEnabledIndex = (item: ContextMenuItem) => {
    return enabledItems.findIndex(i => i.id === item.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label={`${fileType} context menu`}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            zIndex: 9999,
            minWidth: 200,
            background: goOSTokens.colors.paper,
            border: `2px solid ${goOSTokens.colors.border}`,
            borderRadius: 6,
            boxShadow: goOSTokens.shadows.solid,
            padding: '4px 0',
            overflow: 'hidden',
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => {
            const enabledIndex = getEnabledIndex(item);
            const isFocused = enabledIndex === focusedIndex && !item.disabled;

            return (
              <React.Fragment key={item.id}>
                <button
                  role="menuitem"
                  aria-disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      onClose();
                    }
                  }}
                  onMouseEnter={() => {
                    if (!item.disabled) {
                      setFocusedIndex(enabledIndex);
                    }
                  }}
                  disabled={item.disabled}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: isFocused
                      ? item.danger ? '#fef2f2' : goOSTokens.colors.headerBg
                      : 'transparent',
                    border: 'none',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    fontFamily: goOSTokens.fonts.body,
                    fontSize: 13,
                    color: item.danger
                      ? '#ef4444'
                      : item.disabled
                      ? goOSTokens.colors.text.muted
                      : goOSTokens.colors.text.primary,
                    opacity: item.disabled ? 0.5 : 1,
                    textAlign: 'left',
                    transition: 'background 0.1s',
                    outline: 'none',
                  }}
                >
                  <span
                    style={{
                      color: item.danger ? '#ef4444' : goOSTokens.colors.text.secondary,
                      display: 'flex',
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
                        color: goOSTokens.colors.text.muted,
                        fontFamily: 'SF Mono, monospace',
                      }}
                      aria-label={`Keyboard shortcut: ${item.shortcut}`}
                    >
                      {item.shortcut}
                    </span>
                  )}
                </button>
                {item.dividerAfter && (
                  <div
                    role="separator"
                    style={{
                      height: 1,
                      background: goOSTokens.colors.border + '30',
                      margin: '4px 8px',
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
