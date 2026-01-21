'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number;
}

interface DockProps {
  items: DockItem[];
}

/**
 * macOS-style dock
 * Uses ONLY CSS variables from design-system.css (--color-*, --shadow-*, etc.)
 */
export function Dock({ items }: DockProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.2,
      }}
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--dock-icon-gap, 8px)',
        padding: 'var(--dock-padding, 10px 16px)',
        background: 'var(--color-bg-elevated)',
        backdropFilter: 'blur(var(--blur-medium, 20px))',
        WebkitBackdropFilter: 'blur(var(--blur-medium, 20px))',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-dock, 20px)',
        boxShadow: 'var(--shadow-dock)',
        zIndex: 'var(--z-dock, 300)',
      }}
    >
      {items.map((item) => (
        <DockIcon key={item.id} item={item} />
      ))}
    </motion.div>
  );
}

function DockIcon({ item }: { item: DockItem }) {
  return (
    <motion.button
      onClick={item.onClick}
      title={item.label}
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
      }}
      style={{
        width: 'var(--dock-icon-size, 44px)',
        height: 'var(--dock-icon-size, 44px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--dock-icon-radius, 12px)',
        cursor: 'pointer',
        position: 'relative',
        color: 'var(--color-text-primary)',
        transition: 'background var(--transition-fast, 150ms) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-subtle-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {item.icon}

      {/* Active indicator dot */}
      {item.isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'var(--dock-active-dot-size, 4px)',
            height: 'var(--dock-active-dot-size, 4px)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-text-primary)',
          }}
        />
      )}

      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 'var(--dock-badge-size, 16px)',
            height: 'var(--dock-badge-size, 16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            fontSize: 'var(--font-size-xs, 10px)',
            fontWeight: 'var(--font-weight-bold, 700)',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-text-on-accent)',
            background: 'var(--color-accent-primary)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {item.badge > 9 ? '9+' : item.badge}
        </div>
      )}
    </motion.button>
  );
}
