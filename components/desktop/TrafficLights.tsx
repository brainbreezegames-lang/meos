'use client';

import React from 'react';
import { TRAFFIC, CONTROLS } from './windowStyles';
import { playSound } from '@/lib/sounds';

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  showAll?: boolean;
  variant?: 'macos' | 'minimal'; // macos = colored circles, minimal = icon buttons
}

/**
 * Unified Window Controls Component
 * Two variants:
 * - 'macos': Classic red/yellow/green circles (for dark title bar editor windows)
 * - 'minimal': Subtle icon buttons (for light title bar info windows)
 */
export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  showAll = true,
  variant = 'macos',
}: TrafficLightsProps) {
  // macOS style - colored traffic light circles
  if (variant === 'macos') {
    return (
      <div
        className="flex items-center group/traffic"
        style={{ gap: TRAFFIC.gap }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => {
            playSound('popReverse');
            onClose();
          }}
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

        {showAll && (
          <>
            {/* Minimize */}
            <button
              onClick={() => {
                playSound('minimize');
                onMinimize?.();
              }}
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
              onClick={() => {
                playSound(isMaximized ? 'collapse' : 'maximize');
                onMaximize?.();
              }}
              aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
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
          </>
        )}
      </div>
    );
  }

  // Minimal style - subtle icon buttons
  const buttonBaseStyle: React.CSSProperties = {
    width: CONTROLS.size,
    height: CONTROLS.size,
    borderRadius: CONTROLS.borderRadius,
    background: CONTROLS.background,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
  };

  return (
    <div
      className="flex items-center"
      style={{ gap: CONTROLS.gap }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={() => {
          playSound('popReverse');
          onClose();
        }}
        aria-label="Close window"
        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={buttonBaseStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = CONTROLS.closeHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = CONTROLS.background;
        }}
      >
        <svg
          width={CONTROLS.iconSize}
          height={CONTROLS.iconSize}
          viewBox="0 0 14 14"
          fill="none"
          style={{ color: CONTROLS.iconColor }}
          className="group-hover:text-red-500 transition-colors"
        >
          <path
            d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {showAll && onMinimize && (
        <button
          onClick={() => {
            playSound('minimize');
            onMinimize();
          }}
          aria-label="Minimize window"
          className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={buttonBaseStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = CONTROLS.backgroundHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = CONTROLS.background;
          }}
        >
          <svg
            width={CONTROLS.iconSize}
            height={CONTROLS.iconSize}
            viewBox="0 0 14 14"
            fill="none"
            style={{ color: CONTROLS.iconColor }}
            className="group-hover:opacity-80 transition-opacity"
          >
            <path
              d="M3 7H11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {showAll && onMaximize && (
        <button
          onClick={() => {
            playSound(isMaximized ? 'collapse' : 'maximize');
            onMaximize();
          }}
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={buttonBaseStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = CONTROLS.backgroundHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = CONTROLS.background;
          }}
        >
          <svg
            width={CONTROLS.iconSize}
            height={CONTROLS.iconSize}
            viewBox="0 0 14 14"
            fill="none"
            style={{ color: CONTROLS.iconColor }}
            className="group-hover:opacity-80 transition-opacity"
          >
            {isMaximized ? (
              <path
                d="M4.5 5.5V4C4.5 3.44772 4.94772 3 5.5 3H10C10.5523 3 11 3.44772 11 4V8.5C11 9.05228 10.5523 9.5 10 9.5H8.5M3 5.5H8.5C9.05228 5.5 9.5 5.94772 9.5 6.5V11C9.5 11.5523 9.05228 12 8.5 12H3.5C2.94772 12 2.5 11.5523 2.5 11V6.5C2.5 5.94772 2.94772 5.5 3.5 5.5H3Z"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M3.5 10.5L6 8M6 8V10.5M6 8H3.5M10.5 3.5L8 6M8 6V3.5M8 6H10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      )}
    </div>
  );
}

export default TrafficLights;
