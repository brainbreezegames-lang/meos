/**
 * Presentation Slide Animations
 *
 * Cinematic, smooth animations inspired by Keynote and modern presentation tools.
 * Uses proper easing curves for professional motion design.
 */

import type { Transition, Variants } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// EASING CURVES - Smooth, cinematic motion
// ═══════════════════════════════════════════════════════════════════════════

// Dramatic ease-out for entrances (fast start, gentle settle)
const easeOutExpo = [0.16, 1, 0.3, 1];
const easeOutQuart = [0.25, 1, 0.5, 1];
const easeOutBack = [0.34, 1.56, 0.64, 1]; // Slight overshoot

// Smooth ease-in-out for emphasis
const easeInOutCubic = [0.65, 0, 0.35, 1];

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITION PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const transitions = {
  // Hero entrance - dramatic, attention-grabbing
  hero: {
    duration: 0.9,
    ease: easeOutExpo,
  } as Transition,

  // Primary content - smooth and confident
  primary: {
    duration: 0.7,
    ease: easeOutQuart,
  } as Transition,

  // Secondary content - gentle follow-up
  secondary: {
    duration: 0.6,
    ease: easeOutQuart,
  } as Transition,

  // Bouncy - playful with overshoot
  bouncy: {
    duration: 0.8,
    ease: easeOutBack,
  } as Transition,

  // Quick accent - for small elements
  accent: {
    duration: 0.5,
    ease: easeOutExpo,
  } as Transition,

  // Smooth reveal - for text
  reveal: {
    duration: 0.4,
    ease: easeOutQuart,
  } as Transition,
};

// ═══════════════════════════════════════════════════════════════════════════
// TITLE SLIDE - Dramatic zoom + fade
// ═══════════════════════════════════════════════════════════════════════════

export const titleVariants = {
  heading: {
    hidden: { opacity: 0, scale: 0.8, y: 60 },
    visible: { opacity: 1, scale: 1, y: 0 },
  } as Variants,
  subtitle: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
  meta: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION SLIDE - Line wipe + text rise
// ═══════════════════════════════════════════════════════════════════════════

export const sectionVariants = {
  line: {
    hidden: { scaleX: 0, opacity: 0 },
    visible: { scaleX: 1, opacity: 1 },
  } as Variants,
  heading: {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT SLIDE - Slide from left with parallax
// ═══════════════════════════════════════════════════════════════════════════

export const contentVariants = {
  heading: {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 },
  } as Variants,
  body: {
    hidden: { opacity: 0, x: -40, y: 20 },
    visible: { opacity: 1, x: 0, y: 0 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE SLIDE - Ken Burns zoom + fade
// ═══════════════════════════════════════════════════════════════════════════

export const imageVariants = {
  container: {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { opacity: 1, scale: 1 },
  } as Variants,
  caption: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE-TEXT SLIDE - Split reveal
// ═══════════════════════════════════════════════════════════════════════════

export const imageTextVariants = {
  image: {
    hidden: { opacity: 0, x: -100, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1 },
  } as Variants,
  heading: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  } as Variants,
  body: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE SLIDE - Dramatic reveal
// ═══════════════════════════════════════════════════════════════════════════

export const quoteVariants = {
  mark: {
    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  } as Variants,
  text: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
  attribution: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
};

// Word-by-word stagger container
export const wordStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.3,
    },
  },
};

export const wordVariant: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LIST SLIDE - Staggered cascade
// ═══════════════════════════════════════════════════════════════════════════

export const listVariants = {
  heading: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  } as Variants,
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  } as Variants,
  item: {
    hidden: { opacity: 0, x: -50, y: 10 },
    visible: { opacity: 1, x: 0, y: 0 },
  } as Variants,
  bullet: {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// STAT SLIDE - Impact entrance
// ═══════════════════════════════════════════════════════════════════════════

export const statVariants = {
  number: {
    hidden: { opacity: 0, scale: 0.5, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0 },
  } as Variants,
  label: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// END SLIDE - Satisfying close
// ═══════════════════════════════════════════════════════════════════════════

export const endVariants = {
  heading: {
    hidden: { opacity: 0, scale: 0.7, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0 },
  } as Variants,
  url: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as Variants,
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Add delay to a transition */
export function withDelay(transition: Transition, delaySeconds: number): Transition {
  return { ...transition, delay: delaySeconds };
}

/** Get appropriate transition for reduced motion */
export function getMotionProps(
  variants: Variants,
  transition: Transition,
  shouldAnimate: boolean
) {
  if (!shouldAnimate) {
    return {
      initial: false,
      animate: 'visible',
      transition: { duration: 0 },
    };
  }
  return {
    initial: 'hidden',
    animate: 'visible',
    variants,
    transition,
  };
}
