/**
 * Presentation Slide Animations
 *
 * Inspired by Remotion's frame-based animation patterns.
 * Uses Framer Motion spring physics for natural, polished motion.
 */

import type { Transition, Variants } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// SPRING CONFIGS - Different physics for different feels
// ═══════════════════════════════════════════════════════════════════════════

export const springs = {
  /** Snappy, responsive - for headings and primary content */
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,

  /** Bouncy entrance - for stats and impactful elements */
  bouncy: { type: 'spring', stiffness: 300, damping: 20 } as Transition,

  /** Smooth and elegant - for body text and secondary content */
  smooth: { type: 'spring', stiffness: 200, damping: 40 } as Transition,

  /** Gentle settle - for subtle elements */
  gentle: { type: 'spring', stiffness: 150, damping: 25 } as Transition,
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS - Reusable motion patterns
// ═══════════════════════════════════════════════════════════════════════════

/** Fade up from below - the workhorse entrance */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/** Subtle fade up - for secondary content */
export const fadeUpSubtle: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

/** Slide in from left - for headings */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

/** Slide in from right - for split layouts */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

/** Scale in with opacity - for images and emphasis */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

/** Scale in with bounce - for stats and big numbers */
export const scaleInBouncy: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

/** Grow from center - for lines and dividers */
export const growFromCenter: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1 },
};

/** Simple fade - for overlays and backgrounds */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGGER CONTAINERS - For orchestrated multi-element animations
// ═══════════════════════════════════════════════════════════════════════════

/** Fast stagger for words in a sentence */
export const staggerWords: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03, // 30ms per word
    },
  },
};

/** Medium stagger for list items */
export const staggerItems: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08, // 80ms per item
      delayChildren: 0.2, // Wait for heading
    },
  },
};

/** Slide-level stagger for main elements */
export const staggerSlide: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15, // 150ms between major elements
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LIST ITEM VARIANTS - For staggered lists
// ═══════════════════════════════════════════════════════════════════════════

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const listBullet: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

// ═══════════════════════════════════════════════════════════════════════════
// WORD ANIMATION - For quote reveals
// ═══════════════════════════════════════════════════════════════════════════

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

// ═══════════════════════════════════════════════════════════════════════════
// TIMING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Create a delayed transition */
export function withDelay(transition: Transition, delayMs: number): Transition {
  return { ...transition, delay: delayMs / 1000 };
}

/** Get transition with reduced motion support */
export function getTransition(
  transition: Transition,
  prefersReducedMotion: boolean | null
): Transition {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return transition;
}

/** Get initial state with reduced motion support */
export function getInitial<T>(
  initial: T,
  prefersReducedMotion: boolean | null
): T | false {
  if (prefersReducedMotion) {
    return false; // Skip initial state entirely
  }
  return initial;
}
