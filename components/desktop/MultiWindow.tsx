'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { EditableText, EditableImage } from '@/components/editing/Editable';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import { InlineBlockPicker, useInlineBlockPicker } from '@/components/editing/InlineBlockPicker';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { BLOCK_DEFINITIONS } from '@/types/blocks';
import { BrowserWindow } from './BrowserWindow';
import { MailWindow } from './MailWindow';

interface MultiWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

export function MultiWindow({ window: windowInstance, item }: MultiWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const windowRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const blockPicker = useInlineBlockPicker();
  const addBlockButtonRef = useRef<HTMLButtonElement>(null);

  const isOwner = context?.isOwner ?? false;
  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';
  const isMinimized = windowInstance.state === 'minimized';

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

    if (item.useTabs && item.tabs?.length > 0 && activeTabId) {
      const activeTab = item.tabs.find(t => t.id === activeTabId);
      return activeTab?.blocks || [];
    }

    if (item.blocks?.length > 0) {
      return item.blocks;
    }

    // Legacy fallback
    const legacyBlocks: BlockData[] = [];

    if (item.windowDescription) {
      legacyBlocks.push({
        id: 'legacy-description',
        type: 'text',
        data: { content: item.windowDescription },
        order: 0,
      });
    }

    if (item.windowDetails?.length) {
      legacyBlocks.push({
        id: 'legacy-details',
        type: 'details',
        data: { items: item.windowDetails },
        order: 1,
      });
    }

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

  // Handle block updates
  const handleBlockUpdate = (blockId: string, data: Record<string, unknown>) => {
    if (!item || !context) return;
    context.updateBlock(item.id, blockId, { data });
  };

  // Handle block delete
  const handleBlockDelete = (blockId: string) => {
    if (!item || !context) return;
    context.deleteBlock(item.id, blockId);
  };

  // Handle add block
  const handleAddBlock = (type: string) => {
    if (!item || !context) return;

    const blockDef = BLOCK_DEFINITIONS.find(b => b.type === type);
    if (!blockDef) return;

    context.addBlock(item.id, {
      type,
      data: blockDef.defaultData,
      order: sortedBlocks.length,
    });

    blockPicker.close();
  };

  // Open inline block picker
  const openBlockPicker = () => {
    if (addBlockButtonRef.current) {
      const rect = addBlockButtonRef.current.getBoundingClientRect();
      blockPicker.open(rect.left, rect.top - 360);
    }
  };

  // Handle item field updates
  const handleTitleChange = (value: string) => {
    if (!item || !context) return;
    context.updateItem(item.id, { windowTitle: value });
  };

  const handleSubtitleChange = (value: string) => {
    if (!item || !context) return;
    context.updateItem(item.id, { windowSubtitle: value });
  };

  const handleHeaderImageChange = (url: string) => {
    if (!item || !context) return;
    context.updateItem(item.id, { windowHeaderImage: url });
  };

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handleClose = () => {
    windowContext.closeWindow(windowInstance.id);
  };

  const handleMinimize = () => {
    windowContext.minimizeWindow(windowInstance.id);
  };

  const handleMaximize = () => {
    windowContext.maximizeWindow(windowInstance.id);
  };

  // Calculate window dimensions
  const windowWidth = item.windowWidth || 440;
  const windowHeight = 500;

  if (isMinimized) return null;

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
        {/* Window */}
        <motion.div
          ref={windowRef}
          className="overflow-hidden flex flex-col glass-elevated pointer-events-auto relative"
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
            boxShadow: isActive ? 'var(--shadow-window)' : 'var(--shadow-lg)',
            border: 'var(--border-width) solid var(--border-glass-outer)',
            opacity: isActive ? 1 : 0.95,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
        {/* Title Bar */}
        <div
          className="flex items-center px-4 shrink-0 relative select-none"
          style={{
            height: 'var(--window-header-height)',
            borderBottom: 'var(--border-width) solid var(--border-light)',
            background: 'linear-gradient(180deg, var(--border-glass-inner) 0%, transparent 100%)',
            cursor: isMaximized ? 'default' : 'grab',
          }}
        >
          {/* Traffic Lights */}
          <div
            className="flex items-center group/traffic"
            style={{ gap: 'var(--traffic-gap)' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"
              style={{
                width: 'var(--traffic-size)',
                height: 'var(--traffic-size)',
                background: `linear-gradient(180deg, var(--traffic-red) 0%, var(--traffic-red-hover) 100%)`,
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"
              style={{
                width: 'var(--traffic-size)',
                height: 'var(--traffic-size)',
                background: `linear-gradient(180deg, var(--traffic-yellow) 0%, var(--traffic-yellow-hover) 100%)`,
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Maximize */}
            <button
              onClick={handleMaximize}
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"
              style={{
                width: 'var(--traffic-size)',
                height: 'var(--traffic-size)',
                background: `linear-gradient(180deg, var(--traffic-green) 0%, var(--traffic-green-hover) 100%)`,
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                {isMaximized ? (
                  // Restore icon (two overlapping rectangles)
                  <>
                    <rect x="1" y="2.5" width="4" height="4" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1" fill="none" />
                    <rect x="3" y="0.5" width="4" height="4" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1" fill="none" />
                  </>
                ) : (
                  // Maximize icon (expand arrows)
                  <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                )}
              </svg>
            </button>
          </div>

          {/* Title */}
          <span
            className="absolute left-1/2 -translate-x-1/2 font-medium truncate max-w-[55%]"
            style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              opacity: isActive ? 0.85 : 0.6,
              fontFamily: 'var(--font-display)',
              letterSpacing: 'var(--letter-spacing-tight)',
            }}
          >
            {item.windowTitle}
          </span>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Header Section */}
          <div
            className="flex items-start gap-4"
            style={{ padding: `calc(var(--spacing-window-padding) * 0.75) var(--spacing-window-padding)` }}
          >
            {/* Header Image */}
            {isOwner ? (
              <EditableImage
                id={`${item.id}-header-image`}
                value={item.windowHeaderImage || item.thumbnailUrl}
                onChange={handleHeaderImageChange}
              >
                <div
                  className="relative w-16 h-16 overflow-hidden shrink-0"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
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
              </EditableImage>
            ) : (
              <div
                className="relative w-16 h-16 overflow-hidden shrink-0"
                style={{
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
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
            )}

            {/* Title + Subtitle */}
            <div className="flex flex-col min-w-0 pt-1.5 flex-1">
              {isOwner ? (
                <>
                  <EditableText
                    id={`${item.id}-title`}
                    value={item.windowTitle}
                    onChange={handleTitleChange}
                    placeholder="Window title..."
                  >
                    <h2
                      className="font-semibold truncate leading-tight info-window-title"
                      style={{
                        fontSize: '17px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: 'var(--letter-spacing-tight)',
                      }}
                    >
                      {item.windowTitle}
                    </h2>
                  </EditableText>
                  <EditableText
                    id={`${item.id}-subtitle`}
                    value={item.windowSubtitle || ''}
                    onChange={handleSubtitleChange}
                    placeholder="Add subtitle..."
                  >
                    <p
                      className="mt-0.5 truncate"
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {item.windowSubtitle || (isOwner && <span className="opacity-40">Add subtitle...</span>)}
                    </p>
                  </EditableText>
                </>
              ) : (
                <>
                  <h2
                    className="font-semibold truncate leading-tight info-window-title"
                    style={{
                      fontSize: '17px',
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
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {item.windowSubtitle}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          {item.useTabs && sortedTabs.length > 0 && (
            <div
              className="flex gap-1"
              style={{
                padding: `0 var(--spacing-window-padding) calc(var(--spacing-window-padding) * 0.5)`,
                borderBottom: 'var(--border-width) solid var(--border-light)',
              }}
            >
              {sortedTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className="px-3 py-1.5 font-medium transition-all"
                  style={{
                    fontSize: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: activeTabId === tab.id ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'transparent',
                    color: activeTabId === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Blocks */}
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
                      borderTop: index > 0 ? '1px solid var(--border-light)' : undefined,
                    }}
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
                  <div style={{ padding: `var(--spacing-window-padding) var(--spacing-window-padding) calc(var(--spacing-window-padding) * 0.5)` }}>
                    <button
                      ref={addBlockButtonRef}
                      onClick={openBlockPicker}
                      className="w-full py-2.5 border border-dashed flex items-center justify-center gap-2 font-medium transition-all"
                      style={{
                        fontSize: '13px',
                        borderRadius: 8,
                        borderColor: 'var(--border-medium)',
                        color: 'var(--text-tertiary)',
                        background: 'transparent',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(180deg, rgba(0,122,255,0.06) 0%, rgba(0,122,255,0.02) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(0,122,255,0.4)';
                        e.currentTarget.style.color = '#007AFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                        e.currentTarget.style.color = 'var(--text-tertiary)';
                      }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 2v10M2 7h10" strokeLinecap="round" />
                      </svg>
                      Add block
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded ml-1"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--border-light)',
                          color: 'var(--text-tertiary)',
                        }}
                      >
                        /
                      </span>
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </motion.div>
      </div>

      {/* Inline Block Picker */}
      <InlineBlockPicker
        isOpen={blockPicker.isOpen}
        position={blockPicker.position}
        searchQuery={blockPicker.searchQuery}
        onSelect={handleAddBlock}
        onClose={blockPicker.close}
      />
    </>
  );
}

// Minimized Windows Bar
function MinimizedWindowsBar({ items }: { items: DesktopItem[] }) {
  const windowContext = useWindowContext();
  const minimizedWindows = windowContext.getMinimizedWindows();

  if (minimizedWindows.length === 0) return null;

  return (
    <motion.div
      className="fixed bottom-20 left-1/2 z-[150] flex items-center"
      style={{ transform: 'translateX(-50%)' }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
    >
      <motion.div
        className="flex items-center"
        style={{
          gap: '8px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-dock)',
          backdropFilter: 'var(--blur-dock)',
          WebkitBackdropFilter: 'var(--blur-dock)',
          boxShadow: 'var(--shadow-dock)',
          border: 'var(--border-width) solid var(--border-glass-outer)',
        }}
      >
        {minimizedWindows.map((win) => {
          const item = items.find(i => i.id === win.itemId);
          if (!item) return null;

          return (
            <motion.button
              key={win.id}
              onClick={() => windowContext.restoreWindow(win.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{
                background: 'var(--bg-button)',
                border: 'var(--border-width) solid var(--border-light)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.thumbnailUrl && (
                <div
                  className="w-6 h-6 rounded overflow-hidden flex-shrink-0"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.windowTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span
                className="text-xs font-medium truncate max-w-[100px]"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {item.windowTitle}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// Render the appropriate window component based on windowType
function WindowRenderer({ windowInstance, item }: { windowInstance: WindowInstance; item: DesktopItem }) {
  const windowType = item.windowType || 'default';

  switch (windowType) {
    case 'browser':
      return <BrowserWindow key={windowInstance.id} window={windowInstance} item={item} />;
    case 'mail':
      return <MailWindow key={windowInstance.id} window={windowInstance} item={item} />;
    default:
      return <MultiWindow key={windowInstance.id} window={windowInstance} item={item} />;
  }
}

// Window Manager component that renders all windows
export function WindowManager({ items }: { items: DesktopItem[] }) {
  const windowContext = useWindowContext();

  return (
    <>
      <AnimatePresence>
        {windowContext.windows.map((windowInstance) => {
          const item = items.find(i => i.id === windowInstance.itemId);
          if (!item || windowInstance.state === 'minimized') return null;

          return (
            <WindowRenderer
              key={windowInstance.id}
              windowInstance={windowInstance}
              item={item}
            />
          );
        })}
      </AnimatePresence>

      {/* Minimized windows bar */}
      <AnimatePresence>
        <MinimizedWindowsBar items={items} />
      </AnimatePresence>
    </>
  );
}
