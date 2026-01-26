'use client';

import React, { useState } from 'react';
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

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
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
        /* Medium widget: 180x180 - collapsed state */
        <div
          style={{
            ...WIDGET_CONTAINER,
            width: 180,
            height: 180,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(true)}
        >
          {/* 3D Envelope icon */}
          <div style={{ marginBottom: 4 }}>
            <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
              {/* Envelope body */}
              <path
                d="M4 8C4 6 6 4 8 4H40C42 4 44 6 44 8V32C44 34 42 36 40 36H8C6 36 4 34 4 32V8Z"
                fill="url(#envelopeGrad)"
              />
              {/* Envelope flap shadow */}
              <path
                d="M4 8L24 22L44 8"
                fill="none"
                stroke="#e0ded8"
                strokeWidth="1"
              />
              {/* Envelope flap */}
              <path
                d="M4 8C4 6 6 4 8 4H40C42 4 44 6 44 8L24 22L4 8Z"
                fill="url(#flapGrad)"
              />
              {/* Highlight on flap */}
              <path
                d="M8 6H40L24 18L8 6Z"
                fill="rgba(255,255,255,0.3)"
              />
              <defs>
                <linearGradient id="envelopeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8f7f4"/>
                  <stop offset="100%" stopColor="#e8e7e2"/>
                </linearGradient>
                <linearGradient id="flapGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#f0efea"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Title */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#333',
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {widget.title || 'Get in Touch'}
          </span>

          {/* Subtitle */}
          <span
            style={{
              fontSize: 11,
              color: '#888',
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {config.emailTo || 'hello@example.com'}
          </span>

          {/* Button */}
          <button
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(145deg, #f8f7f4, #eeeee8)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.8)',
              fontSize: 12,
              fontWeight: 600,
              color: '#555',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            Send Message
          </button>
        </div>
      ) : (
        /* Expanded form */
        <div
          style={{
            ...WIDGET_CONTAINER,
            width: 280,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          {isSuccess ? (
            <div
              style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                {config.successMessage}
              </span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>
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
                    color: '#888',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: 16 }}>
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
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      color: '#333',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
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
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      color: '#333',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
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
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background: isValid
                      ? 'linear-gradient(145deg, #333, #222)'
                      : '#eee',
                    color: isValid ? '#fff' : '#999',
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
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
