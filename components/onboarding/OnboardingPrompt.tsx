'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';

interface OnboardingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

// Quick start presets
const PRESETS = [
  { label: 'Designer portfolio', prompt: "I'm a designer looking to showcase my portfolio, case studies, and take on freelance clients" },
  { label: 'Writing space', prompt: "I'm a writer who wants to share my articles, build a newsletter, and connect with readers" },
  { label: 'Developer hub', prompt: "I'm a developer showcasing my projects, open source work, and technical blog" },
  { label: 'Creative studio', prompt: "I run a creative studio and want to display our work, team, and services" },
];

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
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
    // Auto-submit after a brief delay
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
          transition={{ duration: 0.3 }}
        >
          {/* Sky background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #a8c4d9 0%, #d4c4b0 50%, #e8d5c4 100%)',
            }}
          />

          {/* Cloud texture overlay */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 50% at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 70% 20%, rgba(255,255,255,0.6) 0%, transparent 50%),
                radial-gradient(ellipse 90% 60% at 50% 80%, rgba(255,255,255,0.7) 0%, transparent 40%),
                radial-gradient(ellipse 50% 30% at 80% 60%, rgba(255,255,255,0.5) 0%, transparent 50%),
                radial-gradient(ellipse 70% 50% at 10% 70%, rgba(255,255,255,0.6) 0%, transparent 45%)
              `,
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/30"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center">
            {/* Logo */}
            <motion.h1
              className="text-6xl md:text-7xl font-light italic mb-6"
              style={{
                color: '#fff',
                textShadow: '0 2px 20px rgba(0,0,0,0.1)',
                fontFamily: 'Georgia, serif',
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              goOS
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-center text-lg md:text-xl mb-10 max-w-lg"
              style={{
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 10px rgba(0,0,0,0.1)',
                lineHeight: 1.5,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your personal space on the internet. Describe what you&apos;re building, and watch your workspace come to life.
            </motion.p>

            {/* Input card */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
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
                  className="w-full px-6 py-5 bg-transparent text-gray-800 placeholder-gray-400 text-lg resize-none outline-none"
                  style={{
                    lineHeight: 1.6,
                  }}
                />

                {/* Submit button */}
                <div className="absolute bottom-4 right-4">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: canSubmit ? '#8b7355' : '#e5e5e5',
                      color: canSubmit ? '#fff' : '#a0a0a0',
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

            {/* Preset buttons */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {PRESETS.map((preset, i) => (
                <motion.button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.prompt)}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    color: '#6b5c4c',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                  }}
                  whileHover={{
                    background: 'rgba(255,255,255,0.9)',
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  {preset.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Hint */}
            <motion.p
              className="mt-10 text-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Press{' '}
              <kbd
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Enter
              </kbd>
              {' '}to build your space
            </motion.p>

            {/* Skip link */}
            <motion.button
              onClick={onClose}
              disabled={isLoading}
              className="mt-6 text-sm transition-opacity hover:opacity-100"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Skip for now
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
