'use client';

import React, { useState } from 'react';
import { Link2, ExternalLink, ChevronDown, ChevronUp, Twitter, Github, Linkedin, Instagram, Youtube, Globe, X } from 'lucide-react';
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

// Map icon names to Lucide icons
const ICON_MAP: Record<string, React.ComponentType<any>> = {
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

export function LinksWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: LinksWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config: LinksWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<LinksWidgetConfig>) };

  const hasLinks = config.links && config.links.length > 0;

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
      {!isExpanded ? (
        // Collapsed state - compact pill button
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
            backdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
            WebkitBackdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
            border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
            borderRadius: 'var(--radius-xl, 20px)',
            boxShadow: 'var(--shadow-sm)',
            padding: '12px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Link2
            size={16}
            strokeWidth={2}
            style={{ color: 'var(--color-accent-primary, #ff7722)' }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-text-primary, #171412)',
              whiteSpace: 'nowrap',
            }}
          >
            {widget.title || 'Links'}
          </span>
          {hasLinks && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--color-text-muted, #8e827c)',
                background: 'var(--color-bg-subtle, #f2f0e7)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full, 9999px)',
              }}
            >
              {config.links.length}
            </span>
          )}
          <ChevronDown
            size={14}
            strokeWidth={2}
            style={{ color: 'var(--color-text-muted, #8e827c)' }}
          />
        </button>
      ) : (
        // Expanded state - full links panel
        <div
          style={{
            background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
            backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
            borderRadius: 'var(--radius-lg, 18px)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '200px',
            maxWidth: '280px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderBottom: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2
                size={16}
                strokeWidth={2}
                style={{ color: 'var(--color-accent-primary, #ff7722)' }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #171412)',
                }}
              >
                {widget.title || 'Links'}
              </span>
            </div>
            <ChevronUp
              size={14}
              strokeWidth={2}
              style={{ color: 'var(--color-text-muted, #8e827c)' }}
            />
          </button>

          {/* Links list */}
          <div style={{ padding: '6px' }}>
            {!hasLinks ? (
              <div
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  color: 'var(--color-text-muted, #8e827c)',
                  fontSize: 13,
                }}
              >
                <Link2
                  size={24}
                  strokeWidth={1.5}
                  style={{ marginBottom: 8, opacity: 0.5 }}
                />
                <div>No links added yet</div>
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
                      padding: '10px 10px',
                      borderRadius: 'var(--radius-sm, 10px)',
                      textDecoration: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-accent-primary-subtle, rgba(255, 119, 34, 0.08))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-xs, 8px)',
                        background: 'var(--color-bg-subtle, #f2f0e7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent
                        size={14}
                        strokeWidth={2}
                        style={{ color: 'var(--color-text-secondary, #4a4744)' }}
                      />
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-text-primary, #171412)',
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
                      style={{ color: 'var(--color-text-muted, #8e827c)', flexShrink: 0 }}
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
