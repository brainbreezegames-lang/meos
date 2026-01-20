'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, X, Check } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface ContactWidgetConfig {
  fields: ('name' | 'email' | 'message')[];
  emailTo: string;
  successMessage: string;
}

interface ContactWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onSubmit?: (data: { name?: string; email: string; message: string }) => Promise<void>;
}

const DEFAULT_CONFIG: ContactWidgetConfig = {
  fields: ['name', 'email', 'message'],
  emailTo: '',
  successMessage: 'Thanks for reaching out!',
};

export function ContactWidget({ widget, isOwner, onEdit, onPositionChange, onSubmit }: ContactWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const config: ContactWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<ContactWidgetConfig>) };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Fallback to mailto
        const subject = encodeURIComponent(`Contact from ${formData.name || 'Website Visitor'}`);
        const body = encodeURIComponent(`${formData.message}\n\nFrom: ${formData.name || 'Anonymous'}\nEmail: ${formData.email}`);
        window.location.href = `mailto:${config.emailTo}?subject=${subject}&body=${body}`;
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsSuccess(false);
        setFormData({ name: '', email: '', message: '' });
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
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 20px rgba(59, 130, 246, 0.2)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Gradient background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              }}
            />

            {/* Content */}
            <div
              className="relative flex items-center gap-2"
              style={{
                padding: '10px 16px',
              }}
            >
              <Mail
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
                {widget.title || 'Get in Touch'}
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
              width: '260px',
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
                    {config.successMessage}
                  </span>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mail
                        size={14}
                        style={{ color: '#2563eb' }}
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary, #1a1a1a)',
                          fontFamily: 'var(--font-body, system-ui)',
                        }}
                      >
                        {widget.title || 'Get in Touch'}
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

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    {config.fields.includes('name') && (
                      <input
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          marginBottom: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                          background: 'transparent',
                          color: 'var(--text-primary, #1a1a1a)',
                          fontSize: '13px',
                          fontFamily: 'var(--font-body, system-ui)',
                          outline: 'none',
                        }}
                      />
                    )}

                    {config.fields.includes('email') && (
                      <input
                        type="email"
                        placeholder="Your email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          marginBottom: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-medium, rgba(0,0,0,0.1))',
                          background: 'transparent',
                          color: 'var(--text-primary, #1a1a1a)',
                          fontSize: '13px',
                          fontFamily: 'var(--font-body, system-ui)',
                          outline: 'none',
                        }}
                      />
                    )}

                    {config.fields.includes('message') && (
                      <textarea
                        placeholder="Your message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                    )}

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || !formData.email || !formData.message}
                      className="w-full flex items-center justify-center gap-2"
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: (formData.email && formData.message)
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          : 'var(--bg-tertiary, #f0f0f0)',
                        color: (formData.email && formData.message) ? 'white' : 'var(--text-tertiary, #888)',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-body, system-ui)',
                        cursor: (formData.email && formData.message) ? 'pointer' : 'not-allowed',
                        opacity: isLoading ? 0.7 : 1,
                        border: 'none',
                      }}
                      whileHover={(formData.email && formData.message) ? { scale: 1.02 } : {}}
                      whileTap={(formData.email && formData.message) ? { scale: 0.98 } : {}}
                    >
                      <Send size={14} />
                      <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
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

export { DEFAULT_CONFIG as CONTACT_WIDGET_DEFAULT_CONFIG };
