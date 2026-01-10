'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import BlockRenderer from '@/components/blocks/BlockRenderer';

interface InfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function InfoWindow({ item, onClose, position }: InfoWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const dragControls = useDragControls();

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
              className="max-w-[92vw] overflow-hidden flex flex-col pointer-events-auto"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={constraintsRef}
              dragElastic={0.05}
              dragMomentum={false}
              style={{
                width: item.windowWidth || 440,
                maxHeight: 'calc(100vh - 120px)',
                borderRadius: '14px',
                background: `
                  linear-gradient(
                    180deg,
                    rgba(255, 255, 255, 0.92) 0%,
                    rgba(255, 255, 255, 0.85) 100%
                  )
                `,
                backdropFilter: 'blur(60px) saturate(200%)',
                WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                boxShadow: `
                  0 40px 80px -20px rgba(0, 0, 0, 0.4),
                  0 20px 40px -10px rgba(0, 0, 0, 0.25),
                  0 0 0 0.5px rgba(255, 255, 255, 0.4),
                  inset 0 0 0 0.5px rgba(255, 255, 255, 0.6),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
              }}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }}
            >
            {/* Title Bar - Drag Handle */}
            <div
              className="flex items-center h-[52px] px-4 shrink-0 relative cursor-grab active:cursor-grabbing"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
              }}
              onPointerDown={startDrag}
            >
              {/* Traffic Lights */}
              <div className="flex items-center gap-2 group/traffic" onPointerDown={(e) => e.stopPropagation()}>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"
                  style={{
                    background: 'linear-gradient(180deg, #FF6058 0%, #FF4D44 100%)',
                    boxShadow: `
                      0 0.5px 1px rgba(0, 0, 0, 0.12),
                      inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)
                    `,
                  }}
                >
                  <svg
                    className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 1L7 7M7 1L1 7"
                      stroke="rgba(77, 0, 0, 0.7)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Minimize */}
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #FFBE2E 0%, #FFB014 100%)',
                    boxShadow: `
                      0 0.5px 1px rgba(0, 0, 0, 0.12),
                      inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)
                    `,
                  }}
                >
                  <svg
                    className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 4H7"
                      stroke="rgba(100, 65, 0, 0.7)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Maximize */}
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #2ACB42 0%, #1DB934 100%)',
                    boxShadow: `
                      0 0.5px 1px rgba(0, 0, 0, 0.12),
                      inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)
                    `,
                  }}
                >
                  <svg
                    className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 8 8"
                    fill="none"
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
                </div>
              </div>

              {/* Centered Title */}
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium truncate max-w-[55%] select-none"
                style={{ color: 'rgba(0, 0, 0, 0.75)' }}
              >
                {item.windowTitle}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header Section */}
              <div className="flex items-start gap-4 px-6 pt-5 pb-4">
                {/* Header Image */}
                <div
                  className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0"
                  style={{
                    boxShadow: `
                      0 4px 16px -2px rgba(0, 0, 0, 0.15),
                      0 0 0 0.5px rgba(0, 0, 0, 0.05),
                      inset 0 0 0 0.5px rgba(255, 255, 255, 0.2)
                    `,
                  }}
                >
                  <Image
                    src={item.windowHeaderImage || item.thumbnailUrl}
                    alt={item.windowTitle}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Title + Subtitle */}
                <div className="flex flex-col min-w-0 pt-1.5">
                  <h2
                    className="text-[17px] font-semibold tracking-tight truncate leading-tight"
                    style={{ color: '#1D1D1F' }}
                  >
                    {item.windowTitle}
                  </h2>
                  {item.windowSubtitle && (
                    <p
                      className="text-[13px] mt-0.5 truncate"
                      style={{ color: '#6E6E73' }}
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
                  style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
                >
                  {sortedTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
                      style={{
                        background: activeTabId === tab.id
                          ? 'rgba(0, 122, 255, 0.1)'
                          : 'transparent',
                        color: activeTabId === tab.id
                          ? 'var(--accent-primary)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Blocks Content */}
              <div className="pb-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTabId || 'main'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {sortedBlocks.map((block, index) => (
                      <div
                        key={block.id}
                        style={{
                          borderTop: index > 0 ? '1px solid rgba(0, 0, 0, 0.06)' : undefined,
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
