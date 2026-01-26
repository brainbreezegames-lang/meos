"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
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
  textSize = 120
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
      Runner = Matter.Runner,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    engineRef.current = engine;

    // Standard gravity
    engine.gravity.y = 1;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Boundaries: Ground and Walls
    const ground = Bodies.rectangle(
      containerWidth / 2,
      containerHeight + 100, // positioned center, so +100 means just below viewport
      containerWidth * 2,
      200,
      { isStatic: true, label: "Ground", render: { visible: false } }
    );

    const leftWall = Bodies.rectangle(
      -100,
      containerHeight / 2,
      200,
      containerHeight * 4,
      { isStatic: true, label: "LeftWall", render: { visible: false } }
    );

    const rightWall = Bodies.rectangle(
      containerWidth + 100,
      containerHeight / 2,
      200,
      containerHeight * 4,
      { isStatic: true, label: "RightWall", render: { visible: false } }
    );

    World.add(engine.world, [ground, leftWall, rightWall]);

    // Create bodies for each letter
    const validLetterNodes = lettersRef.current.filter(n => n !== null);

    const bodiesWithNodes = validLetterNodes.map((node, i) => {
      if (!node) return null;

      const rect = node.getBoundingClientRect();
      const spread = Math.min(containerWidth * 0.8, 800);
      const startX = (containerWidth - spread) / 2 + (Math.random() * spread);
      const startY = -rect.height - (Math.random() * 500) - (i * 150); // Staggered fall

      const body = Bodies.rectangle(startX, startY, rect.width, rect.height, {
        restitution: 0.6, // Bounciness
        friction: 0.1,
        density: 0.001,
        angle: (Math.random() - 0.5) * 0.5,
        label: node.textContent || "letter"
      });

      return { body, node, width: rect.width, height: rect.height };
    }).filter(item => item !== null) as { body: Matter.Body, node: HTMLDivElement, width: number, height: number }[];

    if (bodiesWithNodes.length > 0) {
      World.add(engine.world, bodiesWithNodes.map(b => b.body));
    }

    // Add Mouse Interaction
    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        render: { visible: false }
      }
    });

    // Remove default mouse scrolling interference
    // Cast to any because mousewheel event type is missing in some definitions
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
  }, [mounted, isReady, text, textSize]); // Re-init if these change

  if (!mounted || !isReady) return null;

  // Use passed className or default to fixed full screen
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
              // Font stack matching design system
              fontFamily: 'var(--font-instrument, "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif)',
              color: 'rgba(0, 0, 0, 0.1)', // subtle dark by default
              whiteSpace: 'nowrap',
              lineHeight: 0.8
            }}
          >
            {char}
          </div>
        );
      })}
      {/* Dark mode override via style tag or css var - 
          Since we are in a component, let's just use CSS variable if available or simple opacity. 
          The previous component had dark mode logic. Let's try to preserve it via CSS mixing 
      */}
      <style jsx>{`
        div[class*="dark"] .cursor-grab {
          color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

export default FallingLetters;
