"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

interface FallingLettersProps {
  isReady?: boolean;
  text?: string;
  className?: string; // allow overriding styles
  textSize?: number;
}

export function FallingLetters({
  isReady = true,
  text = "HELLO",
  className,
  textSize = 336
}: FallingLettersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isReady || !containerRef.current) return;

    // cleanup previous instances
    const cleanup = () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }
    };
    cleanup();

    const Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Runner = Matter.Runner;

    const engine = Engine.create();
    engineRef.current = engine;

    // Standard gravity
    engine.gravity.y = 1;

    // HUMAN: High precision to prevent overlap
    engine.positionIterations = 30;
    engine.velocityIterations = 30;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Boundaries: Ground and Walls
    const wallThickness = 200;

    // Ground - exactly at bottom edge
    const ground = Bodies.rectangle(
      containerWidth / 2,
      containerHeight + (wallThickness / 2),
      containerWidth,
      wallThickness,
      { isStatic: true, label: "Ground", render: { visible: false }, friction: 1 }
    );

    // Left Wall - exactly at left edge
    const leftWall = Bodies.rectangle(
      0 - (wallThickness / 2),
      containerHeight / 2,
      wallThickness,
      containerHeight * 4,
      { isStatic: true, label: "LeftWall", render: { visible: false }, friction: 0 }
    );

    // Right Wall - exactly at right edge
    const rightWall = Bodies.rectangle(
      containerWidth + (wallThickness / 2),
      containerHeight / 2,
      wallThickness,
      containerHeight * 4,
      { isStatic: true, label: "RightWall", render: { visible: false }, friction: 0 }
    );

    World.add(engine.world, [ground, leftWall, rightWall]);

    // -------------------------------------------------------------------------
    // CUSTOM LETTER BODIES
    // Helper to create compound bodies for standard sans-serif block letters
    // -------------------------------------------------------------------------
    const createLetterBody = (x: number, y: number, char: string, width: number, height: number) => {
      const opts = {
        restitution: 0.2, // Low bounce for heavy feel
        friction: 0.8,    // High friction for stability
        density: 0.005,   // Heavy
        label: char
      };

      // Thickness of the strokes (approx 25% of width for heavy font)
      const t = width * 0.28;

      switch (char.toUpperCase()) {
        case 'H': {
          // H: Two vertical bars, one horizontal crossbar
          const left = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          const right = Bodies.rectangle(x + width / 2 - t / 2, y, t, height, opts);
          const cross = Bodies.rectangle(x, y, width - 2 * t, t, opts);
          return Body.create({ parts: [left, right, cross], ...opts });
        }
        case 'E': {
          // E: One vertical spine, three horizontal arms
          const spine = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          const top = Bodies.rectangle(x + t / 2, y - height / 2 + t / 2, width - t, t, opts);
          const mid = Bodies.rectangle(x + t / 2, y, width - t * 1.2, t, opts);
          const bot = Bodies.rectangle(x + t / 2, y + height / 2 - t / 2, width - t, t, opts);
          return Body.create({ parts: [spine, top, mid, bot], ...opts });
        }
        case 'L': {
          // L: Vertical spine, bottom arm
          const spine = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          const bot = Bodies.rectangle(x + t / 2, y + height / 2 - t / 2, width - t, t, opts);
          return Body.create({ parts: [spine, bot], ...opts });
        }
        case 'O': {
          // O: Use a Circle for natural rolling behavior and to prevent internal sticking.
          // Using a circle collider roughly fitting the O is the best "perfect" interaction.
          return Bodies.circle(x, y, width / 2, opts);
        }
        default:
          return Bodies.rectangle(x, y, width, height, opts);
      }
    };


    // Create bodies for each letter
    const validLetterNodes = lettersRef.current.filter(n => n !== null);

    const bodiesWithNodes = validLetterNodes.map((node, i) => {
      if (!node) return null;

      const rect = node.getBoundingClientRect();
      // EXACT SIZE MATCHING to preventing overlap
      const physWidth = rect.width;
      const physHeight = rect.height;

      const minX = physWidth / 2 + 50;
      const maxX = Math.max(minX + 10, containerWidth * 0.35);

      const startX = minX + Math.random() * (maxX - minX);
      const startY = -physHeight - (Math.random() * 800) - (i * 300);

      const char = node.textContent || "?";
      const body = createLetterBody(startX, startY, char, physWidth, physHeight);

      // Random initial rotation
      Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);

      return { body, node, width: rect.width, height: rect.height };
    }).filter(item => item !== null) as { body: Matter.Body, node: HTMLDivElement, width: number, height: number }[];

    if (bodiesWithNodes.length > 0) {
      World.add(engine.world, bodiesWithNodes.map(b => b.body));
    }

    // NO MOUSE INTERACTION

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Sync loop
    let requestID: number;
    const updateLoop = () => {
      bodiesWithNodes.forEach(({ body, node, width, height }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        // CSS transform to match physics body
        node.style.transform = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0) rotate(${angle}rad)`;
        node.style.opacity = '1';
        node.style.visibility = 'visible';
      });
      requestID = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      cancelAnimationFrame(requestID);
      cleanup();
    };
  }, [mounted, isReady, text, textSize]); // Re-init if these change

  if (!mounted || !isReady) return null;

  // Use passed className or default to fixed full screen
  // Added z-0 to put it behind other content
  const containerClass = className || "fixed inset-0 z-0 overflow-hidden pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      aria-hidden="true"
    >
      {text.split('').map((char, i) => {
        if (char === ' ') return null;

        return (
          <div
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            // Removed cursor interactivity classes
            className="absolute top-0 left-0 font-extrabold leading-none will-change-transform pointer-events-none select-none"
            style={{
              fontSize: `${textSize}px`,
              opacity: 0,
              visibility: 'hidden',
              // Font stack matching design system - using Outfit as requested for punchier look
              fontFamily: 'var(--font-outfit, "Instrument Sans", sans-serif)',
              color: 'var(--color-text-primary, #000000)', // Use CSS var for auto-dark mode or default black
              whiteSpace: 'nowrap',
              lineHeight: 0.8,
              fontWeight: 900 // EXTRA BOLD / BLACK
            }}
          >
            {char}
          </div>
        );
      })}
      <style jsx>{`
        /* Force white in dark mode if CSS vars aren't enough */
        @media (prefers-color-scheme: dark) {
          .will-change-transform {
             color: #ffffff !important;
          }
        }
        :global(.dark) .will-change-transform {
           color: #ffffff !important;
        }
      `}</style>
      );
}

      export default FallingLetters;
