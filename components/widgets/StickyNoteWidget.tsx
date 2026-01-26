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

// Braun-inspired theme colors
const THEMES = {
  light: {
    housing: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.1),
      0 20px 48px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.03)
    `,
    paperBg: 'linear-gradient(180deg, #fffef8 0%, #fdfcf5 100%)',
    paperShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)',
    textColor: '#3a3632',
    placeholderColor: '#a09a90',
    lineColor: 'rgba(200, 180, 160, 0.2)',
    clipColor: '#ff6b00',
    clipShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
    dotColor: '#e0dcd4',
  },
  dark: {
    housing: 'linear-gradient(180deg, #2a2a28 0%, #1e1e1c 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 20px 48px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
    paperBg: 'linear-gradient(180deg, #2e2e2a 0%, #262622 100%)',
    paperShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
    textColor: '#e8e4dc',
    placeholderColor: '#6a6660',
    lineColor: 'rgba(100, 95, 85, 0.3)',
    clipColor: '#ff6b00',
    clipShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    dotColor: '#3a3a38',
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
  const [content, setContent] = useState(config.content);
  const [isFocused, setIsFocused] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect dark mode - dark class is on document.documentElement (html element)
  useEffect(() => {
    setMounted(true);
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Sync content with config
  useEffect(() => {
    setContent(config.content);
  }, [config.content]);

  // Auto-save on content change (debounced)
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

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

  const theme = isDark ? THEMES.dark : THEMES.light;

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
      {/* Outer housing - Braun-style plastic */}
      <div
        style={{
          width: 220,
          minHeight: 200,
          borderRadius: 20,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          padding: 12,
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Corner detail dots */}
        {[
          { top: 10, left: 10 },
          { top: 10, right: 10 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: theme.dotColor,
              transition: 'all 0.3s ease',
            }}
          />
        ))}

        {/* Paper clip - orange accent */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: 24,
            width: 20,
            height: 32,
            borderRadius: '10px 10px 4px 4px',
            background: theme.clipColor,
            boxShadow: theme.clipShadow,
            zIndex: 2,
          }}
        >
          {/* Clip inner cutout */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 16,
              borderRadius: 4,
              background: isDark ? '#1e1e1c' : '#ffffff',
              opacity: 0.3,
            }}
          />
        </div>

        {/* Paper area */}
        <div
          style={{
            background: theme.paperBg,
            borderRadius: 12,
            padding: '24px 16px 16px',
            minHeight: 160,
            position: 'relative',
            boxShadow: theme.paperShadow,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Ruled lines */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 16,
              right: 16,
              bottom: 16,
              background: `repeating-linear-gradient(
                to bottom,
                transparent,
                transparent 26px,
                ${theme.lineColor} 26px,
                ${theme.lineColor} 27px
              )`,
              pointerEvents: 'none',
            }}
          />

          {/* Red margin line */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 36,
              bottom: 16,
              width: 1,
              background: 'rgba(220, 80, 80, 0.25)',
              pointerEvents: 'none',
            }}
          />

          {/* Textarea */}
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
              padding: '0 0 0 24px',
              margin: 0,
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '27px',
              letterSpacing: '-0.01em',
              color: theme.textColor,
              caretColor: theme.clipColor,
              cursor: isOwner ? 'text' : 'default',
              transition: 'color 0.3s ease',
            }}
          />
        </div>

        {/* Bottom detail - speaker grille pattern */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 4,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: theme.dotColor,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}

export default StickyNoteWidget;
