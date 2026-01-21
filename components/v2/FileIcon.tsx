'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation, Folder } from 'lucide-react';

export type FileType = 'note' | 'case-study' | 'folder';

interface FileIconProps {
  id: string;
  type: FileType;
  title: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

/**
 * Desktop file icon
 * Uses ONLY CSS variables from design-system.css
 */
export const FileIcon = memo(function FileIcon({
  id,
  type,
  title,
  isSelected = false,
  onClick,
  onDoubleClick,
}: FileIconProps) {
  const getIcon = () => {
    const iconStyle = { color: 'var(--ds-text-primary)' };
    switch (type) {
      case 'case-study':
        return <Presentation size={28} strokeWidth={1.5} style={iconStyle} />;
      case 'folder':
        return <Folder size={28} strokeWidth={1.5} style={iconStyle} />;
      default:
        return <FileText size={28} strokeWidth={1.5} style={iconStyle} />;
    }
  };

  return (
    <motion.button
      data-file-id={id}
      data-file-type={type}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--ds-space-2)',
        padding: 'var(--ds-space-2)',
        width: 80,
        background: isSelected ? 'var(--ds-accent-subtle)' : 'transparent',
        border: isSelected ? '2px solid var(--ds-accent)' : '2px solid transparent',
        borderRadius: 'var(--ds-radius-md)',
        cursor: 'pointer',
        outline: 'none',
        transition: `background var(--ds-duration-fast) var(--ds-ease-out), border var(--ds-duration-fast) var(--ds-ease-out)`,
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: 52,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ds-file-icon-bg)',
          border: '1px solid var(--ds-file-icon-border)',
          borderRadius: 'var(--ds-radius-lg)',
          boxShadow: 'var(--ds-file-icon-shadow)',
        }}
      >
        {getIcon()}
      </div>

      {/* Title */}
      <span
        style={{
          fontSize: 'var(--ds-text-xs)',
          fontWeight: 'var(--ds-weight-medium)',
          fontFamily: 'var(--ds-font-body)',
          color: 'var(--ds-text-primary)',
          textAlign: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '2px 4px',
          borderRadius: 'var(--ds-radius-xs)',
          background: isSelected ? 'var(--ds-accent-subtle)' : 'transparent',
        }}
        title={title}
      >
        {title}
      </span>
    </motion.button>
  );
});
