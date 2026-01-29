'use client';

import React, { useState, useEffect } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface FeedbackWidgetConfig {
  prompt: string;
  anonymous: boolean;
}

interface FeedbackWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  onSubmit?: (feedback: string) => Promise<void>;
}

const DEFAULT_CONFIG: FeedbackWidgetConfig = {
  prompt: 'What do you think?',
  anonymous: true,
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
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#888888',
    inputBg: '#ffffff',
    inputBorder: 'rgba(0, 0, 0, 0.08)',
    buttonBg: 'linear-gradient(180deg, #ffffff 0%, #f5f5f3 100%)',
    buttonShadow: `
      0 1px 2px rgba(0, 0, 0, 0.05),
      0 2px 4px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(0, 0, 0, 0.04)
    `,
    submitBg: 'linear-gradient(145deg, #333, #222)',
    submitDisabledBg: '#eee',
    iconStroke: '#bbb',
    iconFill: 'url(#bubbleGradLight)',
    headerBorder: 'rgba(0, 0, 0, 0.06)',
    dotBg: '#e8e4e0',
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
    textPrimary: '#f0f0ec',
    textSecondary: '#a0a09c',
    textMuted: '#707068',
    inputBg: '#3a3a38',
    inputBorder: 'rgba(255, 255, 255, 0.08)',
    buttonBg: 'linear-gradient(180deg, #3a3a38 0%, #2e2e2c 100%)',
    buttonShadow: `
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04)
    `,
    submitBg: 'linear-gradient(145deg, #1e52f1, #0e42dd)',
    submitDisabledBg: '#3a3a38',
    iconStroke: '#707068',
    iconFill: 'url(#bubbleGradDark)',
    headerBorder: 'rgba(255, 255, 255, 0.06)',
    dotBg: '#3a3a38',
  },
};

export function FeedbackWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted, onSubmit }: FeedbackWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode - dark class is on document.documentElement (html element)
  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const config: FeedbackWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<FeedbackWidgetConfig>) };
  const theme = isDark ? THEMES.dark : THEMES.light;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(feedback);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsSuccess(false);
        setFeedback('');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = feedback.trim();

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
      {!isExpanded ? (
        /* Small widget: 120x120 - Braun physical style */
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 20,
            background: theme.housing,
            boxShadow: theme.housingShadow,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
          onClick={() => setIsExpanded(true)}
        >
          {/* Corner detail */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: theme.dotBg,
              transition: 'all 0.3s ease',
            }}
          />

          {/* 3D Speech bubble icon */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <defs>
              <linearGradient id="bubbleGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8f7f4"/>
                <stop offset="100%" stopColor="#e8e7e2"/>
              </linearGradient>
              <linearGradient id="bubbleGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4a4a48"/>
                <stop offset="100%" stopColor="#3a3a38"/>
              </linearGradient>
            </defs>
            {/* Bubble body */}
            <path
              d="M4 8C4 5 7 3 10 3H26C29 3 32 5 32 8V20C32 23 29 25 26 25H14L8 31V25H10C7 25 4 23 4 20V8Z"
              fill={theme.iconFill}
            />
            {/* Highlight */}
            <path
              d="M6 8C6 6 8 5 10 5H26C28 5 30 6 30 8V10H6V8Z"
              fill={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}
            />
            {/* Orange accent band - Braun signature */}
            <rect x="6" y="13" width="24" height="3" fill="#ff6b00" opacity="0.9" rx="1" />
            {/* Dots */}
            <circle cx="12" cy="18" r="1.5" fill={theme.iconStroke}/>
            <circle cx="18" cy="18" r="1.5" fill={theme.iconStroke}/>
            <circle cx="24" cy="18" r="1.5" fill={theme.iconStroke}/>
          </svg>

          {/* Text */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: theme.textPrimary,
              textAlign: 'center',
              lineHeight: 1.3,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'color 0.3s ease',
            }}
          >
            {widget.title || 'Leave Feedback'}
          </span>

          <span
            style={{
              fontSize: 10,
              color: theme.textMuted,
              textAlign: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'color 0.3s ease',
            }}
          >
            Tell me what you think
          </span>
        </div>
      ) : (
        /* Expanded form - Braun physical style */
        <div
          style={{
            width: 240,
            borderRadius: 20,
            background: theme.housing,
            boxShadow: theme.housingShadow,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Corner detail */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: theme.dotBg,
              zIndex: 10,
              transition: 'all 0.3s ease',
            }}
          />

          {isSuccess ? (
            <div
              style={{
                padding: '28px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, textAlign: 'center', transition: 'color 0.3s ease' }}>
                Thanks for your feedback!
              </span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: `1px solid ${theme.headerBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary, transition: 'color 0.3s ease' }}>
                    Feedback
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  style={{
                    padding: 4,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textMuted,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: 14 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    marginBottom: 10,
                    lineHeight: 1.4,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {config.prompt}
                </p>

                <textarea
                  placeholder="Share your thoughts..."
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    marginBottom: 8,
                    borderRadius: 10,
                    border: `1px solid ${theme.inputBorder}`,
                    background: theme.inputBg,
                    color: theme.textPrimary,
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                  }}
                />

                {config.anonymous && (
                  <p
                    style={{
                      fontSize: 10,
                      color: theme.textMuted,
                      marginBottom: 10,
                      textAlign: 'center',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Your feedback is anonymous
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: isValid
                      ? theme.submitBg
                      : theme.submitDisabledBg,
                    color: isValid ? '#fff' : theme.textMuted,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isValid ? 'pointer' : 'not-allowed',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span>{isLoading ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as FEEDBACK_WIDGET_DEFAULT_CONFIG };
