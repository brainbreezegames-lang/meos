'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className="toolbar-btn"
      data-active={isActive || undefined}
      style={{
        padding: '4px 8px',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        background: isActive ? 'var(--color-text-primary)' : 'transparent',
        color: isActive ? 'var(--color-bg-base)' : 'var(--color-text-secondary)',
        border: 'none',
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transition: 'all 0.1s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 28,
        height: 28,
      }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 16,
        background: 'var(--color-border-subtle)',
        margin: '0 8px',
      }}
    />
  );
}

interface GoOSEditorToolbarProps {
  editor: Editor;
  onAddImage?: () => void;
  onAddImageFromUrl?: () => void;
  onAddVideo?: () => void;
  onSetLink?: () => void;
}

export function GoOSEditorToolbar({ editor, onAddImage, onAddImageFromUrl, onAddVideo, onSetLink }: GoOSEditorToolbarProps) {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

  const getActiveHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'Text';
  };

  return (
    <>
      <div
        role="toolbar"
        aria-label="Text formatting"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'transparent',
          flexWrap: 'wrap',
        }}
      >
        {/* Heading Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
            aria-label="Text style"
            aria-haspopup="listbox"
            aria-expanded={showHeadingDropdown}
            style={{
              padding: '4px 10px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 28,
            }}
          >
            {getActiveHeading()}
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
              <path d="M1 1l3 3 3-3" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showHeadingDropdown && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowHeadingDropdown(false)}
              />
              <div
                role="listbox"
                aria-label="Text styles"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  minWidth: 140,
                  overflow: 'hidden',
                  padding: 4,
                }}
              >
                {[
                  { label: 'Text', action: () => editor.chain().focus().setParagraph().run(), active: !editor.isActive('heading'), style: {} },
                  { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), style: { fontSize: 16, fontWeight: 600 } },
                  { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), style: { fontSize: 14, fontWeight: 600 } },
                  { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), style: { fontSize: 13, fontWeight: 500 } },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role="option"
                    aria-selected={item.active}
                    onClick={() => { item.action(); setShowHeadingDropdown(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-body)',
                      background: item.active ? 'var(--color-bg-subtle)' : 'transparent',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--color-text-primary)',
                      ...item.style,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <ToolbarDivider />

        {/* Text Formatting - using text labels for clarity */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Cmd+B)"
        >
          <span style={{ fontWeight: 700 }}>B</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Cmd+I)"
        >
          <span style={{ fontStyle: 'italic', fontWeight: 500 }}>I</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Cmd+U)"
        >
          <span style={{ textDecoration: 'underline', fontWeight: 500 }}>U</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <span style={{ textDecoration: 'line-through', fontWeight: 500 }}>S</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={() => onSetLink?.()}
          isActive={editor.isActive('link')}
          title="Add link (Cmd+K)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6.5 9.5l3-3M5.5 8L4 9.5a2.12 2.12 0 003 3L8.5 11m2.5-3l1.5-1.5a2.12 2.12 0 00-3-3L8 5" strokeLinecap="round"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="10" width="12" height="4" rx="1" fill="#fef08a"/>
            <path d="M4 10V5a1 1 0 011-1h6a1 1 0 011 1v5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="4" r="1.5"/>
            <circle cx="3" cy="8" r="1.5"/>
            <circle cx="3" cy="12" r="1.5"/>
            <rect x="6" y="3" width="8" height="2" rx="1"/>
            <rect x="6" y="7" width="8" height="2" rx="1"/>
            <rect x="6" y="11" width="8" height="2" rx="1"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <text x="1.5" y="5.5" fontSize="5" fontWeight="600" fontFamily="var(--font-body)">1</text>
            <text x="1.5" y="9.5" fontSize="5" fontWeight="600" fontFamily="var(--font-body)">2</text>
            <text x="1.5" y="13.5" fontSize="5" fontWeight="600" fontFamily="var(--font-body)">3</text>
            <rect x="6" y="3" width="8" height="2" rx="1"/>
            <rect x="6" y="7" width="8" height="2" rx="1"/>
            <rect x="6" y="11" width="8" height="2" rx="1"/>
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block Elements */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
            <path d="M4 5v2.5c0 .28.22.5.5.5H6v1c0 .83-.67 1.5-1.5 1.5H4v1h.5C6.43 11.5 8 9.93 8 8V5H4zm6 0v2.5c0 .28.22.5.5.5H12v1c0 .83-.67 1.5-1.5 1.5H10v1h.5c1.93 0 3.5-1.57 3.5-3.5V5h-4z"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code block"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 4.5L2 8l3 3.5m6-7l3 3.5-3 3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media */}
        <ToolbarButton
          onClick={() => onAddImage?.()}
          title="Add image"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1.5"/>
            <circle cx="5.5" cy="6.5" r="1.25"/>
            <path d="M2 11l3.5-3.5 2 2 3-3L14 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => onAddVideo?.()}
          title="Add video"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6.5 6.5v3l3-1.5-3-1.5z" fill="currentColor"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="7" width="12" height="2" rx="1"/>
          </svg>
        </ToolbarButton>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Cmd+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6h6a3 3 0 110 6H7" strokeLinecap="round"/>
            <path d="M6.5 3.5L4 6l2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Cmd+Shift+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 6H6a3 3 0 100 6h3" strokeLinecap="round"/>
            <path d="M9.5 3.5L12 6l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolbarButton>
      </div>

      {/* Hover styles */}
      <style jsx global>{`
        .toolbar-btn:hover:not([data-active]):not(:disabled) {
          background: var(--color-bg-subtle) !important;
          color: var(--color-text-primary) !important;
        }
      `}</style>
    </>
  );
}

export default GoOSEditorToolbar;
