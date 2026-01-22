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
  ChevronRight,
  Clock,
  BookOpen,
  Coffee,
  Mail,
  MessageSquare,
  Blocks,
} from 'lucide-react';

// Menu dimensions
const MENU_WIDTH = 200;
const SUBMENU_WIDTH = 180;
const MENU_ITEM_HEIGHT = 32;
const SECTION_HEADER_HEIGHT = 24;
const DIVIDER_HEIGHT = 9;
const PADDING = 4;
const VIEWPORT_PADDING = 12;

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: ContextMenuItem[];
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
  onAddWidget,
  onPaste,
  onRefresh,
  onArrangeIcons,
  canPaste = false,
}: GoOSDesktopContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const submenuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Widget submenu items
  const widgetItems: ContextMenuItem[] = useMemo(() => [
    { id: 'widget-clock', label: 'Clock', icon: <Clock size={14} strokeWidth={1.5} />, onClick: () => onAddWidget?.('clock') },
    { id: 'widget-booking', label: 'Booking', icon: <BookOpen size={14} strokeWidth={1.5} />, onClick: () => onAddWidget?.('book') },
    { id: 'widget-tipjar', label: 'Tip Jar', icon: <Coffee size={14} strokeWidth={1.5} />, onClick: () => onAddWidget?.('tipjar') },
    { id: 'widget-contact', label: 'Contact', icon: <Mail size={14} strokeWidth={1.5} />, onClick: () => onAddWidget?.('contact') },
    { id: 'widget-links', label: 'Links', icon: <Link size={14} strokeWidth={1.5} />, onClick: () => onAddWidget?.('links') },
    { id: 'widget-feedback', label: 'Feedback', icon: <MessageSquare size={14} strokeWidth={1.5} />, onClick: () => onAddWidget?.('feedback') },
  ], [onAddWidget]);

  // Define menu sections
  const sections: MenuSection[] = useMemo(() => [
    {
      id: 'create',
      title: 'New',
      items: [
        { id: 'new-note', label: 'Note', icon: <FileText size={14} strokeWidth={1.5} />, shortcut: '⌘N', onClick: onNewNote },
        { id: 'new-case-study', label: 'Case Study', icon: <Presentation size={14} strokeWidth={1.5} />, onClick: onNewCaseStudy },
        { id: 'new-folder', label: 'Folder', icon: <FolderPlus size={14} strokeWidth={1.5} />, onClick: onNewFolder },
      ],
    },
    {
      id: 'add',
      items: [
        { id: 'add-image', label: 'Add Image', icon: <Image size={14} strokeWidth={1.5} />, onClick: () => onNewImage?.() },
        { id: 'add-link', label: 'Add Link', icon: <Link size={14} strokeWidth={1.5} />, onClick: () => onNewLink?.() },
        { id: 'add-widget', label: 'Widgets', icon: <Blocks size={14} strokeWidth={1.5} />, hasSubmenu: true, submenuItems: widgetItems },
      ],
    },
    {
      id: 'actions',
      items: [
        { id: 'paste', label: 'Paste', icon: <Clipboard size={14} strokeWidth={1.5} />, shortcut: '⌘V', onClick: () => onPaste?.(), disabled: !canPaste },
        { id: 'arrange', label: 'Arrange', icon: <LayoutGrid size={14} strokeWidth={1.5} />, onClick: () => onArrangeIcons?.() },
        { id: 'refresh', label: 'Refresh', icon: <RefreshCw size={14} strokeWidth={1.5} />, shortcut: '⌘R', onClick: () => onRefresh?.() },
      ],
    },
  ], [onNewNote, onNewCaseStudy, onNewFolder, onNewImage, onNewLink, widgetItems, onPaste, onArrangeIcons, onRefresh, canPaste]);

  // Calculate menu height
  const estimatedHeight = useMemo(() => {
    let height = PADDING * 2;
    sections.forEach((section, idx) => {
      if (section.title) height += SECTION_HEADER_HEIGHT;
      height += section.items.length * MENU_ITEM_HEIGHT;
      if (idx < sections.length - 1) height += DIVIDER_HEIGHT;
    });
    return height;
  }, [sections]);

  // Position menu within viewport
  useEffect(() => {
    if (!isOpen) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    if (x + MENU_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      x = Math.max(VIEWPORT_PADDING, position.x - MENU_WIDTH);
    }

    if (y + estimatedHeight + VIEWPORT_PADDING > viewportHeight) {
      y = Math.max(VIEWPORT_PADDING, position.y - estimatedHeight);
    }

    x = Math.max(VIEWPORT_PADDING, Math.min(x, viewportWidth - MENU_WIDTH - VIEWPORT_PADDING));
    y = Math.max(VIEWPORT_PADDING, Math.min(y, viewportHeight - estimatedHeight - VIEWPORT_PADDING));

    setAdjustedPosition({ x, y });
  }, [isOpen, position, estimatedHeight]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (activeSubmenu) {
        setActiveSubmenu(null);
      } else {
        onClose();
      }
    }
  }, [isOpen, onClose, activeSubmenu]);

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      setHoveredId(null);
      setPressedId(null);
      setActiveSubmenu(null);

      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);

      document.addEventListener('keydown', handleKeyDown);
      menuRef.current?.focus();

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        // Clear submenu close timeout
        if (submenuCloseTimeoutRef.current) {
          clearTimeout(submenuCloseTimeoutRef.current);
          submenuCloseTimeoutRef.current = null;
        }
      };
    }
  }, [isOpen, onClose, handleKeyDown]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    if (item.hasSubmenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
      return;
    }
    setPressedId(item.id);
    setTimeout(() => {
      item.onClick?.();
      onClose();
    }, 60);
  };

  const handleSubmenuItemClick = (item: ContextMenuItem) => {
    console.log('[ContextMenu] Submenu item clicked:', item.id, item.label);
    if (item.disabled) return;

    // Clear any pending close timeout
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }

    setPressedId(item.id);
    // Execute immediately to ensure the click registers
    item.onClick?.();
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const menuStyle: React.CSSProperties = {
    background: 'var(--color-bg-base, #fbf9ef)',
    border: '2px solid var(--color-text-primary, #171412)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-lg)',
    padding: `${PADDING}px`,
    outline: 'none',
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
          transition={{ duration: 0.1, ease: [0.2, 0, 0, 1] }}
          style={{
            ...menuStyle,
            position: 'fixed',
            zIndex: 9999,
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            width: MENU_WIDTH,
            transformOrigin: 'top left',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {section.title && (
                <div
                  style={{
                    padding: '6px 10px 4px',
                    fontSize: '10px',
                    fontWeight: 600,
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

              {section.items.map((item) => {
                const isHovered = hoveredId === item.id && !item.disabled;
                const isPressed = pressedId === item.id;
                const isSubmenuActive = activeSubmenu === item.id;

                return (
                  <div
                    key={item.id}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => {
                      // Clear any pending close timeout when re-entering
                      if (submenuCloseTimeoutRef.current) {
                        clearTimeout(submenuCloseTimeoutRef.current);
                        submenuCloseTimeoutRef.current = null;
                      }
                      setHoveredId(item.id);
                      if (item.hasSubmenu) {
                        setActiveSubmenu(item.id);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!item.hasSubmenu) {
                        setHoveredId(null);
                      } else {
                        // For submenu items, use delayed close so user can move to submenu
                        submenuCloseTimeoutRef.current = setTimeout(() => {
                          setHoveredId(null);
                          setActiveSubmenu(null);
                        }, 300);
                      }
                    }}
                  >
                    <motion.button
                      role="menuitem"
                      aria-disabled={item.disabled}
                      aria-haspopup={item.hasSubmenu ? 'menu' : undefined}
                      aria-expanded={item.hasSubmenu ? isSubmenuActive : undefined}
                      onClick={() => handleItemClick(item)}
                      onMouseDown={() => !item.disabled && !item.hasSubmenu && setPressedId(item.id)}
                      onMouseUp={() => setPressedId(null)}
                      disabled={item.disabled}
                      animate={{
                        backgroundColor: isPressed
                          ? 'var(--color-accent-primary)'
                          : (isHovered || isSubmenuActive)
                          ? 'var(--color-bg-subtle)'
                          : 'transparent',
                        scale: isPressed ? 0.98 : 1,
                      }}
                      transition={{ duration: 0.06 }}
                      style={{
                        width: '100%',
                        height: MENU_ITEM_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: item.disabled ? 'default' : 'pointer',
                        fontFamily: 'var(--font-family)',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: isPressed
                          ? 'var(--color-text-on-accent, #fbf9ef)'
                          : item.disabled
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
                          width: 18,
                          color: isPressed
                            ? 'var(--color-text-on-accent, #fbf9ef)'
                            : (isHovered || isSubmenuActive)
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
                            fontSize: '10px',
                            fontWeight: 500,
                            color: 'var(--color-text-muted)',
                            fontFamily: 'ui-monospace, "SF Mono", monospace',
                          }}
                        >
                          {item.shortcut}
                        </span>
                      )}
                      {item.hasSubmenu && (
                        <ChevronRight
                          size={12}
                          style={{
                            color: isSubmenuActive
                              ? 'var(--color-accent-primary)'
                              : 'var(--color-text-muted)',
                          }}
                        />
                      )}
                    </motion.button>

                    {/* Submenu - rendered inline with hover bridge */}
                    {item.hasSubmenu && isSubmenuActive && item.submenuItems && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -4,
                          left: '100%',
                          paddingLeft: 0,
                          paddingTop: 4,
                        }}
                        onMouseEnter={() => {
                          // Clear any pending close timeout
                          if (submenuCloseTimeoutRef.current) {
                            clearTimeout(submenuCloseTimeoutRef.current);
                            submenuCloseTimeoutRef.current = null;
                          }
                          setHoveredId(item.id);
                          setActiveSubmenu(item.id);
                        }}
                        onMouseLeave={() => {
                          // Delay closing to allow click events to register
                          submenuCloseTimeoutRef.current = setTimeout(() => {
                            setHoveredId(null);
                            setActiveSubmenu(null);
                          }, 300);
                        }}
                      >
                        {/* Invisible hover bridge to prevent gap issues */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: -12,
                            width: 16,
                            height: '100%',
                            background: 'transparent',
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.1 }}
                          style={{
                            ...menuStyle,
                            width: SUBMENU_WIDTH,
                          }}
                        >
                          {item.submenuItems.map((subItem) => {
                            const isSubHovered = hoveredId === subItem.id;
                            const isSubPressed = pressedId === subItem.id;

                            return (
                              <motion.button
                                key={subItem.id}
                                role="menuitem"
                                onClick={() => handleSubmenuItemClick(subItem)}
                                onMouseEnter={() => setHoveredId(subItem.id)}
                                onMouseLeave={() => setHoveredId(item.id)}
                                onMouseDown={() => setPressedId(subItem.id)}
                                onMouseUp={() => setPressedId(null)}
                                animate={{
                                  backgroundColor: isSubPressed
                                    ? 'var(--color-accent-primary)'
                                    : isSubHovered
                                    ? 'var(--color-bg-subtle)'
                                    : 'transparent',
                                  scale: isSubPressed ? 0.98 : 1,
                                }}
                                transition={{ duration: 0.06 }}
                                style={{
                                  width: '100%',
                                  height: MENU_ITEM_HEIGHT,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '0 10px',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontFamily: 'var(--font-family)',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: isSubPressed
                                    ? 'var(--color-text-on-accent, #fbf9ef)'
                                    : 'var(--color-text-primary)',
                                  textAlign: 'left',
                                  outline: 'none',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 18,
                                    color: isSubPressed
                                      ? 'var(--color-text-on-accent, #fbf9ef)'
                                      : isSubHovered
                                      ? 'var(--color-accent-primary)'
                                      : 'var(--color-text-secondary)',
                                  }}
                                >
                                  {subItem.icon}
                                </span>
                                <span style={{ flex: 1 }}>{subItem.label}</span>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      </div>
                    )}
                  </div>
                );
              })}

              {sectionIndex < sections.length - 1 && (
                <div
                  role="separator"
                  style={{
                    height: 1,
                    background: 'var(--color-border-default)',
                    margin: '4px 6px',
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
