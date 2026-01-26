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

  // Combine text characters with the special head item
  const items = React.useMemo(() => [...text.split(''), 'HEAD'], [text]);

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
        restitution: 0.1, // Almost no bounce
        friction: 1,      // maximal friction to stop sliding/interpenetration
        frictionStatic: 1,
        density: 1,       // Very heavy
        label: char,
        slop: 0.05        // Reduce slop to force hard collisions
      };

      // SPECIAL ZINO HEAD -> CIRCLE COLLIDER
      if (char === 'HEAD') {
        // Using a circle collider roughly fitting the O is the best "perfect" interaction.
        // Circle radius = width / 2
        return Bodies.circle(x, y, width / 2, opts);
      }

      // Averia Serif is organic and thinner than a slab serif.
      // Thickness of the strokes is roughly 15-18% of the width.
      const t = width * 0.18;
      const serifWidth = t * 2.5;
      const serifHeight = t * 0.6;

      switch (char.toUpperCase()) {
        case 'H': {
          // H: Two verticals + Crossbar + 4 Serifs
          const leftX = x - width / 2 + t / 2;
          const rightX = x + width / 2 - t / 2;

          // Vertical bars (slightly shorter to make room for serif height if we wanted exactness, but overlapping is safer)
          const left = Bodies.rectangle(leftX, y, t, height, opts);
          const right = Bodies.rectangle(rightX, y, t, height, opts);
          const cross = Bodies.rectangle(x, y, width - 2 * t, t * 0.8, opts); // Crossbar is usually thinner

          // Serifs (Top-Left, Bottom-Left, Top-Right, Bottom-Right)
          const tl = Bodies.rectangle(leftX, y - height / 2 + serifHeight / 2, serifWidth, serifHeight, opts);
          const bl = Bodies.rectangle(leftX, y + height / 2 - serifHeight / 2, serifWidth, serifHeight, opts);
          const tr = Bodies.rectangle(rightX, y - height / 2 + serifHeight / 2, serifWidth, serifHeight, opts);
          const br = Bodies.rectangle(rightX, y + height / 2 - serifHeight / 2, serifWidth, serifHeight, opts);

          return Body.create({ parts: [left, right, cross, tl, bl, tr, br], ...opts });
        }
        case 'E': {
          // E: Spine + 3 Arms + Serifs
          const spineX = x - width / 2 + t / 2;

          const spine = Bodies.rectangle(spineX, y, t, height, opts);

          // Arms - Top, Middle, Bottom
          // Use width * 0.9 for arms to account for visual length
          const top = Bodies.rectangle(x + t / 2, y - height / 2 + t / 2, width - t, t, opts);
          const mid = Bodies.rectangle(x + t / 2, y, width - t * 1.5, t * 0.9, opts); // Middle arm often shorter/thinner
          const bot = Bodies.rectangle(x + t / 2, y + height / 2 - t / 2, width - t, t, opts);

          // Serifs on Spine (Top and Bottom left) extend leftwards? Actually Averia E has serifs on the right tips of arms
          // Vertical serifs at end of arms
          const armSerifH = t * 2.5;
          const armSerifW = t * 0.6;

          const topSerif = Bodies.rectangle(x + width / 2 - armSerifW / 2, y - height / 2 + armSerifH / 2, armSerifW, armSerifH, opts);
          const botSerif = Bodies.rectangle(x + width / 2 - armSerifW / 2, y + height / 2 - armSerifH / 2, armSerifW, armSerifH, opts);
          // Main spine serifs (top/bottom left)
          const spineTopSerif = Bodies.rectangle(spineX, y - height / 2 + serifHeight / 2, serifWidth, serifHeight, opts);
          const spineBotSerif = Bodies.rectangle(spineX, y + height / 2 - serifHeight / 2, serifWidth, serifHeight, opts);

          return Body.create({ parts: [spine, top, mid, bot, topSerif, botSerif, spineTopSerif, spineBotSerif], ...opts });
        }
        case 'L': {
          // L: Spine + Bottom Arm
          const spineX = x - width / 2 + t / 2;

          const spine = Bodies.rectangle(spineX, y, t, height, opts);
          const bot = Bodies.rectangle(x + t / 2, y + height / 2 - t / 2, width - t, t, opts);

          // Serifs
          const spineTopSerif = Bodies.rectangle(spineX, y - height / 2 + serifHeight / 2, serifWidth, serifHeight, opts);
          const spineBotSerif = Bodies.rectangle(spineX, y + height / 2 - serifHeight / 2, serifWidth, serifHeight, opts); // Corner serif

          // End of arm serif (vertical blip)
          const armSerifH = t * 2.5;
          const armSerifW = t * 0.6;
          const armTipSerif = Bodies.rectangle(x + width / 2 - armSerifW / 2, y + height / 2 - armSerifH / 2, armSerifW, armSerifH, opts);

          return Body.create({ parts: [spine, bot, spineTopSerif, spineBotSerif, armTipSerif], ...opts });
        }
        case 'O': {
          // O: Use a Circle for natural rolling behavior and to prevent internal sticking.
          return Bodies.circle(x, y, width / 2, opts);
        }
        default:
          return Bodies.rectangle(x, y, width, height, opts);
      }
    };


    // Create bodies for each letter
    const validLetterNodes = lettersRef.current.filter(n => n !== null);

    // We must ensure the filtering of refs matches our items list logic
    // Refs are assigned by index. If ' ' return null in map, that index is skipped in ref array assignment?
    // No, if map returns null, the index 'i' in map still increments, so refs[i] might be undefined if we don't render it?
    // Let's look at the render loop: if char === ' ' return null;
    // So for that index i, no ref callback is called. lettersRef.current[i] will be undefined/null.
    // So filtering n !== null works.

    const bodiesWithNodes = validLetterNodes.map((node, i) => {
      if (!node) return null;

      const rect = node.getBoundingClientRect();
      const physWidth = rect.width;
      const physHeight = rect.height;

      const minX = physWidth / 2 + 50;
      const maxX = Math.max(minX + 10, containerWidth * 0.35);

      const startX = minX + Math.random() * (maxX - minX);
      const startY = -physHeight - (Math.random() * 800) - (i * 300);

      // Determine char identity from node. For the Head, we tag it in dataset or just check content
      // But we can also access the 'items' array if we are careful about index alignment.
      // Filtering ' ' out of validLetterNodes makes indices disjoint from 'items'.
      // Better to read attribute from DOM.
      const char = node.getAttribute('data-char') || node.textContent || "?";

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
  }, [mounted, isReady, items, textSize]); // Depend on items now

  if (!mounted || !isReady) return null;

  const containerClass = className || "fixed inset-0 z-0 overflow-hidden pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      aria-hidden="true"
    >
      {items.map((item, i) => {
        if (item === ' ') return null;

        return (
          <div
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            data-char={item}
            className="absolute top-0 left-0 font-extrabold leading-none will-change-transform pointer-events-none select-none"
            style={{
              fontSize: `${textSize}px`,
              opacity: 0,
              visibility: 'hidden',
              // Font stack matching design system - using Averia Serif Libre as requested
              fontFamily: 'var(--font-averia), Georgia, serif',
              color: 'var(--text-primary)', // CSS variable handles instant theme switching
              whiteSpace: 'nowrap',
              lineHeight: 0.8,
              fontWeight: 700, // Bold for Averia
              ...(item === 'HEAD' && {
                width: '1em',
                height: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })
            }}
          >
            {item === 'HEAD' ? (
              // Zino Head SVG
              <img
                src="/zinoHead.svg"
                alt="Head"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%'
                }}
              />
            ) : (
              item
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FallingLetters;
