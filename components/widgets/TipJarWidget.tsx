'use client';

import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface TipJarWidgetConfig {
  amounts: number[];
  customAmount: boolean;
  message: string;
}

interface TipJarWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  onTip?: (amount: number) => Promise<void>;
}

const DEFAULT_CONFIG: TipJarWidgetConfig = {
  amounts: [3, 5, 10],
  customAmount: false,
  message: 'Buy me a coffee',
};

// Braun-inspired theme colors
const THEMES = {
  light: {
    housing: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.1),
      0 20px 48px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.03)
    `,
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    buttonBg: 'linear-gradient(180deg, #ffffff 0%, #f5f5f3 100%)',
    buttonShadow: `
      0 1px 2px rgba(0, 0, 0, 0.05),
      0 2px 4px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(0, 0, 0, 0.04)
    `,
    buttonHoverShadow: `
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 8px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(0, 0, 0, 0.04)
    `,
    cupColor: '#f5f5f3',
    cupShadow: '#e8e4e0',
    steamColor: '#c0bdb8',
    dotBg: '#e8e4e0',
  },
  dark: {
    housing: 'linear-gradient(180deg, #2a2a28 0%, #1e1e1c 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 20px 48px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
    textPrimary: '#f0f0ec',
    textSecondary: '#a0a09c',
    buttonBg: 'linear-gradient(180deg, #3a3a38 0%, #2e2e2c 100%)',
    buttonShadow: `
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04)
    `,
    buttonHoverShadow: `
      0 2px 4px rgba(0, 0, 0, 0.25),
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04)
    `,
    cupColor: '#3a3a38',
    cupShadow: '#2a2a28',
    steamColor: '#5a5a58',
    dotBg: '#3a3a38',
  },
};

export function TipJarWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted, onTip }: TipJarWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hoveredAmount, setHoveredAmount] = useState<number | null>(null);

  // Detect dark mode - dark class is on document.documentElement (html element)
  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const config: TipJarWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<TipJarWidgetConfig>) };
  const theme = isDark ? THEMES.dark : THEMES.light;

  const handleTip = async (amount: number) => {
    if (onTip) {
      setIsLoading(true);
      try {
        await onTip(amount);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
      onContextMenu={onContextMenu}
      isHighlighted={isHighlighted}
    >
      {/* Outer housing - Braun-style plastic */}
      <div
        style={{
          width: 130,
          height: 140,
          borderRadius: 20,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top corner detail */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: theme.dotBg,
            transition: 'all 0.3s ease',
          }}
        />

        {/* Coffee cup icon - physical style */}
        <div style={{ position: 'relative' }}>
          <svg width="36" height="40" viewBox="0 0 32 36" fill="none">
            {/* Steam wisps - animated later */}
            <path
              d="M10 8 Q12 4 10 0"
              stroke={theme.steamColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M16 6 Q18 2 16 -2"
              stroke={theme.steamColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M22 8 Q20 4 22 0"
              stroke={theme.steamColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            {/* Cup body */}
            <path
              d="M4 12 L6 32 C6 34 8 36 16 36 C24 36 26 34 26 32 L28 12 Z"
              fill={theme.cupColor}
            />
            {/* Orange band - Braun accent */}
            <rect x="4" y="18" width="24" height="4" fill="#ff6b00" opacity="0.9" rx="1" />
            {/* Cup rim highlight */}
            <ellipse cx="16" cy="12" rx="12" ry="3" fill={isDark ? '#4a4a48' : '#fff'} opacity="0.8"/>
            <ellipse cx="16" cy="12" rx="11" ry="2.5" fill={theme.cupColor}/>
            {/* Handle */}
            <path
              d="M26 16 Q32 16 32 22 Q32 28 26 28"
              stroke={theme.cupColor}
              strokeWidth="3"
              fill="none"
            />
          </svg>
        </div>

        {/* Message */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: theme.textPrimary,
            textAlign: 'center',
            lineHeight: 1.3,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'color 0.3s ease',
          }}
        >
          {widget.title || config.message}
        </span>

        {/* Amount buttons - physical style */}
        <div style={{ display: 'flex', gap: 4 }}>
          {config.amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleTip(amount)}
              onMouseEnter={() => setHoveredAmount(amount)}
              onMouseLeave={() => setHoveredAmount(null)}
              disabled={isLoading}
              style={{
                padding: '5px 8px',
                borderRadius: 8,
                border: 'none',
                background: theme.buttonBg,
                boxShadow: hoveredAmount === amount ? theme.buttonHoverShadow : theme.buttonShadow,
                fontSize: 11,
                fontWeight: 600,
                color: hoveredAmount === amount ? '#ff6b00' : theme.textPrimary,
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transform: hoveredAmount === amount ? 'translateY(-1px)' : 'none',
              }}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Bottom detail dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 3,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: 2,
                borderRadius: '50%',
                background: theme.dotBg,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as TIPJAR_WIDGET_DEFAULT_CONFIG };
