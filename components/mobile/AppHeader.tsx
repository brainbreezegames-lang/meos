'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.header
      className="flex-shrink-0 relative"
      initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {/* Hero image section */}
      {heroImage && !imageError && (
        <div className="relative h-56 overflow-hidden">
          {/* Background image with parallax-ready container */}
          <motion.div
            className="absolute inset-0"
            initial={prefersReducedMotion ? {} : { scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <img
              src={heroImage}
              alt={`Header image for ${title}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)',
              }}
              aria-hidden="true"
            />
          </motion.div>

          {/* Floating navigation bar */}
          <nav
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-3"
            style={{
              paddingTop: 'calc(env(safe-area-inset-top, 44px) + 4px)',
            }}
            aria-label="App navigation"
          >
            {/* Back button - 44px touch target */}
            <motion.button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              style={{
                width: 44,
                height: 44,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              whileHover={prefersReducedMotion ? {} : { background: 'rgba(255, 255, 255, 0.25)' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--text-on-dark)' }}
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>

            {/* Right action */}
            <div className="flex items-center gap-2">
              {rightAction || (
                <motion.button
                  aria-label="More options"
                  className="flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--text-on-dark)' }}
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="19" cy="12" r="1" fill="currentColor" />
                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                  </svg>
                </motion.button>
              )}
            </div>
          </nav>

          {/* Title overlay at bottom of hero */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-4 pb-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.15, duration: prefersReducedMotion ? 0 : 0.4 }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--text-on-dark)',
                fontFamily: 'var(--font-display)',
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
                  color: 'var(--text-on-dark)',
                  opacity: 0.85,
                  fontFamily: 'var(--font-body)',
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
      {(!heroImage || imageError) && (
        <>
          {/* Safe area spacer */}
          <div
            style={{
              height: 'env(safe-area-inset-top, 44px)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            aria-hidden="true"
          />

          {/* Header bar */}
          <nav
            className="flex items-center justify-between px-3 h-12 relative"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-light)',
            }}
            aria-label="App navigation"
          >
            {/* Back button - 44px touch target */}
            <motion.button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center gap-1 py-1 -ml-1 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: 'var(--accent-primary)' }}
              whileTap={prefersReducedMotion ? {} : { opacity: 0.5 }}
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
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span
                style={{
                  fontSize: 17,
                  fontFamily: 'var(--font-body)',
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
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {title}
              </h1>
            </div>

            {/* Right action */}
            <div>{rightAction}</div>
          </nav>
        </>
      )}
    </motion.header>
  );
}
