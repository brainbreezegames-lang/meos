'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { EditableText, EditableImage } from '@/components/editing/Editable';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { BLOCK_DEFINITIONS } from '@/types/blocks';

interface EditableInfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function EditableInfoWindow({ item, onClose, position }: EditableInfoWindowProps) {
  const context = useEditContextSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const dragControls = useDragControls();

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

    setShowBlockPicker(false);
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
            style={{ padding: '20px' }}
          />

          {/* Window */}
          <motion.div
            ref={windowRef}
            className="fixed z-[200] max-w-[92vw] overflow-hidden flex flex-col glass-elevated"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            style={{
              width: item.windowWidth || 440,
              maxHeight: 'calc(100vh - 80px)',
              left: position?.x ?? '50%',
              top: position?.y ?? '50%',
              x: '-50%',
              y: '-50%',
              borderRadius: '14px',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              boxShadow: 'var(--shadow-window)',
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              mass: 0.8
            }}
          >
            {/* Title Bar */}
            <div
              className="flex items-center h-[52px] px-4 shrink-0 relative cursor-grab active:cursor-grabbing"
              style={{
                borderBottom: '1px solid var(--border-light)',
                background: 'linear-gradient(180deg, var(--border-glass-inner) 0%, transparent 100%)',
              }}
              onPointerDown={startDrag}
            >
              {/* Traffic Lights */}
              <div className="flex items-center gap-2 group/traffic" onPointerDown={(e) => e.stopPropagation()}>
                <button
                  onClick={onClose}
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"
                  style={{
                    background: 'linear-gradient(180deg, #FF6058 0%, #FF4D44 100%)',
                    boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #FFBE2E 0%, #FFB014 100%)',
                    boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #2ACB42 0%, #1DB934 100%)',
                    boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <svg className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150" viewBox="0 0 8 8" fill="none">
                    <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium truncate max-w-[55%] select-none"
                style={{ color: 'var(--text-primary)', opacity: 0.85 }}
              >
                {item.windowTitle}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header Section */}
              <div className="flex items-start gap-4 px-6 pt-5 pb-4">
                {/* Header Image */}
                {isOwner ? (
                  <EditableImage
                    id={`${item.id}-header-image`}
                    value={item.windowHeaderImage || item.thumbnailUrl}
                    onChange={handleHeaderImageChange}
                  >
                    <div
                      className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0"
                      style={{
                        boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.05), inset 0 0 0 0.5px rgba(255, 255, 255, 0.2)',
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
                    className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0"
                    style={{
                      boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.05), inset 0 0 0 0.5px rgba(255, 255, 255, 0.2)',
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
                          className="text-[17px] font-semibold tracking-tight truncate leading-tight"
                          style={{ color: 'var(--text-primary)' }}
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
                          className="text-[13px] mt-0.5 truncate"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {item.windowSubtitle || (isOwner && <span className="opacity-40">Add subtitle...</span>)}
                        </p>
                      </EditableText>
                    </>
                  ) : (
                    <>
                      <h2
                        className="text-[17px] font-semibold tracking-tight truncate leading-tight"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.windowTitle}
                      </h2>
                      {item.windowSubtitle && (
                        <p
                          className="text-[13px] mt-0.5 truncate"
                          style={{ color: 'var(--text-secondary)' }}
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
                  className="flex gap-1 px-6 pb-3"
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                >
                  {sortedTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
                      style={{
                        background: activeTabId === tab.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                        color: activeTabId === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
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
                      <div className="px-6 pt-4 pb-2">
                        {showBlockPicker ? (
                          <motion.div
                            className="rounded-lg overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                              background: 'var(--border-light)',
                              border: '1px solid var(--border-medium)',
                            }}
                          >
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  Add Block
                                </span>
                                <button
                                  onClick={() => setShowBlockPicker(false)}
                                  className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {BLOCK_DEFINITIONS.slice(0, 12).map((blockDef) => (
                                  <button
                                    key={blockDef.type}
                                    onClick={() => handleAddBlock(blockDef.type)}
                                    className="flex flex-col items-center gap-1 p-2 rounded-md transition-colors"
                                    style={{ background: 'transparent' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <span className="text-lg">{blockDef.icon}</span>
                                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                                      {blockDef.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => setShowBlockPicker(true)}
                            className="w-full py-2 rounded-lg border border-dashed flex items-center justify-center gap-2 text-[13px] transition-all"
                            style={{
                              borderColor: 'var(--border-medium)',
                              color: 'var(--text-tertiary)',
                              background: 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                            </svg>
                            Add block
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
