'use client';

import React, { useState } from 'react';
import { Link2, ExternalLink, ChevronDown, Twitter, Github, Linkedin, Instagram, Youtube, Globe, X } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

import { useWidgetTheme } from '@/hooks/useWidgetTheme';

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
}

const DEFAULT_CONFIG: LinksWidgetConfig = {
  links: [],
};

// Map icon names to Lucide icons
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
  link: Link2,
  x: X,
};

function getIcon(iconName?: string) {
  if (!iconName) return ExternalLink;
  const lowerName = iconName.toLowerCase();
  return ICON_MAP[lowerName] || ExternalLink;
}

export function LinksWidget({ widget, isOwner, onEdit, onDelete, onPositionChange }: LinksWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config: LinksWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<LinksWidgetConfig>) };

  const theme = useWidgetTheme();
  const hasLinks = config.links && config.links.length > 0;

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
    >
      {!isExpanded ? (
        <button
          onDoubleClick={() => setIsExpanded(true)}
          style={{
            background: theme.colors.paper,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: theme.radii.card,
            boxShadow: theme.shadows.solid,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = theme.shadows.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = theme.shadows.solid;
          }}
        >
          <Link2
            size={18}
            strokeWidth={2}
            style={{ color: theme.colors.text.accent || theme.colors.text.primary }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: theme.colors.text.primary,
              fontFamily: theme.fonts.heading,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {widget.title || 'Links'}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            style={{ color: theme.colors.text.primary, opacity: 0.7 }}
          />
        </button>
      ) : (
        <div
          style={{
            background: theme.colors.paper,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: theme.radii.card,
            boxShadow: theme.shadows.solid,
            minWidth: '180px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderBottom: `2px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={16} strokeWidth={2} style={{ color: theme.colors.text.accent || theme.colors.text.primary }} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  fontFamily: theme.fonts.heading,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {widget.title || 'Links'}
              </span>
            </div>
            <ChevronDown
              size={14}
              strokeWidth={2.5}
              style={{ color: theme.colors.text.primary, transform: 'rotate(180deg)' }}
            />
          </button>

          {/* Links list */}
          <div style={{ padding: '8px' }}>
            {!hasLinks ? (
              <div
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  color: theme.colors.text.muted,
                  fontSize: '13px',
                  fontFamily: theme.fonts.heading,
                }}
              >
                No links added yet
              </div>
            ) : (
              config.links.map((link, index) => {
                const IconComponent = getIcon(link.icon);
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.text.accent ? `color-mix(in srgb, ${theme.colors.text.accent} 8%, transparent)` : 'rgba(43, 74, 226, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <IconComponent
                      size={16}
                      strokeWidth={2}
                      style={{ color: theme.colors.text.primary, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: theme.colors.text.primary,
                        fontFamily: theme.fonts.heading,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {link.name}
                    </span>
                    <ExternalLink
                      size={12}
                      strokeWidth={2}
                      style={{ color: theme.colors.text.muted, flexShrink: 0 }}
                    />
                  </a>
                );
              })
            )}
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as LINKS_WIDGET_DEFAULT_CONFIG };
