'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/ui';
import type { Desktop } from '@/types';

interface BackgroundSettingsProps {
  desktop: Desktop;
  onUpdate: (data: Partial<Desktop>) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}

export function BackgroundSettings({ desktop, onUpdate, onUpload }: BackgroundSettingsProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(() => {
    if (!desktop.backgroundOverlay) return 0;
    const match = desktop.backgroundOverlay.match(/rgba\(0,\s*0,\s*0,\s*([\d.]+)\)/);
    return match ? parseFloat(match[1]) * 100 : 0;
  });

  const handleBackgroundChange = async (url: string) => {
    await onUpdate({ backgroundUrl: url });
  };

  const handlePositionChange = async (position: string) => {
    await onUpdate({ backgroundPosition: position });
  };

  const handleOverlayChange = async (opacity: number) => {
    setOverlayOpacity(opacity);
    const overlay = opacity > 0 ? `rgba(0, 0, 0, ${opacity / 100})` : null;
    await onUpdate({ backgroundOverlay: overlay });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Background Image
        </h4>
        <ImageUpload
          value={desktop.backgroundUrl || undefined}
          onChange={handleBackgroundChange}
          onUpload={onUpload}
          aspectRatio="16/9"
        />
      </div>

      {desktop.backgroundUrl && (
        <>
          <div>
            <label className="text-[12px] font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Position
            </label>
            <div className="flex gap-2">
              {(['cover', 'contain', 'center'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handlePositionChange(pos)}
                  className="flex-1 py-2 px-3 rounded-lg text-[12px] font-medium capitalize transition-colors"
                  style={{
                    background: desktop.backgroundPosition === pos ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    color: desktop.backgroundPosition === pos ? 'white' : 'var(--text-primary)',
                    border: `1px solid ${desktop.backgroundPosition === pos ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Overlay darkness: {Math.round(overlayOpacity)}%
            </label>
            <input
              type="range"
              min="0"
              max="80"
              value={overlayOpacity}
              onChange={(e) => handleOverlayChange(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${overlayOpacity / 0.8}%, var(--border-medium) ${overlayOpacity / 0.8}%, var(--border-medium) 100%)`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
