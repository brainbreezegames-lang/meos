
import { useThemeSafe } from '@/contexts/ThemeContext';

export interface WidgetTheme {
    colors: {
        paper: string;
        border: string;
        text: {
            primary: string;
            secondary: string;
            muted: string;
            accent: string;
        };
        success: string;
    };
    shadows: {
        solid: string;
        hover: string;
    };
    radii: {
        card: string;
        button: string;
    };
    fonts: {
        heading: string;
        mono: string;
    };
}

export const useWidgetTheme = (): WidgetTheme => {
    const { theme } = useThemeSafe() || { theme: 'light' };
    const isSketch = theme === 'sketch';
    const isBrandAppart = theme === 'brand-appart';

    // Sketch Theme (Hardcoded Blueprint - Mediterranean Blue)
    const sketchTheme: WidgetTheme = {
        colors: {
            paper: '#FFFFFF',
            border: '#2B4AE2',
            text: {
                primary: '#2B4AE2',
                secondary: '#2B4AE2',
                muted: '#6B7FE8',
                accent: '#2B4AE2',
            },
            success: '#22C55E',
        },
        shadows: {
            solid: '4px 4px 0 #2B4AE2',
            hover: '6px 6px 0 #2B4AE2',
        },
        radii: {
            card: '8px',
            button: '6px',
        },
        fonts: {
            heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            mono: '"SF Mono", "Monaco", "Inconsolata", monospace',
        },
    };

    // Brand Appart Theme (Warm, Bold, Startup)
    const brandAppartTheme: WidgetTheme = {
        colors: {
            paper: '#fbf9ef', // Brand cream
            border: '#171412', // Brand base (dark)
            text: {
                primary: '#171412',
                secondary: '#8e827c', // Brand grey
                muted: '#8e827c',
                accent: '#ff7722', // Brand orange
            },
            success: '#3d2fa9', // Brand purple
        },
        shadows: {
            solid: '4px 4px 0 rgba(23, 20, 18, 0.1)',
            hover: '6px 6px 0 rgba(23, 20, 18, 0.15)',
        },
        radii: {
            card: '12px',
            button: '8px',
        },
        fonts: {
            heading: 'var(--font-headline)', // Outfit
            mono: 'var(--font-mono)', // IBM Plex Mono
        },
    };

    // Default / Standard Theme (uses system CSS vars mostly, but mapped to tokens for widgets)
    const standardTheme: WidgetTheme = {
        colors: {
            paper: 'var(--bg-elevated)',
            border: 'var(--border-medium)',
            text: {
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-tertiary)',
                accent: 'var(--accent-primary)',
            },
            success: 'var(--accent-success)',
        },
        shadows: {
            solid: 'var(--shadow-sm)',
            hover: 'var(--shadow-md)',
        },
        radii: {
            card: 'var(--radius-lg)',
            button: 'var(--radius-md)',
        },
        fonts: {
            heading: 'var(--font-display)',
            mono: 'var(--font-mono)',
        },
    };

    if (isSketch) return sketchTheme;
    if (isBrandAppart) return brandAppartTheme;

    return standardTheme;
};
