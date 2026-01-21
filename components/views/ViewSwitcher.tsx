'use client';

import React from 'react';
import { Monitor, FileText } from 'lucide-react';
import type { ViewMode } from '@/types';

// goOS Design Tokens - Brand Appart Warm Cream
const goOS = {
  colors: {
    paper: '#ffffff',
    border: '#1a1a1a',
    text: {
      primary: '#1a1a1a',
      secondary: '#6b6b6b',
    },
    accent: '#ff7722',
  },
  shadows: {
    solid: '0 2px 8px rgba(0,0,0,0.08)',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

// Global view toggle: Desktop (OS experience) | Page (linear portfolio)
// Note: Present mode is only for individual Notes, not the whole desktop
const VIEW_OPTIONS: {
  mode: ViewMode;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
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
    description: 'Linear portfolio view',
  },
];

export function ViewSwitcher({ currentView, onViewChange, className = '' }: ViewSwitcherProps) {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{
        padding: '3px',
        borderRadius: '10px',
        background: goOS.colors.paper,
        border: `1px solid rgba(0,0,0,0.1)`,
        boxShadow: goOS.shadows.solid,
        gap: '2px',
      }}
    >
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = currentView === mode;
        return (
          <button
            key={mode}
            onClick={() => {
              console.log('[ViewSwitcher] Switching to:', mode);
              onViewChange(mode);
            }}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '5px',
              background: isActive ? goOS.colors.border : 'transparent',
              color: isActive ? goOS.colors.paper : goOS.colors.text.primary,
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: goOS.fonts.heading,
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Compact version for menu bar
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
        border: `1px solid rgba(0,0,0,0.1)`,
      }}
    >
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => {
        const isActive = currentView === mode;
        return (
          <button
            key={mode}
            onClick={() => onViewChange(mode)}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: isActive ? goOS.colors.border : 'transparent',
              color: isActive ? goOS.colors.paper : goOS.colors.text.primary,
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={16} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
