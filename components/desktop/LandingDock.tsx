'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLandingIcons } from '@/lib/hooks/useLandingIcons';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  MessagesIcon,
  NotesIcon,
} from '@/lib/icons';

interface DockProps {
  onOpenWindow: (id: string) => void;
}

// Map dock icon IDs to their API icon IDs and default components
const DOCK_ICON_MAP = [
  { windowId: 'welcome', iconId: 'dock-finder', Icon: FinderIcon, label: 'Welcome', isActive: true },
  { windowId: 'features', iconId: 'dock-safari', Icon: SafariIcon, label: 'Features' },
  { windowId: 'examples', iconId: 'dock-photos', Icon: PhotosIcon, label: 'Examples' },
  { windowId: 'pricing', iconId: 'dock-notes', Icon: NotesIcon, label: 'Pricing' },
  { windowId: 'reviews', iconId: 'dock-mail', Icon: MailIcon, label: 'Reviews' },
  { windowId: 'help', iconId: 'dock-messages', Icon: MessagesIcon, label: 'Help' },
];

export default function LandingDock({ onOpenWindow }: DockProps) {
  const { icons, loading } = useLandingIcons();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        className="flex items-end gap-2 px-4 py-3"
        style={{
          background: 'var(--bg-dock)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: '18px',
          boxShadow: '0 0 0 0.5px var(--border-glass-outer), 0 8px 32px rgba(0,0,0,0.2)',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {DOCK_ICON_MAP.map((item, index) => {
          const customIconUrl = icons[item.iconId];

          return (
            <motion.button
              key={index}
              onClick={() => onOpenWindow(item.windowId)}
              className="relative group"
              whileHover={{ y: -12, scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap"
                  style={{ background: 'rgba(0,0,0,0.8)' }}
                >
                  {item.label}
                </div>
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl overflow-hidden"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              >
                {loading ? (
                  // Show default while loading
                  <item.Icon size={48} />
                ) : customIconUrl ? (
                  // Show custom icon if available
                  <img
                    src={customIconUrl}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If custom icon fails to load, hide it and show default
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  // Show default SVG icon
                  <item.Icon size={48} />
                )}
              </div>

              {/* Active indicator */}
              {item.isActive && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
              )}
            </motion.button>
          );
        })}

        {/* Separator */}
        <div
          className="w-px h-10 mx-2 self-center"
          style={{ background: 'var(--border-glass-inner)' }}
        />

        {/* CTA Button */}
        <motion.button
          onClick={() => onOpenWindow('signup')}
          className="px-5 h-12 rounded-xl text-sm font-semibold"
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-solid)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
