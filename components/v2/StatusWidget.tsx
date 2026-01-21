'use client';

import React from 'react';
import { motion } from 'framer-motion';

type StatusType = 'available' | 'busy' | 'away';

interface StatusWidgetProps {
  status: StatusType;
  label: string;
  sublabel?: string;
}

/**
 * Availability status widget
 * Uses ONLY CSS variables from design-system.css (--color-*, --shadow-*, etc.)
 */
export function StatusWidget({ status, label, sublabel }: StatusWidgetProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'var(--color-success)';
      case 'busy':
        return 'var(--color-error)';
      case 'away':
        return 'var(--color-warning)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 'var(--status-padding, 14px 18px)',
        background: 'var(--color-bg-elevated)',
        border: '2px solid var(--color-border-strong)',
        borderRadius: 'var(--status-radius, 14px)',
        boxShadow: 'var(--shadow-status)',
        zIndex: 'var(--z-status-widget, 350)',
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          width: 'var(--status-dot-size, 10px)',
          height: 'var(--status-dot-size, 10px)',
          borderRadius: 'var(--radius-full)',
          background: getStatusColor(),
          boxShadow: `0 0 8px ${getStatusColor()}`,
        }}
      />

      {/* Labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: 'var(--font-size-xs, 10px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wide, 0.05em)',
          }}
        >
          {status.toUpperCase()}
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-sm, 12px)',
            fontWeight: 'var(--font-weight-medium, 500)',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: 'var(--font-size-xs, 10px)',
              fontFamily: 'var(--font-family)',
              color: 'var(--color-text-muted)',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </motion.div>
  );
}
