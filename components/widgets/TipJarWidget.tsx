'use client';

import React, { useState } from 'react';
import { Coffee, Heart, X } from 'lucide-react';
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
      muted: '#6B7FE8',
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
  onTip?: (amount: number) => Promise<void>;
}

const DEFAULT_CONFIG: TipJarWidgetConfig = {
  amounts: [5, 10, 25],
  customAmount: true,
  message: 'Buy me a coffee',
};

export function TipJarWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onTip }: TipJarWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config: TipJarWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<TipJarWidgetConfig>) };

  const handleTip = async () => {
    const amount = selectedAmount || (customValue ? parseFloat(customValue) : 0);
    if (amount > 0 && onTip) {
      setIsLoading(true);
      try {
        await onTip(amount);
        setIsExpanded(false);
        setSelectedAmount(null);
        setCustomValue('');
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
    >
      {!isExpanded ? (
        <button
          onDoubleClick={() => setIsExpanded(true)}
          style={{
            background: goOS.colors.paper,
            border: `2px solid ${goOS.colors.border}`,
            borderRadius: '8px',
            boxShadow: goOS.shadows.solid,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 6px 0 #2B4AE2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = goOS.shadows.solid;
          }}
        >
          <Coffee
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
            {widget.title || config.message}
          </span>
        </button>
      ) : (
        <div
          style={{
            background: goOS.colors.paper,
            border: `2px solid ${goOS.colors.border}`,
            borderRadius: '8px',
            boxShadow: goOS.shadows.solid,
            width: '220px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: `2px solid ${goOS.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coffee size={16} strokeWidth={2} style={{ color: goOS.colors.text.primary }} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: goOS.colors.text.primary,
                  fontFamily: goOS.fonts.heading,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Tip Jar
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                padding: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: goOS.colors.text.primary,
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '14px' }}>
            {/* Amount buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {config.amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomValue('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '6px',
                    border: `2px solid ${goOS.colors.border}`,
                    background: selectedAmount === amount ? goOS.colors.border : goOS.colors.paper,
                    color: selectedAmount === amount ? goOS.colors.paper : goOS.colors.text.primary,
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: goOS.fonts.mono,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            {config.customAmount && (
              <input
                type="number"
                placeholder="Custom $"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value);
                  setSelectedAmount(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  borderRadius: '6px',
                  border: `2px solid ${customValue ? goOS.colors.border : goOS.colors.text.muted}`,
                  background: goOS.colors.paper,
                  color: goOS.colors.text.primary,
                  fontSize: '14px',
                  fontFamily: goOS.fonts.mono,
                  outline: 'none',
                }}
              />
            )}

            {/* Submit button */}
            <button
              onClick={handleTip}
              disabled={isLoading || (!selectedAmount && !customValue)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                border: `2px solid ${goOS.colors.border}`,
                background: selectedAmount || customValue ? goOS.colors.border : goOS.colors.paper,
                color: selectedAmount || customValue ? goOS.colors.paper : goOS.colors.text.muted,
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: goOS.fonts.heading,
                cursor: selectedAmount || customValue ? 'pointer' : 'not-allowed',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <Heart size={14} strokeWidth={2.5} />
              <span>{isLoading ? 'Processing...' : 'Send Tip'}</span>
            </button>
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as TIPJAR_WIDGET_DEFAULT_CONFIG };
