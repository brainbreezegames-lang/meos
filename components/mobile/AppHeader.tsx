'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  large?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  transparent = false,
  large = false,
}: AppHeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-50 flex-shrink-0"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Safe area top with glass */}
      <div
        style={{
          height: 'env(safe-area-inset-top, 44px)',
          background: transparent
            ? 'transparent'
            : 'linear-gradient(180deg, rgba(24, 24, 32, 0.95) 0%, rgba(24, 24, 32, 0.85) 100%)',
          backdropFilter: transparent ? 'none' : 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: transparent ? 'none' : 'blur(24px) saturate(180%)',
        }}
      />

      {/* Header content */}
      <div
        className="relative flex items-center justify-between px-4 h-11"
        style={{
          background: transparent
            ? 'transparent'
            : 'linear-gradient(180deg, rgba(24, 24, 32, 0.85) 0%, rgba(24, 24, 32, 0.75) 100%)',
          backdropFilter: transparent ? 'none' : 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: transparent ? 'none' : 'blur(24px) saturate(180%)',
        }}
      >
        {/* Bottom border with gradient */}
        {!transparent && (
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent 100%)',
            }}
          />
        )}

        {/* Back button with press effect */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1 -ml-2 px-2 py-1.5 rounded-xl"
          whileTap={{ scale: 0.92, opacity: 0.7 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#0A84FF]"
          >
            <polyline points="15 18 9 12 15 6" />
          </motion.svg>
          <span
            className="font-normal"
            style={{
              fontSize: 17,
              color: '#0A84FF',
              fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            Back
          </span>
        </motion.button>

        {/* Title (small mode) - centered */}
        {!large && (
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
            <h1
              className="font-semibold truncate max-w-[180px]"
              style={{
                fontSize: 17,
                color: 'white',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                letterSpacing: '-0.01em',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              {title}
            </h1>
          </div>
        )}

        {/* Right action */}
        <div className="flex items-center">
          {rightAction}
        </div>
      </div>

      {/* Large title (iOS style) */}
      {large && (
        <motion.div
          className="px-4 pt-1 pb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            background: transparent
              ? 'transparent'
              : 'linear-gradient(180deg, rgba(24, 24, 32, 0.75) 0%, transparent 100%)',
            backdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
          }}
        >
          <h1
            className="font-bold"
            style={{
              fontSize: 34,
              color: 'white',
              letterSpacing: '-0.5px',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-0.5"
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.55)',
                fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}
