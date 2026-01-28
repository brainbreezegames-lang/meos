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

// Quick start presets
const PRESETS = [
  {
    label: 'Designer',
    prompt: "I'm a UI/UX designer specializing in product design for startups. I create interfaces that are both beautiful and functional.",
  },
  {
    label: 'Photographer',
    prompt: "I'm a wedding and portrait photographer capturing authentic moments. I work with couples and families who value storytelling.",
  },
  {
    label: 'Developer',
    prompt: "I'm a full-stack developer building web apps and open source tools. I focus on React, TypeScript, and developer experience.",
  },
  {
    label: 'Writer',
    prompt: "I'm a writer sharing essays about technology and culture. I publish a weekly newsletter and am working on my first book.",
  },
];

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
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
    }, 100);
  };

  const canSubmit = prompt.trim().length >= 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Clean light background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f4 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-xl">
            {/* Header */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <h1
                className="text-3xl font-medium mb-3"
                style={{ color: '#171717' }}
              >
                Tell me about yourself
              </h1>
              <p
                className="text-base leading-relaxed"
                style={{ color: '#737373' }}
              >
                Describe what you do and I&apos;ll create a personalized workspace for you. Be specific - the more detail, the better.
              </p>
            </motion.div>

            {/* Input area */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="I'm a wedding photographer based in LA. I specialize in candid, documentary-style photos that capture real emotions..."
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-4 bg-transparent text-base resize-none outline-none"
                  style={{
                    color: '#171717',
                    lineHeight: 1.6,
                  }}
                />

                {/* Footer inside card */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: '1px solid #f5f5f4' }}
                >
                  <span
                    className="text-xs"
                    style={{ color: '#a3a3a3' }}
                  >
                    {prompt.length < 10 ? `${10 - prompt.length} more characters needed` : 'Press Enter to continue'}
                  </span>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
                    style={{
                      background: canSubmit ? '#171717' : '#f5f5f4',
                      color: canSubmit ? '#fff' : '#a3a3a3',
                    }}
                    whileHover={canSubmit && !isLoading ? { scale: 1.02 } : {}}
                    whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span>Create</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Presets */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <p
                className="text-xs uppercase tracking-wide mb-3 font-medium"
                style={{ color: '#a3a3a3' }}
              >
                Or try an example
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.prompt)}
                    disabled={isLoading}
                    className="text-left px-4 py-3 rounded-lg text-sm transition-all hover:scale-[1.01]"
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                      color: '#525252',
                    }}
                  >
                    <span className="font-medium" style={{ color: '#171717' }}>
                      {preset.label}
                    </span>
                    <span className="text-xs ml-1" style={{ color: '#a3a3a3' }}>
                      example
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Skip */}
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: '#a3a3a3' }}
              >
                Skip and start with empty workspace
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
