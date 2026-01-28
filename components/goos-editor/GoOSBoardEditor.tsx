'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Check,
  Loader2,
  GripVertical,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION, SPRING } from '../desktop/windowStyles';
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

// Card colors mapping
const CARD_COLORS: Record<BoardCardColor, { bg: string; border: string; text: string }> = {
  red: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  orange: { bg: '#fff7ed', border: '#fdba74', text: '#ea580c' },
  yellow: { bg: '#fefce8', border: '#fde047', text: '#ca8a04' },
  green: { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  blue: { bg: '#eff6ff', border: '#93c5fd', text: '#2563eb' },
  purple: { bg: '#faf5ff', border: '#d8b4fe', text: '#9333ea' },
  pink: { bg: '#fdf2f8', border: '#f9a8d4', text: '#db2777' },
  gray: { bg: '#f9fafb', border: '#d1d5db', text: '#4b5563' },
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

// Sortable Card Component
function SortableCard({
  card,
  columnId,
  onEdit,
  onDelete,
  onToggleChecklist,
}: {
  card: BoardCard;
  columnId: string;
  onEdit: (cardId: string, updates: Partial<BoardCard>) => void;
  onDelete: (cardId: string) => void;
  onToggleChecklist: (cardId: string, checklistItemId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [showMenu, setShowMenu] = useState(false);
  const colorStyle = card.color ? CARD_COLORS[card.color] : null;

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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() !== card.title) {
      onEdit(card.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const completedCount = card.checklist?.filter((item) => item.checked).length || 0;
  const totalCount = card.checklist?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: 12,
        background: colorStyle?.bg || 'var(--color-bg-base)',
        borderRadius: 8,
        border: `1px solid ${colorStyle?.border || 'var(--color-border-default)'}`,
        cursor: 'grab',
        position: 'relative',
      }}
      {...attributes}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        style={{
          position: 'absolute',
          top: 8,
          left: 4,
          cursor: 'grab',
          color: 'var(--color-text-muted)',
          opacity: 0.5,
        }}
      >
        <GripVertical size={14} />
      </div>

      {/* Menu button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          padding: 4,
          borderRadius: 4,
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      {/* Card menu dropdown */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: 32,
              right: 8,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-md)',
              padding: 4,
              zIndex: 100,
              minWidth: 120,
            }}
          >
            {/* Color options */}
            <div style={{ display: 'flex', gap: 4, padding: '8px 8px 4px', flexWrap: 'wrap' }}>
              {(Object.keys(CARD_COLORS) as BoardCardColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onEdit(card.id, { color: card.color === color ? undefined : color });
                    setShowMenu(false);
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: CARD_COLORS[color].bg,
                    border: `2px solid ${card.color === color ? CARD_COLORS[color].text : CARD_COLORS[color].border}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '4px 0' }} />
            <button
              onClick={() => {
                onDelete(card.id);
                setShowMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: '#dc2626',
                fontFamily: 'var(--font-body)',
                borderRadius: 4,
              }}
            >
              <Trash2 size={12} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card content */}
      <div style={{ marginLeft: 16, marginRight: 24 }}>
        {isEditing ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setEditTitle(card.title);
                setIsEditing(false);
              }
            }}
            style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--color-accent-primary)',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              color: colorStyle?.text || 'var(--color-text-primary)',
              cursor: 'text',
              lineHeight: 1.4,
            }}
          >
            {card.title}
          </div>
        )}

        {/* Description */}
        {card.description && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            {card.description}
          </div>
        )}

        {/* Checklist progress */}
        {card.checklist && card.checklist.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--color-text-muted)',
                marginBottom: 4,
              }}
            >
              <CheckSquare size={12} />
              <span>
                {completedCount}/{totalCount}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(completedCount / totalCount) * 100}%`,
                    height: '100%',
                    background:
                      completedCount === totalCount
                        ? 'var(--color-success)'
                        : 'var(--color-accent-primary)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
            {card.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleChecklist(card.id, item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 0',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: item.checked
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text-secondary)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                }}
              >
                {item.checked ? (
                  <CheckSquare size={12} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <Square size={12} />
                )}
                {item.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable Column Component
function SortableColumn({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onToggleChecklist,
  onEditColumn,
  onDeleteColumn,
}: {
  column: BoardColumn;
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string, updates: Partial<BoardCard>) => void;
  onDeleteCard: (cardId: string) => void;
  onToggleChecklist: (cardId: string, checklistItemId: string) => void;
  onEditColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() !== column.title) {
      onEditColumn(column.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        width: 280,
        minWidth: 280,
        background: 'var(--color-bg-subtle)',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
      {...attributes}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div {...listeners} style={{ cursor: 'grab', color: 'var(--color-text-muted)' }}>
          <GripVertical size={16} />
        </div>
        {isEditingTitle ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setEditTitle(column.title);
                setIsEditingTitle(false);
              }
            }}
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              border: '1px solid var(--color-accent-primary)',
              borderRadius: 4,
              outline: 'none',
              background: 'var(--color-bg-base)',
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditingTitle(true)}
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              cursor: 'text',
            }}
          >
            {column.title}
          </span>
        )}
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {column.cards.length}
        </span>
        <button
          onClick={() => onDeleteColumn(column.id)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Cards */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 100,
        }}
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
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onToggleChecklist={onToggleChecklist}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card button */}
      <button
        onClick={() => onAddCard(column.id)}
        style={{
          marginTop: 8,
          padding: '10px 12px',
          background: 'transparent',
          border: '1px dashed var(--color-border-default)',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 12,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          transition: 'all 0.15s ease',
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
        <Plus size={14} />
        Add card
      </button>
    </div>
  );
}

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
  // Parse board content from JSON or use default
  const parsedContent = useMemo(() => {
    try {
      if (file.content) {
        return JSON.parse(file.content) as BoardContent;
      }
    } catch {
      // Invalid JSON, use default
    }
    return getDefaultBoardContent();
  }, [file.content]);

  const [title, setTitle] = useState(file.title);
  const [boardContent, setBoardContent] = useState<BoardContent>(parsedContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(file.updatedAt);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeType, setActiveType] = useState<'column' | 'card' | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Play window open sound on mount
  useEffect(() => {
    playSound('whoosh');
  }, []);

  // Auto-save with debounce
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({
        title,
        content: JSON.stringify(boardContent),
        updatedAt: new Date(),
      });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  }, [title, boardContent, onUpdate]);

  // Trigger save on content change
  useEffect(() => {
    const currentContent = JSON.stringify(boardContent);
    if (currentContent !== file.content || title !== file.title) {
      triggerSave();
    }
  }, [boardContent, title, file.content, file.title, triggerSave]);

  // Handle publish status change
  const handlePublishChange = (status: PublishStatus) => {
    onUpdate({ status });
  };

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Start drag from title bar
  const startDrag = (event: React.PointerEvent) => {
    if (!isMaximized) {
      dragControls.start(event);
    }
  };

  // Board operations
  const addColumn = () => {
    const newColumn: BoardColumn = {
      id: crypto.randomUUID(),
      title: 'New Column',
      cards: [],
      order: boardContent.columns.length,
    };
    setBoardContent({ columns: [...boardContent.columns, newColumn] });
  };

  const editColumn = (columnId: string, newTitle: string) => {
    setBoardContent({
      columns: boardContent.columns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      ),
    });
  };

  const deleteColumn = (columnId: string) => {
    setBoardContent({
      columns: boardContent.columns.filter((col) => col.id !== columnId),
    });
  };

  const addCard = (columnId: string) => {
    const column = boardContent.columns.find((col) => col.id === columnId);
    if (!column) return;

    const newCard: BoardCard = {
      id: crypto.randomUUID(),
      title: 'New Card',
      order: column.cards.length,
    };

    setBoardContent({
      columns: boardContent.columns.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
      ),
    });
  };

  const editCard = (cardId: string, updates: Partial<BoardCard>) => {
    setBoardContent({
      columns: boardContent.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
      })),
    });
  };

  const deleteCard = (cardId: string) => {
    setBoardContent({
      columns: boardContent.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      })),
    });
  };

  const toggleChecklist = (cardId: string, checklistItemId: string) => {
    setBoardContent({
      columns: boardContent.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                checklist: card.checklist?.map((item) =>
                  item.id === checklistItemId ? { ...item, checked: !item.checked } : item
                ),
              }
            : card
        ),
      })),
    });
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as { type: 'column' | 'card' };
    setActiveId(active.id);
    setActiveType(data?.type || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as {
      type: 'column' | 'card';
      columnId?: string;
    };
    const overData = over.data.current as {
      type: 'column' | 'card';
      columnId?: string;
    };

    // Only handle card-to-column movement
    if (activeData?.type === 'card' && overData?.type === 'column') {
      const activeColumnId = activeData.columnId;
      const overColumnId = over.id.toString();

      if (activeColumnId !== overColumnId) {
        setBoardContent((prev) => {
          const activeColumn = prev.columns.find((col) => col.id === activeColumnId);
          const overColumn = prev.columns.find((col) => col.id === overColumnId);
          if (!activeColumn || !overColumn) return prev;

          const activeCard = activeColumn.cards.find((c) => c.id === active.id);
          if (!activeCard) return prev;

          return {
            columns: prev.columns.map((col) => {
              if (col.id === activeColumnId) {
                return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
              }
              if (col.id === overColumnId) {
                return { ...col, cards: [...col.cards, activeCard] };
              }
              return col;
            }),
          };
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeData = active.data.current as {
      type: 'column' | 'card';
      columnId?: string;
    };
    const overData = over.data.current as {
      type: 'column' | 'card';
      columnId?: string;
    };

    // Column reordering
    if (activeData?.type === 'column' && overData?.type === 'column') {
      if (active.id !== over.id) {
        setBoardContent((prev) => {
          const oldIndex = prev.columns.findIndex((col) => col.id === active.id);
          const newIndex = prev.columns.findIndex((col) => col.id === over.id);
          return { columns: arrayMove(prev.columns, oldIndex, newIndex) };
        });
      }
    }

    // Card reordering within same column
    if (activeData?.type === 'card' && overData?.type === 'card') {
      const activeColumnId = activeData.columnId;
      const overColumnId = overData.columnId;

      if (activeColumnId === overColumnId) {
        setBoardContent((prev) => ({
          columns: prev.columns.map((col) => {
            if (col.id !== activeColumnId) return col;
            const oldIndex = col.cards.findIndex((c) => c.id === active.id);
            const newIndex = col.cards.findIndex((c) => c.id === over.id);
            return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
          }),
        }));
      }
    }
  };

  // Find active item for overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    if (activeType === 'column') {
      return boardContent.columns.find((col) => col.id === activeId);
    }
    for (const col of boardContent.columns) {
      const card = col.cards.find((c) => c.id === activeId);
      if (card) return card;
    }
    return null;
  }, [activeId, activeType, boardContent.columns]);

  return (
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
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${TITLE_BAR.paddingX}px`,
          height: TITLE_BAR.height,
          background: TITLE_BAR.background,
          borderBottom: TITLE_BAR.borderBottom,
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMaximized={isMaximized}
          variant="macos"
        />

        {/* Board Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 16 }}>📋</span>

          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: 'var(--font-size-md, 14px)',
                fontWeight: 'var(--font-weight-semibold, 600)',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-base)',
                border: '1.5px solid var(--color-accent-primary)',
                borderRadius: 'var(--radius-sm, 6px)',
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                fontWeight: TITLE_BAR.titleFontWeight,
                fontFamily: 'var(--font-body)',
                color: TITLE_BAR.titleColor,
                opacity: TITLE_BAR.titleOpacityActive,
                cursor: 'text',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
          background: 'var(--color-bg-base)',
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              minHeight: '100%',
            }}
          >
            <SortableContext
              items={boardContent.columns.map((col) => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {boardContent.columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onAddCard={addCard}
                  onEditCard={editCard}
                  onDeleteCard={deleteCard}
                  onToggleChecklist={toggleChecklist}
                  onEditColumn={editColumn}
                  onDeleteColumn={deleteColumn}
                />
              ))}
            </SortableContext>

            {/* Add column button */}
            <button
              onClick={addColumn}
              style={{
                minWidth: 280,
                padding: 16,
                background: 'transparent',
                border: '2px dashed var(--color-border-default)',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                transition: 'all 0.15s ease',
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

          {/* Drag overlay */}
          <DragOverlay>
            {activeId && activeItem && (
              <div
                style={{
                  padding: 12,
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 8,
                  border: '1px solid var(--color-border-default)',
                  boxShadow: 'var(--shadow-lg)',
                  opacity: 0.9,
                }}
              >
                {activeType === 'column'
                  ? (activeItem as BoardColumn).title
                  : (activeItem as BoardCard).title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderTop: '1px solid rgba(23, 20, 18, 0.06)',
          background: 'rgba(23, 20, 18, 0.02)',
          fontSize: 'var(--font-size-xs, 10px)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          <span>{boardContent.columns.length} columns</span>
          <span>
            {boardContent.columns.reduce((sum, col) => sum + col.cards.length, 0)} cards
          </span>
        </div>
        <span style={{ fontSize: 11, opacity: 0.6 }}>goOS Board</span>
      </div>
    </motion.div>
  );
}

export default GoOSBoardEditor;
