'use client';

import React from 'react';

interface MenuBarProps {
  appName?: string;
  rightContent?: React.ReactNode;
}

/**
 * macOS-style menu bar
 * Uses ONLY CSS variables from design-system.css (--color-*, --shadow-*, etc.)
 */
export function MenuBar({ appName = 'goOS', rightContent }: MenuBarProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--menubar-height, 36px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--menubar-margin, 12px)',
        background: 'var(--color-bg-overlay)',
        backdropFilter: 'blur(var(--blur-medium, 20px))',
        WebkitBackdropFilter: 'blur(var(--blur-medium, 20px))',
        borderBottom: '1px solid var(--color-border-subtle)',
        zIndex: 'var(--z-menubar, 400)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--font-size-sm, 12px)',
        color: 'var(--color-text-primary)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Left: App name and menu items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 'var(--font-weight-semibold, 600)' }}>
          {appName}
        </span>
        <span style={{ color: 'var(--color-text-secondary)' }}>File</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>Edit</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>View</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>Help</span>
      </div>

      {/* Right: Status and time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {rightContent}
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currentTime}</span>
      </div>
    </div>
  );
}
