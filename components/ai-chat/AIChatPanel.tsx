'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Matches the BuildItem type from onboarding
export interface ChatBuildItem {
  id: string;
  type: 'widget' | 'file';
  fileType?: string;
  widgetType?: string;
  title: string;
  content?: string;
  purpose?: string;
  linkUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  createdItem?: { type: string; title: string };
  isThinking?: boolean;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: ChatBuildItem) => void;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  note: '📝', 'case-study': '📄', board: '📋', sheet: '📊',
  cv: '📃', invoice: '🧾', link: '🔗', folder: '📁',
  image: '🖼️', embed: '🎬', download: '📦',
};
const WIDGET_TYPE_ICONS: Record<string, string> = {
  clock: '🕐', pomodoro: '🍅', habits: '✅', contact: '✉️',
  links: '🔗', status: '✦', 'sticky-note': '📝', tipjar: '☕',
  feedback: '💬', book: '📅',
};

export function AIChatPanel({ isOpen, onClose, onItemCreated }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'What would you like me to create? I can make notes, case studies, boards, invoices, widgets, and more.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Add thinking message
    const thinkingId = `thinking-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: thinkingId,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isThinking: true,
    }]);

    try {
      const response = await fetch('/api/ai/chat-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let createdItem: ChatBuildItem | null = null;
      let thinkingText = 'Thinking...';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            const dataLineIdx = lines.indexOf(line) + 1;
            if (dataLineIdx < lines.length && lines[dataLineIdx].startsWith('data: ')) {
              // Skip — we process data lines below
            }
            continue;
          }
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);

              if (data.text) {
                thinkingText = data.text;
                setMessages(prev => prev.map(m =>
                  m.id === thinkingId ? { ...m, content: thinkingText } : m
                ));
              }
              if (data.item) {
                createdItem = data.item as ChatBuildItem;
              }
            } catch { /* skip malformed */ }
          }
        }
      }

      // Remove thinking message, add final response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkingId);
        if (createdItem) {
          const icon = createdItem.type === 'widget'
            ? WIDGET_TYPE_ICONS[createdItem.widgetType || ''] || '✨'
            : FILE_TYPE_ICONS[createdItem.fileType || ''] || '📄';
          return [...filtered, {
            id: `msg-${Date.now()}`,
            role: 'assistant' as const,
            content: `${icon} Created **${createdItem.title}**`,
            timestamp: new Date(),
            createdItem: {
              type: createdItem.type === 'widget' ? (createdItem.widgetType || 'widget') : (createdItem.fileType || 'file'),
              title: createdItem.title,
            },
          }];
        }
        return [...filtered, {
          id: `msg-${Date.now()}`,
          role: 'assistant' as const,
          content: 'Done! Check your desktop.',
          timestamp: new Date(),
        }];
      });

      // Create the item on desktop
      if (createdItem) {
        onItemCreated(createdItem);
      }
    } catch (error) {
      console.error('[AIChatPanel] Error:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkingId);
        return [...filtered, {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onItemCreated]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 84,
            right: 24,
            width: 360,
            maxHeight: '70vh',
            height: 500,
            zIndex: 9001,
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface, rgba(255,255,255,0.95))',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px 12px',
              borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary, #1a1a1a)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>
                AI Assistant
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: 'none', cursor: 'pointer',
                background: 'var(--bg-hover, rgba(0,0,0,0.04))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary, #666)',
              }}
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user'
                      ? 'rgba(255, 107, 0, 0.9)'
                      : msg.isThinking
                        ? 'var(--bg-hover, rgba(0,0,0,0.04))'
                        : 'var(--bg-elevated, rgba(0,0,0,0.04))',
                    color: msg.role === 'user'
                      ? '#fff'
                      : 'var(--text-primary, #1a1a1a)',
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    ...(msg.isThinking ? { fontStyle: 'italic', opacity: 0.7 } : {}),
                  }}
                >
                  {msg.content.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                  )}

                  {msg.createdItem && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.06)',
                        fontSize: 11,
                        color: 'var(--text-secondary, #666)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{
                        background: '#ff6b00',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Added
                      </span>
                      <span>{msg.createdItem.title}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px 16px',
              borderTop: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Create a case study, add a timer..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
                  background: 'var(--bg-base, rgba(0,0,0,0.02))',
                  color: 'var(--text-primary, #1a1a1a)',
                  fontSize: 13,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: 'none', cursor: isLoading || !input.trim() ? 'default' : 'pointer',
                  background: input.trim() ? '#ff6b00' : 'var(--bg-hover, rgba(0,0,0,0.06))',
                  color: input.trim() ? '#fff' : 'var(--text-muted, #999)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
