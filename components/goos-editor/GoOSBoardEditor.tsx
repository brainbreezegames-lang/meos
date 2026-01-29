'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  GripVertical,
  X,
  CheckSquare,
  Square,
  AlignLeft,
  ListChecks,
  Palette,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';
import type {
  BoardContent,
  BoardColumn,
  BoardCard,
  BoardCardColor,
  BoardCardChecklistItem,
} from '@/lib/validations/goos';
import { getDefaultBoardContent } from '@/lib/validations/goos';

const CARD_COLORS: Record<BoardCardColor, { bg: string; border: string; text: string; dot: string }> = {
  red: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', dot: '#ef4444' },
  orange: { bg: '#fff7ed', border: '#fdba74', text: '#ea580c', dot: '#f97316' },
  yellow: { bg: '#fefce8', border: '#fde047', text: '#ca8a04', dot: '#eab308' },
  green: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a', dot: '#22c55e' },
  blue: { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb', dot: '#3b82f6' },
  purple: { bg: '#faf5ff', border: '#d8b4fe', text: '#9333ea', dot: '#a855f7' },
  pink: { bg: '#fdf2f8', border: '#f9a8d4', text: '#db2777', dot: '#ec4899' },
  gray: { bg: '#f9fafb', border: '#d1d5db', text: '#4b5563', dot: '#6b7280' },
};

export interface GoOSFile {
  id: string;
  type: 'board';
  title: string;
  content: string;
  status: PublishStatus;
  accessLevel?: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
}

interface GoOSBoardEditorProps {
  file: GoOSFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (file: Partial<GoOSFile>) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
}

// ─── Card Detail Modal ───────────────────────────────────────
function CardDetailModal({
  card,
  onUpdate,
  onDelete,
  onClose,
}: {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const handleSave = () => {
    onUpdate({ title: title.trim() || 'Untitled', description: description.trim() || undefined });
    onClose();
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const item: BoardCardChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem.trim(),
      checked: false,
    };
    onUpdate({ checklist: [...(card.checklist || []), item] });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    onUpdate({
      checklist: card.checklist?.map((i) =>
        i.id === itemId ? { ...i, checked: !i.checked } : i
      ),
    });
  };

  const removeChecklistItem = (itemId: string) => {
    onUpdate({ checklist: card.checklist?.filter((i) => i.id !== itemId) });
  };

  const completedCount = card.checklist?.filter((i) => i.checked).length || 0;
  const totalCount = card.checklist?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-elevated, #fff)',
          borderRadius: 16,
          width: 'min(520px, 90vw)',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 12px' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onUpdate({ title: title.trim() || 'Untitled' })}
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: 0,
            }}
            placeholder="Card title..."
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Color picker */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Palette size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Color</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => onUpdate({ color: undefined })}
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'var(--color-bg-base)',
                border: `2px solid ${!card.color ? 'var(--color-accent-primary)' : 'var(--color-border-default)'}`,
                cursor: 'pointer', fontSize: 10,
              }}
            >
              ✕
            </button>
            {(Object.keys(CARD_COLORS) as BoardCardColor[]).map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ color })}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: CARD_COLORS[color].dot,
                  border: `2px solid ${card.color === color ? '#fff' : 'transparent'}`,
                  boxShadow: card.color === color ? `0 0 0 2px ${CARD_COLORS[color].dot}` : 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlignLeft size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>Description</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => onUpdate({ description: description.trim() || undefined })}
            placeholder="Add a description..."
            rows={3}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 8,
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* Checklist */}
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ListChecks size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
              Checklist {totalCount > 0 && `(${completedCount}/${totalCount})`}
            </span>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div style={{ height: 6, background: 'var(--color-bg-subtle)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{
                width: `${(completedCount / totalCount) * 100}%`,
                height: '100%',
                background: completedCount === totalCount ? '#22c55e' : 'var(--color-accent-primary)',
                transition: 'width 0.2s ease',
                borderRadius: 3,
              }} />
            </div>
          )}

          {/* Items */}
          {card.checklist?.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <button
                onClick={() => toggleChecklistItem(item.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: item.checked ? '#22c55e' : 'var(--color-text-muted)', padding: 0, flexShrink: 0 }}
              >
                {item.checked ? <CheckSquare size={16} /> : <Square size={16} />}
              </button>
              <span style={{
                flex: 1, fontSize: 13, fontFamily: 'var(--font-body)',
                color: item.checked ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                textDecoration: item.checked ? 'line-through' : 'none',
              }}>
                {item.text}
              </span>
              <button
                onClick={() => removeChecklistItem(item.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, opacity: 0.5 }}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Add new item */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addChecklistItem(); }}
              placeholder="Add an item..."
              style={{
                flex: 1, padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-body)',
                border: '1px solid var(--color-border-default)', borderRadius: 6, outline: 'none',
                background: 'var(--color-bg-base)',
              }}
            />
            <button
              onClick={addChecklistItem}
              disabled={!newChecklistItem.trim()}
              style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
                background: newChecklistItem.trim() ? 'var(--color-accent-primary)' : 'var(--color-bg-subtle)',
                color: newChecklistItem.trim() ? '#fff' : 'var(--color-text-muted)',
                border: 'none', borderRadius: 6, cursor: newChecklistItem.trim() ? 'pointer' : 'default',
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px 20px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <button
            onClick={() => { onDelete(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              fontSize: 12, fontFamily: 'var(--font-body)', color: '#dc2626',
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            Delete Card
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 24px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: 'var(--color-accent-primary)', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sortable Card ───────────────────────────────────────────
function SortableCard({
  card,
  columnId,
  onOpenDetail,
}: {
  card: BoardCard;
  columnId: string;
  onOpenDetail: (card: BoardCard) => void;
}) {
  const colorStyle = card.color ? CARD_COLORS[card.color] : null;
  const completedCount = card.checklist?.filter((i) => i.checked).length || 0;
  const totalCount = card.checklist?.length || 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        onClick={() => onOpenDetail(card)}
        style={{
          padding: '10px 12px',
          background: colorStyle?.bg || 'var(--color-bg-base, #fff)',
          borderRadius: 8,
          border: `1px solid ${colorStyle?.border || 'var(--color-border-default)'}`,
          cursor: isDragging ? 'grabbing' : 'pointer',
          boxShadow: isDragging
            ? '0 12px 24px rgba(0,0,0,0.15)'
            : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.15s ease',
        }}
      >
        {/* Color stripe */}
        {card.color && (
          <div style={{
            height: 3, borderRadius: 2, marginBottom: 8,
            background: CARD_COLORS[card.color].dot,
          }} />
        )}

        {/* Title */}
        <div style={{
          fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.4,
        }}>
          {card.title}
        </div>

        {/* Description indicator */}
        {card.description && (
          <div style={{
            fontSize: 11, color: 'var(--color-text-muted)',
            marginTop: 6, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {card.description}
          </div>
        )}

        {/* Badges row */}
        {(totalCount > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            {totalCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontFamily: 'var(--font-body)',
                color: completedCount === totalCount ? '#22c55e' : 'var(--color-text-muted)',
                background: completedCount === totalCount ? '#f0fdf4' : 'var(--color-bg-subtle)',
                padding: '2px 8px', borderRadius: 4,
              }}>
                <CheckSquare size={11} />
                {completedCount}/{totalCount}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────
function DroppableColumn({
  column,
  children,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
}: {
  column: BoardColumn;
  children: React.ReactNode;
  onAddCard: (columnId: string) => void;
  onEditColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  const handleSaveTitle = () => {
    if (editTitle.trim() !== column.title) {
      onEditColumn(column.id, editTitle.trim() || column.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        background: isOver ? 'rgba(59, 130, 246, 0.06)' : 'var(--color-bg-subtle)',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
        border: isOver ? '2px dashed rgba(59, 130, 246, 0.3)' : '2px solid transparent',
        transition: 'background 0.15s, border 0.15s',
      }}
    >
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, paddingBottom: 8,
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        {isEditingTitle ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') { setEditTitle(column.title); setIsEditingTitle(false); }
            }}
            style={{
              flex: 1, padding: '4px 8px', fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--color-accent-primary)',
              borderRadius: 4, outline: 'none',
              background: 'var(--color-bg-base)',
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditingTitle(true)}
            style={{
              flex: 1, fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              cursor: 'text',
            }}
          >
            {column.title}
          </span>
        )}
        <span style={{
          fontSize: 11, color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          background: 'var(--color-bg-base)',
          padding: '2px 8px', borderRadius: 10,
        }}>
          {column.cards.length}
        </span>
        <button
          onClick={() => onDeleteColumn(column.id)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', padding: 4, borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.5,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Cards droppable area */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 8,
          minHeight: 60,
          padding: 2,
        }}
      >
        {children}
      </div>

      {/* Add card button */}
      <button
        onClick={() => onAddCard(column.id)}
        style={{
          marginTop: 8, padding: '10px 12px',
          background: 'transparent',
          border: '1px dashed var(--color-border-default)',
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 12, fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
          e.currentTarget.style.color = 'var(--color-accent-primary)';
          e.currentTarget.style.background = 'var(--color-accent-primary-muted)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-default)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Plus size={14} />
        Add card
      </button>
    </div>
  );
}

// ─── Main Board Editor ───────────────────────────────────────
export function GoOSBoardEditor({
  file,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  isActive = true,
  zIndex = 100,
  isMaximized = false,
}: GoOSBoardEditorProps) {
  const parsedContent = useMemo(() => {
    try {
      if (file.content) return JSON.parse(file.content) as BoardContent;
    } catch { /* use default */ }
    return getDefaultBoardContent();
  }, [file.content]);

  const [title, setTitle] = useState(file.title);
  const [boardContent, setBoardContent] = useState<BoardContent>(parsedContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(file.updatedAt);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeCardId, setActiveCardId] = useState<UniqueIdentifier | null>(null);
  const [detailCard, setDetailCard] = useState<BoardCard | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track the column the dragged card came from, to avoid repeated moves
  const dragSourceColumnRef = useRef<string | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => { playSound('whoosh'); }, []);

  // Auto-save
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({ title, content: JSON.stringify(boardContent), updatedAt: new Date() });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  }, [title, boardContent, onUpdate]);

  useEffect(() => {
    const currentContent = JSON.stringify(boardContent);
    if (currentContent !== file.content || title !== file.title) triggerSave();
  }, [boardContent, title, file.content, file.title, triggerSave]);

  const handlePublishChange = (status: PublishStatus) => onUpdate({ status });

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) { titleInputRef.current.focus(); titleInputRef.current.select(); }
  }, [isEditingTitle]);

  const startDrag = (event: React.PointerEvent) => { if (!isMaximized) dragControls.start(event); };

  // ─── Board Operations ──────────────────────────────────
  const addColumn = () => {
    setBoardContent((prev) => ({
      columns: [...prev.columns, {
        id: crypto.randomUUID(),
        title: 'New Column',
        cards: [],
        order: prev.columns.length,
      }],
    }));
  };

  const editColumn = (columnId: string, newTitle: string) => {
    setBoardContent((prev) => ({
      columns: prev.columns.map((col) => col.id === columnId ? { ...col, title: newTitle } : col),
    }));
  };

  const deleteColumn = (columnId: string) => {
    setBoardContent((prev) => ({
      columns: prev.columns.filter((col) => col.id !== columnId),
    }));
  };

  const addCard = (columnId: string) => {
    setBoardContent((prev) => ({
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, { id: crypto.randomUUID(), title: 'New Card', order: col.cards.length }] }
          : col
      ),
    }));
  };

  const editCard = (cardId: string, updates: Partial<BoardCard>) => {
    setBoardContent((prev) => ({
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) => card.id === cardId ? { ...card, ...updates } : card),
      })),
    }));
    // Also update the detail modal card if it's open
    if (detailCard?.id === cardId) {
      setDetailCard((prev) => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteCard = (cardId: string) => {
    setBoardContent((prev) => ({
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      })),
    }));
  };

  // ─── Find which column a card is in ────────────────────
  const findColumnByCardId = useCallback((cardId: UniqueIdentifier): string | null => {
    for (const col of boardContent.columns) {
      if (col.cards.some((c) => c.id === cardId)) return col.id;
    }
    return null;
  }, [boardContent.columns]);

  // ─── DnD Handlers ─────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const columnId = findColumnByCardId(event.active.id);
    dragSourceColumnRef.current = columnId;
    setActiveCardId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overData = over.data.current as { type?: string; columnId?: string } | undefined;

    // Determine which column the "over" target belongs to
    let overColumnId: string | null = null;
    if (overData?.type === 'column') {
      overColumnId = overData.columnId || null;
    } else if (overData?.type === 'card') {
      overColumnId = overData.columnId || null;
    }
    if (!overColumnId) return;

    setBoardContent((prev) => {
      // Find which column currently holds the active card
      let activeColIndex = -1;
      let activeCardIndex = -1;
      for (let ci = 0; ci < prev.columns.length; ci++) {
        const idx = prev.columns[ci].cards.findIndex((c) => c.id === active.id);
        if (idx >= 0) { activeColIndex = ci; activeCardIndex = idx; break; }
      }
      if (activeColIndex < 0) return prev;

      const targetColIndex = prev.columns.findIndex((c) => c.id === overColumnId);
      if (targetColIndex < 0) return prev;

      // Same column — no cross-column move needed here (handled in dragEnd)
      if (activeColIndex === targetColIndex) return prev;

      // Move card from source to target column
      const card = prev.columns[activeColIndex].cards[activeCardIndex];
      const newColumns = prev.columns.map((col, ci) => {
        if (ci === activeColIndex) {
          return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
        }
        if (ci === targetColIndex) {
          const newCards = [...col.cards];
          // If hovering over a specific card, insert at that position
          if (overData?.type === 'card') {
            const overIdx = newCards.findIndex((c) => c.id === over.id);
            if (overIdx >= 0) {
              newCards.splice(overIdx, 0, card);
            } else {
              newCards.push(card);
            }
          } else {
            newCards.push(card);
          }
          return { ...col, cards: newCards };
        }
        return col;
      });

      return { columns: newColumns };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    dragSourceColumnRef.current = null;
    setActiveCardId(null);
    if (!over || active.id === over.id) return;

    const overData = over.data.current as { type?: string; columnId?: string } | undefined;

    // Card reordering within same column
    if (overData?.type === 'card') {
      setBoardContent((prev) => {
        // Find column containing the active card
        let colIndex = -1;
        for (let ci = 0; ci < prev.columns.length; ci++) {
          if (prev.columns[ci].cards.some((c) => c.id === active.id)) { colIndex = ci; break; }
        }
        if (colIndex < 0) return prev;

        const col = prev.columns[colIndex];
        const oldIndex = col.cards.findIndex((c) => c.id === active.id);
        const newIndex = col.cards.findIndex((c) => c.id === over.id);
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;

        const newColumns = [...prev.columns];
        newColumns[colIndex] = { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
        return { columns: newColumns };
      });
    }
  };

  // Find active card for overlay
  const activeCard = useMemo(() => {
    if (!activeCardId) return null;
    for (const col of boardContent.columns) {
      const card = col.cards.find((c) => c.id === activeCardId);
      if (card) return card;
    }
    return null;
  }, [activeCardId, boardContent.columns]);

  const totalCards = boardContent.columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <>
      <motion.div
        drag={!isMaximized}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={false}
        dragElastic={0}
        dragMomentum={false}
        initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
        animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
        exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
        transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
        style={{
          position: 'fixed',
          top: isMaximized ? 'var(--menubar-height, 40px)' : '5%',
          left: isMaximized ? 0 : '50%',
          x: isMaximized ? 0 : '-50%',
          width: isMaximized ? '100%' : 'min(1200px, 95vw)',
          height: isMaximized
            ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))'
            : 'min(85vh, 800px)',
          minWidth: 600,
          background: WINDOW.background,
          border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
          borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
          boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
          zIndex,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
        }}
      >
        {/* Title Bar */}
        <div
          onPointerDown={startDrag}
          style={{
            display: 'flex', alignItems: 'center',
            padding: `0 ${TITLE_BAR.paddingX}px`, height: TITLE_BAR.height,
            background: TITLE_BAR.background, borderBottom: TITLE_BAR.borderBottom,
            gap: 12, cursor: isMaximized ? 'default' : 'grab',
            flexShrink: 0, touchAction: 'none',
          }}
        >
          <TrafficLights onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} isMaximized={isMaximized} variant="macos" />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingTitle(false); }}
                style={{
                  flex: 1, padding: '4px 8px',
                  fontSize: 'var(--font-size-md, 14px)', fontWeight: 600,
                  fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-base)', border: '1.5px solid var(--color-accent-primary)',
                  borderRadius: 6, outline: 'none',
                }}
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                style={{
                  fontSize: TITLE_BAR.titleFontSize, fontWeight: TITLE_BAR.titleFontWeight,
                  fontFamily: 'var(--font-body)', color: TITLE_BAR.titleColor,
                  opacity: TITLE_BAR.titleOpacityActive, cursor: 'text',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                title="Click to edit title"
              >
                {title || 'Untitled Board'}
              </span>
            )}
            <GoOSPublishBadge status={file.status} />
          </div>

          <GoOSAutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
          <GoOSPublishToggle status={file.status} onChange={handlePublishChange} />
        </div>

        {/* Board Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, background: 'var(--color-bg-base)' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: '100%' }}>
              {boardContent.columns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  onAddCard={addCard}
                  onEditColumn={editColumn}
                  onDeleteColumn={deleteColumn}
                >
                  <SortableContext
                    items={column.cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {column.cards.map((card) => (
                      <SortableCard
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        onOpenDetail={setDetailCard}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              ))}

              {/* Add column button */}
              <button
                onClick={addColumn}
                style={{
                  minWidth: 280, padding: 16, background: 'transparent',
                  border: '2px dashed var(--color-border-default)', borderRadius: 12,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)', transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
                  e.currentTarget.style.color = 'var(--color-accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-default)';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                <Plus size={18} />
                Add Column
              </button>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeCard && (
                <div style={{
                  padding: '10px 12px', background: 'var(--color-bg-elevated, #fff)',
                  borderRadius: 8, border: '1px solid var(--color-border-default)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)', width: 256,
                  transform: 'rotate(3deg)',
                }}>
                  {activeCard.color && (
                    <div style={{ height: 3, borderRadius: 2, marginBottom: 8, background: CARD_COLORS[activeCard.color].dot }} />
                  )}
                  <div style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}>
                    {activeCard.title}
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px', borderTop: '1px solid rgba(23, 20, 18, 0.06)',
          background: 'rgba(23, 20, 18, 0.02)', fontSize: 10,
          fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>{boardContent.columns.length} columns</span>
            <span>{totalCards} cards</span>
          </div>
          <span style={{ fontSize: 11, opacity: 0.6 }}>goOS Board</span>
        </div>
      </motion.div>

      {/* Card detail modal */}
      <AnimatePresence>
        {detailCard && (
          <CardDetailModal
            card={detailCard}
            onUpdate={(updates) => editCard(detailCard.id, updates)}
            onDelete={() => deleteCard(detailCard.id)}
            onClose={() => setDetailCard(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default GoOSBoardEditor;
