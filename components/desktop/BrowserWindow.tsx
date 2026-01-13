'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES } from '@/types/blocks';

interface BrowserWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

export function BrowserWindow({ window: windowInstance, item }: BrowserWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const windowRef = useRef<HTMLDivElement>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [blockPickerCategory, setBlockPickerCategory] = useState<string>('text');

  const isOwner = context?.isOwner ?? false;
  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';
  const prefersReducedMotion = useReducedMotion();

  // Browser tabs - use item tabs if available, otherwise create a single tab
  const browserTabs = item.useTabs && item.tabs?.length > 0
    ? item.tabs.map(t => ({ id: t.id, label: t.label, url: '#', favicon: item.thumbnailUrl }))
    : [{ id: 'main', label: item.windowTitle, url: '#', favicon: item.thumbnailUrl }];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        windowContext.closeWindow(windowInstance.id);
      }
    },
    [windowContext, windowInstance.id, isActive]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Get blocks to render
  const getBlocksToRender = (): BlockData[] => {
    if (!item) return [];

    if (item.useTabs && item.tabs?.length > 0) {
      const activeTab = item.tabs[activeTabIndex];
      return activeTab?.blocks || [];
    }

    return item.blocks || [];
  };

  const blocksToRender = getBlocksToRender();
  const sortedBlocks = [...blocksToRender].sort((a, b) => a.order - b.order);

  // Handle block updates
  const handleBlockUpdate = (blockId: string, data: Record<string, unknown>) => {
    if (!item || !context) return;
    context.updateBlock(item.id, blockId, { data });
  };

  const handleBlockDelete = (blockId: string) => {
    if (!item || !context) return;
    context.deleteBlock(item.id, blockId);
  };

  const handleAddBlock = (type: string) => {
    if (!item || !context) return;
    const blockDef = BLOCK_DEFINITIONS.find(b => b.type === type);
    if (!blockDef) return;
    context.addBlock(item.id, {
      type,
      data: blockDef.defaultData,
      order: sortedBlocks.length,
    });
    setShowBlockPicker(false);
  };

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const windowWidth = Math.max(item.windowWidth || 560, 480);

  return (
    <>
      {/* Window container - handles centering */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        style={{
          padding: isMaximized ? '40px' : '60px',
          paddingTop: isMaximized ? '50px' : '60px',
        }}
      >
        {/* Browser Window */}
        <motion.div
          ref={windowRef}
          className="overflow-hidden flex flex-col pointer-events-auto relative"
          onClick={handleWindowClick}
          drag={!isMaximized}
          dragConstraints={{ top: -200, left: -300, right: 300, bottom: 200 }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{
            zIndex: windowInstance.zIndex + 200,
            width: isMaximized ? '100%' : windowWidth,
            maxWidth: isMaximized ? '100%' : '90vw',
            height: isMaximized ? '100%' : 'auto',
            maxHeight: isMaximized ? '100%' : 'calc(100vh - 180px)',
            borderRadius: isMaximized ? 'var(--radius-lg)' : 'var(--radius-window)',
            background: 'var(--bg-glass-elevated)',
            backdropFilter: 'var(--blur-glass)',
            WebkitBackdropFilter: 'var(--blur-glass)',
            boxShadow: isActive
              ? '0 25px 80px -12px rgba(0, 0, 0, 0.5), 0 12px 40px -8px rgba(0, 0, 0, 0.35)'
              : 'var(--shadow-lg)',
            border: 'var(--border-width) solid var(--border-glass-outer)',
            opacity: isActive ? 1 : 0.95,
          }}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
        {/* Browser Chrome - Tab Bar */}
        <div
          className="flex items-end shrink-0 select-none"
          style={{
            background: 'var(--bg-elevated)',
            borderBottom: 'var(--border-width) solid var(--border-light)',
          }}
        >
          {/* Traffic Lights */}
          <div
            className="flex items-center px-3 py-3 group/traffic"
            style={{ gap: 'var(--traffic-gap)' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => windowContext.closeWindow(windowInstance.id)}
              aria-label="Close window"
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-1"
              style={{
                width: 'var(--traffic-size)',
                height: 'var(--traffic-size)',
                background: `linear-gradient(180deg, var(--traffic-red) 0%, var(--traffic-red-hover) 100%)`,
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => windowContext.minimizeWindow(windowInstance.id)}
              aria-label="Minimize window"
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-1"
              style={{
                width: 'var(--traffic-size)',
                height: 'var(--traffic-size)',
                background: `linear-gradient(180deg, var(--traffic-yellow) 0%, var(--traffic-yellow-hover) 100%)`,
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => windowContext.maximizeWindow(windowInstance.id)}
              aria-label="Maximize window"
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-1"
              style={{
                width: 'var(--traffic-size)',
                height: 'var(--traffic-size)',
                background: `linear-gradient(180deg, var(--traffic-green) 0%, var(--traffic-green-hover) 100%)`,
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
              </svg>
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1 px-2" onPointerDown={(e) => e.stopPropagation()}>
            <button
              aria-label="Go back"
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--border-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              aria-label="Go forward"
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--border-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Browser Tabs */}
          <div className="flex-1 flex items-end gap-0.5 overflow-x-auto pr-3">
            {browserTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabIndex(index)}
                aria-selected={activeTabIndex === index}
                role="tab"
                className="flex items-center gap-2 px-3 py-2 max-w-[180px] min-w-[100px] rounded-t-lg relative transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-inset"
                style={{
                  background: activeTabIndex === index
                    ? 'var(--bg-glass-elevated)'
                    : 'transparent',
                  borderTop: activeTabIndex === index
                    ? 'var(--border-width) solid var(--border-light)'
                    : 'none',
                  borderLeft: activeTabIndex === index
                    ? 'var(--border-width) solid var(--border-light)'
                    : 'none',
                  borderRight: activeTabIndex === index
                    ? 'var(--border-width) solid var(--border-light)'
                    : 'none',
                  marginBottom: activeTabIndex === index ? '-1px' : '0',
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {tab.favicon && (
                  <div className="w-4 h-4 rounded overflow-hidden shrink-0">
                    <Image src={tab.favicon} alt="" width={16} height={16} className="object-cover" />
                  </div>
                )}
                <span
                  className="truncate text-[12px] font-medium"
                  style={{
                    color: activeTabIndex === index ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            ))}

            {/* New Tab Button */}
            <button
              aria-label="New tab"
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--border-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              style={{ color: 'var(--text-tertiary)' }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 2v10M2 7h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{
            background: 'var(--bg-elevated)',
            borderBottom: 'var(--border-width) solid var(--border-light)',
          }}
        >
          {/* Security indicator */}
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ color: 'var(--accent-success)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a2 2 0 0 0-2 2v3H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6V3a2 2 0 1 1 4 0v1h2V3a4 4 0 0 0-4-4z" />
            </svg>
          </div>

          {/* URL Bar */}
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'var(--bg-glass)',
              border: 'var(--border-width) solid var(--border-light)',
            }}
          >
            <span
              className="text-[12px] truncate"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono, var(--font-body))',
              }}
            >
              meos.app/{item.label.toLowerCase().replace(/\s+/g, '-')}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--border-light)]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12.5 6.5v-3h-3M12 7L8 11M4 8v4a1 1 0 001 1h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--border-light)]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M3 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 8 8)" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            background: 'var(--bg-surface)',
          }}
        >
          {/* Page Header */}
          <div
            className="flex items-start gap-4 border-b"
            style={{
              padding: 'var(--spacing-window-padding)',
              borderColor: 'var(--border-light)',
            }}
          >
            <div
              className="relative w-14 h-14 overflow-hidden shrink-0"
              style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}
            >
              <Image
                src={item.windowHeaderImage || item.thumbnailUrl}
                alt={item.windowTitle}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h2
                className="font-semibold truncate leading-tight"
                style={{
                  fontSize: '16px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: 'var(--letter-spacing-tight)',
                }}
              >
                {item.windowTitle}
              </h2>
              {item.windowSubtitle && (
                <p
                  className="mt-0.5 truncate"
                  style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  {item.windowSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Blocks */}
          <div className="pb-5">
            {sortedBlocks.map((block, index) => (
              <div
                key={block.id}
                style={{ borderTop: index > 0 ? '1px solid var(--border-light)' : undefined }}
              >
                {isOwner ? (
                  <EditableBlockRenderer
                    block={block}
                    itemId={item.id}
                    onUpdate={handleBlockUpdate}
                    onDelete={handleBlockDelete}
                  />
                ) : (
                  <BlockRenderer block={block} />
                )}
              </div>
            ))}

            {/* Add block button (owner only) */}
            {isOwner && (
              <div style={{ padding: 'var(--spacing-window-padding)' }}>
                {showBlockPicker ? (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-elevated)',
                      border: 'var(--border-width) solid var(--border-medium)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Add Block</span>
                      <button
                        onClick={() => setShowBlockPicker(false)}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--border-light)' }}
                      >
                        <svg className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 2l6 6M8 2l-6 6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex gap-1 px-3 py-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      {BLOCK_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setBlockPickerCategory(cat.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap"
                          style={{
                            background: blockPickerCategory === cat.id ? 'var(--accent-primary)' : 'transparent',
                            color: blockPickerCategory === cat.id ? 'white' : 'var(--text-secondary)',
                          }}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 max-h-[200px] overflow-y-auto">
                      <div className="grid grid-cols-4 gap-2">
                        {BLOCK_DEFINITIONS
                          .filter(blockDef => blockDef.category === blockPickerCategory)
                          .map((blockDef) => (
                          <button
                            key={blockDef.type}
                            onClick={() => handleAddBlock(blockDef.type)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all hover:bg-[var(--border-light)]"
                          >
                            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'var(--border-light)' }}>
                              {blockDef.icon}
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{blockDef.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowBlockPicker(true)}
                    className="w-full py-2.5 border border-dashed flex items-center justify-center gap-2 font-medium transition-all hover:bg-[var(--border-light)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                    style={{
                      fontSize: '13px',
                      borderRadius: 'var(--radius-button)',
                      borderColor: 'var(--border-medium)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                    Add block
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        </motion.div>
      </div>
    </>
  );
}
