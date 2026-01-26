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

    // Letter size - BIG (was 0.7, now ~1.0 for 2x effect)
    const baseSize = Math.min(height * 1.0, width * 0.7);

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5 },
    });
    engineRef.current = engine;

    const wallThickness = 100;

    // Ground at bottom
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 30,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true, friction: 0.95, restitution: 0.02 }
    );

    // Left wall
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2 + 30,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { isStatic: true, friction: 0.9 }
    );

    // Right wall - at 60% of screen
    const rightWall = Matter.Bodies.rectangle(
      width * 0.6 + wallThickness / 2,
      height / 2,
      wallThickness,
      height + wallThickness * 2,
      { isStatic: true, friction: 0.9 }
    );

    // Top wall
    const topWall = Matter.Bodies.rectangle(
      width / 2,
      -wallThickness / 2,
      width + wallThickness * 2,
      wallThickness,
      { isStatic: true }
    );

    Matter.Composite.add(engine.world, [ground, leftWall, rightWall, topWall]);

    // Create letter bodies - RANDOM positions each time, clustered together
    const letterBodies: LetterBody[] = LETTERS.map((letter, index) => {
      const size = baseSize * letter.scale;

      // Random X position in left portion of screen (clustered, not spread)
      const startX = 100 + Math.random() * (width * 0.35);
      // Random Y position near top
      const startY = 60 + Math.random() * 120;

      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        size * 0.5,
        size * 0.7,
        {
          restitution: 0.02,
          friction: 0.95,
          frictionAir: 0.05,
          frictionStatic: 0.95,
          mass: 200,
          angle: (Math.random() - 0.5) * 0.1, // Slight random angle
          chamfer: { radius: size * 0.02 },
          isStatic: true,
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

    // Show letters immediately (static)
    const initialPositions: { [key: string]: { x: number; y: number; angle: number } } = {};
    letterBodies.forEach((lb) => {
      initialPositions[lb.id] = {
        x: lb.body.position.x,
        y: lb.body.position.y,
        angle: lb.body.angle,
      };
    });
    setPositions(initialPositions);
    setVisible(true);

    // DELAY before starting the fall
    setTimeout(() => {
      // Make bodies dynamic (start falling)
      letterBodies.forEach((lb) => {
        Matter.Body.setStatic(lb.body, false);
        // Add tiny random rotation for natural look
        Matter.Body.setAngularVelocity(lb.body, (Math.random() - 0.5) * 0.005);
      });

      // Start the runner
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

      // Check if settled
      settleCheckRef.current = setInterval(() => {
        const allSettled = letterBodiesRef.current.every(lb => {
          const velocity = lb.body.velocity;
          const angularVelocity = lb.body.angularVelocity;
          return Math.abs(velocity.x) < 0.03 &&
                 Math.abs(velocity.y) < 0.03 &&
                 Math.abs(angularVelocity) < 0.003;
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
    }, 800); // 800ms delay before falling starts

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
      }, 200);
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
  if (!mounted || !isReady || !visible) return null;

  // Letter size for rendering - BIG
  const baseSize = Math.min(window.innerHeight * 1.0, window.innerWidth * 0.7);

  // Subtle color
  const letterColor = isDark
    ? 'rgba(240, 236, 228, 0.15)'
    : 'rgba(23, 20, 18, 0.1)';

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
              fontWeight: 600,
              color: letterColor,
              lineHeight: 1,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              willChange: settled ? 'auto' : 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
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
