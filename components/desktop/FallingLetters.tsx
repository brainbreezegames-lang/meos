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
  isReady?: boolean;
}

// Letter configuration - HELLO arranged like OGAKI reference
const LETTERS = [
  { char: 'H', scale: 1.0, column: 0 },
  { char: 'E', scale: 0.85, column: 1 },
  { char: 'L', scale: 0.9, column: 0 },
  { char: 'L', scale: 0.85, column: 1 },
  { char: 'O', scale: 1.0, column: 0 },
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
  const [visible, setVisible] = useState(false);
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

    // Letter size - sized like reference (~300px base)
    const baseSize = Math.min(280, height * 0.35, width * 0.2);

    // Create engine with lower gravity for smoother fall
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.4 },
    });
    engineRef.current = engine;

    const wallThickness = 100;

    // Ground at bottom
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 20,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true, friction: 1, restitution: 0 }
    );

    // Left wall
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { isStatic: true, friction: 1 }
    );

    // Right wall - at 45% of screen to keep letters on left
    const rightWall = Matter.Bodies.rectangle(
      width * 0.45 + wallThickness / 2,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { isStatic: true, friction: 1 }
    );

    Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Create letter bodies - positioned in columns to prevent overlap
    const columnWidth = baseSize * 0.7;
    const letterBodies: LetterBody[] = LETTERS.map((letter, index) => {
      const size = baseSize * letter.scale;

      // X position based on column - spread out to prevent overlap
      const columnOffset = letter.column * columnWidth;
      const startX = 50 + columnOffset + (Math.random() * 20);

      // Y position - stagger start positions
      const startY = -100 - (index * (size * 0.9));

      // Collision box matches visual size closely
      const boxWidth = size * 0.6;
      const boxHeight = size * 0.85;

      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        boxWidth,
        boxHeight,
        {
          restitution: 0,
          friction: 1,
          frictionAir: 0.02,
          frictionStatic: 1,
          mass: 100,
          angle: 0,
          chamfer: { radius: 2 },
        }
      );

      return {
        id: `letter-${index}`,
        letter: letter.char,
        body,
        scale: letter.scale,
      };
    });

    letterBodiesRef.current = letterBodies;
    Matter.Composite.add(engine.world, letterBodies.map(lb => lb.body));

    // Start the runner immediately
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    setVisible(true);

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
    setVisible(false);
    hasInitialized.current = false;
  }, []);

  // Mount
  useEffect(() => {
    setMounted(true);
    return () => cleanup();
  }, [cleanup]);

  // Initialize only when ready
  useEffect(() => {
    if (mounted && isReady && !hasInitialized.current) {
      const timer = setTimeout(() => {
        initPhysics();
      }, 300);
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

  // Don't render until mounted and ready
  if (!mounted || !isReady) return null;

  // Letter size for rendering
  const height = window.innerHeight;
  const width = window.innerWidth;
  const baseSize = Math.min(280, height * 0.35, width * 0.2);

  // Solid color - no transparency, but subtle
  const letterColor = isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.08)';

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
      {visible && letterBodiesRef.current.map((lb) => {
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
              fontWeight: 700,
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
