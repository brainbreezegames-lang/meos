'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { EditableText, EditableImage } from '@/components/editing/Editable';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import { InlineBlockPicker, useInlineBlockPicker } from '@/components/editing/InlineBlockPicker';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { BLOCK_DEFINITIONS } from '@/types/blocks';
import { TrafficLights } from './TrafficLights';
import { WINDOW, TITLE_BAR, CONTENT, ANIMATION } from './windowStyles';

interface EditableInfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function EditableInfoWindow({ item, onClose }: EditableInfoWindowProps) {
  const context = useEditContextSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();
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
            {/* Window - Uses unified windowStyles */}
            <motion.div
              ref={windowRef}
              className="max-w-[92vw] overflow-hidden flex flex-col pointer-events-auto"
              drag
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={false}
              dragElastic={0}
              dragMomentum={false}
              style={{
                width: item.windowWidth || 440,
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
              {/* Title Bar - Uses unified TITLE_BAR */}
              <div
                className="flex items-center shrink-0 relative cursor-grab active:cursor-grabbing"
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

                {/* Title */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 font-medium truncate max-w-[55%] select-none"
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
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
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
                  {isOwner ? (
                    <EditableImage
                      id={`${item.id}-header-image`}
                      value={item.windowHeaderImage || item.thumbnailUrl}
                      onChange={handleHeaderImageChange}
                    >
                      <div
                        className="relative overflow-hidden shrink-0"
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
                    </EditableImage>
                  ) : (
                    <div
                      className="relative overflow-hidden shrink-0"
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
                              fontSize: CONTENT.titleFontSize,
                              fontWeight: CONTENT.titleFontWeight,
                              color: CONTENT.titleColor,
                              letterSpacing: CONTENT.titleLetterSpacing,
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
                              fontSize: CONTENT.subtitleFontSize,
                              color: CONTENT.subtitleColor,
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
                            className="mt-0.5 truncate"
                            style={{
                              fontSize: CONTENT.subtitleFontSize,
                              color: CONTENT.subtitleColor,
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
                      padding: `0 ${CONTENT.padding}px 12px`,
                      borderBottom: `1px solid ${CONTENT.borderColor}`,
                    }}
                  >
                    {sortedTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className="px-3 py-1.5 font-medium transition-all rounded-md"
                        style={{
                          fontSize: 12,
                          background: activeTabId === tab.id ? 'rgba(0,0,0,0.04)' : 'transparent',
                          color: activeTabId === tab.id ? CONTENT.titleColor : CONTENT.mutedColor,
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
                        <div style={{ padding: `${CONTENT.padding}px ${CONTENT.padding}px ${CONTENT.padding * 0.5}px` }}>
                          <button
                            ref={addBlockButtonRef}
                            onClick={openBlockPicker}
                            className="w-full py-2.5 border border-dashed flex items-center justify-center gap-2 font-medium transition-all"
                            style={{
                              fontSize: 13,
                              borderRadius: 8,
                              borderColor: CONTENT.borderColor,
                              color: CONTENT.mutedColor,
                              background: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                              e.currentTarget.style.color = CONTENT.titleColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = CONTENT.mutedColor;
                            }}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                            </svg>
                            Add block
                            <span
                              className="text-[10px] px-1 py-0.5 rounded ml-1"
                              style={{
                                background: 'rgba(0,0,0,0.04)',
                                color: CONTENT.mutedColor,
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
      )}
    </AnimatePresence>
  );
}
