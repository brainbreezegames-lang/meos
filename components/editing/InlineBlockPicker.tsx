'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BLOCK_DEFINITIONS, BlockType, BLOCK_CATEGORIES } from '@/types/blocks';

// Most common blocks shown by default
const COMMON_BLOCKS: BlockType[] = [
  'text',
  'heading',
  'image',
  'gallery',
  'quote',
  'stats',
  'buttons',
  'divider',
];

interface InlineBlockPickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  searchQuery?: string;
}

export function InlineBlockPicker({
  isOpen,
  position,
  onSelect,
  onClose,
  searchQuery = '',
}: InlineBlockPickerProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  const getFilteredBlocks = useCallback(() => {
    const query = internalQuery.toLowerCase().trim();

    if (!query && !showAll) {
      return BLOCK_DEFINITIONS.filter(def => COMMON_BLOCKS.includes(def.type));
    }

    if (!query && showAll) {
      return BLOCK_DEFINITIONS;
    }

    return BLOCK_DEFINITIONS.filter(
      def =>
        def.label.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        def.type.toLowerCase().includes(query)
    );
  }, [internalQuery, showAll]);

  const filteredBlocks = getFilteredBlocks();

  // Group by category when showing all
  const groupedBlocks = showAll && !internalQuery
    ? BLOCK_CATEGORIES.map(cat => ({
        ...cat,
        blocks: filteredBlocks.filter(b => b.category === cat.id)
      })).filter(g => g.blocks.length > 0)
    : null;

  useEffect(() => {
    setSelectedIndex(0);
  }, [internalQuery, showAll]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredBlocks.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredBlocks[selectedIndex]) {
            onSelect(filteredBlocks[selectedIndex].type);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          if (!e.shiftKey && !showAll && !internalQuery) {
            e.preventDefault();
            setShowAll(true);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredBlocks, selectedIndex, onSelect, onClose, showAll, internalQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const selectedEl = document.querySelector(`[data-block-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed z-[400] overflow-hidden"
          style={{
            left: Math.min(position.x, window.innerWidth - 320),
            top: Math.min(position.y, window.innerHeight - 420),
            width: 300,
            borderRadius: 10,
            background: 'var(--bg-glass-elevated)',
            backdropFilter: 'blur(72px) saturate(190%)',
            WebkitBackdropFilter: 'blur(72px) saturate(190%)',
            boxShadow: `
              0 0 0 0.5px rgba(0, 0, 0, 0.12),
              0 0 0 1px rgba(255, 255, 255, 0.15) inset,
              0 24px 68px -12px rgba(0, 0, 0, 0.35),
              0 0 1px rgba(0, 0, 0, 0.2)
            `,
          }}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{
            duration: 0.2,
            ease: [0.32, 0.72, 0, 1]
          }}
        >
          {/* Search header */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '0.5px solid var(--border-light)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,122,255,0.9) 0%, rgba(0,100,220,0.95) 100%)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <span className="text-[11px] font-semibold text-white">/</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={internalQuery}
                onChange={(e) => setInternalQuery(e.target.value)}
                placeholder="Search blocks..."
                className="flex-1 bg-transparent border-0 outline-none"
                style={{
                  fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.008em',
                }}
              />
              {internalQuery && (
                <button
                  onClick={() => setInternalQuery('')}
                  className="w-4 h-4 rounded-full flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity"
                  style={{ background: 'var(--text-tertiary)' }}
                >
                  <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l6 6M7 1l-6 6" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Block list */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: 320,
              padding: '4px 0',
            }}
          >
            {filteredBlocks.length > 0 ? (
              <>
                {groupedBlocks ? (
                  // Grouped view
                  groupedBlocks.map((group) => (
                    <div key={group.id}>
                      <div
                        className="flex items-center gap-1.5 px-3 pt-3 pb-1.5"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <span className="text-[11px]">{group.icon}</span>
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider"
                          style={{ letterSpacing: '0.04em' }}
                        >
                          {group.label}
                        </span>
                      </div>
                      {group.blocks.map((def) => {
                        const globalIndex = filteredBlocks.indexOf(def);
                        return (
                          <BlockItem
                            key={def.type}
                            def={def}
                            index={globalIndex}
                            isSelected={selectedIndex === globalIndex}
                            onSelect={onSelect}
                            onHover={setSelectedIndex}
                          />
                        );
                      })}
                    </div>
                  ))
                ) : (
                  // Flat view
                  filteredBlocks.map((def, index) => (
                    <BlockItem
                      key={def.type}
                      def={def}
                      index={index}
                      isSelected={selectedIndex === index}
                      onSelect={onSelect}
                      onHover={setSelectedIndex}
                    />
                  ))
                )}

                {/* Show all toggle */}
                {!showAll && !internalQuery && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="w-full flex items-center justify-center gap-2 mt-1 transition-colors"
                    style={{
                      padding: '10px 12px',
                      borderTop: '0.5px solid var(--border-light)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500 }}>
                      Browse all blocks
                    </span>
                    <kbd
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        background: 'var(--border-light)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      Tab
                    </kbd>
                  </button>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-10 px-4"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg className="w-8 h-8 mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4-4" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 13 }}>No blocks found</span>
                <span style={{ fontSize: 11, marginTop: 2 }}>Try a different search</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3"
            style={{
              height: 32,
              borderTop: '0.5px solid var(--border-light)',
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.02) 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <KeyHint keys={['↑', '↓']} label="Navigate" />
              <KeyHint keys={['↵']} label="Select" />
            </div>
            <KeyHint keys={['esc']} label="Close" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BlockItem({
  def,
  index,
  isSelected,
  onSelect,
  onHover,
}: {
  def: typeof BLOCK_DEFINITIONS[0];
  index: number;
  isSelected: boolean;
  onSelect: (type: BlockType) => void;
  onHover: (index: number) => void;
}) {
  return (
    <motion.button
      data-block-index={index}
      onClick={() => onSelect(def.type)}
      onMouseEnter={() => onHover(index)}
      className="w-full flex items-center gap-3 text-left transition-colors relative"
      style={{
        padding: '7px 10px',
        margin: '0 4px',
        width: 'calc(100% - 8px)',
        borderRadius: 6,
        background: isSelected
          ? 'linear-gradient(180deg, rgba(0,122,255,0.12) 0%, rgba(0,122,255,0.08) 100%)'
          : 'transparent',
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all"
        style={{
          background: isSelected
            ? 'linear-gradient(180deg, #007AFF 0%, #0066CC 100%)'
            : 'var(--bg-elevated)',
          boxShadow: isSelected
            ? '0 2px 6px rgba(0,122,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 0.5px 1px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
          color: isSelected ? 'white' : 'var(--text-primary)',
          fontSize: 14,
        }}
      >
        {def.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {def.label}
        </div>
        <div
          className="truncate"
          style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginTop: 1,
          }}
        >
          {def.description}
        </div>
      </div>
      {isSelected && (
        <motion.div
          className="shrink-0 flex items-center justify-center rounded"
          style={{
            width: 20,
            height: 20,
            background: 'rgba(0,122,255,0.15)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <svg className="w-2.5 h-2.5" style={{ color: '#007AFF' }} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 5.5L4 7.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

function KeyHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
      <div className="flex gap-0.5">
        {keys.map((key) => (
          <kbd
            key={key}
            className="flex items-center justify-center rounded"
            style={{
              minWidth: 18,
              height: 16,
              padding: '0 4px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-elevated)',
              boxShadow: '0 0.5px 1px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)',
            }}
          >
            {key}
          </kbd>
        ))}
      </div>
      <span style={{ fontSize: 10, marginLeft: 2 }}>{label}</span>
    </div>
  );
}

export function useInlineBlockPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const open = useCallback((x: number, y: number, initialQuery = '') => {
    setPosition({ x, y });
    setSearchQuery(initialQuery);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  return {
    isOpen,
    position,
    searchQuery,
    open,
    close,
    setSearchQuery,
  };
}
