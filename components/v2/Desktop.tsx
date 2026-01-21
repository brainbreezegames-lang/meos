'use client';

import React, { useState, useCallback } from 'react';
import { FileIcon, type FileType } from './FileIcon';

interface DesktopFile {
  id: string;
  type: FileType;
  title: string;
  position: { x: number; y: number };
}

interface DesktopProps {
  files: DesktopFile[];
  onFileClick?: (fileId: string) => void;
  onFileDoubleClick?: (fileId: string) => void;
  children?: React.ReactNode;
}

/**
 * Desktop area with file icons
 * Uses ONLY CSS variables from design-system.css
 */
export function Desktop({
  files,
  onFileClick,
  onFileDoubleClick,
  children,
}: DesktopProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleFileClick = useCallback(
    (e: React.MouseEvent, fileId: string) => {
      e.stopPropagation();
      setSelectedFileId(fileId);
      onFileClick?.(fileId);
    },
    [onFileClick]
  );

  const handleFileDoubleClick = useCallback(
    (fileId: string) => {
      onFileDoubleClick?.(fileId);
    },
    [onFileDoubleClick]
  );

  const handleDesktopClick = useCallback(() => {
    setSelectedFileId(null);
  }, []);

  return (
    <div
      data-desktop
      onClick={handleDesktopClick}
      style={{
        position: 'fixed',
        inset: 0,
        top: 28, // Menu bar height
        background: 'var(--ds-desktop-bg)',
        overflow: 'hidden',
      }}
    >
      {/* File icons */}
      {files.map((file) => (
        <div
          key={file.id}
          style={{
            position: 'absolute',
            left: `${file.position.x}%`,
            top: `${file.position.y}%`,
          }}
        >
          <FileIcon
            id={file.id}
            type={file.type}
            title={file.title}
            isSelected={selectedFileId === file.id}
            onClick={(e) => handleFileClick(e, file.id)}
            onDoubleClick={() => handleFileDoubleClick(file.id)}
          />
        </div>
      ))}

      {/* Windows and other content */}
      {children}
    </div>
  );
}
