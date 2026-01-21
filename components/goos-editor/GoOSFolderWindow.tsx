'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Folder, FolderOpen } from 'lucide-react';
import { GoOSFileIcon } from './GoOSFileIcon';
import { GoOSTrafficLights } from './GoOSTrafficLights';
import type { GoOSFile } from './GoOSEditorWindow';

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
  const filesInFolder = files.filter(f => f.parentFolderId === folder.id);

  return (
    <motion.div
      role="dialog"
      aria-label={`${folder.title} folder`}
      aria-modal="false"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onMouseDown={onFocus}
      style={{
        position: 'fixed',
        top: isMaximized ? 'var(--menubar-height, 36px)' : '15%',
        left: isMaximized ? 0 : '50%',
        transform: isMaximized ? 'none' : 'translateX(-50%)',
        width: isMaximized ? '100%' : 'min(600px, 90vw)',
        height: isMaximized ? 'calc(100vh - var(--menubar-height, 36px) - 80px)' : 'min(500px, 70vh)',
        minWidth: 320,
        minHeight: 280,
        background: 'var(--color-bg-base)',
        border: isMaximized ? 'none' : '2px solid var(--color-border-default)',
        borderRadius: isMaximized ? 0 : 'var(--window-radius, 14px)',
        boxShadow: isMaximized ? 'none' : 'var(--shadow-window)',
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: isActive ? 1 : 0.95,
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
        }}
      >
        {/* Traffic Lights */}
        <GoOSTrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMaximized={isMaximized}
        />

        {/* Folder Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FolderOpen
            size={18}
            fill="var(--color-accent-primary-subtle)"
            color="var(--color-text-secondary)"
            strokeWidth={1.5}
          />
          <span
            style={{
              fontSize: 'var(--font-size-md, 14px)',
              fontWeight: 'var(--font-weight-semibold, 600)',
              fontFamily: 'var(--font-family)',
              color: 'var(--color-text-primary)',
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
              fontFamily: 'ui-monospace, "SF Mono", monospace',
              color: 'var(--color-text-muted)',
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
              fontFamily: 'var(--font-family)',
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
          fontFamily: 'ui-monospace, "SF Mono", monospace',
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
