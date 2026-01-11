'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, type ThemeId } from '@/contexts/ThemeContext';

// Theme preview colors for the dropdown
const themePreviewColors: Record<ThemeId, { bg: string; accent: string; isDark: boolean }> = {
  monterey: { bg: '#F5F5F7', accent: '#007AFF', isDark: false },
  dark: { bg: '#0A0A0C', accent: '#5BA0FF', isDark: true },
  bluren: { bg: '#ffffff', accent: '#1E6EF4', isDark: false },
  refined: { bg: '#0d0d0d', accent: '#cae8bd', isDark: true },
  warm: { bg: '#FAFAF9', accent: '#EA580C', isDark: false },
};

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('monterey');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Check for stored preference
    const stored = localStorage.getItem('meos-theme') as ThemeId | null;
    if (stored && THEMES[stored]) {
      setCurrentTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('meos-theme', themeId);

    // Load Halant font for Refined theme
    if (themeId === 'refined') {
      const existingLink = document.querySelector('link[data-theme-font="halant"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Halant:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'halant');
        document.head.appendChild(link);
      }
    }

    // Load Instrument Serif font for Warm theme
    if (themeId === 'warm') {
      const existingLink = document.querySelector('link[data-theme-font="instrument-serif"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';
        link.rel = 'stylesheet';
        link.setAttribute('data-theme-font', 'instrument-serif');
        document.head.appendChild(link);
      }
    }

    setIsOpen(false);
  };

  if (!mounted) return null;

  const current = THEMES[currentTheme];
  const currentPreview = themePreviewColors[currentTheme];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
        style={{
          background: 'var(--border-light)',
          color: 'var(--text-primary)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Theme preview dot */}
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: currentPreview.accent,
            boxShadow: `0 0 0 2px ${currentPreview.bg}, 0 0 0 3px ${currentPreview.accent}40`,
          }}
        />
        <span>{current.name}</span>
        <svg
          className="w-3 h-3 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full mt-2 right-0 z-[200] min-w-[180px] p-1.5 rounded-xl"
            style={{
              background: 'var(--bg-glass-elevated)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--border-light)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {Object.values(THEMES).map((theme) => {
              const preview = themePreviewColors[theme.id];
              const isActive = currentTheme === theme.id;

              return (
                <motion.button
                  key={theme.id}
                  onClick={() => switchTheme(theme.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                  style={{
                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                  }}
                  whileHover={{
                    background: isActive ? 'var(--accent-primary)' : 'var(--border-light)',
                  }}
                >
                  {/* Theme preview mini */}
                  <div
                    className="w-8 h-6 rounded-md relative overflow-hidden flex-shrink-0"
                    style={{
                      background: preview.bg,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(128,128,128,0.2)',
                    }}
                  >
                    {/* Mini menubar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: preview.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    />
                    {/* Mini window */}
                    <div
                      className="absolute top-[5px] left-[3px] w-[14px] h-[10px] rounded-[2px]"
                      style={{
                        background: preview.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                      }}
                    />
                    {/* Mini dock */}
                    <div
                      className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[18px] h-[4px] rounded-full"
                      style={{
                        background: preview.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      }}
                    />
                    {/* Accent dot */}
                    <div
                      className="absolute top-[6px] right-[3px] w-[3px] h-[3px] rounded-full"
                      style={{ background: preview.accent }}
                    />
                  </div>

                  {/* Theme info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium truncate">
                      {theme.name}
                    </div>
                    <div
                      className="text-[10px] truncate"
                      style={{
                        color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)',
                      }}
                    >
                      {theme.description}
                    </div>
                  </div>

                  {/* Checkmark */}
                  {isActive && (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
