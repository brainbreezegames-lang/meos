'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

interface LetterBody {
  id: string;
  letter: string;
  body: Matter.Body;
  scale: number;
}

// Letter configuration - g and o lowercase, O and S uppercase
const LETTERS = [
  { char: 'g', scale: 1.0 },
  { char: 'o', scale: 0.85 },
  { char: 'O', scale: 1.1 },
  { char: 'S', scale: 1.05 },
];

export function FallingLetters() {
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

  // Detect dark mode - check the actual theme-sketch dark class
  useEffect(() => {
    const checkDarkMode = () => {
      // Check for .dark class specifically on elements with theme-sketch
      const themeElement = document.querySelector('.theme-sketch');
      const hasDarkClass = themeElement?.classList.contains('dark') || false;
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    // Watch for changes on the theme container
    const observer = new MutationObserver(checkDarkMode);
    const themeElement = document.querySelector('.theme-sketch');
    if (themeElement) {
      observer.observe(themeElement, { attributes: true, attributeFilter: ['class'] });
    }
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, [mounted]);

  // Initialize physics
  const initPhysics = useCallback(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Letter size - 2x bigger than before (was 0.45, now 0.9)
    const baseSize = Math.min(height * 0.9, width * 0.7);

    // Create engine with strong gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 2 }, // Stronger gravity for heavier feel
    });
    engineRef.current = engine;

    // Ground at the bottom of the screen
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + 25, // Just below viewport
      width * 3,
      50,
      {
        isStatic: true,
        friction: 1, // Maximum friction
        restitution: 0.02, // Almost no bounce
      }
    );

    // Left wall
    const leftWall = Matter.Bodies.rectangle(
      -25,
      height / 2,
      50,
      height * 3,
      { isStatic: true, friction: 1 }
    );

    // Right boundary - keeps letters on left 60% of screen
    const rightBound = Matter.Bodies.rectangle(
      width * 0.65,
      height / 2,
      50,
      height * 3,
      { isStatic: true, friction: 1 }
    );

    Matter.Composite.add(engine.world, [ground, leftWall, rightBound]);

    // Create letter bodies with HEAVY mass
    const letterBodies: LetterBody[] = LETTERS.map((letter, index) => {
      const size = baseSize * letter.scale;

      // Starting positions - spread across left side, above viewport
      const startX = 100 + Math.random() * (width * 0.4);
      const startY = -200 - (index * 300) - Math.random() * 200;

      // Create heavy rectangular body
      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        size * 0.65,  // Width approximation for letter
        size * 0.85,  // Height approximation
        {
          restitution: 0.02, // Almost no bounce
          friction: 1, // High friction
          frictionAir: 0.01, // Some air resistance
          frictionStatic: 1, // High static friction to stay in place
          mass: 500, // Very heavy
          angle: (Math.random() - 0.5) * 0.2, // Slight initial rotation
          chamfer: { radius: size * 0.05 },
        }
      );

      // Minimal initial angular velocity
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.02);

      return {
        id: `letter-${index}`,
        letter: letter.char,
        body,
        scale: letter.scale,
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

    // Check if letters have settled (stopped moving)
    settleCheckRef.current = setInterval(() => {
      const allSettled = letterBodiesRef.current.every(lb => {
        const velocity = lb.body.velocity;
        const angularVelocity = lb.body.angularVelocity;
        return Math.abs(velocity.x) < 0.1 &&
               Math.abs(velocity.y) < 0.1 &&
               Math.abs(angularVelocity) < 0.01;
      });

      if (allSettled) {
        setSettled(true);
        // Stop EVERYTHING after settling to save resources
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

  // Letter size for rendering - 2x bigger
  const baseSize = Math.min(window.innerHeight * 0.9, window.innerWidth * 0.7);

  // Single color for all letters - dark in light mode, light in dark mode
  const letterColor = isDark ? '#f0ece4' : '#171412';

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
        zIndex: -1, // Behind EVERYTHING - pure background decoration
        overflow: 'hidden',
        isolation: 'isolate', // Create stacking context
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
