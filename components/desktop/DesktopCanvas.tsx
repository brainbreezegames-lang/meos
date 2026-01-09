'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

    // Position window near click but offset for optimal viewing
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Smart positioning: center the window but offset from the clicked item
    let x = rect.left + rect.width / 2 + 80;
    let y = rect.top + rect.height / 2;

    // Keep within viewport bounds with padding
    const windowWidth = 440;
    const windowHeight = 400;
    const padding = 40;

    if (x + windowWidth / 2 > viewportWidth - padding) {
      x = rect.left - windowWidth / 2 - 40;
    }
    if (x - windowWidth / 2 < padding) {
      x = viewportWidth / 2;
    }
    if (y + windowHeight / 2 > viewportHeight - padding) {
      y = viewportHeight - windowHeight / 2 - padding;
    }
    if (y - windowHeight / 2 < padding + 28) { // Account for menu bar
      y = windowHeight / 2 + padding + 28;
    }

    setWindowPosition({ x, y });
    setSelectedItem(item);
  };

  // Build background styles
  const hasBackground = desktop.backgroundUrl;
  const backgroundStyle = hasBackground
    ? {
        backgroundImage: `url(${desktop.backgroundUrl})`,
        backgroundSize: desktop.backgroundPosition || 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  return (
    <motion.div
      className="fixed inset-0 pt-[28px]"
      style={backgroundStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Default gradient background if no image */}
      {!hasBackground && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(
                ellipse 120% 80% at 50% 0%,
                #7B68EE 0%,
                #6B5DD3 25%,
                #5C4EC2 50%,
                #4A3FB0 75%,
                #3D2D8C 100%
              )
            `,
          }}
        />
      )}

      {/* Ambient lighting overlay */}
      <div
        className="absolute inset-0 pointer-events-none -z-5"
        style={{
          background: `
            radial-gradient(
              ellipse 100% 60% at 50% 0%,
              rgba(255, 255, 255, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 80% 40% at 0% 100%,
              rgba(255, 200, 150, 0.05) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 80% 40% at 100% 100%,
              rgba(150, 200, 255, 0.05) 0%,
              transparent 50%
            )
          `,
        }}
      />

      {/* Custom overlay if set */}
      {desktop.backgroundOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: desktop.backgroundOverlay }}
        />
      )}

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      {/* Desktop Items Container */}
      <div className="relative w-full h-full">
        {desktop.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              delay: 0.1 + index * 0.05
            }}
          >
            <DesktopItem
              item={item}
              onClick={(e: React.MouseEvent) => handleItemClick(item, e)}
              isEditing={isEditing}
            />
          </motion.div>
        ))}
      </div>

      {/* Info Window */}
      <InfoWindow
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        position={windowPosition}
      />
    </motion.div>
  );
}
