'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2, Mic, MicOff } from 'lucide-react';
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

// Typewriter example prompts — cycles through these to inspire users
const TYPEWRITER_EXAMPLES = [
  "I'm a wedding photographer based in Portland. I want to showcase my portfolio and let couples book me...",
  "I'm learning Japanese and want a study space with vocab lists, a learning plan, and useful resources...",
  "I run a small bakery and need a digital menu, contact form, and links to my Instagram and Yelp...",
  "I'm a freelance illustrator. I need a portfolio, pricing guide, and a way for clients to reach me...",
  "I'm a student organizing my thesis research — notes, reading lists, and a project timeline...",
  "I teach yoga online. I want class schedules, a booking system, and links to my YouTube channel...",
];

// ============================================================================
// Typewriter Hook
// ============================================================================

function useTypewriter(examples: string[], typingSpeed = 45, pauseDuration = 2200, erasingSpeed = 20) {
  const [displayText, setDisplayText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<'typing' | 'pausing' | 'erasing'>('typing');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    setIsActive(false);
    setDisplayText('');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      const currentExample = examples[indexRef.current % examples.length];

      if (phaseRef.current === 'typing') {
        charRef.current++;
        setDisplayText(currentExample.slice(0, charRef.current));

        if (charRef.current >= currentExample.length) {
          phaseRef.current = 'pausing';
          timerRef.current = setTimeout(tick, pauseDuration);
        } else {
          timerRef.current = setTimeout(tick, typingSpeed + Math.random() * 30);
        }
      } else if (phaseRef.current === 'pausing') {
        phaseRef.current = 'erasing';
        timerRef.current = setTimeout(tick, erasingSpeed);
      } else if (phaseRef.current === 'erasing') {
        charRef.current -= 2;
        if (charRef.current <= 0) {
          charRef.current = 0;
          setDisplayText('');
          indexRef.current = (indexRef.current + 1) % examples.length;
          phaseRef.current = 'typing';
          timerRef.current = setTimeout(tick, 400);
        } else {
          setDisplayText(currentExample.slice(0, charRef.current));
          timerRef.current = setTimeout(tick, erasingSpeed);
        }
      }
    };

    // Start after a brief delay
    timerRef.current = setTimeout(tick, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, examples, typingSpeed, pauseDuration, erasingSpeed]);

  return { displayText, stop, isActive };
}

// ============================================================================
// Component
// ============================================================================

export function OnboardingPrompt({ isOpen, onClose, onSubmit, isLoading = false }: OnboardingPromptProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typewriter = useTypewriter(TYPEWRITER_EXAMPLES);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Detect speech recognition support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = prompt;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript;
        } else {
          interim += transcript;
        }
      }
      setPrompt(finalTranscript + (interim ? ' ' + interim : ''));
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    playSound('voiceReady');

    if (!userHasInteracted) {
      setUserHasInteracted(true);
      typewriter.stop();
    }
  }, [isListening, prompt, userHasInteracted, typewriter]);

  // Stop listening when prompt is submitted or modal closes
  useEffect(() => {
    if (!isOpen || isLoading) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      playSound('expand');
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
      setUserHasInteracted(false);
    }
  }, [isOpen]);

  const handleTextareaFocus = useCallback(() => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
      typewriter.stop();
    }
  }, [userHasInteracted, typewriter]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
      typewriter.stop();
    }
    setPrompt(e.target.value);
  }, [userHasInteracted, typewriter]);

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
    setUserHasInteracted(true);
    typewriter.stop();
    setPrompt(presetPrompt);
    setTimeout(() => {
      onSubmit(presetPrompt);
    }, 100);
  };

  const canSubmit = prompt.trim().length >= 10;

  // Shared text shadow for readability on the sky background
  const softShadow = '0 1px 12px rgba(0,0,0,0.35), 0 0px 4px rgba(0,0,0,0.2)';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col overflow-hidden onboarding-prompt-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            backgroundImage: 'url(/bg21.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#b8cce0',
          }}
        >
          {/* Layout: centered content sitting above the horizon line */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6" style={{ paddingBottom: 'calc(14vh + 48px)' }}>

            {/* Logo */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: 'clamp(2.75rem, 8vw, 4.5rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: '#fff',
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                marginBottom: '0.5rem',
                textShadow: softShadow,
              }}
            >
              goOS
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: 'clamp(0.8125rem, 1.8vw, 0.9375rem)',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.5,
                maxWidth: '26rem',
                textShadow: '0 1px 8px rgba(0,0,0,0.25)',
                marginBottom: '1.75rem',
              }}
            >
              Your personal space on the internet.
              <br />
              Describe what you&apos;re building, and watch your workspace come to life.
            </motion.p>

            {/* Prompt input — white card, warm and clean */}
            <motion.div
              className="w-full"
              style={{ maxWidth: 600 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Typewriter overlay — shows when user hasn't interacted yet */}
                {!userHasInteracted && typewriter.isActive && (
                  <div
                    className="absolute top-0 left-0 right-0 px-5 pt-5 pointer-events-none"
                    style={{ zIndex: 1 }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: 'rgba(0,0,0,0.32)',
                        fontFamily: 'var(--font-body, system-ui)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {typewriter.displayText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                        style={{
                          display: 'inline-block',
                          width: 2,
                          height: 18,
                          background: 'rgba(0,0,0,0.25)',
                          marginLeft: 1,
                          verticalAlign: 'text-bottom',
                          borderRadius: 1,
                        }}
                      />
                    </span>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleChange}
                  onFocus={handleTextareaFocus}
                  onKeyDown={handleKeyDown}
                  placeholder={userHasInteracted ? 'What will you build today?' : ''}
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-5 pt-5 pb-14 bg-transparent text-base resize-none onboarding-textarea"
                  style={{
                    color: 'rgba(0,0,0,0.85)',
                    lineHeight: 1.6,
                    caretColor: '#F97316',
                    fontFamily: 'var(--font-body, system-ui)',
                    fontSize: 16,
                    position: 'relative',
                    zIndex: 2,
                  }}
                />

                {/* Bottom bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3"
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    zIndex: 3,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>
                      {prompt.length > 0 && prompt.trim().length < 10
                        ? 'Keep going...'
                        : ''}
                    </span>
                    {speechSupported && (
                      <motion.button
                        onClick={toggleListening}
                        className="flex items-center justify-center rounded-lg transition-all"
                        style={{
                          width: 32,
                          height: 32,
                          background: isListening ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)',
                          color: isListening ? '#ef4444' : 'rgba(0,0,0,0.35)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      >
                        {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                      </motion.button>
                    )}
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    aria-label={isLoading ? 'Building...' : 'Build workspace'}
                    className="flex items-center justify-center rounded-xl transition-all"
                    style={{
                      width: 36,
                      height: 36,
                      background: canSubmit ? '#1a1a1a' : 'rgba(0,0,0,0.06)',
                      color: canSubmit ? '#fff' : 'rgba(0,0,0,0.2)',
                      cursor: canSubmit ? 'pointer' : 'default',
                      border: 'none',
                    }}
                    whileHover={canSubmit && !isLoading ? { scale: 1.06 } : {}}
                    whileTap={canSubmit && !isLoading ? { scale: 0.94 } : {}}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowUp size={18} strokeWidth={2.5} />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Presets — translucent pills over the sky */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {PRESETS.map((preset, index) => (
                <motion.button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.prompt)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-full text-sm transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + index * 0.06, duration: 0.4 }}
                  whileHover={{
                    background: 'rgba(255,255,255,0.3)',
                    borderColor: 'rgba(255,255,255,0.35)',
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  {preset.label}
                </motion.button>
              ))}
            </motion.div>

          </div>

          {/* Bottom bar — pinned to bottom center, small and elegant */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-3 pb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.01em',
                textShadow: '0 1px 6px rgba(0,0,0,0.3)',
              }}
            >
              Press <kbd style={{
                display: 'inline-block',
                padding: '1px 5px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 10,
                fontWeight: 600,
                marginInline: 2,
              }}>Enter</kbd> to build
            </span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>·</span>
            <motion.button
              onClick={() => { playSound('collapse'); onClose(); }}
              disabled={isLoading}
              aria-label="Skip AI build and start with an empty workspace"
              className="transition-all"
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.01em',
              }}
              whileHover={{ color: 'rgba(255,255,255,0.7)' }}
            >
              start with an empty workspace
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
