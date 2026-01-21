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
 * Uses ONLY CSS variables from design-system.css
 */
export function StatusWidget({ status, label, sublabel }: StatusWidgetProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'var(--ds-status-available)';
      case 'busy':
        return 'var(--ds-status-busy)';
      case 'away':
        return 'var(--ds-status-away)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
      style={{
        position: 'fixed',
        bottom: 'var(--ds-space-20)',
        right: 'var(--ds-space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-3)',
        padding: 'var(--ds-space-3) var(--ds-space-4)',
        background: 'var(--ds-surface-elevated)',
        border: '2px solid var(--ds-border-strong)',
        borderRadius: 'var(--ds-radius-lg)',
        boxShadow: 'var(--ds-shadow-md)',
        zIndex: 'var(--ds-z-dropdown)',
      }}
    >
      {/* Status indicator */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 'var(--ds-radius-full)',
          background: getStatusColor(),
          boxShadow: `0 0 8px ${getStatusColor()}`,
        }}
      />

      {/* Labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: 'var(--ds-text-xs)',
            fontWeight: 'var(--ds-weight-semibold)',
            fontFamily: 'var(--ds-font-body)',
            color: 'var(--ds-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--ds-tracking-wider)',
          }}
        >
          {status.toUpperCase()}
        </span>
        <span
          style={{
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 'var(--ds-weight-medium)',
            fontFamily: 'var(--ds-font-body)',
            color: 'var(--ds-text-primary)',
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: 'var(--ds-text-xs)',
              fontFamily: 'var(--ds-font-body)',
              color: 'var(--ds-text-muted)',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </motion.div>
  );
}
