'use client';

import React from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface BookWidgetConfig {
  url: string;
  buttonText: string;
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
  buttonText: 'Book a Call',
};

export function BookWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: BookWidgetProps) {
  const config: BookWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<BookWidgetConfig>) };

  const handleClick = () => {
    if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
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
      <button
        onClick={handleClick}
        style={{
          background: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
          backdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
          WebkitBackdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
          border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
          borderRadius: 'var(--radius-xl, 20px)',
          boxShadow: 'var(--shadow-sm)',
          padding: '12px 18px',
          cursor: config.url ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (config.url) {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Calendar
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
          {widget.title || config.buttonText}
        </span>
        <ArrowUpRight
          size={14}
          strokeWidth={2}
          style={{ color: 'var(--color-text-muted, #8e827c)' }}
        />
      </button>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as BOOK_WIDGET_DEFAULT_CONFIG };
