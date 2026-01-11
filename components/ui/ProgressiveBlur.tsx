'use client';

import React from 'react';

interface ProgressiveBlurProps {
  /** Height of the blur area in pixels */
  height?: number;
  /** Direction: which edge is blurred */
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Additional className */
  className?: string;
  /** Z-index for layering */
  zIndex?: number;
}

/**
 * Modern progressive blur effect (Apple/Framer style)
 *
 * Uses stacked backdrop-filter layers with CSS mask gradients
 * Each layer has increasing blur strength and overlapping masks
 * for smooth gradient transition.
 *
 * Inspired by: https://github.com/AndrewPrifer/progressive-blur
 */
export function ProgressiveBlur({
  height = 100,
  direction = 'bottom',
  className = '',
  zIndex = 10,
}: ProgressiveBlurProps) {
  // 8 layers with exponentially increasing blur
  // This creates a smooth gradient from clear to fully blurred
  const blurLayers = [
    { blur: 0.5, maskStart: 0, maskEnd: 12.5 },
    { blur: 1, maskStart: 0, maskEnd: 25 },
    { blur: 2, maskStart: 12.5, maskEnd: 37.5 },
    { blur: 4, maskStart: 25, maskEnd: 50 },
    { blur: 8, maskStart: 37.5, maskEnd: 62.5 },
    { blur: 12, maskStart: 50, maskEnd: 75 },
    { blur: 16, maskStart: 62.5, maskEnd: 87.5 },
    { blur: 24, maskStart: 75, maskEnd: 100 },
  ];

  const isVertical = direction === 'top' || direction === 'bottom';
  const gradientDir = direction === 'bottom' ? 'to top' :
                      direction === 'top' ? 'to bottom' :
                      direction === 'left' ? 'to right' : 'to left';

  const positionStyle: React.CSSProperties = {
    [direction]: 0,
    left: isVertical ? 0 : undefined,
    right: isVertical ? 0 : undefined,
    top: !isVertical ? 0 : undefined,
    bottom: !isVertical ? 0 : undefined,
    [isVertical ? 'height' : 'width']: height,
    [isVertical ? 'width' : 'height']: '100%',
  };

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        ...positionStyle,
        zIndex,
      }}
    >
      {blurLayers.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: `linear-gradient(${gradientDir},
              rgba(0, 0, 0, 0) ${layer.maskStart}%,
              rgba(0, 0, 0, 1) ${layer.maskEnd}%
            )`,
            WebkitMaskImage: `linear-gradient(${gradientDir},
              rgba(0, 0, 0, 0) ${layer.maskStart}%,
              rgba(0, 0, 0, 1) ${layer.maskEnd}%
            )`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Lighter blur edge for windows (3 layers instead of 8)
 */
export function BlurEdge({
  height = 48,
  direction = 'bottom',
  className = '',
}: {
  height?: number;
  direction?: 'top' | 'bottom';
  className?: string;
}) {
  const gradientDir = direction === 'bottom' ? 'to top' : 'to bottom';

  const blurLayers = [
    { blur: 2, maskStart: 0, maskEnd: 40 },
    { blur: 6, maskStart: 30, maskEnd: 70 },
    { blur: 12, maskStart: 60, maskEnd: 100 },
  ];

  return (
    <div
      className={`absolute left-0 right-0 pointer-events-none ${className}`}
      style={{
        [direction]: 0,
        height,
        zIndex: 5,
      }}
    >
      {blurLayers.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: `linear-gradient(${gradientDir},
              rgba(0, 0, 0, 0) ${layer.maskStart}%,
              rgba(0, 0, 0, 1) ${layer.maskEnd}%
            )`,
            WebkitMaskImage: `linear-gradient(${gradientDir},
              rgba(0, 0, 0, 0) ${layer.maskStart}%,
              rgba(0, 0, 0, 1) ${layer.maskEnd}%
            )`,
          }}
        />
      ))}
    </div>
  );
}

export default ProgressiveBlur;
