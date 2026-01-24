'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { FileUser, Download } from 'lucide-react';
import { TrafficLights } from '../../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../../desktop/windowStyles';
import { GoOSCVDocument } from './GoOSCVDocument';
import { cvContentSchema, getDefaultCVContent, type CVContent } from '@/lib/validations/goos';
import { GoOSPublishToggle, type PublishStatus } from '../GoOSPublishToggle';

export interface CVFile {
  id: string;
  type: 'cv';
  title: string;
  content: string; // JSON stringified CVContent
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
}

interface GoOSCVWindowProps {
  file: CVFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (file: Partial<CVFile>) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
  isZenMode?: boolean;
  isOwner?: boolean;
}

// Parse CV content from JSON string
function parseCVContent(content: string): CVContent {
  try {
    if (!content || content === '') {
      return getDefaultCVContent();
    }
    const parsed = JSON.parse(content);
    return cvContentSchema.parse(parsed);
  } catch {
    return getDefaultCVContent();
  }
}

export function GoOSCVWindow({
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
}: GoOSCVWindowProps) {
  // Parse initial content
  const initialContent = useMemo(() => parseCVContent(file.content), [file.content]);

  // Local state for editing
  const [localContent, setLocalContent] = useState<CVContent>(initialContent);
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
  const handleFieldChange = useCallback((field: string, value: string | string[]) => {
    setLocalContent(prev => {
      const updated = { ...prev };
      const parts = field.split('.');

      // Handle nested paths like 'experience.0.role' or 'contact.email'
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
      // Handle endDate specially - convert "Present" to null
      if (lastKey === 'endDate' && (value === 'Present' || value === 'present')) {
        current[lastKey] = null;
      } else {
        current[lastKey] = value;
      }

      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Handle field blur (stop editing)
  const handleFieldBlur = useCallback(() => {
    setEditingField(null);
  }, []);

  // Add new experience entry
  const handleAddExperience = useCallback(() => {
    setLocalContent(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: crypto.randomUUID(),
          role: 'Role Title',
          company: 'Company Name',
          location: 'Location',
          startDate: 'Month Year',
          endDate: null,
          description: '',
          responsibilities: '',
        },
      ],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add new skill category
  const handleAddSkillCategory = useCallback(() => {
    setLocalContent(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: crypto.randomUUID(),
          category: 'Category Name',
          items: ['Skill 1', 'Skill 2'],
        },
      ],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add new education entry
  const handleAddEducation = useCallback(() => {
    setLocalContent(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: crypto.randomUUID(),
          degree: 'Degree Name',
          institution: 'Institution Name',
          dates: 'Year — Year',
        },
      ],
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Delete experience
  const handleDeleteExperience = useCallback((id: string) => {
    setLocalContent(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Delete skill category
  const handleDeleteSkillCategory = useCallback((id: string) => {
    setLocalContent(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Delete education
  const handleDeleteEducation = useCallback((id: string) => {
    setLocalContent(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id),
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
      const { exportCVToPDF } = await import('./GoOSCVPDFExport');
      await exportCVToPDF(localContent, file.title || 'CV');
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
            <FileUser
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

        {/* CV Document Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--color-bg-base)',
          }}
        >
          <GoOSCVDocument
            content={localContent}
            isEditing={isEditing}
            editingField={editingField}
            onFieldClick={handleFieldClick}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
            onAddExperience={handleAddExperience}
            onAddSkillCategory={handleAddSkillCategory}
            onAddEducation={handleAddEducation}
            onDeleteExperience={handleDeleteExperience}
            onDeleteSkillCategory={handleDeleteSkillCategory}
            onDeleteEducation={handleDeleteEducation}
          />
        </div>
      </motion.div>
    </>
  );
}

export default GoOSCVWindow;
