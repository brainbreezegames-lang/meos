'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, REDUCED_MOTION, DURATION } from '@/lib/animations';

// ============================================================================
// SPARKLE BURST - A celebratory particle effect
// ============================================================================

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

interface SparkleConfig {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  spread?: number;
  duration?: number;
}

const DEFAULT_SPARKLE_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#A78BFA', // Purple
  '#F472B6', // Pink
  '#FBBF24', // Amber
];

export function SparkleEffect({
  trigger,
  config = {},
  className = '',
}: {
  trigger: boolean;
  config?: SparkleConfig;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const {
    count = 12,
    colors = DEFAULT_SPARKLE_COLORS,
    minSize = 4,
    maxSize = 10,
    spread = 60,
    duration = 600,
  } = config;

  useEffect(() => {
    if (trigger && !prefersReducedMotion) {
      const newSparkles: Sparkle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * spread * 2,
        y: (Math.random() - 0.5) * spread * 2,
        size: minSize + Math.random() * (maxSize - minSize),
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setSparkles(newSparkles);

      const timeout = setTimeout(() => {
        setSparkles([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [trigger, prefersReducedMotion, count, colors, minSize, maxSize, spread, duration]);

  if (prefersReducedMotion) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute left-1/2 top-1/2"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: sparkle.x,
              y: sparkle.y,
              scale: [0, 1.2, 0.8],
              rotate: sparkle.rotation,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: duration / 1000,
              ease: [0.23, 1, 0.32, 1],
            }}
            style={{
              width: sparkle.size,
              height: sparkle.size,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={sparkle.color}
              style={{ width: '100%', height: '100%' }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// CONFETTI BURST - For major celebrations
// ============================================================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
  size: number;
  shape: 'square' | 'circle' | 'triangle';
}

export function ConfettiBurst({
  trigger,
  count = 30,
  colors = DEFAULT_SPARKLE_COLORS,
  duration = 1200,
}: {
  trigger: boolean;
  count?: number;
  colors?: string[];
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger && !prefersReducedMotion) {
      const shapes: ConfettiPiece['shape'][] = ['square', 'circle', 'triangle'];
      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 200,
        y: -100 - Math.random() * 100,
        rotation: Math.random() * 720 - 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
        size: 6 + Math.random() * 6,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      }));

      setPieces(newPieces);

      const timeout = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [trigger, prefersReducedMotion, count, colors, duration]);

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute left-1/2 top-1/3"
            initial={{
              x: 0,
              y: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: piece.x,
              y: [0, piece.y, 300],
              rotate: piece.rotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: duration / 1000,
              delay: piece.delay,
              ease: [0.23, 1, 0.32, 1],
              y: {
                duration: duration / 1000,
                ease: [0.25, 0.46, 0.45, 0.94],
              },
            }}
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'triangle' ? '0' : '2px',
              clipPath: piece.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUCCESS CHECKMARK - Animated check with optional sparkles
// ============================================================================

export function SuccessCheck({
  show,
  size = 24,
  color = 'currentColor',
  withSparkles = false,
}: {
  show: boolean;
  size?: number;
  color?: string;
  withSparkles?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative inline-flex items-center justify-center">
      {withSparkles && <SparkleEffect trigger={show} config={{ count: 8, spread: 40 }} />}

      <AnimatePresence mode="wait">
        {show && (
          <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.bouncy}
          >
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M7 12l3.5 3.5L17 9"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={prefersReducedMotion ? REDUCED_MOTION.transition : {
                duration: DURATION.normal,
                delay: 0.1,
                ease: [0.65, 0, 0.35, 1],
              }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// RIPPLE EFFECT - Touch/click feedback
// ============================================================================

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in event) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const ripple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, ripple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);
  }, [prefersReducedMotion]);

  const RippleContainer = useCallback(({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) => (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ borderRadius: 'inherit' }}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  ), [ripples]);

  return { createRipple, RippleContainer, containerRef };
}

// ============================================================================
// PULSE GLOW - Subtle attention-grabbing effect
// ============================================================================

export function PulseGlow({
  color = 'var(--accent-primary)',
  size = 100,
  duration = 2,
}: {
  color?: string;
  size?: number;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        opacity: 0.3,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.15, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ============================================================================
// SHAKE ANIMATION - For errors or attention
// ============================================================================

export function useShake() {
  const [isShaking, setIsShaking] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const shake = useCallback(() => {
    if (prefersReducedMotion) return;
    setIsShaking(true);
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    setTimeout(() => setIsShaking(false), 500);
  }, [prefersReducedMotion]);

  const shakeAnimation = isShaking
    ? {
        x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.5 },
      }
    : {};

  return { shake, shakeAnimation, isShaking };
}

// ============================================================================
// HAPTIC FEEDBACK - Unified haptic helper
// ============================================================================

export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (!('vibrate' in navigator)) return;

  const patterns: Record<typeof type, number | number[]> = {
    light: 5,
    medium: 10,
    heavy: 20,
    success: [5, 50, 10],
    error: [50, 30, 50],
  };

  navigator.vibrate(patterns[type]);
}

// ============================================================================
// EASTER EGG: KONAMI CODE
// ============================================================================

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode(callback: () => void) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const expectedKey = KONAMI_CODE[index];

      if (key === expectedKey) {
        if (index === KONAMI_CODE.length - 1) {
          callback();
          setIndex(0);
        } else {
          setIndex(index + 1);
        }
      } else {
        setIndex(key === KONAMI_CODE[0] ? 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, callback]);
}

// ============================================================================
// FLOATING ANIMATION - For empty states
// ============================================================================

export function FloatingElement({
  children,
  amplitude = 8,
  duration = 3,
}: {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
