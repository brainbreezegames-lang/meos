'use client';

import React, { memo, useEffect } from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import { GoOSFileIcon } from './GoOSFileIcon';
import { WindowShell } from '../desktop/WindowShell';
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
  const filesInFolder = files.filter(f => f.parentFolderId === folder.id);

  // Play folder open sound on mount
  useEffect(() => {
    playSound('pop');
  }, []);

  return (
    <WindowShell
      id={folder.id}
      title={folder.title}
      icon={
        <FolderOpen
          size={18}
          fill="rgba(255, 255, 255, 0.2)"
          color="rgba(255, 255, 255, 0.8)"
          strokeWidth={1.5}
        />
      }
      variant="dark"
      isActive={isActive}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onFocus={onFocus}
      width="min(600px, 90vw)"
      height="min(500px, 70vh)"
      minWidth={320}
      minHeight={280}
      titleBarContent={
        <span
          style={{
            fontSize: 'var(--font-size-xs, 10px)',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          {filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}
        </span>
      }
      footer={
        <>
          <span>{filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}</span>
          <span style={{ fontSize: 11 }}>goOS Folder</span>
        </>
      }
    >
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
    </WindowShell>
  );
});

export default GoOSFolderWindow;
