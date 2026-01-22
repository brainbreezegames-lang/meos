'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';

interface InfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function InfoWindow({ item, onClose }: InfoWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();
  const theme = useWidgetTheme();

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

  // Derive display flags from theme properties
  const showAmbientGlow = theme.colors.blur !== 'none';

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
              dragConstraints={false}
              dragElastic={0}
              dragMomentum={false}
              style={{
                width: `min(${item.windowWidth || 440}px, calc(100vw - 48px))`,
                maxHeight: 'calc(100vh - 120px)',
                borderRadius: theme.radii.card,
                background: theme.colors.paper,
                // Use backdrop filter only if strictly needed by theme (standard), otherwise none
                backdropFilter: theme.colors.paper.startsWith('#') ? 'none' : 'blur(60px) saturate(200%)',
                WebkitBackdropFilter: theme.colors.paper.startsWith('#') ? 'none' : 'blur(60px) saturate(200%)',
                boxShadow: 'var(--shadow-window)',
                border: `1px solid ${theme.colors.border}`,
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
                  borderBottom: `1px solid ${theme.colors.border}`,
                  background: theme.colors.paper,
                }}
                onPointerDown={startDrag}
              >
                {/* Traffic Lights - unified 12px design */}
                <div
                  className="flex items-center group/traffic"
                  style={{ gap: 'var(--window-traffic-gap, 8px)' }}
                  onPointerDown={(e) => e.stopPropagation()}
                  role="group"
                  aria-label="Window controls"
                >
                  {/* Close */}
                  <button
                    onClick={onClose}
                    aria-label="Close window"
                    className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      width: 'var(--window-traffic-size, 12px)',
                      height: 'var(--window-traffic-size, 12px)',
                      borderRadius: '50%',
                      background: 'var(--color-traffic-close, #ff5f57)',
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Minimize */}
                  <button
                    aria-label="Minimize window"
                    className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      width: 'var(--window-traffic-size, 12px)',
                      height: 'var(--window-traffic-size, 12px)',
                      borderRadius: '50%',
                      background: 'var(--color-traffic-minimize, #ffbd2e)',
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Maximize */}
                  <button
                    aria-label="Maximize window"
                    className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{
                      width: 'var(--window-traffic-size, 12px)',
                      height: 'var(--window-traffic-size, 12px)',
                      borderRadius: '50%',
                      background: 'var(--color-traffic-maximize, #28c840)',
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                      <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                    </svg>
                  </button>
                </div>

                {/* Centered Title */}
                <span
                  className="window-title absolute left-1/2 -translate-x-1/2 text-[13px] font-medium truncate max-w-[55%] select-none"
                  style={{ color: theme.colors.text.primary }}
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
                        background: theme.colors.text.accent,
                        display: showAmbientGlow ? 'block' : 'none',
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="relative w-20 h-20 rounded-[14px] overflow-hidden"
                      style={{
                        boxShadow: `4px 4px 0 rgba(0,0,0,0.08)`,
                        borderRadius: '14px',
                        border: `1px solid ${theme.colors.border}`,
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
                        color: theme.colors.text.primary,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {item.windowTitle}
                    </h2>
                    {item.windowSubtitle && (
                      <p
                        className="text-[14px] mt-1 font-medium"
                        style={{ color: theme.colors.text.secondary }}
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
                    style={{ borderBottom: `1px solid ${theme.colors.border}` }}
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
                            ? 'rgba(0,0,0,0.05)'
                            : 'transparent',
                          color: activeTabId === tab.id
                            ? theme.colors.text.primary
                            : theme.colors.text.secondary,
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
