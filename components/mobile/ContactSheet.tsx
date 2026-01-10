'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

interface ContactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  phone?: string;
  calendly?: string;
}

export function ContactSheet({
  isOpen,
  onClose,
  email,
  twitter,
  linkedin,
  github,
  website,
  phone,
  calendly,
}: ContactSheetProps) {
  const dragControls = useDragControls();
  const [dragY, setDragY] = useState(0);

  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
    setDragY(0);
  };

  const contactMethods = [
    email && { icon: '✉️', label: 'Email', value: email, href: `mailto:${email}` },
    phone && { icon: '📱', label: 'Phone', value: phone, href: `tel:${phone}` },
    twitter && { icon: '𝕏', label: 'Twitter', value: twitter, href: `https://twitter.com/${twitter.replace('@', '')}` },
    linkedin && { icon: '💼', label: 'LinkedIn', value: linkedin, href: linkedin },
    github && { icon: '🐙', label: 'GitHub', value: github, href: `https://github.com/${github}` },
    website && { icon: '🌐', label: 'Website', value: website, href: website },
    calendly && { icon: '📅', label: 'Schedule', value: 'Book a meeting', href: calendly },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string }[];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[400]"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[401]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDrag={(_, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
            style={{ y: dragY > 0 ? dragY : 0 }}
          >
            <div
              className="rounded-t-[28px] overflow-hidden"
              style={{
                background: 'rgba(40, 40, 45, 0.98)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: 'none',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Drag handle */}
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.3)' }}
                />
              </div>

              {/* Header */}
              <div className="px-6 pb-4">
                <h2
                  className="text-xl font-semibold text-white text-center"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
                >
                  Get in Touch
                </h2>
                <p
                  className="text-sm text-white/50 text-center mt-1"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                >
                  Choose how you&apos;d like to connect
                </p>
              </div>

              {/* Contact methods */}
              <div className="px-4 pb-4 space-y-2">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={index}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    whileTap={{ scale: 0.98, background: 'rgba(255, 255, 255, 0.1)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <span className="text-xl">{method.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-white font-medium"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                      >
                        {method.label}
                      </p>
                      <p
                        className="text-sm text-white/50 truncate"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                      >
                        {method.value}
                      </p>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white/30"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </motion.a>
                ))}
              </div>

              {/* Cancel button */}
              <div className="px-4 pb-4">
                <motion.button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span
                    className="text-blue-400 font-semibold"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                  >
                    Cancel
                  </span>
                </motion.button>
              </div>

              {/* Safe area bottom */}
              <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
