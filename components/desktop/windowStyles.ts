/**
 * UNIFIED WINDOW STYLES - Single source of truth
 * ALL windows in the app MUST use these exact values
 * NO hardcoded values allowed in individual window components
 *
 * Design: Calm-tech 2025 - soft, premium, minimal
 */

import React from 'react';

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

  // Shadows - ultra-soft, cloud-like diffuse
  shadow: '0 4px 16px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.06), 0 24px 64px rgba(23, 20, 18, 0.04)',
  shadowMaximized: 'none',

  // Opacity
  opacityActive: 1,
  opacityInactive: 0.96,
} as const;

// ============================================================================
// TITLE BAR STYLES
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
// WINDOW CONTROLS - Calm-tech minimal icon buttons
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

// Legacy alias for backwards compatibility
export const TRAFFIC = CONTROLS;

// ============================================================================
// ANIMATION - Spring bounce
// ============================================================================
export const ANIMATION = {
  initial: { opacity: 0, scale: 0.85, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
  transition: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 25,
    mass: 0.8,
  },
  // Reduced motion
  reducedInitial: { opacity: 0 },
  reducedAnimate: { opacity: 1 },
  reducedExit: { opacity: 0 },
  reducedTransition: { duration: 0.15 },
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
export function getTitleBarStyle(isMaximized: boolean): React.CSSProperties {
  return {
    height: TITLE_BAR.height,
    background: TITLE_BAR.background,
    borderBottom: TITLE_BAR.borderBottom,
    cursor: isMaximized ? 'default' : 'grab',
  };
}

/**
 * Get traffic light button style
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
