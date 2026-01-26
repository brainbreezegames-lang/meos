'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface FallingLettersProps {
  isReady?: boolean;
}

// Letter configuration - positioned at bottom left like OGAKI
const LETTERS = [
  { char: 'H', finalX: 2, finalY: 82, size: 1.0, rotation: -2 },
  { char: 'E', finalX: 15, finalY: 78, size: 0.9, rotation: 3 },
  { char: 'L', finalX: 5, finalY: 55, size: 0.85, rotation: -1 },
  { char: 'L', finalX: 18, finalY: 52, size: 0.85, rotation: 2 },
  { char: 'O', finalX: 8, finalY: 28, size: 0.95, rotation: -3 },
];

function FallingLetter({
  char,
  finalX,
  finalY,
  size,
  rotation,
  delay,
  baseSize,
  letterColor,
  shouldAnimate,
}: {
  char: string;
  finalX: number;
  finalY: number;
  size: number;
  rotation: number;
  delay: number;
  baseSize: number;
  letterColor: string;
  shouldAnimate: boolean;
}) {
  const controls = useAnimation();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (shouldAnimate && !hasStarted.current) {
      hasStarted.current = true;

      // Start the falling animation after delay
      const timer = setTimeout(async () => {
        await controls.start({
          y: `${finalY}vh`,
          rotate: rotation,
          opacity: 1,
          transition: {
            y: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
              mass: 2,
            },
            rotate: {
              type: 'spring',
              stiffness: 80,
              damping: 12,
            },
            opacity: {
              duration: 0.3,
            },
          },
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, controls, finalY, rotation, delay]);

  const fontSize = baseSize * size;

  return (
    <motion.div
      initial={{
        y: '-20vh',
        rotate: rotation + (Math.random() - 0.5) * 20,
        opacity: 0,
      }}
      animate={controls}
      style={{
        position: 'absolute',
        left: `${finalX}vw`,
        fontSize: fontSize,
        fontFamily: 'var(--font-instrument, "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif)',
        fontWeight: 800,
        color: letterColor,
        lineHeight: 0.85,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {char}
    </motion.div>
  );
}

export function FallingLetters({ isReady = true }: FallingLettersProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

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
    if (mounted && isReady) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mounted, isReady]);

  if (!mounted || !isReady) return null;

  // Base size relative to viewport
  const baseSize = Math.min(
    typeof window !== 'undefined' ? window.innerHeight * 0.25 : 250,
    typeof window !== 'undefined' ? window.innerWidth * 0.15 : 200,
    280
  );

  // Solid color - visible but subtle
  const letterColor = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)';

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
      {LETTERS.map((letter, index) => (
        <FallingLetter
          key={`${letter.char}-${index}`}
          char={letter.char}
          finalX={letter.finalX}
          finalY={letter.finalY}
          size={letter.size}
          rotation={letter.rotation}
          delay={index * 120}
          baseSize={baseSize}
          letterColor={letterColor}
          shouldAnimate={shouldAnimate}
        />
      ))}
    </div>
  );
}

export default FallingLetters;
