'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, X, Check, ChevronDown } from 'lucide-react';
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
  prompt: 'How can I improve?',
  anonymous: true,
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
        // Collapsed state - friendly pill button
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'var(--color-bg-base, #fbf9ef)',
            border: '2px solid var(--color-text-primary, #171412)',
            borderRadius: 'var(--radius-full, 9999px)',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <MessageSquare
            size={16}
            strokeWidth={2}
            style={{ color: 'var(--color-accent-primary, #ff7722)' }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-text-primary, #171412)',
              whiteSpace: 'nowrap',
            }}
          >
            {widget.title || 'Feedback'}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            style={{ color: 'var(--color-text-muted, #8e827c)' }}
          />
        </button>
      ) : (
        // Expanded state - feedback form
        <div
          style={{
            background: 'var(--color-bg-base, #fbf9ef)',
            border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
            borderRadius: 'var(--radius-lg, 12px)',
            boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(23, 20, 18, 0.12))',
            width: '280px',
            overflow: 'hidden',
          }}
        >
          {isSuccess ? (
            // Success state
            <div
              style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full, 9999px)',
                  background: 'var(--color-success, #22c55e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={24} color="white" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #171412)',
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
                  borderBottom: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare
                    size={16}
                    strokeWidth={2}
                    style={{ color: 'var(--color-accent-primary, #ff7722)' }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary, #171412)',
                    }}
                  >
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
                    color: 'var(--color-text-muted, #8e827c)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    fontSize: 13,
                    color: 'var(--color-text-primary, #171412)',
                    marginBottom: 12,
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
                    marginBottom: 10,
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--color-border-default, rgba(23, 20, 18, 0.08))',
                    background: 'var(--color-bg-white, #ffffff)',
                    color: 'var(--color-text-primary, #171412)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent-primary, #ff7722)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-default, rgba(23, 20, 18, 0.08))';
                  }}
                />

                {/* Anonymous notice */}
                {config.anonymous && (
                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-muted, #8e827c)',
                      marginBottom: 14,
                      textAlign: 'center',
                    }}
                  >
                    Your feedback is anonymous
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: 'none',
                    background: isValid
                      ? 'var(--color-accent-primary, #ff7722)'
                      : 'var(--color-bg-subtle, #f2f0e7)',
                    color: isValid
                      ? 'var(--color-text-on-accent, #ffffff)'
                      : 'var(--color-text-muted, #8e827c)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isValid ? 'pointer' : 'not-allowed',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={14} strokeWidth={2} />
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
