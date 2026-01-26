'use client';

import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface BookWidgetConfig {
  url: string;
  buttonText: string;
  duration: string;
  price: string;
}

interface BookWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

const DEFAULT_CONFIG: BookWidgetConfig = {
  url: '',
  buttonText: 'View Times',
  duration: '30 min',
  price: 'Free',
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
    calendarBg: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
    calendarShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255,255,255,0.8)',
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
    calendarBg: 'linear-gradient(180deg, #2e2e2c 0%, #262624 100%)',
    calendarShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255,255,255,0.03)',
    dotBg: '#3a3a38',
  },
};

export function BookWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: BookWidgetProps) {
  const [isDark, setIsDark] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const themeElement = document.querySelector('.theme-sketch');
      const hasDarkClass = themeElement?.classList.contains('dark') || false;
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    const themeElement = document.querySelector('.theme-sketch');
    if (themeElement) {
      observer.observe(themeElement, { attributes: true, attributeFilter: ['class'] });
    }
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

    return () => observer.disconnect();
  }, []);

  const config: BookWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<BookWidgetConfig>) };
  const theme = isDark ? THEMES.dark : THEMES.light;

  const handleClick = () => {
    if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get today's date for the calendar
  const today = new Date();
  const dayOfMonth = today.getDate();

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
          width: 280,
          height: 160,
          borderRadius: 20,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top corner detail */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: theme.dotBg,
            transition: 'all 0.3s ease',
          }}
        />

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Calendar icon - physical recessed display */}
          <div
            style={{
              width: 52,
              height: 56,
              borderRadius: 12,
              background: theme.calendarBg,
              boxShadow: theme.calendarShadow,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'all 0.3s ease',
            }}
          >
            {/* Orange header strip - Braun accent */}
            <div
              style={{
                height: 14,
                background: '#ff6b00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }}/>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }}/>
              </div>
            </div>
            {/* Date number */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 600,
                color: theme.textPrimary,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'color 0.3s ease',
              }}
            >
              {dayOfMonth}
            </div>
          </div>

          {/* Text content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: theme.textPrimary,
                margin: 0,
                marginBottom: 6,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'color 0.3s ease',
              }}
            >
              {widget.title || 'Book a Call'}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: theme.textSecondary,
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'color 0.3s ease',
              }}
            >
              <span style={{ color: '#ff6b00', fontWeight: 500 }}>{config.duration}</span>
              <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
              {config.price}
            </p>
          </div>
        </div>

        {/* CTA Button - physical raised button */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={!config.url}
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            background: config.url ? theme.buttonBg : (isDark ? '#2a2a28' : '#f0f0ee'),
            boxShadow: config.url ? (isHovered ? theme.buttonHoverShadow : theme.buttonShadow) : 'none',
            fontSize: 13,
            fontWeight: 600,
            color: config.url ? theme.textPrimary : (isDark ? '#5a5a58' : '#999'),
            cursor: config.url ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transform: isHovered && config.url ? 'translateY(-1px)' : 'none',
          }}
        >
          {config.buttonText || 'View Times'}
          <span style={{ color: config.url ? '#ff6b00' : 'inherit' }}>→</span>
        </button>

        {/* Bottom speaker grille detail */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 4,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 3,
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

export { DEFAULT_CONFIG as BOOK_WIDGET_DEFAULT_CONFIG };
