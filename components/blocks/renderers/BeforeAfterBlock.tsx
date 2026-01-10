'use client';

import { useState, useRef } from 'react';

interface BeforeAfterBlockData {
  before: {
    image: string;
    label?: string;
  };
  after: {
    image: string;
    label?: string;
  };
  style: 'slider' | 'side-by-side' | 'stacked';
}

interface BeforeAfterBlockRendererProps {
  data: Record<string, unknown>;
}

export default function BeforeAfterBlockRenderer({ data }: BeforeAfterBlockRendererProps) {
  const { before, after, style = 'side-by-side' } = data as unknown as BeforeAfterBlockData;
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!before?.image || !after?.image) return null;

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, position)));
  };

  if (style === 'slider') {
    return (
      <div className="px-5 py-3">
        <div
          ref={containerRef}
          className="relative aspect-video rounded-lg overflow-hidden cursor-ew-resize select-none"
          onMouseMove={handleSliderMove}
          onTouchMove={handleSliderMove}
        >
          {/* After image (background) */}
          <img
            src={after.image}
            alt={after.label || 'After'}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Before image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={before.image}
              alt={before.label || 'Before'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ width: containerRef.current?.offsetWidth || '100%' }}
            />
          </div>

          {/* Slider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-[12px]">↔</span>
            </div>
          </div>

          {/* Labels */}
          {before.label && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded text-[11px] font-medium bg-black/50 text-white">
              {before.label}
            </div>
          )}
          {after.label && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded text-[11px] font-medium bg-black/50 text-white">
              {after.label}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (style === 'stacked') {
    return (
      <div className="px-5 py-3">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <img
              src={before.image}
              alt={before.label || 'Before'}
              className="w-full rounded-lg"
            />
            {before.label && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded text-[11px] font-medium bg-black/50 text-white">
                {before.label}
              </div>
            )}
          </div>
          <div className="relative">
            <img
              src={after.image}
              alt={after.label || 'After'}
              className="w-full rounded-lg"
            />
            {after.label && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded text-[11px] font-medium bg-black/50 text-white">
                {after.label}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Side by side (default)
  return (
    <div className="px-5 py-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <img
            src={before.image}
            alt={before.label || 'Before'}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-[11px] font-medium bg-black/50 text-white">
            {before.label || 'Before'}
          </div>
        </div>
        <div className="relative">
          <img
            src={after.image}
            alt={after.label || 'After'}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-[11px] font-medium bg-black/50 text-white">
            {after.label || 'After'}
          </div>
        </div>
      </div>
    </div>
  );
}
