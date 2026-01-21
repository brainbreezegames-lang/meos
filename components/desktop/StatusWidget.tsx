'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { StatusWidget as StatusWidgetType, StatusType } from '@/types';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';

interface StatusWidgetProps {
  statusWidget: StatusWidgetType | null;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function StatusWidget({ statusWidget, isOwner = false, onEdit }: StatusWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useWidgetTheme();

  const STATUS_LABELS: Record<StatusType, { emoji: string; label: string }> = {
    available: { emoji: '✦', label: 'Available' },
    looking: { emoji: '◈', label: 'Looking for' },
    taking: { emoji: '◇', label: 'Taking' },
    open: { emoji: '○', label: 'Open to' },
    consulting: { emoji: '◎', label: 'Consulting' },
  };

  if (!statusWidget || !statusWidget.isVisible) {
    if (isOwner) {
      return (
        <motion.button
          onClick={onEdit}
          className="fixed cursor-pointer"
          style={{
            bottom: '96px',
            right: '20px',
            zIndex: 9999,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="px-4 py-2.5 rounded-full flex items-center gap-2"
            style={{
              background: theme.colors.paper,
              border: `1px dashed ${theme.colors.border}`,
              color: theme.colors.text.muted,
              fontSize: '13px',
              fontFamily: theme.fonts.heading,
              borderRadius: theme.radii.pill,
            }}
          >
            <span style={{ opacity: 0.6 }}>+</span>
            <span>Add status</span>
          </div>
        </motion.button>
      );
    }
    return null;
  }

  const type = statusWidget.statusType as StatusType;
  const labelConfig = STATUS_LABELS[type] || STATUS_LABELS.available;
  const statusTheme = theme.status[type] || theme.status.available;

  return (
    <motion.div
      className="fixed"
      style={{
        bottom: '96px',
        right: '20px',
        zIndex: 9999,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main pill */}
      <motion.div
        className="relative cursor-pointer"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
        }}
        animate={{
          boxShadow: isHovered
            ? `0 8px 32px rgba(0,0,0,0.12), ${statusTheme.glow}`
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Glass background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.colors.paper,
            border: `2px solid ${statusTheme.borderColor || 'transparent'}`,
            borderRadius: theme.radii.pill,
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
              {statusWidget.title}
            </span>
          </div>

          {/* CTA arrow */}
          {statusWidget.ctaUrl && (
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
        {statusWidget.ctaUrl && (
          <a
            href={statusWidget.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0"
            style={{ zIndex: 1 }}
          />
        )}
      </motion.div>

      {/* Expanded tooltip on hover */}
      <AnimatePresence>
        {isHovered && statusWidget.description && (
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
                background: 'var(--bg-glass-elevated, rgba(255,255,255,0.95))',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary, #666)',
                  fontFamily: 'var(--font-body, system-ui)',
                  margin: 0,
                }}
              >
                {statusWidget.description}
              </p>
              {statusWidget.ctaLabel && statusWidget.ctaUrl && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: '1px solid var(--border-light, rgba(0,0,0,0.06))' }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--accent-primary, #3b82f6)',
                      fontFamily: 'var(--font-body, system-ui)',
                    }}
                  >
                    {statusWidget.ctaLabel} →
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Owner edit button */}
      {isOwner && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit?.();
          }}
          className="absolute flex items-center justify-center"
          style={{
            top: '-6px',
            right: '-6px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: 'var(--bg-solid, white)',
            border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
            color: 'var(--text-secondary, #666)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 2,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}

export type { StatusWidgetProps };
