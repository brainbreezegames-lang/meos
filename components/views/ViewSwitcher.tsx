'use client';

import React from 'react';
import { Monitor, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewMode } from '@/types';

// goOS Design Tokens - Brand Appart (uses CSS variables)
const goOS = {
  colors: {
    paper: 'var(--color-bg-base, #fcfbf8)',
    border: 'var(--color-text-primary, #1c1c1c)',
    text: {
      primary: 'var(--color-text-primary, #1c1c1c)',
      secondary: 'var(--color-text-muted, #8d8d8b)',
    },
    accent: 'var(--color-accent-primary)',
  },
};

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

// Global view toggle: Desktop (OS experience) | Page (linear portfolio)
const VIEW_OPTIONS: {
  mode: ViewMode;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  label: string;
}[] = [
  {
    mode: 'desktop',
    icon: Monitor,
    label: 'Desktop',
  },
  {
    mode: 'page',
    icon: FileText,
    label: 'Page',
  },
];

export function ViewSwitcher({ currentView, onViewChange, className = '' }: ViewSwitcherProps) {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{
        padding: '3px',
        borderRadius: '8px',
        background: goOS.colors.paper,
        border: `2px solid ${goOS.colors.border}`,
        gap: '2px',
      }}
    >
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = currentView === mode;
        return (
          <motion.button
            key={mode}
            onClick={() => onViewChange(mode)}
            whileHover={!isActive ? { scale: 1.02 } : undefined}
            whileTap={{ scale: 0.98 }}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '5px',
              background: isActive ? goOS.colors.border : 'transparent',
              color: isActive ? goOS.colors.paper : goOS.colors.text.primary,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <Icon size={13} strokeWidth={2.2} />
            <span>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for menu bar (icon only)
export function ViewSwitcherCompact({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '2px',
        borderRadius: '6px',
        background: goOS.colors.paper,
        border: `2px solid ${goOS.colors.border}`,
      }}
    >
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = currentView === mode;
        return (
          <motion.button
            key={mode}
            onClick={() => onViewChange(mode)}
            whileHover={!isActive ? { scale: 1.05 } : undefined}
            whileTap={{ scale: 0.95 }}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              background: isActive ? goOS.colors.border : 'transparent',
              color: isActive ? goOS.colors.paper : goOS.colors.text.primary,
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <Icon size={14} strokeWidth={2.2} />
          </motion.button>
        );
      })}
    </div>
  );
}
