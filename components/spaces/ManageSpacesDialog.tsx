'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { X, GripVertical, Star, Globe, Lock, Trash2, Check, AlertTriangle } from 'lucide-react';
import type { SpaceSummary } from '@/types';

// ============================================
// TYPES
// ============================================

export interface ManageSpacesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: SpaceSummary[];
  onReorder: (orderedIds: string[]) => void;
  onUpdateSpace: (id: string, updates: Partial<SpaceSummary>) => void;
  onSetPrimary: (id: string) => void;
  onDeleteSpace: (id: string) => void;
}

// ============================================
// SPACE ROW COMPONENT
// ============================================

interface SpaceRowProps {
  space: SpaceSummary;
  isOnly: boolean;
  onUpdate: (updates: Partial<SpaceSummary>) => void;
  onSetPrimary: () => void;
  onDelete: () => void;
}

function SpaceRow({ space, isOnly, onUpdate, onSetPrimary, onDelete }: SpaceRowProps) {
  const dragControls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(space.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleNameSubmit = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== space.name) {
      onUpdate({ name: trimmed });
    } else {
      setEditName(space.name);
    }
    setIsEditing(false);
  }, [editName, space.name, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(space.name);
      setIsEditing(false);
    }
  };

  const canDelete = !space.isPrimary && !isOnly;

  return (
    <Reorder.Item
      value={space}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 24px rgba(23, 20, 18, 0.15)',
        zIndex: 10,
      }}
      style={{
        position: 'relative',
        background: 'var(--color-bg-white)',
        borderRadius: 10,
        border: '2px solid var(--color-border-strong)',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
        }}
      >
        {/* Drag Handle */}
        <motion.div
          onPointerDown={(e) => dragControls.start(e)}
          whileHover={{ scale: 1.1 }}
          style={{
            cursor: 'grab',
            touchAction: 'none',
            color: 'var(--color-text-muted)',
            display: 'flex',
            padding: 4,
          }}
        >
          <GripVertical size={16} strokeWidth={2} />
        </motion.div>

        {/* Icon */}
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
          }}
        >
          {space.icon}
        </span>

        {/* Name (editable) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyDown}
              maxLength={30}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: 14,
                fontWeight: 500,
                border: '2px solid var(--color-accent-primary)',
                borderRadius: 6,
                background: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 0',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                textAlign: 'left',
              }}
            >
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {space.name}
              </span>
              {space.isPrimary && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 5px',
                    borderRadius: 4,
                    background: 'var(--color-accent-primary)',
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  Main
                </span>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Set as Primary */}
          {!space.isPrimary && (
            <motion.button
              onClick={onSetPrimary}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Set as main space"
              style={{
                padding: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 6,
                color: 'var(--color-text-muted)',
                display: 'flex',
              }}
            >
              <Star size={16} strokeWidth={2} />
            </motion.button>
          )}

          {/* Visibility Toggle */}
          <motion.button
            onClick={() => onUpdate({ isPublic: !space.isPublic })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={space.isPublic ? 'Make private' : 'Make public'}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              color: space.isPublic ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
              display: 'flex',
            }}
          >
            {space.isPublic ? (
              <Globe size={16} strokeWidth={2} />
            ) : (
              <Lock size={16} strokeWidth={2} />
            )}
          </motion.button>

          {/* Delete */}
          <motion.button
            onClick={() => canDelete && setShowDeleteConfirm(true)}
            whileHover={canDelete ? { scale: 1.1 } : {}}
            whileTap={canDelete ? { scale: 0.9 } : {}}
            title={
              space.isPrimary
                ? "Can't delete main space"
                : isOnly
                ? "Can't delete only space"
                : 'Delete space'
            }
            disabled={!canDelete}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              cursor: canDelete ? 'pointer' : 'not-allowed',
              borderRadius: 6,
              color: canDelete ? 'var(--color-text-muted)' : 'var(--color-border-strong)',
              display: 'flex',
              opacity: canDelete ? 1 : 0.5,
            }}
          >
            <Trash2 size={16} strokeWidth={2} />
          </motion.button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderTop: '1px dashed var(--color-border-strong)',
                background: 'var(--color-error-subtle, rgba(255, 60, 52, 0.08))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle
                  size={14}
                  strokeWidth={2.5}
                  style={{ color: 'var(--color-error)' }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Delete "{space.name}"?
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'var(--color-bg-white)',
                    border: '1.5px solid var(--color-border-strong)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    onDelete();
                    setShowDeleteConfirm(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'var(--color-error)',
                    border: '1.5px solid var(--color-error)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ManageSpacesDialog({
  isOpen,
  onClose,
  spaces,
  onReorder,
  onUpdateSpace,
  onSetPrimary,
  onDeleteSpace,
}: ManageSpacesDialogProps) {
  const [orderedSpaces, setOrderedSpaces] = useState<SpaceSummary[]>([]);

  // Sync ordered spaces with props
  useEffect(() => {
    setOrderedSpaces([...spaces].sort((a, b) => a.order - b.order));
  }, [spaces]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleReorder = useCallback((newOrder: SpaceSummary[]) => {
    setOrderedSpaces(newOrder);
  }, []);

  const handleDone = useCallback(() => {
    // Emit reorder with new order
    const orderedIds = orderedSpaces.map(s => s.id);
    onReorder(orderedIds);
    onClose();
  }, [orderedSpaces, onReorder, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(23, 20, 18, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 5 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 400,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: 420,
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: 'var(--color-bg-base)',
                border: '2px solid var(--color-text-primary)',
                borderRadius: 12,
                boxShadow: `
                  0 4px 6px -1px rgba(23, 20, 18, 0.1),
                  0 10px 24px -3px rgba(23, 20, 18, 0.2),
                  0 30px 60px -6px rgba(23, 20, 18, 0.15)
                `,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: '2px solid var(--color-text-primary)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Manage Spaces
                </span>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    padding: 4,
                    borderRadius: 6,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <X size={16} strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 16,
                }}
              >
                {/* Instructions */}
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-muted)',
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  Drag to reorder. Click a name to edit.
                </p>

                {/* Spaces List */}
                <Reorder.Group
                  axis="y"
                  values={orderedSpaces}
                  onReorder={handleReorder}
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  <AnimatePresence initial={false}>
                    {orderedSpaces.map((space) => (
                      <SpaceRow
                        key={space.id}
                        space={space}
                        isOnly={orderedSpaces.length === 1}
                        onUpdate={(updates) => onUpdateSpace(space.id, updates)}
                        onSetPrimary={() => onSetPrimary(space.id)}
                        onDelete={() => onDeleteSpace(space.id)}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>

                {/* Empty State */}
                {orderedSpaces.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                    <p style={{ fontSize: 13 }}>No spaces yet</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid var(--color-border-default)',
                  background: 'var(--color-bg-subtle)',
                  flexShrink: 0,
                }}
              >
                <motion.button
                  onClick={handleDone}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '2px solid var(--color-text-primary)',
                    borderRadius: 10,
                    background: 'var(--color-accent-primary)',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  Done
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ManageSpacesDialog;
