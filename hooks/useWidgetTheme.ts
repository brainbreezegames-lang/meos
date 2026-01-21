
import { useThemeSafe } from '@/contexts/ThemeContext';

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

export const useWidgetTheme = (): WidgetTheme => {
    const { theme } = useThemeSafe() || { theme: 'light' };
    const isSketch = theme === 'sketch';
    const isBrandAppart = theme === 'brand-appart';

    // Sketch Theme (Hardcoded Blueprint - Mediterranean Blue)
    const sketchTheme: WidgetTheme = {
        colors: {
            paper: '#FFFFFF',
            background: '#FFFFFF',
            blur: 'none',
            border: '#2B4AE2',
            text: {
                primary: '#2B4AE2',
                secondary: '#2B4AE2',
                muted: '#6B7FE8',
                accent: '#2B4AE2',
            },
            success: '#22C55E',
            traffic: {
                close: '#FFFFFF',
                minimize: '#FFFFFF',
                maximize: '#FFFFFF',
                border: '#2B4AE2',
            },
        },
        status: {
            available: {
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.1)',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                glow: '0 0 20px rgba(16, 185, 129, 0.4)',
            },
            looking: {
                color: '#3b82f6',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                glow: '0 0 20px rgba(59, 130, 246, 0.4)',
            },
            taking: {
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                glow: '0 0 20px rgba(245, 158, 11, 0.4)',
            },
            open: {
                color: '#8b5cf6',
                bgColor: 'rgba(139, 92, 246, 0.1)',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                glow: '0 0 20px rgba(139, 92, 246, 0.4)',
            },
            consulting: {
                color: '#06b6d4',
                bgColor: 'rgba(6, 182, 212, 0.1)',
                gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                glow: '0 0 20px rgba(6, 182, 212, 0.4)',
            },
        },
        shadows: {
            solid: '4px 4px 0 #2B4AE2',
            hover: '6px 6px 0 #2B4AE2',
        },
        radii: {
            card: '8px',
            button: '6px',
            pill: '9999px',
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
            background: '#fbf9ef',
            blur: 'none',
            border: '#171412', // Brand base (dark)
            text: {
                primary: '#171412',
                secondary: '#8e827c', // Brand grey
                muted: '#8e827c',
                accent: '#ff7722', // Brand orange
            },
            success: '#3d2fa9', // Brand purple
            traffic: {
                close: '#ff5f57',
                minimize: '#f59e0b',
                maximize: '#10b981',
                border: '#171412',
            },
        },
        status: {
            available: {
                color: '#3d2fa9',
                bgColor: '#f2f0e7',
                borderColor: '#3d2fa9',
                gradient: 'transparent',
                glow: 'none',
            },
            looking: {
                color: '#ff7722',
                bgColor: '#f2f0e7',
                borderColor: '#ff7722',
                gradient: 'transparent',
                glow: 'none',
            },
            taking: {
                color: '#ffc765',
                bgColor: '#f2f0e7',
                borderColor: '#ffc765',
                gradient: 'transparent',
                glow: 'none',
            },
            open: {
                color: '#ff3c34',
                bgColor: '#f2f0e7',
                borderColor: '#ff3c34',
                gradient: 'transparent',
                glow: 'none',
            },
            consulting: {
                color: '#8e827c',
                bgColor: '#f2f0e7',
                borderColor: '#8e827c',
                gradient: 'transparent',
                glow: 'none',
            },
        },
        shadows: {
            solid: '4px 4px 0 rgba(23, 20, 18, 0.1)',
            hover: '6px 6px 0 rgba(23, 20, 18, 0.15)',
        },
        radii: {
            card: '12px',
            button: '8px',
            pill: '12px',
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
            background: 'var(--bg-glass-elevated)',
            blur: 'var(--blur-glass)',
            border: 'var(--border-medium)',
            text: {
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-tertiary)',
                accent: 'var(--accent-primary)',
            },
            success: 'var(--accent-success)',
            traffic: {
                close: '#FF5F57',
                minimize: '#FFBD2E',
                maximize: '#28CA41',
                border: 'transparent',
            },
        },
        status: {
            available: {
                color: 'var(--accent-success)',
                bgColor: 'rgba(16, 185, 129, 0.1)',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                glow: '0 0 20px rgba(16, 185, 129, 0.4)',
            },
            looking: {
                color: 'var(--accent-primary)',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                glow: '0 0 20px rgba(59, 130, 246, 0.4)',
            },
            taking: {
                color: 'var(--accent-warning)',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                glow: '0 0 20px rgba(245, 158, 11, 0.4)',
            },
            open: {
                color: 'var(--accent-secondary)',
                bgColor: 'rgba(139, 92, 246, 0.1)',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                glow: '0 0 20px rgba(139, 92, 246, 0.4)',
            },
            consulting: {
                color: 'var(--accent-info)',
                bgColor: 'rgba(6, 182, 212, 0.1)',
                gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                glow: '0 0 20px rgba(6, 182, 212, 0.4)',
            },
        },
        shadows: {
            solid: 'var(--shadow-sm)',
            hover: 'var(--shadow-md)',
        },
        radii: {
            card: 'var(--radius-lg)',
            button: 'var(--radius-md)',
            pill: '9999px',
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
