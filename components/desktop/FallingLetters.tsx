'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FallingLettersProps {
  isReady?: boolean;
}

// Letter configuration - artistic arrangement like OGAKI reference
// Each letter has a fixed final position to prevent any overlap
const LETTERS = [
  { char: 'H', x: 5, y: 15, size: 1.0, rotation: -3 },
  { char: 'E', x: 18, y: 8, size: 0.85, rotation: 2 },
  { char: 'L', x: 8, y: 45, size: 0.9, rotation: -1 },
  { char: 'L', x: 22, y: 38, size: 0.85, rotation: 4 },
  { char: 'O', x: 3, y: 72, size: 1.0, rotation: -2 },
];

export function FallingLetters({ isReady = true }: FallingLettersProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Detect dark mode
  useEffect(() => {
    if (!mounted) return;

    const checkDarkMode = () => {
      const themeElement = document.querySelector('.theme-sketch');
      const hasDarkClass = themeElement?.classList.contains('dark') || false;
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    const themeElement = document.querySelector('.theme-sketch');
    if (themeElement) {
      observer.observe(themeElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, [mounted]);

  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger animation when ready
  useEffect(() => {
    if (mounted && isReady && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [mounted, isReady, hasAnimated]);

  if (!mounted || !isReady) return null;

  // Base size relative to viewport
  const baseSize = Math.min(window.innerHeight * 0.28, window.innerWidth * 0.18, 320);

  // Solid color - visible but subtle background element
  const letterColor = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.07)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {LETTERS.map((letter, index) => {
        const size = baseSize * letter.size;

        return (
          <motion.div
            key={`${letter.char}-${index}`}
            initial={{
              x: `${letter.x}vw`,
              y: '-30vh',
              rotate: letter.rotation - 10,
              opacity: 0,
            }}
            animate={hasAnimated ? {
              x: `${letter.x}vw`,
              y: `${letter.y}vh`,
              rotate: letter.rotation,
              opacity: 1,
            } : {}}
            transition={{
              type: 'spring',
              stiffness: 50,
              damping: 12,
              mass: 1.5,
              delay: index * 0.08,
            }}
            style={{
              position: 'absolute',
              fontSize: size,
              fontFamily: 'var(--font-instrument, "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif)',
              fontWeight: 700,
              color: letterColor,
              lineHeight: 1,
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {letter.char}
          </motion.div>
        );
      })}
    </div>
  );
}

export default FallingLetters;
