'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { useThemeSafe } from '@/contexts/ThemeContext';

interface InfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function InfoWindow({ item, onClose }: InfoWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();
  const themeContext = useThemeSafe();
  const isSketch = themeContext?.theme === 'sketch';

  // Reset active tab when item changes
  useEffect(() => {
    if (item?.useTabs && item.tabs?.length > 0) {
      setActiveTabId(item.tabs[0].id);
    } else {
      setActiveTabId(null);
    }
  }, [item]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  // Get blocks to render - either from active tab or direct blocks
  const getBlocksToRender = (): BlockData[] => {
    if (!item) return [];

    // New block system
    if (item.useTabs && item.tabs?.length > 0 && activeTabId) {
      const activeTab = item.tabs.find(t => t.id === activeTabId);
      return activeTab?.blocks || [];
    }

    if (item.blocks?.length > 0) {
      return item.blocks;
    }

    // Legacy fallback - convert old content to blocks
    const legacyBlocks: BlockData[] = [];

    // Description as text block
    if (item.windowDescription) {
      legacyBlocks.push({
        id: 'legacy-description',
        type: 'text',
        data: { content: item.windowDescription },
        order: 0,
      });
    }

    // Details as details block
    if (item.windowDetails?.length) {
      legacyBlocks.push({
        id: 'legacy-details',
        type: 'details',
        data: { items: item.windowDetails },
        order: 1,
      });
    }

    // Links as buttons block
    if (item.windowLinks?.length) {
      legacyBlocks.push({
        id: 'legacy-links',
        type: 'buttons',
        data: {
          buttons: item.windowLinks.map(link => ({
            label: link.label,
            url: link.url,
            style: 'primary',
            newTab: true,
          })),
        },
        order: 2,
      });
    }

    return legacyBlocks;
  };

  const blocksToRender = getBlocksToRender();
  const sortedBlocks = [...blocksToRender].sort((a, b) => a.order - b.order);
  const sortedTabs = item?.tabs ? [...item.tabs].sort((a, b) => a.order - b.order) : [];

  // Function to start drag from title bar
  const startDrag = (event: React.PointerEvent) => {
    dragControls.start(event);
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-[199]"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Drag constraints container */}
          <div
            ref={constraintsRef}
            className="fixed inset-0 z-[200] pointer-events-none"
            style={{ padding: '40px' }}
          />

          {/* Centering wrapper */}
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
            style={{ padding: '40px' }}
          >
            {/* Window */}
            <motion.div
              ref={windowRef}
              className="info-window max-w-[92vw] overflow-hidden flex flex-col pointer-events-auto"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={constraintsRef}
              dragElastic={0.05}
              dragMomentum={false}
              style={{
                width: `min(${item.windowWidth || 440}px, calc(100vw - 48px))`,
                maxHeight: 'calc(100vh - 120px)',
                borderRadius: '14px',
                background: isSketch ? '#FFFFFF' : 'var(--bg-glass-elevated)',
                backdropFilter: isSketch ? 'none' : 'blur(60px) saturate(200%)',
                WebkitBackdropFilter: isSketch ? 'none' : 'blur(60px) saturate(200%)',
                boxShadow: isSketch ? '6px 6px 0 #2B4AE2' : 'var(--shadow-window)',
                border: isSketch ? '1px solid #2B4AE2' : '1px solid var(--border-glass-outer)',
              }}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.75, y: 40 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.15 } }}
              transition={prefersReducedMotion ? { duration: 0.15 } : {
                type: 'spring',
                stiffness: 350,
                damping: 28,
                mass: 0.9
              }}
            >
              {/* Title Bar - Drag Handle */}
              <div
                className="window-title-bar flex items-center h-[52px] px-4 shrink-0 relative cursor-grab active:cursor-grabbing"
                style={{
                  borderBottom: isSketch ? '1px solid #2B4AE2' : '1px solid var(--border-light)',
                  background: 'transparent',
                }}
                onPointerDown={startDrag}
              >
                {/* Traffic Lights - 44px touch targets with visual dots */}
                <div
                  className="flex items-center -ml-4 group/traffic"
                  onPointerDown={(e) => e.stopPropagation()}
                  role="group"
                  aria-label="Window controls"
                >
                  {/* Close - 44px touch target */}
                  <button
                    onClick={onClose}
                    aria-label="Close window"
                    className={isSketch ? "w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 group" : "w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"}
                  >
                    <span
                      className={isSketch ? "w-3.5 h-3.5 rounded-full flex items-center justify-center group-hover:bg-[#2B4AE2] transition-colors" : "w-[var(--traffic-size)] h-[var(--traffic-size)] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"}
                      style={isSketch ? {
                        background: '#FFFFFF',
                        border: '1.5px solid #2B4AE2',
                      } : {
                        background: `linear-gradient(180deg, var(--traffic-red) 0%, var(--traffic-red-hover) 100%)`,
                        boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                      }}
                      aria-hidden="true"
                    >
                      {isSketch ? (
                        <svg className="w-2 h-2 text-[#2B4AE2] group-hover:text-white" viewBox="0 0 8 8" fill="none" strokeWidth={3}>
                          <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg
                          className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                          viewBox="0 0 8 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 1L7 7M7 1L1 7"
                            stroke="rgba(77, 0, 0, 0.7)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Minimize - 44px touch target */}
                  <button
                    aria-label="Minimize window"
                    className={isSketch ? "w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 -ml-5 group" : "w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 -ml-5"}
                  >
                    <span
                      className={isSketch ? "w-3.5 h-3.5 rounded-full flex items-center justify-center group-hover:bg-[#2B4AE2] transition-colors" : "w-[var(--traffic-size)] h-[var(--traffic-size)] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"}
                      style={isSketch ? {
                        background: '#FFFFFF',
                        border: '1.5px solid #2B4AE2',
                      } : {
                        background: `linear-gradient(180deg, var(--traffic-yellow) 0%, var(--traffic-yellow-hover) 100%)`,
                        boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                      }}
                      aria-hidden="true"
                    >
                      {isSketch ? (
                        <svg className="w-2 h-2 text-[#2B4AE2] group-hover:text-white" viewBox="0 0 8 8" fill="none" strokeWidth={3}>
                          <path d="M1 4H7" stroke="currentColor" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg
                          className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                          viewBox="0 0 8 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 4H7"
                            stroke="rgba(100, 65, 0, 0.7)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Maximize - 44px touch target */}
                  <button
                    aria-label="Maximize window"
                    className={isSketch ? "w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 -ml-5 group" : "w-11 h-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 -ml-5"}
                  >
                    <span
                      className={isSketch ? "w-3.5 h-3.5 rounded-full flex items-center justify-center group-hover:bg-[#2B4AE2] transition-colors" : "w-[var(--traffic-size)] h-[var(--traffic-size)] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"}
                      style={isSketch ? {
                        background: '#FFFFFF',
                        border: '1.5px solid #2B4AE2',
                      } : {
                        background: `linear-gradient(180deg, var(--traffic-green) 0%, var(--traffic-green-hover) 100%)`,
                        boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                      }}
                      aria-hidden="true"
                    >
                      {isSketch ? (
                        <svg className="w-2 h-2 text-[#2B4AE2] group-hover:text-white" viewBox="0 0 8 8" fill="none" strokeWidth={3}>
                          <rect x="1" y="2.5" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                      ) : (
                        <svg
                          className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                          viewBox="0 0 8 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 2.5L4 5.5L7 2.5"
                            stroke="rgba(0, 70, 0, 0.7)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            transform="rotate(45 4 4)"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>

                {/* Centered Title */}
                <span
                  className="window-title absolute left-1/2 -translate-x-1/2 text-[13px] font-medium truncate max-w-[55%] select-none"
                  style={{ color: isSketch ? '#2B4AE2' : 'var(--text-secondary)' }}
                >
                  {item.windowTitle}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Header Section - Bolder design with larger typography */}
                <div className="flex items-start gap-5 px-6 pt-6 pb-5">
                  {/* Header Image with glow effect */}
                  <div className="relative shrink-0">
                    {/* Ambient glow behind image */}
                    <div
                      className="absolute -inset-3 rounded-[18px] opacity-60 blur-xl"
                      style={{
                        background: isSketch ? '#FFFFFF' : 'var(--accent-primary)',
                        display: isSketch ? 'none' : 'block',
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="relative w-20 h-20 rounded-[14px] overflow-hidden"
                      style={{
                        boxShadow: isSketch
                          ? '3px 3px 0 #2B4AE2'
                          : `
                        0 8px 32px -4px rgba(0, 0, 0, 0.25),
                        0 4px 12px -2px rgba(0, 0, 0, 0.15),
                        0 0 0 1px var(--border-glass-inner),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.15)
                      `,
                        borderRadius: isSketch ? '0' : '14px',
                        border: isSketch ? '1px solid #2B4AE2' : 'none',
                      }}
                    >
                      <Image
                        src={item.windowHeaderImage || item.thumbnailUrl}
                        alt={item.windowTitle}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {/* Shine overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Title + Subtitle - Bolder typography */}
                  <div className="flex flex-col min-w-0 pt-1">
                    <h2
                      className="info-window-title text-[22px] font-bold tracking-tight leading-tight"
                      style={{
                        color: isSketch ? '#2B4AE2' : 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {item.windowTitle}
                    </h2>
                    {item.windowSubtitle && (
                      <p
                        className="text-[14px] mt-1 font-medium"
                        style={{ color: isSketch ? '#2B4AE2' : 'var(--text-secondary)' }}
                      >
                        {item.windowSubtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tabs (if enabled) */}
                {item.useTabs && sortedTabs.length > 0 && (
                  <div
                    className="flex gap-1 px-6 pb-3"
                    style={{ borderBottom: isSketch ? '1px solid #2B4AE2' : '1px solid var(--border-light)' }}
                    role="tablist"
                    aria-label="Content sections"
                  >
                    {sortedTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        role="tab"
                        aria-selected={activeTabId === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{
                          background: activeTabId === tab.id
                            ? (isSketch ? '#2B4AE2' : 'var(--bg-tertiary)')
                            : 'transparent',
                          color: activeTabId === tab.id
                            ? (isSketch ? '#FFFFFF' : 'var(--accent-primary)')
                            : (isSketch ? '#2B4AE2' : 'var(--text-secondary)'),
                        }}
                      >
                        {tab.icon && <span className="mr-1.5" aria-hidden="true">{tab.icon}</span>}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Blocks Content */}
                <div
                  className="pb-5"
                  role="tabpanel"
                  id={activeTabId ? `tabpanel-${activeTabId}` : 'tabpanel-main'}
                  aria-labelledby={activeTabId ? `tab-${activeTabId}` : undefined}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTabId || 'main'}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {sortedBlocks.map((block, index) => (
                        <div
                          key={block.id}
                          style={{
                            borderTop: index > 0 ? '1px solid var(--border-light)' : undefined,
                          }}
                        >
                          <BlockRenderer block={block} />
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
