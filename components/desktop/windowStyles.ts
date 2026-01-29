/**
 * UNIFIED WINDOW STYLES - Single source of truth
 * ALL windows in the app MUST use these exact values
 * NO hardcoded values allowed in individual window components
 *
 * Design: Calm-tech 2025 - soft, premium, warm cream aesthetic
 */

import React from 'react';
import { SPRING, DURATION, REDUCED_MOTION, windowOpen } from '@/lib/animations';

// Re-export animation system for easy access
export { SPRING, DURATION, REDUCED_MOTION } from '@/lib/animations';

// ============================================================================
// WINDOW CONTAINER STYLES
// ============================================================================
export const WINDOW = {
  // Border - subtle, barely visible
  border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.06))',
  borderMaximized: 'none',

  // Border radius - large for soft feel
  borderRadius: 'var(--radius-lg, 20px)',
  borderRadiusMaximized: '0',

  // Background - warm cream
  background: 'var(--color-bg-base, #faf8f2)',

  // Shadows - ultra-soft, cloud-like diffuse (using CSS variable)
  shadow: 'var(--shadow-window)',
  shadowMaximized: 'none',

  // Opacity
  opacityActive: 1,
  opacityInactive: 0.96,
} as const;

// ============================================================================
// LIGHT TITLE BAR - For info windows, modals, widgets
// ============================================================================
export const TITLE_BAR = {
  height: 48,
  background: 'var(--color-bg-base, #faf8f2)',
  borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.04))',
  paddingX: 16,

  // Title text
  titleFontSize: 13,
  titleFontWeight: 500,
  titleColor: 'var(--color-text-primary, #171412)',
  titleLetterSpacing: '-0.01em',
  titleOpacityActive: 0.7,
  titleOpacityInactive: 0.5,
} as const;

// ============================================================================
// DARK TITLE BAR - For document/editor windows (CV, notes, case studies)
// ============================================================================
export const TITLE_BAR_DARK = {
  height: 48,
  background: 'var(--color-bg-dark, #2d2926)',
  borderBottom: 'none',
  borderRadius: '20px 20px 0 0',
  paddingX: 16,

  // Title text - white on dark
  titleFontSize: 14,
  titleFontWeight: 500,
  titleColor: '#ffffff',
  titleLetterSpacing: '-0.01em',
  titleOpacityActive: 0.9,
  titleOpacityInactive: 0.6,
} as const;

// ============================================================================
// TRAFFIC LIGHTS - macOS style (for dark title bar windows)
// ============================================================================
export const TRAFFIC = {
  size: 12,
  gap: 8,
  shadow: 'var(--shadow-xs)',

  // Colors - classic macOS (using CSS variables for theme support)
  close: 'var(--traffic-red, #ff5f57)',
  minimize: 'var(--traffic-yellow, #ffbd2e)',
  maximize: 'var(--traffic-green, #28c840)',

  // Icon colors (shown on hover)
  closeIcon: 'rgba(77, 0, 0, 0.8)',
  minimizeIcon: 'rgba(100, 65, 0, 0.8)',
  maximizeIcon: 'rgba(0, 70, 0, 0.8)',
} as const;

// ============================================================================
// MINIMAL CONTROLS - For light title bar windows (info windows, modals)
// ============================================================================
export const CONTROLS = {
  size: 28,
  iconSize: 14,
  gap: 4,
  borderRadius: 8,

  // Colors - subtle, muted
  background: 'transparent',
  backgroundHover: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.04))',
  iconColor: 'var(--color-text-muted, rgba(23, 20, 18, 0.4))',
  iconColorHover: 'var(--color-text-secondary, rgba(23, 20, 18, 0.6))',

  // Close button gets subtle red on hover
  closeHover: 'rgba(239, 68, 68, 0.08)',
  closeIconHover: 'rgb(239, 68, 68)',
} as const;

// ============================================================================
// ANIMATION - Spring bounce (uses unified animation system)
// ============================================================================
export const ANIMATION = {
  // Window open/close variants
  initial: windowOpen.initial,
  animate: windowOpen.animate,
  exit: windowOpen.exit,

  // Spring transition (from unified system)
  transition: SPRING.smooth,

  // Reduced motion (from unified system)
  reducedInitial: REDUCED_MOTION.fade.initial,
  reducedAnimate: REDUCED_MOTION.fade.animate,
  reducedExit: REDUCED_MOTION.fade.exit,
  reducedTransition: REDUCED_MOTION.transition,
} as const;

// ============================================================================
// CONTENT STYLES
// ============================================================================
export const CONTENT = {
  padding: 24,
  gap: 20,
  headerImageSize: 64,
  headerImageRadius: 14,

  // Typography
  titleFontSize: 17,
  titleFontWeight: 600,
  titleColor: 'var(--color-text-primary, #171412)',
  titleLetterSpacing: '-0.02em',

  subtitleFontSize: 13,
  subtitleColor: 'var(--color-text-muted, #8e827c)',

  bodyFontSize: 14,
  bodyColor: 'var(--color-text-primary, #171412)',
  bodyLineHeight: 1.5,

  mutedColor: 'var(--color-text-muted, #8e827c)',
  borderColor: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get window container styles
 */
export function getWindowStyle(isMaximized: boolean, isActive: boolean): React.CSSProperties {
  return {
    borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
    background: WINDOW.background,
    border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
    boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
    opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
  };
}

/**
 * Get title bar styles
 */
export function getTitleBarStyle(isMaximized: boolean, variant: 'light' | 'dark' = 'light'): React.CSSProperties {
  const bar = variant === 'dark' ? TITLE_BAR_DARK : TITLE_BAR;
  return {
    height: bar.height,
    background: bar.background,
    borderBottom: bar.borderBottom,
    cursor: isMaximized ? 'default' : 'grab',
  };
}

/**
 * Get traffic light button style (macOS style)
 */
export function getTrafficStyle(color: string): React.CSSProperties {
  return {
    width: TRAFFIC.size,
    height: TRAFFIC.size,
    borderRadius: '50%',
    background: color,
    boxShadow: TRAFFIC.shadow,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * Get animation props based on reduced motion preference
 */
export function getAnimationProps(prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion) {
    return {
      initial: ANIMATION.reducedInitial,
      animate: ANIMATION.reducedAnimate,
      exit: ANIMATION.reducedExit,
      transition: ANIMATION.reducedTransition,
    };
  }
  return {
    initial: ANIMATION.initial,
    animate: ANIMATION.animate,
    exit: ANIMATION.exit,
    transition: ANIMATION.transition,
  };
}

// Legacy exports for backwards compatibility
export const WINDOW_STYLES = WINDOW;
export const TITLE_BAR_STYLES = TITLE_BAR;
export const TRAFFIC_LIGHT_STYLES = TRAFFIC;
export const getWindowContainerStyle = getWindowStyle;
