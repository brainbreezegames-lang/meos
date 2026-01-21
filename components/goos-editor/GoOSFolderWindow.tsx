'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Square, Folder, FolderOpen } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { GoOSFileIcon } from './GoOSFileIcon';
import type { GoOSFile } from './GoOSEditorWindow';
import { useThemeSafe } from '@/contexts/ThemeContext';
import { useWidgetTheme } from '@/hooks/useWidgetTheme';

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

  const theme = useWidgetTheme();

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
        background: themeColors.bg,
        border: `2px solid ${themeColors.border}`,
        borderRadius: isBrandAppart ? 16 : 8,
        boxShadow: isBrandAppart ? '8px 8px 0 rgba(0,0,0,0.1)' : `6px 6px 0 ${themeColors.border}`,
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
          background: isBrandAppart ? '#fbf9ef' : '#FFFFFF',
          borderBottom: `2px solid ${themeColors.border}`,
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
              background: isBrandAppart ? '#ff5f57' : '#FFFFFF',
              border: `1.5px solid ${themeColors.border}`,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
            aria-label="Close window"
            className={`group hover:bg-[${themeColors.highlight}] transition-colors`}
          >
            {isBrandAppart ? null : <X size={8} strokeWidth={3} className={`text-[${themeColors.text}] group-hover:text-white`} />}
          </button>
          <button
            type="button"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isBrandAppart ? '#f59e0b' : '#FFFFFF',
              border: `1.5px solid ${themeColors.border}`,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Minimize"
            aria-label="Minimize window"
            className={`group hover:bg-[${themeColors.highlight}] transition-colors`}
          >
            {isBrandAppart ? null : <Minus size={8} strokeWidth={3} className={`text-[${themeColors.text}] group-hover:text-white`} />}
          </button>
          <button
            type="button"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isBrandAppart ? '#10b981' : '#FFFFFF',
              border: `1.5px solid ${themeColors.border}`,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Maximize"
            aria-label="Maximize window"
            className={`group hover:bg-[${themeColors.highlight}] transition-colors`}
          >
            {isBrandAppart ? null : <Square size={6} strokeWidth={3} className={`text-[${themeColors.text}] group-hover:text-white`} />}
          </button>
        </div>

        {/* Folder Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FolderOpen
            size={18}
            fill={isBrandAppart ? themeColors.text : "#FFFFFF"}
            color={themeColors.text}
            strokeWidth={1.5}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: goOSTokens.fonts.body,
              color: themeColors.text,
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
              color: themeColors.muted,
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
          background: '#FFFFFF',
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
            <Folder size={48} strokeWidth={1} stroke="#2B4AE2" />
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
          borderTop: `2px solid ${themeColors.border}`,
          background: themeColors.bg,
          fontSize: 11,
          fontFamily: goOSTokens.fonts.body,
          color: themeColors.text,
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
