'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

interface LetterBody {
  id: string;
  letter: string;
  body: Matter.Body;
  scale: number;
}

interface FallingLettersProps {
  isReady?: boolean; // Only show after boot is complete
}

// Letter configuration - g and o lowercase, O and S uppercase
const LETTERS = [
  { char: 'g', scale: 1.0 },
  { char: 'o', scale: 0.9 },
  { char: 'O', scale: 1.05 },
  { char: 'S', scale: 1.0 },
];

export function FallingLetters({ isReady = true }: FallingLettersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const letterBodiesRef = useRef<LetterBody[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number; angle: number } }>({});
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [settled, setSettled] = useState(false);
  const rafRef = useRef<number | null>(null);
  const settleCheckRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

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

  // Initialize physics
  const initPhysics = useCallback(() => {
    if (!containerRef.current || hasInitialized.current) return;
    hasInitialized.current = true;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Subtle letter size - much smaller than before
    const baseSize = Math.min(height * 0.35, width * 0.25);

    // Create engine with normal gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.5 },
    });
    engineRef.current = engine;

    // Wall thickness
    const wallThickness = 100;

    // Ground at bottom
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 10,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true, friction: 0.9, restitution: 0.05 }
    );

    // Left wall
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2 + 10,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { isStatic: true, friction: 0.8 }
    );

    // Right wall - at 55% of screen to keep letters on left
    const rightWall = Matter.Bodies.rectangle(
      width * 0.55 + wallThickness / 2,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { isStatic: true, friction: 0.8 }
    );

    // Top wall - keeps letters from escaping
    const topWall = Matter.Bodies.rectangle(
      width / 2,
      -wallThickness / 2,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true }
    );

    Matter.Composite.add(engine.world, [ground, leftWall, rightWall, topWall]);

    // Create letter bodies - START INSIDE THE SCREEN
    const letterBodies: LetterBody[] = LETTERS.map((letter, index) => {
      const size = baseSize * letter.scale;

      // Start positions INSIDE the visible area - spread across left portion
      const margin = size * 0.6;
      const availableWidth = width * 0.45 - margin * 2;
      const startX = margin + (availableWidth / (LETTERS.length + 1)) * (index + 1) + (Math.random() - 0.5) * 50;
      const startY = 100 + Math.random() * 100; // Start near top but inside screen

      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        size * 0.55,
        size * 0.75,
        {
          restitution: 0.1,
          friction: 0.8,
          frictionAir: 0.02,
          frictionStatic: 0.9,
          mass: 100,
          angle: (Math.random() - 0.5) * 0.15,
          chamfer: { radius: size * 0.03 },
        }
      );

      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.01);

      return {
        id: `letter-${index}`,
        letter: letter.char,
        body,
        scale: letter.scale,
      };
    });

    letterBodiesRef.current = letterBodies;
    Matter.Composite.add(engine.world, letterBodies.map(lb => lb.body));

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

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

    // Check if settled
    settleCheckRef.current = setInterval(() => {
      const allSettled = letterBodiesRef.current.every(lb => {
        const velocity = lb.body.velocity;
        const angularVelocity = lb.body.angularVelocity;
        return Math.abs(velocity.x) < 0.05 &&
               Math.abs(velocity.y) < 0.05 &&
               Math.abs(angularVelocity) < 0.005;
      });

      if (allSettled) {
        setSettled(true);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (runnerRef.current) {
          Matter.Runner.stop(runnerRef.current);
        }
        if (settleCheckRef.current) {
          clearInterval(settleCheckRef.current);
          settleCheckRef.current = null;
        }
      }
    }, 500);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (settleCheckRef.current) {
      clearInterval(settleCheckRef.current);
      settleCheckRef.current = null;
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
    setSettled(false);
    hasInitialized.current = false;
  }, []);

  // Mount
  useEffect(() => {
    setMounted(true);
    return () => cleanup();
  }, [cleanup]);

  // Initialize only when ready (after boot)
  useEffect(() => {
    if (mounted && isReady && !hasInitialized.current) {
      const timer = setTimeout(() => {
        initPhysics();
      }, 300); // Small delay after boot completes
      return () => clearTimeout(timer);
    }
  }, [mounted, isReady, initPhysics]);

  // Handle resize
  useEffect(() => {
    if (!isReady) return;

    const handleResize = () => {
      cleanup();
      setTimeout(() => initPhysics(), 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cleanup, initPhysics, isReady]);

  // Don't render until ready
  if (!mounted || !isReady) return null;

  // Subtle letter size for rendering
  const baseSize = Math.min(window.innerHeight * 0.35, window.innerWidth * 0.25);

  // Subtle color - semi-transparent
  const letterColor = isDark
    ? 'rgba(240, 236, 228, 0.12)' // Very subtle light in dark mode
    : 'rgba(23, 20, 18, 0.08)';   // Very subtle dark in light mode

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
        zIndex: 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {letterBodiesRef.current.map((lb) => {
        const pos = positions[lb.id];
        if (!pos) return null;

        const size = baseSize * lb.scale;

        return (
          <div
            key={lb.id}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) rotate(${pos.angle}rad)`,
              fontSize: size,
              fontFamily: 'var(--font-instrument, "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif)',
              fontWeight: 600, // Lighter weight
              color: letterColor,
              lineHeight: 1,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              willChange: settled ? 'auto' : 'transform',
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
