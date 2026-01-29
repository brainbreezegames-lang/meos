'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { TrafficLights } from '../desktop/TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from '../desktop/windowStyles';

// CSS variables to inject into the iframe for design system theming
const CSS_VAR_NAMES = [
  '--color-bg-base', '--color-bg-elevated', '--color-bg-subtle', '--color-bg-hover',
  '--color-text-primary', '--color-text-secondary', '--color-text-muted',
  '--color-accent-primary', '--color-accent-secondary',
  '--color-success', '--color-warning', '--color-error',
  '--color-border-default', '--color-border-subtle',
  '--radius-sm', '--radius-md', '--radius-lg',
  '--shadow-sm', '--shadow-md', '--shadow-lg',
  '--font-body',
];

function readCSSVars(): string {
  if (typeof window === 'undefined') return '';
  const computed = getComputedStyle(document.documentElement);
  return CSS_VAR_NAMES
    .map(v => {
      const val = computed.getPropertyValue(v).trim();
      return val ? `${v}: ${val};` : '';
    })
    .filter(Boolean)
    .join('\n      ');
}

function buildSrcdoc(htmlContent: string, cssVars: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      ${cssVars}
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--color-bg-base, #fbf9ef);
      color: var(--color-text-primary, #171412);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.5;
      overflow-x: hidden;
    }
    ::selection {
      background: var(--color-accent-primary, #ff7722);
      color: white;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: var(--color-border-default, rgba(23, 20, 18, 0.12));
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted, rgba(23, 20, 18, 0.3));
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;
}

interface GoOSCustomAppWindowProps {
  file: {
    id: string;
    title: string;
    content: string;
    type: string;
    status?: string;
  };
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUpdate: (updates: { content?: string; title?: string; status?: string }) => void;
  isActive?: boolean;
  zIndex?: number;
  isMaximized?: boolean;
}

export function GoOSCustomAppWindow({
  file,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  isActive = true,
  zIndex = 100,
  isMaximized = false,
}: GoOSCustomAppWindowProps) {
  const dragControls = useDragControls();
  const prefersReducedMotion = useReducedMotion();
  const [title, setTitle] = useState(file.title || 'Untitled App');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [cssVars, setCssVars] = useState('');

  // Read CSS vars on mount and watch for theme changes
  useEffect(() => {
    setCssVars(readCSSVars());

    const observer = new MutationObserver(() => {
      // Small delay to let CSS variables update
      requestAnimationFrame(() => {
        setCssVars(readCSSVars());
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  // Sync title from props
  useEffect(() => {
    setTitle(file.title || 'Untitled App');
  }, [file.title]);

  const srcdoc = useMemo(
    () => buildSrcdoc(file.content || '', cssVars),
    [file.content, cssVars]
  );

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!isMaximized) dragControls.start(event);
    },
    [isMaximized, dragControls]
  );

  const handleTitleSubmit = useCallback(() => {
    setIsEditingTitle(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== file.title) {
      onUpdate({ title: trimmed });
    } else {
      setTitle(file.title || 'Untitled App');
    }
  }, [title, file.title, onUpdate]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleTitleSubmit();
      if (e.key === 'Escape') {
        setTitle(file.title || 'Untitled App');
        setIsEditingTitle(false);
      }
    },
    [handleTitleSubmit, file.title]
  );

  return (
    <motion.div
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={false}
      dragElastic={0}
      dragMomentum={false}
      initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
      animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
      exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
      transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
      style={{
        position: 'fixed',
        top: isMaximized ? 'var(--menubar-height, 40px)' : '5%',
        left: isMaximized ? 0 : '50%',
        x: isMaximized ? 0 : '-50%',
        width: isMaximized ? '100%' : 'min(700px, 95vw)',
        height: isMaximized
          ? 'calc(100vh - var(--menubar-height, 40px) - var(--zen-dock-offset, 80px))'
          : 'min(75vh, 560px)',
        minWidth: 400,
        background: WINDOW.background,
        border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
        borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
        boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
        zIndex,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
      }}
    >
      {/* Title Bar */}
      <div
        onPointerDown={startDrag}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${TITLE_BAR.paddingX}px`,
          height: TITLE_BAR.height,
          background: TITLE_BAR.background,
          borderBottom: TITLE_BAR.borderBottom,
          gap: 12,
          cursor: isMaximized ? 'default' : 'grab',
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          isMaximized={isMaximized}
          variant="macos"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {/* Purple app indicator */}
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              background: 'linear-gradient(145deg, #a78bfa, #7c3aed)',
              flexShrink: 0,
            }}
          />
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                fontWeight: TITLE_BAR.titleFontWeight,
                fontFamily: 'var(--font-body)',
                color: TITLE_BAR.titleColor,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: 0,
                width: '100%',
              }}
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                fontWeight: TITLE_BAR.titleFontWeight,
                fontFamily: 'var(--font-body)',
                color: TITLE_BAR.titleColor,
                opacity: TITLE_BAR.titleOpacityActive,
                cursor: 'text',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title || 'Untitled App'}
            </span>
          )}
        </div>
      </div>

      {/* Iframe Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <iframe
          srcDoc={srcdoc}
          sandbox="allow-scripts"
          title={title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            background: 'var(--color-bg-base)',
          }}
        />
      </div>
    </motion.div>
  );
}

export default GoOSCustomAppWindow;
