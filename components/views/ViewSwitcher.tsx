'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, FileText, Presentation } from 'lucide-react';
import type { ViewMode } from '@/types';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

const VIEW_OPTIONS: {
  mode: ViewMode;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description: string;
}[] = [
  {
    mode: 'desktop',
    icon: Monitor,
    label: 'Desktop',
    description: 'Interactive desktop experience',
  },
  {
    mode: 'page',
    icon: FileText,
    label: 'Page',
    description: 'Scrollable linear layout',
  },
  {
    mode: 'present',
    icon: Presentation,
    label: 'Present',
    description: 'Fullscreen slideshow',
  },
];

export function ViewSwitcher({ currentView, onViewChange, className = '' }: ViewSwitcherProps) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      style={{
        padding: '4px',
        borderRadius: '12px',
        background: 'var(--bg-glass, rgba(255,255,255,0.8))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
      }}
    >
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = currentView === mode;
        return (
          <motion.button
            key={mode}
            onClick={() => onViewChange(mode)}
            className="relative flex items-center gap-1.5"
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'transparent',
              color: isActive
                ? 'var(--text-primary, #1a1a1a)'
                : 'var(--text-tertiary, #888)',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'var(--font-body, system-ui)',
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="viewSwitcherActive"
                className="absolute inset-0"
                style={{
                  borderRadius: '8px',
                  background: 'var(--bg-solid, white)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon size={14} />
              <span>{label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for menu bar
export function ViewSwitcherCompact({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5">
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = currentView === mode;
        return (
          <motion.button
            key={mode}
            onClick={() => onViewChange(mode)}
            title={label}
            className="flex items-center justify-center"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: isActive
                ? 'var(--bg-active, rgba(0,0,0,0.08))'
                : 'transparent',
              color: isActive
                ? 'var(--text-primary, #1a1a1a)'
                : 'var(--text-tertiary, #888)',
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
            }}
            whileHover={{
              background: 'var(--bg-hover, rgba(0,0,0,0.04))',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon size={16} />
          </motion.button>
        );
      })}
    </div>
  );
}
