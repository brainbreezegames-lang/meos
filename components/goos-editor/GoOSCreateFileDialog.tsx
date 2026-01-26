'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Image, Link, Video, Download, Loader2 } from 'lucide-react';
import { SPRING, fade, REDUCED_MOTION } from '@/lib/animations';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR } from '../desktop/windowStyles';

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
    icon: <Image size={16} strokeWidth={1.5} />,
    placeholder: 'https://example.com/image.jpg',
    secondaryLabel: 'Caption (optional)',
    secondaryPlaceholder: 'Describe this image...',
    tertiaryLabel: 'Alt text (optional)',
    tertiaryPlaceholder: 'Alt text for accessibility',
  },
  link: {
    title: 'Add Link',
    icon: <Link size={16} strokeWidth={1.5} />,
    placeholder: 'https://example.com',
    secondaryLabel: 'Title (optional)',
    secondaryPlaceholder: 'Link title...',
    tertiaryLabel: 'Description (optional)',
    tertiaryPlaceholder: 'Brief description...',
  },
  embed: {
    title: 'Add Embed',
    icon: <Video size={16} strokeWidth={1.5} />,
    placeholder: 'https://youtube.com/watch?v=... or https://vimeo.com/...',
    secondaryLabel: 'Platform',
    secondaryPlaceholder: 'Auto-detected',
  },
  download: {
    title: 'Add Download',
    icon: <Download size={16} strokeWidth={1.5} />,
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

// Dialog animation
const dialogVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export function GoOSCreateFileDialog({
  isOpen,
  fileType,
  onClose,
  onCreateImage,
  onCreateLink,
  onCreateEmbed,
  onCreateDownload,
}: GoOSCreateFileDialogProps) {
  const prefersReducedMotion = useReducedMotion();
  const [url, setUrl] = useState('');
  const [secondary, setSecondary] = useState('');
  const [tertiary, setTertiary] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setSecondary('');
      setTertiary('');
      setDetectedPlatform('');
      setFocusedField(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, fileType]);

  useEffect(() => {
    if (fileType === 'embed' && url) {
      const platform = detectEmbedPlatform(url);
      setDetectedPlatform(platform);
    }
  }, [url, fileType]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  // Input styles - consistent across all inputs
  const getInputStyle = (fieldName: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    border: focusedField === fieldName
      ? '2px solid var(--color-accent-primary)'
      : '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-base)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: focusedField === fieldName
      ? '0 0 0 3px var(--color-accent-primary-subtle)'
      : 'none',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: 8,
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Centering container */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 24,
              pointerEvents: 'none',
            }}
          >
            {/* Dialog - uses unified WINDOW styles */}
            <motion.div
              role="dialog"
              aria-label={config.title}
              aria-modal="true"
              variants={dialogVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.snappy}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 420,
                // Use unified WINDOW styles
                background: WINDOW.background,
                border: WINDOW.border,
                borderRadius: WINDOW.borderRadius,
                boxShadow: WINDOW.shadow,
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              {/* Title Bar - uses unified TITLE_BAR styles */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${TITLE_BAR.paddingX}px`,
                  height: TITLE_BAR.height,
                  background: TITLE_BAR.background,
                  borderBottom: TITLE_BAR.borderBottom,
                  gap: 12,
                }}
              >
                {/* Traffic Lights - unified component, only close button for modal */}
                <TrafficLights
                  onClose={onClose}
                  showAll={false}
                  variant="macos"
                />

                {/* Title */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--color-accent-primary)' }}>{config.icon}</span>
                  <span
                    style={{
                      fontSize: TITLE_BAR.titleFontSize,
                      fontWeight: TITLE_BAR.titleFontWeight,
                      color: TITLE_BAR.titleColor,
                      fontFamily: 'var(--font-body)',
                      letterSpacing: TITLE_BAR.titleLetterSpacing,
                      opacity: TITLE_BAR.titleOpacityActive,
                    }}
                  >
                    {config.title}
                  </span>
                </div>

                {/* Spacer to balance layout */}
                <div style={{ width: 12 }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                {/* URL Input */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>URL</label>
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setFocusedField('url')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={config.placeholder}
                    required
                    style={getInputStyle('url')}
                  />
                </div>

                {/* Secondary Input */}
                {config.secondaryLabel && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>
                      {config.secondaryLabel}
                      {fileType === 'embed' && detectedPlatform && (
                        <span style={{ marginLeft: 8, color: 'var(--color-accent-primary)', textTransform: 'none' }}>
                          (Detected: {detectedPlatform})
                        </span>
                      )}
                    </label>
                    {fileType === 'embed' ? (
                      <select
                        value={detectedPlatform}
                        onChange={(e) => setDetectedPlatform(e.target.value)}
                        style={{
                          ...getInputStyle('secondary'),
                          cursor: 'pointer',
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
                        onFocus={() => setFocusedField('secondary')}
                        onBlur={() => setFocusedField(null)}
                        placeholder={config.secondaryPlaceholder}
                        style={getInputStyle('secondary')}
                      />
                    )}
                  </div>
                )}

                {/* Tertiary Input */}
                {config.tertiaryLabel && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>{config.tertiaryLabel}</label>
                    <input
                      type="text"
                      value={tertiary}
                      onChange={(e) => setTertiary(e.target.value)}
                      onFocus={() => setFocusedField('tertiary')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={config.tertiaryPlaceholder}
                      style={getInputStyle('tertiary')}
                    />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'var(--font-body)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-bg-base)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-base)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!url.trim() || isSubmitting}
                    style={{
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      background: !url.trim() || isSubmitting
                        ? 'var(--color-bg-subtle)'
                        : 'var(--color-accent-primary)',
                      color: !url.trim() || isSubmitting
                        ? 'var(--color-text-muted)'
                        : 'var(--color-text-on-accent)',
                      cursor: !url.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.15s ease, transform 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (url.trim() && !isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {isSubmitting && (
                      <Loader2
                        size={14}
                        style={{ animation: 'spin 1s linear infinite' }}
                      />
                    )}
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GoOSCreateFileDialog;
