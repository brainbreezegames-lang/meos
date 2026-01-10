'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditContextSafe } from '@/contexts/EditContext';

// Sticky note colors matching macOS Stickies
const STICKY_COLORS = {
  yellow: { bg: '#FFFC79', text: '#333' },
  blue: { bg: '#7AFCFF', text: '#1a3a4a' },
  green: { bg: '#7AFF7A', text: '#1a3a1a' },
  pink: { bg: '#FF7AFF', text: '#3a1a3a' },
  purple: { bg: '#D4AAFF', text: '#2a1a3a' },
  orange: { bg: '#FFBE38', text: '#3a2a1a' },
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
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isDragging ? 1.05 : 1,
          opacity: 1,
          y: isDragging ? -5 : 0,
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Pin */}
        <div
          className="absolute -top-2 left-3 text-base z-10"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
        >
          📌
        </div>

        {/* Note body */}
        <div
          className="relative overflow-hidden"
          style={{
            width: '180px',
            minHeight: '120px',
            padding: '28px 12px 12px 12px',
            background: colors.bg,
            borderRadius: '2px',
            boxShadow: isDragging
              ? '0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
              : '0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
            fontFamily: '"Marker Felt", "Comic Sans MS", cursive',
            fontSize: '14px',
            lineHeight: '1.4',
            color: colors.text,
          }}
        >
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
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                color: 'inherit',
                minHeight: '80px',
              }}
              maxLength={140}
              placeholder="Write something..."
            />
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {note.content || (isOwner ? 'Double-click to edit...' : '')}
            </p>
          )}

          {/* Character count when editing */}
          {isEditing && (
            <div
              className="absolute bottom-1 right-2 text-xs opacity-50"
              style={{ fontSize: '10px' }}
            >
              {localContent.length}/140
            </div>
          )}
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
              background: 'rgba(255, 59, 48, 0.9)',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ×
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
                background: 'rgba(30, 30, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {(Object.keys(STICKY_COLORS) as StickyColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: STICKY_COLORS[color].bg,
                    border: note.color === color ? '2px solid white' : '1px solid rgba(0,0,0,0.2)',
                  }}
                />
              ))}
              <div className="w-px h-6 bg-white/20 mx-1" />
              <button
                onClick={() => {
                  onDelete?.(note.id);
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  background: 'rgba(255, 59, 48, 0.9)',
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                🗑
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
            background: 'rgba(255, 252, 121, 0.9)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            fontSize: '20px',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
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
