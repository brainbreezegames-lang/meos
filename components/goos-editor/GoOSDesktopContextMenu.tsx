'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Presentation,
  FolderPlus,
  Clipboard,
  RefreshCw,
  LayoutGrid,
  Image,
  Link,
  Video,
  Download,
  ChevronRight,
  Clock,
  BookOpen,
  Coffee,
  Mail,
  MessageSquare,
  Plus,
} from 'lucide-react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface MenuSection {
  id: string;
  title?: string;
  items: ContextMenuItem[];
}

interface GoOSDesktopContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onNewNote: () => void;
  onNewCaseStudy: () => void;
  onNewFolder: () => void;
  onNewImage?: () => void;
  onNewLink?: () => void;
  onNewEmbed?: () => void;
  onNewDownload?: () => void;
  onAddWidget?: (type: string) => void;
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
  onNewImage,
  onNewLink,
  onNewEmbed,
  onNewDownload,
  onAddWidget,
  onPaste,
  onRefresh,
  onArrangeIcons,
  canPaste = false,
}: GoOSDesktopContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Define menu sections for better organization
  const sections: MenuSection[] = [
    {
      id: 'create',
      title: 'Create',
      items: [
        {
          id: 'new-note',
          label: 'Note',
          icon: <FileText size={15} strokeWidth={1.75} />,
          shortcut: '⌘N',
          onClick: onNewNote,
        },
        {
          id: 'new-case-study',
          label: 'Case Study',
          icon: <Presentation size={15} strokeWidth={1.75} />,
          shortcut: '⇧⌘N',
          onClick: onNewCaseStudy,
        },
        {
          id: 'new-folder',
          label: 'Folder',
          icon: <FolderPlus size={15} strokeWidth={1.75} />,
          shortcut: '⇧⌘F',
          onClick: onNewFolder,
        },
      ],
    },
    {
      id: 'media',
      title: 'Add Media',
      items: [
        {
          id: 'new-image',
          label: 'Image',
          icon: <Image size={15} strokeWidth={1.75} />,
          onClick: () => onNewImage?.(),
        },
        {
          id: 'new-link',
          label: 'Link',
          icon: <Link size={15} strokeWidth={1.75} />,
          onClick: () => onNewLink?.(),
        },
        {
          id: 'new-embed',
          label: 'Embed',
          icon: <Video size={15} strokeWidth={1.75} />,
          onClick: () => onNewEmbed?.(),
        },
        {
          id: 'new-download',
          label: 'Download',
          icon: <Download size={15} strokeWidth={1.75} />,
          onClick: () => onNewDownload?.(),
        },
      ],
    },
    {
      id: 'widgets',
      title: 'Widgets',
      items: [
        {
          id: 'widget-clock',
          label: 'Clock',
          icon: <Clock size={15} strokeWidth={1.75} />,
          onClick: () => onAddWidget?.('clock'),
        },
        {
          id: 'widget-book',
          label: 'Booking',
          icon: <BookOpen size={15} strokeWidth={1.75} />,
          onClick: () => onAddWidget?.('book'),
        },
        {
          id: 'widget-tipjar',
          label: 'Tip Jar',
          icon: <Coffee size={15} strokeWidth={1.75} />,
          onClick: () => onAddWidget?.('tipjar'),
        },
        {
          id: 'widget-contact',
          label: 'Contact',
          icon: <Mail size={15} strokeWidth={1.75} />,
          onClick: () => onAddWidget?.('contact'),
        },
        {
          id: 'widget-links',
          label: 'Links',
          icon: <Link size={15} strokeWidth={1.75} />,
          onClick: () => onAddWidget?.('links'),
        },
        {
          id: 'widget-feedback',
          label: 'Feedback',
          icon: <MessageSquare size={15} strokeWidth={1.75} />,
          onClick: () => onAddWidget?.('feedback'),
        },
      ],
    },
    {
      id: 'actions',
      items: [
        {
          id: 'paste',
          label: 'Paste',
          icon: <Clipboard size={15} strokeWidth={1.75} />,
          shortcut: '⌘V',
          onClick: () => onPaste?.(),
          disabled: !canPaste,
        },
        {
          id: 'arrange',
          label: 'Arrange Icons',
          icon: <LayoutGrid size={15} strokeWidth={1.75} />,
          onClick: () => onArrangeIcons?.(),
        },
        {
          id: 'refresh',
          label: 'Refresh',
          icon: <RefreshCw size={15} strokeWidth={1.75} />,
          shortcut: '⌘R',
          onClick: () => onRefresh?.(),
        },
      ],
    },
  ];

  // Flatten items for keyboard navigation
  const allItems = sections.flatMap(s => s.items);
  const enabledItems = allItems.filter(item => !item.disabled);

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

  // Adjust menu position to stay within viewport
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const padding = 12;

      let x = position.x;
      let y = position.y;

      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }
      if (y + rect.height > window.innerHeight - padding) {
        y = window.innerHeight - rect.height - padding;
      }

      setAdjustedPosition({ x: Math.max(padding, x), y: Math.max(padding, y) });
    }
  }, [isOpen, position]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label="Desktop context menu"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            zIndex: 9999,
            minWidth: 200,
            maxWidth: 260,
            background: 'var(--color-bg-base, #fbf9ef)',
            border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            borderRadius: 'var(--radius-lg, 12px)',
            boxShadow: 'var(--shadow-dropdown, 0 8px 30px rgba(23, 20, 18, 0.15))',
            padding: '6px',
            overflow: 'hidden',
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Section title */}
              {section.title && (
                <div
                  style={{
                    padding: '6px 10px 4px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--color-text-muted, #8e827c)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    userSelect: 'none',
                  }}
                >
                  {section.title}
                </div>
              )}

              {/* Section items */}
              {section.items.map((item) => {
                const globalIndex = enabledItems.findIndex(i => i.id === item.id);
                const isFocused = globalIndex === focusedIndex && !item.disabled;

                return (
                  <button
                    key={item.id}
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
                        setFocusedIndex(globalIndex);
                      }
                    }}
                    disabled={item.disabled}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      background: isFocused
                        ? 'var(--color-accent-primary-subtle, rgba(255, 119, 34, 0.1))'
                        : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm, 6px)',
                      cursor: item.disabled ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: 500,
                      color: item.disabled
                        ? 'var(--color-text-muted, #8e827c)'
                        : 'var(--color-text-primary, #171412)',
                      opacity: item.disabled ? 0.5 : 1,
                      textAlign: 'left',
                      transition: 'background 0.1s ease',
                      outline: 'none',
                    }}
                  >
                    <span
                      style={{
                        color: isFocused
                          ? 'var(--color-accent-primary, #ff7722)'
                          : 'var(--color-text-secondary, #4a4744)',
                        display: 'flex',
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
                          color: 'var(--color-text-muted, #8e827c)',
                          fontFamily: 'ui-monospace, SF Mono, monospace',
                          fontWeight: 400,
                        }}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Separator after section (except last) */}
              {sectionIndex < sections.length - 1 && (
                <div
                  role="separator"
                  style={{
                    height: 1,
                    background: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
                    margin: '6px 8px',
                  }}
                />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GoOSDesktopContextMenu;
