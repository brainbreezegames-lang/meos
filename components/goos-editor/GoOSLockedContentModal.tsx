'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Lock, Mail, X, FileText, Folder, BarChart3 } from 'lucide-react';
import { SPRING, windowOpen, fade, REDUCED_MOTION, buttonPress } from '@/lib/animations';
import { goOSTokens } from './GoOSTipTapEditor';

interface GoOSLockedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    type: 'note' | 'case-study' | 'folder';
    title: string;
  };
  unlockType: 'email' | 'purchase';
  price?: number;
  onUnlockWithEmail?: (email: string) => Promise<boolean>;
  onPurchase?: () => void;
}

export function GoOSLockedContentModal({
  isOpen,
  onClose,
  file,
  unlockType,
  price,
  onUnlockWithEmail,
  onPurchase,
}: GoOSLockedContentModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !onUnlockWithEmail) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onUnlockWithEmail(email);
      if (result) {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        setError('Failed to unlock. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = () => {
    switch (file.type) {
      case 'folder':
        return <Folder size={48} stroke={goOSTokens.colors.text.primary} strokeWidth={1.5} />;
      case 'case-study':
        return <BarChart3 size={48} stroke={goOSTokens.colors.text.primary} strokeWidth={1.5} />;
      default:
        return <FileText size={48} stroke={goOSTokens.colors.text.primary} strokeWidth={1.5} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 9998,
            }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={windowOpen}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.smooth}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 448,
                borderRadius: goOSTokens.radii.lg,
                overflow: 'hidden',
                background: goOSTokens.colors.cream,
                border: `2px solid ${goOSTokens.colors.borderStrong}`,
                boxShadow: goOSTokens.shadows.lg,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: goOSTokens.colors.headerBg,
                  borderBottom: `2px solid ${goOSTokens.colors.borderStrong}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={16} stroke={goOSTokens.colors.accent.primary} />
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      color: goOSTokens.colors.text.primary,
                      fontFamily: goOSTokens.fonts.body,
                    }}
                  >
                    Locked Content
                  </span>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    padding: 4,
                    borderRadius: goOSTokens.radii.sm,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} stroke={goOSTokens.colors.text.muted} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: 24 }}>
                {/* File preview */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: goOSTokens.radii.lg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      background: goOSTokens.colors.paper,
                      border: `2px solid ${goOSTokens.colors.borderStrong}`,
                      boxShadow: goOSTokens.shadows.sm,
                    }}
                  >
                    {getFileIcon()}
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      textAlign: 'center',
                      color: goOSTokens.colors.text.primary,
                      fontFamily: goOSTokens.fonts.display,
                      margin: 0,
                    }}
                  >
                    {file.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      marginTop: 4,
                      textAlign: 'center',
                      color: goOSTokens.colors.text.muted,
                      fontFamily: goOSTokens.fonts.body,
                    }}
                  >
                    This content requires {unlockType === 'email' ? 'your email' : 'a purchase'} to access
                  </p>
                </div>

                {/* Unlock form */}
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      textAlign: 'center',
                      padding: '16px 0',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                    <p
                      style={{
                        fontWeight: 500,
                        color: goOSTokens.colors.accent.primary,
                        fontFamily: goOSTokens.fonts.body,
                      }}
                    >
                      Unlocked! Opening now...
                    </p>
                  </motion.div>
                ) : unlockType === 'email' ? (
                  <form onSubmit={handleEmailSubmit}>
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: goOSTokens.radii.lg,
                          background: goOSTokens.colors.paper,
                          border: `2px solid ${error ? goOSTokens.colors.status.error : goOSTokens.colors.borderStrong}`,
                        }}
                      >
                        <Mail size={18} stroke={goOSTokens.colors.text.muted} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          style={{
                            flex: 1,
                            background: 'transparent',
                            outline: 'none',
                            border: 'none',
                            fontSize: 14,
                            color: goOSTokens.colors.text.primary,
                            fontFamily: goOSTokens.fonts.body,
                          }}
                          required
                        />
                      </div>
                      {error && (
                        <p
                          style={{
                            fontSize: 12,
                            marginTop: 4,
                            color: goOSTokens.colors.status.error,
                            fontFamily: goOSTokens.fonts.body,
                          }}
                        >
                          {error}
                        </p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      whileHover={buttonPress.hover}
                      whileTap={buttonPress.tap}
                      style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: goOSTokens.radii.lg,
                        fontWeight: 500,
                        fontSize: 14,
                        background: goOSTokens.colors.accent.primary,
                        color: 'white',
                        border: `2px solid ${goOSTokens.colors.borderStrong}`,
                        boxShadow: goOSTokens.shadows.sm,
                        cursor: isSubmitting || !email.trim() ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting || !email.trim() ? 0.5 : 1,
                        fontFamily: goOSTokens.fonts.body,
                      }}
                    >
                      {isSubmitting ? 'Unlocking...' : 'Unlock with Email'}
                    </motion.button>

                    <p
                      style={{
                        fontSize: 12,
                        textAlign: 'center',
                        marginTop: 12,
                        color: goOSTokens.colors.text.muted,
                        fontFamily: goOSTokens.fonts.body,
                      }}
                    >
                      We&apos;ll send you a confirmation and you&apos;ll get access instantly.
                    </p>
                  </form>
                ) : (
                  <div>
                    {price && (
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <span
                          style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: goOSTokens.colors.text.primary,
                            fontFamily: goOSTokens.fonts.display,
                          }}
                        >
                          ${price}
                        </span>
                      </div>
                    )}

                    <motion.button
                      onClick={onPurchase}
                      whileHover={buttonPress.hover}
                      whileTap={buttonPress.tap}
                      style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: goOSTokens.radii.lg,
                        fontWeight: 500,
                        fontSize: 14,
                        background: goOSTokens.colors.accent.primary,
                        color: 'white',
                        border: `2px solid ${goOSTokens.colors.borderStrong}`,
                        boxShadow: goOSTokens.shadows.sm,
                        cursor: 'pointer',
                        fontFamily: goOSTokens.fonts.body,
                      }}
                    >
                      Buy Now
                    </motion.button>

                    <p
                      style={{
                        fontSize: 12,
                        textAlign: 'center',
                        marginTop: 12,
                        color: goOSTokens.colors.text.muted,
                        fontFamily: goOSTokens.fonts.body,
                      }}
                    >
                      Secure payment via Stripe. Instant access after purchase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GoOSLockedContentModal;
