/**
 * UNIFIED WINDOW STYLES - Single source of truth
 * ALL windows in the app MUST use these exact values
 * NO hardcoded values allowed in individual window components
 */

import React from 'react';

// ============================================================================
// WINDOW CONTAINER STYLES
// ============================================================================
export const WINDOW = {
  // Border - Softer, calmer aesthetic
  border: '1px solid rgba(26, 24, 22, 0.10)',
  borderMaximized: 'none',

  // Border radius - Softer 14px
  borderRadius: '14px',
  borderRadiusMaximized: '0',

  // Background - Soft warm cream with slight transparency
  background: 'rgba(250, 248, 243, 0.95)',

  // Shadows - Atmospheric with cool depth
  shadow: '0 2px 4px rgba(30, 40, 50, 0.03), 0 16px 40px rgba(30, 50, 70, 0.10), 0 32px 80px rgba(40, 60, 80, 0.06)',
  shadowMaximized: 'none',

  // Opacity
  opacityActive: 1,
  opacityInactive: 0.92,
} as const;

// ============================================================================
// TITLE BAR STYLES
// ============================================================================
export const TITLE_BAR = {
  height: 50,
  background: 'rgba(250, 248, 243, 0.98)',
  borderBottom: '1px solid rgba(26, 24, 22, 0.06)',
  paddingX: 16,

  // Title text
  titleFontSize: 13,
  titleFontWeight: 500,
  titleColor: 'var(--color-text-primary, #1a1816)',
  titleLetterSpacing: '-0.01em',
  titleOpacityActive: 0.9,
  titleOpacityInactive: 0.6,
} as const;

// ============================================================================
// TRAFFIC LIGHTS (Window Controls) - macOS style
// ============================================================================
export const TRAFFIC = {
  size: 12,
  gap: 8,
  shadow: '0 0.5px 2px rgba(0, 0, 0, 0.08), inset 0 0.5px 0 rgba(255, 255, 255, 0.3)',

  // Colors - Slightly muted for calmer feel
  close: 'var(--color-traffic-close, #ff6259)',
  minimize: 'var(--color-traffic-minimize, #ffbe30)',
  maximize: 'var(--color-traffic-maximize, #2bcb43)',

  // Icon colors (shown on hover)
  closeIcon: 'rgba(80, 10, 10, 0.65)',
  minimizeIcon: 'rgba(100, 65, 0, 0.65)',
  maximizeIcon: 'rgba(0, 65, 0, 0.65)',
} as const;

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
  padding: 20,
  gap: 16,
  headerImageSize: 64,
  headerImageRadius: 12,

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
