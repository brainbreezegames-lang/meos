'use client';

import React, { useState } from 'react';
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

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
};

export function FeedbackWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted, onSubmit }: FeedbackWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const config: FeedbackWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<FeedbackWidgetConfig>) };

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
        /* Small widget: 120x120 */
        <div
          style={{
            ...WIDGET_CONTAINER,
            width: 120,
            height: 120,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(true)}
        >
          {/* 3D Speech bubble icon */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            {/* Bubble body */}
            <path
              d="M4 8C4 5 7 3 10 3H26C29 3 32 5 32 8V20C32 23 29 25 26 25H14L8 31V25H10C7 25 4 23 4 20V8Z"
              fill="url(#bubbleGrad)"
            />
            {/* Highlight */}
            <path
              d="M6 8C6 6 8 5 10 5H26C28 5 30 6 30 8V10H6V8Z"
              fill="rgba(255,255,255,0.4)"
            />
            {/* Dots */}
            <circle cx="12" cy="14" r="2" fill="#bbb"/>
            <circle cx="18" cy="14" r="2" fill="#bbb"/>
            <circle cx="24" cy="14" r="2" fill="#bbb"/>
            <defs>
              <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8f7f4"/>
                <stop offset="100%" stopColor="#e8e7e2"/>
              </linearGradient>
            </defs>
          </svg>

          {/* Text */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#555',
              textAlign: 'center',
              lineHeight: 1.3,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {widget.title || 'Leave Feedback'}
          </span>

          <span
            style={{
              fontSize: 10,
              color: '#888',
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            Tell me what you think
          </span>
        </div>
      ) : (
        /* Expanded form */
        <div
          style={{
            ...WIDGET_CONTAINER,
            width: 240,
            padding: 0,
            overflow: 'hidden',
          }}
        >
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
              <span style={{ fontSize: 13, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                Thanks for your feedback!
              </span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
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
                    color: '#888',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    color: '#555',
                    marginBottom: 10,
                    lineHeight: 1.4,
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
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff',
                    color: '#333',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {config.anonymous && (
                  <p
                    style={{
                      fontSize: 10,
                      color: '#999',
                      marginBottom: 10,
                      textAlign: 'center',
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
                      ? 'linear-gradient(145deg, #333, #222)'
                      : '#eee',
                    color: isValid ? '#fff' : '#999',
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
