'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LANDING_PAGE_ICONS, USE_IMAGE_ICONS } from '@/lib/icons/config';
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

export default function LandingDock({ onOpenWindow }: DockProps) {
  const dockItems = [
    { id: 'welcome', Icon: FinderIcon, imgSrc: LANDING_PAGE_ICONS.dock.finder, label: 'Finder', isActive: true },
    { id: 'features', Icon: SafariIcon, imgSrc: LANDING_PAGE_ICONS.dock.safari, label: 'Safari' },
    { id: 'examples', Icon: PhotosIcon, imgSrc: LANDING_PAGE_ICONS.dock.photos, label: 'Photos' },
    { id: 'pricing', Icon: NotesIcon, imgSrc: LANDING_PAGE_ICONS.dock.notes, label: 'Notes' },
    { id: null, Icon: MailIcon, imgSrc: LANDING_PAGE_ICONS.dock.mail, label: 'Mail' },
    { id: null, Icon: MessagesIcon, imgSrc: LANDING_PAGE_ICONS.dock.messages, label: 'Messages' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        className="flex items-end gap-1 px-3 py-2"
        style={{
          background: 'rgba(30, 28, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {dockItems.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => item.id && onOpenWindow(item.id)}
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
              {USE_IMAGE_ICONS ? (
                <img src={item.imgSrc} alt={item.label} className="w-full h-full object-cover" />
              ) : (
                <item.Icon size={48} />
              )}
            </div>

            {/* Active indicator */}
            {item.isActive && (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
            )}
          </motion.button>
        ))}

        {/* Separator */}
        <div className="w-px h-10 bg-white/20 mx-2 self-center" />

        {/* CTA Button */}
        <motion.button
          className="px-5 h-12 rounded-xl text-white text-sm font-semibold"
          style={{
            background: 'linear-gradient(180deg, #F97316 0%, #EA580C 100%)',
            boxShadow: '0 4px 16px rgba(234,88,12,0.4)',
          }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Get Started
        </motion.button>
      </motion.div>

      {/* Dock reflection */}
      <div className="flex justify-center mt-2">
        <div
          className="w-40 h-1 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
        />
      </div>
    </div>
  );
}
