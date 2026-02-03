/**
 * Motion Presets - Semantic motion configurations
 *
 * These presets combine the primitives from animations.ts into
 * ready-to-use configurations for common UI patterns.
 *
 * Usage:
 * ```tsx
 * import { MOTION_PRESETS, getStaggerProps } from '@/lib/motion-presets';
 *
 * <motion.div {...MOTION_PRESETS.card}>
 *   <motion.div {...getStaggerProps(0)}>Item 1</motion.div>
 *   <motion.div {...getStaggerProps(1)}>Item 2</motion.div>
 * </motion.div>
 * ```
 */

import {
  SPRING,
  DURATION,
  REDUCED_MOTION,
  fadeInScale,
  fadeInUp,
  fadeInDown,
  fade,
  buttonPress,
  hoverLift,
} from './animations';
import type { Variants, Transition } from 'framer-motion';

// ============================================================================
// MOTION PRESETS
// Ready-to-use motion configurations for common patterns
// ============================================================================

export const MOTION_PRESETS = {
  /**
   * Hero section elements - dramatic entrance with smooth spring
   */
  hero: {
    initial: fadeInUp.initial,
    animate: fadeInUp.animate,
    exit: fadeInUp.exit,
    transition: SPRING.smooth,
  },

  /**
   * Cards entering view - subtle scale + fade
   */
  card: {
    initial: fadeInScale.initial,
    animate: fadeInScale.animate,
    exit: fadeInScale.exit,
    transition: SPRING.gentle,
  },

  /**
   * List items - slide up with quick spring
   */
  listItem: {
    initial: fadeInUp.initial,
    animate: fadeInUp.animate,
    exit: fadeInUp.exit,
    transition: SPRING.snappy,
  },

  /**
   * Dropdown/menu elements - slide down
   */
  dropdown: {
    initial: fadeInDown.initial,
    animate: fadeInDown.animate,
    exit: fadeInDown.exit,
    transition: SPRING.snappy,
  },

  /**
   * Subtle fade for overlays and backgrounds
   */
  overlay: {
    initial: fade.initial,
    animate: fade.animate,
    exit: fade.exit,
    transition: { duration: DURATION.normal },
  },

  /**
   * Interactive button/element feedback
   */
  interactive: {
    whileHover: buttonPress.hover,
    whileTap: buttonPress.tap,
    transition: SPRING.snappy,
  },

  /**
   * Card with lift on hover
   */
  cardInteractive: {
    initial: fadeInScale.initial,
    animate: fadeInScale.animate,
    exit: fadeInScale.exit,
    whileHover: hoverLift.hover,
    whileTap: hoverLift.tap,
    transition: SPRING.gentle,
  },

  /**
   * Page-level transitions
   */
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: DURATION.page, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

// ============================================================================
// STAGGER UTILITIES
// ============================================================================

/**
 * Default stagger delay between items (40ms)
 */
export const STAGGER_DELAY = 0.04;

/**
 * Maximum stagger delay to prevent long waits (capped at 8 items)
 */
export const MAX_STAGGER_DELAY = 0.32;

/**
 * Get capped stagger delay for an item index
 */
export function getStaggerDelay(index: number): number {
  return Math.min(index * STAGGER_DELAY, MAX_STAGGER_DELAY);
}

/**
 * Container variants for stagger animations
 */
export function staggerContainerVariants(staggerDelay = STAGGER_DELAY): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  };
}

/**
 * Item variants for stagger animations
 */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING.snappy,
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: DURATION.fast },
  },
};

/**
 * Get motion props for a staggered item
 * Use when you need individual control over each item's delay
 */
export function getStaggerProps(
  index: number,
  prefersReducedMotion = false
): {
  initial: object;
  animate: object;
  transition: Transition;
} {
  if (prefersReducedMotion) {
    return {
      initial: REDUCED_MOTION.fade.initial,
      animate: REDUCED_MOTION.fade.animate,
      transition: REDUCED_MOTION.transition,
    };
  }

  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      ...SPRING.snappy,
      delay: getStaggerDelay(index),
    },
  };
}

// ============================================================================
// REDUCED MOTION HELPERS
// ============================================================================

/**
 * Get appropriate motion props based on reduced motion preference
 */
export function getMotionProps(
  preset: keyof typeof MOTION_PRESETS,
  prefersReducedMotion = false
) {
  if (prefersReducedMotion) {
    return {
      initial: REDUCED_MOTION.fade.initial,
      animate: REDUCED_MOTION.fade.animate,
      exit: REDUCED_MOTION.fade.exit,
      transition: REDUCED_MOTION.transition,
    };
  }

  return MOTION_PRESETS[preset];
}

/**
 * Get interactive motion props (hover/tap) based on reduced motion preference
 */
export function getInteractiveProps(prefersReducedMotion = false) {
  if (prefersReducedMotion) {
    return {
      whileHover: {},
      whileTap: {},
      transition: REDUCED_MOTION.transition,
    };
  }

  return MOTION_PRESETS.interactive;
}

// ============================================================================
// MOTION INTENT GUIDE
// ============================================================================

/**
 * Motion Intent Reference:
 *
 * | Intent      | Preset           | Use Case                              |
 * |-------------|------------------|---------------------------------------|
 * | Entrance    | hero, card       | Windows, modals, page sections        |
 * | Attention   | SPRING.bouncy    | Notifications, badges, celebrations   |
 * | Feedback    | interactive      | Buttons, toggles, clicks              |
 * | Navigation  | dropdown         | Menus, dropdowns, popovers            |
 * | Ambient     | CSS gradientDrift| Hero backgrounds only                 |
 * | List        | stagger*         | Lists, grids with multiple items      |
 * | Page        | page             | Route transitions                     |
 *
 * Spring personalities:
 * - snappy: Quick micro-interactions, buttons, toggles
 * - gentle: Hover states, focus effects
 * - smooth: Window/modal animations
 * - bouncy: Notifications, celebrations
 * - playful: Easter eggs, special moments
 */
