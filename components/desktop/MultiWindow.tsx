'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
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
import { PagesWindow } from './PagesWindow';
import { NotesWindow } from './NotesWindow';
import { PhotosWindow } from './PhotosWindow';
import { FinderWindow } from './FinderWindow';
import { WorkbenchWindow } from './WorkbenchWindow';
import { CommentSection } from './CommentSection';
import { TrafficLights } from './TrafficLights';
import { WINDOW, TITLE_BAR, CONTENT, ANIMATION, getWindowStyle } from './windowStyles';

// Content colors - derived from unified windowStyles
const colors = {
  textPrimary: CONTENT.titleColor,
  textSecondary: CONTENT.mutedColor,
  textTertiary: CONTENT.mutedColor,
  borderLight: CONTENT.borderColor,
  borderMedium: CONTENT.borderColor,
  tabActiveBg: 'var(--color-bg-white, #ffffff)',
  tabActiveColor: CONTENT.titleColor,
  tabInactiveColor: CONTENT.mutedColor,
  accentColor: 'var(--color-accent-primary)',
  buttonBg: 'var(--color-bg-white, #ffffff)',
  imageShadow: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
};

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
  const sortedBlocks = useMemo(
    () => [...blocksToRender].sort((a, b) => a.order - b.order),
    [blocksToRender]
  );
  const sortedTabs = useMemo(
    () => item?.tabs ? [...item.tabs].sort((a, b) => a.order - b.order) : [],
    [item?.tabs]
  );

  // Handle block updates
  const handleBlockUpdate = useCallback((blockId: string, data: Record<string, unknown>) => {
    if (!item || !context) return;
    context.updateBlock(item.id, blockId, { data });
  }, [item, context]);

  // Handle block delete
  const handleBlockDelete = useCallback((blockId: string) => {
    if (!item || !context) return;
    context.deleteBlock(item.id, blockId);
  }, [item, context]);

  // Handle add block
  const handleAddBlock = useCallback((type: string) => {
    if (!item || !context) return;

    const blockDef = BLOCK_DEFINITIONS.find(b => b.type === type);
    if (!blockDef) return;

    context.addBlock(item.id, {
      type,
      data: blockDef.defaultData,
      order: sortedBlocks.length,
    });

    blockPicker.close();
  }, [item, context, sortedBlocks.length, blockPicker]);

  // Open inline block picker
  const openBlockPicker = useCallback(() => {
    if (addBlockButtonRef.current) {
      const rect = addBlockButtonRef.current.getBoundingClientRect();
      blockPicker.open(rect.left, rect.top - 360);
    }
  }, [blockPicker]);

  // Handle item field updates
  const handleTitleChange = useCallback((value: string) => {
    if (!item || !context) return;
    context.updateItem(item.id, { windowTitle: value });
  }, [item, context]);

  const handleSubtitleChange = useCallback((value: string) => {
    if (!item || !context) return;
    context.updateItem(item.id, { windowSubtitle: value });
  }, [item, context]);

  const handleHeaderImageChange = useCallback((url: string) => {
    if (!item || !context) return;
    context.updateItem(item.id, { windowHeaderImage: url });
  }, [item, context]);

  const handleWindowClick = useCallback(() => {
    windowContext.focusWindow(windowInstance.id);
  }, [windowContext, windowInstance.id]);

  const handleClose = useCallback(() => {
    windowContext.closeWindow(windowInstance.id);
  }, [windowContext, windowInstance.id]);

  const handleMinimize = useCallback(() => {
    windowContext.minimizeWindow(windowInstance.id);
  }, [windowContext, windowInstance.id]);

  const handleMaximize = useCallback(() => {
    windowContext.maximizeWindow(windowInstance.id);
  }, [windowContext, windowInstance.id]);

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
          className="overflow-hidden flex flex-col pointer-events-auto relative"
          onClick={handleWindowClick}
          drag={!isMaximized}
          dragConstraints={false}
          dragElastic={0}
          dragMomentum={false}
          style={{
            zIndex: windowInstance.zIndex + 200,
            width: isMaximized ? '100%' : windowWidth,
            maxWidth: isMaximized ? '100%' : '90vw',
            height: isMaximized ? '100%' : 'auto',
            maxHeight: isMaximized ? '100%' : 'calc(100vh - 180px)',
            ...getWindowStyle(isMaximized, isActive),
          }}
          initial={ANIMATION.initial}
          animate={ANIMATION.animate}
          exit={ANIMATION.exit}
          transition={ANIMATION.transition}
        >
          {/* Title Bar */}
          <div
            className="flex items-center px-4 shrink-0 relative select-none"
            style={{
              height: TITLE_BAR.height,
              borderBottom: TITLE_BAR.borderBottom,
              background: TITLE_BAR.background,
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights */}
            <TrafficLights
              onClose={handleClose}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              isMaximized={isMaximized}
            />

            {/* Title */}
            <span
              className="absolute left-1/2 -translate-x-1/2 font-medium truncate max-w-[55%]"
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                color: TITLE_BAR.titleColor,
                opacity: isActive ? TITLE_BAR.titleOpacityActive : TITLE_BAR.titleOpacityInactive,
                letterSpacing: TITLE_BAR.titleLetterSpacing,
              }}
            >
              {item.windowTitle}
            </span>
          </div>

          {/* Content */}
          < div
            className="flex-1 overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }
            }
          >
            {/* Header Section */}
            < div
              className="flex items-start gap-4"
              style={{ padding: '16px 20px' }}
            >
              {/* Header Image */}
              {
                isOwner ? (
                  <EditableImage
                    id={`${item.id}-header-image`}
                    value={item.windowHeaderImage || item.thumbnailUrl}
                    onChange={handleHeaderImageChange}
                  >
                    <div
                      className="relative w-16 h-16 overflow-hidden shrink-0"
                      style={{
                        borderRadius: 12,
                        boxShadow: colors.imageShadow,
                        border: '1px solid var(--color-border-default)',
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
                      borderRadius: 12,
                      boxShadow: colors.imageShadow,
                      border: '1px solid var(--color-border-default)',
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
                )
              }

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
                          fontSize: 17,
                          color: colors.textPrimary,
                          letterSpacing: '-0.02em',
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
                          fontSize: 13,
                          color: colors.textSecondary,
                        }}
                      >
                        {item.windowSubtitle || (isOwner && <span style={{ opacity: 0.4 }}>Add subtitle...</span>)}
                      </p>
                    </EditableText>
                  </>
                ) : (
                  <>
                    <h2
                      className="font-semibold truncate leading-tight info-window-title"
                      style={{
                        fontSize: 17,
                        color: colors.textPrimary,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {item.windowTitle}
                    </h2>
                    {item.windowSubtitle && (
                      <p
                        className="mt-0.5 truncate"
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                        }}
                      >
                        {item.windowSubtitle}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div >

            {/* Tabs */}
            {
              item.useTabs && sortedTabs.length > 0 && (
                <div
                  className="flex gap-1"
                  style={{
                    padding: '0 20px 10px',
                    borderBottom: `1px solid ${colors.borderLight}`,
                  }}
                >
                  {sortedTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className="px-3 py-1.5 font-medium transition-all"
                      style={{
                        fontSize: 12,
                        borderRadius: 6,
                        background: activeTabId === tab.id ? colors.tabActiveBg : 'transparent',
                        color: activeTabId === tab.id ? colors.tabActiveColor : colors.tabInactiveColor,
                      }}
                    >
                      {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                      {tab.label}
                    </button>
                  ))}
                </div>
              )
            }

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
                        borderTop: index > 0 ? `1px solid ${colors.borderLight}` : undefined,
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
                    <div style={{ padding: '20px 20px 10px' }}>
                      <button
                        ref={addBlockButtonRef}
                        onClick={openBlockPicker}
                        className="w-full py-2.5 border border-dashed flex items-center justify-center gap-2 font-medium transition-all"
                        style={{
                          fontSize: 13,
                          borderRadius: 8,
                          borderColor: colors.borderMedium,
                          color: colors.textTertiary,
                          background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.tabActiveBg;
                          e.currentTarget.style.borderColor = colors.accentColor;
                          e.currentTarget.style.color = colors.accentColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = colors.borderMedium;
                          e.currentTarget.style.color = colors.textTertiary;
                        }}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M7 2v10M2 7h10" strokeLinecap="round" />
                        </svg>
                        Add block
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded ml-1"
                          style={{
                            background: colors.buttonBg,
                            color: colors.textTertiary,
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

            {/* Comment Section */}
            {
              item.commentsEnabled !== false && (
                <CommentSection itemId={item.id} />
              )
            }
          </div >
        </motion.div >
      </div >

      {/* Inline Block Picker */}
      < InlineBlockPicker
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
    case 'pages':
    case 'document':
      return <PagesWindow key={windowInstance.id} window={windowInstance} item={item} />;
    case 'notes':
      return <NotesWindow key={windowInstance.id} window={windowInstance} item={item} />;
    case 'photos':
    case 'gallery':
      return <PhotosWindow key={windowInstance.id} window={windowInstance} item={item} />;
    case 'finder':
      return <FinderWindow key={windowInstance.id} window={windowInstance} item={item} />;
    case 'workbench':
      return <WorkbenchWindow key={windowInstance.id} window={windowInstance} item={item} />;
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
