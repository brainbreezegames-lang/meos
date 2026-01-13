/**
 * Shared spring animation configurations for Framer Motion
 * Use these instead of defining spring configs inline
 */

export const SPRING_CONFIGS = {
  /** Gentle spring - for subtle UI feedback */
  gentle: { type: 'spring' as const, stiffness: 300, damping: 35 },

  /** Normal spring - default for most animations */
  normal: { type: 'spring' as const, stiffness: 400, damping: 30 },

  /** Snappy spring - for quick, responsive interactions */
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },

  /** Smooth spring - for elegant, polished animations */
  smooth: { type: 'spring' as const, stiffness: 400, damping: 25 },

  /** Bouncy spring - use sparingly, for playful moments */
  bouncy: { type: 'spring' as const, stiffness: 500, damping: 25 },
} as const;

/**
 * Duration-based transitions for non-spring animations
 */
export const DURATION_CONFIGS = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
} as const;

/**
 * Easing curves - prefer expo-out for natural deceleration
 */
export const EASING = {
  /** Expo out - natural deceleration, feels responsive */
  expoOut: [0.16, 1, 0.3, 1] as const,

  /** Quart out - slightly less dramatic than expo */
  quartOut: [0.25, 1, 0.5, 1] as const,

  /** Standard ease - for subtle transitions */
  ease: [0.32, 0.72, 0, 1] as const,

  /** Ease in - for exit animations */
  easeIn: [0.4, 0, 1, 1] as const,
} as const;

/**
 * Get reduced motion safe spring config
 */
export function getReducedMotionSpring(prefersReducedMotion: boolean | null) {
  return prefersReducedMotion
    ? { duration: 0.15 }
    : SPRING_CONFIGS.normal;
}
