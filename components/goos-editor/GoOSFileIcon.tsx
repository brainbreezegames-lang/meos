'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation, Folder } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { GoOSPublishBadge, PublishStatus } from './GoOSPublishToggle';

export type FileType = 'note' | 'case-study' | 'folder';

interface GoOSFileIconProps {
  id: string;
  type: FileType;
  title: string;
  status?: PublishStatus;
  isSelected?: boolean;
  isRenaming?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRename?: (newTitle: string) => void;
  position?: { x: number; y: number };
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function GoOSFileIcon({
  id,
  type,
  title,
  status,
  isSelected = false,
  isRenaming = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRename,
  position,
  draggable = true,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: GoOSFileIconProps) {
  const [renameValue, setRenameValue] = useState(title);
  const [isDragOver, setIsDragOver] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'case-study':
        return <Presentation size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} />;
      case 'folder':
        return <Folder size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} fill={goOSTokens.colors.accent.orangePale} />;
      default:
        return <FileText size={32} stroke={goOSTokens.colors.border} strokeWidth={1.5} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'case-study':
        return 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
      case 'folder':
        return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      default:
        return 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)';
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== title) {
      onRename?.(renameValue.trim());
    } else {
      setRenameValue(title);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (type === 'folder') {
      e.preventDefault();
      setIsDragOver(true);
    }
    onDragOver?.(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop?.(e);
  };

  return (
    <motion.div
      data-file-id={id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable={draggable && !isRenaming}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: position ? 'absolute' : 'relative',
        left: position?.x,
        top: position?.y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
        userSelect: 'none',
        width: 80,
        background: isSelected
          ? `${goOSTokens.colors.accent.orange}20`
          : isDragOver
          ? `${goOSTokens.colors.accent.orange}10`
          : 'transparent',
        border: isSelected
          ? `2px solid ${goOSTokens.colors.accent.orange}`
          : isDragOver
          ? `2px dashed ${goOSTokens.colors.accent.orange}`
          : '2px solid transparent',
        transition: 'background 0.15s, border 0.15s',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          background: getIconBg(),
          border: `2px solid ${goOSTokens.colors.border}`,
          boxShadow: goOSTokens.shadows.sm,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {getIcon()}

        {/* Draft indicator for files */}
        {type !== 'folder' && status === 'draft' && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: goOSTokens.colors.accent.orange,
              border: `1.5px solid ${goOSTokens.colors.border}`,
            }}
            title="Draft"
          />
        )}
      </div>

      {/* Title or Rename Input */}
      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') {
              setRenameValue(title);
              onRename?.(title); // Signal cancel
            }
          }}
          style={{
            width: '100%',
            padding: '2px 4px',
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            textAlign: 'center',
            background: goOSTokens.colors.paper,
            border: `1.5px solid ${goOSTokens.colors.accent.orange}`,
            borderRadius: 3,
            outline: 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          style={{
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            fontWeight: 500,
            color: goOSTokens.colors.text.primary,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '2px 4px',
            borderRadius: 3,
            background: isSelected ? goOSTokens.colors.accent.orangePale : 'transparent',
          }}
          title={title}
        >
          {title}
        </span>
      )}
    </motion.div>
  );
}

export default GoOSFileIcon;
