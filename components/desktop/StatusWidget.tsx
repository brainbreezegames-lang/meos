'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { StatusWidget as StatusWidgetType, StatusType } from '@/types';

interface StatusWidgetProps {
  statusWidget: StatusWidgetType | null;
  isOwner?: boolean;
  onEdit?: () => void;
}

const STATUS_CONFIG: Record<StatusType, { color: string; bgColor: string; label: string }> = {
  available: {
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    label: 'Available',
  },
  looking: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Looking for',
  },
  taking: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Taking',
  },
  open: {
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    label: 'Open to',
  },
  consulting: {
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    label: 'Consulting on',
  },
};

export function StatusWidget({ statusWidget, isOwner = false, onEdit }: StatusWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no status widget or not visible
  if (!statusWidget || !statusWidget.isVisible) {
    // Show placeholder for owner to add status
    if (isOwner) {
      return (
        <motion.button
          onClick={onEdit}
          className="fixed z-[150] cursor-pointer"
          style={{
            bottom: '120px',
            right: '24px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="px-4 py-3 rounded-2xl flex items-center gap-2"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
            }}
          >
            <span className="text-lg">+</span>
            <span>Add availability status</span>
          </div>
        </motion.button>
      );
    }
    return null;
  }

  const config = STATUS_CONFIG[statusWidget.statusType as StatusType] || STATUS_CONFIG.available;

  return (
    <motion.div
      className="fixed z-[150]"
      style={{
        bottom: '120px',
        right: '24px',
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        className="rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: 'var(--bg-glass-elevated)',
          backdropFilter: 'blur(40px)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '280px',
          minWidth: '200px',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header - Always visible */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Status indicator dot */}
          <motion.div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.color }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {statusWidget.title}
            </div>
          </div>

          {/* Expand indicator */}
          {(statusWidget.description || statusWidget.ctaUrl) && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ChevronDown size={16} />
            </motion.div>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (statusWidget.description || statusWidget.ctaUrl) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="px-4 pb-4 pt-1"
                style={{ borderTop: '1px solid var(--border-light)' }}
              >
                {/* Description */}
                {statusWidget.description && (
                  <p
                    className="text-sm mb-3"
                    style={{
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                    }}
                  >
                    {statusWidget.description}
                  </p>
                )}

                {/* CTA Button */}
                {statusWidget.ctaUrl && (
                  <a
                    href={statusWidget.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                    style={{
                      background: config.bgColor,
                      color: config.color,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {statusWidget.ctaLabel || 'Learn more'}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status type badge */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            background: config.bgColor,
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </motion.div>

      {/* Edit button for owner */}
      {isOwner && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--bg-glass-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-md)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}

export { STATUS_CONFIG };
export type { StatusWidgetProps };
