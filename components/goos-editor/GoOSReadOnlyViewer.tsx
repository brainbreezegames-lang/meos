'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Square, FileText, Presentation } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';
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
  isActive?: boolean;
  zIndex?: number;
}

export function GoOSReadOnlyViewer({
  file,
  onClose,
  isActive = true,
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
        top: '10%',
        left: '15%',
        right: '15%',
        bottom: '10%',
        minWidth: 600,
        maxWidth: 900,
        maxHeight: '80vh',
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
        }}
      >
        {/* Close Button */}
        <div style={{ display: 'flex', gap: 6 }}>
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
            <X size={8} strokeWidth={2.5} color={goOSTokens.colors.border} style={{ opacity: 0 }} className="traffic-icon" />
          </button>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#ccc',
              border: `1.5px solid ${goOSTokens.colors.border}`,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#ccc',
              border: `1.5px solid ${goOSTokens.colors.border}`,
              opacity: 0.5,
            }}
          />
        </div>

        {/* File Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <FileIcon
            size={16}
            stroke={goOSTokens.colors.border}
            strokeWidth={1.5}
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
            {file.title}
          </span>
        </div>

        {/* Reading time */}
        <span
          style={{
            fontSize: 11,
            fontFamily: goOSTokens.fonts.body,
            color: goOSTokens.colors.text.muted,
          }}
        >
          {readingTime} min read
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 32px',
        }}
      >
        <div
          className="goos-content prose prose-sm max-w-none"
          style={{
            fontFamily: goOSTokens.fonts.body,
            fontSize: 15,
            lineHeight: 1.7,
            color: goOSTokens.colors.text.primary,
          }}
          dangerouslySetInnerHTML={{ __html: file.content }}
        />
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
        <span>{wordCount} words</span>
        <span style={{ fontFamily: goOSTokens.fonts.handwritten, fontSize: 12 }}>
          goOS
        </span>
      </div>

      {/* Styles for traffic light hover */}
      <style jsx>{`
        button:hover .traffic-icon {
          opacity: 1 !important;
        }
        .goos-content h1 {
          font-family: ${goOSTokens.fonts.display};
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          color: ${goOSTokens.colors.text.primary};
        }
        .goos-content h2 {
          font-family: ${goOSTokens.fonts.display};
          font-size: 22px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 12px;
          color: ${goOSTokens.colors.text.primary};
        }
        .goos-content h3 {
          font-family: ${goOSTokens.fonts.display};
          font-size: 18px;
          font-weight: 600;
          margin-top: 20px;
          margin-bottom: 8px;
          color: ${goOSTokens.colors.text.primary};
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
          color: ${goOSTokens.colors.accent.primary};
          text-decoration: underline;
        }
        .goos-content blockquote {
          border-left: 3px solid ${goOSTokens.colors.accent.primary};
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: ${goOSTokens.colors.text.secondary};
        }
        .goos-content code {
          background: ${goOSTokens.colors.headerBg};
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
        }
        .goos-content pre {
          background: ${goOSTokens.colors.headerBg};
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
