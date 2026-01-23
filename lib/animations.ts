/**
 * UNIFIED ANIMATION SYSTEM - goOS
 * Single source of truth for all animations, transitions, and micro-interactions.
 *
 * Design principles:
 * - Subtle, smooth animations that enhance without distracting
 * - Consistent timing across all interactions
 * - Performance-optimized (GPU-accelerated properties only)
 * - Full reduced-motion accessibility support
 * - No animation should exceed 400ms for interactions
 */

// ============================================================================
// SPRING CONFIGURATIONS
// Use springs for interactive elements (feels more natural than duration-based)
// ============================================================================

export const SPRING = {
  /** Snappy micro-interactions: buttons, toggles, chips (feels ~200ms) */
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },

  /** Standard interactions: hover states, focus, cards (~300ms feel) */
  gentle: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 28,
    mass: 0.8,
  },

  /** Window/modal animations: open, close, drag (~400ms feel) */
  smooth: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 25,
    mass: 0.8,
  },

  /** Bouncy attention-grabbing: notifications, success states (~500ms feel) */
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
    mass: 1.0,
  },

  /** Dock magnification: responsive to mouse movement */
  dock: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  },
} as const;

// ============================================================================
// DURATION CONSTANTS (in seconds for Framer Motion)
// Use for opacity-only or simple transforms where springs are overkill
// ============================================================================

export const DURATION = {
  /** Instant feedback: focus rings, opacity changes */
  instant: 0.1,

  /** Micro-interactions: hover states, small UI changes */
  fast: 0.15,

  /** Standard transitions: state changes, transforms */
  normal: 0.2,

  /** Deliberate transitions: card lifts, layout shifts */
  slow: 0.3,

  /** Stagger delay per item in lists */
  stagger: 0.03,

  /** Tooltip/popover entrance */
  tooltip: 0.15,

  /** Page transitions */
  page: 0.4,
} as const;

// ============================================================================
// EASING CURVES
// Limited set of curves for consistency
// ============================================================================

export const EASE = {
  /** Standard ease-out: most UI interactions */
  out: [0.4, 0, 0.2, 1] as const,

  /** Ease-in-out: bidirectional transitions */
  inOut: [0.4, 0, 0.2, 1] as const,

  /** Slight overshoot for playful feel (use sparingly) */
  bounce: [0.34, 1.56, 0.64, 1] as const,

  /** Sharp deceleration: fast start, smooth stop */
  expo: [0.16, 1, 0.3, 1] as const,

  /** Linear: infinite animations, progress bars */
  linear: [0, 0, 1, 1] as const,
} as const;

// ============================================================================
// ANIMATION VARIANTS (Framer Motion)
// Pre-built variants for common patterns
// ============================================================================

/** Fade in with subtle scale - perfect for windows, modals, cards */
export const fadeInScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

/** Fade in from below - notifications, tooltips, popovers */
export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

/** Fade in from above - dropdown menus */
export const fadeInDown = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

/** Simple fade - background overlays */
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Window open animation - bouncy scale with subtle Y offset */
export const windowOpen = {
  initial: { opacity: 0, scale: 0.92, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

/** Dock item hover - subtle lift */
export const dockHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.1 },
  tap: { scale: 0.95 },
};

/** Desktop icon - click feedback */
export const iconClick = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.96 },
};

// ============================================================================
// REDUCED MOTION VARIANTS
// Use these when prefers-reduced-motion is true
// ============================================================================

export const REDUCED_MOTION = {
  /** Simple instant transition for all reduced-motion cases */
  transition: {
    duration: DURATION.instant,
  },

  /** Opacity-only fade */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
} as const;

// ============================================================================
// TRANSITION PRESETS
// Combine duration + easing for common use cases
// ============================================================================

export const TRANSITION = {
  /** Standard micro-interaction */
  fast: {
    duration: DURATION.fast,
    ease: EASE.out,
  },

  /** Normal UI transition */
  normal: {
    duration: DURATION.normal,
    ease: EASE.out,
  },

  /** Window/modal animations */
  window: SPRING.smooth,

  /** Dock magnification */
  dock: SPRING.dock,

  /** Tooltip/popover */
  tooltip: {
    duration: DURATION.tooltip,
    ease: EASE.out,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get animation props based on reduced motion preference
 */
export function getAnimationProps(
  prefersReducedMotion: boolean | null,
  variants: { initial: object; animate: object; exit?: object },
  transition: object = SPRING.smooth
) {
  if (prefersReducedMotion) {
    return {
      initial: REDUCED_MOTION.fade.initial,
      animate: REDUCED_MOTION.fade.animate,
      exit: REDUCED_MOTION.fade.exit,
      transition: REDUCED_MOTION.transition,
    };
  }
  return {
    ...variants,
    transition,
  };
}

/**
 * Stagger children animations
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
 * Create a stagger item variant
 */
export function staggerItem(prefersReducedMotion?: boolean | null) {
  if (prefersReducedMotion) {
    return REDUCED_MOTION.fade;
  }
  return fadeInUp;
}

// ============================================================================
// CSS TRANSITION HELPERS
// For inline styles and Tailwind classes
// ============================================================================

/** Standard CSS transition string */
export const CSS_TRANSITION = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

  // GPU-optimized (only transform + opacity)
  transform: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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

// ============================================================================
// ANIMATION DELAY UTILITIES
// ============================================================================

/**
 * Calculate stagger delay for list items
 */
export function getStaggerDelay(index: number, baseDelay = DURATION.stagger): number {
  return index * baseDelay;
}

/**
 * Cap stagger delay to prevent long waits
 */
export function getStaggerDelayCapped(
  index: number,
  baseDelay = DURATION.stagger,
  maxDelay = 0.3
): number {
  return Math.min(index * baseDelay, maxDelay);
}
