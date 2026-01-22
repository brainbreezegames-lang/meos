'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Settings,
  Copy,
  Move,
} from 'lucide-react';
import type { Widget } from '@/types';

// Menu dimensions
const MENU_WIDTH = 180;
const MENU_ITEM_HEIGHT = 36;
const DIVIDER_HEIGHT = 9;
const PADDING = 6;
const VIEWPORT_PADDING = 12;

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface WidgetContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  widget: Widget | null;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onToggleVisibility?: () => void;
  onBringToFront?: () => void;
  onDuplicate?: () => void;
}

export function WidgetContextMenu({
  isOpen,
  position,
  widget,
  onClose,
  onDelete,
  onEdit,
  onToggleVisibility,
  onBringToFront,
  onDuplicate,
}: WidgetContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Define menu items based on widget state
  const menuItems: ContextMenuItem[] = useMemo(() => {
    if (!widget) return [];

    return [
      {
        id: 'edit',
        label: 'Edit Widget',
        icon: <Settings size={15} strokeWidth={1.75} />,
        onClick: onEdit,
      },
      {
        id: 'visibility',
        label: widget.isVisible ? 'Hide Widget' : 'Show Widget',
        icon: widget.isVisible
          ? <EyeOff size={15} strokeWidth={1.75} />
          : <Eye size={15} strokeWidth={1.75} />,
        onClick: onToggleVisibility,
      },
      {
        id: 'front',
        label: 'Bring to Front',
        icon: <Layers size={15} strokeWidth={1.75} />,
        onClick: onBringToFront,
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: <Copy size={15} strokeWidth={1.75} />,
        shortcut: '⌘D',
        onClick: onDuplicate,
        disabled: true, // Not implemented yet
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 size={15} strokeWidth={1.75} />,
        shortcut: '⌫',
        onClick: onDelete,
        danger: true,
      },
    ];
  }, [widget, onEdit, onToggleVisibility, onBringToFront, onDuplicate, onDelete]);

  // Calculate menu height
  const estimatedHeight = useMemo(() => {
    // Items + divider before delete + padding
    return PADDING * 2 + (menuItems.length * MENU_ITEM_HEIGHT) + DIVIDER_HEIGHT;
  }, [menuItems]);

  // Position menu within viewport
  useEffect(() => {
    if (!isOpen) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Flip horizontally if needed
    if (x + MENU_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      x = Math.max(VIEWPORT_PADDING, position.x - MENU_WIDTH);
    }

    // Flip vertically if needed
    if (y + estimatedHeight + VIEWPORT_PADDING > viewportHeight) {
      y = Math.max(VIEWPORT_PADDING, position.y - estimatedHeight);
    }

    // Final clamp
    x = Math.max(VIEWPORT_PADDING, Math.min(x, viewportWidth - MENU_WIDTH - VIEWPORT_PADDING));
    y = Math.max(VIEWPORT_PADDING, Math.min(y, viewportHeight - estimatedHeight - VIEWPORT_PADDING));

    setAdjustedPosition({ x, y });
  }, [isOpen, position, estimatedHeight]);

  // Keyboard navigation
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
    // Quick feedback then execute
    setTimeout(() => {
      item.onClick?.();
      onClose();
    }, 80);
  };

  // Get widget type display name
  const widgetTypeName = widget?.widgetType
    ? widget.widgetType.charAt(0).toUpperCase() + widget.widgetType.slice(1)
    : 'Widget';

  return (
    <AnimatePresence>
      {isOpen && widget && (
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label={`${widgetTypeName} context menu`}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -2 }}
          transition={{
            duration: 0.15,
            ease: [0.32, 0.72, 0, 1] // Custom ease for snappy feel
          }}
          style={{
            position: 'fixed',
            zIndex: 10000,
            top: adjustedPosition.y,
            left: adjustedPosition.x,
            width: MENU_WIDTH,
            transformOrigin: 'top left',
            background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
            backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            borderRadius: 'var(--radius-md, 14px)',
            boxShadow: 'var(--shadow-lg)',
            padding: `${PADDING}px`,
            outline: 'none',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Header with widget type */}
          <div
            style={{
              padding: '8px 10px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
              marginBottom: 4,
              marginLeft: -PADDING,
              marginRight: -PADDING,
              marginTop: -PADDING,
              paddingLeft: PADDING + 10,
              paddingRight: PADDING + 10,
              background: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.03))',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: widget.isVisible
                  ? 'var(--color-success, #22c55e)'
                  : 'var(--color-text-muted, #8e827c)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary, #4a4744)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {widgetTypeName}
            </span>
          </div>

          {/* Menu items */}
          {menuItems.map((item, index) => {
            const isHovered = hoveredId === item.id && !item.disabled;
            const isPressed = pressedId === item.id;
            const isDelete = item.id === 'delete';

            // Add divider before delete
            const showDivider = isDelete;

            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <div
                    role="separator"
                    style={{
                      height: 1,
                      background: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
                      margin: '4px 6px',
                    }}
                  />
                )}
                <motion.button
                  role="menuitem"
                  aria-disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onMouseDown={() => !item.disabled && setPressedId(item.id)}
                  onMouseUp={() => setPressedId(null)}
                  disabled={item.disabled}
                  animate={{
                    backgroundColor: isPressed
                      ? item.danger
                        ? 'var(--color-error, #ff3c34)'
                        : 'var(--color-accent-primary, #ff7722)'
                      : isHovered
                        ? item.danger
                          ? 'rgba(255, 60, 52, 0.1)'
                          : 'var(--color-bg-subtle, #f2f0e7)'
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
                    padding: '0 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: item.disabled ? 'default' : 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isPressed
                      ? '#fff'
                      : item.disabled
                        ? 'var(--color-text-muted, #8e827c)'
                        : item.danger
                          ? 'var(--color-error, #ff3c34)'
                          : 'var(--color-text-primary, #171412)',
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
                      color: isPressed
                        ? '#fff'
                        : isHovered && !item.danger
                          ? 'var(--color-accent-primary, #ff7722)'
                          : item.danger
                            ? 'var(--color-error, #ff3c34)'
                            : 'var(--color-text-secondary, #4a4744)',
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
                        color: isPressed ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted, #8e827c)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.shortcut}
                    </span>
                  )}
                </motion.button>
              </React.Fragment>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WidgetContextMenu;
