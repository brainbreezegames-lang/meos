'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, REDUCED_MOTION } from '@/lib/animations';
import type { Variants } from 'framer-motion';

// Menubar-specific dropdown animation — subtler than contextMenu
// since the menubar is compact and menus are close to the trigger
const menuBarDropdown: Variants = {
  initial: { opacity: 0, scale: 0.97, y: -2 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -2 },
};

// Stable color maps — avoid recreating on every render
const ITEM_COLORS = {
  default: 'var(--color-text-primary)',
  accent: 'var(--color-accent-primary)',
  danger: 'var(--color-error, #e53e3e)',
} as const;

const ICON_COLORS = {
  default: 'var(--color-text-secondary)',
  accent: 'var(--color-accent-primary)',
  danger: 'var(--color-error, #e53e3e)',
} as const;

// ============================================
// MENUBAR DROPDOWN PANEL
// ============================================

interface MenuBarDropdownProps {
  isOpen: boolean;
  children: React.ReactNode;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function MenuBarDropdown({
  isOpen,
  children,
  width,
  className,
  style,
}: MenuBarDropdownProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-menubar-dropdown=""
          variants={menuBarDropdown}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.snappy}
          className={className}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            zIndex: 2001,
            padding: '4px 0',
            minWidth: width ?? 180,
            background: 'var(--color-bg-elevated)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: 'var(--shadow-dropdown, 0 4px 24px rgba(0,0,0,0.12))',
            transformOrigin: 'top left',
            overflow: 'hidden',
            ...style,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// MENUBAR ITEM
// ============================================

interface MenuBarItemProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  variant?: 'default' | 'accent' | 'danger';
  trailing?: React.ReactNode;
  disabled?: boolean;
}

export function MenuBarItem({
  onClick,
  icon,
  label,
  shortcut,
  isActive,
  variant = 'default',
  trailing,
  disabled,
}: MenuBarItemProps) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      initial={false}
      whileHover={
        disabled
          ? undefined
          : { backgroundColor: 'var(--color-bg-subtle)' }
      }
      transition={{ duration: 0.08 }}
      style={{
        width: '100%',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 13,
        fontWeight: variant === 'accent' ? 500 : 400,
        color: disabled ? 'var(--color-text-muted)' : ITEM_COLORS[variant],
        textAlign: 'left' as const,
        fontFamily: 'var(--font-body)',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
      }}
    >
      {icon && (
        <span
          style={{
            width: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 14,
            color: ICON_COLORS[variant],
          }}
        >
          {icon}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {trailing && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            flexShrink: 0,
          }}
        >
          {trailing}
        </span>
      )}
      {shortcut && (
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        >
          {shortcut}
        </span>
      )}
    </motion.button>
  );
}

// ============================================
// MENUBAR DIVIDER
// ============================================

export function MenuBarDivider() {
  return (
    <div
      style={{
        height: 1,
        background: 'var(--color-border-subtle)',
        margin: '4px 8px',
      }}
    />
  );
}

// ============================================
// MENUBAR GROUP
// ============================================

interface MenuBarGroupProps {
  label?: string;
  children: React.ReactNode;
}

export function MenuBarGroup({ label, children }: MenuBarGroupProps) {
  return (
    <div>
      {label && (
        <div
          style={{
            padding: '6px 12px 2px',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// MENUBAR TRIGGER
// ============================================

interface MenuBarTriggerProps {
  children: React.ReactNode;
  isOpen?: boolean;
  triggerProps: ReturnType<
    import('./useMenuBarState').UseMenuBarReturn['getTriggerProps']
  >;
}

export function MenuBarTrigger({
  children,
  isOpen,
  triggerProps,
}: MenuBarTriggerProps) {
  return (
    <button
      {...triggerProps}
      style={{
        background: isOpen ? 'var(--color-bg-subtle)' : 'transparent',
        border: 'none',
        padding: '2px 6px',
        fontSize: 13,
        fontWeight: isOpen ? 500 : 400,
        color: isOpen ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        borderRadius: 'var(--radius-xs, 4px)',
        transition: 'background 0.12s ease, color 0.12s ease, font-weight 0.12s ease',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.background = 'var(--color-bg-subtle)';
        }
        triggerProps.onMouseEnter();
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}
