'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import { useThemeSafe } from '@/contexts/ThemeContext';
import { useEditContextSafe } from '@/contexts/EditContext';
import { EditableText, EditableImage } from '@/components/editing/Editable';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import { InlineBlockPicker, useInlineBlockPicker } from '@/components/editing/InlineBlockPicker';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { BLOCK_DEFINITIONS } from '@/types/blocks';

interface EditableInfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function EditableInfoWindow({ item, onClose, position }: EditableInfoWindowProps) {
  const context = useEditContextSafe();
  const themeContext = useThemeSafe();
  const isSketch = themeContext?.theme === 'sketch';
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const dragControls = useDragControls();
  const blockPicker = useInlineBlockPicker();
  const addBlockButtonRef = useRef<HTMLButtonElement>(null);

  const isOwner = context?.isOwner ?? false;

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
      blockPicker.open(rect.left, rect.top - 320);
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

  const startDrag = (event: React.PointerEvent) => {
    dragControls.start(event);
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
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

          {/* Drag constraints */}
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
            {/* Window - Uses CSS variables for theming */}
            <motion.div
              ref={windowRef}
              className="max-w-[92vw] overflow-hidden flex flex-col glass-elevated pointer-events-auto"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={constraintsRef}
              dragElastic={0.05}
              dragMomentum={false}
              style={{
                width: item.windowWidth || 440,
                maxHeight: 'calc(100vh - 120px)',
                borderRadius: isSketch ? '12px' : 'var(--radius-window)',
                background: isSketch ? '#FFFFFF' : 'var(--bg-glass-elevated)',
                backdropFilter: isSketch ? 'none' : 'var(--blur-glass)',
                WebkitBackdropFilter: isSketch ? 'none' : 'var(--blur-glass)',
                boxShadow: isSketch ? '6px 6px 0 #4A6CF7' : 'var(--shadow-window)',
                border: isSketch ? '1.5px solid #4A6CF7' : 'var(--border-width) solid var(--border-glass-outer)',
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
              {/* Title Bar - Uses CSS variable for height */}
              <div
                className="flex items-center px-4 shrink-0 relative cursor-grab active:cursor-grabbing"
                style={{
                  height: 'var(--window-header-height)',
                  borderBottom: isSketch ? '1.5px solid #4A6CF7' : 'var(--border-width) solid var(--border-light)',
                  background: isSketch ? '#FFFFFF' : 'linear-gradient(180deg, var(--border-glass-inner) 0%, transparent 100%)',
                }}
                onPointerDown={startDrag}
              >
                {/* Traffic Lights - Uses CSS variables for size and gap */}
                <div className="flex items-center group/traffic" style={{ gap: isSketch ? '8px' : 'var(--traffic-gap)' }} onPointerDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={onClose}
                    className="rounded-full flex items-center justify-center transition-all duration-150"
                    style={isSketch ? {
                      width: 10,
                      height: 10,
                      background: '#4A6CF7',
                      border: 'none',
                      borderRadius: '50%',
                    } : {
                      width: 'var(--traffic-size)',
                      height: 'var(--traffic-size)',
                      background: `linear-gradient(180deg, var(--traffic-red) 0%, var(--traffic-red-hover) 100%)`,
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {!isSketch && (
                      <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                        <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={isSketch ? {
                      width: 10,
                      height: 10,
                      background: '#4A6CF7',
                      border: 'none',
                      borderRadius: '50%',
                    } : {
                      width: 'var(--traffic-size)',
                      height: 'var(--traffic-size)',
                      background: `linear-gradient(180deg, var(--traffic-yellow) 0%, var(--traffic-yellow-hover) 100%)`,
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {!isSketch && (
                      <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={isSketch ? {
                      width: 10,
                      height: 10,
                      background: '#4A6CF7',
                      border: 'none',
                      borderRadius: '50%',
                    } : {
                      width: 'var(--traffic-size)',
                      height: 'var(--traffic-size)',
                      background: `linear-gradient(180deg, var(--traffic-green) 0%, var(--traffic-green-hover) 100%)`,
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {!isSketch && (
                      <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                        <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Title */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 font-medium truncate max-w-[55%] select-none"
                  style={{
                    fontSize: '13px',
                    color: isSketch ? '#2B4AE2' : 'var(--text-primary)',
                    opacity: 0.85,
                    fontFamily: isSketch ? '"Comic Sans MS", "Chalkboard SE", sans-serif' : 'var(--font-display)',
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
                {/* Header Section - Uses CSS variables for padding and radii */}
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

                {/* Tabs - Uses CSS variables for styling */}
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
                              borderRadius: 'var(--radius-button)',
                              borderColor: 'var(--border-medium)',
                              color: 'var(--text-tertiary)',
                              background: 'transparent',
                              fontFamily: 'var(--font-body)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--border-light)';
                              e.currentTarget.style.borderColor = 'var(--accent-primary)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'var(--border-medium)';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                            </svg>
                            Add block
                            <span
                              className="text-[10px] px-1 py-0.5 rounded ml-1"
                              style={{
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
      )
      }
    </AnimatePresence >
  );
}
