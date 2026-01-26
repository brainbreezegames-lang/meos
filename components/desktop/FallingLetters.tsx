'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

interface LetterBody {
  id: string;
  letter: string;
  body: Matter.Body;
}

// Letter configuration - g and o lowercase, O and S uppercase
const LETTERS = [
  { char: 'g', scale: 1.0 },
  { char: 'o', scale: 0.85 },
  { char: 'O', scale: 1.1 },
  { char: 'S', scale: 1.05 },
];

// Art direction: Bold warm tones that work with the cream/orange design system
const LETTER_COLORS = [
  '#171412', // warm black - primary text
  '#ff7722', // burnt orange - accent
  '#3d2fa9', // deep purple - secondary accent
  '#171412', // warm black
];

export function FallingLetters() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const letterBodiesRef = useRef<LetterBody[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number; angle: number } }>({});
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark') ||
                          document.body.classList.contains('dark') ||
                          !!document.querySelector('.dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(hasDarkClass || prefersDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // Initialize physics
  const initPhysics = useCallback(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Letter size - massive like the reference
    const baseSize = Math.min(height * 0.45, width * 0.35);

    // Create engine with standard gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 },
    });
    engineRef.current = engine;

    // Ground - slightly below viewport
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + 50,
      width * 2,
      100,
      { isStatic: true, friction: 0.9, restitution: 0.1 }
    );

    // Left wall - prevents letters from going off screen
    const leftWall = Matter.Bodies.rectangle(
      -50,
      height / 2,
      100,
      height * 2,
      { isStatic: true, friction: 0.5 }
    );

    // Invisible right boundary - keeps letters on left side
    const rightBound = Matter.Bodies.rectangle(
      width * 0.55,
      height / 2,
      100,
      height * 2,
      { isStatic: true, friction: 0.5 }
    );

    Matter.Composite.add(engine.world, [ground, leftWall, rightBound]);

    // Create letter bodies
    const letterBodies: LetterBody[] = LETTERS.map((letter, index) => {
      const size = baseSize * letter.scale;

      // Randomized starting positions - spread across left side, above viewport
      const startX = 80 + Math.random() * (width * 0.35);
      const startY = -100 - (index * 200) - Math.random() * 150;

      // Create rectangular body with rounded corners feel
      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        size * 0.7,  // Width approximation for letter
        size * 0.9,  // Height approximation
        {
          restitution: 0.15, // Slight bounce
          friction: 0.8,
          frictionAir: 0.02,
          angle: (Math.random() - 0.5) * 0.3, // Slight initial rotation
          chamfer: { radius: size * 0.08 }, // Rounded corners
        }
      );

      // Add slight initial angular velocity for more dynamic fall
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

      return {
        id: `letter-${index}`,
        letter: letter.char,
        body,
      };
    });

    letterBodiesRef.current = letterBodies;
    Matter.Composite.add(engine.world, letterBodies.map(lb => lb.body));

    // Create runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // Update positions on each frame
    const updatePositions = () => {
      const newPositions: { [key: string]: { x: number; y: number; angle: number } } = {};

      letterBodiesRef.current.forEach((lb) => {
        newPositions[lb.id] = {
          x: lb.body.position.x,
          y: lb.body.position.y,
          angle: lb.body.angle,
        };
      });

      setPositions(newPositions);
      rafRef.current = requestAnimationFrame(updatePositions);
    };

    updatePositions();
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
      runnerRef.current = null;
    }
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      Matter.Composite.clear(engineRef.current.world, false);
      engineRef.current = null;
    }
    letterBodiesRef.current = [];
  }, []);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);

    // Small delay to ensure container is measured
    const timer = setTimeout(() => {
      initPhysics();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [initPhysics, cleanup]);

  // Handle resize - reinitialize physics
  useEffect(() => {
    const handleResize = () => {
      cleanup();
      initPhysics();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cleanup, initPhysics]);

  if (!mounted) return null;

  // Letter size for rendering
  const baseSize = Math.min(window.innerHeight * 0.45, window.innerWidth * 0.35);

  // Colors that adapt to dark mode
  const getLetterColor = (index: number) => {
    if (isDark) {
      // Dark mode: Use warm cream/gold tones
      const darkColors = [
        '#f0ece4', // warm off-white
        '#ff7722', // burnt orange (keep for accent)
        '#c9b896', // champagne gold
        '#f0ece4', // warm off-white
      ];
      return darkColors[index % darkColors.length];
    }
    return LETTER_COLORS[index % LETTER_COLORS.length];
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1, // Behind everything
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {letterBodiesRef.current.map((lb, index) => {
        const pos = positions[lb.id];
        if (!pos) return null;

        const letterScale = LETTERS[index].scale;
        const size = baseSize * letterScale;

        return (
          <div
            key={lb.id}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) rotate(${pos.angle}rad)`,
              fontSize: size,
              fontFamily: 'var(--font-averia, "Averia Serif Libre", Georgia, serif)',
              fontWeight: 700,
              color: getLetterColor(index),
              lineHeight: 1,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              willChange: 'transform',
              // Subtle text shadow for depth
              textShadow: isDark
                ? '0 4px 30px rgba(255, 119, 34, 0.15)'
                : '0 8px 40px rgba(23, 20, 18, 0.08)',
            }}
          >
            {lb.letter}
          </div>
        );
      })}
    </div>
  );
}

export default FallingLetters;
