'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Link, Video, Download, Loader2 } from 'lucide-react';
import { goOSTokens } from './GoOSTipTapEditor';

type FileType = 'image' | 'link' | 'embed' | 'download';

interface GoOSCreateFileDialogProps {
  isOpen: boolean;
  fileType: FileType | null;
  onClose: () => void;
  onCreateImage?: (url: string, caption?: string, alt?: string) => void;
  onCreateLink?: (url: string, title?: string, description?: string) => void;
  onCreateEmbed?: (url: string, embedType: string) => void;
  onCreateDownload?: (url: string, fileName: string, fileType?: string) => void;
}

const FILE_TYPE_CONFIG: Record<FileType, {
  title: string;
  icon: React.ReactNode;
  placeholder: string;
  secondaryLabel?: string;
  secondaryPlaceholder?: string;
  tertiaryLabel?: string;
  tertiaryPlaceholder?: string;
}> = {
  image: {
    title: 'Add Image',
    icon: <Image size={20} />,
    placeholder: 'https://example.com/image.jpg',
    secondaryLabel: 'Caption (optional)',
    secondaryPlaceholder: 'Describe this image...',
    tertiaryLabel: 'Alt text (optional)',
    tertiaryPlaceholder: 'Alt text for accessibility',
  },
  link: {
    title: 'Add Link',
    icon: <Link size={20} />,
    placeholder: 'https://example.com',
    secondaryLabel: 'Title (optional)',
    secondaryPlaceholder: 'Link title...',
    tertiaryLabel: 'Description (optional)',
    tertiaryPlaceholder: 'Brief description...',
  },
  embed: {
    title: 'Add Embed',
    icon: <Video size={20} />,
    placeholder: 'https://youtube.com/watch?v=... or https://vimeo.com/...',
    secondaryLabel: 'Platform',
    secondaryPlaceholder: 'Auto-detected',
  },
  download: {
    title: 'Add Download',
    icon: <Download size={20} />,
    placeholder: 'https://example.com/file.pdf',
    secondaryLabel: 'File name',
    secondaryPlaceholder: 'my-file.pdf',
    tertiaryLabel: 'File type (optional)',
    tertiaryPlaceholder: 'pdf, zip, psd...',
  },
};

const EMBED_PLATFORMS = [
  { id: 'youtube', label: 'YouTube', pattern: /youtube\.com|youtu\.be/ },
  { id: 'vimeo', label: 'Vimeo', pattern: /vimeo\.com/ },
  { id: 'spotify', label: 'Spotify', pattern: /spotify\.com/ },
  { id: 'figma', label: 'Figma', pattern: /figma\.com/ },
  { id: 'loom', label: 'Loom', pattern: /loom\.com/ },
  { id: 'codepen', label: 'CodePen', pattern: /codepen\.io/ },
];

function detectEmbedPlatform(url: string): string {
  for (const platform of EMBED_PLATFORMS) {
    if (platform.pattern.test(url)) {
      return platform.id;
    }
  }
  return 'other';
}

export function GoOSCreateFileDialog({
  isOpen,
  fileType,
  onClose,
  onCreateImage,
  onCreateLink,
  onCreateEmbed,
  onCreateDownload,
}: GoOSCreateFileDialogProps) {
  const [url, setUrl] = useState('');
  const [secondary, setSecondary] = useState('');
  const [tertiary, setTertiary] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setSecondary('');
      setTertiary('');
      setDetectedPlatform('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, fileType]);

  useEffect(() => {
    if (fileType === 'embed' && url) {
      const platform = detectEmbedPlatform(url);
      setDetectedPlatform(platform);
    }
  }, [url, fileType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !fileType) return;

    setIsSubmitting(true);

    try {
      switch (fileType) {
        case 'image':
          onCreateImage?.(url, secondary || undefined, tertiary || undefined);
          break;
        case 'link':
          onCreateLink?.(url, secondary || undefined, tertiary || undefined);
          break;
        case 'embed':
          onCreateEmbed?.(url, detectedPlatform || 'other');
          break;
        case 'download':
          const fileName = secondary || url.split('/').pop() || 'download';
          onCreateDownload?.(url, fileName, tertiary || undefined);
          break;
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fileType) return null;

  const config = FILE_TYPE_CONFIG[fileType];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 9998,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 420,
              maxWidth: '90vw',
              background: goOSTokens.colors.paper,
              border: `2px solid ${goOSTokens.colors.border}`,
              borderRadius: 8,
              boxShadow: goOSTokens.shadows.solid,
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: `1px solid ${goOSTokens.colors.border}30`,
                background: goOSTokens.colors.headerBg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: goOSTokens.colors.text.secondary }}>{config.icon}</span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: goOSTokens.colors.text.primary,
                    fontFamily: goOSTokens.fonts.heading,
                  }}
                >
                  {config.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  color: goOSTokens.colors.text.muted,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 16 }}>
              {/* URL Input */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: goOSTokens.colors.text.secondary,
                    marginBottom: 6,
                    fontFamily: goOSTokens.fonts.body,
                  }}
                >
                  URL
                </label>
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={config.placeholder}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 14,
                    fontFamily: goOSTokens.fonts.body,
                    border: `2px solid ${goOSTokens.colors.border}`,
                    borderRadius: 6,
                    background: goOSTokens.colors.paper,
                    color: goOSTokens.colors.text.primary,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Secondary Input */}
              {config.secondaryLabel && (
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: goOSTokens.colors.text.secondary,
                      marginBottom: 6,
                      fontFamily: goOSTokens.fonts.body,
                    }}
                  >
                    {config.secondaryLabel}
                    {fileType === 'embed' && detectedPlatform && (
                      <span style={{ marginLeft: 8, color: goOSTokens.colors.accent?.primary || goOSTokens.colors.text.primary }}>
                        (Detected: {detectedPlatform})
                      </span>
                    )}
                  </label>
                  {fileType === 'embed' ? (
                    <select
                      value={detectedPlatform}
                      onChange={(e) => setDetectedPlatform(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        fontFamily: goOSTokens.fonts.body,
                        border: `2px solid ${goOSTokens.colors.border}`,
                        borderRadius: 6,
                        background: goOSTokens.colors.paper,
                        color: goOSTokens.colors.text.primary,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {EMBED_PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={secondary}
                      onChange={(e) => setSecondary(e.target.value)}
                      placeholder={config.secondaryPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 14,
                        fontFamily: goOSTokens.fonts.body,
                        border: `2px solid ${goOSTokens.colors.border}`,
                        borderRadius: 6,
                        background: goOSTokens.colors.paper,
                        color: goOSTokens.colors.text.primary,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>
              )}

              {/* Tertiary Input */}
              {config.tertiaryLabel && (
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 500,
                      color: goOSTokens.colors.text.secondary,
                      marginBottom: 6,
                      fontFamily: goOSTokens.fonts.body,
                    }}
                  >
                    {config.tertiaryLabel}
                  </label>
                  <input
                    type="text"
                    value={tertiary}
                    onChange={(e) => setTertiary(e.target.value)}
                    placeholder={config.tertiaryPlaceholder}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: 14,
                      fontFamily: goOSTokens.fonts.body,
                      border: `2px solid ${goOSTokens.colors.border}`,
                      borderRadius: 6,
                      background: goOSTokens.colors.paper,
                      color: goOSTokens.colors.text.primary,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: goOSTokens.fonts.body,
                    border: `2px solid ${goOSTokens.colors.border}`,
                    borderRadius: 6,
                    background: goOSTokens.colors.paper,
                    color: goOSTokens.colors.text.primary,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!url.trim() || isSubmitting}
                  style={{
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: goOSTokens.fonts.body,
                    border: `2px solid ${goOSTokens.colors.border}`,
                    borderRadius: 6,
                    background: goOSTokens.colors.border,
                    color: goOSTokens.colors.paper,
                    cursor: !url.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: !url.trim() || isSubmitting ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GoOSCreateFileDialog;
