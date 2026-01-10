'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export type VisitorPersona = 'recruiter' | 'visitor' | 'guest';

interface PersonaOption {
  id: VisitorPersona;
  emoji: string;
  label: string;
  sublabel: string;
  description: string;
}

const DEFAULT_PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'recruiter',
    emoji: '👔',
    label: 'Recruiter',
    sublabel: 'or Client',
    description: 'Optimized view for hiring decisions',
  },
  {
    id: 'visitor',
    emoji: '👋',
    label: 'Visitor',
    sublabel: 'Just Here to Explore',
    description: 'Full creative desktop experience',
  },
];

interface PersonaLoginScreenProps {
  profileImage?: string | null;
  name: string;
  title?: string | null;
  onSelect: (persona: VisitorPersona) => void;
  customOptions?: {
    option1Label?: string;
    option1Sublabel?: string;
    option2Label?: string;
    option2Sublabel?: string;
  };
  skipBehavior?: 'recruiter' | 'visitor';
  showSkip?: boolean;
}

export function PersonaLoginScreen({
  profileImage,
  name,
  title,
  onSelect,
  customOptions,
  skipBehavior: _skipBehavior = 'visitor',
  showSkip = true,
}: PersonaLoginScreenProps) {
  const [hoveredOption, setHoveredOption] = useState<VisitorPersona | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const personaOptions: PersonaOption[] = customOptions
    ? [
        {
          ...DEFAULT_PERSONA_OPTIONS[0],
          label: customOptions.option1Label || DEFAULT_PERSONA_OPTIONS[0].label,
          sublabel: customOptions.option1Sublabel || DEFAULT_PERSONA_OPTIONS[0].sublabel,
        },
        {
          ...DEFAULT_PERSONA_OPTIONS[1],
          label: customOptions.option2Label || DEFAULT_PERSONA_OPTIONS[1].label,
          sublabel: customOptions.option2Sublabel || DEFAULT_PERSONA_OPTIONS[1].sublabel,
        },
      ]
    : DEFAULT_PERSONA_OPTIONS;

  const handleSelect = useCallback((persona: VisitorPersona) => {
    // Store selection
    localStorage.setItem('meos_visitor_persona', persona);
    onSelect(persona);
  }, [onSelect]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('meos_visitor_persona', 'guest');
    onSelect('guest');
  }, [onSelect]);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        handleSelect('recruiter');
      } else if (e.key === '2') {
        handleSelect('visitor');
      } else if (e.key === 'Escape' && showSkip) {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect, handleSkip, showSkip]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: 'rgba(255, 255, 255, 0.1)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Glassmorphic overlay layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(100, 150, 255, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="relative z-10 flex flex-col items-center px-6 max-w-lg w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Profile photo */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            >
              <div
                className="w-28 h-28 rounded-full overflow-hidden"
                style={{
                  boxShadow: `
                    0 0 0 4px rgba(255, 255, 255, 0.1),
                    0 8px 32px -4px rgba(0, 0, 0, 0.5),
                    0 0 80px rgba(100, 150, 255, 0.15)
                  `,
                }}
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Subtle glow ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: '2px solid rgba(100, 150, 255, 0.3)',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Name and title */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              <h1
                className="text-2xl font-semibold tracking-tight mb-1"
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                {name}
              </h1>
              {title && (
                <p
                  className="text-base"
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '0.01em',
                  }}
                >
                  {title}
                </p>
              )}
            </motion.div>

            {/* Question */}
            <motion.p
              className="text-center mb-8"
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '15px',
                letterSpacing: '0.02em',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Who&apos;s visiting today?
            </motion.p>

            {/* Persona options */}
            <motion.div
              className="flex gap-4 mb-8 w-full justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
            >
              {personaOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  className="relative flex-1 max-w-[160px] py-6 px-4 rounded-2xl text-center transition-all"
                  style={{
                    background: hoveredOption === option.id
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(255, 255, 255, 0.06)',
                    border: hoveredOption === option.id
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: hoveredOption === option.id
                      ? '0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                      : '0 4px 24px -4px rgba(0, 0, 0, 0.2)',
                  }}
                  onClick={() => handleSelect(option.id)}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.5 + index * 0.1,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Emoji */}
                  <motion.div
                    className="text-4xl mb-3"
                    animate={{
                      y: hoveredOption === option.id ? [-2, 2, -2] : 0,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: hoveredOption === option.id ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {option.emoji}
                  </motion.div>

                  {/* Label */}
                  <div
                    className="font-medium text-sm mb-0.5"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    {option.label}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    {option.sublabel}
                  </div>

                  {/* Hover indicator */}
                  <AnimatePresence>
                    {hoveredOption === option.id && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: 'linear-gradient(135deg, rgba(100, 150, 255, 0.1) 0%, rgba(150, 100, 255, 0.05) 100%)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>

            {/* Skip option */}
            {showSkip && (
              <motion.button
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Skip — Enter as Guest
              </motion.button>
            )}

            {/* Keyboard hints */}
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6"
              style={{ color: 'rgba(255, 255, 255, 0.3)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="flex items-center gap-2 text-xs">
                <kbd
                  className="px-2 py-1 rounded"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '10px',
                  }}
                >
                  1
                </kbd>
                <span>{personaOptions[0].label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <kbd
                  className="px-2 py-1 rounded"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '10px',
                  }}
                >
                  2
                </kbd>
                <span>{personaOptions[1].label}</span>
              </div>
              {showSkip && (
                <div className="flex items-center gap-2 text-xs">
                  <kbd
                    className="px-2 py-1 rounded"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '10px',
                    }}
                  >
                    esc
                  </kbd>
                  <span>Skip</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook to manage persona state
export function useVisitorPersona() {
  const [persona, setPersona] = useState<VisitorPersona | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check localStorage for existing persona
    const stored = localStorage.getItem('meos_visitor_persona') as VisitorPersona | null;
    if (stored && ['recruiter', 'visitor', 'guest'].includes(stored)) {
      setPersona(stored);
    }
    setHasChecked(true);
  }, []);

  const selectPersona = useCallback((newPersona: VisitorPersona) => {
    localStorage.setItem('meos_visitor_persona', newPersona);
    setPersona(newPersona);
  }, []);

  const clearPersona = useCallback(() => {
    localStorage.removeItem('meos_visitor_persona');
    setPersona(null);
  }, []);

  return {
    persona,
    hasChecked,
    selectPersona,
    clearPersona,
    isRecruiter: persona === 'recruiter',
    isVisitor: persona === 'visitor',
    isGuest: persona === 'guest',
    needsSelection: hasChecked && !persona,
  };
}

// Mode toggle component for switching between modes after selection
export function PersonaModeToggle({
  currentMode,
  onChange,
}: {
  currentMode: VisitorPersona;
  onChange: (mode: VisitorPersona) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const modeLabels: Record<VisitorPersona, { emoji: string; label: string }> = {
    recruiter: { emoji: '👔', label: 'Recruiter Mode' },
    visitor: { emoji: '👋', label: 'Explorer Mode' },
    guest: { emoji: '👤', label: 'Guest Mode' },
  };

  const current = modeLabels[currentMode];

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--border-light)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ background: 'var(--bg-glass-elevated)' }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{current.emoji}</span>
        <svg
          className="w-3 h-3 opacity-50"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-1 z-[101] overflow-hidden"
              style={{
                width: 180,
                borderRadius: 10,
                background: 'var(--bg-glass-elevated)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                boxShadow: `
                  0 0 0 0.5px rgba(0, 0, 0, 0.12),
                  0 8px 32px -4px rgba(0, 0, 0, 0.25)
                `,
              }}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="py-1">
                {(['recruiter', 'visitor'] as VisitorPersona[]).map((mode) => (
                  <button
                    key={mode}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                    style={{
                      fontSize: '13px',
                      color: currentMode === mode ? 'var(--accent-primary)' : 'var(--text-primary)',
                      background: currentMode === mode ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                    }}
                    onClick={() => {
                      onChange(mode);
                      setIsOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      if (currentMode !== mode) {
                        e.currentTarget.style.background = 'var(--border-light)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = currentMode === mode
                        ? 'rgba(0, 122, 255, 0.08)'
                        : 'transparent';
                    }}
                  >
                    <span className="text-base">{modeLabels[mode].emoji}</span>
                    <span className="flex-1">{modeLabels[mode].label}</span>
                    {currentMode === mode && (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
