'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Visual Direction - the overall aesthetic personality
export type IconVisualDirection = 'warm-editorial' | 'minimal-monochrome' | 'premium-playful';

// Icon Style - the rendering technique
export type IconRenderStyle = 'flat-illustrated' | 'soft-3d';

export interface IconStyleConfig {
  visualDirection: IconVisualDirection;
  renderStyle: IconRenderStyle;
}

export interface VisualDirectionInfo {
  id: IconVisualDirection;
  name: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
  };
}

export interface RenderStyleInfo {
  id: IconRenderStyle;
  name: string;
  description: string;
}

// Visual directions with their palettes and characteristics
export const VISUAL_DIRECTIONS: Record<IconVisualDirection, VisualDirectionInfo> = {
  'warm-editorial': {
    id: 'warm-editorial',
    name: 'Warm Editorial',
    description: 'Sophisticated warmth with subtle grain',
    palette: {
      primary: '#2d2a26',
      secondary: '#8b7355',
      accent: '#c4703f',
      surface: '#f5f0e8',
    },
  },
  'minimal-monochrome': {
    id: 'minimal-monochrome',
    name: 'Minimal Mono',
    description: 'Clean contrast, single hue',
    palette: {
      primary: '#1a1a1a',
      secondary: '#666666',
      accent: '#000000',
      surface: '#ffffff',
    },
  },
  'premium-playful': {
    id: 'premium-playful',
    name: 'Premium Playful',
    description: 'Vibrant, bouncy, expressive',
    palette: {
      primary: '#1e3a5f',
      secondary: '#7c3aed',
      accent: '#f97316',
      surface: '#fef3c7',
    },
  },
};

export const RENDER_STYLES: Record<IconRenderStyle, RenderStyleInfo> = {
  'flat-illustrated': {
    id: 'flat-illustrated',
    name: 'Flat Illustrated',
    description: 'Clean vector, no depth',
  },
  'soft-3d': {
    id: 'soft-3d',
    name: 'Soft 3D',
    description: 'Subtle gradients & lighting',
  },
};

interface IconStyleContextType {
  config: IconStyleConfig;
  visualDirectionInfo: VisualDirectionInfo;
  renderStyleInfo: RenderStyleInfo;
  setVisualDirection: (direction: IconVisualDirection) => void;
  setRenderStyle: (style: IconRenderStyle) => void;
  availableDirections: VisualDirectionInfo[];
  availableStyles: RenderStyleInfo[];
}

const IconStyleContext = createContext<IconStyleContextType | null>(null);

export function useIconStyle() {
  const context = useContext(IconStyleContext);
  if (!context) {
    throw new Error('useIconStyle must be used within IconStyleProvider');
  }
  return context;
}

// Safe version for components that might render outside provider
export function useIconStyleSafe() {
  return useContext(IconStyleContext);
}

interface IconStyleProviderProps {
  children: React.ReactNode;
  initialDirection?: IconVisualDirection;
  initialStyle?: IconRenderStyle;
  desktopId?: string;
  isOwner?: boolean;
}

export function IconStyleProvider({
  children,
  initialDirection = 'warm-editorial',
  initialStyle = 'soft-3d',
  desktopId,
  isOwner = false,
}: IconStyleProviderProps) {
  const [config, setConfig] = useState<IconStyleConfig>({
    visualDirection: initialDirection,
    renderStyle: initialStyle,
  });

  // Apply icon style CSS variables to document
  const applyIconStyle = useCallback((newConfig: IconStyleConfig) => {
    const direction = VISUAL_DIRECTIONS[newConfig.visualDirection];
    const style = newConfig.renderStyle;

    // Set data attributes for CSS targeting
    document.documentElement.setAttribute('data-icon-direction', newConfig.visualDirection);
    document.documentElement.setAttribute('data-icon-style', style);

    // Apply palette CSS variables
    document.documentElement.style.setProperty('--icon-color-primary', direction.palette.primary);
    document.documentElement.style.setProperty('--icon-color-secondary', direction.palette.secondary);
    document.documentElement.style.setProperty('--icon-color-accent', direction.palette.accent);
    document.documentElement.style.setProperty('--icon-color-surface', direction.palette.surface);

    // Apply style-specific variables
    if (style === 'soft-3d') {
      document.documentElement.style.setProperty('--icon-depth', '1');
      document.documentElement.style.setProperty('--icon-shadow-opacity', '0.15');
      document.documentElement.style.setProperty('--icon-highlight-opacity', '0.4');
      document.documentElement.style.setProperty('--icon-gradient-intensity', '0.12');
    } else {
      document.documentElement.style.setProperty('--icon-depth', '0');
      document.documentElement.style.setProperty('--icon-shadow-opacity', '0');
      document.documentElement.style.setProperty('--icon-highlight-opacity', '0');
      document.documentElement.style.setProperty('--icon-gradient-intensity', '0');
    }
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const storedDirection = localStorage.getItem('meos-icon-direction') as IconVisualDirection | null;
    const storedStyle = localStorage.getItem('meos-icon-style') as IconRenderStyle | null;

    const newConfig: IconStyleConfig = {
      visualDirection: storedDirection && VISUAL_DIRECTIONS[storedDirection] ? storedDirection : initialDirection,
      renderStyle: storedStyle && RENDER_STYLES[storedStyle] ? storedStyle : initialStyle,
    };

    setConfig(newConfig);
    applyIconStyle(newConfig);
  }, [initialDirection, initialStyle, applyIconStyle]);

  const setVisualDirection = useCallback(async (direction: IconVisualDirection) => {
    if (!VISUAL_DIRECTIONS[direction]) return;

    const newConfig = { ...config, visualDirection: direction };
    setConfig(newConfig);
    applyIconStyle(newConfig);

    localStorage.setItem('meos-icon-direction', direction);

    // Persist to database if owner
    if (isOwner && desktopId) {
      try {
        await fetch(`/api/desktop/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ iconDirection: direction }),
        });
      } catch (error) {
        console.error('Failed to save icon direction:', error);
      }
    }
  }, [config, applyIconStyle, isOwner, desktopId]);

  const setRenderStyle = useCallback(async (style: IconRenderStyle) => {
    if (!RENDER_STYLES[style]) return;

    const newConfig = { ...config, renderStyle: style };
    setConfig(newConfig);
    applyIconStyle(newConfig);

    localStorage.setItem('meos-icon-style', style);

    if (isOwner && desktopId) {
      try {
        await fetch(`/api/desktop/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ iconStyle: style }),
        });
      } catch (error) {
        console.error('Failed to save icon style:', error);
      }
    }
  }, [config, applyIconStyle, isOwner, desktopId]);

  const value: IconStyleContextType = {
    config,
    visualDirectionInfo: VISUAL_DIRECTIONS[config.visualDirection],
    renderStyleInfo: RENDER_STYLES[config.renderStyle],
    setVisualDirection,
    setRenderStyle,
    availableDirections: Object.values(VISUAL_DIRECTIONS),
    availableStyles: Object.values(RENDER_STYLES),
  };

  return (
    <IconStyleContext.Provider value={value}>
      {children}
    </IconStyleContext.Provider>
  );
}
