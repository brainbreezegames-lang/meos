'use client';

import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget, StatusType } from '@/types';

interface StatusWidgetConfig {
  statusType: StatusType;
  title: string;
  description: string | null;
  ctaUrl: string | null;
  ctaLabel: string | null;
}

interface StatusWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

export const STATUS_WIDGET_DEFAULT_CONFIG: StatusWidgetConfig = {
  statusType: 'available',
  title: 'Available for Work',
  description: null,
  ctaUrl: null,
  ctaLabel: null,
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
    dotBg: '#3a3a38',
  },
};

// Status indicator colors - consistent across themes
const STATUS_COLORS: Record<StatusType, { color: string; glow: string }> = {
  available: {
    color: '#22c55e',
    glow: '0 0 8px rgba(34, 197, 94, 0.5)',
  },
  looking: {
    color: '#ff6b00',
    glow: '0 0 8px rgba(255, 107, 0, 0.5)',
  },
  taking: {
    color: '#ff6b00',
    glow: '0 0 8px rgba(255, 107, 0, 0.5)',
  },
  open: {
    color: '#3b82f6',
    glow: '0 0 8px rgba(59, 130, 246, 0.5)',
  },
  consulting: {
    color: '#8b5cf6',
    glow: '0 0 8px rgba(139, 92, 246, 0.5)',
  },
};

export function StatusWidget({
  widget,
  isOwner,
  onEdit,
  onDelete,
  onPositionChange,
  onContextMenu,
  isHighlighted,
}: StatusWidgetProps) {
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

  const config: StatusWidgetConfig = {
    ...STATUS_WIDGET_DEFAULT_CONFIG,
    ...(widget.config as Partial<StatusWidgetConfig>),
  };

  const theme = isDark ? THEMES.dark : THEMES.light;
  const statusColor = STATUS_COLORS[config.statusType] || STATUS_COLORS.available;
  const hasDescription = config.description && config.description.trim().length > 0;
  const hasCta = config.ctaUrl && config.ctaLabel;
  const isCompact = !hasDescription && !hasCta;

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
          width: isCompact ? 200 : 280,
          minHeight: isCompact ? 64 : 110,
          borderRadius: 20,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top corner detail dots */}
        {[
          { top: 10, right: 10 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: theme.dotBg,
              transition: 'all 0.3s ease',
            }}
          />
        ))}

        {/* Status indicator row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Status LED - physical recessed indicator */}
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isDark
                ? 'linear-gradient(180deg, #1a1a18 0%, #242422 100%)'
                : 'linear-gradient(180deg, #e8e4e0 0%, #f0ece8 100%)',
              boxShadow: `inset 0 1px 2px rgba(0, 0, 0, ${isDark ? 0.4 : 0.15})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: statusColor.color,
                boxShadow: statusColor.glow,
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: theme.textPrimary,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 0.3s ease',
              }}
            >
              {config.title}
            </div>
          </div>
        </div>

        {/* Description */}
        {hasDescription && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: theme.textSecondary,
              margin: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'color 0.3s ease',
            }}
          >
            {config.description}
          </p>
        )}

        {/* CTA Button - physical raised button */}
        {hasCta && (
          <a
            href={config.ctaUrl!}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 18px',
              borderRadius: 12,
              background: theme.buttonBg,
              boxShadow: isHovered ? theme.buttonHoverShadow : theme.buttonShadow,
              fontSize: 13,
              fontWeight: 600,
              color: theme.textPrimary,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transform: isHovered ? 'translateY(-1px)' : 'none',
            }}
          >
            {config.ctaLabel}
            <span style={{ marginLeft: 6, color: '#ff6b00' }}>→</span>
          </a>
        )}

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
          {[...Array(3)].map((_, i) => (
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

export type { StatusWidgetProps, StatusWidgetConfig };
