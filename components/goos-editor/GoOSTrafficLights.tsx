'use client';

import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface GoOSTrafficLightsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

/**
 * Unified macOS-style traffic light buttons
 * Uses ONLY CSS variables from design-system.css
 *
 * Standard size: 12px (matching --window-traffic-size)
 * Standard gap: 8px (matching --window-traffic-gap)
 */
export function GoOSTrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}: GoOSTrafficLightsProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    width: 'var(--window-traffic-size, 12px)',
    height: 'var(--window-traffic-size, 12px)',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'transform var(--transition-fast) var(--ease-out), opacity var(--transition-fast) var(--ease-out)',
  };

  const iconStyle: React.CSSProperties = {
    opacity: isHovered ? 1 : 0,
    transition: 'opacity var(--transition-fast) var(--ease-out)',
  };

  return (
    <div
      role="group"
      aria-label="Window controls"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--window-traffic-gap, 8px)',
      }}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close window"
        title="Close"
        style={{
          ...buttonStyle,
          background: 'var(--color-traffic-close)',
        }}
      >
        <X
          size={8}
          strokeWidth={2.5}
          color="rgba(0, 0, 0, 0.5)"
          style={iconStyle}
        />
      </button>

      {/* Minimize */}
      {onMinimize && (
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Minimize window"
          title="Minimize"
          style={{
            ...buttonStyle,
            background: 'var(--color-traffic-minimize)',
          }}
        >
          <Minus
            size={8}
            strokeWidth={2.5}
            color="rgba(0, 0, 0, 0.5)"
            style={iconStyle}
          />
        </button>
      )}

      {/* Maximize */}
      {onMaximize && (
        <button
          type="button"
          onClick={onMaximize}
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          title={isMaximized ? 'Restore' : 'Maximize'}
          style={{
            ...buttonStyle,
            background: 'var(--color-traffic-maximize)',
          }}
        >
          <Square
            size={6}
            strokeWidth={2.5}
            color="rgba(0, 0, 0, 0.5)"
            style={iconStyle}
          />
        </button>
      )}
    </div>
  );
}

export default GoOSTrafficLights;
