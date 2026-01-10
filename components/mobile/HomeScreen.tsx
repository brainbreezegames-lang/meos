'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="fixed inset-0 flex flex-col select-none"
      style={{
        background: backgroundUrl
          ? `url(${backgroundUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status bar area */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 44px), 44px)',
          height: 'calc(env(safe-area-inset-top, 44px) + 28px)',
        }}
      >
        {/* Time (left) */}
        <span
          className="text-sm font-semibold"
          style={{
            color: 'white',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          }}
        >
          {formatTime(currentTime)}
        </span>

        {/* Status icons (right) */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={toggleControlCenter}
            className="flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span
              className="text-xs"
              style={{
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}
            >
              100%
            </span>
          </motion.button>
        </div>
      </div>

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
      <div className="flex-shrink-0">
        <MobileDock items={dockItems} onItemTap={handleDockTap} maxItems={4} />

        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <div
            className="w-32 h-1 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          />
        </div>

        {/* Safe area bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
      </div>
    </motion.div>
  );
}
