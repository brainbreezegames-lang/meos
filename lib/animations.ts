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
  /** Quick micro-interactions: buttons, toggles, clicks - SNAPPY with slight bounce */
  snappy: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 20,  // Lower = more bounce
    mass: 0.4,
  },

  /** Standard interactions: hover states, focus - visible but controlled */
  gentle: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 22,  // Lower for more life
    mass: 0.6,
  },

  /** Window/modal animations: open, close - DRAMATIC entrance with overshoot */
  smooth: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 18,  // Much lower = visible overshoot!
    mass: 0.8,
  },

  /** Bouncy attention-grabbing: notifications, celebrations - VERY bouncy! */
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 12,  // Low damping = lots of bounce
    mass: 0.6,
  },

  /** Extra playful: easter eggs, special moments - MAXIMUM fun */
  playful: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 10,  // Very low = wobbly fun!
    mass: 0.8,
  },

  /** THE GOOSE SPRING: absurd, fun, unforgettable - for special goose moments */
  goose: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 8,   // Almost no damping = HONK HONK bounce
    mass: 0.5,
  },

  /** Dock magnification: responsive but bouncy */
  dock: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 15,  // More bounce on dock
    mass: 0.4,
  },

  /** Subtle: background elements, slow dreamy movements */
  slow: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 1.0,
  },

  /** Wobbly: for shake effects, attention-grabbing */
  wobbly: {
    type: 'spring' as const,
    stiffness: 600,
    damping: 5,   // Almost no damping = keeps wobbling
    mass: 0.3,
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

/** Fade in with VISIBLE scale - windows, modals, cards */
export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.85 },  // More dramatic scale
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

/** Fade in from below - notifications, tooltips, popovers */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },  // Larger movement
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 15 },
};

/** Fade in from above - dropdown menus, context menus */
export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -16 },  // Larger movement
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Simple fade - background overlays, subtle state changes */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Window open - the SIGNATURE goOS window animation - DRAMATIC! */
export const windowOpen: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 40 },  // Start smaller and lower
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.85, y: 20 },
};

/** Window open with wobble - extra playful version */
export const windowOpenPlayful: Variants = {
  initial: { opacity: 0, scale: 0.7, y: 50, rotate: -3 },
  animate: { opacity: 1, scale: 1, y: 0, rotate: 0 },
  exit: { opacity: 0, scale: 0.8, y: 30, rotate: 2 },
};

/** Boot screen - the goOS startup reveal */
export const bootReveal: Variants = {
  initial: { opacity: 1 },
  exit: { opacity: 0, scale: 1.1 },  // More dramatic zoom out
};

/** Context menu - snappy pop-in */
export const contextMenu: Variants = {
  initial: { opacity: 0, scale: 0.85, y: -10 },  // More dramatic
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -5 },
};

/** Toast notification - slide up with BOUNCE */
export const toast: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.8 },  // Much more dramatic
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 25, scale: 0.9 },
};

/** Dock entrance - DRAMATIC slide up from below */
export const dockEntrance: Variants = {
  initial: { opacity: 0, y: 100 },  // Start way below
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 },
};

/** Menu bar entrance - slide down with presence */
export const menuBarEntrance: Variants = {
  initial: { opacity: 0, y: -50 },  // Start way above
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

/** File icon pop - for desktop icons appearing */
export const fileIconPop: Variants = {
  initial: { opacity: 0, scale: 0.5, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.7, y: 10 },
};

/** Dock item bounce - when clicked */
export const dockItemBounce: Variants = {
  initial: { y: 0 },
  animate: { y: [0, -30, 0, -15, 0, -5, 0] },  // Multiple bounces!
};

/** Goose quack - the signature silly animation */
export const gooseQuack: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.3, 0.9, 1.1, 1],
    rotate: [0, -10, 10, -5, 0],
  },
};

// ============================================================================
// HOVER/TAP STATES
// Use with whileHover and whileTap
// ============================================================================

/** Standard button/card hover - VISIBLE lift */
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.05 },  // More dramatic
  tap: { y: 0, scale: 0.95 },
};

/** Dock item hover - BIG lift and scale */
export const dockHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -16, scale: 1.25 },  // Much bigger!
  tap: { y: -8, scale: 1.1 },
};

/** Icon click - punchy scale feedback */
export const iconClick = {
  rest: { scale: 1 },
  hover: { scale: 1.1 },  // More dramatic
  tap: { scale: 0.85 },   // Squish more
};

/** File icon interaction - desktop icons with character */
export const fileIconClick = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.08, rotate: 2 },  // Slight tilt adds personality
  tap: { scale: 0.9, rotate: -1 },
};

/** Button press - SATISFYING squish */
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.9 },  // More dramatic squish
};

/** Traffic light button - playful */
export const trafficLight = {
  rest: { scale: 1, opacity: 1 },
  hover: { scale: 1.2, opacity: 1 },  // Bigger hover
  tap: { scale: 0.9, opacity: 0.9 },
};

// ============================================================================
// READY-TO-USE MOTION PROPS
// Copy-paste these directly into motion components
// ============================================================================

/** Window animation props */
export const MOTION = {
  /** Window open/close - DRAMATIC entrance */
  window: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: windowOpen,
    transition: SPRING.smooth,  // Uses the bouncy smooth spring
  } as MotionProps,

  /** Window open/close - PLAYFUL version with wobble */
  windowPlayful: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: windowOpenPlayful,
    transition: SPRING.playful,  // Extra wobbly
  } as MotionProps,

  /** Context menu appearance - snappy pop */
  contextMenu: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: contextMenu,
    transition: SPRING.snappy,
  } as MotionProps,

  /** Toast notification - bouncy entrance */
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

  /** Dock entrance - DRAMATIC slide up */
  dock: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: dockEntrance,
    transition: SPRING.bouncy,  // Bouncy dock!
  } as MotionProps,

  /** Menu bar - slides down with presence */
  menuBar: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: menuBarEntrance,
    transition: SPRING.gentle,
  } as MotionProps,

  /** Boot screen exit */
  boot: {
    initial: 'initial',
    exit: 'exit',
    variants: bootReveal,
    transition: { duration: DURATION.boot, ease: EASE.out },
  } as MotionProps,

  /** File icon pop - for desktop icons */
  fileIcon: {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: fileIconPop,
    transition: SPRING.bouncy,
  } as MotionProps,

  /** Goose special - for silly goose moments */
  goose: {
    initial: 'initial',
    animate: 'animate',
    variants: gooseQuack,
    transition: SPRING.goose,
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
