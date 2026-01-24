'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, DURATION, EASE } from '@/lib/animations';

// ============================================================================
// TYPES
// ============================================================================

interface DesktopRevealProps {
  isActive: boolean;
  onComplete: () => void;
  variant?: 'curve' | 'stairs' | 'perspective';
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const TEXT_VARIANTS = {
  initial: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: 0.4, ease: EASE.in }
  },
};

const STAIR_VARIANTS = {
  initial: { scaleY: 1 },
  animate: (i: number) => ({
    scaleY: 0,
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1],
      delay: i * 0.05,
    }
  }),
};

// ============================================================================
// CURVE SVG COMPONENT
// ============================================================================

interface CurveSVGProps {
  width: number;
  height: number;
}

function CurveSVG({ width, height }: CurveSVGProps) {
  // Create SVG paths for the curve animation
  // Initial path has a dramatic curve, target is flat
  const initialPath = `
    M0 300
    Q${width / 2} 0 ${width} 300
    L${width} ${height + 300}
    Q${width / 2} ${height + 600} 0 ${height + 300}
    L0 300
  `;

  const targetPath = `
    M0 300
    Q${width / 2} 0 ${width} 300
    L${width} ${height}
    Q${width / 2} ${height} 0 ${height}
    L0 300
  `;

  return (
    <motion.svg
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 10002 }}
      initial={{ y: 0 }}
      animate={{ y: '-100vh' }}
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
        delay: 0.3,
      }}
    >
      <motion.path
        fill="var(--color-accent-primary, #ff7722)"
        initial={{ d: initialPath }}
        animate={{ d: targetPath }}
        transition={{
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1],
          delay: 0.3,
        }}
      />
    </motion.svg>
  );
}

// ============================================================================
// STAIRS COMPONENT
// ============================================================================

interface StairsProps {
  columns?: number;
}

function Stairs({ columns = 6 }: StairsProps) {
  return (
    <div
      className="fixed inset-0 flex"
      style={{ zIndex: 10002 }}
    >
      {[...Array(columns)].map((_, i) => (
        <motion.div
          key={i}
          custom={columns - 1 - i}
          variants={STAIR_VARIANTS}
          initial="initial"
          animate="animate"
          className="flex-1 h-full origin-top"
          style={{
            background: `linear-gradient(180deg,
              var(--color-accent-primary, #ff7722) 0%,
              color-mix(in oklch, var(--color-accent-primary, #ff7722), #000 20%) 100%
            )`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PERSPECTIVE REVEAL COMPONENT
// ============================================================================

function PerspectiveReveal() {
  return (
    <motion.div
      className="fixed inset-0"
      style={{
        zIndex: 10002,
        background: 'var(--color-accent-primary, #ff7722)',
        transformOrigin: 'top center',
      }}
      initial={{ y: 0, scaleY: 1 }}
      animate={{ y: '-100%', scaleY: 1.1 }}
      transition={{
        duration: 0.7,
        ease: [0.76, 0, 0.24, 1],
        delay: 0.2,
      }}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DesktopReveal({ isActive, onComplete, variant = 'curve' }: DesktopRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showBranding, setShowBranding] = useState(true);

  // Get window dimensions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Hide branding after animation starts, then complete
  useEffect(() => {
    if (isActive) {
      // Hide the "Welcome" text first
      const brandingTimer = setTimeout(() => {
        setShowBranding(false);
      }, 200);

      // Complete the transition after animation finishes
      const completeTimer = setTimeout(() => {
        onComplete();
      }, prefersReducedMotion ? 300 : 1200);

      return () => {
        clearTimeout(brandingTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isActive, onComplete, prefersReducedMotion]);

  // Reset branding when becoming active again
  useEffect(() => {
    if (isActive) {
      setShowBranding(true);
    }
  }, [isActive]);

  if (prefersReducedMotion) {
    return (
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed inset-0"
            style={{
              zIndex: 10002,
              background: 'var(--color-accent-primary, #ff7722)',
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Background overlay that ensures clean coverage */}
          <motion.div
            className="fixed inset-0"
            style={{
              zIndex: 10001,
              background: 'var(--color-accent-primary, #ff7722)',
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          />

          {/* Branding text that fades out first */}
          <AnimatePresence>
            {showBranding && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center"
                style={{ zIndex: 10003 }}
                variants={TEXT_VARIANTS}
                initial="initial"
                exit="exit"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...SPRING.bouncy, delay: 0.05 }}
                  className="text-center"
                >
                  {/* Duck icon */}
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeInOut',
                    }}
                  >
                    🦆
                  </motion.div>

                  {/* Welcome text */}
                  <motion.h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}
                  >
                    Welcome to goOS
                  </motion.h1>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The actual transition effect */}
          {dimensions.width > 0 && (
            <>
              {variant === 'curve' && (
                <CurveSVG width={dimensions.width} height={dimensions.height} />
              )}
              {variant === 'stairs' && <Stairs />}
              {variant === 'perspective' && <PerspectiveReveal />}
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

export default DesktopReveal;
