'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, X, FileText, Folder, BarChart3 } from 'lucide-react';

// Design tokens
const goOS = {
  colors: {
    paper: '#FAF8F0',
    cream: '#FFFDF5',
    headerBg: '#F0EDE0',
    border: '#2a2a2a',
    text: {
      primary: '#1a1a1a',
      secondary: '#3a3a3a',
      muted: '#666666',
    },
    accent: {
      orange: '#E85D04',
      orangeLight: '#FFB347',
    },
  },
  shadows: {
    solid: '6px 6px 0 rgba(0,0,0,0.1)',
  },
};

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
        return <Folder size={48} stroke={goOS.colors.border} strokeWidth={1.5} />;
      case 'case-study':
        return <BarChart3 size={48} stroke={goOS.colors.border} strokeWidth={1.5} />;
      default:
        return <FileText size={48} stroke={goOS.colors.border} strokeWidth={1.5} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-lg overflow-hidden"
              style={{
                background: goOS.colors.cream,
                border: `2px solid ${goOS.colors.border}`,
                boxShadow: goOS.shadows.solid,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  background: goOS.colors.headerBg,
                  borderBottom: `2px solid ${goOS.colors.border}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Lock size={16} stroke={goOS.colors.accent.orange} />
                  <span className="font-medium text-sm" style={{ color: goOS.colors.text.primary }}>
                    Locked Content
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-black/5 transition-colors"
                >
                  <X size={16} stroke={goOS.colors.text.muted} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* File preview */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-24 h-24 rounded-lg flex items-center justify-center mb-3"
                    style={{
                      background: goOS.colors.paper,
                      border: `2px solid ${goOS.colors.border}`,
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.08)',
                    }}
                  >
                    {getFileIcon()}
                  </div>
                  <h3
                    className="text-lg font-bold text-center"
                    style={{ color: goOS.colors.text.primary }}
                  >
                    {file.title}
                  </h3>
                  <p
                    className="text-sm mt-1 text-center"
                    style={{ color: goOS.colors.text.muted }}
                  >
                    This content requires {unlockType === 'email' ? 'your email' : 'a purchase'} to access
                  </p>
                </div>

                {/* Unlock form */}
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="text-2xl mb-2">✓</div>
                    <p className="font-medium" style={{ color: goOS.colors.accent.orange }}>
                      Unlocked! Opening now...
                    </p>
                  </motion.div>
                ) : unlockType === 'email' ? (
                  <form onSubmit={handleEmailSubmit}>
                    <div className="mb-4">
                      <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                        style={{
                          background: goOS.colors.paper,
                          border: `2px solid ${error ? '#ef4444' : goOS.colors.border}`,
                        }}
                      >
                        <Mail size={18} stroke={goOS.colors.text.muted} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="flex-1 bg-transparent outline-none text-sm"
                          style={{ color: goOS.colors.text.primary }}
                          required
                        />
                      </div>
                      {error && (
                        <p className="text-xs mt-1 text-red-500">{error}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: goOS.colors.accent.orange,
                        color: 'white',
                        border: `2px solid ${goOS.colors.border}`,
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                      }}
                    >
                      {isSubmitting ? 'Unlocking...' : 'Unlock with Email'}
                    </motion.button>

                    <p
                      className="text-xs text-center mt-3"
                      style={{ color: goOS.colors.text.muted }}
                    >
                      We&apos;ll send you a confirmation and you&apos;ll get access instantly.
                    </p>
                  </form>
                ) : (
                  <div>
                    {price && (
                      <div className="text-center mb-4">
                        <span
                          className="text-3xl font-bold"
                          style={{ color: goOS.colors.text.primary }}
                        >
                          ${price}
                        </span>
                      </div>
                    )}

                    <motion.button
                      onClick={onPurchase}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-lg font-medium text-sm"
                      style={{
                        background: goOS.colors.accent.orange,
                        color: 'white',
                        border: `2px solid ${goOS.colors.border}`,
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
                      }}
                    >
                      Buy Now
                    </motion.button>

                    <p
                      className="text-xs text-center mt-3"
                      style={{ color: goOS.colors.text.muted }}
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
