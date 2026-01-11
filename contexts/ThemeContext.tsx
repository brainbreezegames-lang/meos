'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Theme IDs
export type ThemeId = 'monterey' | 'dark' | 'bluren' | 'refined' | 'warm';

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
}

export function ThemeProvider({
  children,
  initialTheme = 'monterey',
  desktopId,
  isOwner = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((themeId: ThemeId) => {
    const themeInfo = THEMES[themeId];

    // Set data-theme attribute for CSS variable switching
    document.documentElement.setAttribute('data-theme', themeId);

    // Set color-scheme for browser UI elements
    document.documentElement.style.colorScheme = themeInfo.isDark ? 'dark' : 'light';
  }, []);

  // Load special fonts for theme
  const loadThemeFonts = useCallback((themeId: ThemeId) => {
    const themeInfo = THEMES[themeId];

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
  }, []);

  // Initialize theme
  useEffect(() => {
    // Check localStorage first (for visitor preference)
    const stored = localStorage.getItem('meos-theme') as ThemeId | null;

    // Use initial theme from desktop if provided, otherwise use stored or default
    const themeToApply = stored && THEMES[stored] ? stored : initialTheme;

    setThemeState(themeToApply);
    applyTheme(themeToApply);
    loadThemeFonts(themeToApply);
    setFontsLoaded(true);
  }, [initialTheme, applyTheme, loadThemeFonts]);

  // Set theme and persist
  const setTheme = useCallback(async (newTheme: ThemeId) => {
    if (!THEMES[newTheme]) return;

    setThemeState(newTheme);
    applyTheme(newTheme);
    loadThemeFonts(newTheme);

    // Always save to localStorage for visitor preference
    localStorage.setItem('meos-theme', newTheme);

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
