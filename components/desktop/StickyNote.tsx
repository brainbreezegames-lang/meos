'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEditContextSafe } from '@/contexts/EditContext';
import { SPRING, REDUCED_MOTION } from '@/lib/animations';

// Sticky note colors - warm, refined palette
const STICKY_COLORS = {
  yellow: {
    bg: '#fffef5',
    headerBg: '#fef9e7',
    text: '#78350f',
    lineColor: 'rgba(120, 53, 15, 0.12)',
    accentColor: '#f59e0b',
  },
  blue: {
    bg: '#f8fbff',
    headerBg: '#eef5fc',
    text: '#1e3a5f',
    lineColor: 'rgba(30, 58, 95, 0.12)',
    accentColor: '#3b82f6',
  },
  green: {
    bg: '#f5fff8',
    headerBg: '#edfcf2',
    text: '#14532d',
    lineColor: 'rgba(20, 83, 45, 0.12)',
    accentColor: '#22c55e',
  },
  pink: {
    bg: '#fff8fb',
    headerBg: '#fceff4',
    text: '#831843',
    lineColor: 'rgba(131, 24, 67, 0.12)',
    accentColor: '#ec4899',
  },
  purple: {
    bg: '#faf8ff',
    headerBg: '#f3f0fc',
    text: '#3b0764',
    lineColor: 'rgba(59, 7, 100, 0.12)',
    accentColor: '#8b5cf6',
  },
  orange: {
    bg: '#fffaf5',
    headerBg: '#fef4eb',
    text: '#7c2d12',
    lineColor: 'rgba(124, 45, 18, 0.12)',
    accentColor: '#f97316',
  },
} as const;

type StickyColor = keyof typeof STICKY_COLORS;

export interface StickyNoteData {
  id: string;
  content: string;
  color: StickyColor;
  positionX: number;
  positionY: number;
  rotation: number;
  zIndex: number;
}

interface StickyNoteProps {
  note: StickyNoteData;
  onUpdate?: (id: string, updates: Partial<StickyNoteData>) => void;
  onDelete?: (id: string) => void;
  onBringToFront?: (id: string) => void;
}

export function StickyNote({ note, onUpdate, onDelete, onBringToFront }: StickyNoteProps) {
  const prefersReducedMotion = useReducedMotion();
  const context = useEditContextSafe();
  const isOwner = context?.isOwner ?? false;

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [localContent, setLocalContent] = useState(note.content);
  const [visualPos, setVisualPos] = useState({ x: note.positionX, y: note.positionY });

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragDataRef = useRef({
    startMouseX: 0,
    startMouseY: 0,
    startItemX: 0,
    startItemY: 0,
  });

  const colors = STICKY_COLORS[note.color];

  // Sync position from props
  useEffect(() => {
    if (!isDragging) {
      setVisualPos({ x: note.positionX, y: note.positionY });
    }
  }, [note.positionX, note.positionY, isDragging]);

  // Focus textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isOwner || isEditing) return;
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();
    onBringToFront?.(note.id);

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    dragDataRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startItemX: note.positionX,
      startItemY: note.positionY,
    };

    setIsDragging(true);
  }, [isOwner, isEditing, note.id, note.positionX, note.positionY, onBringToFront]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const data = dragDataRef.current;

      const deltaXPx = e.clientX - data.startMouseX;
      const deltaYPx = e.clientY - data.startMouseY;

      const deltaXPercent = (deltaXPx / parentRect.width) * 100;
      const deltaYPercent = (deltaYPx / parentRect.height) * 100;

      const newX = Math.max(5, Math.min(95, data.startItemX + deltaXPercent));
      const newY = Math.max(5, Math.min(95, data.startItemY + deltaYPercent));

      setVisualPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      onUpdate?.(note.id, { positionX: visualPos.x, positionY: visualPos.y });
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, note.id, onUpdate, visualPos]);

  const handleDoubleClick = useCallback(() => {
    if (isOwner) {
      setIsEditing(true);
    }
  }, [isOwner]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localContent !== note.content) {
      onUpdate?.(note.id, { content: localContent.slice(0, 140) });
    }
  }, [localContent, note.content, note.id, onUpdate]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isOwner) {
      e.preventDefault();
      setShowColorPicker(true);
    }
  }, [isOwner]);

  const handleColorChange = useCallback((color: StickyColor) => {
    onUpdate?.(note.id, { color });
    setShowColorPicker(false);
  }, [note.id, onUpdate]);

  return (
    <>
      <motion.div
        ref={containerRef}
        className="absolute select-none"
        style={{
          left: `${visualPos.x}%`,
          top: `${visualPos.y}%`,
          transform: `translate(-50%, -50%) rotate(${note.rotation}deg)`,
          zIndex: isDragging ? 9999 : note.zIndex,
          cursor: isDragging ? 'grabbing' : isOwner ? 'grab' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        initial={prefersReducedMotion ? REDUCED_MOTION.fade.initial : { scale: 0.5, opacity: 0, y: 20 }}
        animate={prefersReducedMotion
          ? REDUCED_MOTION.fade.animate
          : { scale: isDragging ? 1.05 : 1, opacity: 1, y: isDragging ? -4 : 0 }
        }
        exit={prefersReducedMotion ? REDUCED_MOTION.fade.exit : { scale: 0.5, opacity: 0, y: 10 }}
        transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.bouncy}
      >
        {/* Push pin */}
        <div
          style={{
            position: 'absolute',
            top: -6,
            left: 16,
            zIndex: 10,
          }}
        >
          {/* Pin head */}
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #e74c3c 0%, #c0392b 100%)',
              boxShadow: `
                0 2px 4px rgba(0, 0, 0, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.3),
                inset 0 -1px 2px rgba(0, 0, 0, 0.2)
              `,
              position: 'relative',
            }}
          >
            {/* Pin highlight */}
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 4,
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.4)',
              }}
            />
          </div>
          {/* Pin needle shadow */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              height: 6,
              background: 'linear-gradient(180deg, #888 0%, transparent 100%)',
              opacity: 0.3,
            }}
          />
        </div>

        {/* Note body - paper style */}
        <div
          style={{
            width: 160,
            minHeight: 140,
            background: colors.bg,
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDragging
              ? `
                0 15px 35px rgba(0, 0, 0, 0.2),
                0 5px 15px rgba(0, 0, 0, 0.1),
                -1px 0 0 rgba(0, 0, 0, 0.03)
              `
              : `
                0 4px 12px rgba(0, 0, 0, 0.1),
                0 1px 3px rgba(0, 0, 0, 0.08),
                -1px 0 0 rgba(0, 0, 0, 0.03)
              `,
          }}
        >
          {/* Header section */}
          <div
            style={{
              padding: '12px 12px 8px 12px',
              background: colors.headerBg,
              borderBottom: `1px solid ${colors.lineColor}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {/* Checkbox icon */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                border: `2px solid ${colors.accentColor}`,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ opacity: 0.9 }}
              >
                <path
                  d="M2 6L5 9L10 3"
                  stroke={colors.accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.text,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              Todo List
            </span>
          </div>

          {/* Content area with ruled lines */}
          <div
            style={{
              position: 'relative',
              padding: '10px 12px 12px 12px',
              minHeight: 80,
            }}
          >
            {/* Ruled lines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: `repeating-linear-gradient(
                  to bottom,
                  transparent,
                  transparent 21px,
                  ${colors.lineColor} 21px,
                  ${colors.lineColor} 22px
                )`,
                backgroundPosition: '0 10px',
              }}
            />

            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value.slice(0, 140))}
                onBlur={handleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setLocalContent(note.content);
                    setIsEditing(false);
                  }
                }}
                className="w-full h-full bg-transparent border-none outline-none resize-none"
                style={{
                  fontFamily: '"Marker Felt", "Comic Sans MS", "Bradley Hand", cursive',
                  fontSize: 15,
                  lineHeight: '22px',
                  color: colors.accentColor,
                  fontWeight: 700,
                  position: 'relative',
                  zIndex: 1,
                  minHeight: '66px',
                }}
                maxLength={140}
                placeholder="Write something..."
              />
            ) : (
              <p
                style={{
                  fontFamily: '"Marker Felt", "Comic Sans MS", "Bradley Hand", cursive',
                  fontSize: 15,
                  lineHeight: '22px',
                  color: colors.accentColor,
                  fontWeight: 700,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  position: 'relative',
                  zIndex: 1,
                  minHeight: '44px',
                }}
              >
                {note.content || (isOwner ? 'Double-click to edit...' : '')}
              </p>
            )}

            {/* Character count when editing */}
            {isEditing && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 8,
                  fontSize: 9,
                  color: colors.text,
                  opacity: 0.4,
                  zIndex: 2,
                }}
              >
                {localContent.length}/140
              </div>
            )}
          </div>

          {/* Paper fold effect in corner */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)`,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Delete button (owner only, on hover) */}
        {isOwner && !isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(note.id);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            style={{
              background: 'rgba(239, 68, 68, 0.95)',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            x
          </button>
        )}
      </motion.div>

      {/* Color Picker Popup */}
      <AnimatePresence>
        {showColorPicker && (
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowColorPicker(false)}
            />
            <motion.div
              className="fixed z-[9999] p-2 rounded-lg flex gap-1"
              style={{
                left: `${visualPos.x}%`,
                top: `${visualPos.y + 8}%`,
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            >
              {(Object.keys(STICKY_COLORS) as StickyColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: STICKY_COLORS[color].accentColor,
                    border: note.color === color ? '2px solid #333' : '1px solid rgba(0,0,0,0.15)',
                  }}
                />
              ))}
              <div className="w-px h-6 bg-black/10 mx-1" />
              <button
                onClick={() => {
                  onDelete?.(note.id);
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  fontSize: '12px',
                }}
              >
                x
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Container component that manages multiple sticky notes
interface StickyNotesContainerProps {
  notes: StickyNoteData[];
  onNotesChange?: (notes: StickyNoteData[]) => void;
  maxNotes?: number;
}

export function StickyNotesContainer({ notes, onNotesChange, maxNotes = 5 }: StickyNotesContainerProps) {
  const prefersReducedMotion = useReducedMotion();
  const context = useEditContextSafe();
  const isOwner = context?.isOwner ?? false;
  const [localNotes, setLocalNotes] = useState(notes);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleUpdate = useCallback((id: string, updates: Partial<StickyNoteData>) => {
    const newNotes = localNotes.map(n =>
      n.id === id ? { ...n, ...updates } : n
    );
    setLocalNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [localNotes, onNotesChange]);

  const handleDelete = useCallback((id: string) => {
    const newNotes = localNotes.filter(n => n.id !== id);
    setLocalNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [localNotes, onNotesChange]);

  const handleBringToFront = useCallback((id: string) => {
    const maxZ = Math.max(...localNotes.map(n => n.zIndex), 0);
    const newNotes = localNotes.map(n =>
      n.id === id ? { ...n, zIndex: maxZ + 1 } : n
    );
    setLocalNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [localNotes, onNotesChange]);

  const addNote = useCallback(() => {
    if (localNotes.length >= maxNotes) {
      context?.showToast?.(`Maximum ${maxNotes} sticky notes allowed`, 'info');
      return;
    }

    const newNote: StickyNoteData = {
      id: `sticky-${Date.now()}`,
      content: '',
      color: 'yellow',
      positionX: 20 + Math.random() * 60,
      positionY: 20 + Math.random() * 50,
      rotation: -3 + Math.random() * 6,
      zIndex: Math.max(...localNotes.map(n => n.zIndex), 0) + 1,
    };

    const newNotes = [...localNotes, newNote];
    setLocalNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [localNotes, maxNotes, onNotesChange, context]);

  return (
    <>
      <AnimatePresence>
        {localNotes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onBringToFront={handleBringToFront}
          />
        ))}
      </AnimatePresence>

      {/* Add note button (owner only) */}
      {isOwner && localNotes.length < maxNotes && (
        <motion.button
          onClick={addNote}
          className="fixed bottom-24 right-4 w-10 h-10 rounded-full flex items-center justify-center z-[100]"
          style={{
            background: 'linear-gradient(145deg, #fffef5, #fef9e7)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255,255,255,0.8)',
            fontSize: '20px',
            color: '#78350f',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          title="Add sticky note"
        >
          +
        </motion.button>
      )}
    </>
  );
}

export { STICKY_COLORS };
export type { StickyColor };
