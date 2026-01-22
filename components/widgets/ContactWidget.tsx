'use client';

import React, { useState } from 'react';
import { Mail, Send, X, Check, ChevronDown } from 'lucide-react';
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
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  onSubmit?: (data: { name?: string; email: string; message: string }) => Promise<void>;
}

const DEFAULT_CONFIG: ContactWidgetConfig = {
  fields: ['name', 'email', 'message'],
  emailTo: '',
  successMessage: 'Thanks for reaching out!',
};

export function ContactWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted, onSubmit }: ContactWidgetProps) {
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

  const isValid = formData.email && formData.message;

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
            background: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
            backdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
            WebkitBackdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
            border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
            borderRadius: 'var(--radius-xl, 20px)',
            boxShadow: 'var(--shadow-sm)',
            padding: '12px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Mail
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
            {widget.title || 'Get in Touch'}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            style={{ color: 'var(--color-text-muted, #8e827c)' }}
          />
        </button>
      ) : (
        // Expanded state - contact form
        <div
          style={{
            background: 'var(--color-bg-glass-heavy, rgba(251, 249, 239, 0.95))',
            backdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            WebkitBackdropFilter: 'var(--blur-glass-heavy, blur(24px) saturate(180%))',
            border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
            borderRadius: 'var(--radius-lg, 18px)',
            boxShadow: 'var(--shadow-lg)',
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
                {config.successMessage}
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
                  <Mail
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
                    {widget.title || 'Contact'}
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

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: '14px' }}>
                {config.fields.includes('name') && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      marginBottom: 10,
                      borderRadius: 'var(--radius-sm, 10px)',
                      border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
                      background: 'var(--color-bg-white, rgba(255, 255, 255, 0.8))',
                      color: 'var(--color-text-primary, #171412)',
                      fontSize: 13,
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary, #ff7722)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 119, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(23, 20, 18, 0.06)';
                      e.currentTarget.style.boxShadow = 'none';
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
                      padding: '10px 12px',
                      marginBottom: 10,
                      borderRadius: 'var(--radius-sm, 10px)',
                      border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
                      background: 'var(--color-bg-white, rgba(255, 255, 255, 0.8))',
                      color: 'var(--color-text-primary, #171412)',
                      fontSize: 13,
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary, #ff7722)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 119, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(23, 20, 18, 0.06)';
                      e.currentTarget.style.boxShadow = 'none';
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
                      padding: '10px 12px',
                      marginBottom: 14,
                      borderRadius: 'var(--radius-sm, 10px)',
                      border: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
                      background: 'var(--color-bg-white, rgba(255, 255, 255, 0.8))',
                      color: 'var(--color-text-primary, #171412)',
                      fontSize: 13,
                      outline: 'none',
                      resize: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-primary, #ff7722)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 119, 34, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(23, 20, 18, 0.06)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
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
