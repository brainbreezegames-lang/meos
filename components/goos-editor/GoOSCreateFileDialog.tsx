'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Image, Link, Video, Download, Loader2 } from 'lucide-react';
import { SPRING, fade, REDUCED_MOTION } from '@/lib/animations';

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
    icon: <Image size={18} />,
    placeholder: 'https://example.com/image.jpg',
    secondaryLabel: 'Caption (optional)',
    secondaryPlaceholder: 'Describe this image...',
    tertiaryLabel: 'Alt text (optional)',
    tertiaryPlaceholder: 'Alt text for accessibility',
  },
  link: {
    title: 'Add Link',
    icon: <Link size={18} />,
    placeholder: 'https://example.com',
    secondaryLabel: 'Title (optional)',
    secondaryPlaceholder: 'Link title...',
    tertiaryLabel: 'Description (optional)',
    tertiaryPlaceholder: 'Brief description...',
  },
  embed: {
    title: 'Add Embed',
    icon: <Video size={18} />,
    placeholder: 'https://youtube.com/watch?v=... or https://vimeo.com/...',
    secondaryLabel: 'Platform',
    secondaryPlaceholder: 'Auto-detected',
  },
  download: {
    title: 'Add Download',
    icon: <Download size={18} />,
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

// Custom dialog animation that doesn't use y offset (which breaks centering)
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
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

          {/* Centering container - flexbox for perfect centering */}
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
            {/* Dialog */}
            <motion.div
              variants={dialogVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.snappy}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 420,
                background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.98))',
                backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
                WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
                border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
                borderRadius: 'var(--radius-lg, 18px)',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
              {/* Header with traffic lights styling */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
                  background: 'var(--color-bg-elevated, rgba(255, 255, 255, 0.5))',
                }}
              >
                {/* Close button styled like traffic light */}
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, #ff6058 0%, #e0443e 100%)',
                    border: '0.5px solid rgba(0, 0, 0, 0.12)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X size={8} strokeWidth={2.5} style={{ opacity: 0 }} className="hover:opacity-100" />
                </button>

                {/* Spacer dots for visual balance */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.06))',
                    }}
                  />
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'var(--color-bg-subtle, rgba(23, 20, 18, 0.06))',
                    }}
                  />
                </div>

                {/* Title centered */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--color-accent-primary, #ff7722)' }}>{config.icon}</span>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary, #171412)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {config.title}
                  </h2>
                </div>

                {/* Invisible spacer to balance the layout */}
                <div style={{ width: 54 }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                {/* URL Input */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-muted, #8e827c)',
                      marginBottom: 8,
                      fontFamily: 'var(--font-body)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    URL
                  </label>
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setFocusedField('url')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={config.placeholder}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: 14,
                      fontFamily: 'var(--font-body)',
                      border: focusedField === 'url'
                        ? '2px solid var(--color-accent-primary, #ff7722)'
                        : '1px solid var(--color-border-default, rgba(23, 20, 18, 0.12))',
                      borderRadius: 'var(--radius-sm, 10px)',
                      background: 'var(--color-bg-primary, #fbf9ef)',
                      color: 'var(--color-text-primary, #171412)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      boxShadow: focusedField === 'url'
                        ? '0 0 0 3px var(--color-accent-primary-subtle, rgba(255, 119, 34, 0.12))'
                        : 'none',
                    }}
                  />
                </div>

                {/* Secondary Input */}
                {config.secondaryLabel && (
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--color-text-muted, #8e827c)',
                        marginBottom: 8,
                        fontFamily: 'var(--font-body)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {config.secondaryLabel}
                      {fileType === 'embed' && detectedPlatform && (
                        <span style={{ marginLeft: 8, color: 'var(--color-accent-primary, #ff7722)', textTransform: 'none' }}>
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
                          padding: '12px 14px',
                          fontSize: 14,
                          fontFamily: 'var(--font-body)',
                          border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.12))',
                          borderRadius: 'var(--radius-sm, 10px)',
                          background: 'var(--color-bg-primary, #fbf9ef)',
                          color: 'var(--color-text-primary, #171412)',
                          outline: 'none',
                          boxSizing: 'border-box',
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
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: 14,
                          fontFamily: 'var(--font-body)',
                          border: focusedField === 'secondary'
                            ? '2px solid var(--color-accent-primary, #ff7722)'
                            : '1px solid var(--color-border-default, rgba(23, 20, 18, 0.12))',
                          borderRadius: 'var(--radius-sm, 10px)',
                          background: 'var(--color-bg-primary, #fbf9ef)',
                          color: 'var(--color-text-primary, #171412)',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                          boxShadow: focusedField === 'secondary'
                            ? '0 0 0 3px var(--color-accent-primary-subtle, rgba(255, 119, 34, 0.12))'
                            : 'none',
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Tertiary Input */}
                {config.tertiaryLabel && (
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--color-text-muted, #8e827c)',
                        marginBottom: 8,
                        fontFamily: 'var(--font-body)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {config.tertiaryLabel}
                    </label>
                    <input
                      type="text"
                      value={tertiary}
                      onChange={(e) => setTertiary(e.target.value)}
                      onFocus={() => setFocusedField('tertiary')}
                      onBlur={() => setFocusedField(null)}
                      placeholder={config.tertiaryPlaceholder}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: 14,
                        fontFamily: 'var(--font-body)',
                        border: focusedField === 'tertiary'
                          ? '2px solid var(--color-accent-primary, #ff7722)'
                          : '1px solid var(--color-border-default, rgba(23, 20, 18, 0.12))',
                        borderRadius: 'var(--radius-sm, 10px)',
                        background: 'var(--color-bg-primary, #fbf9ef)',
                        color: 'var(--color-text-primary, #171412)',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        boxShadow: focusedField === 'tertiary'
                          ? '0 0 0 3px var(--color-accent-primary-subtle, rgba(255, 119, 34, 0.12))'
                          : 'none',
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
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'var(--font-body)',
                      border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.12))',
                      borderRadius: 'var(--radius-sm, 10px)',
                      background: 'var(--color-bg-primary, #fbf9ef)',
                      color: 'var(--color-text-secondary, #4a4744)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-subtle, #f2f0e7)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-primary, #fbf9ef)';
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
                      borderRadius: 'var(--radius-sm, 10px)',
                      background: !url.trim() || isSubmitting
                        ? 'var(--color-bg-subtle, #f2f0e7)'
                        : 'var(--color-accent-primary, #ff7722)',
                      color: !url.trim() || isSubmitting
                        ? 'var(--color-text-muted, #8e827c)'
                        : 'var(--color-text-on-accent, #fff)',
                      cursor: !url.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.15s ease, transform 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (url.trim() && !isSubmitting) {
                        e.currentTarget.style.background = 'var(--color-accent-primary-hover, #e56a1a)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (url.trim() && !isSubmitting) {
                        e.currentTarget.style.background = 'var(--color-accent-primary, #ff7722)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isSubmitting && (
                      <Loader2
                        size={14}
                        style={{
                          animation: 'spin 1s linear infinite',
                        }}
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
