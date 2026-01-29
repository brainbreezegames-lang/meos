'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/sounds';

interface OnboardingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

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
          style={{
            backgroundImage: 'url(/bg21.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#0a0a0a',
          }}
        >
          {/* Dark overlay for text readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center">

            {/* Logo — editorial serif italic, dramatic scale */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: 'clamp(4.5rem, 14vw, 8rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 0.9,
                marginBottom: '1.5rem',
              }}
            >
              goOS
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.6,
                maxWidth: '28rem',
              }}
            >
              Your personal space on the internet.
              <br />
              Describe yourself to get started.
            </motion.p>

            {/* Input area — solid dark card, no glass */}
            <motion.div
              className="w-full mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="relative rounded-2xl"
                style={{
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="I'm a photographer who captures authentic moments at weddings..."
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-5 pt-5 pb-14 bg-transparent text-base resize-none outline-none placeholder:text-white/20"
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    caretColor: '#F97316',
                  }}
                />

                {/* Bottom bar with submit */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="text-xs"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    {prompt.length > 0 && prompt.trim().length < 10
                      ? 'Keep going...'
                      : 'Press Enter to build'}
                  </span>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="flex items-center gap-2 rounded-full transition-all"
                    style={{
                      padding: canSubmit ? '8px 18px' : '8px 12px',
                      background: canSubmit ? '#F97316' : 'rgba(255,255,255,0.05)',
                      color: canSubmit ? '#0a0a0a' : 'rgba(255,255,255,0.2)',
                    }}
                    whileHover={canSubmit && !isLoading ? { scale: 1.03 } : {}}
                    whileTap={canSubmit && !isLoading ? { scale: 0.97 } : {}}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        {canSubmit && (
                          <span className="text-sm font-medium">Build</span>
                        )}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Section label — Cliento style */}
            <motion.p
              className="text-xs font-medium uppercase tracking-widest mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Quick start
            </motion.p>

            {/* Presets — simple dark pills, orange dot indicator */}
            <motion.div
              className="flex flex-wrap justify-center gap-2.5 mb-16"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              {PRESETS.map((preset, index) => (
                <motion.button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm transition-all"
                  style={{
                    background: '#141414',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                  whileHover={{
                    borderColor: 'rgba(249,115,22,0.25)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#F97316' }}
                  />
                  {preset.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Skip */}
            <motion.button
              onClick={() => {
                playSound('collapse');
                onClose();
              }}
              disabled={isLoading}
              className="text-sm transition-all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ color: 'rgba(255,255,255,0.2)' }}
              whileHover={{ color: '#F97316' }}
            >
              Skip — start with empty workspace
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
