/**
 * Glass morphism effect utilities
 * Use CSS variables for consistent blur levels across the app
 */

export const GLASS_BLUR = {
  light: 'var(--blur-glass-light)',
  medium: 'var(--blur-glass)',
  strong: 'var(--blur-glass-strong)',
} as const;

/**
 * Get glass morphism styles for a component
 */
export function getGlassStyles(level: keyof typeof GLASS_BLUR = 'medium') {
  const blur = GLASS_BLUR[level];
  return {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
  };
}

/**
 * Standard glass panel styles
 */
export const glassPanel = {
  background: 'var(--bg-glass)',
  ...getGlassStyles('medium'),
  border: 'var(--border-width) solid var(--border-glass-outer)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
};

/**
 * Elevated glass panel (more opaque)
 */
export const glassPanelElevated = {
  background: 'var(--bg-glass-elevated)',
  ...getGlassStyles('medium'),
  border: 'var(--border-width) solid var(--border-glass-outer)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-window)',
};
