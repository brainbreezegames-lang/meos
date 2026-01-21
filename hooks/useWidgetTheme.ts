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

// ONE unified theme using CSS variables - EXACT variable names from design-system.css
const unifiedTheme: WidgetTheme = {
  colors: {
    paper: 'var(--color-bg-base)',
    background: 'var(--color-bg-base)',
    blur: 'none',
    border: 'var(--color-border-default)',
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
      accent: 'var(--color-accent-primary)',
    },
    success: 'var(--color-success)',
    traffic: {
      close: 'var(--color-traffic-close)',
      minimize: 'var(--color-traffic-minimize)',
      maximize: 'var(--color-traffic-maximize)',
      border: 'transparent',
    },
  },
  status: {
    available: {
      color: 'var(--color-success)',
      bgColor: 'var(--color-bg-subtle)',
      borderColor: 'var(--color-success)',
      gradient: 'transparent',
      glow: 'none',
    },
    looking: {
      color: 'var(--color-accent-primary)',
      bgColor: 'var(--color-bg-subtle)',
      borderColor: 'var(--color-accent-primary)',
      gradient: 'transparent',
      glow: 'none',
    },
    taking: {
      color: 'var(--color-warning)',
      bgColor: 'var(--color-bg-subtle)',
      borderColor: 'var(--color-warning)',
      gradient: 'transparent',
      glow: 'none',
    },
    open: {
      color: 'var(--color-error)',
      bgColor: 'var(--color-bg-subtle)',
      borderColor: 'var(--color-error)',
      gradient: 'transparent',
      glow: 'none',
    },
    consulting: {
      color: 'var(--color-text-muted)',
      bgColor: 'var(--color-bg-subtle)',
      borderColor: 'var(--color-text-muted)',
      gradient: 'transparent',
      glow: 'none',
    },
  },
  shadows: {
    solid: 'var(--shadow-sm)',
    hover: 'var(--shadow-md)',
  },
  radii: {
    card: 'var(--radius-lg)',
    button: 'var(--radius-md)',
    pill: 'var(--radius-full)',
  },
  fonts: {
    heading: 'var(--font-family)',
    mono: 'ui-monospace, "SF Mono", monospace',
  },
};

export const useWidgetTheme = (): WidgetTheme => {
  // Always return the unified theme - no conditional logic
  return unifiedTheme;
};
