'use client';

import React from 'react';

interface ProgressiveBlurProps {
  /** Height of the blur area */
  height?: number;
  /** Direction of the blur gradient */
  direction?: 'top' | 'bottom';
  /** Base color for the gradient overlay (helps hide artifacts) */
  tint?: string;
  /** Opacity of the color tint (0-1) */
  tintOpacity?: number;
  /** Additional className */
  className?: string;
  /** Z-index for layering */
  zIndex?: number;
}

/**
 * Progressive blur effect inspired by Apple/Framer design
 * Uses 5 optimized layers for smooth blur transition
 *
 * Performance optimizations:
 * - Uses GPU-accelerated backdrop-filter
 * - Limited to 5 layers (vs 7+ in typical implementations)
 * - Max blur of 24px (higher values hurt mobile performance)
 * - will-change hint for compositor optimization
 * - pointer-events: none to avoid blocking interactions
 */
export function ProgressiveBlur({
  height = 80,
  direction = 'bottom',
  tint = 'transparent',
  tintOpacity = 0,
  className = '',
  zIndex = 10,
}: ProgressiveBlurProps) {
  // Blur layers with progressive intensity
  // Each layer covers a portion of the height with increasing blur
  const layers = [
    { blur: 1, start: 0, end: 30 },
    { blur: 2, start: 15, end: 45 },
    { blur: 4, start: 30, end: 60 },
    { blur: 8, start: 45, end: 80 },
    { blur: 16, start: 60, end: 100 },
  ];

  const isTop = direction === 'top';

  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        [isTop ? 'top' : 'bottom']: 0,
        height,
        zIndex,
      }}
    >
      {/* Blur layers */}
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            mask: `linear-gradient(to ${isTop ? 'bottom' : 'top'},
              transparent ${layer.start}%,
              black ${(layer.start + layer.end) / 2}%,
              transparent ${layer.end}%
            )`,
            WebkitMask: `linear-gradient(to ${isTop ? 'bottom' : 'top'},
              transparent ${layer.start}%,
              black ${(layer.start + layer.end) / 2}%,
              transparent ${layer.end}%
            )`,
            willChange: 'backdrop-filter',
          }}
        />
      ))}

      {/* Final blur layer - strongest */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          mask: `linear-gradient(to ${isTop ? 'bottom' : 'top'},
            transparent 70%,
            black 100%
          )`,
          WebkitMask: `linear-gradient(to ${isTop ? 'bottom' : 'top'},
            transparent 70%,
            black 100%
          )`,
          willChange: 'backdrop-filter',
        }}
      />

      {/* Color tint overlay to eliminate artifacts */}
      {tintOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to ${isTop ? 'bottom' : 'top'},
              transparent 0%,
              ${tint} 100%
            )`,
            opacity: tintOpacity,
          }}
        />
      )}
    </div>
  );
}

/**
 * Simplified blur edge for windows (fewer layers, less GPU intensive)
 */
export function BlurEdge({
  height = 40,
  direction = 'bottom',
  className = '',
}: {
  height?: number;
  direction?: 'top' | 'bottom';
  className?: string;
}) {
  const isTop = direction === 'top';

  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        [isTop ? 'top' : 'bottom']: 0,
        height,
        zIndex: 5,
      }}
    >
      {/* Simple 3-layer blur for window edges */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          mask: `linear-gradient(to ${isTop ? 'bottom' : 'top'}, transparent, black 70%, transparent)`,
          WebkitMask: `linear-gradient(to ${isTop ? 'bottom' : 'top'}, transparent, black 70%, transparent)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          mask: `linear-gradient(to ${isTop ? 'bottom' : 'top'}, transparent 40%, black)`,
          WebkitMask: `linear-gradient(to ${isTop ? 'bottom' : 'top'}, transparent 40%, black)`,
        }}
      />
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to ${isTop ? 'bottom' : 'top'},
            transparent 0%,
            var(--bg-elevated) 100%
          )`,
          opacity: 0.7,
        }}
      />
    </div>
  );
}

export default ProgressiveBlur;
