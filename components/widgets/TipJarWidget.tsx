'use client';

import React, { useState } from 'react';
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

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
};

export function TipJarWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted, onTip }: TipJarWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config: TipJarWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<TipJarWidgetConfig>) };

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
      {/* Small widget: 120x120 */}
      <div
        style={{
          ...WIDGET_CONTAINER,
          width: 120,
          height: 120,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {/* 3D Coffee cup with steam */}
        <div style={{ position: 'relative', marginBottom: 2 }}>
          <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
            {/* Steam wisps */}
            <path
              d="M10 8 Q12 4 10 0"
              stroke="#ccc"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M16 6 Q18 2 16 -2"
              stroke="#ccc"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M22 8 Q20 4 22 0"
              stroke="#ccc"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            {/* Cup body */}
            <path
              d="M4 12 L6 32 C6 34 8 36 16 36 C24 36 26 34 26 32 L28 12 Z"
              fill="url(#cupGradient)"
            />
            {/* Cup rim highlight */}
            <ellipse cx="16" cy="12" rx="12" ry="3" fill="#fff" opacity="0.8"/>
            <ellipse cx="16" cy="12" rx="11" ry="2.5" fill="#f5f5f0"/>
            {/* Handle */}
            <path
              d="M26 16 Q32 16 32 22 Q32 28 26 28"
              stroke="url(#cupGradient)"
              strokeWidth="3"
              fill="none"
            />
            <defs>
              <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8f7f4"/>
                <stop offset="100%" stopColor="#e8e7e2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Message */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#555',
            textAlign: 'center',
            lineHeight: 1.2,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          {widget.title || config.message}
        </span>

        {/* Amount buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {config.amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleTip(amount)}
              disabled={isLoading}
              style={{
                padding: '4px 8px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(145deg, #f8f7f4, #eeeee8)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8)',
                fontSize: 11,
                fontWeight: 600,
                color: '#555',
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.8)';
              }}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as TIPJAR_WIDGET_DEFAULT_CONFIG };
