'use client';

import React, { memo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Folder, FolderOpen } from 'lucide-react';
import { GoOSFileIcon } from './GoOSFileIcon';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR_DARK, ANIMATION } from '../desktop/windowStyles';
import type { GoOSFile } from './GoOSEditorWindow';
import { playSound } from '@/lib/sounds';

interface GoOSFolderWindowProps {
  folder: GoOSFile;
  files: GoOSFile[];
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFileDoubleClick: (fileId: string) => void;
  onFileClick: (e: React.MouseEvent, fileId: string) => void;
  selectedFileId: string | null;
  zIndex?: number;
  isActive?: boolean;
  isMaximized?: boolean;
  onFocus?: () => void;
}

export const GoOSFolderWindow = memo(function GoOSFolderWindow({
  folder,
  files,
  onClose,
  onMinimize,
  onMaximize,
  onFileDoubleClick,
  onFileClick,
  selectedFileId,
  zIndex = 100,
  isActive = true,
  isMaximized = false,
  onFocus,
}: GoOSFolderWindowProps) {
  const prefersReducedMotion = useReducedMotion();
  const filesInFolder = files.filter(f => f.parentFolderId === folder.id);

  // Play folder open sound on mount
  useEffect(() => {
    playSound('pop');
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-label={`${folder.title} folder`}
      aria-modal="false"
      initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
      animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
      exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
      transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
      onMouseDown={onFocus}
      style={{
        position: 'fixed',
        top: isMaximized ? 'var(--menubar-height, 36px)' : '15%',
        left: isMaximized ? 0 : '50%',
        transform: isMaximized ? 'none' : 'translateX(-50%)',
        width: isMaximized ? '100%' : 'min(600px, 90vw)',
        // In zen mode (--zen-dock-offset: 0px), window takes full height minus just the menubar
        height: isMaximized ? 'calc(100vh - var(--menubar-height, 36px) - var(--zen-dock-offset, 80px))' : 'min(500px, 70vh)',
        minWidth: 320,
        minHeight: 280,
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
      {/* Title Bar - Dark variant for folder windows */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${TITLE_BAR_DARK.paddingX}px`,
          height: TITLE_BAR_DARK.height,
          background: TITLE_BAR_DARK.background,
          borderBottom: TITLE_BAR_DARK.borderBottom,
          borderRadius: isMaximized ? 0 : TITLE_BAR_DARK.borderRadius,
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
        }}
      >
        {/* Traffic Lights - macOS style */}
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMaximized={isMaximized}
          variant="macos"
        />

        {/* Folder Icon + Title - white on dark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FolderOpen
            size={18}
            fill="rgba(255, 255, 255, 0.2)"
            color="rgba(255, 255, 255, 0.8)"
            strokeWidth={1.5}
          />
          <span
            style={{
              fontSize: TITLE_BAR_DARK.titleFontSize,
              fontWeight: TITLE_BAR_DARK.titleFontWeight,
              fontFamily: 'var(--font-body)',
              color: TITLE_BAR_DARK.titleColor,
              opacity: TITLE_BAR_DARK.titleOpacityActive,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {folder.title}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-xs, 10px)',
              fontFamily: 'var(--font-mono)',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Content Area - responsive grid */}
      <div
        style={{
          flex: 1,
          padding: isMaximized ? 24 : 16,
          overflow: 'auto',
          background: 'var(--color-bg-white)',
          position: 'relative',
          minHeight: 200,
        }}
      >
        {filesInFolder.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              textAlign: 'center',
              gap: 12,
            }}
          >
            <Folder size={48} strokeWidth={1} color="var(--color-border-default)" />
            <div>
              <p style={{ fontSize: 'var(--font-size-md, 14px)', fontWeight: 500, marginBottom: 4 }}>
                This folder is empty
              </p>
              <p style={{ fontSize: 'var(--font-size-sm, 12px)' }}>Drag files here to add them</p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMaximized
                ? 'repeat(auto-fill, minmax(100px, 1fr))'
                : 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: isMaximized ? 16 : 8,
              alignContent: 'flex-start',
              justifyItems: 'center',
            }}
          >
            {filesInFolder.map((file) => (
              <GoOSFileIcon
                key={file.id}
                id={file.id}
                type={file.type}
                title={file.title}
                status={file.status}
                accessLevel={file.accessLevel}
                isSelected={selectedFileId === file.id}
                position={{ x: 0, y: 0 }}
                onClick={onFileClick}
                onDoubleClick={() => onFileDoubleClick(file.id)}
                imageUrl={file.imageUrl}
                linkUrl={file.linkUrl}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
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
        <span>{filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}</span>
        <span style={{ fontSize: 11 }}>goOS Folder</span>
      </div>
    </motion.div>
  );
});

export default GoOSFolderWindow;
