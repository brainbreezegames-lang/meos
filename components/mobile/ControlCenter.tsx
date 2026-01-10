'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
              }}
            />
          </motion.div>

          {/* Control Center Panel */}
          <motion.div
            ref={containerRef}
            className="fixed top-0 right-0 z-[201] w-[88%] max-w-[340px]"
            style={{
              paddingTop: 'env(safe-area-inset-top, 44px)',
              y,
              opacity: panelOpacity,
              scale: panelScale,
            }}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
              mass: 0.8,
            }}
          >
            <div
              className="m-3 rounded-[32px] overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(45, 45, 55, 0.98) 0%, rgba(35, 35, 45, 0.96) 100%)',
                backdropFilter: 'blur(50px) saturate(200%)',
                WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                boxShadow: `
                  0 25px 60px rgba(0, 0, 0, 0.45),
                  0 10px 20px rgba(0, 0, 0, 0.25),
                  inset 0 1px 0 rgba(255, 255, 255, 0.08),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `,
              }}
            >
              {/* Inner highlight border */}
              <div
                className="absolute inset-0 rounded-[32px] pointer-events-none"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />

              {/* Profile Section */}
              {(profileImage || profileName) && (
                <motion.div
                  className="relative p-4 flex items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {/* Bottom separator with gradient */}
                  <div
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                    }}
                  />

                  {profileImage && (
                    <div
                      className="relative w-14 h-14 rounded-2xl overflow-hidden"
                      style={{
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                      }}
                    >
                      <img
                        src={profileImage}
                        alt={profileName || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p
                      className="font-semibold"
                      style={{
                        color: 'white',
                        fontSize: 16,
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {profileName}
                    </p>
                    {username && (
                      <p
                        className="text-sm"
                        style={{
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        @{username}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Quick Actions Grid */}
              <div className="p-3 grid grid-cols-2 gap-2.5">
                {/* Theme Toggle */}
                <ControlButton
                  icon={theme === 'dark' ? '🌙' : '☀️'}
                  label={theme === 'dark' ? 'Dark' : 'Light'}
                  isActive={theme === 'dark'}
                  onClick={onThemeToggle}
                  delay={0.1}
                />

                {/* Share */}
                <ControlButton
                  icon="📤"
                  label="Share"
                  onClick={onShare}
                  delay={0.12}
                />

                {/* QR Code */}
                <ControlButton
                  icon="📱"
                  label="QR Code"
                  onClick={onQRCode}
                  delay={0.14}
                />

                {/* Contact */}
                <ControlButton
                  icon="✉️"
                  label="Contact"
                  onClick={onContact}
                  delay={0.16}
                />
              </div>

              {/* Brightness Slider */}
              <motion.div
                className="px-3 pb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <div
                  className="p-4 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg opacity-60">☀️</span>
                    <div className="flex-1 relative h-8">
                      {/* Custom slider track */}
                      <div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {/* Filled portion */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 rounded-full"
                          style={{
                            width: `${brightness}%`,
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.4) 100%)',
                            boxShadow: '0 0 8px rgba(255,255,255,0.2)',
                          }}
                          animate={{ width: `${brightness}%` }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={brightness}
                        onChange={(e) => onBrightnessChange?.(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer"
                        style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                    <span className="text-lg">☀️</span>
                  </div>
                </div>
              </motion.div>

              {/* Drag indicator */}
              <div className="flex justify-center pb-3">
                <motion.div
                  className="w-10 h-1 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 4px rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
                />
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
}

function ControlButton({ icon, label, isActive = false, onClick, delay = 0 }: ControlButtonProps) {
  return (
    <motion.button
      onClick={() => {
        if ('vibrate' in navigator) navigator.vibrate(3);
        onClick?.();
      }}
      className="relative flex flex-col items-center justify-center py-4 rounded-2xl overflow-hidden"
      style={{
        background: isActive
          ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.2) 100%)'
          : 'rgba(255, 255, 255, 0.04)',
        boxShadow: isActive
          ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(59, 130, 246, 0.15)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 400, damping: 25 }}
      whileTap={{ scale: 0.92, backgroundColor: isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)' }}
    >
      {/* Shine overlay for active state */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
      )}
      <span className="text-2xl mb-1.5">{icon}</span>
      <span
        className="text-xs font-medium"
        style={{
          color: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.55)',
          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
