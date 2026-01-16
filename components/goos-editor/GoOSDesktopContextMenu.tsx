'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Presentation, FolderPlus, Clipboard, RefreshCw, LayoutGrid } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  dividerAfter?: boolean;
  disabled?: boolean;
}

interface GoOSDesktopContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onNewNote: () => void;
  onNewCaseStudy: () => void;
  onNewFolder: () => void;
  onPaste?: () => void;
  onRefresh?: () => void;
  onArrangeIcons?: () => void;
  canPaste?: boolean;
}

export function GoOSDesktopContextMenu({
  isOpen,
  position,
  onClose,
  onNewNote,
  onNewCaseStudy,
  onNewFolder,
  onPaste,
  onRefresh,
  onArrangeIcons,
  canPaste = false,
}: GoOSDesktopContextMenuProps) {
  const items: ContextMenuItem[] = [
    {
      id: 'new-note',
      label: 'New Note',
      icon: <FileText size={14} />,
      shortcut: '⌘N',
      onClick: onNewNote,
    },
    {
      id: 'new-case-study',
      label: 'New Case Study',
      icon: <Presentation size={14} />,
      shortcut: '⌘⇧N',
      onClick: onNewCaseStudy,
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: <FolderPlus size={14} />,
      shortcut: '⌘⇧F',
      onClick: onNewFolder,
      dividerAfter: true,
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <Clipboard size={14} />,
      shortcut: '⌘V',
      onClick: () => onPaste?.(),
      disabled: !canPaste,
      dividerAfter: true,
    },
    {
      id: 'arrange',
      label: 'Arrange Icons',
      icon: <LayoutGrid size={14} />,
      onClick: () => onArrangeIcons?.(),
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RefreshCw size={14} />,
      shortcut: '⌘R',
      onClick: () => onRefresh?.(),
    },
  ];

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
                  color: item.disabled ? goOSTokens.colors.text.muted : goOSTokens.colors.text.primary,
                  opacity: item.disabled ? 0.5 : 1,
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.background = goOSTokens.colors.headerBg;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: goOSTokens.colors.text.secondary, display: 'flex' }}>
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

export default GoOSDesktopContextMenu;
