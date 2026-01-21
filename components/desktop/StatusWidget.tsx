'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { StatusWidget as StatusWidgetType, StatusType } from '@/types';

interface StatusWidgetProps {
  statusWidget: StatusWidgetType | null;
  isOwner?: boolean;

interface StatusWidgetProps {
  statusWidget: StatusWidgetType | null;
  isOwner?: boolean;
  onEdit?: () => void;
}

export function StatusWidget({ statusWidget, isOwner = false, onEdit }: StatusWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useThemeSafe() || {};
  const isBrandAppart = theme === 'brand-appart';


  const STATUS_CONFIG: Record<StatusType, {
    emoji: string;
    gradient: string;
    glow: string;
    label: string;
    color: string;
    bgColor: string;
    borderColor?: string;
  }> = {
    available: {
      emoji: '✦',
      gradient: isBrandAppart ? '#3d2fa9' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      glow: isBrandAppart ? 'none' : '0 0 20px rgba(16, 185, 129, 0.4)',
      label: 'Available',
      color: isBrandAppart ? '#3d2fa9' : '#10b981',
      bgColor: isBrandAppart ? '#f2f0e7' : 'rgba(16, 185, 129, 0.1)',
      borderColor: isBrandAppart ? '#3d2fa9' : undefined,
    },
    looking: {
      emoji: '◈',
      gradient: isBrandAppart ? '#ff7722' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      glow: isBrandAppart ? 'none' : '0 0 20px rgba(59, 130, 246, 0.4)',
      label: 'Looking for',
      color: isBrandAppart ? '#ff7722' : '#3b82f6',
      bgColor: isBrandAppart ? '#f2f0e7' : 'rgba(59, 130, 246, 0.1)',
      borderColor: isBrandAppart ? '#ff7722' : undefined,
    },
    taking: {
      emoji: '◇',
      gradient: isBrandAppart ? '#ffc765' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      glow: isBrandAppart ? 'none' : '0 0 20px rgba(245, 158, 11, 0.4)',
      label: 'Taking',
      color: isBrandAppart ? '#ffc765' : '#f59e0b',
      bgColor: isBrandAppart ? '#f2f0e7' : 'rgba(245, 158, 11, 0.1)',
      borderColor: isBrandAppart ? '#ffc765' : undefined,
    },
    open: {
      emoji: '○',
      gradient: isBrandAppart ? '#ff3c34' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      glow: isBrandAppart ? 'none' : '0 0 20px rgba(139, 92, 246, 0.4)',
      label: 'Open to',
      color: isBrandAppart ? '#ff3c34' : '#8b5cf6',
      bgColor: isBrandAppart ? '#f2f0e7' : 'rgba(139, 92, 246, 0.1)',
      borderColor: isBrandAppart ? '#ff3c34' : undefined,
    },
    consulting: {
      emoji: '◎',
      gradient: isBrandAppart ? '#8e827c' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      glow: isBrandAppart ? 'none' : '0 0 20px rgba(6, 182, 212, 0.4)',
      label: 'Consulting',
      color: isBrandAppart ? '#8e827c' : '#06b6d4',
      bgColor: isBrandAppart ? '#f2f0e7' : 'rgba(6, 182, 212, 0.1)',
      borderColor: isBrandAppart ? '#8e827c' : undefined,
    },
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
              background: 'var(--bg-glass, rgba(255,255,255,0.8))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px dashed var(--border-medium, rgba(0,0,0,0.15))',
              color: 'var(--text-tertiary, #888)',
              fontSize: '13px',
              fontFamily: 'var(--font-body, system-ui)',
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

  const config = STATUS_CONFIG[statusWidget.statusType as StatusType] || STATUS_CONFIG.available;

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
            ? `0 8px 32px rgba(0,0,0,0.12), ${config.glow}`
            : '0 4px 20px rgba(0,0,0,0.08)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Glass background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isBrandAppart ? 'var(--brand-white)' : 'var(--bg-glass-elevated, rgba(255,255,255,0.92))',
            backdropFilter: isBrandAppart ? 'none' : 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: isBrandAppart ? 'none' : 'blur(40px) saturate(180%)',
            border: isBrandAppart ? '2px solid var(--brand-base)' : 'none',
            borderRadius: isBrandAppart ? '12px' : '24px',
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
              boxShadow: isBrandAppart ? 'none' : (isHovered ? config.glow : 'none'),
              transition: 'box-shadow 0.2s ease',
              border: isBrandAppart ? `1.5px solid ${config.borderColor || config.color}` : 'none',
              color: isBrandAppart ? (config.borderColor || config.color) : 'white',
              background: isBrandAppart ? 'transparent' : config.gradient,
              opacity: 1,
            }}
          >
            {config.emoji}
          </div>

          {/* Text */}
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary, #888)',
                fontFamily: 'var(--font-body, system-ui)',
              }}
            >
              {config.label}
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary, #1a1a1a)',
                fontFamily: 'var(--font-body, system-ui)',
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
