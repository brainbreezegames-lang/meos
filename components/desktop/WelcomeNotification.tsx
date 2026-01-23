'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SparkleEffect, haptic } from '@/components/ui/Delight';

interface WelcomeNotificationProps {
  title?: string;
  subtitle?: string;
  body?: string;
  icon?: string;
  delay?: number;
  duration?: number;
  onDismiss?: () => void;
}

export function WelcomeNotification({
  title = 'Welcome to MeOS',
  subtitle = 'Your personal web desktop',
  body = 'Click any icon to explore. Use the menu bar to switch themes.',
  icon = '🖥️',
  delay = 1500,
  duration = 8000,
  onDismiss,
}: WelcomeNotificationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome notification
    const seen = localStorage.getItem('meos-welcome-seen');
    if (!seen) {
      setHasSeenWelcome(false);
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(showTimer);
    }
  }, [delay]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const hideTimer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(hideTimer);
    }
  }, [isVisible, duration]);

  const handleDismiss = () => {
    setShowSparkles(true);
    haptic('success');
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('meos-welcome-seen', 'true');
      onDismiss?.();
    }, 300);
  };

  if (hasSeenWelcome) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-[200] cursor-pointer"
          style={{
            top: '44px',
            right: '16px',
            width: '360px',
          }}
          initial={prefersReducedMotion ? { opacity: 0 } : { x: 400, opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { x: 400, opacity: 0 }}
          transition={prefersReducedMotion
            ? { duration: 0.1 }
            : { type: 'spring', stiffness: 400, damping: 35, mass: 1 }
          }
          onClick={handleDismiss}
        >
          <div
            className="overflow-hidden relative"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              boxShadow: `
                0 24px 80px -12px rgba(0, 0, 0, 0.4),
                0 12px 36px -8px rgba(0, 0, 0, 0.25),
                0 0 0 0.5px var(--border-glass-outer),
                inset 0 0.5px 0 0.5px var(--border-glass-inner)
              `,
              border: 'var(--border-width) solid var(--border-light)',
            }}
          >
            {/* Dismiss celebration */}
            <SparkleEffect
              trigger={showSparkles}
              config={{
                count: 15,
                spread: 80,
                colors: ['var(--accent-primary)', '#FFD700', '#4ECDC4', '#FF6B6B'],
                duration: 400,
              }}
            />

            {/* Progress bar */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute top-0 left-0 h-[2px]"
                style={{
                  background: 'var(--accent-primary)',
                }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}

            <div className="flex gap-3 p-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, color-mix(in srgb, var(--accent-primary) 70%, black) 100%)',
                  boxShadow: '0 4px 12px -2px var(--accent-primary)',
                }}
              >
                <span className="text-2xl">{icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4
                      className="font-semibold leading-tight"
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: 'var(--letter-spacing-tight)',
                      }}
                    >
                      {title}
                    </h4>
                    <p
                      className="leading-tight"
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {subtitle}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss();
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    style={{
                      background: 'var(--border-light)',
                    }}
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                      <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <p
                  className="mt-1.5"
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 'var(--line-height-normal)',
                  }}
                >
                  {body}
                </p>

                {/* Action hint */}
                <p
                  className="mt-2 flex items-center gap-1"
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span style={{ opacity: 0.6 }}>Click to dismiss</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
