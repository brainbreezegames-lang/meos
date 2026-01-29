'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem } from '@/types';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { TrafficLights } from './TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION, getWindowStyle } from './windowStyles';

interface MailWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

export function MailWindow({ window: windowInstance, item }: MailWindowProps) {
  const windowContext = useWindowContext();
  const windowRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  // Extract email from blocks if available
  const getContactEmail = () => {
    const buttonsBlock = item.blocks?.find(b => b.type === 'buttons');
    if (buttonsBlock?.data) {
      const data = buttonsBlock.data as { buttons?: Array<{ url?: string }> };
      const url = data.buttons?.[0]?.url;
      if (url?.startsWith('mailto:')) {
        return url.replace('mailto:', '');
      }
    }
    return 'hello@example.com';
  };
  const contactEmail = getContactEmail();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        windowContext.closeWindow(windowInstance.id);
      }
    },
    [windowContext, windowInstance.id, isActive]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handleSend = async () => {
    if (!formData.message.trim()) return;

    setIsSending(true);

    // Simulate sending (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Open mailto link as fallback
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(formData.message)}`;
    window.open(mailtoLink);

    setIsSending(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setFormData({ to: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <>
      {/* Window container - handles centering */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        style={{
          padding: isMaximized ? '40px' : '60px',
          paddingTop: isMaximized ? '50px' : '60px',
        }}
      >
        {/* Mail Window */}
        <motion.div
          ref={windowRef}
          className="overflow-hidden flex flex-col pointer-events-auto relative"
          onClick={handleWindowClick}
          drag={!isMaximized}
          dragConstraints={{ top: -200, left: -300, right: 300, bottom: 200 }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{
            zIndex: windowInstance.zIndex + 200,
            width: isMaximized ? '100%' : Math.max(item.windowWidth || 520, 420),
            maxWidth: isMaximized ? '100%' : '90vw',
            height: isMaximized ? '100%' : 'auto',
            maxHeight: isMaximized ? '100%' : 'calc(100vh - 180px)',
            ...getWindowStyle(isMaximized, isActive),
          }}
          initial={ANIMATION.initial}
          animate={ANIMATION.animate}
          exit={ANIMATION.exit}
          transition={ANIMATION.transition}
        >
          {/* Mail Header */}
          <div
            className="flex items-center justify-between px-4 shrink-0 select-none"
            style={{
              height: TITLE_BAR.height,
              borderBottom: TITLE_BAR.borderBottom,
              background: TITLE_BAR.background,
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights */}
            <TrafficLights
              onClose={() => windowContext.closeWindow(windowInstance.id)}
              onMinimize={() => windowContext.minimizeWindow(windowInstance.id)}
              onMaximize={() => windowContext.maximizeWindow(windowInstance.id)}
              isMaximized={isMaximized}
            />

            {/* Title */}
            <span
              className="absolute left-1/2 -translate-x-1/2 font-medium"
              style={{
                fontSize: TITLE_BAR.titleFontSize,
                color: TITLE_BAR.titleColor,
                opacity: isActive ? TITLE_BAR.titleOpacityActive : TITLE_BAR.titleOpacityInactive,
                letterSpacing: TITLE_BAR.titleLetterSpacing,
              }}
            >
              New Message
            </span>

            {/* Send Button */}
            <motion.button
              onClick={handleSend}
              disabled={isSending || !formData.message.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{
                fontSize: '12px',
                background: formData.message.trim() ? 'var(--accent-primary)' : 'var(--border-light)',
                color: formData.message.trim() ? 'var(--color-text-on-accent, #fbf9ef)' : 'var(--text-tertiary)',
                boxShadow: formData.message.trim() ? 'var(--shadow-button)' : 'none',
              }}
              whileHover={formData.message.trim() ? { scale: 1.02 } : {}}
              whileTap={formData.message.trim() ? { scale: 0.98 } : {}}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {isSending ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1.5 2.5l13 5.5-13 5.5v-4.5l8-1-8-1v-4.5z" />
                  </svg>
                  Send
                </>
              )}
            </motion.button>
          </div>

          {/* Compose Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Success Message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  style={{ background: 'var(--bg-glass)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: -20 }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center success-checkmark-circle"
                      style={{
                        background: 'var(--color-success, #22c55e)',
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path className="success-checkmark-stroke" d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p
                      className="font-semibold"
                      style={{
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      Opening mail client...
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recipient Info */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: 'var(--border-width) solid var(--border-light)' }}
            >
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden shrink-0"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <Image
                  src={item.windowHeaderImage || item.thumbnailUrl}
                  alt={item.windowTitle}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate"
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {item.windowTitle}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {contactEmail}
                </p>
              </div>
            </div>

            {/* To Field */}
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{ borderBottom: 'var(--border-width) solid var(--border-light)' }}
            >
              <span
                className="font-medium w-16 shrink-0"
                style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
              >
                To:
              </span>
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-md"
                style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' }}
              >
                <span
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {contactEmail}
                </span>
              </div>
            </div>

            {/* Subject Field */}
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{ borderBottom: 'var(--border-width) solid var(--border-light)' }}
            >
              <span
                className="font-medium w-16 shrink-0"
                style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
              >
                Subject:
              </span>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="What's this about?"
                className="flex-1 bg-transparent outline-none input-glow px-2 py-1 -mx-2 rounded-md transition-all"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  border: '1px solid transparent',
                }}
              />
            </div>

            {/* Message Body */}
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Write your message here..."
                className="w-full h-full resize-none bg-transparent outline-none input-glow p-2 -m-2 rounded-lg transition-all"
                style={{
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 'var(--line-height-normal)',
                  border: '1px solid transparent',
                }}
              />
            </div>

            {/* Footer with tips */}
            <div
              className="flex items-center gap-4 px-4 py-3 shrink-0"
              style={{
                borderTop: 'var(--border-width) solid var(--border-light)',
                background: 'var(--bg-elevated)',
              }}
            >
              <p
                className="flex-1"
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {item.windowSubtitle || "I'd love to hear from you!"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--border-light)]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 9v4a1 1 0 01-1 1H3a1 1 0 01-1-1V9M8 2v8M5 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--border-light)]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="12" height="12" rx="1" />
                    <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
                    <path d="M14 10l-4-4L2 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
