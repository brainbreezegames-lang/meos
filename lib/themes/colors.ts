/**
 * Shared color constants for window theme functions
 * Use these instead of hardcoding #000000 or #ffffff
 */

// Near-black colors (tinted, not pure black)
export const NEAR_BLACK = {
  /** Default near-black for text */
  default: '#0a0a0a',
  /** Warm near-black */
  warm: '#1C1917',
  /** Cool near-black */
  cool: '#0d0d0f',
  /** Blue-tinted near-black */
  blue: '#0a0a0c',
} as const;

// Near-white colors (tinted, not pure white)
export const NEAR_WHITE = {
  /** Default near-white */
  default: '#fafafa',
  /** Warm near-white */
  warm: '#FAFAF9',
  /** Cool near-white */
  cool: '#F5F5F7',
  /** Blue-tinted near-white */
  blue: '#F8F8FA',
} as const;

// Text colors that adapt to themes
export const TEXT_COLORS = {
  light: {
    primary: NEAR_BLACK.default,
    secondary: '#57534E',
    tertiary: '#A8A29E',
  },
  dark: {
    primary: NEAR_WHITE.default,
    secondary: '#86868B',
    tertiary: '#636366',
  },
} as const;

/**
 * Get text color based on dark mode
 */
export function getTextColor(isDark: boolean, variant: 'primary' | 'secondary' | 'tertiary' = 'primary') {
  return isDark ? TEXT_COLORS.dark[variant] : TEXT_COLORS.light[variant];
}

/**
 * Base colors for window chrome across themes
 */
export const WINDOW_CHROME = {
  light: {
    bg: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(0, 0, 0, 0.05)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    bg: 'rgba(30, 30, 30, 0.95)',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
} as const;
