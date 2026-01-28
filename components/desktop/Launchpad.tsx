'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, FileText, Folder, Image as ImageIcon, Link2, Play, Download, Code, Presentation, Gamepad2 } from 'lucide-react';
import { SPRING, DURATION, getStaggerDelayCapped } from '@/lib/animations';
import { playSound } from '@/lib/sounds';

// File type to icon mapping
const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  note: <FileText size={32} strokeWidth={1.5} />,
  'case-study': <Presentation size={32} strokeWidth={1.5} />,
  folder: <Folder size={32} strokeWidth={1.5} />,
  image: <ImageIcon size={32} strokeWidth={1.5} />,
  link: <Link2 size={32} strokeWidth={1.5} />,
  embed: <Play size={32} strokeWidth={1.5} />,
  download: <Download size={32} strokeWidth={1.5} />,
  game: <Gamepad2 size={32} strokeWidth={1.5} />,
  cv: <Code size={32} strokeWidth={1.5} />,
};

// File type to gradient mapping for beautiful icon backgrounds
const FILE_TYPE_GRADIENTS: Record<string, string> = {
  note: 'linear-gradient(135deg, #FFE066 0%, #FFD93D 50%, #F4C430 100%)',
  'case-study': 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)',
  folder: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
  image: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
  link: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #DB2777 100%)',
  embed: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
  download: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 50%, #0284C7 100%)',
  game: 'linear-gradient(135deg, #F87171 0%, #EF4444 50%, #DC2626 100%)',
  cv: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #16A34A 100%)',
};

interface LaunchpadItem {
  id: string;
  type: string;
  title: string;
  thumbnailUrl?: string;
}

interface LaunchpadProps {
  isOpen: boolean;
  onClose: () => void;
  items: LaunchpadItem[];
  onItemClick: (itemId: string, itemType: string) => void;
}

export function Launchpad({ isOpen, onClose, items, onItemClick }: LaunchpadProps) {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => item.title.toLowerCase().includes(query));
  }, [items, searchQuery]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleItemClick = useCallback((item: LaunchpadItem) => {
    playSound('bubble');
    onItemClick(item.id, item.type);
    onClose();
  }, [onItemClick, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9000] flex flex-col items-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop with heavy blur - macOS style */}
          <motion.div
            className="absolute inset-0"
            initial={{ backdropFilter: 'blur(0px) saturate(100%)' }}
            animate={{ backdropFilter: 'blur(80px) saturate(180%)' }}
            exit={{ backdropFilter: 'blur(0px) saturate(100%)' }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.4 }}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              WebkitBackdropFilter: 'blur(80px) saturate(180%)',
            }}
          />

          {/* Top gradient overlay for depth */}
          <div
            className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
            }}
          />

          {/* Search Bar */}
          <motion.div
            className="relative z-10 mt-20 mb-12"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : SPRING.smooth}
          >
            <div
              className="relative flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                minWidth: 280,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder-white/50 text-base w-48 font-medium"
                autoFocus
                style={{
                  caretColor: 'rgba(255, 255, 255, 0.8)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={14} stroke="rgba(255, 255, 255, 0.6)" />
                </button>
              )}
            </div>
          </motion.div>

          {/* App Grid */}
          <motion.div
            className="relative z-10 flex-1 w-full max-w-5xl px-12 pb-32 overflow-y-auto scrollbar-hide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            {filteredItems.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-64 text-white/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FileText size={48} strokeWidth={1} className="mb-4 opacity-40" />
                <p className="text-lg font-medium">No items found</p>
                <p className="text-sm opacity-60">Try a different search term</p>
              </motion.div>
            ) : (
              <div
                className="grid gap-8 justify-items-center"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  maxWidth: 800,
                  margin: '0 auto',
                }}
              >
                {filteredItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.1 }
                        : {
                            ...SPRING.bouncy,
                            delay: getStaggerDelayCapped(index, 0.03, 0.3),
                          }
                    }
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Icon Container */}
                    <div
                      className="relative w-[72px] h-[72px] rounded-[18px] flex items-center justify-center overflow-hidden"
                      style={{
                        background: item.thumbnailUrl
                          ? `url(${item.thumbnailUrl}) center/cover`
                          : FILE_TYPE_GRADIENTS[item.type] || FILE_TYPE_GRADIENTS.note,
                        boxShadow: hoveredId === item.id
                          ? '0 12px 40px -8px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2)'
                          : '0 8px 24px -4px rgba(0, 0, 0, 0.3)',
                        transition: 'box-shadow 0.2s ease-out',
                      }}
                    >
                      {/* Icon or overlay for images */}
                      {!item.thumbnailUrl && (
                        <div className="text-white drop-shadow-lg">
                          {FILE_TYPE_ICONS[item.type] || FILE_TYPE_ICONS.note}
                        </div>
                      )}

                      {/* Shine effect on hover */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredId === item.id ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        }}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="text-center text-[11px] font-medium leading-tight max-w-[90px] line-clamp-2"
                      style={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {item.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Bottom page dots indicator (decorative for now) */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
              }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            />
          </motion.div>

          {/* Close hint */}
          <motion.p
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Press ESC or click outside to close
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Launchpad Dock Icon component - the rocket grid icon
export function LaunchpadDockIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 3x3 grid of rounded squares - macOS Launchpad style */}
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="10" y="3" width="5" height="5" rx="1" />
      <rect x="17" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="10" width="5" height="5" rx="1" />
      <rect x="10" y="10" width="5" height="5" rx="1" />
      <rect x="17" y="10" width="5" height="5" rx="1" />
      <rect x="3" y="17" width="5" height="5" rx="1" />
      <rect x="10" y="17" width="5" height="5" rx="1" />
      <rect x="17" y="17" width="5" height="5" rx="1" />
    </svg>
  );
}
