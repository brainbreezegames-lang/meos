'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppGrid } from './AppGrid';
import { MobileDock } from './MobileDock';
import { useMobileNav } from '@/contexts/MobileNavigationContext';
import { DesktopItem, DockItem } from '@/types';

interface HomeScreenProps {
  items: DesktopItem[];
  dockItems: DockItem[];
  backgroundUrl?: string;
  onDockItemTap?: (item: DockItem) => void;
  onAppLongPress?: (item: DesktopItem) => void;
}

export function HomeScreen({
  items,
  dockItems,
  backgroundUrl,
  onDockItemTap,
  onAppLongPress,
}: HomeScreenProps) {
  const { openApp, toggleControlCenter } = useMobileNav();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAppTap = (item: DesktopItem) => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    openApp(item);
  };

  const handleDockTap = (item: DockItem) => {
    if (item.actionType === 'url') {
      window.open(item.actionValue, '_blank');
    } else if (item.actionType === 'email') {
      window.location.href = `mailto:${item.actionValue}`;
    } else if (item.actionType === 'app') {
      // Find matching desktop item
      const app = items.find(i => i.id === item.actionValue || i.label === item.label);
      if (app) {
        openApp(app);
      }
    }
    onDockItemTap?.(item);
  };

  const handleAppLongPress = (item: DesktopItem) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onAppLongPress?.(item);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '');
  };

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col select-none"
      role="main"
      aria-label="Home screen"
      style={{
        background: backgroundUrl
          ? `url(${backgroundUrl}) center/cover no-repeat`
          : 'linear-gradient(145deg, var(--bg-solid) 0%, #1a1a2e 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status bar area */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)',
          height: 'calc(env(safe-area-inset-top, 44px) + 28px)',
        }}
        role="banner"
      >
        {/* Time (left) */}
        <time
          className="text-sm font-semibold"
          style={{
            color: 'var(--text-on-image)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            fontFamily: 'var(--font-body)',
          }}
          aria-label={`Current time: ${formatTime(currentTime)}`}
        >
          {formatTime(currentTime)}
        </time>

        {/* Status icons (right) */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={toggleControlCenter}
            aria-label="Open Control Center"
            className="flex items-center gap-1 px-2 py-1 rounded-full min-h-[44px] min-w-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            style={{ background: 'rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-on-image)' }} aria-hidden="true">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span
              className="text-xs"
              style={{
                color: 'var(--text-on-image)',
                fontFamily: 'var(--font-body)',
              }}
            >
              100%
            </span>
          </motion.button>
        </div>
      </header>

      {/* App grid */}
      <AppGrid
        items={items}
        onAppTap={handleAppTap}
        onAppLongPress={handleAppLongPress}
        isEditing={isEditing}
        columns={4}
        rows={6}
      />

      {/* Dock */}
      <footer className="flex-shrink-0">
        <MobileDock items={dockItems} onItemTap={handleDockTap} maxItems={4} />

        {/* Home indicator */}
        <div className="flex justify-center pb-2" aria-hidden="true">
          <div
            className="w-32 h-1 rounded-full"
            style={{ background: 'var(--text-on-image)', opacity: 0.3 }}
          />
        </div>

        {/* Safe area bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
      </footer>
    </motion.div>
  );
}
