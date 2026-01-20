'use client';

import React from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

// goOS Design Tokens - Mediterranean Blue
const goOS = {
  colors: {
    paper: '#FFFFFF',
    border: '#2B4AE2',
    text: {
      primary: '#2B4AE2',
      secondary: '#2B4AE2',
    },
  },
  shadows: {
    solid: '4px 4px 0 #2B4AE2',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", monospace',
  },
};

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
}

const DEFAULT_CONFIG: BookWidgetConfig = {
  url: '',
  buttonText: 'Book a Call',
};

export function BookWidget({ widget, isOwner, onEdit, onDelete, onPositionChange }: BookWidgetProps) {
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
    >
      <button
        onClick={handleClick}
        style={{
          background: goOS.colors.paper,
          border: `2px solid ${goOS.colors.border}`,
          borderRadius: '8px',
          boxShadow: goOS.shadows.solid,
          padding: '10px 16px',
          cursor: config.url ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (config.url) {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 6px 0 #2B4AE2';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = goOS.shadows.solid;
        }}
      >
        <Calendar
          size={18}
          strokeWidth={2}
          style={{ color: goOS.colors.text.primary }}
        />
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: goOS.colors.text.primary,
            fontFamily: goOS.fonts.heading,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {widget.title || config.buttonText}
        </span>
        <ArrowUpRight
          size={14}
          strokeWidth={2.5}
          style={{ color: goOS.colors.text.primary, opacity: 0.7 }}
        />
      </button>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as BOOK_WIDGET_DEFAULT_CONFIG };
