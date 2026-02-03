'use client';

import { useState, useEffect } from 'react';
import { useIconStyleSafe, type IconVisualDirection, type IconRenderStyle } from '@/contexts/IconStyleContext';

// ============================================================================
// IMAGE-BASED PREMIUM ICON SYSTEM
// Drop designed icon PNGs into: /public/icons/{direction}/{type}.png
// Falls back to beautiful styled icons when images don't exist
// ============================================================================

interface PremiumIconProps {
  type: string;
  size?: number;
  direction?: IconVisualDirection;
  style?: IconRenderStyle;
  imageUrl?: string;
  faviconUrl?: string | null;
}

// Style configurations per direction
const DIRECTION_STYLES = {
  'warm-editorial': {
    shadow: '0 8px 24px rgba(139, 115, 85, 0.25), 0 4px 8px rgba(139, 115, 85, 0.15)',
    shadowFlat: '0 1px 3px rgba(139, 115, 85, 0.1)',
    border: '1px solid rgba(139, 115, 85, 0.12)',
    borderRadius: 12,
    bg: 'linear-gradient(145deg, #FBF8F3 0%, #F5EFE5 100%)',
    highlight: 'rgba(255, 255, 255, 0.6)',
  },
  'minimal-monochrome': {
    shadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
    shadowFlat: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: 10,
    bg: 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
    highlight: 'rgba(255, 255, 255, 0.8)',
  },
  'premium-playful': {
    shadow: '0 10px 30px rgba(249, 115, 22, 0.2), 0 4px 12px rgba(139, 92, 246, 0.15)',
    shadowFlat: '0 1px 3px rgba(249, 115, 22, 0.1)',
    border: '1px solid rgba(249, 115, 22, 0.15)',
    borderRadius: 14,
    bg: 'linear-gradient(145deg, #FFFBF7 0%, #FFF5ED 100%)',
    highlight: 'rgba(255, 255, 255, 0.5)',
  },
};

// Icon accent colors per direction
const ICON_COLORS: Record<IconVisualDirection, Record<string, { primary: string; secondary: string }>> = {
  'warm-editorial': {
    note: { primary: '#B87333', secondary: '#8B5A2B' },
    folder: { primary: '#C4A574', secondary: '#A68B5B' },
    'case-study': { primary: '#6B5B95', secondary: '#534A76' },
    cv: { primary: '#4A7C59', secondary: '#3D6B4A' },
    image: { primary: '#7BA05B', secondary: '#5C8A3E' },
    link: { primary: '#B87333', secondary: '#9A5F28' },
    game: { primary: '#5C8A5E', secondary: '#4A7C4D' },
    embed: { primary: '#C75450', secondary: '#A8403D' },
    download: { primary: '#6B8CCE', secondary: '#5474B4' },
    board: { primary: '#6B8CCE', secondary: '#5474B4' },
    sheet: { primary: '#5C8A5E', secondary: '#4A7C4D' },
    slides: { primary: '#D4874B', secondary: '#C07038' },
    invoice: { primary: '#6B8CCE', secondary: '#5474B4' },
    about: { primary: '#8B7355', secondary: '#6B5A45' },
    contact: { primary: '#4A7C59', secondary: '#3D6B4A' },
  },
  'minimal-monochrome': {
    note: { primary: '#1a1a1a', secondary: '#333333' },
    folder: { primary: '#2a2a2a', secondary: '#444444' },
    'case-study': { primary: '#1a1a1a', secondary: '#333333' },
    cv: { primary: '#1a1a1a', secondary: '#333333' },
    image: { primary: '#2a2a2a', secondary: '#444444' },
    link: { primary: '#1a1a1a', secondary: '#333333' },
    game: { primary: '#2a2a2a', secondary: '#444444' },
    embed: { primary: '#1a1a1a', secondary: '#333333' },
    download: { primary: '#2a2a2a', secondary: '#444444' },
    board: { primary: '#1a1a1a', secondary: '#333333' },
    sheet: { primary: '#2a2a2a', secondary: '#444444' },
    slides: { primary: '#1a1a1a', secondary: '#333333' },
    invoice: { primary: '#2a2a2a', secondary: '#444444' },
    about: { primary: '#1a1a1a', secondary: '#333333' },
    contact: { primary: '#2a2a2a', secondary: '#444444' },
  },
  'premium-playful': {
    note: { primary: '#F97316', secondary: '#EA580C' },
    folder: { primary: '#3B82F6', secondary: '#2563EB' },
    'case-study': { primary: '#8B5CF6', secondary: '#7C3AED' },
    cv: { primary: '#EC4899', secondary: '#DB2777' },
    image: { primary: '#10B981', secondary: '#059669' },
    link: { primary: '#F97316', secondary: '#EA580C' },
    game: { primary: '#10B981', secondary: '#059669' },
    embed: { primary: '#EF4444', secondary: '#DC2626' },
    download: { primary: '#0EA5E9', secondary: '#0284C7' },
    board: { primary: '#3B82F6', secondary: '#2563EB' },
    sheet: { primary: '#10B981', secondary: '#059669' },
    slides: { primary: '#F97316', secondary: '#EA580C' },
    invoice: { primary: '#8B5CF6', secondary: '#7C3AED' },
    about: { primary: '#06B6D4', secondary: '#0891B2' },
    contact: { primary: '#10B981', secondary: '#059669' },
  },
};

// Icon glyphs - simple symbols that look good at any size
const ICON_GLYPHS: Record<string, (color: string) => JSX.Element> = {
  note: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <path d="M8 3H16C17.1 3 18 3.9 18 5V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V5C6 3.9 6.9 3 8 3Z" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
      <path d="M9 8H15M9 12H15M9 16H13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  folder: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '65%', height: '65%' }}>
      <path d="M3 8V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V10C21 8.9 20.1 8 19 8H12L10 6H5C3.9 6 3 6.9 3 8Z" fill={c} fillOpacity="0.2"/>
      <path d="M3 8V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V10C21 8.9 20.1 8 19 8H12L10 6H5C3.9 6 3 6.9 3 8Z" stroke={c} strokeWidth="1.5"/>
    </svg>
  ),
  'case-study': (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="3" y="3" width="18" height="14" rx="2" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
      <rect x="6" y="11" width="3" height="4" fill={c}/>
      <rect x="10.5" y="8" width="3" height="7" fill={c}/>
      <rect x="15" y="9" width="3" height="6" fill={c}/>
      <path d="M12 20V17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 20H16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  cv: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <path d="M6 3H18C19.1 3 20 3.9 20 5V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3Z" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1.5"/>
      <circle cx="12" cy="9" r="3" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1.5"/>
      <path d="M8 17C8 15 10 14 12 14C14 14 16 15 16 17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  image: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="3" y="4" width="18" height="16" rx="2" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
      <circle cx="8" cy="9" r="2" fill={c}/>
      <path d="M3 16L8 12L12 15L16 11L21 16" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  link: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '55%', height: '55%' }}>
      <path d="M10 14C10.8 15.2 12.2 16 13.9 16H16.1C18.8 16 21 13.8 21 11C21 8.2 18.8 6 16.1 6H14" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 10C13.2 8.8 11.8 8 10.1 8H7.9C5.2 8 3 10.2 3 13C3 15.8 5.2 18 7.9 18H10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  game: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '65%', height: '65%' }}>
      <rect x="2" y="7" width="20" height="12" rx="4" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
      <path d="M7 11V15M5 13H9" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="11" r="1.5" fill={c}/>
      <circle cx="19" cy="13" r="1.5" fill={c}/>
    </svg>
  ),
  embed: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="3" y="4" width="18" height="16" rx="2" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
      <path d="M9.5 9L15 12L9.5 15V9Z" fill={c}/>
    </svg>
  ),
  download: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '55%', height: '55%' }}>
      <path d="M12 4V14M12 14L8 10M12 14L16 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  board: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="3" y="3" width="5" height="18" rx="1" fill={c} fillOpacity="0.3"/>
      <rect x="9.5" y="3" width="5" height="12" rx="1" fill={c} fillOpacity="0.5"/>
      <rect x="16" y="3" width="5" height="8" rx="1" fill={c} fillOpacity="0.7"/>
    </svg>
  ),
  sheet: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1.5"/>
      <path d="M3 9H21M9 3V21" stroke={c} strokeWidth="1.5"/>
      <rect x="11" y="11" width="8" height="3" rx="0.5" fill={c} fillOpacity="0.4"/>
      <rect x="11" y="16" width="5" height="3" rx="0.5" fill={c} fillOpacity="0.3"/>
    </svg>
  ),
  slides: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="2" y="4" width="20" height="14" rx="2" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.5"/>
      <rect x="5" y="7" width="6" height="2" rx="0.5" fill={c}/>
      <rect x="5" y="10" width="4" height="1.5" rx="0.5" fill={c} fillOpacity="0.6"/>
      <rect x="5" y="12.5" width="5" height="1.5" rx="0.5" fill={c} fillOpacity="0.4"/>
      <rect x="13" y="7" width="6" height="7" rx="1" fill={c} fillOpacity="0.3"/>
      <circle cx="9" cy="20" r="1" fill={c}/>
      <circle cx="12" cy="20" r="1" fill={c} fillOpacity="0.5"/>
      <circle cx="15" cy="20" r="1" fill={c} fillOpacity="0.3"/>
    </svg>
  ),
  invoice: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <path d="M6 2H18C19.1 2 20 2.9 20 4V22L17 20L14 22L12 20L10 22L7 20L4 22V4C4 2.9 4.9 2 6 2Z" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1.5"/>
      <path d="M8 7H16M8 11H16M8 15H12" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  about: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '55%', height: '55%' }}>
      <circle cx="12" cy="8" r="4" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1.5"/>
      <path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  contact: (c) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
      <rect x="2" y="4" width="20" height="16" rx="2" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.5"/>
      <path d="M2 7L12 13L22 7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function useIconStyle(dirOverride?: IconVisualDirection, styleOverride?: IconRenderStyle) {
  const context = useIconStyleSafe();
  const direction = dirOverride || context?.config.visualDirection || 'warm-editorial';
  const renderStyle = styleOverride || context?.config.renderStyle || 'soft-3d';

  return {
    direction,
    is3D: renderStyle === 'soft-3d',
    styles: DIRECTION_STYLES[direction],
  };
}

// ============================================================================
// PREMIUM ICON COMPONENT
// ============================================================================
export function PremiumIcon({
  type,
  size = 52,
  direction: dirOverride,
  style: styleOverride,
  imageUrl,
  faviconUrl,
}: PremiumIconProps) {
  const { direction, is3D, styles } = useIconStyle(dirOverride, styleOverride);
  const [iconLoaded, setIconLoaded] = useState(false);
  const [iconError, setIconError] = useState(false);

  const iconPath = `/icons/${direction}/${type}.png`;
  const colors = ICON_COLORS[direction][type] || ICON_COLORS[direction].note;
  const GlyphComponent = ICON_GLYPHS[type] || ICON_GLYPHS.note;

  // Reset state when direction or type changes
  useEffect(() => {
    setIconLoaded(false);
    setIconError(false);
  }, [direction, type]);

  // For image type with actual image URL, show the image
  if (type === 'image' && imageUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: styles.borderRadius,
          overflow: 'hidden',
          boxShadow: is3D ? styles.shadow : styles.shadowFlat,
          border: styles.border,
          background: '#fff',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />
      </div>
    );
  }

  // For link type with favicon
  if (type === 'link' && faviconUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: styles.borderRadius,
          background: styles.bg,
          boxShadow: is3D ? styles.shadow : styles.shadowFlat,
          border: styles.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt=""
          style={{
            width: size * 0.5,
            height: size * 0.5,
            objectFit: 'contain',
            borderRadius: 4,
          }}
          draggable={false}
        />
        {/* Arrow badge */}
        <div
          style={{
            position: 'absolute',
            bottom: -3,
            right: -3,
            width: 18,
            height: 18,
            borderRadius: 6,
            background: `linear-gradient(145deg, ${colors.primary}, ${colors.secondary})`,
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  }

  // Main icon rendering with image fallback to glyph
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: styles.borderRadius,
        background: styles.bg,
        boxShadow: is3D ? styles.shadow : styles.shadowFlat,
        border: styles.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Inner highlight for 3D effect */}
      {is3D && (
        <div
          style={{
            position: 'absolute',
            inset: 1,
            borderRadius: styles.borderRadius - 1,
            background: `linear-gradient(180deg, ${styles.highlight} 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Try to load actual designed icon image */}
      {!iconError && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={iconPath}
          alt=""
          style={{
            width: size * 0.7,
            height: size * 0.7,
            objectFit: 'contain',
            display: iconLoaded ? 'block' : 'none',
            position: 'relative',
            zIndex: 1,
          }}
          draggable={false}
          onLoad={() => setIconLoaded(true)}
          onError={() => setIconError(true)}
        />
      )}

      {/* Glyph fallback when no image is available */}
      {(iconError || !iconLoaded) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {GlyphComponent(colors.primary)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SELECTOR FUNCTION (for backwards compatibility)
// ============================================================================
export function getPremiumIcon(
  type: string,
  props?: Omit<PremiumIconProps, 'type'>
) {
  return <PremiumIcon type={type} {...props} />;
}
