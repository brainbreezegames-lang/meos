'use client';

import React, { useState } from 'react';
import { Coffee, Heart, X } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

import { useWidgetTheme } from '@/hooks/useWidgetTheme';

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

  const theme = useWidgetTheme();

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
          <Coffee
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
            {widget.title || config.message}
          </span>
        </button>
      ) : (
        <div
          style={{
            background: theme.colors.paper,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: theme.radii.card,
            boxShadow: theme.shadows.solid,
            width: '220px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: `2px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coffee size={16} strokeWidth={2} style={{ color: theme.colors.text.accent || theme.colors.text.primary }} />
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
                color: theme.colors.text.primary,
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
                    border: `2px solid ${theme.colors.border}`,
                    background: selectedAmount === amount ? (theme.colors.text.accent || theme.colors.border) : theme.colors.paper,
                    color: selectedAmount === amount ? '#FFFFFF' : theme.colors.text.primary,
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: theme.fonts.mono,
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
                  border: `2px solid ${customValue ? (theme.colors.text.accent || theme.colors.border) : theme.colors.text.muted}`,
                  background: theme.colors.paper,
                  color: theme.colors.text.primary,
                  fontSize: '14px',
                  fontFamily: theme.fonts.mono,
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
                border: `2px solid ${theme.colors.border}`,
                background: selectedAmount || customValue ? (theme.colors.text.accent || theme.colors.border) : theme.colors.paper,
                color: selectedAmount || customValue ? '#FFFFFF' : theme.colors.text.muted,
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: theme.fonts.heading,
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
