"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

interface FallingLettersProps {
  isReady?: boolean;
  text?: string;
  className?: string;
  textSize?: number;
}

export function FallingLetters({
  isReady = true,
  text = "HELLO",
  className,
  textSize = 560
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
      Runner = Matter.Runner,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    engineRef.current = engine;

    // Standard gravity
    engine.gravity.y = 1;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // -------------------------------------------------------------------------
    // WALLS & GROUND
    // Precise screen borders as colliders
    // -------------------------------------------------------------------------
    const wallThickness = 200;

    // Ground - exactly at bottom edge
    const ground = Bodies.rectangle(
      containerWidth / 2,
      containerHeight + (wallThickness / 2),
      containerWidth, // EXACTLY width of container
      wallThickness,
      { isStatic: true, label: "Ground", render: { visible: false }, friction: 1 }
    );

    // Left Wall - exactly at left edge
    const leftWall = Bodies.rectangle(
      0 - (wallThickness / 2),
      containerHeight / 2,
      wallThickness,
      containerHeight * 4, // Extra tall to catch high throwers
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
          // Left vertical
          const left = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          // Right vertical
          const right = Bodies.rectangle(x + width / 2 - t / 2, y, t, height, opts);
          // Crossbar
          const cross = Bodies.rectangle(x, y, width - 2 * t, t, opts);
          return Body.create({
            parts: [left, right, cross],
            ...opts
          });
        }

        case 'E': {
          // E: One vertical spine, three horizontal arms
          // Spine (left)
          const spine = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          // Top arm
          const top = Bodies.rectangle(x + t / 2, y - height / 2 + t / 2, width - t, t, opts);
          // Middle arm
          const mid = Bodies.rectangle(x + t / 2, y, width - t * 1.2, t, opts);
          // Bottom arm
          const bot = Bodies.rectangle(x + t / 2, y + height / 2 - t / 2, width - t, t, opts);
          return Body.create({
            parts: [spine, top, mid, bot],
            ...opts
          });
        }

        case 'L': {
          // L: Vertical spine, bottom arm
          // Spine (left)
          const spine = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          // Bottom arm
          const bot = Bodies.rectangle(x + t / 2, y + height / 2 - t / 2, width - t, t, opts);
          return Body.create({
            parts: [spine, bot],
            ...opts
          });
        }

        case 'O': {
          // O: Circle approximation
          // Since we can't easily do a hollow circle without many parts, 
          // a simple polygon (chamfered rectangle) or circle is best.
          // A circle rolls too much. A chamfered box is okay.
          // Let's try 8-sided polygon for an 'O' shape to roll a bit but settle.
          // Or just a standard rectangle for stability since text O is often boxy in some fonts?
          // User requested precise colliders. A hollow O is best approximated by 4 bars 
          // if we really want "in-hole" interaction, OR just a solid circle if not.
          // Text rendering is usually solid. Let's make a hollow O box!

          // Top
          const top = Bodies.rectangle(x, y - height / 2 + t / 2, width, t, opts);
          // Bottom
          const bot = Bodies.rectangle(x, y + height / 2 - t / 2, width, t, opts);
          // Left
          const left = Bodies.rectangle(x - width / 2 + t / 2, y, t, height, opts);
          // Right
          const right = Bodies.rectangle(x + width / 2 - t / 2, y, t, height, opts);

          return Body.create({
            parts: [top, bot, left, right],
            ...opts
          });
        }

        default:
          // Default box for other chars
          return Bodies.rectangle(x, y, width, height, opts);
      }
    };


    // -------------------------------------------------------------------------
    // SPAWN LETTERS
    // -------------------------------------------------------------------------
    const validLetterNodes = lettersRef.current.filter(n => n !== null);

    const bodiesWithNodes = validLetterNodes.map((node, i) => {
      if (!node) return null;

      const rect = node.getBoundingClientRect();
      // Use rendering dimensions for physics body
      // Adjust width slightly down for tidier collision (font whitespace)
      const physWidth = rect.width * 0.85;
      const physHeight = rect.height * 0.85;

      // CONSTRAINED LEFT SPAWN
      // Never spawn outside: spawn x must be > width/2
      // Max spawn x is containerWidth * 0.4
      const minX = physWidth / 2 + 50; // padding from wall
      const maxX = Math.max(minX + 10, containerWidth * 0.35);

      const startX = minX + Math.random() * (maxX - minX);
      const startY = -physHeight - (Math.random() * 800) - (i * 300); // Staggered higher

      const char = node.textContent || "?";
      const body = createLetterBody(startX, startY, char, physWidth, physHeight);

      // Random initial rotation
      Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.5);

      return { body, node, width: rect.width, height: rect.height };
    }).filter(item => item !== null) as { body: Matter.Body, node: HTMLDivElement, width: number, height: number }[];

    if (bodiesWithNodes.length > 0) {
      World.add(engine.world, bodiesWithNodes.map(b => b.body));
    }

    // -------------------------------------------------------------------------
    // MOUSE CONTROL
    // -------------------------------------------------------------------------
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        render: { visible: false }
      }
    });

    mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);

    World.add(engine.world, mouseConstraint);

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
  }, [mounted, isReady, text, textSize]);

  if (!mounted || !isReady) return null;

  const containerClass = className || "fixed inset-0 z-[1] overflow-hidden pointer-events-none";

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
            className="absolute top-0 left-0 font-extrabold leading-none cursor-grab active:cursor-grabbing will-change-transform pointer-events-auto select-none"
            style={{
              fontSize: `${textSize}px`,
              opacity: 0,
              visibility: 'hidden',
              fontFamily: 'var(--font-instrument, "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif)',
              color: '#000000',
              whiteSpace: 'nowrap',
              lineHeight: 0.8,
              fontWeight: 900
            }}
          >
            {char}
          </div>
        );
      })}
      <style jsx>{`
        div[class*="dark"] .cursor-grab {
          color: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>
    </div>
  );
}

export default FallingLetters;
