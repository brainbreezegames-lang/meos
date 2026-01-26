'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useDragControls, useReducedMotion, AnimatePresence } from 'framer-motion';
import { FileText, Presentation, Check, Loader2 } from 'lucide-react';
import { GoOSTipTapEditor, goOSTokens } from './GoOSTipTapEditor';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR_DARK, ANIMATION, SPRING, DURATION } from '../desktop/windowStyles';
import { AccessLevel } from '@/contexts/GoOSContext';
import { playSound } from '@/lib/sounds';

export interface GoOSFile {
  id: string;
  type: 'note' | 'case-study' | 'folder' | 'cv' | 'image' | 'link' | 'embed' | 'download';
  title: string;
  content: string;
  status: PublishStatus;
  accessLevel?: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
  parentFolderId?: string;
  position: { x: number; y: number };
  // Image file fields
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  // Link file fields
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
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
  const [showZenStats, setShowZenStats] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();

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

  // Zen mode: clean, full-width distraction-free UI
  if (isZenMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={SPRING.smooth}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-bg-base)',
          zIndex,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Zen Mode: Minimal header - always visible */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-base)',
            flexShrink: 0,
          }}
        >
          {/* Left: Traffic lights + Title + Save status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <TrafficLights
              onClose={onClose}
              onMinimize={onMinimize}
              onMaximize={onMaximize}
              isMaximized={isMaximized}
            />

            {/* Editable title in header */}
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
                  padding: '4px 8px',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-accent-primary)',
                  borderRadius: 4,
                  outline: 'none',
                  minWidth: 200,
                }}
                placeholder="Untitled"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  color: title ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  cursor: 'text',
                }}
              >
                {title || 'Untitled'}
              </span>
            )}

            {/* Save indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-text-muted)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
            }}>
              {saveStatus === 'saving' && (
                <>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check size={12} style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-success)' }}>Saved</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Publish toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GoOSPublishBadge status={file.status} />
            <GoOSPublishToggle
              status={file.status}
              onChange={handlePublishChange}
            />
          </div>
        </div>

        {/* Zen Mode: Full width editor - scrollbar at window edge */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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

        {/* Zen Mode: Stats on hover at bottom */}
        <div
          onMouseEnter={() => setShowZenStats(true)}
          onMouseLeave={() => setShowZenStats(false)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            zIndex: 10,
          }}
        >
          <AnimatePresence>
            {showZenStats && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={SPRING.snappy}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 20,
                  padding: '8px 16px',
                  background: 'var(--color-bg-base)',
                  borderRadius: 20,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: 11,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} characters</span>
                <span>·</span>
                <span>{readingTime} min read</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Keyframes for spinner */}
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    );
  }

  // Normal mode: standard windowed UI
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
          top: isMaximized ? 'var(--menubar-height, 40px)' : '10%',
          left: isMaximized ? 0 : '50%',
          x: isMaximized ? 0 : '-50%',
          width: isMaximized ? '100%' : 'min(900px, 90vw)',
          height: isMaximized ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))' : 'min(80vh, 700px)',
          minWidth: 400,
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
        {/* Title Bar - Dark variant for editor windows */}
        <div
          onPointerDown={startDrag}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${TITLE_BAR_DARK.paddingX}px`,
            height: TITLE_BAR_DARK.height,
            background: TITLE_BAR_DARK.background,
            borderBottom: TITLE_BAR_DARK.borderBottom,
            // No border-radius here - outer container handles it with overflow: hidden
            gap: 12,
            cursor: isMaximized ? 'default' : 'grab',
            flexShrink: 0,
            touchAction: 'none',
          }}
        >
          {/* Traffic Lights - macOS style for editor windows */}
          <TrafficLights
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            isMaximized={isMaximized}
            variant="macos"
          />

          {/* File Icon + Title - white on dark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <FileIcon
              size={16}
              color="rgba(255, 255, 255, 0.7)"
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
                  fontSize: TITLE_BAR_DARK.titleFontSize,
                  fontWeight: TITLE_BAR_DARK.titleFontWeight,
                  fontFamily: 'var(--font-body)',
                  color: TITLE_BAR_DARK.titleColor,
                  opacity: TITLE_BAR_DARK.titleOpacityActive,
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

        {/* Editor - full width */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
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

        {/* Footer with stats */}
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
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{readingTime} min read</span>
          </div>
          <span style={{ fontSize: 11, opacity: 0.6 }}>goOS Editor</span>
        </div>
      </motion.div>
    </>
  );
}

export default GoOSEditorWindow;
