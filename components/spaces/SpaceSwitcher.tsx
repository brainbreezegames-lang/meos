'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, Lock, Plus, Settings2 } from 'lucide-react';
import { buttonPress } from '@/lib/animations';
import { MenuBarDropdown } from '@/components/menubar';

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
  // Controlled mode props (from useMenuBarState)
  isOpen?: boolean;
  onToggle?: () => void;
  onMouseEnterTrigger?: () => void;
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
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onMouseEnterTrigger,
}: SpaceSwitcherProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const close = useCallback(() => {
    if (isControlled) {
      if (controlledIsOpen) controlledOnToggle?.();
    } else {
      setUncontrolledIsOpen(false);
    }
  }, [isControlled, controlledIsOpen, controlledOnToggle]);

  const toggle = useCallback(() => {
    if (isControlled) {
      controlledOnToggle?.();
    } else {
      setUncontrolledIsOpen((prev) => !prev);
    }
  }, [isControlled, controlledOnToggle]);

  // Memoize derived data
  const activeSpace = useMemo(
    () => spaces.find(s => s.id === activeSpaceId),
    [spaces, activeSpaceId]
  );

  const sortedSpaces = useMemo(
    () => [...spaces].sort((a, b) => a.order - b.order),
    [spaces]
  );

  // Reset focusedIndex when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Close on outside click (only in uncontrolled mode)
  useEffect(() => {
    if (isControlled || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let el: HTMLElement | null = target;
      while (el) {
        if (
          el.hasAttribute('data-menubar-trigger') ||
          el.hasAttribute('data-menubar-dropdown')
        ) {
          return;
        }
        el = el.parentElement;
      }
      setUncontrolledIsOpen(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isControlled, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          toggle();
          setFocusedIndex(0);
        }
        return;
      }

      const totalItems = sortedSpaces.length + 2;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
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
            close();
          } else if (focusedIndex === sortedSpaces.length) {
            onCreateSpace();
            close();
          } else {
            onManageSpaces();
            close();
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
    [isOpen, sortedSpaces, focusedIndex, onSwitchSpace, onCreateSpace, onManageSpaces, toggle, close]
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

  const handleSpaceClick = useCallback((spaceId: string) => {
    onSwitchSpace(spaceId);
    close();
  }, [onSwitchSpace, close]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        onClick={toggle}
        onMouseEnter={onMouseEnterTrigger}
        onKeyDown={handleKeyDown}
        whileHover={buttonPress.hover}
        whileTap={buttonPress.tap}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current space: ${activeSpace?.name || 'Select space'}`}
        data-menubar-trigger="spaces"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
        style={{
          background: isOpen ? 'var(--color-bg-subtle)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span
          className="text-sm leading-none select-none"
          style={{
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
          }}
        >
          {activeSpace?.icon || '🏠'}
        </span>

        <span
          className="text-[13px] font-semibold tracking-tight max-w-[100px] truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {activeSpace?.name || 'My Space'}
        </span>

        {activeSpace && !activeSpace.isPublic && (
          <Lock
            size={10}
            strokeWidth={2.5}
            style={{ color: 'var(--color-text-muted)' }}
          />
        )}

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronDown size={12} strokeWidth={2.5} />
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <MenuBarDropdown isOpen={isOpen} width={DROPDOWN_WIDTH}>
        <div onKeyDown={handleKeyDown} role="listbox" aria-label="Spaces">
          <div
            className="overflow-y-auto"
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
                  transition={{ duration: 0.08 }}
                  className="w-full flex items-center gap-2.5 px-3 text-left outline-none"
                  style={{
                    height: ITEM_HEIGHT,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span
                    className="text-base leading-none select-none w-5 text-center"
                    style={{
                      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',
                    }}
                  >
                    {space.icon}
                  </span>

                  <span className="flex-1 flex items-center gap-1.5 min-w-0">
                    <span
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {space.name}
                    </span>

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

                  {index < 9 && (
                    <span
                      className="text-[10px] font-mono tracking-tight"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      ⌘{index + 1}
                    </span>
                  )}

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
              background: 'var(--color-border-subtle)',
              margin: '4px 8px',
            }}
          />

          {/* Actions */}
          <div>
            <motion.button
              ref={el => { itemRefs.current[sortedSpaces.length] = el; }}
              role="option"
              onClick={() => {
                onCreateSpace();
                close();
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
              transition={{ duration: 0.08 }}
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

            <motion.button
              ref={el => { itemRefs.current[sortedSpaces.length + 1] = el; }}
              role="option"
              onClick={() => {
                onManageSpaces();
                close();
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
              transition={{ duration: 0.08 }}
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
        </div>
      </MenuBarDropdown>
    </div>
  );
}

export default SpaceSwitcher;
