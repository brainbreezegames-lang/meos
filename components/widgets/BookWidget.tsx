'use client';

import React from 'react';
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

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
};

export function BookWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: BookWidgetProps) {
  const config: BookWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<BookWidgetConfig>) };

  const handleClick = () => {
    if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get today's date for the calendar icon
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
      {/* Large widget: 280x180 */}
      <div
        style={{
          ...WIDGET_CONTAINER,
          width: 280,
          height: 160,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {/* 3D Calendar icon */}
          <div
            style={{
              width: 52,
              height: 56,
              borderRadius: 10,
              background: 'linear-gradient(145deg, #ffffff, #f0efea)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.9)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Calendar header (red strip) */}
            <div
              style={{
                height: 14,
                background: 'linear-gradient(180deg, #ef4444, #dc2626)',
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
            {/* Calendar body */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 600,
                color: '#333',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
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
                color: '#333',
                margin: 0,
                marginBottom: 6,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              {widget.title || 'Book a Call'}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#777',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              {config.duration} · {config.price}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleClick}
          disabled={!config.url}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 14,
            border: 'none',
            background: config.url
              ? 'linear-gradient(145deg, #f8f7f4, #eeeee8)'
              : '#f0f0f0',
            boxShadow: config.url
              ? '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.8)'
              : 'none',
            fontSize: 13,
            fontWeight: 600,
            color: config.url ? '#333' : '#999',
            cursor: config.url ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
          onMouseEnter={(e) => {
            if (config.url) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.8)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.8)';
          }}
        >
          {config.buttonText || 'View Times'}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as BOOK_WIDGET_DEFAULT_CONFIG };
