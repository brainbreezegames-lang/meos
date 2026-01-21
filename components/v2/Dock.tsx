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
 * Uses ONLY CSS variables from design-system.css
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
        bottom: 'var(--ds-space-4)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-2)',
        padding: 'var(--ds-space-2)',
        background: 'var(--ds-dock-bg)',
        border: '1px solid var(--ds-dock-border)',
        borderRadius: 'var(--ds-radius-xl)',
        boxShadow: 'var(--ds-shadow-lg)',
        zIndex: 'var(--ds-z-sticky)',
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
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--ds-radius-lg)',
        cursor: 'pointer',
        position: 'relative',
        color: 'var(--ds-text-primary)',
        transition: `background var(--ds-duration-fast) var(--ds-ease-out)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--ds-dock-item-hover)';
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
            width: 4,
            height: 4,
            borderRadius: 'var(--ds-radius-full)',
            background: 'var(--ds-text-primary)',
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
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            fontSize: 'var(--ds-text-xs)',
            fontWeight: 'var(--ds-weight-bold)',
            fontFamily: 'var(--ds-font-body)',
            color: 'var(--ds-text-inverse)',
            background: 'var(--ds-accent)',
            borderRadius: 'var(--ds-radius-full)',
          }}
        >
          {item.badge > 9 ? '9+' : item.badge}
        </div>
      )}
    </motion.button>
  );
}
