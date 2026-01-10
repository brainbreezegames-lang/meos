'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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

  // Smooth spring-based gesture
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 400, damping: 40, mass: 0.8 });

  // Transforms for parallax depth effect
  const backgroundY = useTransform(springY, [-200, 0], [20, 0]);
  const contentScale = useTransform(springY, [-200, 0], [0.92, 1]);
  const contentOpacity = useTransform(springY, [-200, -50, 0], [0, 0.5, 1]);
  const glowOpacity = useTransform(springY, [-200, 0], [0.8, 0]);
  const timeScale = useTransform(springY, [-100, 0], [1.05, 1]);

  // Ambient animation for glow
  const [glowPhase, setGlowPhase] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowPhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Update time every second for smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
      initial={{ opacity: 1 }}
      animate={{ opacity: isUnlocking ? 0 : 1, scale: isUnlocking ? 1.1 : 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: backgroundY,
          backgroundImage: backgroundUrl
            ? `url(${backgroundUrl})`
            : 'linear-gradient(145deg, #0a0a1a 0%, #1a1a3a 40%, #0d1b2a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)
          `,
        }}
      />

      {/* Frosted glass layer */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(100px) saturate(180%)',
          WebkitBackdropFilter: 'blur(100px) saturate(180%)',
        }}
      />

      {/* Unlock glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: glowOpacity,
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)',
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
        <div className="pt-8 pb-6 text-center">
          <motion.div
            style={{ scale: timeScale }}
            className="relative"
          >
            {/* Time glow */}
            <div
              className="absolute inset-0 blur-3xl"
              style={{
                background: `hsl(${glowPhase}, 60%, 50%)`,
                opacity: 0.08,
                transform: 'scale(1.5)',
              }}
            />
            <h1
              className="relative text-8xl font-extralight tracking-tight"
              style={{
                color: 'white',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                fontFeatureSettings: '"tnum"',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              {formatTime(currentTime)}
            </h1>
          </motion.div>
          <p
            className="text-xl font-light mt-2"
            style={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
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
              {/* Animated ring */}
              <motion.div
                className="absolute -inset-1 rounded-full"
                style={{
                  background: `conic-gradient(from ${glowPhase}deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(255,255,255,0.4))`,
                  padding: '2px',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                  boxShadow: `
                    0 20px 40px rgba(0, 0, 0, 0.4),
                    inset 0 1px 1px rgba(255, 255, 255, 0.1),
                    inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-white/60">
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Name & Title */}
            <h2
              className="mt-5 text-2xl font-semibold"
              style={{
                color: 'white',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
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
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <p
                className="text-center text-sm mb-4"
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Choose your experience
              </p>
              {personas.map((persona, index) => (
                <motion.button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className="w-full py-4 px-6 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                    whileHover={{ opacity: 1, x: ['0%', '100%'] }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: persona.color || 'rgba(255, 255, 255, 0.1)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                      >
                        <span className="text-lg">
                          {persona.id === 'recruiter' ? '💼' : '✨'}
                        </span>
                      </div>
                      <div className="text-left">
                        <span
                          className="text-white font-medium block"
                          style={{ fontFamily: '"SF Pro Text", -apple-system, system-ui, sans-serif' }}
                        >
                          {persona.name}
                        </span>
                        {persona.title && (
                          <span
                            className="text-white/50 text-sm"
                            style={{ fontFamily: '"SF Pro Text", -apple-system, system-ui, sans-serif' }}
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
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="2"
                      strokeLinecap="round"
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
          transition={{ delay: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
          <p
            className="mt-2 text-sm"
            style={{
              color: 'rgba(255, 255, 255, 0.35)',
              fontFamily: '"SF Pro Text", -apple-system, system-ui, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            Swipe up to enter
          </p>
        </motion.div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <motion.div
            className="w-36 h-[5px] rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              boxShadow: '0 0 10px rgba(255,255,255,0.1)',
            }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
          />
        </div>

        {/* Safe area bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
      </motion.div>
    </motion.div>
  );
}
