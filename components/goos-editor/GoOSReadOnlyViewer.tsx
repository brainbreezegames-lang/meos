'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation } from 'lucide-react';
import { GoOSTrafficLights } from './GoOSTrafficLights';
import type { PublishStatus } from './GoOSPublishToggle';

interface GoOSFile {
  id: string;
  type: 'note' | 'case-study' | 'folder';
  title: string;
  content: string;
  status: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
  position: { x: number; y: number };
}

interface GoOSReadOnlyViewerProps {
  file: GoOSFile;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isActive?: boolean;
  isMaximized?: boolean;
  zIndex?: number;
}

export function GoOSReadOnlyViewer({
  file,
  onClose,
  onMinimize,
  onMaximize,
  isActive = true,
  isMaximized = false,
  zIndex = 100,
}: GoOSReadOnlyViewerProps) {
  const FileIcon = file.type === 'case-study' ? Presentation : FileText;

  // Word count
  const wordCount = file.content
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

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
        top: isMaximized ? 'var(--menubar-height, 36px)' : '10%',
        left: isMaximized ? 0 : '50%',
        transform: isMaximized ? 'none' : 'translateX(-50%)',
        width: isMaximized ? '100%' : 'min(900px, 90vw)',
        height: isMaximized ? 'calc(100vh - var(--menubar-height, 36px) - 80px)' : 'min(80vh, 700px)',
        minWidth: 400,
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

        {/* File Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FileIcon
            size={16}
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
            {file.title}
          </span>
        </div>

        {/* Reading time */}
        <span
          style={{
            fontSize: 'var(--font-size-xs, 10px)',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-text-muted)',
          }}
        >
          {readingTime} min read
        </span>
      </div>

      {/* Content - responsive */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          background: 'var(--color-bg-white)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: isMaximized ? '720px' : '100%',
            padding: isMaximized ? '32px 24px' : '24px 32px',
          }}
        >
          <div
            className="goos-content prose prose-sm max-w-none"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-lg, 16px)',
              lineHeight: 1.7,
              color: 'var(--color-text-primary)',
            }}
            dangerouslySetInnerHTML={{ __html: file.content }}
          />
        </div>
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
        <span>{wordCount} words</span>
        <span style={{ fontSize: 11 }}>goOS</span>
      </div>

      {/* Content styles */}
      <style jsx global>{`
        .goos-content h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--color-text-primary);
        }
        .goos-content h2 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 12px;
          color: var(--color-text-primary);
        }
        .goos-content h3 {
          font-size: 18px;
          font-weight: 600;
          margin-top: 20px;
          margin-bottom: 8px;
          color: var(--color-text-primary);
        }
        .goos-content p {
          margin-bottom: 16px;
        }
        .goos-content ul, .goos-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }
        .goos-content li {
          margin-bottom: 4px;
        }
        .goos-content a {
          color: var(--color-accent-primary);
          text-decoration: underline;
        }
        .goos-content blockquote {
          border-left: 3px solid var(--color-accent-primary);
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: var(--color-text-secondary);
        }
        .goos-content code {
          background: var(--color-bg-subtle);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
        }
        .goos-content pre {
          background: var(--color-bg-subtle);
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .goos-content pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </motion.div>
  );
}

export default GoOSReadOnlyViewer;
