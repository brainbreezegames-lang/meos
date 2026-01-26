"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

interface FallingLettersProps {
  isReady?: boolean;
  text?: string;
  className?: string;
  textSize?: number;
  showColliders?: boolean; // DEBUG: show red collider outlines
}

export function FallingLetters({
  isReady = true,
  text = "HELLO",
  className,
  textSize = 280,
  showColliders = true // Set to true for debugging
}: FallingLettersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [mounted, setMounted] = useState(false);

  const items = React.useMemo(() => [...text.split(''), 'HEAD'], [text]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isReady || !containerRef.current) return;

    const cleanup = () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }
    };
    cleanup();

    const { Engine, World, Bodies, Body, Runner, Vertices } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;

    engine.gravity.y = 1;
    // Optimized iterations - balance between accuracy and performance
    engine.positionIterations = 10;
    engine.velocityIterations = 8;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const wallThickness = 200;

    const ground = Bodies.rectangle(
      containerWidth / 2,
      containerHeight + wallThickness / 2,
      containerWidth * 2,
      wallThickness,
      { isStatic: true, friction: 0.8, restitution: 0.1 }
    );

    const leftWall = Bodies.rectangle(
      -wallThickness / 2,
      containerHeight / 2,
      wallThickness,
      containerHeight * 3,
      { isStatic: true, friction: 0.3 }
    );

    const rightWall = Bodies.rectangle(
      containerWidth * 0.5 + wallThickness / 2,
      containerHeight / 2,
      wallThickness,
      containerHeight * 3,
      { isStatic: true, friction: 0.3 }
    );

    World.add(engine.world, [ground, leftWall, rightWall]);

    // Create precise letter colliders using vertices
    const createLetterBody = (x: number, y: number, char: string, w: number, h: number) => {
      const opts = {
        restitution: 0.05,
        friction: 0.6,
        frictionStatic: 0.8,
        density: 0.002,
        slop: 0.01,
      };

      // Stroke thickness relative to letter size (serif font ~20%)
      const t = w * 0.20;

      if (char === 'HEAD') {
        // Perfect circle for the head
        return Bodies.circle(x, y, w * 0.45, opts);
      }

      switch (char.toUpperCase()) {
        case 'H': {
          // H shape: two verticals + crossbar
          // Using fromVertices for precise shape
          const hw = w / 2;
          const hh = h / 2;
          const st = t / 2; // half stroke

          const hVerts = [
            // Left vertical (going clockwise from top-left)
            { x: -hw, y: -hh },
            { x: -hw + t, y: -hh },
            { x: -hw + t, y: -st },
            // Crossbar top
            { x: hw - t, y: -st },
            { x: hw - t, y: -hh },
            // Right vertical top
            { x: hw, y: -hh },
            { x: hw, y: hh },
            { x: hw - t, y: hh },
            { x: hw - t, y: st },
            // Crossbar bottom
            { x: -hw + t, y: st },
            { x: -hw + t, y: hh },
            { x: -hw, y: hh },
          ];

          return Bodies.fromVertices(x, y, [hVerts], opts);
        }

        case 'E': {
          // E shape: spine + three arms
          const hw = w / 2;
          const hh = h / 2;
          const armLen = w * 0.75;

          const eVerts = [
            // Start top-left, go clockwise
            { x: -hw, y: -hh },
            { x: -hw + armLen, y: -hh },
            { x: -hw + armLen, y: -hh + t },
            { x: -hw + t, y: -hh + t },
            // Down to middle arm
            { x: -hw + t, y: -t/2 },
            { x: -hw + armLen * 0.7, y: -t/2 },
            { x: -hw + armLen * 0.7, y: t/2 },
            { x: -hw + t, y: t/2 },
            // Down to bottom arm
            { x: -hw + t, y: hh - t },
            { x: -hw + armLen, y: hh - t },
            { x: -hw + armLen, y: hh },
            { x: -hw, y: hh },
          ];

          return Bodies.fromVertices(x, y, [eVerts], opts);
        }

        case 'L': {
          // L shape: vertical + horizontal
          const hw = w / 2;
          const hh = h / 2;
          const armLen = w * 0.8;

          const lVerts = [
            { x: -hw, y: -hh },
            { x: -hw + t, y: -hh },
            { x: -hw + t, y: hh - t },
            { x: -hw + armLen, y: hh - t },
            { x: -hw + armLen, y: hh },
            { x: -hw, y: hh },
          ];

          return Bodies.fromVertices(x, y, [lVerts], opts);
        }

        case 'O': {
          // O is best as a circle for smooth rolling
          return Bodies.circle(x, y, Math.min(w, h) * 0.45, opts);
        }

        default:
          return Bodies.rectangle(x, y, w * 0.9, h * 0.9, opts);
      }
    };

    const validLetterNodes = lettersRef.current.filter(n => n !== null);

    const bodiesWithNodes = validLetterNodes.map((node, i) => {
      if (!node) return null;

      const rect = node.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();

      const physWidth = rect.width;
      const physHeight = rect.height;

      const minX = physWidth / 2 + 30;
      const maxX = Math.max(minX + 50, containerWidth * 0.3);

      const startX = minX + Math.random() * (maxX - minX);
      const startY = -physHeight - (Math.random() * 400) - (i * 250);

      const char = node.getAttribute('data-char') || "?";
      const body = createLetterBody(startX, startY, char, physWidth, physHeight);

      if (body) {
        Body.setAngle(body, (Math.random() - 0.5) * 0.3);
      }

      return body ? { body, node, width: physWidth, height: physHeight, char } : null;
    }).filter(item => item !== null) as { body: Matter.Body, node: HTMLDivElement, width: number, height: number, char: string }[];

    if (bodiesWithNodes.length > 0) {
      World.add(engine.world, bodiesWithNodes.map(b => b.body));
    }

    const runner = Runner.create({ delta: 1000 / 60 });
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Debug canvas for collider visualization
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx && showColliders) {
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    }

    let requestID: number;
    const updateLoop = () => {
      // Update letter positions
      bodiesWithNodes.forEach(({ body, node, width, height }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        node.style.transform = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0) rotate(${angle}rad)`;
        node.style.opacity = '1';
        node.style.visibility = 'visible';
      });

      // Draw colliders in red for debugging
      if (ctx && showColliders && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';

        bodiesWithNodes.forEach(({ body }) => {
          const parts = body.parts;

          parts.forEach((part, partIndex) => {
            // Skip the parent compound body (index 0 for compound bodies)
            if (parts.length > 1 && partIndex === 0) return;

            const vertices = part.vertices;

            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);

            for (let j = 1; j < vertices.length; j++) {
              ctx.lineTo(vertices[j].x, vertices[j].y);
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });
        });

        // Draw walls for reference
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;

        // Ground line
        ctx.beginPath();
        ctx.moveTo(0, containerHeight);
        ctx.lineTo(containerWidth, containerHeight);
        ctx.stroke();

        // Right wall
        ctx.beginPath();
        ctx.moveTo(containerWidth * 0.5, 0);
        ctx.lineTo(containerWidth * 0.5, containerHeight);
        ctx.stroke();
      }

      requestID = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      cancelAnimationFrame(requestID);
      cleanup();
    };
  }, [mounted, isReady, items, textSize, showColliders]);

  if (!mounted || !isReady) return null;

  const containerClass = className || "fixed inset-0 z-0 overflow-hidden pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      aria-hidden="true"
    >
      {/* Debug canvas for collider visualization */}
      {showColliders && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 9999 }}
        />
      )}

      {items.map((item, i) => {
        if (item === ' ') return null;

        return (
          <div
            key={i}
            ref={(el) => { lettersRef.current[i] = el; }}
            data-char={item}
            className="absolute top-0 left-0 leading-none will-change-transform pointer-events-none select-none"
            style={{
              fontSize: `${textSize}px`,
              opacity: 0,
              visibility: 'hidden',
              fontFamily: 'var(--font-averia), Georgia, serif',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              lineHeight: 0.85,
              fontWeight: 700,
              ...(item === 'HEAD' && {
                width: `${textSize}px`,
                height: `${textSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })
            }}
          >
            {item === 'HEAD' ? (
              <img
                src="/zinoHead.svg"
                alt=""
                style={{
                  width: '90%',
                  height: '90%',
                  objectFit: 'contain',
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
