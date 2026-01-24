'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Check, Lock, Plus, Settings2 } from 'lucide-react';
import { SPRING, fadeInDown, REDUCED_MOTION, buttonPress, DURATION } from '@/lib/animations';

// ============================================
// TYPES
// ============================================

export interface SpaceSummary {
  id: string;
  name: string;
  icon: string;
  slug: string | null;
  isPrimary: boolean;
  isPublic: boolean;
  order: number;
  fileCount?: number;
}

export interface SpaceSwitcherProps {
  spaces: SpaceSummary[];
  activeSpaceId: string;
  onSwitchSpace: (spaceId: string) => void;
  onCreateSpace: () => void;
  onManageSpaces: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const DROPDOWN_WIDTH = 220;
const ITEM_HEIGHT = 36;
const MAX_VISIBLE_SPACES = 6;

// ============================================
// COMPONENT
// ============================================

export function SpaceSwitcher({
  spaces,
  activeSpaceId,
  onSwitchSpace,
  onCreateSpace,
  onManageSpaces,
}: SpaceSwitcherProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeSpace = spaces.find(s => s.id === activeSpaceId);
  const sortedSpaces = [...spaces].sort((a, b) => a.order - b.order);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      const totalItems = sortedSpaces.length + 2; // spaces + create + manage

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex < sortedSpaces.length) {
            onSwitchSpace(sortedSpaces[focusedIndex].id);
            setIsOpen(false);
          } else if (focusedIndex === sortedSpaces.length) {
            onCreateSpace();
            setIsOpen(false);
          } else {
            onManageSpaces();
            setIsOpen(false);
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(totalItems - 1);
          break;
      }
    },
    [isOpen, sortedSpaces, focusedIndex, onSwitchSpace, onCreateSpace, onManageSpaces]
  );

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // Cmd+number shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (sortedSpaces[index]) {
          e.preventDefault();
          onSwitchSpace(sortedSpaces[index].id);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [sortedSpaces, onSwitchSpace]);

  const handleSpaceClick = (spaceId: string) => {
    onSwitchSpace(spaceId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        whileHover={buttonPress.hover}
        whileTap={buttonPress.tap}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current space: ${activeSpace?.name || 'Select space'}`}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
        style={{
          background: isOpen ? 'var(--color-bg-subtle)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Space Icon */}
        <span
          className="text-sm leading-none select-none"
          style={{
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
          }}
        >
          {activeSpace?.icon || '🏠'}
        </span>

        {/* Space Name */}
        <span
          className="text-[13px] font-semibold tracking-tight max-w-[100px] truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {activeSpace?.name || 'My Space'}
        </span>

        {/* Private indicator */}
        {activeSpace && !activeSpace.isPublic && (
          <Lock
            size={10}
            strokeWidth={2.5}
            style={{ color: 'var(--color-text-muted)' }}
          />
        )}

        {/* Chevron */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronDown size={12} strokeWidth={2.5} />
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Invisible backdrop for click-outside */}
            <div
              className="fixed inset-0 z-[2000]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={menuRef}
              role="listbox"
              aria-label="Spaces"
              variants={fadeInDown}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.snappy}
              onKeyDown={handleKeyDown}
              className="absolute top-full left-0 mt-1.5 z-[2001] overflow-hidden"
              style={{
                width: DROPDOWN_WIDTH,
                background: 'var(--color-bg-base)',
                border: '2px solid var(--color-text-primary)',
                borderRadius: 10,
                boxShadow: `
                  0 4px 6px -1px rgba(23, 20, 18, 0.08),
                  0 10px 24px -3px rgba(23, 20, 18, 0.15),
                  0 20px 40px -4px rgba(23, 20, 18, 0.1)
                `,
                transformOrigin: 'top left',
              }}
            >
              {/* Spaces List */}
              <div
                className="py-1.5 overflow-y-auto"
                style={{
                  maxHeight: sortedSpaces.length > MAX_VISIBLE_SPACES
                    ? MAX_VISIBLE_SPACES * ITEM_HEIGHT + 12
                    : 'auto',
                }}
              >
                {sortedSpaces.map((space, index) => {
                  const isActive = space.id === activeSpaceId;
                  const isFocused = focusedIndex === index;

                  return (
                    <motion.button
                      key={space.id}
                      ref={el => { itemRefs.current[index] = el; }}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSpaceClick(space.id)}
                      initial={false}
                      animate={{
                        backgroundColor: isFocused
                          ? 'var(--color-bg-subtle)'
                          : 'transparent',
                      }}
                      whileHover={{
                        backgroundColor: 'var(--color-bg-subtle)',
                      }}
                      transition={{ duration: 0.1 }}
                      className="w-full flex items-center gap-2.5 px-3 text-left outline-none"
                      style={{
                        height: ITEM_HEIGHT,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {/* Emoji Icon */}
                      <span
                        className="text-base leading-none select-none w-5 text-center"
                        style={{
                          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',
                        }}
                      >
                        {space.icon}
                      </span>

                      {/* Name + Badge */}
                      <span className="flex-1 flex items-center gap-1.5 min-w-0">
                        <span
                          className="text-[13px] font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {space.name}
                        </span>

                        {/* Primary badge */}
                        {space.isPrimary && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              background: 'var(--color-accent-primary-subtle)',
                              color: 'var(--color-accent-primary)',
                            }}
                          >
                            Main
                          </span>
                        )}

                        {/* Private indicator */}
                        {!space.isPublic && (
                          <Lock
                            size={10}
                            strokeWidth={2.5}
                            style={{
                              color: 'var(--color-text-muted)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </span>

                      {/* Keyboard shortcut */}
                      {index < 9 && (
                        <span
                          className="text-[10px] font-mono tracking-tight"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          ⌘{index + 1}
                        </span>
                      )}

                      {/* Active checkmark */}
                      <span
                        className="w-4 flex justify-center"
                        style={{ color: 'var(--color-accent-primary)' }}
                      >
                        {isActive && <Check size={14} strokeWidth={3} />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: 'var(--color-border-default)',
                  margin: '0 8px',
                }}
              />

              {/* Actions */}
              <div className="py-1.5">
                {/* New Space */}
                <motion.button
                  ref={el => { itemRefs.current[sortedSpaces.length] = el; }}
                  role="option"
                  onClick={() => {
                    onCreateSpace();
                    setIsOpen(false);
                  }}
                  initial={false}
                  animate={{
                    backgroundColor: focusedIndex === sortedSpaces.length
                      ? 'var(--color-bg-subtle)'
                      : 'transparent',
                  }}
                  whileHover={{
                    backgroundColor: 'var(--color-bg-subtle)',
                  }}
                  transition={{ duration: 0.1 }}
                  className="w-full flex items-center gap-2.5 px-3 text-left outline-none"
                  style={{
                    height: ITEM_HEIGHT,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span
                    className="w-5 flex justify-center"
                    style={{ color: 'var(--color-accent-primary)' }}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </span>
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    New Space...
                  </span>
                </motion.button>

                {/* Manage Spaces */}
                <motion.button
                  ref={el => { itemRefs.current[sortedSpaces.length + 1] = el; }}
                  role="option"
                  onClick={() => {
                    onManageSpaces();
                    setIsOpen(false);
                  }}
                  initial={false}
                  animate={{
                    backgroundColor: focusedIndex === sortedSpaces.length + 1
                      ? 'var(--color-bg-subtle)'
                      : 'transparent',
                  }}
                  whileHover={{
                    backgroundColor: 'var(--color-bg-subtle)',
                  }}
                  transition={{ duration: 0.1 }}
                  className="w-full flex items-center gap-2.5 px-3 text-left outline-none"
                  style={{
                    height: ITEM_HEIGHT,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span
                    className="w-5 flex justify-center"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Settings2 size={14} strokeWidth={2} />
                  </span>
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Manage Spaces...
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpaceSwitcher;
