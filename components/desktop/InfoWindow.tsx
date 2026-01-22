'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { TrafficLights } from './TrafficLights';
import { WINDOW, TITLE_BAR, CONTENT, ANIMATION } from './windowStyles';

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
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
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
            {/* Window - uses unified windowStyles */}
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
                borderRadius: WINDOW.borderRadius,
                background: WINDOW.background,
                boxShadow: WINDOW.shadow,
                border: WINDOW.border,
              }}
              initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
              animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
              exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
              transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
            >
              {/* Title Bar - uses unified TITLE_BAR */}
              <div
                className="window-title-bar flex items-center shrink-0 relative cursor-grab active:cursor-grabbing"
                style={{
                  height: TITLE_BAR.height,
                  paddingLeft: TITLE_BAR.paddingX,
                  paddingRight: TITLE_BAR.paddingX,
                  borderBottom: TITLE_BAR.borderBottom,
                  background: TITLE_BAR.background,
                }}
                onPointerDown={startDrag}
              >
                {/* Window Controls - unified TrafficLights component */}
                <TrafficLights
                  onClose={onClose}
                  showAll={false}
                />

                {/* Centered Title */}
                <span
                  className="window-title absolute left-1/2 -translate-x-1/2 font-medium truncate max-w-[55%] select-none"
                  style={{
                    fontSize: TITLE_BAR.titleFontSize,
                    fontWeight: TITLE_BAR.titleFontWeight,
                    color: TITLE_BAR.titleColor,
                    letterSpacing: TITLE_BAR.titleLetterSpacing,
                    opacity: TITLE_BAR.titleOpacityActive,
                  }}
                >
                  {item.windowTitle}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Header Section */}
                <div
                  className="flex items-start"
                  style={{
                    gap: CONTENT.gap,
                    padding: CONTENT.padding,
                    paddingBottom: CONTENT.padding * 0.75,
                  }}
                >
                  {/* Header Image */}
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{
                      width: CONTENT.headerImageSize,
                      height: CONTENT.headerImageSize,
                      borderRadius: CONTENT.headerImageRadius,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                  <div className="flex flex-col min-w-0 pt-1">
                    <h2
                      className="info-window-title font-semibold leading-tight"
                      style={{
                        fontSize: CONTENT.titleFontSize,
                        fontWeight: CONTENT.titleFontWeight,
                        color: CONTENT.titleColor,
                        letterSpacing: CONTENT.titleLetterSpacing,
                      }}
                    >
                      {item.windowTitle}
                    </h2>
                    {item.windowSubtitle && (
                      <p
                        className="mt-1"
                        style={{
                          fontSize: CONTENT.subtitleFontSize,
                          color: CONTENT.subtitleColor,
                        }}
                      >
                        {item.windowSubtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tabs (if enabled) */}
                {item.useTabs && sortedTabs.length > 0 && (
                  <div
                    className="flex gap-1"
                    style={{
                      padding: `0 ${CONTENT.padding}px 12px`,
                      borderBottom: `1px solid ${CONTENT.borderColor}`,
                    }}
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
                        className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={{
                          background: activeTabId === tab.id
                            ? 'rgba(0,0,0,0.04)'
                            : 'transparent',
                          color: activeTabId === tab.id
                            ? CONTENT.titleColor
                            : CONTENT.mutedColor,
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
                            borderTop: index > 0 ? `1px solid ${CONTENT.borderColor}` : undefined,
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
