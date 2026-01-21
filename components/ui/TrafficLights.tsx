'use client';

import { useState } from 'react';

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

/**
 * Unified macOS-style traffic light buttons
 * Uses CSS variables from design-system.css:
 * - --color-traffic-close, --color-traffic-minimize, --color-traffic-maximize
 * - --window-traffic-size (12px), --window-traffic-gap (8px)
 */
export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}: TrafficLightsProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    width: 'var(--window-traffic-size, 12px)',
    height: 'var(--window-traffic-size, 12px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
    boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
  };

  return (
    <div
      className="flex items-center group/traffic"
      style={{ gap: 'var(--window-traffic-gap, 8px)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close window"
        style={{
          ...buttonStyle,
          background: 'var(--color-traffic-close, #ff5f57)',
        }}
      >
        {isHovered && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Minimize */}
      {onMinimize && (
        <button
          onClick={onMinimize}
          aria-label="Minimize window"
          style={{
            ...buttonStyle,
            background: 'var(--color-traffic-minimize, #ffbd2e)',
          }}
        >
          {isHovered && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}

      {/* Maximize */}
      {onMaximize && (
        <button
          onClick={onMaximize}
          aria-label={isMaximized ? "Restore window" : "Maximize window"}
          style={{
            ...buttonStyle,
            background: 'var(--color-traffic-maximize, #28c840)',
          }}
        >
          {isHovered && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              {isMaximized ? (
                <path d="M2 2L6 6M6 2L2 6" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
              ) : (
                <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
              )}
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
