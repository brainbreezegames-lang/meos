'use client';

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { GoOSEditorToolbar } from './GoOSEditorToolbar';

const lowlight = createLowlight(common);

// goOS Design Tokens (shared)
export const goOSTokens = {
  colors: {
    paper: '#FAF8F0',
    cream: '#FFFDF5',
    headerBg: '#F0EDE0',
    windowBg: '#F5F3E8',
    border: '#2a2a2a',
    text: {
      primary: '#1a1a1a',
      secondary: '#3a3a3a',
      muted: '#666666',
    },
    accent: {
      orange: '#E85D04',
      orangeDark: '#D64C00',
      orangeLight: '#FFB347',
      orangePale: '#FFE4C4',
    },
  },
  shadows: {
    solid: '6px 6px 0 rgba(0,0,0,0.1)',
    hover: '8px 8px 0 rgba(0,0,0,0.12)',
    sm: '3px 3px 0 rgba(0,0,0,0.08)',
    button: '4px 4px 0 rgba(0,0,0,0.1)',
  },
  fonts: {
    display: "'Averia Serif Libre', Georgia, serif",
    body: "'Instrument Sans', system-ui, sans-serif",
    handwritten: "'Gochi Hand', cursive",
  },
};

interface GoOSTipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
}

export function GoOSTipTapEditor({
  content,
  onChange,
  onSave,
  placeholder = 'Start writing...',
  editable = true,
  autoFocus = false,
}: GoOSTipTapEditorProps) {
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
      Image.configure({
        inline: false,
        allowBase64: true,
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

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
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
      {/* Toolbar */}
      <GoOSEditorToolbar
        editor={editor}
        onAddImage={addImage}
        onSetLink={setLink}
      />

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
      <div className="goos-editor-container">
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
          font-size: 15px;
          line-height: 1.7;
          color: ${goOSTokens.colors.text.primary};
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
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          color: ${goOSTokens.colors.text.primary};
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }

        .goos-editor-content h1:first-child {
          margin-top: 0;
        }

        .goos-editor-content h2 {
          font-family: ${goOSTokens.fonts.display};
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: ${goOSTokens.colors.text.primary};
          margin-top: 1.3em;
          margin-bottom: 0.4em;
        }

        .goos-editor-content h3 {
          font-family: ${goOSTokens.fonts.display};
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
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
          border-left: 3px solid ${goOSTokens.colors.accent.orange};
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: ${goOSTokens.colors.text.secondary};
          background: ${goOSTokens.colors.accent.orangePale}20;
          padding: 12px 16px;
          border-radius: 0 4px 4px 0;
        }

        .goos-editor-content .goos-link {
          color: ${goOSTokens.colors.accent.orange};
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        .goos-editor-content .goos-link:hover {
          color: ${goOSTokens.colors.accent.orangeDark};
        }

        .goos-editor-content mark {
          background: ${goOSTokens.colors.accent.orangePale};
          padding: 0 2px;
          border-radius: 2px;
        }

        .goos-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          border: 2px solid ${goOSTokens.colors.border};
          box-shadow: ${goOSTokens.shadows.sm};
          margin: 1em 0;
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
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.5;
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
          background: ${goOSTokens.colors.accent.orangePale}40;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.9em;
          color: ${goOSTokens.colors.accent.orangeDark};
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
          color: ${goOSTokens.colors.accent.orange};
        }

        .hljs-built_in,
        .hljs-deletion {
          color: #22863a;
        }

        /* Bubble Menu */
        .goos-bubble-menu {
          display: flex;
          gap: 4px;
          padding: 6px 8px;
          background: ${goOSTokens.colors.paper};
          border: 2px solid ${goOSTokens.colors.border};
          border-radius: 4px;
          box-shadow: ${goOSTokens.shadows.button};
        }

        .goos-bubble-menu button {
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          font-family: ${goOSTokens.fonts.body};
          background: transparent;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          color: ${goOSTokens.colors.text.secondary};
          transition: all 0.15s ease;
        }

        .goos-bubble-menu button:hover {
          background: ${goOSTokens.colors.headerBg};
          color: ${goOSTokens.colors.text.primary};
        }

        .goos-bubble-menu button.is-active {
          background: ${goOSTokens.colors.accent.orange};
          color: white;
        }

        /* Floating Menu */
        .goos-floating-menu {
          display: flex;
          gap: 4px;
          padding: 6px 8px;
          background: ${goOSTokens.colors.paper};
          border: 2px solid ${goOSTokens.colors.border};
          border-radius: 4px;
          box-shadow: ${goOSTokens.shadows.button};
        }

        .goos-floating-menu button {
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 500;
          font-family: ${goOSTokens.fonts.body};
          background: ${goOSTokens.colors.headerBg};
          border: 1px solid ${goOSTokens.colors.border}40;
          border-radius: 3px;
          cursor: pointer;
          color: ${goOSTokens.colors.text.secondary};
          transition: all 0.15s ease;
        }

        .goos-floating-menu button:hover {
          background: ${goOSTokens.colors.accent.orangePale};
          border-color: ${goOSTokens.colors.accent.orange};
          color: ${goOSTokens.colors.accent.orangeDark};
        }
      `}</style>
    </div>
  );
}

export default GoOSTipTapEditor;
