'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { SPRING } from '@/lib/animations';

interface OnboardingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

// Floating orb component for ambient background
const FloatingOrb = ({ delay, size, x, y, color }: {
  delay: number;
  size: number;
  x: string;
  y: string;
  color: string;
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: color,
      filter: 'blur(60px)',
    }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
      opacity: [0.4, 0.6, 0.5, 0.55, 0.4],
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
  />
);

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = useReducedMotion();

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

  const handleSubmit = () => {
    if (prompt.trim().length >= 10 && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const canSubmit = prompt.trim().length >= 10;

  // Example prompts
  const examples = [
    "I'm a freelance motion designer looking to showcase my work and take on new clients",
    "Writer building a space for my newsletter and blog posts",
    "Product designer sharing case studies and my design process",
    "Developer with side projects and open source contributions",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(145deg, #1a1714 0%, #0d0b09 50%, #151210 100%)',
            }}
          />

          {/* Floating orbs */}
          {!prefersReducedMotion && (
            <>
              <FloatingOrb delay={0} size={400} x="10%" y="20%" color="rgba(255, 119, 34, 0.15)" />
              <FloatingOrb delay={2} size={300} x="70%" y="60%" color="rgba(139, 92, 246, 0.12)" />
              <FloatingOrb delay={4} size={350} x="50%" y="10%" color="rgba(236, 72, 153, 0.1)" />
              <FloatingOrb delay={1} size={250} x="80%" y="30%" color="rgba(34, 197, 94, 0.1)" />
            </>
          )}

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-2xl px-6">
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...SPRING.smooth }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: 'rgba(255, 119, 34, 0.1)',
                  border: '1px solid rgba(255, 119, 34, 0.2)',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles size={14} className="text-orange-400" />
                <span className="text-xs font-medium text-orange-300/90">AI-Powered Setup</span>
              </motion.div>

              <h1
                className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, #a8a29e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Describe your space
              </h1>
              <p className="text-white/50 text-lg max-w-md mx-auto">
                Tell us about yourself and what you want to build. We&apos;ll create the perfect setup.
              </p>
            </motion.div>

            {/* Input area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...SPRING.smooth }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="I'm a freelance designer who wants to showcase my portfolio, share case studies, and let clients book calls with me..."
                  disabled={isLoading}
                  className="w-full h-40 px-6 py-5 bg-transparent text-white/90 placeholder-white/30 text-base resize-none outline-none"
                  style={{
                    caretColor: '#ff7722',
                    lineHeight: 1.6,
                  }}
                />

                {/* Character count & submit */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                  <span className="text-xs text-white/30">
                    {prompt.length < 10 ? `${10 - prompt.length} more characters` : `${prompt.length} characters`}
                  </span>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={{
                      background: canSubmit
                        ? 'linear-gradient(135deg, #ff7722 0%, #ff5500 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: canSubmit ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                      boxShadow: canSubmit ? '0 4px 16px rgba(255, 119, 34, 0.3)' : 'none',
                    }}
                    whileHover={canSubmit && !isLoading ? { scale: 1.02 } : {}}
                    whileTap={canSubmit && !isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        Build my space
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-white/20 mt-3">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30">Enter</kbd> to submit
              </p>
            </motion.div>

            {/* Example prompts */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-xs text-white/30 mb-3 text-center">Try one of these:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {examples.map((example, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    {example.slice(0, 50)}...
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Skip option */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-sm text-white/30 hover:text-white/50 transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
