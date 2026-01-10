'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DesktopItem } from '@/types';

interface AppHeaderProps {
  item: DesktopItem;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export function AppHeader({
  item,
  onBack,
  rightAction,
}: AppHeaderProps) {
  const title = item.windowTitle || item.label;
  const subtitle = item.windowSubtitle;
  const heroImage = item.windowHeaderImage || item.thumbnailUrl;

  return (
    <motion.header
      className="flex-shrink-0 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero image section */}
      {heroImage && (
        <div className="relative h-56 overflow-hidden">
          {/* Background image with parallax-ready container */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <img
              src={heroImage}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          </motion.div>

          {/* Floating navigation bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-3"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 44px) + 4px)',
            }}
          >
            {/* Back button */}
            <motion.button
              onClick={onBack}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 36,
                height: 36,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.25)' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>

            {/* Right action */}
            <div className="flex items-center gap-2">
              {rightAction || (
                <motion.button
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" fill="white" />
                    <circle cx="19" cy="12" r="1" fill="white" />
                    <circle cx="5" cy="12" r="1" fill="white" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>

          {/* Title overlay at bottom of hero */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-4 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* Compact header when no hero image */}
      {!heroImage && (
        <>
          {/* Safe area spacer */}
          <div
            style={{
              height: 'env(safe-area-inset-top, 44px)',
              background: 'rgba(28, 28, 30, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-3 h-12"
            style={{
              background: 'rgba(28, 28, 30, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Back button */}
            <motion.button
              onClick={onBack}
              className="flex items-center gap-1 py-1 -ml-1"
              whileTap={{ opacity: 0.5 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0A84FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span
                style={{
                  fontSize: 17,
                  color: '#0A84FF',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                Back
              </span>
            </motion.button>

            {/* Centered title */}
            <div
              className="absolute left-0 right-0 flex justify-center pointer-events-none"
              style={{ paddingLeft: 80, paddingRight: 80 }}
            >
              <h1
                className="truncate"
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {title}
              </h1>
            </div>

            {/* Right action */}
            <div>{rightAction}</div>
          </div>
        </>
      )}
    </motion.header>
  );
}
