'use client';

import { useState } from 'react';
import { type IconContext, ICON_SIZES } from '@/lib/icons/types';

interface IconProps {
  /** The base URL path to the icon (without size suffix) */
  src: string;
  /** The icon context determines which sizes to use */
  context: IconContext;
  /** Accessible label for the icon */
  alt: string;
  /** Optional CSS class */
  className?: string;
  /** Custom size override (in pixels) */
  size?: number;
  /** Whether to lazy load the image */
  lazy?: boolean;
  /** Fallback icon to show on error */
  fallback?: React.ReactNode;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Responsive icon component with srcset support
 * Automatically serves the right size based on device pixel ratio
 */
export function Icon({
  src,
  context,
  alt,
  className = '',
  size,
  lazy = true,
  fallback,
  onClick,
}: IconProps) {
  const [hasError, setHasError] = useState(false);
  const config = ICON_SIZES[context];
  const displaySize = size ?? config.display;

  // Generate srcset for responsive loading
  const generateSrcSet = () => {
    const sizes = config.generated;
    return sizes
      .map((s) => {
        const ratio = s / displaySize;
        // Only include sizes that are valid pixel ratios (1x, 2x, 3x)
        if (ratio >= 1 && ratio <= 3 && Number.isInteger(ratio)) {
          return `${src}-${s}.webp ${ratio}x`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');
  };

  // Find the closest available size for the default src
  const getDefaultSrc = () => {
    const sizes = config.generated;
    const target = displaySize * 2; // Default to 2x for retina
    const closest = sizes.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
    return `${src}-${closest}.webp`;
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={getDefaultSrc()}
      srcSet={generateSrcSet()}
      width={displaySize}
      height={displaySize}
      alt={alt}
      className={className}
      loading={lazy ? 'lazy' : 'eager'}
      onError={() => setHasError(true)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    />
  );
}

interface SVGIconProps {
  /** SVG icon component from the icon library */
  icon: React.FC<{ className?: string; size?: number }>;
  /** Size in pixels */
  size?: number;
  /** Optional CSS class */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Wrapper for SVG icons from the icon library
 */
export function SVGIcon({ icon: IconComponent, size = 64, className = '', onClick }: SVGIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <IconComponent size={size} />
    </span>
  );
}

interface DockIconProps {
  /** Icon to display */
  children: React.ReactNode;
  /** Label for tooltip */
  label: string;
  /** Whether the app is running (shows indicator) */
  isRunning?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Dock icon wrapper with hover effects and running indicator
 */
export function DockIcon({ children, label, isRunning = false, onClick }: DockIconProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-110 hover:-translate-y-2 active:scale-95"
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
        title={label}
      >
        {children}
      </button>

      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div
          className="px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          style={{ background: 'rgba(0,0,0,0.75)' }}
        >
          {label}
        </div>
      </div>

      {/* Running indicator */}
      {isRunning && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
      )}
    </div>
  );
}

interface DesktopIconProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Label below the icon */
  label: string;
  /** Whether the icon is selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Double click handler */
  onDoubleClick?: () => void;
}

/**
 * Desktop icon with label and selection state
 */
export function DesktopIcon({
  icon,
  label,
  selected = false,
  onClick,
  onDoubleClick,
}: DesktopIconProps) {
  return (
    <button
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
        selected ? 'bg-white/20' : 'hover:bg-white/10'
      }`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="w-16 h-16 flex items-center justify-center">{icon}</div>
      <span
        className={`text-xs text-center max-w-[80px] truncate ${
          selected ? 'text-white bg-blue-500 px-1 rounded' : 'text-white drop-shadow-md'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
