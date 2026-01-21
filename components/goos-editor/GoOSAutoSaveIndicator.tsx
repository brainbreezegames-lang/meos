'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { goOSTokens } from './GoOSTipTapEditor';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface GoOSAutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
}

export function GoOSAutoSaveIndicator({ status, lastSaved }: GoOSAutoSaveIndicatorProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return {
          icon: (
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <circle
                cx="6"
                cy="6"
                r="5"
                stroke={goOSTokens.colors.accent.primary}
                strokeWidth="1.5"
                strokeDasharray="20"
                strokeDashoffset="5"
              />
            </motion.svg>
          ),
          text: 'Saving...',
          color: goOSTokens.colors.accent.primary,
        };
      case 'saved':
        return {
          icon: (
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 400 }}
            >
              <circle cx="6" cy="6" r="5" stroke={goOSTokens.colors.status.success} strokeWidth="1.5" />
              <path
                d="M3.5 6L5 7.5L8.5 4"
                stroke={goOSTokens.colors.status.success}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ),
          text: lastSaved ? formatTimeAgo(lastSaved) : 'Saved',
          color: goOSTokens.colors.status.success,
        };
      case 'error':
        return {
          icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={goOSTokens.colors.status.error} strokeWidth="1.5" />
              <path d="M6 3.5v3" stroke={goOSTokens.colors.status.error} strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.75" fill={goOSTokens.colors.status.error} />
            </svg>
          ),
          text: 'Error saving',
          color: goOSTokens.colors.status.error,
        };
      case 'offline':
        return {
          icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 6a5 5 0 019.9-.5M11 6a5 5 0 01-9.9.5"
                stroke={goOSTokens.colors.text.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M1 1l10 10"
                stroke={goOSTokens.colors.text.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ),
          text: 'Offline',
          color: goOSTokens.colors.text.muted,
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();

  return (
    <AnimatePresence mode="wait">
      {content && (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: goOSTokens.radii.sm,
            background: status === 'saved'
              ? goOSTokens.colors.status.successLight
              : status === 'error'
              ? goOSTokens.colors.status.errorLight
              : goOSTokens.colors.accent.pale,
            fontFamily: goOSTokens.fonts.body,
            fontSize: 11,
            fontWeight: 500,
            color: content.color,
          }}
        >
          {content.icon}
          <span>{content.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'Just saved';
  if (seconds < 60) return `Saved ${seconds}s ago`;
  if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `Saved ${Math.floor(seconds / 3600)}h ago`;
  return `Saved ${Math.floor(seconds / 86400)}d ago`;
}

export default GoOSAutoSaveIndicator;
