'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { FileText, Presentation } from 'lucide-react';
import { GoOSTipTapEditor, goOSTokens } from './GoOSTipTapEditor';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';
import { AccessLevel } from '@/contexts/GoOSContext';

export interface GoOSFile {
  id: string;
  type: 'note' | 'case-study' | 'folder';
  title: string;
  content: string;
  status: PublishStatus;
  accessLevel?: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
}

interface GoOSEditorWindowProps {
  file: GoOSFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (file: Partial<GoOSFile>) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
  isZenMode?: boolean;
}

export function GoOSEditorWindow({
  file,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  isActive = true,
  zIndex = 100,
  isMaximized = false,
  isZenMode = false,
}: GoOSEditorWindowProps) {
  const [title, setTitle] = useState(file.title);
  const [content, setContent] = useState(file.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(file.updatedAt);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

  // Auto-save with debounce
  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({
        title,
        content,
        updatedAt: new Date(),
      });
      setSaveStatus('saved');
      setLastSaved(new Date());

      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  }, [title, content, onUpdate]);

  // Trigger save on content change
  useEffect(() => {
    if (content !== file.content || title !== file.title) {
      triggerSave();
    }
  }, [content, title, file.content, file.title, triggerSave]);

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

  // Get file type icon
  const FileIcon = file.type === 'case-study' ? Presentation : FileText;

  // Word count
  const wordCount = content
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  const charCount = content.replace(/<[^>]*>/g, '').length;

  // Reading time (average 200 words per minute)
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Start drag from title bar
  const startDrag = (event: React.PointerEvent) => {
    if (!isMaximized) {
      dragControls.start(event);
    }
  };

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
          // In zen mode, start from top of viewport; otherwise respect menubar
          top: isZenMode ? 0 : (isMaximized ? 'var(--menubar-height, 40px)' : '10%'),
          left: isMaximized ? 0 : '50%',
          x: isMaximized ? 0 : '-50%',
          width: isMaximized ? '100%' : 'min(900px, 90vw)',
          // In zen mode, full viewport height
          height: isZenMode ? '100vh' : (isMaximized ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))' : 'min(80vh, 700px)'),
          minWidth: 400,
          background: WINDOW.background,
          // No border in zen mode for distraction-free experience
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
        {/* Title Bar - Minimal in zen mode, full in normal mode */}
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
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            isMaximized={isMaximized}
          />

          {/* File Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <FileIcon
              size={16}
              color="var(--color-text-secondary)"
              strokeWidth={1.5}
            />

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
                  fontSize: 'var(--font-size-md, 14px)',
                  fontWeight: 'var(--font-weight-semibold, 600)',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  cursor: 'text',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title="Click to edit title"
              >
                {title || 'Untitled'}
              </span>
            )}

            <GoOSPublishBadge status={file.status} />
          </div>

          {/* Save Status */}
          <GoOSAutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />

          {/* Publish Toggle */}
          <GoOSPublishToggle
            status={file.status}
            onChange={handlePublishChange}
          />
        </div>

        {/* Editor - responsive container */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            background: 'var(--color-bg-base)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMaximized ? '720px' : '100%',
              height: '100%',
              margin: '0 auto',
              padding: isMaximized ? '32px 24px' : '0',
              background: 'var(--color-bg-base)',
            }}
          >
            <GoOSTipTapEditor
              content={content}
              onChange={setContent}
              onSave={triggerSave}
              placeholder={file.type === 'case-study'
                ? 'Start writing your case study...'
                : 'Start writing...'}
              autoFocus
            />
          </div>
        </div>

        {/* Footer with stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderTop: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-subtle)',
            fontSize: 'var(--font-size-xs, 10px)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{readingTime} min read</span>
          </div>
          <span style={{ fontSize: 11 }}>goOS Editor</span>
        </div>
      </motion.div>
    </>
  );
}

export default GoOSEditorWindow;
