'use client';

import React, { useState } from 'react';
import { Coffee, Heart, X, ChevronDown } from 'lucide-react';
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

  const hasAmount = selectedAmount || customValue;

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
    >
      {!isExpanded ? (
        // Collapsed state - friendly pill button
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'var(--color-bg-base, #fbf9ef)',
            border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            borderRadius: 'var(--radius-full, 9999px)',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Coffee
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
            {widget.title || config.message}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            style={{ color: 'var(--color-text-muted, #8e827c)' }}
          />
        </button>
      ) : (
        // Expanded state - tip selection
        <div
          style={{
            background: 'var(--color-bg-base, #fbf9ef)',
            border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            borderRadius: 'var(--radius-lg, 12px)',
            boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(23, 20, 18, 0.12))',
            width: '240px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coffee
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
                Tip Jar
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                padding: 4,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted, #8e827c)',
                borderRadius: 'var(--radius-sm, 6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: selectedAmount === amount
                      ? '2px solid var(--color-accent-primary, #ff7722)'
                      : '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
                    background: selectedAmount === amount
                      ? 'var(--color-accent-primary-subtle, rgba(255, 119, 34, 0.1))'
                      : 'var(--color-bg-white, #ffffff)',
                    color: selectedAmount === amount
                      ? 'var(--color-accent-primary, #ff7722)'
                      : 'var(--color-text-primary, #171412)',
                    fontSize: 14,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
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
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted, #8e827c)',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Other"
                  value={customValue}
                  onChange={(e) => {
                    setCustomValue(e.target.value);
                    setSelectedAmount(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 24px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: customValue
                      ? '2px solid var(--color-accent-primary, #ff7722)'
                      : '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
                    background: 'var(--color-bg-white, #ffffff)',
                    color: 'var(--color-text-primary, #171412)',
                    fontSize: 14,
                    fontVariantNumeric: 'tabular-nums',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleTip}
              disabled={isLoading || !hasAmount}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm, 6px)',
                border: 'none',
                background: hasAmount
                  ? 'var(--color-accent-primary, #ff7722)'
                  : 'var(--color-bg-subtle, #f2f0e7)',
                color: hasAmount
                  ? 'var(--color-text-on-accent, #ffffff)'
                  : 'var(--color-text-muted, #8e827c)',
                fontSize: 13,
                fontWeight: 600,
                cursor: hasAmount ? 'pointer' : 'not-allowed',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              <Heart size={14} strokeWidth={2} />
              <span>{isLoading ? 'Processing...' : 'Send Tip'}</span>
            </button>
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as TIPJAR_WIDGET_DEFAULT_CONFIG };
