'use client';

import { useState } from 'react';
import { DesktopItem } from './DesktopItem';
import { InfoWindow } from './InfoWindow';
import type { DesktopItem as DesktopItemType, Desktop } from '@/types';

interface DesktopCanvasProps {
  desktop: Desktop;
  isEditing?: boolean;
  onItemMove?: (id: string, x: number, y: number) => void;
}

export function DesktopCanvas({ desktop, isEditing = false, onItemMove: _onItemMove }: DesktopCanvasProps) {
  const [selectedItem, setSelectedItem] = useState<DesktopItemType | null>(null);
  const [windowPosition, setWindowPosition] = useState<{ x: number; y: number } | undefined>();

  const handleItemClick = (item: DesktopItemType, event: React.MouseEvent) => {
    if (isEditing) return;

    // Position window near click but offset
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = Math.min(Math.max(rect.left + 100, 250), window.innerWidth - 250);
    const y = Math.min(Math.max(rect.top, 200), window.innerHeight - 200);

    setWindowPosition({ x, y });
    setSelectedItem(item);
  };

  const backgroundStyle = desktop.backgroundUrl
    ? {
        backgroundImage: `url(${desktop.backgroundUrl})`,
        backgroundSize: desktop.backgroundPosition,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)',
      };

  return (
    <div
      className="fixed inset-0 pt-7"
      style={backgroundStyle}
    >
      {/* Overlay */}
      {desktop.backgroundOverlay && (
        <div
          className="absolute inset-0"
          style={{ background: desktop.backgroundOverlay }}
        />
      )}

      {/* Desktop Items */}
      <div className="relative w-full h-full">
        {desktop.items.map((item) => (
          <DesktopItem
            key={item.id}
            item={item}
            onClick={(e: React.MouseEvent) => handleItemClick(item, e)}
            isEditing={isEditing}
          />
        ))}
      </div>

      {/* Info Window */}
      <InfoWindow
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        position={windowPosition}
      />
    </div>
  );
}
