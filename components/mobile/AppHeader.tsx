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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Safe area top */}
      <div
        style={{
          height: 'env(safe-area-inset-top, 44px)',
          background: transparent ? 'transparent' : 'rgba(30, 30, 30, 0.8)',
          backdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
        }}
      />

      {/* Header content */}
      <div
        className="flex items-center justify-between px-4 h-11"
        style={{
          background: transparent ? 'transparent' : 'rgba(30, 30, 30, 0.8)',
          backdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
          borderBottom: transparent ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1 -ml-2 px-2 py-1.5 rounded-lg"
          whileTap={{ scale: 0.95, opacity: 0.7 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-400"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span
            className="text-blue-400 font-normal"
            style={{
              fontSize: 17,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            }}
          >
            Back
          </span>
        </motion.button>

        {/* Title (small mode) */}
        {!large && (
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <h1
              className="font-semibold truncate max-w-[180px]"
              style={{
                fontSize: 17,
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
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
        <div
          className="px-4 pt-1 pb-2"
          style={{
            background: transparent ? 'transparent' : 'rgba(30, 30, 30, 0.8)',
            backdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: transparent ? 'none' : 'blur(20px) saturate(180%)',
          }}
        >
          <h1
            className="font-bold"
            style={{
              fontSize: 34,
              color: 'white',
              letterSpacing: -0.5,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-white/60 mt-0.5"
              style={{
                fontSize: 15,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </motion.header>
  );
}
