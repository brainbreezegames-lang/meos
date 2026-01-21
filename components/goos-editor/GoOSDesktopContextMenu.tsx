'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
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
  Clock,
  BookOpen,
  Coffee,
  Mail,
  MessageSquare,
  Plus,
} from 'lucide-react';

// Menu dimensions for smart positioning
const MENU_WIDTH = 220;
const MENU_ITEM_HEIGHT = 36;
const SECTION_HEADER_HEIGHT = 28;
const DIVIDER_HEIGHT = 9;
const PADDING = 6;
const VIEWPORT_PADDING = 12;

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Define menu sections - streamlined and user-friendly
  const sections: MenuSection[] = useMemo(() => [
    {
      id: 'create',
      title: 'Create',
      items: [
        {
          id: 'new-note',
          label: 'New Note',
          icon: <FileText size={16} strokeWidth={1.5} />,
          shortcut: '⌘N',
          onClick: onNewNote,
        },
        {
          id: 'new-case-study',
          label: 'New Case Study',
          icon: <Presentation size={16} strokeWidth={1.5} />,
          shortcut: '⇧⌘N',
          onClick: onNewCaseStudy,
        },
        {
          id: 'new-folder',
          label: 'New Folder',
          icon: <FolderPlus size={16} strokeWidth={1.5} />,
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
          icon: <Image size={16} strokeWidth={1.5} />,
          onClick: () => onNewImage?.(),
        },
        {
          id: 'new-link',
          label: 'Link',
          icon: <Link size={16} strokeWidth={1.5} />,
          onClick: () => onNewLink?.(),
        },
        {
          id: 'new-embed',
          label: 'Embed',
          icon: <Video size={16} strokeWidth={1.5} />,
          onClick: () => onNewEmbed?.(),
        },
        {
          id: 'new-download',
          label: 'Download',
          icon: <Download size={16} strokeWidth={1.5} />,
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
          icon: <Clock size={16} strokeWidth={1.5} />,
          onClick: () => onAddWidget?.('clock'),
        },
        {
          id: 'widget-booking',
          label: 'Booking',
          icon: <BookOpen size={16} strokeWidth={1.5} />,
          onClick: () => onAddWidget?.('book'),
        },
        {
          id: 'widget-tipjar',
          label: 'Tip Jar',
          icon: <Coffee size={16} strokeWidth={1.5} />,
          onClick: () => onAddWidget?.('tipjar'),
        },
        {
          id: 'widget-contact',
          label: 'Contact',
          icon: <Mail size={16} strokeWidth={1.5} />,
          onClick: () => onAddWidget?.('contact'),
        },
        {
          id: 'widget-links',
          label: 'Links',
          icon: <Link size={16} strokeWidth={1.5} />,
          onClick: () => onAddWidget?.('links'),
        },
        {
          id: 'widget-feedback',
          label: 'Feedback',
          icon: <MessageSquare size={16} strokeWidth={1.5} />,
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
          icon: <Clipboard size={16} strokeWidth={1.5} />,
          shortcut: '⌘V',
          onClick: () => onPaste?.(),
          disabled: !canPaste,
        },
        {
          id: 'arrange',
          label: 'Arrange Icons',
          icon: <LayoutGrid size={16} strokeWidth={1.5} />,
          onClick: () => onArrangeIcons?.(),
        },
        {
          id: 'refresh',
          label: 'Refresh',
          icon: <RefreshCw size={16} strokeWidth={1.5} />,
          shortcut: '⌘R',
          onClick: () => onRefresh?.(),
        },
      ],
    },
  ], [onNewNote, onNewCaseStudy, onNewFolder, onNewImage, onNewLink, onNewEmbed, onNewDownload, onAddWidget, onPaste, onArrangeIcons, onRefresh, canPaste]);

  // Calculate menu height for positioning
  const estimatedHeight = useMemo(() => {
    let height = PADDING * 2;
    sections.forEach((section, idx) => {
      if (section.title) height += SECTION_HEADER_HEIGHT;
      height += section.items.length * MENU_ITEM_HEIGHT;
      if (idx < sections.length - 1) height += DIVIDER_HEIGHT;
    });
    return height;
  }, [sections]);

  // macOS-style viewport-aware positioning
  useEffect(() => {
    if (!isOpen) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Menu spawns with top-left at cursor position (macOS style)
    // If it would go off-screen, flip it

    // Horizontal: flip to left of cursor if too close to right edge
    if (x + MENU_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      x = Math.max(VIEWPORT_PADDING, position.x - MENU_WIDTH);
    }

    // Vertical: flip above cursor if too close to bottom
    if (y + estimatedHeight + VIEWPORT_PADDING > viewportHeight) {
      y = Math.max(VIEWPORT_PADDING, position.y - estimatedHeight);
    }

    // Final clamp to ensure it's always on screen
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
      setPressedId(null);

      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      // Small delay to prevent immediate close
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);

      document.addEventListener('keydown', handleKeyDown);
      menuRef.current?.focus();

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
          aria-label="Desktop context menu"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.12,
            ease: [0.2, 0, 0, 1],
          }}
          style={{
            position: 'fixed',
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            zIndex: 9999,
            width: MENU_WIDTH,
            background: 'var(--color-bg-base)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 'var(--context-menu-radius, 12px)',
            boxShadow: `
              0 0 0 1px var(--color-border-default),
              var(--shadow-dropdown)
            `,
            padding: `${PADDING}px`,
            overflow: 'hidden',
            outline: 'none',
            transformOrigin: 'top left',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Section title */}
              {section.title && (
                <div
                  style={{
                    padding: '8px 12px 6px',
                    fontSize: 'var(--font-size-xs, 10px)',
                    fontWeight: 'var(--font-weight-semibold, 600)',
                    fontFamily: 'var(--font-family)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    userSelect: 'none',
                  }}
                >
                  {section.title}
                </div>
              )}

              {/* Section items */}
              {section.items.map((item) => {
                const isHovered = hoveredId === item.id && !item.disabled;
                const isPressed = pressedId === item.id;

                return (
                  <motion.button
                    key={item.id}
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
                        ? 'var(--color-accent-primary-subtle)'
                        : isHovered
                        ? 'var(--color-bg-subtle-hover)'
                        : 'transparent',
                      scale: isPressed ? 0.98 : 1,
                    }}
                    transition={{ duration: 0.08 }}
                    style={{
                      width: '100%',
                      height: MENU_ITEM_HEIGHT,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '0 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm, 6px)',
                      cursor: item.disabled ? 'default' : 'pointer',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--font-size-base, 13px)',
                      fontWeight: 'var(--font-weight-medium, 500)',
                      color: item.disabled
                        ? 'var(--color-text-muted)'
                        : 'var(--color-text-primary)',
                      opacity: item.disabled ? 0.5 : 1,
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
                        color: isHovered
                          ? 'var(--color-accent-primary)'
                          : 'var(--color-text-secondary)',
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
                          fontSize: 'var(--font-size-xs, 10px)',
                          fontWeight: 'var(--font-weight-medium, 500)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'ui-monospace, "SF Mono", monospace',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {/* Divider between sections */}
              {sectionIndex < sections.length - 1 && (
                <div
                  role="separator"
                  style={{
                    height: 1,
                    background: 'var(--color-border-default)',
                    margin: '4px 8px',
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
