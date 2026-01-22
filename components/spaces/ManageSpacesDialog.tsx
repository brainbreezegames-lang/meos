'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { X, GripVertical, Star, Globe, Lock, Trash2, Check, AlertTriangle } from 'lucide-react';
import type { SpaceSummary } from '@/types';
import { goOSTokens } from '@/components/goos-editor/GoOSTipTapEditor';

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
        boxShadow: goOSTokens.shadows.solid,
        zIndex: 10,
      }}
      style={{
        position: 'relative',
        background: goOSTokens.colors.paper,
        borderRadius: 6,
        border: `2px solid ${goOSTokens.colors.border}`,
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
        <div
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            cursor: 'grab',
            touchAction: 'none',
            color: goOSTokens.colors.text.muted,
            display: 'flex',
            padding: 4,
          }}
        >
          <GripVertical size={16} strokeWidth={2} />
        </div>

        {/* Icon */}
        <span style={{ fontSize: 20, lineHeight: 1 }}>
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
                fontFamily: goOSTokens.fonts.body,
                border: `2px solid ${goOSTokens.colors.accent.primary}`,
                borderRadius: 6,
                background: goOSTokens.colors.paper,
                color: goOSTokens.colors.text.primary,
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
                fontFamily: goOSTokens.fonts.body,
                color: goOSTokens.colors.text.primary,
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
                    background: goOSTokens.colors.border,
                    color: goOSTokens.colors.paper,
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
            <button
              onClick={onSetPrimary}
              title="Set as main space"
              style={{
                padding: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 6,
                color: goOSTokens.colors.text.muted,
                display: 'flex',
              }}
            >
              <Star size={16} strokeWidth={2} />
            </button>
          )}

          {/* Visibility Toggle */}
          <button
            onClick={() => onUpdate({ isPublic: !space.isPublic })}
            title={space.isPublic ? 'Make private' : 'Make public'}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              color: space.isPublic ? goOSTokens.colors.accent.primary : goOSTokens.colors.text.muted,
              display: 'flex',
            }}
          >
            {space.isPublic ? (
              <Globe size={16} strokeWidth={2} />
            ) : (
              <Lock size={16} strokeWidth={2} />
            )}
          </button>

          {/* Delete */}
          <button
            onClick={() => canDelete && setShowDeleteConfirm(true)}
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
              color: canDelete ? goOSTokens.colors.text.muted : goOSTokens.colors.border,
              display: 'flex',
              opacity: canDelete ? 1 : 0.5,
            }}
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
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
                borderTop: `1px dashed ${goOSTokens.colors.border}`,
                background: goOSTokens.colors.status.errorLight,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle
                  size={14}
                  strokeWidth={2.5}
                  style={{ color: goOSTokens.colors.status.error }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: goOSTokens.fonts.body,
                    color: goOSTokens.colors.text.primary,
                  }}
                >
                  Delete "{space.name}"?
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: goOSTokens.fonts.body,
                    background: goOSTokens.colors.paper,
                    border: `1.5px solid ${goOSTokens.colors.border}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: goOSTokens.colors.text.primary,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowDeleteConfirm(false);
                  }}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: goOSTokens.fonts.body,
                    background: goOSTokens.colors.status.error,
                    border: `1.5px solid ${goOSTokens.colors.status.error}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  Delete
                </button>
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
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 9998,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              maxWidth: '90vw',
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: goOSTokens.colors.paper,
                border: `2px solid ${goOSTokens.colors.border}`,
                borderRadius: 8,
                boxShadow: goOSTokens.shadows.solid,
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
                  padding: '12px 16px',
                  borderBottom: `1px solid ${goOSTokens.colors.border}30`,
                  background: goOSTokens.colors.headerBg,
                  flexShrink: 0,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: goOSTokens.colors.text.primary,
                    fontFamily: goOSTokens.fonts.heading,
                  }}
                >
                  Manage Spaces
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    color: goOSTokens.colors.text.muted,
                  }}
                >
                  <X size={18} />
                </button>
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
                    fontFamily: goOSTokens.fonts.body,
                    color: goOSTokens.colors.text.muted,
                    marginBottom: 12,
                    marginTop: 0,
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
                      color: goOSTokens.colors.text.muted,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                    <p style={{ fontSize: 13, fontFamily: goOSTokens.fonts.body, margin: 0 }}>No spaces yet</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: `1px solid ${goOSTokens.colors.border}30`,
                  background: goOSTokens.colors.headerBg,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: goOSTokens.colors.paper,
                      color: goOSTokens.colors.text.primary,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDone}
                    style={{
                      padding: '10px 20px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: goOSTokens.colors.border,
                      color: goOSTokens.colors.paper,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                    Done
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ManageSpacesDialog;
