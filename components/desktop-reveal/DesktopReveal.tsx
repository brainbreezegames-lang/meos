'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, DURATION } from '@/lib/animations';

// ============================================================================
// TYPES
// ============================================================================

interface DesktopRevealProps {
  isActive: boolean;
  onComplete: () => void;
  variant?: 'curve' | 'stairs' | 'perspective';
}

// ============================================================================
// ANIMATION EASING - Snappy, premium cubic beziers
// ============================================================================

// Fast start, smooth landing - feels responsive
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Even snappier - aggressive deceleration
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

// ============================================================================
// CURVE SVG COMPONENT - The main attraction
// ============================================================================

function CurveReveal({ width, height }: { width: number; height: number }) {
  // SVG dimensions with extra space for the curve
  const svgHeight = height + 300;

  // Curve paths - initial has dramatic curve at bottom, target is flat
  const paths = {
    initial: `
      M 0 0
      L ${width} 0
      L ${width} ${height}
      Q ${width / 2} ${height + 300} 0 ${height}
      L 0 0
    `.trim(),
    target: `
      M 0 0
      L ${width} 0
      L ${width} ${height}
      Q ${width / 2} ${height} 0 ${height}
      L 0 0
    `.trim(),
  };

  return (
    <motion.div
      className="fixed inset-0"
      style={{ zIndex: 10002 }}
      initial={{ y: 0 }}
      animate={{ y: '-100%' }}
      transition={{
        duration: 0.55,
        ease: EASE_OUT_EXPO,
        delay: 0.05,
      }}
    >
      <svg
        width={width}
        height={svgHeight}
        viewBox={`0 0 ${width} ${svgHeight}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <motion.path
          fill="var(--color-accent-primary)"
          initial={{ d: paths.initial }}
          animate={{ d: paths.target }}
          transition={{
            duration: 0.5,
            ease: EASE_OUT_QUINT,
            delay: 0.05,
          }}
        />
      </svg>
    </motion.div>
  );
}

// ============================================================================
// STAIRS COMPONENT - Staggered column reveal
// ============================================================================

function StairsReveal({ columns = 5 }: { columns?: number }) {
  return (
    <div
      className="fixed inset-0 flex"
      style={{ zIndex: 10002 }}
    >
      {[...Array(columns)].map((_, i) => (
        <motion.div
          key={i}
          className="flex-1 h-full origin-top"
          style={{
            background: `linear-gradient(180deg, var(--color-accent-primary) 0%, var(--color-accent-primary-hover) 100%)`,
          }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{
            duration: 0.4,
            ease: EASE_OUT_EXPO,
            delay: (columns - 1 - i) * 0.04,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PERSPECTIVE REVEAL - Single slide up
// ============================================================================

function PerspectiveReveal() {
  return (
    <motion.div
      className="fixed inset-0"
      style={{
        zIndex: 10002,
        background: 'linear-gradient(180deg, var(--color-accent-primary) 0%, var(--color-accent-primary-hover) 100%)',
        transformOrigin: 'top center',
      }}
      initial={{ y: 0 }}
      animate={{ y: '-100%' }}
      transition={{
        duration: 0.45,
        ease: EASE_OUT_EXPO,
        delay: 0.02,
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Get window dimensions on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  // Start animation and complete
  useEffect(() => {
    if (isActive && dimensions.width > 0) {
      setIsAnimating(true);

      // Complete after animation finishes (faster now)
      const timer = setTimeout(() => {
        onComplete();
      }, prefersReducedMotion ? 150 : 650);

      return () => clearTimeout(timer);
    }
  }, [isActive, dimensions.width, onComplete, prefersReducedMotion]);

  // Don't render until we have dimensions
  if (!isActive || dimensions.width === 0) {
    return null;
  }

  // Reduced motion: simple quick fade
  if (prefersReducedMotion) {
    return (
      <motion.div
        className="fixed inset-0"
        style={{
          zIndex: 10002,
          background: 'var(--color-accent-primary)',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    );
  }

  return (
    <>
      {/* Render the selected transition variant */}
      {variant === 'curve' && (
        <CurveReveal width={dimensions.width} height={dimensions.height} />
      )}
      {variant === 'stairs' && <StairsReveal />}
      {variant === 'perspective' && <PerspectiveReveal />}
    </>
  );
}

export default DesktopReveal;
