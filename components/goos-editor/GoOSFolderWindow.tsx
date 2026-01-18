'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Square, Folder, FolderOpen } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { GoOSFileIcon } from './GoOSFileIcon';
import type { GoOSFile } from './GoOSEditorWindow';

interface GoOSFolderWindowProps {
  folder: GoOSFile;
  files: GoOSFile[];
  onClose: () => void;
  onFileDoubleClick: (fileId: string) => void;
  onFileClick: (e: React.MouseEvent, fileId: string) => void;
  selectedFileId: string | null;
  zIndex?: number;
  isActive?: boolean;
  onFocus?: () => void;
}

export const GoOSFolderWindow = memo(function GoOSFolderWindow({
  folder,
  files,
  onClose,
  onFileDoubleClick,
  onFileClick,
  selectedFileId,
  zIndex = 100,
  isActive = true,
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
        top: '15%',
        left: '20%',
        width: 'min(500px, 90vw)',
        height: 'min(400px, 70vh)',
        minWidth: 320,
        minHeight: 280,
        background: goOSTokens.colors.cream,
        border: `2px solid ${goOSTokens.colors.border}`,
        borderRadius: 8,
        boxShadow: goOSTokens.shadows.solid,
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
          background: goOSTokens.colors.headerBg,
          borderBottom: `2px solid ${goOSTokens.colors.border}`,
          gap: 12,
          cursor: 'grab',
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
              background: '#FF6B6B',
              border: `1.5px solid ${goOSTokens.colors.border}`,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
            aria-label="Close window"
          >
            <X size={8} strokeWidth={2.5} color={goOSTokens.colors.border} style={{ opacity: 0 }} className="traffic-icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#FFD93D',
              border: `1.5px solid ${goOSTokens.colors.border}`,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Minimize"
            aria-label="Minimize window"
          >
            <Minus size={8} strokeWidth={2.5} color={goOSTokens.colors.border} style={{ opacity: 0 }} className="traffic-icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#6BCB77',
              border: `1.5px solid ${goOSTokens.colors.border}`,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Maximize"
            aria-label="Maximize window"
          >
            <Square size={7} strokeWidth={2.5} color={goOSTokens.colors.border} style={{ opacity: 0 }} className="traffic-icon" aria-hidden="true" />
          </button>
        </div>

        {/* Folder Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FolderOpen
            size={18}
            stroke={goOSTokens.colors.border}
            strokeWidth={1.5}
            fill={goOSTokens.colors.accent.orangePale}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: goOSTokens.fonts.body,
              color: goOSTokens.colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {folder.title}
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: goOSTokens.fonts.body,
              color: goOSTokens.colors.text.muted,
            }}
          >
            {filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          padding: 16,
          overflow: 'auto',
          background: goOSTokens.colors.paper,
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
              color: goOSTokens.colors.text.muted,
              fontFamily: goOSTokens.fonts.body,
              textAlign: 'center',
              gap: 12,
            }}
          >
            <Folder size={48} strokeWidth={1} stroke={goOSTokens.colors.text.muted} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>This folder is empty</p>
              <p style={{ fontSize: 12 }}>Drag files here to add them</p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignContent: 'flex-start',
            }}
          >
            {filesInFolder.map((file, index) => (
              <GoOSFileIcon
                key={file.id}
                id={file.id}
                type={file.type}
                title={file.title}
                status={file.status}
                accessLevel={file.accessLevel}
                isSelected={selectedFileId === file.id}
                position={{ x: (index % 4) * 100 + 20, y: Math.floor(index / 4) * 100 + 20 }}
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
          borderTop: `2px solid ${goOSTokens.colors.border}`,
          background: goOSTokens.colors.headerBg,
          fontSize: 11,
          fontFamily: goOSTokens.fonts.body,
          color: goOSTokens.colors.text.muted,
        }}
      >
        <span>{filesInFolder.length} {filesInFolder.length === 1 ? 'item' : 'items'}</span>
        <span style={{ fontFamily: goOSTokens.fonts.handwritten, fontSize: 12 }}>
          goOS Folder
        </span>
      </div>

      {/* Styles for traffic light hover */}
      <style jsx>{`
        button:hover .traffic-icon {
          opacity: 1 !important;
        }
      `}</style>
    </motion.div>
  );
});

export default GoOSFolderWindow;
