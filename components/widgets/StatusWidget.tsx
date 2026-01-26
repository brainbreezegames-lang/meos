'use client';

import React from 'react';
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

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
};

// Status colors and styles
const STATUS_STYLES: Record<StatusType, { color: string; glow: string; label: string }> = {
  available: {
    color: '#22c55e',
    glow: '0 0 12px rgba(34, 197, 94, 0.4)',
    label: 'Available',
  },
  looking: {
    color: '#f59e0b',
    glow: '0 0 12px rgba(245, 158, 11, 0.4)',
    label: 'Looking for',
  },
  taking: {
    color: '#f59e0b',
    glow: '0 0 12px rgba(245, 158, 11, 0.4)',
    label: 'Taking',
  },
  open: {
    color: '#3b82f6',
    glow: '0 0 12px rgba(59, 130, 246, 0.4)',
    label: 'Open to',
  },
  consulting: {
    color: '#8b5cf6',
    glow: '0 0 12px rgba(139, 92, 246, 0.4)',
    label: 'Consulting',
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
  const config: StatusWidgetConfig = {
    ...STATUS_WIDGET_DEFAULT_CONFIG,
    ...(widget.config as Partial<StatusWidgetConfig>),
  };

  const statusStyle = STATUS_STYLES[config.statusType] || STATUS_STYLES.available;
  const hasDescription = config.description && config.description.trim().length > 0;
  const hasCta = config.ctaUrl && config.ctaLabel;

  // Wide widget for full availability display, or compact without description
  const isCompact = !hasDescription && !hasCta;

  const content = (
    <div
      style={{
        ...WIDGET_CONTAINER,
        width: isCompact ? 200 : 280,
        minHeight: isCompact ? 56 : 100,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Status indicator row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Glowing dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: statusStyle.color,
            boxShadow: statusStyle.glow,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#333',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
            color: '#666',
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          {config.description}
        </p>
      )}

      {/* CTA Button */}
      {hasCta && (
        <a
          href={config.ctaUrl!}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            borderRadius: 12,
            background: 'linear-gradient(145deg, #f8f7f4, #eeeee8)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.8)',
            fontSize: 13,
            fontWeight: 600,
            color: '#333',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.8)';
          }}
        >
          {config.ctaLabel}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginLeft: 6 }}
          >
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
        </a>
      )}
    </div>
  );

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
      {content}
    </WidgetWrapper>
  );
}

export type { StatusWidgetProps, StatusWidgetConfig };
