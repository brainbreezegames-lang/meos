'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();

  // Smooth spring-based gesture
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 400, damping: 40, mass: 0.8 });

  // Transforms for parallax depth effect (disabled if reduced motion)
  const backgroundY = useTransform(springY, [-200, 0], prefersReducedMotion ? [0, 0] : [20, 0]);
  const contentScale = useTransform(springY, [-200, 0], prefersReducedMotion ? [1, 1] : [0.92, 1]);
  const contentOpacity = useTransform(springY, [-200, -50, 0], [0, 0.5, 1]);
  const glowOpacity = useTransform(springY, [-200, 0], [0.6, 0]);
  const timeScale = useTransform(springY, [-100, 0], prefersReducedMotion ? [1, 1] : [1.05, 1]);

  // Update time every minute (not every second - reduces re-renders)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y < -80 || info.velocity.y < -400) {
      setIsUnlocking(true);
      // Haptic feedback
      if ('vibrate' in navigator) navigator.vibrate(5);
      setTimeout(() => unlock(), 250);
    }
  };

  const handlePersonaSelect = (personaId: string) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    onSelectPersona?.(personaId);
    setIsUnlocking(true);
    setTimeout(() => unlock(), 250);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
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
      className="fixed inset-0 z-50 overflow-hidden select-none"
      role="dialog"
      aria-label={`Lock screen for ${profileName}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: isUnlocking ? 0 : 1, scale: isUnlocking ? 1.1 : 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: backgroundY,
          backgroundImage: backgroundUrl
            ? `url(${backgroundUrl})`
            : 'linear-gradient(145deg, var(--bg-solid) 0%, #1a1a2e 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Subtle gradient overlay - no AI colors */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Frosted glass layer */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(80px) saturate(150%)',
          WebkitBackdropFilter: 'blur(80px) saturate(150%)',
        }}
      />

      {/* Unlock glow effect - subtle white only */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: glowOpacity,
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ y: springY, scale: contentScale, opacity: contentOpacity }}
      >
        {/* Safe area spacer */}
        <div style={{ height: 'max(env(safe-area-inset-top, 44px), 50px)' }} />

        {/* Time & Date */}
        <div className="pt-8 pb-6 text-center" role="timer" aria-live="polite" aria-label={`Current time: ${formatTime(currentTime)}, ${formatDate(currentTime)}`}>
          <motion.div
            style={{ scale: timeScale }}
            className="relative"
          >
            <h1
              className="relative text-8xl font-extralight tracking-tight"
              style={{
                color: 'var(--text-on-dark)',
                fontFamily: 'var(--font-display)',
                fontFeatureSettings: '"tnum"',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
                letterSpacing: '-0.02em',
              }}
            >
              {formatTime(currentTime)}
            </h1>
          </motion.div>
          <p
            className="text-xl font-light mt-2"
            style={{
              color: 'var(--text-on-dark)',
              opacity: 0.9,
              fontFamily: 'var(--font-body)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.01em',
            }}
          >
            {formatDate(currentTime)}
          </p>
        </div>

        {/* Profile Card - Glassmorphism */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Profile Image with ring */}
            <div className="relative">
              {/* Subtle ring - CSS animation only, respects reduced motion */}
              {!prefersReducedMotion && (
                <div
                  className="absolute -inset-1 rounded-full animate-spin-slow"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(255,255,255,0.3))',
                    padding: '2px',
                    animationDuration: '12s',
                  }}
                />
              )}
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${profileName}'s profile photo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-5xl ${profileImage ? 'hidden' : ''}`}
                  style={{ color: 'var(--text-on-dark)', opacity: 0.6 }}
                  aria-hidden="true"
                >
                  {profileName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Name & Title */}
            <h2
              className="mt-5 text-2xl font-semibold"
              style={{
                color: 'var(--text-on-dark)',
                fontFamily: 'var(--font-display)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.4)',
                letterSpacing: '-0.01em',
              }}
            >
              {profileName}
            </h2>
            {profileTitle && (
              <p
                className="mt-1 text-base"
                style={{
                  color: 'var(--text-on-dark)',
                  opacity: 0.7,
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.01em',
                }}
              >
                {profileTitle}
              </p>
            )}
          </motion.div>

          {/* Persona Selection */}
          {personas.length > 0 && (
            <motion.div
              className="mt-10 w-full max-w-xs space-y-3"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: prefersReducedMotion ? 0 : 0.5, ease: [0.32, 0.72, 0, 1] }}
              role="group"
              aria-label="Choose your experience"
            >
              <p
                className="text-center text-sm mb-4"
                style={{
                  color: 'var(--text-on-dark)',
                  opacity: 0.5,
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
                id="persona-label"
              >
                Choose your experience
              </p>
              {personas.map((persona, index) => (
                <motion.button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  aria-label={`Enter as ${persona.name}${persona.title ? `: ${persona.title}` : ''}`}
                  className="w-full py-4 px-6 rounded-2xl relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                  initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.4 + index * 0.1 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: persona.color || 'rgba(255, 255, 255, 0.1)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                        aria-hidden="true"
                      >
                        <span className="text-lg">
                          {persona.id === 'recruiter' ? '💼' : '✨'}
                        </span>
                      </div>
                      <div className="text-left">
                        <span
                          className="font-medium block"
                          style={{ color: 'var(--text-on-dark)', fontFamily: 'var(--font-body)' }}
                        >
                          {persona.name}
                        </span>
                        {persona.title && (
                          <span
                            className="text-sm"
                            style={{ color: 'var(--text-on-dark)', opacity: 0.6, fontFamily: 'var(--font-body)' }}
                          >
                            {persona.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ color: 'var(--text-on-dark)', opacity: 0.4 }}
                      aria-hidden="true"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Swipe indicator */}
        <motion.div
          className="pb-8 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.6 }}
          role="status"
          aria-label="Swipe up to unlock"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ color: 'var(--text-on-dark)', opacity: 0.4 }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
          <p
            className="mt-2 text-sm"
            style={{
              color: 'var(--text-on-dark)',
              opacity: 0.4,
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.02em',
            }}
          >
            Swipe up to enter
          </p>
        </motion.div>

        {/* Home indicator - larger touch target */}
        <div className="flex justify-center pb-2">
          <div
            className="py-3 px-8 cursor-pointer"
            role="button"
            aria-label="Swipe up to unlock"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                unlock();
              }
            }}
          >
            <div
              className="w-36 h-[5px] rounded-full"
              style={{ background: 'var(--text-on-dark)', opacity: 0.25 }}
            />
          </div>
        </div>

        {/* Safe area bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
      </motion.div>
    </motion.div>
  );
}
