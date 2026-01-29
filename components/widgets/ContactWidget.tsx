'use client';

import React, { useState, useEffect } from 'react';
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
    headerBorder: 'rgba(0, 0, 0, 0.06)',
    dotBg: '#e8e4e0',
    envelopeBody: 'url(#envelopeGradLight)',
    envelopeFlap: 'url(#flapGradLight)',
    envelopeShadow: '#e0ded8',
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
    headerBorder: 'rgba(255, 255, 255, 0.06)',
    dotBg: '#3a3a38',
    envelopeBody: 'url(#envelopeGradDark)',
    envelopeFlap: 'url(#flapGradDark)',
    envelopeShadow: '#2a2a28',
  },
};

export function ContactWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted, onSubmit }: ContactWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
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

  const config: ContactWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<ContactWidgetConfig>) };
  const theme = isDark ? THEMES.dark : THEMES.light;

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
        /* Medium widget: 180x180 - Braun physical style */
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 20,
            background: theme.housing,
            boxShadow: theme.housingShadow,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
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

          {/* 3D Envelope icon */}
          <div style={{ marginBottom: 4 }}>
            <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
              <defs>
                <linearGradient id="envelopeGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8f7f4"/>
                  <stop offset="100%" stopColor="#e8e7e2"/>
                </linearGradient>
                <linearGradient id="flapGradLight" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#f0efea"/>
                </linearGradient>
                <linearGradient id="envelopeGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a4a48"/>
                  <stop offset="100%" stopColor="#3a3a38"/>
                </linearGradient>
                <linearGradient id="flapGradDark" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#5a5a58"/>
                  <stop offset="100%" stopColor="#4a4a48"/>
                </linearGradient>
              </defs>
              {/* Envelope body */}
              <path
                d="M4 8C4 6 6 4 8 4H40C42 4 44 6 44 8V32C44 34 42 36 40 36H8C6 36 4 34 4 32V8Z"
                fill={theme.envelopeBody}
              />
              {/* Orange accent band - Braun signature */}
              <rect x="4" y="20" width="40" height="4" fill="#ff6b00" opacity="0.9" />
              {/* Envelope flap shadow */}
              <path
                d="M4 8L24 22L44 8"
                fill="none"
                stroke={theme.envelopeShadow}
                strokeWidth="1"
              />
              {/* Envelope flap */}
              <path
                d="M4 8C4 6 6 4 8 4H40C42 4 44 6 44 8L24 22L4 8Z"
                fill={theme.envelopeFlap}
              />
              {/* Highlight on flap */}
              <path
                d="M8 6H40L24 18L8 6Z"
                fill={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}
              />
            </svg>
          </div>

          {/* Title */}
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: theme.textPrimary,
              textAlign: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'color 0.3s ease',
            }}
          >
            {widget.title || 'Get in Touch'}
          </span>

          {/* Subtitle */}
          <span
            style={{
              fontSize: 11,
              color: theme.textMuted,
              textAlign: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'color 0.3s ease',
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
              background: theme.buttonBg,
              boxShadow: theme.buttonShadow,
              fontSize: 12,
              fontWeight: 600,
              color: theme.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Send Message
          </button>
        </div>
      ) : (
        /* Expanded form - Braun physical style */
        <div
          style={{
            width: 280,
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
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, textAlign: 'center', transition: 'color 0.3s ease' }}>
                {config.successMessage}
              </span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: `1px solid ${theme.headerBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, transition: 'color 0.3s ease' }}>
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
                    color: theme.textMuted,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease',
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
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBg,
                      color: theme.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease',
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
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBg,
                      color: theme.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease',
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
                      ? theme.submitBg
                      : theme.submitDisabledBg,
                    color: isValid ? '#fff' : theme.textMuted,
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
