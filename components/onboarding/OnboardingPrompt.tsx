'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { playSound } from '@/lib/sounds';

interface OnboardingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

// Quick start presets with goose personality
const PRESETS = [
  {
    label: 'Designer',
    emoji: '🎨',
    prompt: "I'm a UI/UX designer specializing in product design for startups. I create interfaces that are both beautiful and functional.",
  },
  {
    label: 'Photographer',
    emoji: '📸',
    prompt: "I'm a wedding and portrait photographer capturing authentic moments. I work with couples and families who value storytelling.",
  },
  {
    label: 'Developer',
    emoji: '⌨️',
    prompt: "I'm a full-stack developer building web apps and open source tools. I focus on React, TypeScript, and developer experience.",
  },
  {
    label: 'Writer',
    emoji: '✍️',
    prompt: "I'm a writer sharing essays about technology and culture. I publish a weekly newsletter and am working on my first book.",
  },
];

// Goose-themed placeholder texts
const PLACEHOLDERS = [
  "I'm a wedding photographer based in LA. I specialize in candid, documentary-style photos that capture real emotions...",
  "I'm a freelance designer who makes brands look less boring. Currently obsessed with weird typography...",
  "I build apps that people actually want to use. TypeScript enthusiast, coffee dependent...",
  "I write about the internet and why it's simultaneously the best and worst thing ever...",
];

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      playSound('expand');
      setTimeout(() => textareaRef.current?.focus(), 300);
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
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Warm, inviting background with subtle texture */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 237, 213, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 80% 100%, rgba(254, 243, 199, 0.3) 0%, transparent 50%),
                linear-gradient(180deg, #fffbf5 0%, #faf7f2 100%)
              `,
            }}
          />

          {/* Floating goose decoration */}
          <motion.div
            className="absolute top-[10%] right-[15%] text-6xl select-none pointer-events-none"
            initial={{ opacity: 0, y: 20, rotate: -10 }}
            animate={{
              opacity: 0.15,
              y: [0, -8, 0],
              rotate: [-10, -5, -10]
            }}
            transition={{
              opacity: { delay: 0.3, duration: 0.5 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            🪿
          </motion.div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-lg px-6">
            {/* Header with personality */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Goose greeting */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <span className="text-sm">🪿</span>
                <span
                  className="text-xs font-medium tracking-wide"
                  style={{ color: '#b45309' }}
                >
                  HONK! Let&apos;s build your nest
                </span>
              </motion.div>

              <h1
                className="text-[2rem] leading-tight font-semibold tracking-tight mb-3"
                style={{
                  color: '#1c1917',
                  fontFamily: 'var(--font-display, system-ui)',
                }}
              >
                Who are you?
              </h1>
              <p
                className="text-base leading-relaxed"
                style={{ color: '#78716c' }}
              >
                Tell me what you do, and I&apos;ll create a space that&apos;s actually
                <span className="italic"> yours</span>—not another boring template.
              </p>
            </motion.div>

            {/* Input card */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-5 py-4 bg-transparent text-base resize-none outline-none placeholder:text-stone-400"
                  style={{
                    color: '#1c1917',
                    lineHeight: 1.7,
                  }}
                />

                {/* Action bar */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    background: 'rgba(250, 250, 249, 0.7)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <span
                    className="text-xs"
                    style={{ color: '#a8a29e' }}
                  >
                    {prompt.length < 10
                      ? `${10 - prompt.length} more characters...`
                      : '↵ Enter to create'}
                  </span>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #1c1917 0%, #292524 100%)'
                        : '#f5f5f4',
                      color: canSubmit ? '#fafaf9' : '#a8a29e',
                      boxShadow: canSubmit ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                    }}
                    whileHover={canSubmit && !isLoading ? { scale: 1.02, y: -1 } : {}}
                    whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Create my space</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Presets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <p
                className="text-xs mb-3 font-medium"
                style={{ color: '#a8a29e' }}
              >
                or pick a starting point
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset, index) => (
                  <motion.button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.prompt)}
                    onMouseEnter={() => setHoveredPreset(preset.label)}
                    onMouseLeave={() => setHoveredPreset(null)}
                    disabled={isLoading}
                    className="relative text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: hoveredPreset === preset.label
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid',
                      borderColor: hoveredPreset === preset.label
                        ? 'rgba(0, 0, 0, 0.1)'
                        : 'rgba(0, 0, 0, 0.04)',
                      boxShadow: hoveredPreset === preset.label
                        ? '0 2px 8px rgba(0, 0, 0, 0.06)'
                        : 'none',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05, duration: 0.4 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{preset.emoji}</span>
                      <span
                        className="font-medium"
                        style={{ color: '#1c1917' }}
                      >
                        {preset.label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Skip link */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => {
                  playSound('collapse');
                  onClose();
                }}
                disabled={isLoading}
                className="text-sm transition-all hover:text-stone-600"
                style={{ color: '#a8a29e' }}
              >
                Skip — I&apos;ll figure it out myself
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
