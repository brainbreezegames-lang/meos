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
      if ('vibrate' in navigator) navigator.vibrate(5);
      onClose();
    }
    setDragY(0);
  };

  const contactMethods = [
    email && { icon: '✉️', label: 'Email', value: email, href: `mailto:${email}`, color: 'rgba(234, 88, 12, 0.15)' },
    phone && { icon: '📱', label: 'Phone', value: phone, href: `tel:${phone}`, color: 'rgba(34, 197, 94, 0.15)' },
    twitter && { icon: '𝕏', label: 'Twitter', value: twitter, href: `https://twitter.com/${twitter.replace('@', '')}`, color: 'rgba(96, 165, 250, 0.15)' },
    linkedin && { icon: '💼', label: 'LinkedIn', value: linkedin, href: linkedin, color: 'rgba(59, 130, 246, 0.15)' },
    github && { icon: '🐙', label: 'GitHub', value: github, href: `https://github.com/${github}`, color: 'rgba(168, 85, 247, 0.15)' },
    website && { icon: '🌐', label: 'Website', value: website, href: website, color: 'rgba(14, 165, 233, 0.15)' },
    calendly && { icon: '📅', label: 'Schedule', value: 'Book a meeting', href: calendly, color: 'rgba(236, 72, 153, 0.15)' },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string; color: string }[];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Multi-layer backdrop */}
          <motion.div
            className="fixed inset-0 z-[400]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Blur layer */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            />
            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
              }}
            />
          </motion.div>

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
              mass: 0.8,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDrag={(_, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
            style={{ y: dragY > 0 ? dragY : 0 }}
          >
            <div
              className="rounded-t-[32px] overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(45, 45, 55, 0.98) 0%, rgba(35, 35, 45, 0.96) 100%)',
                backdropFilter: 'blur(50px) saturate(200%)',
                WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                boxShadow: `
                  0 -20px 50px rgba(0, 0, 0, 0.35),
                  inset 0 1px 0 rgba(255, 255, 255, 0.08)
                `,
              }}
            >
              {/* Drag handle */}
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <motion.div
                  className="w-10 h-1 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 0 4px rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                />
              </div>

              {/* Header */}
              <motion.div
                className="px-6 pb-5"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <h2
                  className="text-xl font-bold text-white text-center"
                  style={{
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Get in Touch
                </h2>
                <p
                  className="text-sm text-center mt-1"
                  style={{
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                >
                  Choose how you&apos;d like to connect
                </p>
              </motion.div>

              {/* Contact methods */}
              <div className="px-4 pb-4 space-y-2.5">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={index}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="relative flex items-center gap-4 p-4 rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.08 + index * 0.04,
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(3);
                    }}
                  >
                    {/* Icon container with colored background */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: method.color,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                      }}
                    >
                      <span className="text-xl">{method.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium"
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {method.label}
                      </p>
                      <p
                        className="text-sm truncate"
                        style={{
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        }}
                      >
                        {method.value}
                      </p>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </motion.a>
                ))}
              </div>

              {/* Cancel button */}
              <motion.div
                className="px-4 pb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(3);
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                  whileTap={{ scale: 0.98, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span
                    className="font-semibold"
                    style={{
                      color: '#0A84FF',
                      fontSize: 17,
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    }}
                  >
                    Cancel
                  </span>
                </motion.button>
              </motion.div>

              {/* Safe area bottom */}
              <div style={{ height: 'env(safe-area-inset-bottom, 20px)' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
