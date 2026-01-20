'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, X, Check } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

// goOS Design Tokens - Mediterranean Blue
const goOS = {
  colors: {
    paper: '#FFFFFF',
    border: '#2B4AE2',
    text: {
      primary: '#2B4AE2',
      secondary: '#2B4AE2',
      muted: '#6B7FE8',
    },
    success: '#22C55E',
  },
  shadows: {
    solid: '4px 4px 0 #2B4AE2',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", monospace',
  },
};

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
  onSubmit?: (feedback: string) => Promise<void>;
}

const DEFAULT_CONFIG: FeedbackWidgetConfig = {
  prompt: 'How can I improve?',
  anonymous: true,
};

export function FeedbackWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onSubmit }: FeedbackWidgetProps) {
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

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
    >
      {!isExpanded ? (
        <button
          onDoubleClick={() => setIsExpanded(true)}
          style={{
            background: goOS.colors.paper,
            border: `2px solid ${goOS.colors.border}`,
            borderRadius: '8px',
            boxShadow: goOS.shadows.solid,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 6px 0 #2B4AE2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = goOS.shadows.solid;
          }}
        >
          <MessageSquare
            size={18}
            strokeWidth={2}
            style={{ color: goOS.colors.text.primary }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: goOS.colors.text.primary,
              fontFamily: goOS.fonts.heading,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {widget.title || 'Feedback'}
          </span>
        </button>
      ) : (
        <div
          style={{
            background: goOS.colors.paper,
            border: `2px solid ${goOS.colors.border}`,
            borderRadius: '8px',
            boxShadow: goOS.shadows.solid,
            width: '260px',
            overflow: 'hidden',
          }}
        >
          {isSuccess ? (
            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: goOS.colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={20} color="white" strokeWidth={3} />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: goOS.colors.text.primary,
                  fontFamily: goOS.fonts.heading,
                  textAlign: 'center',
                }}
              >
                Thanks for your feedback!
              </span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: `2px solid ${goOS.colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} strokeWidth={2} style={{ color: goOS.colors.text.primary }} />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: goOS.colors.text.primary,
                      fontFamily: goOS.fonts.heading,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Feedback
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  style={{
                    padding: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: goOS.colors.text.primary,
                  }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} style={{ padding: '14px' }}>
                {/* Prompt */}
                <p
                  style={{
                    fontSize: '13px',
                    color: goOS.colors.text.primary,
                    fontFamily: goOS.fonts.heading,
                    marginBottom: '12px',
                    lineHeight: 1.5,
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
                    marginBottom: '8px',
                    borderRadius: '6px',
                    border: `2px solid ${goOS.colors.border}`,
                    background: goOS.colors.paper,
                    color: goOS.colors.text.primary,
                    fontSize: '13px',
                    fontFamily: goOS.fonts.heading,
                    outline: 'none',
                    resize: 'none',
                  }}
                />

                {/* Anonymous notice */}
                {config.anonymous && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: goOS.colors.text.muted,
                      fontFamily: goOS.fonts.heading,
                      marginBottom: '12px',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Your feedback is anonymous
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !feedback.trim()}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: `2px solid ${goOS.colors.border}`,
                    background: feedback.trim() ? goOS.colors.border : goOS.colors.paper,
                    color: feedback.trim() ? goOS.colors.paper : goOS.colors.text.muted,
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: goOS.fonts.heading,
                    cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={14} strokeWidth={2.5} />
                  <span>{isLoading ? 'Sending...' : 'Send Feedback'}</span>
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
