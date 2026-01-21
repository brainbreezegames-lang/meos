'use client';

import React from 'react';

interface MenuBarProps {
  appName?: string;
  rightContent?: React.ReactNode;
}

/**
 * macOS-style menu bar
 * Uses ONLY CSS variables from design-system.css
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
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--ds-space-4)',
        background: 'var(--ds-surface-overlay)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--ds-border-subtle)',
        zIndex: 'var(--ds-z-sticky)',
        fontFamily: 'var(--ds-font-body)',
        fontSize: 'var(--ds-text-sm)',
        color: 'var(--ds-text-primary)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Left: App name and menu items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-4)' }}>
        <span style={{ fontWeight: 'var(--ds-weight-semibold)' }}>
          {appName}
        </span>
        <span style={{ color: 'var(--ds-text-secondary)' }}>File</span>
        <span style={{ color: 'var(--ds-text-secondary)' }}>Edit</span>
        <span style={{ color: 'var(--ds-text-secondary)' }}>View</span>
        <span style={{ color: 'var(--ds-text-secondary)' }}>Help</span>
      </div>

      {/* Right: Status and time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-4)' }}>
        {rightContent}
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currentTime}</span>
      </div>
    </div>
  );
}
