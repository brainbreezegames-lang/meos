'use client';

import React from 'react';
import { TRAFFIC } from './windowStyles';

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMaximized?: boolean;
}

/**
 * Unified Traffic Lights Component
 * macOS-style window controls - consistent across ALL windows
 */
export function TrafficLights({ onClose, onMinimize, onMaximize, isMaximized = false }: TrafficLightsProps) {
  return (
    <div
      className="flex items-center group/traffic"
      style={{ gap: TRAFFIC.gap }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close window"
        className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          width: TRAFFIC.size,
          height: TRAFFIC.size,
          borderRadius: '50%',
          background: TRAFFIC.close,
          boxShadow: TRAFFIC.shadow,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke={TRAFFIC.closeIcon} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Minimize */}
      <button
        onClick={onMinimize}
        aria-label="Minimize window"
        className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          width: TRAFFIC.size,
          height: TRAFFIC.size,
          borderRadius: '50%',
          background: TRAFFIC.minimize,
          boxShadow: TRAFFIC.shadow,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
          <path d="M1 4H7" stroke={TRAFFIC.minimizeIcon} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Maximize */}
      <button
        onClick={onMaximize}
        aria-label={isMaximized ? "Restore window" : "Maximize window"}
        className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          width: TRAFFIC.size,
          height: TRAFFIC.size,
          borderRadius: '50%',
          background: TRAFFIC.maximize,
          boxShadow: TRAFFIC.shadow,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
          <path d="M1 2.5L4 5.5L7 2.5" stroke={TRAFFIC.maximizeIcon} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
        </svg>
      </button>
    </div>
  );
}

export default TrafficLights;
