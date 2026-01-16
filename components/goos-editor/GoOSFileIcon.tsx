'use client';

import React, { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { FileText, Presentation, Folder } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
import { PublishStatus } from './GoOSPublishToggle';

export type FileType = 'note' | 'case-study' | 'folder';

interface GoOSFileIconProps {
  id: string;
  type: FileType;
  title: string;
  status?: PublishStatus;
  isSelected?: boolean;
  isRenaming?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRename?: (newTitle: string) => void;
  position: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onFileDrop?: (droppedFileId: string) => void;
  isDraggedOver?: boolean;
  onDragStart?: () => void;
  onDrag?: (info: { x: number; y: number }) => void;
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
  onPositionChange,
  onFileDrop,
  isDraggedOver = false,
  onDragStart: onDragStartProp,
  onDrag,
}: GoOSFileIconProps) {
  const [renameValue, setRenameValue] = useState(title);
  const isDraggingRef = useRef(false);

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

  const handleDragStart = () => {
    isDraggingRef.current = true;
    onDragStartProp?.();
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onDrag?.({
      x: position.x + info.offset.x + 40, // Center of icon
      y: position.y + info.offset.y + 40,
    });
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDraggingRef.current = false;
    onPositionChange?.({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we just finished dragging
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    onClick?.(e);
  };

  return (
    <motion.div
      data-file-id={id}
      data-file-type={type}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag={!isRenaming}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        cursor: 'grab',
        userSelect: 'none',
        width: 80,
        background: isSelected
          ? `${goOSTokens.colors.accent.orange}20`
          : isDraggedOver && type === 'folder'
          ? `${goOSTokens.colors.accent.orange}15`
          : 'transparent',
        border: isSelected
          ? `2px solid ${goOSTokens.colors.accent.orange}`
          : isDraggedOver && type === 'folder'
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
