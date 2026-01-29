'use client';

import React, { useState, useEffect } from 'react';

interface MenuBarProps {
  appName?: string;
  rightContent?: React.ReactNode;
}

/**
 * macOS-style menu bar
 * Uses unified CSS variables from calm-tech 2025 design system
 */
export function MenuBar({ appName = 'goOS', rightContent }: MenuBarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
        backdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
        WebkitBackdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
        borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
        boxShadow: 'var(--shadow-xs, 0 1px 3px rgba(23, 20, 18, 0.04))',
        zIndex: 400,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--color-text-primary, #1c1c1c)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Left: App name and menu items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontWeight: 600 }}>
          {appName}
        </span>
        {['File', 'Edit', 'View', 'Help'].map((item) => (
          <button
            key={item}
            style={{
              color: 'var(--color-text-secondary, #5f5f5d)',
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm, 6px)',
              cursor: 'pointer',
              fontSize: 13,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-subtle, rgba(23, 20, 18, 0.05))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right: Status and time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {rightContent}
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
            color: 'var(--color-text-primary, #1c1c1c)',
          }}
        >
          {currentTime}
        </span>
      </div>
    </div>
  );
}
