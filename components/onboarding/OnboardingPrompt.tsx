'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';

interface OnboardingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

// ============================================================================
// Dark Theme Palette — shared with GooseBuilder
// ============================================================================

const PALETTE = {
  accent: '#F97316',
  accentLight: '#FB923C',
  textPrimary: 'rgba(255, 255, 255, 0.92)',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.30)',
  divider: 'rgba(255, 255, 255, 0.06)',
} as const;

const SERIF = 'Georgia, "Times New Roman", serif';

// Quick start presets
const PRESETS = [
  {
    label: 'Designer portfolio',
    prompt: "I'm a UI/UX designer specializing in product design for startups. I create interfaces that are both beautiful and functional.",
  },
  {
    label: 'Writing space',
    prompt: "I'm a writer sharing essays about technology and culture. I publish a weekly newsletter and am working on my first book.",
  },
  {
    label: 'Developer hub',
    prompt: "I'm a full-stack developer building web apps and open source tools. I focus on React, TypeScript, and developer experience.",
  },
  {
    label: 'Creative studio',
    prompt: "I'm a creative professional doing photography, design, and visual storytelling. I work with brands and individuals.",
  },
];

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      playSound('expand');
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        playSound('collapse');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (prompt.trim().length >= 10 && !isLoading) {
      playSound('bubble');
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    playSound('bubble');
    setPrompt(presetPrompt);
    setTimeout(() => {
      onSubmit(presetPrompt);
    }, 100);
  };

  const canSubmit = prompt.trim().length >= 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Background image */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              backgroundImage: 'url(/bg21.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Dark overlay for premium feel */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.70) 100%)',
            }}
          />

          {/* Content - all centered */}
          <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
            {/* Logo/Title */}
            <motion.h1
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: 'clamp(4rem, 12vw, 7rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontFamily: SERIF,
                color: PALETTE.textPrimary,
                textShadow: '0 2px 30px rgba(0,0,0,0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              goOS
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mb-10 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                fontWeight: 400,
                color: PALETTE.textSecondary,
                textShadow: '0 1px 10px rgba(0,0,0,0.3)',
                lineHeight: 1.6,
              }}
            >
              Your personal space on the internet. Describe what you&apos;re building, and watch your workspace come to life.
            </motion.p>

            {/* Input card — dark glass */}
            <motion.div
              className="w-full mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(12, 10, 9, 0.85)',
                  backdropFilter: 'blur(40px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me about your work..."
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-6 py-5 bg-transparent text-lg resize-none outline-none placeholder:text-white/25"
                  style={{
                    color: PALETTE.textPrimary,
                    lineHeight: 1.6,
                    caretColor: PALETTE.accent,
                  }}
                />

                {/* Submit button inside card */}
                <div className="absolute bottom-4 right-4">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: canSubmit ? PALETTE.accent : 'rgba(255,255,255,0.06)',
                      color: canSubmit ? '#0c0a09' : PALETTE.textMuted,
                      boxShadow: canSubmit ? '0 2px 12px rgba(249, 115, 22, 0.3)' : 'none',
                    }}
                    whileHover={canSubmit && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={canSubmit && !isLoading ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowUp size={18} />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Presets — dark glass pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              {PRESETS.map((preset, index) => (
                <motion.button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.prompt)}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: PALETTE.textSecondary,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + index * 0.05, duration: 0.4 }}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    borderColor: 'rgba(249, 115, 22, 0.3)',
                    color: PALETTE.textPrimary,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {preset.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Bottom hint */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{ color: PALETTE.textMuted }}
            >
              <span className="text-sm">Press</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: PALETTE.textSecondary,
                }}
              >
                Enter
              </span>
              <span className="text-sm">to build your space</span>
            </motion.div>

            {/* Skip link */}
            <motion.button
              onClick={() => {
                playSound('collapse');
                onClose();
              }}
              disabled={isLoading}
              className="mt-8 text-sm transition-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: PALETTE.textMuted }}
              whileHover={{ color: PALETTE.accent }}
            >
              Skip — start with empty workspace
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
