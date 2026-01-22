'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget, StatusType } from '@/types';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';

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
  title: 'Open for work',
  description: null,
  ctaUrl: null,
  ctaLabel: null,
};

const STATUS_LABELS: Record<StatusType, { emoji: string; label: string }> = {
  available: { emoji: '✦', label: 'Available' },
  looking: { emoji: '◈', label: 'Looking for' },
  taking: { emoji: '◇', label: 'Taking' },
  open: { emoji: '○', label: 'Open to' },
  consulting: { emoji: '◎', label: 'Consulting' },
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
  const [isHovered, setIsHovered] = useState(false);
  const theme = useWidgetTheme();
  const config: StatusWidgetConfig = {
    ...STATUS_WIDGET_DEFAULT_CONFIG,
    ...(widget.config as Partial<StatusWidgetConfig>),
  };

  const labelConfig = STATUS_LABELS[config.statusType] || STATUS_LABELS.available;
  const statusTheme = theme.status[config.statusType] || theme.status.available;

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
      onContextMenu={onContextMenu}
      isHighlighted={isHighlighted}
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
      }}
    >
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main pill */}
        <motion.div
          className="relative cursor-pointer"
          style={{
            borderRadius: 'var(--radius-xl, 22px)',
            overflow: 'hidden',
          }}
          animate={{
            boxShadow: isHovered
              ? `var(--shadow-md), ${statusTheme.glow}`
              : 'var(--shadow-sm)',
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Glass background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
              backdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
              WebkitBackdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
              border: statusTheme.borderColor ? `1px solid ${statusTheme.borderColor}` : '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
              borderRadius: 'var(--radius-xl, 22px)',
            }}
          />

          {/* Content */}
          <div
            className="relative flex items-center gap-3"
            style={{
              padding: '10px 16px 10px 12px',
            }}
          >
            {/* Status indicator */}
            <div
              className="flex items-center justify-center"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                boxShadow: isHovered && statusTheme.glow !== 'none' ? statusTheme.glow : 'none',
                transition: 'box-shadow 0.2s ease',
                border: statusTheme.borderColor ? `1.5px solid ${statusTheme.borderColor}` : 'none',
                color: statusTheme.borderColor ? statusTheme.borderColor : 'white',
                background: statusTheme.gradient !== 'transparent' ? statusTheme.gradient : 'transparent',
                opacity: 1,
              }}
            >
              {labelConfig.emoji}
            </div>

            {/* Text */}
            <div className="flex flex-col" style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: theme.colors.text.muted,
                  fontFamily: theme.fonts.heading,
                }}
              >
                {labelConfig.label}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: theme.colors.text.primary,
                  fontFamily: theme.fonts.heading,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '160px',
                }}
              >
                {config.title}
              </span>
            </div>

            {/* CTA arrow */}
            {config.ctaUrl && (
              <motion.div
                animate={{
                  x: isHovered ? 2 : 0,
                  opacity: isHovered ? 1 : 0.5,
                }}
                transition={{ duration: 0.15 }}
              >
                <ArrowUpRight
                  size={14}
                  style={{ color: 'var(--text-tertiary, #888)' }}
                />
              </motion.div>
            )}
          </div>

          {/* Clickable link overlay */}
          {config.ctaUrl && (
            <a
              href={config.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              style={{ zIndex: 1 }}
            />
          )}
        </motion.div>

        {/* Expanded tooltip on hover */}
        <AnimatePresence>
          {isHovered && config.description && (
            <motion.div
              className="absolute right-0 mt-2"
              style={{
                bottom: '100%',
                marginBottom: '8px',
                width: '240px',
              }}
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div
                style={{
                  background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
                  backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
                  WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
                  borderRadius: 'var(--radius-md, 14px)',
                  padding: '12px 14px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: 'var(--color-text-secondary, #4a4744)',
                    fontFamily: 'var(--font-body)',
                    margin: 0,
                  }}
                >
                  {config.description}
                </p>
                {config.ctaLabel && config.ctaUrl && (
                  <div
                    className="mt-2 pt-2"
                    style={{ borderTop: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))' }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--color-accent-primary, #ff7722)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {config.ctaLabel} →
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </WidgetWrapper>
  );
}

export type { StatusWidgetProps, StatusWidgetConfig };
