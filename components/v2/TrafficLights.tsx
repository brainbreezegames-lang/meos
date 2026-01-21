'use client';

import React from 'react';

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

/**
 * macOS-style traffic light buttons
 * Uses ONLY CSS variables from design-system.css
 */
export function TrafficLights({ onClose, onMinimize, onMaximize }: TrafficLightsProps) {
  return (
    <div
      className="traffic-lights"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-2)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        aria-label="Close window"
        style={{
          width: 12,
          height: 12,
          borderRadius: 'var(--ds-radius-full)',
          background: 'var(--ds-traffic-close)',
          border: '1px solid var(--ds-traffic-border)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          transition: `opacity var(--ds-duration-fast) var(--ds-ease-out)`,
        }}
      />
      {onMinimize && (
        <button
          onClick={onMinimize}
          aria-label="Minimize window"
          style={{
            width: 12,
            height: 12,
            borderRadius: 'var(--ds-radius-full)',
            background: 'var(--ds-traffic-minimize)',
            border: '1px solid var(--ds-traffic-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: `opacity var(--ds-duration-fast) var(--ds-ease-out)`,
          }}
        />
      )}
      {onMaximize && (
        <button
          onClick={onMaximize}
          aria-label="Maximize window"
          style={{
            width: 12,
            height: 12,
            borderRadius: 'var(--ds-radius-full)',
            background: 'var(--ds-traffic-maximize)',
            border: '1px solid var(--ds-traffic-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: `opacity var(--ds-duration-fast) var(--ds-ease-out)`,
          }}
        />
      )}
    </div>
  );
}
