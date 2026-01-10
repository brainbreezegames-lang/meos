'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useMobileNav } from '@/contexts/MobileNavigationContext';

interface Persona {
  id: string;
  name: string;
  title?: string;
  color?: string;
}

interface LockScreenProps {
  profileImage?: string;
  profileName: string;
  profileTitle?: string;
  backgroundUrl?: string;
  personas?: Persona[];
  onSelectPersona?: (personaId: string) => void;
}

export function LockScreen({
  profileImage,
  profileName,
  profileTitle,
  backgroundUrl,
  personas = [],
  onSelectPersona,
}: LockScreenProps) {
  const { unlock } = useMobileNav();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Swipe up gesture
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-200, 0], [0, 1]);
  const scale = useTransform(y, [-200, 0], [0.8, 1]);
  const unlockHintOpacity = useTransform(y, [-100, -50, 0], [0, 0.5, 1]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y < -100 || info.velocity.y < -500) {
      setIsUnlocking(true);
      setTimeout(() => {
        unlock();
      }, 300);
    }
  };

  const handlePersonaSelect = (personaId: string) => {
    onSelectPersona?.(personaId);
    setIsUnlocking(true);
    setTimeout(() => {
      unlock();
    }, 300);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        background: backgroundUrl
          ? `url(${backgroundUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: isUnlocking ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Blur overlay */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          background: 'rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y, opacity, scale }}
      >
        {/* Safe area spacer */}
        <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

        {/* Time & Date - iOS style */}
        <div className="pt-12 pb-8 text-center">
          <motion.div
            className="text-7xl font-light tracking-tight"
            style={{
              color: 'white',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {formatTime(currentTime)}
          </motion.div>
          <div
            className="text-xl font-medium mt-1"
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Profile Card */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Profile Image */}
            <div
              className="w-28 h-28 rounded-full overflow-hidden mb-4"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-white/70">
                  {profileName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Title */}
            <h1
              className="text-2xl font-semibold text-white mb-1"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}
            >
              {profileName}
            </h1>
            {profileTitle && (
              <p
                className="text-base text-white/70"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}
              >
                {profileTitle}
              </p>
            )}
          </motion.div>

          {/* Persona Selection Buttons */}
          {personas.length > 0 && (
            <motion.div
              className="mt-8 w-full max-w-xs space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p
                className="text-center text-sm text-white/50 mb-4"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                Select a view
              </p>
              {personas.map((persona) => (
                <motion.button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className="w-full py-3 px-6 rounded-2xl flex items-center justify-center gap-3"
                  style={{
                    background: persona.color || 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-white font-medium">{persona.name}</span>
                  {persona.title && (
                    <span className="text-white/60 text-sm">• {persona.title}</span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Swipe to unlock hint */}
        <motion.div
          className="pb-10 text-center"
          style={{ opacity: unlockHintOpacity }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-10 h-1.5 rounded-full mx-auto mb-4"
              style={{ background: 'rgba(255, 255, 255, 0.5)' }}
            />
          </motion.div>
          <p
            className="text-sm text-white/50"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
          >
            Swipe up to enter
          </p>
        </motion.div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <div
            className="w-32 h-1 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          />
        </div>

        {/* Safe area spacer */}
        <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
      </motion.div>
    </motion.div>
  );
}
