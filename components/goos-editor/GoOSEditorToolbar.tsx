'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { goOSTokens } from './GoOSTipTapEditor';

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
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: '6px 8px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: goOSTokens.fonts.body,
        background: isActive ? goOSTokens.colors.accent.orange : 'transparent',
        color: isActive ? 'white' : goOSTokens.colors.text.secondary,
        border: 'none',
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 28,
        height: 28,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.background = goOSTokens.colors.headerBg;
          e.currentTarget.style.color = goOSTokens.colors.text.primary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = goOSTokens.colors.text.secondary;
        }
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
        height: 20,
        background: goOSTokens.colors.border + '30',
        margin: '0 6px',
      }}
    />
  );
}

interface GoOSEditorToolbarProps {
  editor: Editor;
  onAddImage?: () => void;
  onSetLink?: () => void;
}

export function GoOSEditorToolbar({ editor, onAddImage, onSetLink }: GoOSEditorToolbarProps) {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

  const getActiveHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'P';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 12px',
        borderBottom: `2px solid ${goOSTokens.colors.border}`,
        background: goOSTokens.colors.headerBg,
        flexWrap: 'wrap',
      }}
    >
      {/* Heading Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
          style={{
            padding: '6px 10px',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: goOSTokens.fonts.body,
            background: goOSTokens.colors.paper,
            color: goOSTokens.colors.text.primary,
            border: `1px solid ${goOSTokens.colors.border}40`,
            borderRadius: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minWidth: 60,
          }}
        >
          {getActiveHeading()}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke={goOSTokens.colors.text.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showHeadingDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: goOSTokens.colors.paper,
              border: `2px solid ${goOSTokens.colors.border}`,
              borderRadius: 4,
              boxShadow: goOSTokens.shadows.button,
              zIndex: 100,
              minWidth: 120,
              overflow: 'hidden',
            }}
            onClick={() => setShowHeadingDropdown(false)}
          >
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: goOSTokens.fonts.body,
                background: !editor.isActive('heading') ? goOSTokens.colors.headerBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: goOSTokens.colors.text.primary,
              }}
            >
              Paragraph
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: goOSTokens.fonts.display,
                background: editor.isActive('heading', { level: 1 }) ? goOSTokens.colors.headerBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: goOSTokens.colors.text.primary,
              }}
            >
              Heading 1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: goOSTokens.fonts.display,
                background: editor.isActive('heading', { level: 2 }) ? goOSTokens.colors.headerBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: goOSTokens.colors.text.primary,
              }}
            >
              Heading 2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: goOSTokens.fonts.display,
                background: editor.isActive('heading', { level: 3 }) ? goOSTokens.colors.headerBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: goOSTokens.colors.text.secondary,
              }}
            >
              Heading 3
            </button>
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Cmd+B)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 2.5h4.5c1.38 0 2.5 1.12 2.5 2.5 0 .88-.46 1.65-1.15 2.09.97.44 1.65 1.41 1.65 2.54 0 1.54-1.25 2.87-2.79 2.87H3V2.5zm2 3.75h2.25c.41 0 .75-.34.75-.75s-.34-.75-.75-.75H5v1.5zm2.5 4.25c.55 0 1-.45 1-1s-.45-1-1-1H5v2h2.5z"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Cmd+I)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M5.5 3h5l-.5 1.5H8.5l-2 5H8l-.5 1.5h-5l.5-1.5H4.5l2-5H5l.5-1.5z"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Cmd+U)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 12h8v1H3v-1zm4-1c-2.21 0-4-1.79-4-4V1h1.5v6c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V1H11v6c0 2.21-1.79 4-4 4z"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M7 3c1.1 0 2.08.36 2.83.93l-1.06 1.06C8.34 4.69 7.71 4.5 7 4.5c-1.38 0-2.5 1.12-2.5 2.5h-1.5c0-2.21 1.79-4 4-4zm3 4.5v1.5h-1.5v1.5h-3V9.5H4V8h6v-.5zM5 6.5h4c.28 0 .5.22.5.5s-.22.5-.5.5H5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="9" width="10" height="3" rx="1" fill={goOSTokens.colors.accent.orangePale}/>
          <path d="M4 8V4c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link */}
      <ToolbarButton
        onClick={() => onSetLink?.()}
        isActive={editor.isActive('link')}
        title="Add link"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 8l2-2m-3 1l-1.5 1.5a2.12 2.12 0 003 3L8 10m2-4l1.5-1.5a2.12 2.12 0 00-3-3L7 3" strokeLinecap="round"/>
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="2.5" cy="3" r="1.5"/>
          <circle cx="2.5" cy="7" r="1.5"/>
          <circle cx="2.5" cy="11" r="1.5"/>
          <rect x="5.5" y="2" width="7" height="2" rx="0.5"/>
          <rect x="5.5" y="6" width="7" height="2" rx="0.5"/>
          <rect x="5.5" y="10" width="7" height="2" rx="0.5"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered list"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <text x="1" y="4" fontSize="4" fontWeight="600">1</text>
          <text x="1" y="8" fontSize="4" fontWeight="600">2</text>
          <text x="1" y="12" fontSize="4" fontWeight="600">3</text>
          <rect x="5.5" y="2" width="7" height="2" rx="0.5"/>
          <rect x="5.5" y="6" width="7" height="2" rx="0.5"/>
          <rect x="5.5" y="10" width="7" height="2" rx="0.5"/>
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 4v3c0 .55.45 1 1 1h2v1c0 1.1-.9 2-2 2H3v1h1c1.66 0 3-1.34 3-3V4H3zm6 0v3c0 .55.45 1 1 1h2v1c0 1.1-.9 2-2 2H9v1h1c1.66 0 3-1.34 3-3V4H9z"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code block"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4.5 4L1.5 7l3 3m5-6l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onAddImage?.()}
        title="Add image"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1.5" y="2.5" width="11" height="9" rx="1"/>
          <circle cx="4.5" cy="5.5" r="1"/>
          <path d="M1.5 9.5l3-3 2 2 3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1" y="6" width="12" height="2" rx="1"/>
        </svg>
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align left"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1" y="2" width="12" height="1.5" rx="0.5"/>
          <rect x="1" y="5" width="8" height="1.5" rx="0.5"/>
          <rect x="1" y="8" width="10" height="1.5" rx="0.5"/>
          <rect x="1" y="11" width="6" height="1.5" rx="0.5"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align center"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1" y="2" width="12" height="1.5" rx="0.5"/>
          <rect x="3" y="5" width="8" height="1.5" rx="0.5"/>
          <rect x="2" y="8" width="10" height="1.5" rx="0.5"/>
          <rect x="4" y="11" width="6" height="1.5" rx="0.5"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align right"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1" y="2" width="12" height="1.5" rx="0.5"/>
          <rect x="5" y="5" width="8" height="1.5" rx="0.5"/>
          <rect x="3" y="8" width="10" height="1.5" rx="0.5"/>
          <rect x="7" y="11" width="6" height="1.5" rx="0.5"/>
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
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5.5h5.5a3 3 0 010 6H6" strokeLinecap="round"/>
          <path d="M5.5 3L3 5.5 5.5 8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Cmd+Shift+Z)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 5.5H5.5a3 3 0 000 6H8" strokeLinecap="round"/>
          <path d="M8.5 3L11 5.5 8.5 8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToolbarButton>
    </div>
  );
}

export default GoOSEditorToolbar;
