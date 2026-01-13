'use client';

import { useReducedMotion } from 'framer-motion';

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  /** Whether to show icons on hover (default: true) */
  showIcons?: boolean;
}

/**
 * macOS-style traffic light buttons (close, minimize, maximize)
 * Extracted for reuse across window components
 */
export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  showIcons = true,
}: TrafficLightsProps) {
  const prefersReducedMotion = useReducedMotion();

  const buttonBase = `
    rounded-full flex items-center justify-center
    transition-all duration-150 hover:brightness-90
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-1
  `.replace(/\s+/g, ' ').trim();

  const iconBase = `
    w-[8px] h-[8px]
    ${showIcons ? 'opacity-0 group-hover/traffic:opacity-100' : 'opacity-0'}
    transition-opacity
  `.replace(/\s+/g, ' ').trim();

  return (
    <div
      className="flex items-center group/traffic"
      style={{ gap: 'var(--traffic-gap, 8px)' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close window"
        className={buttonBase}
        style={{
          width: 'var(--traffic-size, 12px)',
          height: 'var(--traffic-size, 12px)',
          background: 'linear-gradient(180deg, var(--traffic-red) 0%, var(--traffic-red-hover) 100%)',
          boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
        }}
      >
        <svg className={iconBase} viewBox="0 0 8 8" fill="none">
          <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Minimize */}
      {onMinimize && (
        <button
          onClick={onMinimize}
          aria-label="Minimize window"
          className={buttonBase}
          style={{
            width: 'var(--traffic-size, 12px)',
            height: 'var(--traffic-size, 12px)',
            background: 'linear-gradient(180deg, var(--traffic-yellow) 0%, var(--traffic-yellow-hover) 100%)',
            boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <svg className={iconBase} viewBox="0 0 8 8" fill="none">
            <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Maximize */}
      {onMaximize && (
        <button
          onClick={onMaximize}
          aria-label="Maximize window"
          className={buttonBase}
          style={{
            width: 'var(--traffic-size, 12px)',
            height: 'var(--traffic-size, 12px)',
            background: 'linear-gradient(180deg, var(--traffic-green) 0%, var(--traffic-green-hover) 100%)',
            boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
          }}
        >
          <svg className={iconBase} viewBox="0 0 8 8" fill="none">
            <path
              d="M1 2.5L4 5.5L7 2.5"
              stroke="rgba(0, 70, 0, 0.7)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="rotate(45 4 4)"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
