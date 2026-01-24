/**
 * UNIFIED ANIMATION SYSTEM - goOS
 * Single source of truth for all animations, transitions, and micro-interactions.
 *
 * Design principles:
 * - Playful, personality-driven animations (this is a fun goose OS!)
 * - Consistent timing across all interactions
 * - Performance-optimized (GPU-accelerated properties only)
 * - Full reduced-motion accessibility support
 * - Springs feel alive, durations feel mechanical
 */

import type { Transition, Variants, MotionProps } from 'framer-motion';

// ============================================================================
// SPRING CONFIGURATIONS - The heartbeat of goOS
// Springs give that "alive" feel - use for all interactive elements
// ============================================================================

export const SPRING = {
  /** Quick micro-interactions: buttons, toggles, clicks (~150ms feel) */
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },

  /** Standard interactions: hover states, focus, small UI changes (~250ms feel) */
  gentle: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 28,
    mass: 0.8,
  },

  /** Window/modal animations: open, close, maximize (~350ms feel) */
  smooth: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 28,
    mass: 0.8,
  },

  /** Bouncy attention-grabbing: notifications, celebrations (~400ms feel) */
  bouncy: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 18,
    mass: 0.8,
  },

  /** Extra playful: easter eggs, special moments (~500ms with overshoot) */
  playful: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 1.0,
  },

  /** Dock magnification: responsive to mouse movement */
  dock: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  },

  /** Subtle: background elements, slow movements */
  slow: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 30,
    mass: 1.2,
  },
} as const;

// ============================================================================
// DURATION CONSTANTS (in seconds for Framer Motion)
// Use for opacity-only or when you need precise timing control
// ============================================================================

export const DURATION = {
  /** Instant feedback: focus rings, state indicators */
  instant: 0.1,

  /** Micro-interactions: hover states, small UI changes */
  fast: 0.15,

  /** Standard transitions: state changes, transforms */
  normal: 0.2,

  /** Deliberate transitions: card lifts, layout shifts */
  slow: 0.3,

  /** Entrance animations: windows, modals, overlays */
  entrance: 0.4,

  /** Boot/loading sequences */
  boot: 0.6,

  /** Stagger delay per item in lists */
  stagger: 0.04,

  /** Tooltip/popover entrance */
  tooltip: 0.15,

  /** Page transitions */
  page: 0.4,
} as const;

// ============================================================================
// EASING CURVES
// goOS uses expo easing for that premium, Apple-like feel
// ============================================================================

export const EASE = {
  /** Standard ease-out: most UI interactions (smooth stop) */
  out: [0.16, 1, 0.3, 1] as const,

  /** Ease-in: exits, things going away */
  in: [0.7, 0, 0.84, 0] as const,

  /** Ease-in-out: bidirectional transitions */
  inOut: [0.65, 0, 0.35, 1] as const,

  /** Slight overshoot for playful feel */
  bounce: [0.34, 1.56, 0.64, 1] as const,

  /** Sharp deceleration: fast start, smooth stop (Apple-like) */
  expo: [0.16, 1, 0.3, 1] as const,

  /** Linear: infinite animations, progress bars */
  linear: [0, 0, 1, 1] as const,
} as const;

// ============================================================================
// ANIMATION VARIANTS (Framer Motion)
// Pre-built variants for common patterns - USE THESE!
// ============================================================================

/** Fade in with subtle scale - windows, modals, cards */
export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

/** Fade in from below - notifications, tooltips, popovers */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

/** Fade in from above - dropdown menus, context menus */
export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

/** Simple fade - background overlays, subtle state changes */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Window open - the signature goOS window animation */
export const windowOpen: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
};

/** Boot screen - the goOS startup reveal */
export const bootReveal: Variants = {
  initial: { opacity: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

/** Context menu - snappy appearance */
export const contextMenu: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -2 },
};

/** Toast notification - slide up with bounce */
export const toast: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
};

/** Dock entrance - slide up from below */
export const dockEntrance: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
};

/** Menu bar entrance - slide down */
export const menuBarEntrance: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ============================================================================
// HOVER/TAP STATES
// Use with whileHover and whileTap
// ============================================================================

/** Standard button/card hover - subtle lift */
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.02 },
  tap: { y: 0, scale: 0.98 },
};

/** Dock item hover - pronounced lift and scale */
export const dockHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -8, scale: 1.15 },
  tap: { y: -4, scale: 1.05 },
};

/** Icon click - scale feedback */
export const iconClick = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.92 },
};

/** File icon interaction - desktop icons */
export const fileIconClick = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.95 },
};

/** Button press - satisfying click */
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.96 },
};

/** Traffic light button - subtle */
export const trafficLight = {
  rest: { scale: 1, opacity: 1 },
  hover: { scale: 1.1, opacity: 1 },
  tap: { scale: 0.9, opacity: 0.9 },
};

// ============================================================================
// READY-TO-USE MOTION PROPS
// Copy-paste these directly into motion components
// ============================================================================

/** Window animation props */
export const MOTION = {
  /** Window open/close */
  window: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: windowOpen,
    transition: SPRING.smooth,
  } as MotionProps,

  /** Context menu appearance */
  contextMenu: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: contextMenu,
    transition: { ...SPRING.snappy, duration: 0.15 },
  } as MotionProps,

  /** Toast notification */
  toast: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: toast,
    transition: SPRING.bouncy,
  } as MotionProps,

  /** Fade overlay */
  overlay: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: fade,
    transition: { duration: DURATION.normal },
  } as MotionProps,

  /** Dock entrance */
  dock: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: dockEntrance,
    transition: SPRING.smooth,
  } as MotionProps,

  /** Menu bar */
  menuBar: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: menuBarEntrance,
    transition: SPRING.smooth,
  } as MotionProps,

  /** Boot screen exit */
  boot: {
    initial: 'initial',
    exit: 'exit',
    variants: bootReveal,
    transition: { duration: DURATION.boot, ease: EASE.out },
  } as MotionProps,
};

// ============================================================================
// REDUCED MOTION SUPPORT
// ============================================================================

export const REDUCED_MOTION = {
  /** Simple instant transition */
  transition: {
    duration: DURATION.instant,
  } as Transition,

  /** Opacity-only fade */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,
} as const;

// ============================================================================
// TRANSITION PRESETS
// Combine duration + easing for common use cases
// ============================================================================

export const TRANSITION = {
  /** Quick micro-interaction */
  fast: {
    duration: DURATION.fast,
    ease: EASE.out,
  } as Transition,

  /** Normal UI transition */
  normal: {
    duration: DURATION.normal,
    ease: EASE.out,
  } as Transition,

  /** Slow, deliberate */
  slow: {
    duration: DURATION.slow,
    ease: EASE.out,
  } as Transition,

  /** Window/modal animations */
  window: SPRING.smooth as Transition,

  /** Dock magnification */
  dock: SPRING.dock as Transition,

  /** Tooltip/popover */
  tooltip: {
    duration: DURATION.tooltip,
    ease: EASE.out,
  } as Transition,

  /** Bouncy, playful */
  bouncy: SPRING.bouncy as Transition,

  /** Boot sequence */
  boot: {
    duration: DURATION.boot,
    ease: EASE.out,
  } as Transition,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get animation props respecting reduced motion preference
 */
export function getAnimationProps(
  prefersReducedMotion: boolean | null,
  variants: Variants,
  transition: Transition = SPRING.smooth
): MotionProps {
  if (prefersReducedMotion) {
    return {
      initial: REDUCED_MOTION.fade.initial,
      animate: REDUCED_MOTION.fade.animate,
      exit: REDUCED_MOTION.fade.exit,
      transition: REDUCED_MOTION.transition,
    };
  }
  return {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants,
    transition,
  };
}

/**
 * Get reduced-motion-aware transition
 */
export function getTransition(
  prefersReducedMotion: boolean | null,
  transition: Transition = SPRING.smooth
): Transition {
  if (prefersReducedMotion) {
    return REDUCED_MOTION.transition;
  }
  return transition;
}

/**
 * Stagger container for lists
 */
export function staggerContainer(staggerDelay = DURATION.stagger) {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
}

/**
 * Stagger item variant
 */
export function staggerItem(prefersReducedMotion?: boolean | null): Variants {
  if (prefersReducedMotion) {
    return REDUCED_MOTION.fade;
  }
  return fadeInUp;
}

/**
 * Calculate stagger delay for list items
 */
export function getStaggerDelay(index: number, baseDelay = DURATION.stagger): number {
  return index * baseDelay;
}

/**
 * Capped stagger delay (prevents long waits for large lists)
 */
export function getStaggerDelayCapped(
  index: number,
  baseDelay = DURATION.stagger,
  maxDelay = 0.3
): number {
  return Math.min(index * baseDelay, maxDelay);
}

// ============================================================================
// CSS TRANSITION HELPERS
// For inline styles when not using Framer Motion
// ============================================================================

export const CSS_TRANSITION = {
  fast: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
  normal: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  slow: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',

  // GPU-optimized (only transform + opacity)
  transform: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)',

  // Hover states
  hover: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// ============================================================================
// WILL-CHANGE HELPERS
// Apply to frequently animated elements for GPU optimization
// ============================================================================

export const WILL_CHANGE = {
  transform: { willChange: 'transform' } as const,
  opacity: { willChange: 'opacity' } as const,
  transformOpacity: { willChange: 'transform, opacity' } as const,
} as const;
