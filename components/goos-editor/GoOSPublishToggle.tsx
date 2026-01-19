'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { goOSTokens } from './GoOSTipTapEditor';

export type PublishStatus = 'draft' | 'published';

interface GoOSPublishToggleProps {
  status: PublishStatus;
  onChange: (status: PublishStatus) => void;
  disabled?: boolean;
}

export function GoOSPublishToggle({ status, onChange, disabled }: GoOSPublishToggleProps) {
  const isDraft = status === 'draft';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Status Label */}
      <motion.span
        initial={false}
        animate={{
          color: isDraft ? goOSTokens.colors.accent.primary : '#22c55e',
        }}
        style={{
          fontSize: 12,
          fontWeight: 600,
          fontFamily: goOSTokens.fonts.body,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {isDraft ? 'Draft' : 'Published'}
      </motion.span>

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        onClick={() => !disabled && onChange(isDraft ? 'published' : 'draft')}
        disabled={disabled}
        style={{
          position: 'relative',
          width: 44,
          height: 24,
          borderRadius: 12,
          border: `2px solid ${goOSTokens.colors.border}`,
          background: isDraft ? goOSTokens.colors.accent.pale : '#bbf7d0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background 0.2s ease',
          padding: 0,
        }}
        aria-label={isDraft ? 'Publish document' : 'Unpublish document'}
        aria-checked={!isDraft}
      >
        {/* Track indicators */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 10,
            opacity: isDraft ? 0.6 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          D
        </span>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 10,
            opacity: isDraft ? 0 : 0.6,
            transition: 'opacity 0.2s',
          }}
        >
          P
        </span>

        {/* Thumb */}
        <motion.div
          initial={false}
          animate={{
            x: isDraft ? 0 : 20,
            background: isDraft ? goOSTokens.colors.accent.primary : '#22c55e',
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            border: `1.5px solid ${goOSTokens.colors.border}`,
            boxShadow: goOSTokens.shadows.sm,
            position: 'absolute',
            top: 2,
            left: 2,
          }}
        />
      </button>
    </div>
  );
}

// Compact version for tight spaces
export function GoOSPublishBadge({ status }: { status: PublishStatus }) {
  const isDraft = status === 'draft';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 4,
        border: `1.5px solid ${isDraft ? goOSTokens.colors.accent.primary : '#22c55e'}`,
        background: isDraft ? goOSTokens.colors.accent.pale + '60' : '#bbf7d060',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: goOSTokens.fonts.body,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: isDraft ? goOSTokens.colors.accent.primaryDark : '#15803d',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isDraft ? goOSTokens.colors.accent.primary : '#22c55e',
        }}
      />
      {isDraft ? 'Draft' : 'Live'}
    </span>
  );
}

export default GoOSPublishToggle;
