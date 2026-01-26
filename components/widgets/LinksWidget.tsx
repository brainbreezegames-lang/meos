'use client';

import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface LinkItem {
  name: string;
  url: string;
  icon?: string;
}

interface LinksWidgetConfig {
  links: LinkItem[];
}

interface LinksWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

const DEFAULT_CONFIG: LinksWidgetConfig = {
  links: [],
};

// Theme colors
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
    textMuted: '#999999',
    iconBg: 'linear-gradient(180deg, #f5f5f3 0%, #eaeae8 100%)',
    iconBgHover: 'linear-gradient(180deg, #eaeae8 0%, #e0e0de 100%)',
    divider: 'rgba(0, 0, 0, 0.06)',
    hoverBg: 'rgba(0, 0, 0, 0.03)',
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
    textMuted: '#6a6a68',
    iconBg: 'linear-gradient(180deg, #3a3a38 0%, #2a2a28 100%)',
    iconBgHover: 'linear-gradient(180deg, #4a4a48 0%, #3a3a38 100%)',
    divider: 'rgba(255, 255, 255, 0.06)',
    hoverBg: 'rgba(255, 255, 255, 0.04)',
  },
};

// Social media icons as SVG components
const ICONS: Record<string, React.ReactNode> = {
  twitter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  github: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  dribbble: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm7.938 5.563a10.18 10.18 0 0 1 2.312 6.312c-.344-.063-3.75-.75-7.188-.313-.063-.188-.125-.344-.188-.5-.188-.438-.375-.875-.563-1.313 3.813-1.562 5.438-3.812 5.625-4.187zM12 1.75c2.625 0 5.031.969 6.875 2.563-.156.313-1.625 2.438-5.312 3.813A62.61 62.61 0 0 0 9.25 1.937 10.174 10.174 0 0 1 12 1.75zm-4.5.625a70.08 70.08 0 0 1 4.312 6.188c-5.438 1.438-10.188 1.406-10.719 1.406.75-3.375 3.125-6.156 6.407-7.594zM1.75 12v-.313c.5.031 6.063.094 11.875-1.656.344.656.656 1.344.938 2-.156.031-.281.094-.438.125-6.063 1.938-9.25 7.25-9.469 7.594A10.165 10.165 0 0 1 1.75 12zm10.25 10.25a10.17 10.17 0 0 1-6.719-2.531c.156-.313 2.5-4.875 9.125-7.125l.063-.031c1.625 4.25 2.313 7.813 2.469 8.75a10.317 10.317 0 0 1-4.938 1.937zm6.625-2.969c-.125-.656-.75-4.063-2.25-8.219 3.25-.5 6.125.344 6.5.438-.469 3.094-2.25 5.781-4.75 7.281z"/>
    </svg>
  ),
  newsletter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  globe: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

function getIcon(iconName?: string): React.ReactNode {
  if (!iconName) return ICONS.globe;
  const key = iconName.toLowerCase();
  return ICONS[key] || ICONS.globe;
}

export function LinksWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: LinksWidgetProps) {
  const [isDark, setIsDark] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkDarkMode = () => {
      const themeElement = document.querySelector('.theme-sketch');
      setIsDark(themeElement?.classList.contains('dark') || false);
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

  const config: LinksWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<LinksWidgetConfig>) };
  const hasLinks = config.links && config.links.length > 0;
  const theme = isDark ? THEMES.dark : THEMES.light;

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
      {/* Physical housing */}
      <div
        style={{
          width: 180,
          minHeight: 120,
          maxHeight: 220,
          borderRadius: 20,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: `1px solid ${theme.divider}`,
          }}
        >
          {/* Physical link icon button */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: theme.iconBg,
              boxShadow: `
                0 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.08}),
                inset 0 1px 0 rgba(255, 255, 255, ${isDark ? 0.05 : 0.6})
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff6b00',
              transition: 'all 0.3s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.textPrimary,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'color 0.3s ease',
            }}
          >
            {widget.title || 'Links'}
          </span>
        </div>

        {/* Links list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {!hasLinks ? (
            <div
              style={{
                textAlign: 'center',
                color: theme.textMuted,
                fontSize: 12,
                padding: '16px 0',
                transition: 'color 0.3s ease',
              }}
            >
              No links yet
            </div>
          ) : (
            config.links.slice(0, 5).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 8px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  background: hoveredIndex === index ? theme.hoverBg : 'transparent',
                  marginLeft: -8,
                  marginRight: -8,
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Physical icon button */}
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: hoveredIndex === index ? theme.iconBgHover : theme.iconBg,
                    boxShadow: `
                      0 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.08}),
                      inset 0 1px 0 rgba(255, 255, 255, ${isDark ? 0.05 : 0.5})
                    `,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.textSecondary,
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {getIcon(link.icon)}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.textPrimary,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {link.name}
                </span>
                {/* Orange arrow on hover */}
                {hoveredIndex === index && (
                  <span style={{ color: '#ff6b00', fontSize: 12 }}>→</span>
                )}
              </a>
            ))
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as LINKS_WIDGET_DEFAULT_CONFIG };
