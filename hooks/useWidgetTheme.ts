/**
 * Unified Widget Theme - Uses ONLY CSS variables from design-system.css
 * NO theme-specific variations - ONE design system
 */

export interface WidgetTheme {
  colors: {
    paper: string;
    background: string;
    blur: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      accent: string;
    };
    success: string;
    traffic: {
      close: string;
      minimize: string;
      maximize: string;
      border: string;
    };
  };
  status: {
    [key: string]: {
      color: string;
      bgColor: string;
      borderColor?: string;
      gradient: string;
      glow: string;
    };
  };
  shadows: {
    solid: string;
    hover: string;
  };
  radii: {
    card: string;
    button: string;
    pill: string;
  };
  fonts: {
    heading: string;
    mono: string;
  };
}

// ONE unified theme using CSS variables
const unifiedTheme: WidgetTheme = {
  colors: {
    paper: 'var(--color-bg-base, #fbf9ef)',
    background: 'var(--color-bg-base, #fbf9ef)',
    blur: 'none',
    border: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    text: {
      primary: 'var(--color-text-primary, #171412)',
      secondary: 'var(--color-text-secondary, #4a4744)',
      muted: 'var(--color-text-muted, #8e827c)',
      accent: 'var(--color-accent-primary, #ff7722)',
    },
    success: '#10b981',
    traffic: {
      close: '#ff5f57',
      minimize: '#ffbd2e',
      maximize: '#28ca41',
      border: 'transparent',
    },
  },
  status: {
    available: {
      color: '#10b981',
      bgColor: 'var(--color-bg-subtle, #f2f0e7)',
      borderColor: '#10b981',
      gradient: 'transparent',
      glow: 'none',
    },
    looking: {
      color: 'var(--color-accent-primary, #ff7722)',
      bgColor: 'var(--color-bg-subtle, #f2f0e7)',
      borderColor: 'var(--color-accent-primary, #ff7722)',
      gradient: 'transparent',
      glow: 'none',
    },
    taking: {
      color: '#ffc765',
      bgColor: 'var(--color-bg-subtle, #f2f0e7)',
      borderColor: '#ffc765',
      gradient: 'transparent',
      glow: 'none',
    },
    open: {
      color: '#ff3c34',
      bgColor: 'var(--color-bg-subtle, #f2f0e7)',
      borderColor: '#ff3c34',
      gradient: 'transparent',
      glow: 'none',
    },
    consulting: {
      color: 'var(--color-text-muted, #8e827c)',
      bgColor: 'var(--color-bg-subtle, #f2f0e7)',
      borderColor: 'var(--color-text-muted, #8e827c)',
      gradient: 'transparent',
      glow: 'none',
    },
  },
  shadows: {
    solid: 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))',
    hover: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
  },
  radii: {
    card: 'var(--radius-lg, 12px)',
    button: 'var(--radius-md, 8px)',
    pill: 'var(--radius-full, 9999px)',
  },
  fonts: {
    heading: 'var(--font-headline, "Outfit", sans-serif)',
    mono: 'var(--font-mono, "IBM Plex Mono", monospace)',
  },
};

export const useWidgetTheme = (): WidgetTheme => {
  // Always return the unified theme - no conditional logic
  return unifiedTheme;
};
