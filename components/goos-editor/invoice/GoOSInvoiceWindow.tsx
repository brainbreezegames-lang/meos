'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { Receipt, Download } from 'lucide-react';
import { TrafficLights } from '../../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../../desktop/windowStyles';
import { GoOSInvoiceDocument } from './GoOSInvoiceDocument';
import { invoiceContentSchema, getDefaultInvoiceContent, type InvoiceContent } from '@/lib/validations/goos';
import { GoOSPublishToggle, type PublishStatus } from '../GoOSPublishToggle';

export interface InvoiceFile {
  id: string;
  type: 'invoice';
  title: string;
  content: string; // JSON stringified InvoiceContent
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
}

interface GoOSInvoiceWindowProps {
  file: InvoiceFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (file: Partial<InvoiceFile>) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
  isZenMode?: boolean;
  isOwner?: boolean;
}

// Parse Invoice content from JSON string
function parseInvoiceContent(content: string): InvoiceContent {
  try {
    if (!content || content === '') {
      return getDefaultInvoiceContent();
    }
    const parsed = JSON.parse(content);
    return invoiceContentSchema.parse(parsed);
  } catch {
    return getDefaultInvoiceContent();
  }
}

export function GoOSInvoiceWindow({
  file,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  isActive = true,
  zIndex = 100,
  isMaximized = false,
  isZenMode = false,
  isOwner = true,
}: GoOSInvoiceWindowProps) {
  // Parse initial content
  const initialContent = useMemo(() => parseInvoiceContent(file.content), [file.content]);

  // Local state for editing
  const [localContent, setLocalContent] = useState<InvoiceContent>(initialContent);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  // Check if we're in editing mode (owner only)
  const isEditing = isOwner;

  // Handle field click for editing
  const handleFieldClick = useCallback((field: string) => {
    setEditingField(field);
  }, []);

  // Handle field change
  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setLocalContent(prev => {
      const updated = { ...prev };
      const parts = field.split('.');

      // Handle nested paths like 'lineItems.0.description' or 'from.name'
      let current: Record<string, unknown> = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const index = parseInt(key);
        if (!isNaN(index)) {
          current = (current as unknown as unknown[])[index] as Record<string, unknown>;
        } else {
          current = current[key] as Record<string, unknown>;
        }
      }

      const lastKey = parts[parts.length - 1];
      current[lastKey] = value;

      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Handle field blur (stop editing)
  const handleFieldBlur = useCallback(() => {
    setEditingField(null);
  }, []);

  // Add new line item
  const handleAddLineItem = useCallback(() => {
    setLocalContent(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: crypto.randomUUID(),
          description: 'New item',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Delete line item
  const handleDeleteLineItem = useCallback((id: string) => {
    setLocalContent(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Publish changes
  const handlePublish = useCallback(() => {
    onUpdate({
      content: JSON.stringify(localContent),
      updatedAt: new Date(),
    });
    setHasUnsavedChanges(false);
  }, [localContent, onUpdate]);

  // Handle publish status change
  const handlePublishStatusChange = useCallback((status: PublishStatus) => {
    onUpdate({ status });
  }, [onUpdate]);

  // Handle close with unsaved changes check
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Export to PDF
  const handleExportPDF = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { exportInvoiceToPDF } = await import('./GoOSInvoicePDFExport');
      await exportInvoiceToPDF(localContent, file.title || 'Invoice');
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Check console for details.');
    }
  }, [localContent, file.title]);

  // Start drag from title bar
  const startDrag = (event: React.PointerEvent) => {
    if (!isMaximized) {
      dragControls.start(event);
    }
  };

  return (
    <>
      {/* Unsaved changes modal */}
      {showUnsavedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: zIndex + 100,
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface, white)',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              boxShadow: 'var(--shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.3))',
              border: '1px solid var(--border-subtle, transparent)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--text-primary)' }}>Unsaved Changes</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--text-secondary, #666)' }}>
              You have unpublished changes. What would you like to do?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUnsavedModal(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border-medium, #ddd)',
                  borderRadius: 6,
                  background: 'var(--bg-surface, white)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  onClose();
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  background: 'var(--color-error, #ef4444)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Discard
              </button>
              <button
                onClick={() => {
                  handlePublish();
                  setShowUnsavedModal(false);
                  onClose();
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  background: 'var(--accent-primary, #3b82f6)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

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
          // In zen mode, start from top of viewport
          top: isZenMode ? 0 : (isMaximized ? 'var(--menubar-height, 40px)' : '10%'),
          left: isMaximized ? 0 : '50%',
          x: isMaximized ? 0 : '-50%',
          width: isMaximized ? '100%' : 'min(900px, 90vw)',
          // In zen mode, full viewport height
          height: isZenMode ? '100vh' : (isMaximized ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))' : 'min(85vh, 800px)'),
          minWidth: 400,
          background: WINDOW.background,
          // No border in zen mode
          border: isZenMode ? 'none' : (isMaximized ? WINDOW.borderMaximized : WINDOW.border),
          borderRadius: isZenMode ? 0 : (isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius),
          // No shadow in zen mode
          boxShadow: isZenMode ? 'none' : (isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow),
          zIndex,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
        }}
      >
        {/* Title Bar - Minimal in zen mode */}
        <div
          onPointerDown={startDrag}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: isZenMode ? '0 20px' : `0 ${TITLE_BAR.paddingX}px`,
            height: isZenMode ? 48 : TITLE_BAR.height,
            background: isZenMode ? 'transparent' : TITLE_BAR.background,
            borderBottom: isZenMode ? 'none' : TITLE_BAR.borderBottom,
            gap: 12,
            cursor: isMaximized ? 'default' : 'grab',
            flexShrink: 0,
            touchAction: 'none',
          }}
        >
          {/* Traffic Lights */}
          <TrafficLights
            onClose={handleClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            isMaximized={isMaximized}
          />

          {/* File Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <Receipt
              size={16}
              color="var(--color-text-secondary)"
              strokeWidth={1.5}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.title}
              {hasUnsavedChanges && <span style={{ color: '#888' }}> (edited)</span>}
            </span>
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Export PDF button */}
            <button
              onClick={handleExportPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                border: '1px solid var(--color-border-default)',
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--color-text-secondary)',
              }}
              title="Export as PDF"
            >
              <Download size={12} />
              PDF
            </button>

            {/* Publish Toggle (owner only) */}
            {isOwner && (
              <GoOSPublishToggle
                status={file.status}
                onChange={handlePublishStatusChange}
              />
            )}

            {/* Publish button (owner only, when there are changes) */}
            {isOwner && hasUnsavedChanges && (
              <button
                onClick={handlePublish}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: 6,
                  background: 'var(--accent-primary, #3b82f6)',
                  color: 'white',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Publish
              </button>
            )}
          </div>
        </div>

        {/* Invoice Document Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--color-bg-base)',
          }}
        >
          <GoOSInvoiceDocument
            content={localContent}
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={handleFieldClick}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            onAddLineItem={handleAddLineItem}
            onDeleteLineItem={handleDeleteLineItem}
          />
        </div>
      </motion.div>
    </>
  );
}

export default GoOSInvoiceWindow;
