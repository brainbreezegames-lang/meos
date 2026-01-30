'use client';

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, FileText, Folder, Image as ImageIcon, Link2, Play, Download, Presentation, Gamepad2, Sparkles, Receipt, Kanban, Table } from 'lucide-react';
import { SPRING, DURATION } from '@/lib/animations';
import { playSound } from '@/lib/sounds';

// Modern, sophisticated icon designs with subtle gradients
const FILE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; accent: string }> = {
  note: {
    icon: <FileText size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
    accent: '#F59E0B',
  },
  'case-study': {
    icon: <Presentation size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #EDE9FE 0%, #DDD6FE 100%)',
    accent: '#8B5CF6',
  },
  folder: {
    icon: <Folder size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #DBEAFE 0%, #BFDBFE 100%)',
    accent: '#3B82F6',
  },
  image: {
    icon: <ImageIcon size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #D1FAE5 0%, #A7F3D0 100%)',
    accent: '#10B981',
  },
  link: {
    icon: <Link2 size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #FCE7F3 0%, #FBCFE8 100%)',
    accent: '#EC4899',
  },
  embed: {
    icon: <Play size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #FFEDD5 0%, #FED7AA 100%)',
    accent: '#F97316',
  },
  download: {
    icon: <Download size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #E0F2FE 0%, #BAE6FD 100%)',
    accent: '#0EA5E9',
  },
  game: {
    icon: <Gamepad2 size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #FEE2E2 0%, #FECACA 100%)',
    accent: '#EF4444',
  },
  cv: {
    icon: <Sparkles size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #DCFCE7 0%, #BBF7D0 100%)',
    accent: '#22C55E',
  },
  board: {
    icon: <Kanban size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #E0E7FF 0%, #C7D2FE 100%)',
    accent: '#6366F1',
  },
  sheet: {
    icon: <Table size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #D1FAE5 0%, #A7F3D0 100%)',
    accent: '#059669',
  },
  invoice: {
    icon: <Receipt size={28} strokeWidth={1.8} />,
    bg: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
    accent: '#D97706',
  },
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

// App Icon Component - macOS style with proper shadows and reflections
const AppIcon = React.memo(({
  item,
  isHovered,
  onClick,
  onHover,
  index,
  prefersReducedMotion,
}: {
  item: LaunchpadItem;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  index: number;
  prefersReducedMotion: boolean | null;
}) => {
  const config = FILE_TYPE_CONFIG[item.type] || FILE_TYPE_CONFIG.note;
  const hasImage = !!item.thumbnailUrl;

  return (
    <motion.button
      className="flex flex-col items-center gap-3 group focus:outline-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.1 }
          : {
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: Math.min(index * 0.02, 0.2),
            }
      }
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ width: 88 }}
    >
      {/* Icon wrapper with lift effect */}
      <motion.div
        animate={{
          y: isHovered ? -8 : 0,
          scale: isHovered ? 1.08 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="relative"
      >
        {/* Shadow layer */}
        <motion.div
          className="absolute inset-0 rounded-[22%]"
          animate={{
            opacity: isHovered ? 0.4 : 0.2,
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? 8 : 4,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            background: hasImage ? 'rgba(0,0,0,0.5)' : config.accent,
            filter: 'blur(16px)',
          }}
        />

        {/* Main icon container - macOS superellipse */}
        <div
          className="relative w-16 h-16 flex items-center justify-center overflow-hidden"
          style={{
            borderRadius: '22%',
            background: hasImage ? `url(${item.thumbnailUrl}) center/cover` : config.bg,
            boxShadow: `
              0 1px 2px rgba(0,0,0,0.06),
              0 2px 4px rgba(0,0,0,0.06),
              0 4px 8px rgba(0,0,0,0.06),
              inset 0 1px 0 rgba(255,255,255,0.6),
              inset 0 -1px 0 rgba(0,0,0,0.04)
            `,
          }}
        >
          {/* Icon */}
          {!hasImage && (
            <div style={{ color: config.accent }}>
              {config.icon}
            </div>
          )}

          {/* Glossy overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)',
              borderRadius: 'inherit',
            }}
          />

          {/* Hover shine */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)',
              borderRadius: 'inherit',
            }}
          />
        </div>
      </motion.div>

      {/* Label */}
      <motion.span
        className="text-[11px] font-medium text-center leading-tight line-clamp-2 px-1"
        animate={{ opacity: isHovered ? 1 : 0.9 }}
        style={{
          color: 'rgba(255,255,255,0.95)',
          textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          maxWidth: 80,
          letterSpacing: '-0.01em',
        }}
      >
        {item.title}
      </motion.span>
    </motion.button>
  );
});

AppIcon.displayName = 'AppIcon';

export function Launchpad({ isOpen, onClose, items, onItemClick }: LaunchpadProps) {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => item.title.toLowerCase().includes(query));
  }, [items, searchQuery]);

  // Close on escape, focus search on open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus search after animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setHoveredId(null);
    }
  }, [isOpen]);

  const handleItemClick = useCallback((item: LaunchpadItem) => {
    playSound('bubble');
    onItemClick(item.id, item.type);
    onClose();
  }, [onItemClick, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9000] flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.25 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop - sophisticated blur */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(30, 27, 24, 0.75)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
            }}
          />

          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
            }}
          />

          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center w-full h-full pt-16 pb-24 overflow-hidden">

            {/* Search Bar - Spotlight style */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: `
                    0 2px 8px rgba(0,0,0,0.2),
                    0 8px 24px rgba(0,0,0,0.15),
                    inset 0 1px 0 rgba(255,255,255,0.08)
                  `,
                  minWidth: 240,
                }}
              >
                <Search size={16} strokeWidth={2} className="text-white/50 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white/90 placeholder-white/40 text-sm w-44 font-medium"
                  style={{ caretColor: 'rgba(255,255,255,0.6)' }}
                />
              </div>
            </motion.div>

            {/* Grid container with scroll */}
            <motion.div
              className="flex-1 w-full overflow-y-auto overflow-x-hidden px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 48px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 48px), transparent 100%)',
              }}
            >
              {filteredItems.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-48 text-white/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search size={40} strokeWidth={1.2} className="mb-3 opacity-40" />
                  <p className="text-sm font-medium">No results for &ldquo;{searchQuery}&rdquo;</p>
                </motion.div>
              ) : (
                <div
                  className="grid justify-center gap-x-4 gap-y-6 mx-auto pt-4 pb-8"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, 88px)',
                    maxWidth: 640,
                  }}
                >
                  {filteredItems.map((item, index) => (
                    <AppIcon
                      key={item.id}
                      item={item}
                      index={index}
                      isHovered={hoveredId === item.id}
                      onClick={() => handleItemClick(item)}
                      onHover={(hovered) => setHoveredId(hovered ? item.id : null)}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Page indicator dots */}
            <motion.div
              className="flex items-center gap-1.5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Launchpad Dock Icon - refined grid
export function LaunchpadDockIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      {/* 3x3 grid of soft rounded squares */}
      <rect x="3" y="3" width="4.5" height="4.5" rx="1.2" />
      <rect x="9.75" y="3" width="4.5" height="4.5" rx="1.2" />
      <rect x="16.5" y="3" width="4.5" height="4.5" rx="1.2" />
      <rect x="3" y="9.75" width="4.5" height="4.5" rx="1.2" />
      <rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1.2" />
      <rect x="16.5" y="9.75" width="4.5" height="4.5" rx="1.2" />
      <rect x="3" y="16.5" width="4.5" height="4.5" rx="1.2" />
      <rect x="9.75" y="16.5" width="4.5" height="4.5" rx="1.2" />
      <rect x="16.5" y="16.5" width="4.5" height="4.5" rx="1.2" />
    </svg>
  );
}
