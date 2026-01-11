'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { useMobileNav } from '@/contexts/MobileNavigationContext';

interface ControlCenterProps {
  username?: string;
  profileImage?: string;
  profileName?: string;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onShare?: () => void;
  onQRCode?: () => void;
  onContact?: () => void;
  brightness?: number;
  onBrightnessChange?: (value: number) => void;
}

export function ControlCenter({
  username,
  profileImage,
  profileName,
  theme = 'dark',
  onThemeToggle,
  onShare,
  onQRCode,
  onContact,
  brightness = 100,
  onBrightnessChange,
}: ControlCenterProps) {
  const { state, toggleControlCenter } = useMobileNav();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Spring-based swipe dismiss
  const rawY = useMotionValue(0);
  const y = useSpring(rawY, { stiffness: 500, damping: 50, mass: 0.8 });
  const panelOpacity = useTransform(y, [-100, 0], [0.5, 1]);
  const panelScale = useTransform(y, [-100, 0], [0.95, 1]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !state.showControlCenter) return;

    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = startY - e.touches[0].clientY;
      if (deltaY > 0) {
        rawY.set(-deltaY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = startY - e.changedTouches[0].clientY;
      if (deltaY > 60) {
        if ('vibrate' in navigator) navigator.vibrate(5);
        toggleControlCenter();
      }
      rawY.set(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state.showControlCenter, toggleControlCenter, rawY]);

  // Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleControlCenter();
    }
  };

  return (
    <AnimatePresence>
      {state.showControlCenter && (
        <>
          {/* Multi-layer backdrop for depth */}
          <motion.div
            className="fixed inset-0 z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleControlCenter}
            aria-hidden="true"
          >
            {/* Base blur layer */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.35)' }}
            />
          </motion.div>

          {/* Control Center Panel */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-label="Control Center"
            aria-modal="true"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="fixed top-0 right-0 z-[201] w-[88%] max-w-[340px]"
            style={{
              paddingTop: 'env(safe-area-inset-top, 44px)',
              y: prefersReducedMotion ? 0 : y,
              opacity: prefersReducedMotion ? 1 : panelOpacity,
              scale: prefersReducedMotion ? 1 : panelScale,
            }}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : {
              type: 'spring',
              stiffness: 400,
              damping: 40,
              mass: 0.8,
            }}
          >
            <div
              className="m-3 rounded-[32px] overflow-hidden"
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(50px) saturate(200%)',
                WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Profile Section */}
              {(profileImage || profileName) && (
                <motion.div
                  className="relative p-4 flex items-center gap-3"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.05 }}
                >
                  {/* Bottom separator with gradient */}
                  <div
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, var(--border-light) 50%, transparent 100%)' }}
                    aria-hidden="true"
                  />

                  {profileImage && (
                    <div
                      className="relative w-14 h-14 rounded-2xl overflow-hidden"
                      style={{ boxShadow: 'var(--shadow-md)' }}
                    >
                      <img
                        src={profileImage}
                        alt={`${profileName || 'User'}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p
                      className="font-semibold"
                      style={{
                        color: 'var(--text-primary)',
                        fontSize: 16,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {profileName}
                    </p>
                    {username && (
                      <p
                        className="text-sm"
                        style={{
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        @{username}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Quick Actions Grid */}
              <div className="p-3 grid grid-cols-2 gap-2.5" role="group" aria-label="Quick actions">
                {/* Theme Toggle */}
                <ControlButton
                  icon={theme === 'dark' ? '🌙' : '☀️'}
                  label={theme === 'dark' ? 'Dark' : 'Light'}
                  isActive={theme === 'dark'}
                  onClick={onThemeToggle}
                  delay={0.1}
                  ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                />

                {/* Share */}
                <ControlButton
                  icon="📤"
                  label="Share"
                  onClick={onShare}
                  delay={0.12}
                  ariaLabel="Share this profile"
                />

                {/* QR Code */}
                <ControlButton
                  icon="📱"
                  label="QR Code"
                  onClick={onQRCode}
                  delay={0.14}
                  ariaLabel="Show QR code"
                />

                {/* Contact */}
                <ControlButton
                  icon="✉️"
                  label="Contact"
                  onClick={onContact}
                  delay={0.16}
                  ariaLabel="Contact this person"
                />
              </div>

              {/* Brightness Slider */}
              <motion.div
                className="px-3 pb-3"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.18 }}
              >
                <div
                  className="p-4 rounded-2xl relative overflow-hidden"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <label className="flex items-center gap-3">
                    <span className="text-lg opacity-60" aria-hidden="true">☀️</span>
                    <div className="flex-1 relative h-8">
                      {/* Custom slider track */}
                      <div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{ background: 'var(--bg-tertiary)' }}
                        aria-hidden="true"
                      >
                        {/* Filled portion */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 rounded-full"
                          style={{
                            width: `${brightness}%`,
                            background: 'linear-gradient(90deg, var(--text-quaternary) 0%, var(--text-secondary) 100%)',
                          }}
                          animate={{ width: `${brightness}%` }}
                          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={brightness}
                        onChange={(e) => onBrightnessChange?.(parseInt(e.target.value))}
                        aria-label="Brightness"
                        aria-valuemin={20}
                        aria-valuemax={100}
                        aria-valuenow={brightness}
                        className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer focus-visible:outline-none"
                        style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                    <span className="text-lg" aria-hidden="true">☀️</span>
                  </label>
                </div>
              </motion.div>

              {/* Drag indicator - larger touch target */}
              <div className="flex justify-center pb-3">
                <div
                  className="py-2 px-8"
                  role="button"
                  aria-label="Swipe up to close"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleControlCenter();
                    }
                  }}
                >
                  <div
                    className="w-10 h-1 rounded-full"
                    style={{ background: 'var(--text-quaternary)' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ControlButtonProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  delay?: number;
  ariaLabel: string;
}

function ControlButton({ icon, label, isActive = false, onClick, delay = 0, ariaLabel }: ControlButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={() => {
        if ('vibrate' in navigator) navigator.vibrate(3);
        onClick?.();
      }}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className="relative flex flex-col items-center justify-center py-4 rounded-2xl overflow-hidden min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
      style={{
        background: isActive
          ? 'color-mix(in srgb, var(--accent-primary) 25%, transparent)'
          : 'var(--bg-secondary)',
        boxShadow: isActive
          ? 'inset 0 1px 0 rgba(255,255,255,0.1)'
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: prefersReducedMotion ? 0 : delay, type: 'spring', stiffness: 400, damping: 25 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
    >
      <span className="text-2xl mb-1.5" aria-hidden="true">{icon}</span>
      <span
        className="text-xs font-medium"
        style={{
          color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontFamily: 'var(--font-body)',
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
