'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square, FileText, Presentation } from 'lucide-react';
import { GoOSTipTapEditor, goOSTokens } from './GoOSTipTapEditor';
import { GoOSAutoSaveIndicator, SaveStatus } from './GoOSAutoSaveIndicator';
import { GoOSPublishToggle, GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';
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
}: GoOSEditorWindowProps) {
  const [title, setTitle] = useState(file.title);
  const [content, setContent] = useState(file.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(file.updatedAt);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{
        position: 'fixed',
        top: isMaximized ? 28 : '10%',
        left: isMaximized ? 0 : '15%',
        right: isMaximized ? 0 : '15%',
        bottom: isMaximized ? 80 : '10%',
        width: isMaximized ? '100%' : 'auto',
        minWidth: isMaximized ? '100%' : 600,
        maxWidth: isMaximized ? '100%' : 900,
        height: isMaximized ? 'auto' : 'auto',
        maxHeight: isMaximized ? '100%' : '80vh',
        background: '#FFFFFF',
        border: '2px solid #2B4AE2',
        borderRadius: isMaximized ? 0 : 8,
        boxShadow: isMaximized ? 'none' : '6px 6px 0 #2B4AE2',
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isActive ? 1 : 0.9,
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: '#FFFFFF',
          borderBottom: '2px solid #2B4AE2',
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
        }}
      >
        {/* Traffic Lights */}
        <div style={{ display: 'flex', gap: 6 }} role="group" aria-label="Window controls">
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1.5px solid #2B4AE2',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
            aria-label="Close window"
            className="group hover:bg-[#2B4AE2] transition-colors"
          >
            <X size={8} strokeWidth={3} className="text-[#2B4AE2] group-hover:text-white" />
          </button>
          <button
            type="button"
            onClick={onMinimize}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1.5px solid #2B4AE2',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Minimize"
            aria-label="Minimize window"
            className="group hover:bg-[#2B4AE2] transition-colors"
          >
            <Minus size={8} strokeWidth={3} className="text-[#2B4AE2] group-hover:text-white" />
          </button>
          <button
            type="button"
            onClick={onMaximize}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1.5px solid #2B4AE2',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isMaximized ? 'Restore' : 'Maximize'}
            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
            className="group hover:bg-[#2B4AE2] transition-colors"
          >
            <Square size={6} strokeWidth={3} className="text-[#2B4AE2] group-hover:text-white" />
          </button>
        </div>

        {/* File Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FileIcon
            size={16}
            className="text-[#2B4AE2]"
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
                fontSize: 14,
                fontWeight: 600,
                fontFamily: goOSTokens.fonts.body,
                color: '#2B4AE2',
                background: '#FFFFFF',
                border: '1.5px solid #2B4AE2',
                borderRadius: 4,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: goOSTokens.fonts.body,
                color: '#2B4AE2',
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

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
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
          padding: '8px 16px',
          borderTop: '2px solid #2B4AE2',
          background: '#FFFFFF',
          fontSize: 11,
          fontFamily: goOSTokens.fonts.body,
          color: '#2B4AE2',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{readingTime} min read</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: goOSTokens.fonts.handwritten, fontSize: 12 }}>
            goOS Editor
          </span>
        </div>
      </div>

      {/* Styles for traffic light hover */}
      <style jsx>{`
        button:hover .traffic-icon {
          opacity: 1 !important;
        }
      `}</style>
    </motion.div>
  );
}

export default GoOSEditorWindow;
