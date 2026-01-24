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
// ANIMATION EASING - Premium cubic bezier
// ============================================================================

const CURVE_EASE = [0.76, 0, 0.24, 1] as const;

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
        duration: 0.75,
        ease: CURVE_EASE,
        delay: 0.15,
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
          fill="#ff7722"
          initial={{ d: paths.initial }}
          animate={{ d: paths.target }}
          transition={{
            duration: 0.75,
            ease: CURVE_EASE,
            delay: 0.15,
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
            background: `linear-gradient(180deg, #ff7722 0%, #e56a1a 100%)`,
          }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{
            duration: 0.5,
            ease: CURVE_EASE,
            delay: (columns - 1 - i) * 0.08,
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
        background: 'linear-gradient(180deg, #ff7722 0%, #e56a1a 100%)',
        transformOrigin: 'top center',
      }}
      initial={{ y: 0 }}
      animate={{ y: '-100%' }}
      transition={{
        duration: 0.65,
        ease: CURVE_EASE,
        delay: 0.1,
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

      // Complete after animation finishes
      const timer = setTimeout(() => {
        onComplete();
      }, prefersReducedMotion ? 200 : 1000);

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
          background: '#ff7722',
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
