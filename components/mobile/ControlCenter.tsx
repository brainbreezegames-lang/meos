'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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

  // Swipe down to dismiss
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0], [0, 1]);

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
        y.set(-deltaY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = startY - e.changedTouches[0].clientY;
      if (deltaY > 50) {
        toggleControlCenter();
      }
      y.set(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state.showControlCenter, toggleControlCenter, y]);

  return (
    <AnimatePresence>
      {state.showControlCenter && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0, 0, 0, 0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleControlCenter}
          />

          {/* Control Center Panel */}
          <motion.div
            ref={containerRef}
            className="fixed top-0 right-0 z-[201] w-[85%] max-w-[320px]"
            style={{
              paddingTop: 'env(safe-area-inset-top, 44px)',
              y,
              opacity,
            }}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
            }}
          >
            <div
              className="m-3 rounded-[28px] overflow-hidden"
              style={{
                background: 'rgba(40, 40, 45, 0.95)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Profile Section */}
              {(profileImage || profileName) && (
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  {profileImage && (
                    <img
                      src={profileImage}
                      alt={profileName || ''}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p
                      className="font-semibold text-white"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                    >
                      {profileName}
                    </p>
                    {username && (
                      <p className="text-sm text-white/50">@{username}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="p-3 grid grid-cols-2 gap-3">
                {/* Theme Toggle */}
                <ControlButton
                  icon={theme === 'dark' ? '🌙' : '☀️'}
                  label={theme === 'dark' ? 'Dark' : 'Light'}
                  isActive={theme === 'dark'}
                  onClick={onThemeToggle}
                />

                {/* Share */}
                <ControlButton
                  icon="📤"
                  label="Share"
                  onClick={onShare}
                />

                {/* QR Code */}
                <ControlButton
                  icon="📱"
                  label="QR Code"
                  onClick={onQRCode}
                />

                {/* Contact */}
                <ControlButton
                  icon="✉️"
                  label="Contact"
                  onClick={onContact}
                />
              </div>

              {/* Brightness Slider */}
              <div className="px-4 pb-4">
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">☀️</span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={brightness}
                      onChange={(e) => onBrightnessChange?.(parseInt(e.target.value))}
                      className="flex-1 h-8 appearance-none rounded-full"
                      style={{
                        background: `linear-gradient(to right, rgba(255, 255, 255, 0.4) ${brightness}%, rgba(255, 255, 255, 0.1) ${brightness}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Drag indicator */}
              <div className="flex justify-center pb-3">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.3)' }}
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
}

function ControlButton({ icon, label, isActive = false, onClick }: ControlButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-2xl"
      style={{
        background: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
        border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
      }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span
        className="text-xs text-white/70"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
      >
        {label}
      </span>
    </motion.button>
  );
}
