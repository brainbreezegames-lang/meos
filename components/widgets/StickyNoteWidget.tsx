'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface StickyNoteWidgetConfig {
  content: string;
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'cream';
  rotation: number;
}

interface StickyNoteWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  onContentChange?: (content: string) => void;
}

const DEFAULT_CONFIG: StickyNoteWidgetConfig = {
  content: 'Write something beautiful...',
  color: 'cream',
  rotation: -2,
};

// Cozy, warm color palettes for sticky notes
const STICKY_COLORS = {
  yellow: {
    bg: 'linear-gradient(145deg, #fff9e6 0%, #fff3cc 50%, #ffecb3 100%)',
    shadow: 'rgba(200, 160, 80, 0.15)',
    border: 'rgba(200, 160, 80, 0.2)',
    text: '#5c4a28',
    placeholder: '#9c8a68',
    tape: 'rgba(200, 180, 140, 0.6)',
  },
  blue: {
    bg: 'linear-gradient(145deg, #e8f4fc 0%, #d4ebf7 50%, #c1e1f2 100%)',
    shadow: 'rgba(100, 140, 180, 0.15)',
    border: 'rgba(100, 140, 180, 0.2)',
    text: '#2c4a5c',
    placeholder: '#6888a0',
    tape: 'rgba(140, 180, 200, 0.6)',
  },
  pink: {
    bg: 'linear-gradient(145deg, #fce8ec 0%, #f7d4dc 50%, #f2c1cc 100%)',
    shadow: 'rgba(180, 100, 120, 0.15)',
    border: 'rgba(180, 100, 120, 0.2)',
    text: '#5c2c3a',
    placeholder: '#a06878',
    tape: 'rgba(200, 140, 160, 0.6)',
  },
  green: {
    bg: 'linear-gradient(145deg, #e8f5e9 0%, #d4ebd6 50%, #c1e1c4 100%)',
    shadow: 'rgba(100, 160, 100, 0.15)',
    border: 'rgba(100, 160, 100, 0.2)',
    text: '#2c4a2c',
    placeholder: '#688868',
    tape: 'rgba(140, 180, 140, 0.6)',
  },
  orange: {
    bg: 'linear-gradient(145deg, #fff4e6 0%, #ffe8cc 50%, #ffddb3 100%)',
    shadow: 'rgba(200, 130, 80, 0.15)',
    border: 'rgba(200, 130, 80, 0.2)',
    text: '#5c3a1e',
    placeholder: '#9c7858',
    tape: 'rgba(200, 160, 120, 0.6)',
  },
  cream: {
    bg: 'linear-gradient(145deg, #fdfcf8 0%, #f8f6f0 50%, #f3f0e8 100%)',
    shadow: 'rgba(160, 140, 100, 0.12)',
    border: 'rgba(160, 140, 100, 0.15)',
    text: '#4a4035',
    placeholder: '#8a7a68',
    tape: 'rgba(180, 165, 140, 0.5)',
  },
};

export function StickyNoteWidget({
  widget,
  isOwner = false,
  onEdit,
  onDelete,
  onPositionChange,
  onContextMenu,
  isHighlighted = false,
  onContentChange,
}: StickyNoteWidgetProps) {
  const config = { ...DEFAULT_CONFIG, ...(widget.config as Partial<StickyNoteWidgetConfig>) };
  const colors = STICKY_COLORS[config.color] || STICKY_COLORS.cream;

  const [content, setContent] = useState(config.content);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync content with config
  useEffect(() => {
    setContent(config.content);
  }, [config.content]);

  // Auto-save on content change (debounced)
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      onContentChange?.(newContent);
    }, 500);
  }, [onContentChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
      onContextMenu={onContextMenu}
      isHighlighted={isHighlighted}
    >
      <div
        style={{
          position: 'relative',
          width: 220,
          minHeight: 180,
          padding: '28px 20px 20px',
          background: colors.bg,
          borderRadius: 3,
          transform: `rotate(${config.rotation}deg)`,
          boxShadow: `
            0 4px 12px ${colors.shadow},
            0 8px 24px ${colors.shadow},
            0 1px 2px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `,
          border: `1px solid ${colors.border}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Tape effect at top */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%) rotate(1deg)',
            width: 60,
            height: 20,
            background: colors.tape,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        />

        {/* Paper texture overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 3,
            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            opacity: 0.03,
            pointerEvents: 'none',
            mixBlendMode: 'multiply',
          }}
        />

        {/* Handwritten text area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Write something..."
          readOnly={!isOwner}
          style={{
            width: '100%',
            minHeight: 120,
            padding: 0,
            margin: 0,
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            // Clean design system typography
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
            color: colors.text,
            caretColor: colors.text,
            cursor: isOwner ? 'text' : 'default',
            // Subtle text shadow for depth
            textShadow: isFocused ? 'none' : '0 0.5px 0 rgba(255, 255, 255, 0.5)',
          }}
        />

        {/* Decorative corner fold */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            background: `linear-gradient(135deg, transparent 50%, ${colors.border} 50%)`,
            borderRadius: '0 0 3px 0',
            opacity: 0.5,
          }}
        />

        {/* Subtle lines for notebook feel */}
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            right: 20,
            bottom: 30,
            background: `repeating-linear-gradient(
              to bottom,
              transparent,
              transparent 28px,
              ${colors.border} 28px,
              ${colors.border} 29px
            )`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      </div>
    </WidgetWrapper>
  );
}

export default StickyNoteWidget;
