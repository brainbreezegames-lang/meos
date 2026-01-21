'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Theme IDs
// Theme IDs
export type ThemeId = 'monterey' | 'dark' | 'bluren' | 'refined' | 'warm' | 'clay' | 'posthog' | 'sketch' | 'brand-appart';

// Theme metadata
export interface ThemeInfo {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  fontFamily?: string; // Special font to load
}

// All available themes
export const THEMES: Record<ThemeId, ThemeInfo> = {
  monterey: {
    id: 'monterey',
    name: 'Monterey',
    description: 'Classic macOS style',
    isDark: false,
  },
  dark: {
    id: 'dark',
    name: 'Monterey Dark',
    description: 'Dark macOS style',
    isDark: true,
  },
  bluren: {
    id: 'bluren',
    name: 'Bluren',
    description: 'Clean & minimal light',
    isDark: false,
  },
  refined: {
    id: 'refined',
    name: 'Refined',
    description: 'Elegant dark editorial',
    isDark: true,
    fontFamily: 'Halant',
  },
  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Organic & editorial light',
    isDark: false,
    fontFamily: 'InstrumentSerif',
  },
  clay: {
    id: 'clay',
    name: 'Clay',
    description: 'Stop-motion studio',
    isDark: false,
    fontFamily: 'Fredoka',
  },
  posthog: {
    id: 'posthog',
    name: 'PostHog',
    description: 'Retro desktop OS',
    isDark: false,
    fontFamily: 'IBMPlexSans',
  },
  sketch: {
    id: 'sketch',
    name: 'goOS',
    description: 'Playful sketch style',
    isDark: false,
    fontFamily: 'Gochi',
  },
  'brand-appart': {
    id: 'brand-appart',
    name: 'Brand Appart',
    description: 'Bold modern branding',
    isDark: false,
    fontFamily: 'Outfit',
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeInfo: ThemeInfo;
  setTheme: (theme: ThemeId) => void;
  isDark: boolean;
  availableThemes: ThemeInfo[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Safe version for components that might render outside provider
export function useThemeSafe() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeId;
  desktopId?: string;
  isOwner?: boolean;
  forceTheme?: boolean; // If true, ignore localStorage and always use initialTheme
}

export function ThemeProvider({
  children,
  initialTheme = 'monterey',
  desktopId,
  isOwner = false,
  forceTheme = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((themeId: ThemeId) => {
    const themeInfo = THEMES[themeId];

    // Set data-theme attribute for CSS variable switching
    document.documentElement.setAttribute('data-theme', themeId);

    // Also add theme class to document for CSS selectors
    // Remove all existing theme classes first
    document.documentElement.classList.remove(
      'theme-monterey', 'theme-dark', 'theme-bluren', 'theme-refined',
      'theme-warm', 'theme-clay', 'theme-posthog', 'theme-sketch', 'theme-brand-appart'
    );
    document.documentElement.classList.add(`theme-${themeId}`);

    // Set color-scheme for browser UI elements
    document.documentElement.style.colorScheme = themeInfo.isDark ? 'dark' : 'light';
  }, []);

  // Load special fonts for theme
  const loadThemeFonts = useCallback((themeId: ThemeId) => {
    const themeInfo = THEMES[themeId];

    if (themeInfo.fontFamily === 'Outfit') {
      const existingLink = document.querySelector('link[data-theme-font="outfit"]');
      if (!existingLink) {
        // Outfit (Display) and Instrument Sans (Body) already loaded in layout,
        // but ensuring we have the right weights here if dynamic loading is preferred.
        // Actually layout.tsx handles it via next/font, so this might be redundant 
        // if we just use the variable. But let's keep consistent.
        // Since we are using next/font variables, we might not need this unless
        // for client-side dynamic switching where layout isn't re-rendering.
        // We'll leave it empty as next/font injects variables globally.
      }
    }

    if (themeInfo.fontFamily === 'Halant') {
      const existingLink = document.querySelector('link[data-theme-font="halant"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Halant:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'halant');
        document.head.appendChild(link);
      }
    }

    if (themeInfo.fontFamily === 'InstrumentSerif') {
      const existingLink = document.querySelector('link[data-theme-font="instrument-serif"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'instrument-serif');
        document.head.appendChild(link);
      }
    }

    if (themeInfo.fontFamily === 'Fredoka') {
      const existingLink = document.querySelector('link[data-theme-font="fredoka"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'fredoka');
        document.head.appendChild(link);
      }
    }

    if (themeInfo.fontFamily === 'IBMPlexSans') {
      const existingLink = document.querySelector('link[data-theme-font="ibm-plex"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'ibm-plex');
        document.head.appendChild(link);
      }
    }

    if (themeInfo.fontFamily === 'Gochi') {
      const existingLink = document.querySelector('link[data-theme-font="gochi"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Averia+Serif+Libre:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'gochi');
        document.head.appendChild(link);
      }
    }
  }, []);

  // Initialize theme
  useEffect(() => {
    let themeToApply: ThemeId;

    if (forceTheme) {
      // For demo pages: always use the specified theme, ignore localStorage
      themeToApply = initialTheme;
    } else {
      // Check localStorage first (for visitor preference)
      const stored = localStorage.getItem('meos-theme-v2') as ThemeId | null;
      themeToApply = stored && THEMES[stored] ? stored : initialTheme;
    }

    setThemeState(themeToApply);
    applyTheme(themeToApply);
    loadThemeFonts(themeToApply);
    setFontsLoaded(true);
  }, [initialTheme, applyTheme, loadThemeFonts, forceTheme]);

  // Set theme and persist
  const setTheme = useCallback(async (newTheme: ThemeId) => {
    if (!THEMES[newTheme]) return;

    setThemeState(newTheme);
    applyTheme(newTheme);
    loadThemeFonts(newTheme);

    // Always save to localStorage for visitor preference
    localStorage.setItem('meos-theme-v2', newTheme);

    // If owner, also save to database
    if (isOwner && desktopId) {
      try {
        await fetch(`/api/desktop/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch (error) {
        console.error('Failed to save theme to database:', error);
      }
    }
  }, [applyTheme, loadThemeFonts, isOwner, desktopId]);

  const value: ThemeContextType = {
    theme,
    themeInfo: THEMES[theme],
    setTheme,
    isDark: THEMES[theme].isDark,
    availableThemes: Object.values(THEMES),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
