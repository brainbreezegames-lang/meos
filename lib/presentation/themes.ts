/**
 * goOS Presentation Themes
 *
 * 6 distinctive themes with editorial-quality color palettes.
 * Each theme has personality - not just "light" and "dark" variants.
 */

export interface PresentationTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    accentMuted: string;
  };
  // Font customization per theme for personality
  fonts: {
    display: string;
    body: string;
  };
}

export const themes: Record<string, PresentationTheme> = {
  // ─────────────────────────────────────────────────────────────
  // LIGHT THEMES
  // ─────────────────────────────────────────────────────────────

  /**
   * PAPER - Warm, approachable, like a well-printed book
   * Inspired by: Kinfolk magazine, Japanese minimalism
   * Uses design system fonts: Averia Serif Libre + Instrument Sans
   */
  paper: {
    id: 'paper',
    name: 'Paper',
    description: 'Warm and inviting, like a beautiful book',
    colors: {
      background: '#FBF9EF',      // Warm cream from design system
      surface: '#FFFFFF',
      text: '#171412',            // Text primary from design system
      textMuted: '#7A746C',       // Text muted from design system
      accent: '#FF7722',          // Accent from design system
      accentMuted: '#FFF0E5',     // Accent subtle from design system
    },
    fonts: {
      display: '"Averia Serif Libre", Georgia, serif',
      body: '"Instrument Sans", system-ui, sans-serif',
    },
  },

  /**
   * STUDIO - Clean, professional, confident
   * Inspired by: Architizer, Dezeen, architecture portfolios
   */
  studio: {
    id: 'studio',
    name: 'Studio',
    description: 'Clean and professional, architectural precision',
    colors: {
      background: '#F5F5F3',      // Cool off-white
      surface: '#FFFFFF',
      text: '#1A1A1A',            // Near black
      textMuted: '#737373',       // Neutral gray
      accent: '#1A1A1A',          // Black as accent - bold choice
      accentMuted: '#E5E5E5',     // Pale gray
    },
    fonts: {
      display: '"Instrument Sans", system-ui, sans-serif',
      body: '"Instrument Sans", system-ui, sans-serif',
    },
  },

  /**
   * CANVAS - Soft, artistic, gallery-like
   * Inspired by: Museum exhibitions, art catalogs
   */
  canvas: {
    id: 'canvas',
    name: 'Canvas',
    description: 'Soft and artistic, gallery atmosphere',
    colors: {
      background: '#F0EDE8',      // Linen white
      surface: '#FAFAF8',
      text: '#3D3833',            // Deep warm brown
      textMuted: '#9C958C',       // Muted brown
      accent: '#5C6B4A',          // Sage green - organic, artistic
      accentMuted: '#DFE4D8',     // Pale sage
    },
    fonts: {
      display: '"Averia Serif Libre", Georgia, serif',
      body: '"Instrument Sans", system-ui, sans-serif',
    },
  },

  // ─────────────────────────────────────────────────────────────
  // DARK THEMES
  // ─────────────────────────────────────────────────────────────

  /**
   * INK - Deep, sophisticated, luxurious
   * Inspired by: High-end fashion, luxury brands
   */
  ink: {
    id: 'ink',
    name: 'Ink',
    description: 'Deep and luxurious, sophisticated presence',
    colors: {
      background: '#0D0D0D',      // Near black, not pure
      surface: '#171717',
      text: '#F5F5F3',            // Warm off-white
      textMuted: '#8A8A8A',       // Mid gray
      accent: '#D4A853',          // Gold - luxury, editorial
      accentMuted: '#3D3527',     // Dark gold
    },
    fonts: {
      display: '"Averia Serif Libre", Georgia, serif',
      body: '"Instrument Sans", system-ui, sans-serif',
    },
  },

  /**
   * SLATE - Modern, tech-forward, confident
   * Inspired by: Linear, Vercel, modern SaaS
   */
  slate: {
    id: 'slate',
    name: 'Slate',
    description: 'Modern and precise, tech-forward confidence',
    colors: {
      background: '#111113',      // Slightly blue-tinted black
      surface: '#1C1C1F',
      text: '#EDEDEF',            // Cool off-white
      textMuted: '#71717A',       // Cool gray
      accent: '#3B82F6',          // Clear blue - modern, trustworthy
      accentMuted: '#1E3A5F',     // Deep blue
    },
    fonts: {
      display: '"Instrument Sans", system-ui, sans-serif',
      body: '"Instrument Sans", system-ui, sans-serif',
    },
  },

  /**
   * MIDNIGHT - Dramatic, editorial, cinematic
   * Inspired by: Film credits, editorial spreads
   */
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dramatic and cinematic, editorial edge',
    colors: {
      background: '#0A0C10',      // Deep blue-black
      surface: '#12151C',
      text: '#E8E9EB',            // Cool white
      textMuted: '#6B7280',       // Blue-gray
      accent: '#EF4444',          // Red - dramatic, editorial
      accentMuted: '#4A1C1C',     // Dark red
    },
    fonts: {
      display: '"Averia Serif Libre", Georgia, serif',
      body: '"Instrument Sans", system-ui, sans-serif',
    },
  },
};

export const themeIds = Object.keys(themes) as (keyof typeof themes)[];
export type ThemeId = keyof typeof themes;

/**
 * Get theme by ID with fallback
 */
export function getTheme(id: string): PresentationTheme {
  return themes[id] || themes.paper;
}

/**
 * CSS custom properties for a theme
 */
export function getThemeCSSVars(theme: PresentationTheme): Record<string, string> {
  return {
    '--slide-bg': theme.colors.background,
    '--slide-surface': theme.colors.surface,
    '--slide-text': theme.colors.text,
    '--slide-text-muted': theme.colors.textMuted,
    '--slide-accent': theme.colors.accent,
    '--slide-accent-muted': theme.colors.accentMuted,
    '--slide-font-display': theme.fonts.display,
    '--slide-font-body': theme.fonts.body,
  };
}
