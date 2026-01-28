'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

interface OnboardingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

// Quick start presets with icons
const PRESETS = [
  {
    label: 'Design',
    emoji: '✦',
    prompt: "I'm a designer looking to showcase my portfolio, case studies, and take on freelance clients"
  },
  {
    label: 'Writing',
    emoji: '◉',
    prompt: "I'm a writer who wants to share my articles, build a newsletter, and connect with readers"
  },
  {
    label: 'Code',
    emoji: '⬡',
    prompt: "I'm a developer showcasing my projects, open source work, and technical blog"
  },
  {
    label: 'Studio',
    emoji: '◈',
    prompt: "I run a creative studio and want to display our work, team, and services"
  },
];

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [focusedPreset, setFocusedPreset] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setFocusedPreset(null);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (prompt.trim().length >= 10 && !isLoading) {
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
    setPrompt(presetPrompt);
    setTimeout(() => {
      onSubmit(presetPrompt);
    }, 150);
  };

  const canSubmit = prompt.trim().length >= 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Warm cream background with subtle texture */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 50% 120%, #f5ebe0 0%, transparent 50%),
                radial-gradient(ellipse 80% 60% at 20% 20%, #faf6f1 0%, transparent 40%),
                linear-gradient(165deg, #faf8f5 0%, #f7f3ee 40%, #f0ebe4 100%)
              `,
            }}
          />

          {/* Subtle grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Content - asymmetric layout */}
          <div className="relative z-10 w-full max-w-[640px] px-8 md:px-12">
            {/* Header - left aligned */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <h1
                className="text-[clamp(2.5rem,6vw,4rem)] font-normal tracking-[-0.03em] leading-[1.1] mb-4"
                style={{
                  color: '#1a1612',
                  fontFamily: 'var(--font-instrument-serif), Georgia, serif',
                }}
              >
                Build your space
              </h1>
              <p
                className="text-[clamp(1rem,2vw,1.125rem)] leading-relaxed max-w-[440px]"
                style={{
                  color: '#6b5f54',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Describe what you do. We&apos;ll create a personal workspace that feels like you.
              </p>
            </motion.div>

            {/* Input area - no card wrapper */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="I'm a photographer who captures weddings and portraits..."
                  disabled={isLoading}
                  rows={3}
                  className="w-full bg-transparent text-[1.125rem] resize-none outline-none transition-colors"
                  style={{
                    color: '#1a1612',
                    lineHeight: 1.7,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    borderBottom: '1px solid #d4ccc3',
                    paddingBottom: '1.25rem',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderBottomColor = '#8b7355';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderBottomColor = '#d4ccc3';
                  }}
                />
                <style jsx>{`
                  textarea::placeholder {
                    color: #b5aa9d;
                  }
                `}</style>

                {/* Submit button - inline right */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isLoading}
                  className="absolute -bottom-5 right-0 flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: canSubmit ? '#1a1612' : 'transparent',
                    color: canSubmit ? '#faf8f5' : '#b5aa9d',
                    borderRadius: '24px',
                  }}
                  whileHover={canSubmit && !isLoading ? { scale: 1.02, x: 2 } : {}}
                  whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Presets - minimal pills */}
            <motion.div
              className="flex flex-wrap gap-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span
                className="text-xs uppercase tracking-[0.1em] py-2 pr-3"
                style={{ color: '#a09486' }}
              >
                Quick start
              </span>
              {PRESETS.map((preset, i) => (
                <motion.button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.prompt)}
                  onMouseEnter={() => setFocusedPreset(i)}
                  onMouseLeave={() => setFocusedPreset(null)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition-all"
                  style={{
                    background: focusedPreset === i ? '#1a1612' : 'transparent',
                    color: focusedPreset === i ? '#faf8f5' : '#5c534a',
                    border: `1px solid ${focusedPreset === i ? '#1a1612' : '#d4ccc3'}`,
                    borderRadius: '20px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.45 + i * 0.05,
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>{preset.emoji}</span>
                  {preset.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Footer - skip option */}
            <motion.div
              className="mt-16 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-sm transition-colors hover:opacity-70"
                style={{
                  color: '#a09486',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                Skip setup
              </button>
              <span
                className="text-xs"
                style={{ color: '#c4b8ab' }}
              >
                Press <kbd className="font-medium">↵</kbd> to create
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
