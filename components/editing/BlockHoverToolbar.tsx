'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BLOCK_DEFINITIONS } from '@/types/blocks';
import type { BlockData } from '@/types';

interface BlockHoverToolbarProps {
  block: BlockData;
  isVisible: boolean;
  position: 'left' | 'top';
  onDragStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function BlockHoverToolbar({
  block,
  isVisible,
  position = 'left',
  onDragStart,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: BlockHoverToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const blockDef = BLOCK_DEFINITIONS.find(d => d.type === block.type);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (!showMenu) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showMenu]);

  const isLeftPosition = position === 'left';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute z-[50] flex items-center ${
            isLeftPosition
              ? '-left-8 top-1/2 -translate-y-1/2 flex-col gap-px'
              : '-top-8 left-1/2 -translate-x-1/2 flex-row gap-px'
          }`}
          initial={{ opacity: 0, x: isLeftPosition ? 4 : 0, y: isLeftPosition ? 0 : 4 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isLeftPosition ? 4 : 0, y: isLeftPosition ? 0 : 4 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Container with unified background */}
          <div
            className="flex items-center rounded-md overflow-hidden"
            style={{
              flexDirection: isLeftPosition ? 'column' : 'row',
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: `
                0 0 0 0.5px rgba(0, 0, 0, 0.1),
                0 2px 8px -2px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset
              `,
            }}
          >
            {/* Drag handle */}
            <ToolbarButton
              onClick={() => {}}
              onMouseDown={onDragStart}
              icon={
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" opacity="0.5">
                  <circle cx="4" cy="2.5" r="1" />
                  <circle cx="8" cy="2.5" r="1" />
                  <circle cx="4" cy="6" r="1" />
                  <circle cx="8" cy="6" r="1" />
                  <circle cx="4" cy="9.5" r="1" />
                  <circle cx="8" cy="9.5" r="1" />
                </svg>
              }
              title="Drag to reorder"
              className="cursor-grab active:cursor-grabbing"
            />

            {/* More menu trigger */}
            <div className="relative" ref={menuRef}>
              <ToolbarButton
                onClick={() => setShowMenu(!showMenu)}
                isActive={showMenu}
                icon={
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="2" cy="6" r="1.2" />
                    <circle cx="6" cy="6" r="1.2" />
                    <circle cx="10" cy="6" r="1.2" />
                  </svg>
                }
                title="More options"
              />

              {/* Dropdown menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    className={`absolute ${
                      isLeftPosition
                        ? 'left-[calc(100%+6px)] top-0'
                        : 'top-[calc(100%+6px)] left-1/2 -translate-x-1/2'
                    }`}
                    style={{
                      width: 180,
                      borderRadius: 8,
                      background: 'var(--bg-glass-elevated)',
                      backdropFilter: 'blur(72px) saturate(190%)',
                      WebkitBackdropFilter: 'blur(72px) saturate(190%)',
                      boxShadow: `
                        0 0 0 0.5px rgba(0, 0, 0, 0.12),
                        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                        0 12px 40px -8px rgba(0, 0, 0, 0.25)
                      `,
                      overflow: 'hidden',
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  >
                    {/* Block type header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2"
                      style={{
                        borderBottom: '0.5px solid var(--border-light)',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                      }}
                    >
                      <span className="text-xs">{blockDef?.icon || '?'}</span>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {blockDef?.label || block.type}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      {onEdit && (
                        <MenuItem
                          icon={<EditIcon />}
                          label="Edit block"
                          shortcut="E"
                          onClick={() => { onEdit(); setShowMenu(false); }}
                        />
                      )}

                      {onDuplicate && (
                        <MenuItem
                          icon={<DuplicateIcon />}
                          label="Duplicate"
                          shortcut="⌘D"
                          onClick={() => { onDuplicate(); setShowMenu(false); }}
                        />
                      )}

                      {(onMoveUp || onMoveDown) && (
                        <>
                          <div
                            className="mx-2 my-1"
                            style={{ height: 0.5, background: 'var(--border-light)' }}
                          />
                          {onMoveUp && (
                            <MenuItem
                              icon={<MoveUpIcon />}
                              label="Move up"
                              shortcut="⌥↑"
                              onClick={() => { onMoveUp(); setShowMenu(false); }}
                            />
                          )}
                          {onMoveDown && (
                            <MenuItem
                              icon={<MoveDownIcon />}
                              label="Move down"
                              shortcut="⌥↓"
                              onClick={() => { onMoveDown(); setShowMenu(false); }}
                            />
                          )}
                        </>
                      )}

                      {onDelete && (
                        <>
                          <div
                            className="mx-2 my-1"
                            style={{ height: 0.5, background: 'var(--border-light)' }}
                          />
                          <MenuItem
                            icon={<DeleteIcon />}
                            label="Delete"
                            shortcut="⌫"
                            onClick={() => { onDelete(); setShowMenu(false); }}
                            destructive
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolbarButton({
  icon,
  onClick,
  onMouseDown,
  isActive,
  title,
  className = '',
}: {
  icon: React.ReactNode;
  onClick: () => void;
  onMouseDown?: () => void;
  isActive?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      className={`w-6 h-6 flex items-center justify-center transition-colors ${className}`}
      style={{
        color: isActive ? '#007AFF' : 'var(--text-tertiary)',
        background: isActive ? 'rgba(0,122,255,0.1)' : 'transparent',
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={title}
    >
      {icon}
    </button>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  shortcut?: string;
}

function MenuItem({ icon, label, onClick, destructive, shortcut }: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors"
      style={{
        color: destructive ? '#FF3B30' : 'var(--text-primary)',
        background: isHovered
          ? destructive
            ? 'rgba(255, 59, 48, 0.08)'
            : 'rgba(0, 122, 255, 0.08)'
          : 'transparent',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ opacity: destructive ? 0.9 : 0.6 }}>{icon}</span>
      <span
        className="flex-1"
        style={{ fontSize: 13, letterSpacing: '-0.01em' }}
      >
        {label}
      </span>
      {shortcut && (
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
          }}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}

// Icon components for cleaner JSX
function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M10 2l2 2M2 12l.5-2L10 2.5l2 2L4.5 12 2 12z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" />
      <path d="M9.5 4.5V3a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 3v5A1.5 1.5 0 003 9.5h1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoveUpIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 11V3M4 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoveDownIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M7 3v8M4 8l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2.5 4h9M5.5 4V2.5a1 1 0 011-1h1a1 1 0 011 1V4M4 4v7.5a1 1 0 001 1h4a1 1 0 001-1V4" strokeLinecap="round" />
    </svg>
  );
}

// Refined inline delete button
export function InlineDeleteButton({
  isVisible,
  onClick,
}: {
  isVisible: boolean;
  onClick: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="absolute -right-1.5 -top-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            background: 'linear-gradient(180deg, #FF6259 0%, #FF3B30 100%)',
            boxShadow: `
              0 0 0 0.5px rgba(0, 0, 0, 0.1),
              0 2px 6px -1px rgba(255, 59, 48, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.25)
            `,
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: `
              0 0 0 0.5px rgba(0, 0, 0, 0.1),
              0 3px 10px -1px rgba(255, 59, 48, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.25)
            `,
          }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-2 h-2 text-white"
            viewBox="0 0 8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" strokeLinecap="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
