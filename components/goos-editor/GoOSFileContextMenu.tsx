'use client';

import React from 'react';
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
} from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { FileType } from './GoOSFileIcon';
import { PublishStatus } from './GoOSPublishToggle';

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
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste?: () => void;
  onDelete: () => void;
  onTogglePublish?: () => void;
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
  onOpen,
  onRename,
  onDuplicate,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onTogglePublish,
  onExport,
  onShare,
  canPaste = false,
}: GoOSFileContextMenuProps) {
  const isFolder = fileType === 'folder';
  const isDraft = fileStatus === 'draft';

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

  // Close on click outside
  React.useEffect(() => {
    if (isOpen) {
      const handleClick = () => onClose();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
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
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <button
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: 'transparent',
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
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.background = item.danger
                      ? '#fef2f2'
                      : goOSTokens.colors.headerBg;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span
                  style={{
                    color: item.danger ? '#ef4444' : goOSTokens.colors.text.secondary,
                    display: 'flex',
                  }}
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
                  >
                    {item.shortcut}
                  </span>
                )}
              </button>
              {item.dividerAfter && (
                <div
                  style={{
                    height: 1,
                    background: goOSTokens.colors.border + '30',
                    margin: '4px 8px',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GoOSFileContextMenu;
