'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Check } from 'lucide-react';
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
  onPositionChange?: (x: number, y: number) => void;
  onSubmit?: (feedback: string) => Promise<void>;
}

const DEFAULT_CONFIG: FeedbackWidgetConfig = {
  prompt: 'How can I improve?',
  anonymous: true,
};

export function FeedbackWidget({ widget, isOwner, onEdit, onPositionChange, onSubmit }: FeedbackWidgetProps) {
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
      onPositionChange={onPositionChange}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            onClick={() => setIsExpanded(true)}
            className="relative"
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 20px rgba(16, 185, 129, 0.2)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Gradient background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            />

            {/* Content */}
            <div
              className="relative flex items-center gap-2"
              style={{
                padding: '10px 16px',
              }}
            >
              <MessageSquare
                size={16}
                style={{ color: 'rgba(255,255,255,0.9)' }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  fontFamily: 'var(--font-body, system-ui)',
                  whiteSpace: 'nowrap',
                }}
              >
                {widget.title || 'Feedback'}
              </span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="relative"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              width: '240px',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Glass background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--bg-glass-elevated, rgba(255,255,255,0.95))',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              }}
            />

            {/* Content */}
            <div className="relative p-3">
              {isSuccess ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div
                    className="flex items-center justify-center mb-2"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                  >
                    <Check size={20} color="white" />
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--text-primary, #1a1a1a)',
                      fontFamily: 'var(--font-body, system-ui)',
                      textAlign: 'center',
                    }}
                  >
                    Thanks for your feedback!
                  </span>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare
                        size={14}
                        style={{ color: '#059669' }}
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary, #1a1a1a)',
                          fontFamily: 'var(--font-body, system-ui)',
                        }}
                      >
                        {widget.title || 'Feedback'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      style={{
                        padding: '4px',
                        borderRadius: '6px',
                        color: 'var(--text-tertiary, #888)',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Prompt */}
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary, #666)',
                      fontFamily: 'var(--font-body, system-ui)',
                      marginBottom: '12px',
                      lineHeight: 1.4,
                    }}
                  >
                    {config.prompt}
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <textarea
                      placeholder="Share your thoughts..."
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        marginBottom: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                        background: 'transparent',
                        color: 'var(--text-primary, #1a1a1a)',
                        fontSize: '13px',
                        fontFamily: 'var(--font-body, system-ui)',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />

                    {/* Anonymous notice */}
                    {config.anonymous && (
                      <p
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-tertiary, #888)',
                          fontFamily: 'var(--font-body, system-ui)',
                          marginBottom: '8px',
                          textAlign: 'center',
                        }}
                      >
                        Your feedback is anonymous
                      </p>
                    )}

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || !feedback.trim()}
                      className="w-full flex items-center justify-center gap-2"
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: feedback.trim()
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'var(--bg-tertiary, #f0f0f0)',
                        color: feedback.trim() ? 'white' : 'var(--text-tertiary, #888)',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-body, system-ui)',
                        cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                        opacity: isLoading ? 0.7 : 1,
                        border: 'none',
                      }}
                      whileHover={feedback.trim() ? { scale: 1.02 } : {}}
                      whileTap={feedback.trim() ? { scale: 0.98 } : {}}
                    >
                      <Send size={14} />
                      <span>{isLoading ? 'Sending...' : 'Send Feedback'}</span>
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as FEEDBACK_WIDGET_DEFAULT_CONFIG };
