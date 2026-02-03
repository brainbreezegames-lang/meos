'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useIconStyleSafe, type IconVisualDirection, type IconRenderStyle } from '@/contexts/IconStyleContext';

type IconTileSize = 'dock' | 'desktop' | 'grid' | 'large';

interface IconTileProps {
  /** Icon content - emoji, image URL, or React node */
  icon: string | React.ReactNode;
  /** Size preset */
  size?: IconTileSize;
  /** Custom size in pixels (overrides preset) */
  customSize?: number;
  /** Alt text for images */
  alt?: string;
  /** Additional CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether to show hover effects */
  interactive?: boolean;
  /** Override visual direction for this instance */
  direction?: IconVisualDirection;
  /** Override render style for this instance */
  style?: IconRenderStyle;
}

const SIZE_CONFIG: Record<IconTileSize, { tile: number; icon: number; radius: number }> = {
  dock: { tile: 48, icon: 28, radius: 12 },
  desktop: { tile: 64, icon: 40, radius: 14 },
  grid: { tile: 80, icon: 48, radius: 16 },
  large: { tile: 128, icon: 80, radius: 24 },
};

// Grain SVG as data URL for texture overlay
const GRAIN_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function IconTile({
  icon,
  size = 'desktop',
  customSize,
  alt = 'Icon',
  className = '',
  onClick,
  interactive = true,
  direction: directionOverride,
  style: styleOverride,
}: IconTileProps) {
  const prefersReducedMotion = useReducedMotion();
  const iconStyleContext = useIconStyleSafe();

  // Use overrides or context values, fallback to defaults
  const visualDirection = directionOverride ?? iconStyleContext?.config.visualDirection ?? 'warm-editorial';
  const renderStyle = styleOverride ?? iconStyleContext?.config.renderStyle ?? 'soft-3d';

  const sizeConfig = SIZE_CONFIG[size];
  const tileSize = customSize ?? sizeConfig.tile;
  const iconSize = customSize ? Math.round(customSize * 0.625) : sizeConfig.icon;
  const borderRadius = customSize ? Math.round(customSize * 0.22) : sizeConfig.radius;

  // Check if icon is emoji
  const isEmoji = typeof icon === 'string' && icon.length <= 4 && /\p{Emoji}/u.test(icon);
  const isImageUrl = typeof icon === 'string' && !isEmoji;

  // Generate styles based on visual direction and render style
  const tileStyles = useMemo(() => {
    const is3D = renderStyle === 'soft-3d';

    // Base styles by visual direction
    const directionStyles: Record<IconVisualDirection, React.CSSProperties> = {
      'warm-editorial': {
        background: is3D
          ? 'linear-gradient(145deg, #f8f4ef 0%, #e8e0d5 100%)'
          : '#f5f0e8',
        boxShadow: is3D
          ? `0 2px 4px rgba(45, 42, 38, 0.08),
             0 4px 12px rgba(45, 42, 38, 0.06),
             inset 0 1px 0 rgba(255, 255, 255, 0.8),
             inset 0 -1px 0 rgba(45, 42, 38, 0.05)`
          : '0 1px 3px rgba(45, 42, 38, 0.1)',
        border: is3D ? '1px solid rgba(45, 42, 38, 0.08)' : '1px solid rgba(45, 42, 38, 0.12)',
      },
      'minimal-monochrome': {
        background: is3D
          ? 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
          : '#ffffff',
        boxShadow: is3D
          ? `0 1px 2px rgba(0, 0, 0, 0.04),
             0 4px 16px rgba(0, 0, 0, 0.06),
             inset 0 1px 0 rgba(255, 255, 255, 1)`
          : '0 0 0 1px rgba(0, 0, 0, 0.08)',
        border: 'none',
      },
      'premium-playful': {
        background: is3D
          ? 'linear-gradient(145deg, #fef9f0 0%, #fde68a 100%)'
          : '#fef3c7',
        boxShadow: is3D
          ? `0 2px 4px rgba(249, 115, 22, 0.1),
             0 8px 24px rgba(249, 115, 22, 0.08),
             inset 0 2px 0 rgba(255, 255, 255, 0.9),
             inset 0 -2px 4px rgba(249, 115, 22, 0.05)`
          : '0 2px 8px rgba(249, 115, 22, 0.12)',
        border: is3D ? '1px solid rgba(249, 115, 22, 0.15)' : '1px solid rgba(249, 115, 22, 0.2)',
      },
    };

    return {
      ...directionStyles[visualDirection],
      borderRadius,
      width: tileSize,
      height: tileSize,
    };
  }, [visualDirection, renderStyle, borderRadius, tileSize]);

  // Icon container styles
  const iconContainerStyles = useMemo(() => {
    const is3D = renderStyle === 'soft-3d';

    const baseStyles: React.CSSProperties = {
      width: iconSize,
      height: iconSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    };

    if (is3D && !isEmoji) {
      return {
        ...baseStyles,
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
      };
    }

    return baseStyles;
  }, [renderStyle, iconSize, isEmoji]);

  // Emoji styles by direction
  const emojiStyles = useMemo((): React.CSSProperties => {
    const fontSize = Math.round(iconSize * 0.85);

    const filterByDirection: Record<IconVisualDirection, string> = {
      'warm-editorial': 'saturate(0.9) brightness(1.02)',
      'minimal-monochrome': 'grayscale(1) contrast(1.1)',
      'premium-playful': 'saturate(1.15) brightness(1.05)',
    };

    return {
      fontSize,
      lineHeight: 1,
      filter: filterByDirection[visualDirection],
      userSelect: 'none',
    };
  }, [iconSize, visualDirection]);

  // Hover animation variants
  const hoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: prefersReducedMotion
      ? {}
      : visualDirection === 'premium-playful'
      ? { scale: 1.08, y: -4, rotate: 2 }
      : { scale: 1.05, y: -2 },
    tap: prefersReducedMotion ? {} : { scale: 0.95, y: 0 },
  };

  // Grain overlay (only for warm-editorial)
  const showGrain = visualDirection === 'warm-editorial' && renderStyle === 'soft-3d';

  return (
    <motion.div
      className={`icon-tile relative flex items-center justify-center overflow-hidden ${className}`}
      style={tileStyles}
      variants={interactive ? hoverVariants : undefined}
      initial="rest"
      whileHover={interactive ? 'hover' : undefined}
      whileTap={interactive && onClick ? 'tap' : undefined}
      onClick={onClick}
      transition={{
        type: 'spring',
        stiffness: visualDirection === 'premium-playful' ? 400 : 500,
        damping: visualDirection === 'premium-playful' ? 15 : 25,
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Grain texture overlay */}
      {showGrain && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: GRAIN_TEXTURE,
            opacity: 0.03,
            mixBlendMode: 'multiply',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Top highlight for 3D effect */}
      {renderStyle === 'soft-3d' && (
        <div
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 100%)',
            borderRadius: 'inherit',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        />
      )}

      {/* Icon content */}
      <div style={iconContainerStyles}>
        {isEmoji ? (
          <span style={emojiStyles}>{icon}</span>
        ) : isImageUrl ? (
          <img
            src={icon}
            alt={alt}
            width={iconSize}
            height={iconSize}
            style={{
              objectFit: 'contain',
              borderRadius: Math.round(borderRadius * 0.5),
            }}
          />
        ) : (
          icon
        )}
      </div>
    </motion.div>
  );
}

// Preset variants for common use cases
export function DockIconTile(props: Omit<IconTileProps, 'size'>) {
  return <IconTile {...props} size="dock" />;
}

export function DesktopIconTile(props: Omit<IconTileProps, 'size'>) {
  return <IconTile {...props} size="desktop" />;
}

export function GridIconTile(props: Omit<IconTileProps, 'size'>) {
  return <IconTile {...props} size="grid" />;
}

export function LargeIconTile(props: Omit<IconTileProps, 'size'>) {
  return <IconTile {...props} size="large" />;
}
