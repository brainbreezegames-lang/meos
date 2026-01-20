'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Heart, X } from 'lucide-react';
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
  onPositionChange?: (x: number, y: number) => void;
  onTip?: (amount: number) => Promise<void>;
}

const DEFAULT_CONFIG: TipJarWidgetConfig = {
  amounts: [5, 10, 25],
  customAmount: true,
  message: 'Buy me a coffee',
};

export function TipJarWidget({ widget, isOwner, onEdit, onPositionChange, onTip }: TipJarWidgetProps) {
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
      onPositionChange={onPositionChange}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            onClick={() => setIsExpanded(true)}
            className="relative"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 20px rgba(245, 158, 11, 0.2)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Gradient background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              }}
            />

            {/* Content */}
            <div
              className="relative flex items-center gap-2"
              style={{
                padding: '10px 16px',
              }}
            >
              <Coffee
                size={16}
                style={{ color: 'rgba(255,255,255,0.9)' }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: 'var(--font-body, system-ui)',
                  whiteSpace: 'nowrap',
                }}
              >
                {widget.title || config.message}
              </span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="relative"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              width: '200px',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Glass background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--bg-glass-elevated, rgba(255,255,255,0.95))',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}
            />

            {/* Content */}
            <div className="relative p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coffee
                    size={14}
                    style={{ color: '#d97706' }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #1a1a1a)',
                      fontFamily: 'var(--font-body, system-ui)',
                    }}
                  >
                    {widget.title || config.message}
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  style={{
                    padding: '4px',
                    borderRadius: '6px',
                    color: 'var(--text-tertiary, #888)',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Amount buttons */}
              <div className="flex gap-2 mb-3">
                {config.amounts.map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomValue('');
                    }}
                    className="flex-1"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: selectedAmount === amount
                        ? '2px solid #d97706'
                        : '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                      background: selectedAmount === amount
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'transparent',
                      color: 'var(--text-primary, #1a1a1a)',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-body, system-ui)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>

              {/* Custom amount */}
              {config.customAmount && (
                <div className="mb-3">
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      setSelectedAmount(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: customValue
                        ? '2px solid #d97706'
                        : '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                      background: customValue
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'transparent',
                      color: 'var(--text-primary, #1a1a1a)',
                      fontSize: '13px',
                      fontFamily: 'var(--font-body, system-ui)',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Submit button */}
              <motion.button
                onClick={handleTip}
                disabled={isLoading || (!selectedAmount && !customValue)}
                className="w-full flex items-center justify-center gap-2"
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: (selectedAmount || customValue)
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'var(--bg-tertiary, #f0f0f0)',
                  color: (selectedAmount || customValue) ? 'white' : 'var(--text-tertiary, #888)',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body, system-ui)',
                  cursor: (selectedAmount || customValue) ? 'pointer' : 'not-allowed',
                  opacity: isLoading ? 0.7 : 1,
                }}
                whileHover={(selectedAmount || customValue) ? { scale: 1.02 } : {}}
                whileTap={(selectedAmount || customValue) ? { scale: 0.98 } : {}}
              >
                <Heart size={14} />
                <span>{isLoading ? 'Processing...' : 'Send Tip'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as TIPJAR_WIDGET_DEFAULT_CONFIG };
