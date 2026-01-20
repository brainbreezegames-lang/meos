'use client';

import React, { useState } from 'react';
import { Mail, Send, X, Check } from 'lucide-react';
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

interface ContactWidgetConfig {
  fields: ('name' | 'email' | 'message')[];
  emailTo: string;
  successMessage: string;
}

interface ContactWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onSubmit?: (data: { name?: string; email: string; message: string }) => Promise<void>;
}

const DEFAULT_CONFIG: ContactWidgetConfig = {
  fields: ['name', 'email', 'message'],
  emailTo: '',
  successMessage: 'Thanks for reaching out!',
};

export function ContactWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onSubmit }: ContactWidgetProps) {
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

  const inputStyle: React.CSSProperties = {
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
          <Mail
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
            {widget.title || 'Get in Touch'}
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
                {config.successMessage}
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
                  <Mail size={16} strokeWidth={2} style={{ color: goOS.colors.text.primary }} />
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
                    {widget.title || 'Contact'}
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

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: '14px' }}>
                {config.fields.includes('name') && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                  />
                )}

                {config.fields.includes('email') && (
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                )}

                {config.fields.includes('message') && (
                  <textarea
                    placeholder="Your message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'none', marginBottom: '12px' }}
                  />
                )}

                <button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.message}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: `2px solid ${goOS.colors.border}`,
                    background: formData.email && formData.message ? goOS.colors.border : goOS.colors.paper,
                    color: formData.email && formData.message ? goOS.colors.paper : goOS.colors.text.muted,
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: goOS.fonts.heading,
                    cursor: formData.email && formData.message ? 'pointer' : 'not-allowed',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={14} strokeWidth={2.5} />
                  <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CONTACT_WIDGET_DEFAULT_CONFIG };
