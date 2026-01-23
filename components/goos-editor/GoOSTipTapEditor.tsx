'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Youtube from '@tiptap/extension-youtube';
import { common, createLowlight } from 'lowlight';
import { GoOSEditorToolbar } from './GoOSEditorToolbar';

const lowlight = createLowlight(common);

// Image layout types for different display options
export type ImageLayout = 'content' | 'full-bleed' | 'side-by-side';

// Custom Image extension with layout support
const GoOSImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      layout: {
        default: 'content',
        parseHTML: element => element.getAttribute('data-layout') || 'content',
        renderHTML: attributes => {
          return { 'data-layout': attributes.layout };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      class: `goos-image goos-image-${HTMLAttributes['data-layout'] || 'content'}`,
    })];
  },
});

// goOS Design Tokens - Aligned with design-system.css CSS variables
// NOTE: These use the EXACT variable names from design-system.css
export const goOSTokens = {
  colors: {
    // Backgrounds
    paper: 'var(--color-bg-base)',
    cream: 'var(--color-bg-base)',
    headerBg: 'var(--color-bg-subtle)',
    windowBg: 'var(--color-bg-base)',
    contentBg: 'var(--color-bg-white)',
    // Borders
    border: 'var(--color-border-default)',
    borderStrong: 'var(--color-border-strong)',
    // Text
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
    },
    // Accent
    accent: {
      primary: 'var(--color-accent-primary)',
      primaryDark: 'var(--color-accent-primary-hover)',
      dark: 'var(--color-accent-primary-hover)',
      light: 'var(--color-accent-primary)',
      pale: 'var(--color-accent-primary-subtle)',
    },
    // Status colors
    status: {
      success: 'var(--color-success)',
      successLight: 'var(--color-success-subtle)',
      successDark: 'var(--color-success)',
      error: 'var(--color-error)',
      errorLight: 'var(--color-error-subtle)',
      errorDark: 'var(--color-error)',
      warning: 'var(--color-warning)',
      warningLight: 'var(--color-warning-subtle)',
      neutral: 'var(--color-text-muted)',
    },
    // Traffic light colors (use CSS variables)
    traffic: {
      close: 'var(--color-traffic-close)',
      minimize: 'var(--color-traffic-minimize)',
      maximize: 'var(--color-traffic-maximize)',
      disabled: 'var(--color-traffic-inactive)',
    },
  },
  shadows: {
    solid: 'var(--shadow-sm)',
    hover: 'var(--shadow-md)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    button: 'var(--shadow-sm)',
  },
  radii: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    full: 'var(--radius-full)',
  },
  fonts: {
    // Use the CSS variables from design-system.css
    display: 'var(--font-display)',  // Averia Serif Libre for headings
    heading: 'var(--font-display)',  // Alias for display (backwards compat)
    body: 'var(--font-body)',        // Instrument Sans for body text
    mono: 'var(--font-mono)',        // System monospace
  },
};

interface GoOSTipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
  hideToolbar?: boolean;
}

// Image compression settings
const IMAGE_MAX_WIDTH = 2048;
const IMAGE_MAX_HEIGHT = 2048;
const IMAGE_QUALITY = 0.85;
const COMPRESSION_THRESHOLD = 500 * 1024; // 500KB - skip compression for small files

/**
 * Compress image using Canvas API
 * - Resizes large images to max dimensions
 * - Compresses to WebP (with JPEG fallback)
 * - Skips small files that don't need compression
 */
async function compressImage(file: File): Promise<File> {
  // Skip compression for small files or non-images
  if (file.size < COMPRESSION_THRESHOLD || !file.type.startsWith('image/')) {
    return file;
  }

  // Skip GIFs (animation would be lost)
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > IMAGE_MAX_WIDTH || height > IMAGE_MAX_HEIGHT) {
        const ratio = Math.min(IMAGE_MAX_WIDTH / width, IMAGE_MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Try WebP first (better compression), fallback to JPEG
      const mimeType = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            // Compression successful and smaller
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.webp'),
              { type: mimeType }
            );
            resolve(compressedFile);
          } else {
            // Compression didn't help or failed, use original
            resolve(file);
          }
        },
        mimeType,
        IMAGE_QUALITY
      );

      // Cleanup
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      // On error, return original file
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Convert file to base64 data URL (optimized with compression)
async function fileToBase64(file: File): Promise<string> {
  // Compress before converting to base64
  const compressed = await compressImage(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
}

// Upload image to API with compression and base64 fallback
async function uploadImage(file: File): Promise<string | null> {
  try {
    // Compress image first
    const compressed = await compressImage(file);

    const formData = new FormData();
    formData.append('file', compressed);
    formData.append('type', 'image');

    const response = await fetch('/api/goos/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      return result.data.url;
    }

    // If upload failed (auth issues, etc.), fallback to base64
    console.warn('Upload failed, using base64 fallback:', result.error);
    return await fileToBase64(compressed);
  } catch (error) {
    // Network error or other issues - fallback to base64
    console.warn('Upload error, using base64 fallback:', error);
    return await fileToBase64(file);
  }
}

export function GoOSTipTapEditor({
  content,
  onChange,
  onSave,
  placeholder = 'Start writing...',
  editable = true,
  autoFocus = false,
  hideToolbar = false,
}: GoOSTipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      GoOSImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'goos-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'goos-link',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'goos-code-block',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'goos-youtube',
        },
      }),
    ],
    content,
    editable,
    autofocus: autoFocus ? 'end' : false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'goos-editor-content',
      },
      // Handle paste events for images
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              setIsUploading(true);
              setUploadStatus('Optimizing image...');
              uploadImage(file).then(url => {
                setIsUploading(false);
                setUploadStatus('');
                if (url) {
                  view.dispatch(view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: url, layout: 'content' })
                  ));
                }
              });
            }
            return true;
          }
        }
        return false;
      },
      // Handle drop events for images
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;

        event.preventDefault();
        setIsUploading(true);
        setUploadStatus('Optimizing image...');

        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

        // Process images sequentially
        (async () => {
          for (let i = 0; i < imageFiles.length; i++) {
            setUploadStatus(`Optimizing image ${i + 1} of ${imageFiles.length}...`);
            const url = await uploadImage(imageFiles[i]);
            if (url && coordinates) {
              const node = view.state.schema.nodes.image.create({ src: url, layout: 'content' });
              const transaction = view.state.tr.insert(coordinates.pos + i, node);
              view.dispatch(transaction);
            }
          }
          setIsUploading(false);
          setUploadStatus('');
        })();

        return true;
      },
    },
  });

  // Handle Cmd+S for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  // Sync content changes from parent
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Scroll to top when editor first mounts - use multiple attempts to ensure it works
  useEffect(() => {
    if (editor && scrollContainerRef.current) {
      // Immediate scroll
      scrollContainerRef.current.scrollTop = 0;

      // Also scroll after content renders
      const scrollToTop = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      };

      // Multiple attempts to catch different timing scenarios
      requestAnimationFrame(scrollToTop);
      setTimeout(scrollToTop, 0);
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 100);
    }
  }, [editor]);

  // Insert image(s) with specific layout
  const insertImagesWithLayout = useCallback(async (files: File[], layout: ImageLayout) => {
    if (!editor || files.length === 0) return;

    setIsUploading(true);
    setShowLayoutPicker(false);

    const total = layout === 'side-by-side' ? Math.min(files.length, 2) : files.length;

    if (layout === 'side-by-side' && files.length >= 2) {
      setUploadStatus('Optimizing image 1 of 2...');
      const url1 = await uploadImage(files[0]);
      setUploadStatus('Optimizing image 2 of 2...');
      const url2 = await uploadImage(files[1]);

      if (url1 && url2) {
        editor.chain().focus()
          .setImage({ src: url1, layout: 'side-by-side' } as any)
          .run();
        editor.chain().focus()
          .setImage({ src: url2, layout: 'side-by-side' } as any)
          .run();
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        setUploadStatus(`Optimizing image ${i + 1} of ${total}...`);
        const url = await uploadImage(files[i]);
        if (url) {
          editor.chain().focus()
            .setImage({ src: url, layout } as any)
            .run();
        }
      }
    }

    setIsUploading(false);
    setUploadStatus('');
    setPendingFiles([]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor]);

  // Handle file input change for image upload
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !editor) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please select image files');
      return;
    }

    // Show layout picker for user to choose
    setPendingFiles(imageFiles);
    setShowLayoutPicker(true);
  }, [editor]);

  const addImage = useCallback(() => {
    // Show file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const addImageFromUrl = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = window.prompt('Enter YouTube URL');
    if (url && editor) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="goos-editor-wrapper">
      {/* Hidden file input for image upload (multiple allowed for side-by-side) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Upload indicator */}
      {isUploading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-bg-overlay, rgba(251, 249, 239, 0.9))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              background: goOSTokens.colors.paper,
              border: `2px solid ${goOSTokens.colors.border}`,
              borderRadius: 6,
              boxShadow: goOSTokens.shadows.solid,
              fontFamily: goOSTokens.fonts.body,
              fontSize: 14,
              color: goOSTokens.colors.text.primary,
            }}
          >
            {uploadStatus || 'Optimizing image...'}
          </div>
        </div>
      )}

      {/* Image Layout Picker */}
      {showLayoutPicker && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-bg-overlay, rgba(251, 249, 239, 0.95))',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => { setShowLayoutPicker(false); setPendingFiles([]); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: goOSTokens.colors.paper,
              border: `1px solid ${goOSTokens.colors.border}`,
              borderRadius: 16,
              boxShadow: goOSTokens.shadows.lg,
              padding: '24px',
              minWidth: 320,
              fontFamily: goOSTokens.fonts.body,
            }}
          >
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: goOSTokens.fonts.display,
              color: goOSTokens.colors.text.primary,
            }}>
              Choose image layout
            </h3>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: 13,
              color: goOSTokens.colors.text.secondary,
            }}>
              {pendingFiles.length} image{pendingFiles.length > 1 ? 's' : ''} selected
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Content width (default) */}
              <button
                onClick={() => insertImagesWithLayout(pendingFiles, 'content')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-primary-subtle)';
                  e.currentTarget.style.borderColor = 'rgba(255, 119, 34, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-subtle)';
                  e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 32,
                  background: '#e5e5e5',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 8px',
                }}>
                  <div style={{ width: '70%', height: '100%', background: '#999', borderRadius: 2 }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: goOSTokens.colors.text.primary }}>
                    Content width
                  </div>
                  <div style={{ fontSize: 12, color: goOSTokens.colors.text.muted }}>
                    Aligned with text
                  </div>
                </div>
              </button>

              {/* Full bleed */}
              <button
                onClick={() => insertImagesWithLayout(pendingFiles, 'full-bleed')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent-primary-subtle)';
                  e.currentTarget.style.borderColor = 'rgba(255, 119, 34, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-subtle)';
                  e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 32,
                  background: '#999',
                  borderRadius: 4,
                }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: goOSTokens.colors.text.primary }}>
                    Full bleed
                  </div>
                  <div style={{ fontSize: 12, color: goOSTokens.colors.text.muted }}>
                    Edge to edge cover
                  </div>
                </div>
              </button>

              {/* Side by side (only if 2+ files) */}
              {pendingFiles.length >= 2 && (
                <button
                  onClick={() => insertImagesWithLayout(pendingFiles.slice(0, 2), 'side-by-side')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-accent-primary-subtle)';
                    e.currentTarget.style.borderColor = 'rgba(255, 119, 34, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-bg-subtle)';
                    e.currentTarget.style.borderColor = 'var(--color-border-subtle)';
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 32,
                    background: '#e5e5e5',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    padding: 3,
                  }}>
                    <div style={{ flex: 1, height: '100%', background: '#999', borderRadius: 2 }} />
                    <div style={{ flex: 1, height: '100%', background: '#999', borderRadius: 2 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: goOSTokens.colors.text.primary }}>
                      Side by side
                    </div>
                    <div style={{ fontSize: 12, color: goOSTokens.colors.text.muted }}>
                      Two images in a row
                    </div>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => { setShowLayoutPicker(false); setPendingFiles([]); }}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: goOSTokens.colors.text.muted,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toolbar - hidden in zen mode */}
      {!hideToolbar && (
        <GoOSEditorToolbar
          editor={editor}
          onAddImage={addImage}
          onAddImageFromUrl={addImageFromUrl}
          onAddVideo={addVideo}
          onSetLink={setLink}
        />
      )}

      {/* Bubble Menu for selections */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="goos-bubble-menu"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          aria-label="Underline"
          aria-pressed={editor.isActive('underline')}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          aria-label="Strikethrough"
          aria-pressed={editor.isActive('strike')}
        >
          S
        </button>
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          aria-label="Add link"
          aria-pressed={editor.isActive('link')}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
          aria-label="Highlight"
          aria-pressed={editor.isActive('highlight')}
        >
          Highlight
        </button>
      </BubbleMenu>

      {/* Image Bubble Menu - shows when image is selected */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="goos-image-menu"
        shouldShow={({ editor }) => editor.isActive('image')}
      >
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().updateAttributes('image', { layout: 'content' }).run();
          }}
          className={editor.getAttributes('image').layout === 'content' || !editor.getAttributes('image').layout ? 'is-active' : ''}
          aria-label="Content width"
          title="Content width"
        >
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
            <rect x="3" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().updateAttributes('image', { layout: 'full-bleed' }).run();
          }}
          className={editor.getAttributes('image').layout === 'full-bleed' ? 'is-active' : ''}
          aria-label="Full bleed"
          title="Full bleed"
        >
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
            <rect x="0.5" y="2" width="15" height="10" rx="0" stroke="currentColor" strokeWidth="1"/>
            <rect x="1" y="2.5" width="14" height="9" fill="currentColor" fillOpacity="0.2"/>
          </svg>
        </button>
        <span style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().deleteSelection().run();
          }}
          aria-label="Delete image"
          title="Delete"
          style={{ color: '#ef4444' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M11 4v7.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4" strokeLinecap="round"/>
          </svg>
        </button>
      </BubbleMenu>

      {/* Floating Menu for new lines */}
      <FloatingMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="goos-floating-menu"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code block"
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Block quote"
        >
          Quote
        </button>
        <button type="button" onClick={addImage} aria-label="Add image">
          Image
        </button>
      </FloatingMenu>

      {/* Editor Content */}
      <div ref={scrollContainerRef} className="goos-editor-container">
        <EditorContent editor={editor} />
      </div>

      {/* Styles */}
      <style jsx global>{`
        .goos-editor-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .goos-editor-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          background: ${goOSTokens.colors.cream};
        }

        .goos-editor-content {
          outline: none;
          min-height: 100%;
          font-family: ${goOSTokens.fonts.body};
          font-size: var(--font-size-base);
          line-height: var(--line-height-relaxed);
          color: ${goOSTokens.colors.text.primary};
        }

        /* Text selection - always visible with warm accent */
        .goos-editor-content ::selection {
          background: rgba(255, 119, 34, 0.25);
          color: #171412;
        }

        .goos-editor-content ::-moz-selection {
          background: rgba(255, 119, 34, 0.25);
          color: #171412;
        }

        /* ProseMirror selection state */
        .ProseMirror-selectednode {
          outline: 2px solid ${goOSTokens.colors.accent.primary};
          outline-offset: 2px;
        }

        .goos-editor-content.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: ${goOSTokens.colors.text.muted};
          font-style: italic;
          pointer-events: none;
          height: 0;
        }

        .goos-editor-content > * + * {
          margin-top: 0.75em;
        }

        .goos-editor-content h1 {
          font-family: ${goOSTokens.fonts.display};
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          line-height: var(--line-height-tight);
          letter-spacing: var(--letter-spacing-tight);
          color: ${goOSTokens.colors.text.primary};
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }

        .goos-editor-content h1:first-child {
          margin-top: 0;
        }

        .goos-editor-content h2 {
          font-family: ${goOSTokens.fonts.display};
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          line-height: var(--line-height-snug);
          letter-spacing: var(--letter-spacing-tight);
          color: ${goOSTokens.colors.text.primary};
          margin-top: 1.3em;
          margin-bottom: 0.4em;
        }

        .goos-editor-content h3 {
          font-family: ${goOSTokens.fonts.display};
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          line-height: var(--line-height-snug);
          color: ${goOSTokens.colors.text.secondary};
          margin-top: 1.2em;
          margin-bottom: 0.3em;
        }

        .goos-editor-content p {
          margin: 0;
        }

        .goos-editor-content ul,
        .goos-editor-content ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .goos-editor-content li {
          margin: 0.25em 0;
        }

        .goos-editor-content li > p {
          margin: 0;
        }

        .goos-editor-content blockquote {
          border-left: 3px solid ${goOSTokens.colors.accent.primary};
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: ${goOSTokens.colors.text.secondary};
          background: ${goOSTokens.colors.accent.pale}20;
          padding: 12px 16px;
          border-radius: 0 4px 4px 0;
        }

        .goos-editor-content .goos-link {
          color: ${goOSTokens.colors.accent.primary};
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        .goos-editor-content .goos-link:hover {
          color: ${goOSTokens.colors.accent.dark};
        }

        .goos-editor-content mark {
          background: #fef08a;
          color: #1a1a1a;
          padding: 0 2px;
          border-radius: 2px;
        }

        /* Image layouts */
        .goos-editor-content img.goos-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: ${goOSTokens.shadows.sm};
          margin: 1.5em 0;
          display: block;
        }

        /* Content width (default) - aligned with text */
        .goos-editor-content img.goos-image-content {
          max-width: 100%;
          border: 1px solid ${goOSTokens.colors.border};
        }

        /* Full bleed - edge to edge */
        .goos-editor-content img.goos-image-full-bleed {
          width: calc(100% + 48px);
          max-width: none;
          margin-left: -24px;
          margin-right: -24px;
          border-radius: 0;
          border: none;
        }

        /* Side by side - two images in a row */
        .goos-editor-content img.goos-image-side-by-side {
          display: inline-block;
          width: calc(50% - 8px);
          max-width: calc(50% - 8px);
          margin: 1em 0;
          vertical-align: top;
        }

        .goos-editor-content img.goos-image-side-by-side + img.goos-image-side-by-side {
          margin-left: 16px;
        }

        /* Legacy/fallback for images without layout class */
        .goos-editor-content img:not(.goos-image) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          border: 2px solid ${goOSTokens.colors.border};
          box-shadow: ${goOSTokens.shadows.sm};
          margin: 1em 0;
        }

        /* YouTube Embed Styling */
        .goos-editor-content .goos-youtube {
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid ${goOSTokens.colors.border};
          box-shadow: ${goOSTokens.shadows.sm};
          margin: 1em 0;
          aspect-ratio: 16/9;
        }

        .goos-editor-content .goos-youtube iframe {
          width: 100%;
          height: 100%;
        }

        .goos-editor-content hr {
          border: none;
          border-top: 2px dashed ${goOSTokens.colors.border}40;
          margin: 2em 0;
        }

        /* Code Block Styling */
        .goos-editor-content .goos-code-block {
          background: ${goOSTokens.colors.headerBg};
          border: 2px solid ${goOSTokens.colors.border};
          border-radius: 4px;
          padding: 16px;
          font-family: ${goOSTokens.fonts.mono};
          font-size: var(--font-size-sm);
          line-height: var(--line-height-normal);
          overflow-x: auto;
          margin: 1em 0;
          box-shadow: ${goOSTokens.shadows.sm};
        }

        .goos-editor-content .goos-code-block code {
          background: transparent;
          padding: 0;
          font-size: inherit;
        }

        .goos-editor-content code {
          background: ${goOSTokens.colors.accent.pale}40;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: ${goOSTokens.fonts.mono};
          font-size: 0.9em;
          color: ${goOSTokens.colors.accent.dark};
        }

        /* Syntax Highlighting */
        .hljs-comment,
        .hljs-quote {
          color: #6a737d;
          font-style: italic;
        }

        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-addition {
          color: #d73a49;
        }

        .hljs-number,
        .hljs-string,
        .hljs-meta .hljs-meta-string,
        .hljs-literal,
        .hljs-doctag,
        .hljs-regexp {
          color: #032f62;
        }

        .hljs-title,
        .hljs-section,
        .hljs-name,
        .hljs-selector-id,
        .hljs-selector-class {
          color: #6f42c1;
        }

        .hljs-attribute,
        .hljs-attr,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-class .hljs-title,
        .hljs-type {
          color: #005cc5;
        }

        .hljs-symbol,
        .hljs-bullet,
        .hljs-subst,
        .hljs-meta,
        .hljs-meta .hljs-keyword,
        .hljs-selector-attr,
        .hljs-selector-pseudo,
        .hljs-link {
          color: ${goOSTokens.colors.accent.primary};
        }

        .hljs-built_in,
        .hljs-deletion {
          color: #22863a;
        }

        /* Bubble Menu - calm-tech glass style */
        .goos-bubble-menu {
          display: flex;
          gap: 4px;
          padding: 8px 10px;
          background: var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95));
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06));
          border-radius: var(--radius-md, 12px);
          box-shadow: var(--shadow-lg);
          animation: menuPopIn 0.15s ease-out;
        }

        @keyframes menuPopIn {
          0% { opacity: 0; transform: scale(0.95) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .goos-bubble-menu button {
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          font-family: ${goOSTokens.fonts.body};
          background: transparent;
          border: none;
          border-radius: var(--radius-sm, 8px);
          cursor: pointer;
          color: ${goOSTokens.colors.text.secondary};
          transition: all 0.15s ease;
        }

        .goos-bubble-menu button:hover {
          background: var(--color-bg-subtle, rgba(23, 20, 18, 0.04));
          color: ${goOSTokens.colors.text.primary};
          transform: translateY(-1px);
        }

        .goos-bubble-menu button:active {
          transform: translateY(0) scale(0.98);
        }

        .goos-bubble-menu button.is-active {
          background: ${goOSTokens.colors.accent.primary};
          color: var(--color-text-on-accent, #fbf9ef);
          box-shadow: 0 2px 8px rgba(255, 119, 34, 0.3);
        }

        /* Image Menu - appears when image selected */
        .goos-image-menu {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 6px 8px;
          background: var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.98));
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.08));
          border-radius: var(--radius-md, 12px);
          box-shadow: var(--shadow-lg);
          animation: menuPopIn 0.15s ease-out;
        }

        .goos-image-menu button {
          padding: 6px 8px;
          font-size: 12px;
          font-weight: 500;
          font-family: ${goOSTokens.fonts.body};
          background: transparent;
          border: none;
          border-radius: var(--radius-sm, 6px);
          cursor: pointer;
          color: ${goOSTokens.colors.text.secondary};
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .goos-image-menu button:hover {
          background: var(--color-bg-subtle, rgba(23, 20, 18, 0.06));
          color: ${goOSTokens.colors.text.primary};
        }

        .goos-image-menu button.is-active {
          background: ${goOSTokens.colors.accent.primary};
          color: var(--color-text-on-accent, #fbf9ef);
        }

        /* Floating Menu - calm-tech glass style */
        .goos-floating-menu {
          display: flex;
          gap: 4px;
          padding: 8px 10px;
          background: var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95));
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06));
          border-radius: var(--radius-md, 12px);
          box-shadow: var(--shadow-lg);
          animation: menuPopIn 0.15s ease-out;
        }

        .goos-floating-menu button {
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 500;
          font-family: ${goOSTokens.fonts.body};
          background: var(--color-bg-subtle, rgba(23, 20, 18, 0.04));
          border: 1px solid transparent;
          border-radius: var(--radius-sm, 8px);
          cursor: pointer;
          color: ${goOSTokens.colors.text.secondary};
          transition: all 0.15s ease;
        }

        .goos-floating-menu button:hover {
          background: ${goOSTokens.colors.accent.pale};
          border-color: rgba(255, 119, 34, 0.2);
          color: ${goOSTokens.colors.accent.dark};
          transform: translateY(-1px);
        }

        .goos-floating-menu button:active {
          transform: translateY(0) scale(0.98);
        }

        /* Focus states for accessibility */
        .goos-bubble-menu button:focus-visible,
        .goos-floating-menu button:focus-visible {
          outline: 2px solid ${goOSTokens.colors.accent.primary};
          outline-offset: 2px;
        }

        /* Cursor feedback while typing */
        .ProseMirror-focused {
          caret-color: ${goOSTokens.colors.accent.primary};
        }
      `}</style>
    </div>
  );
}

export default GoOSTipTapEditor;
