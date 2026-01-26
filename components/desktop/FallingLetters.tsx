"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

interface FallingLettersProps {
  isReady?: boolean;
  text?: string;
  className?: string;
  textSize?: number;
  showColliders?: boolean;
}

export function FallingLetters({
  isReady = true,
  text = "HELLO",
  className,
  textSize = 280,
  showColliders = true // DEBUG MODE
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

    const { Engine, World, Bodies, Body, Runner, Composite } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;

    engine.gravity.y = 1;
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
      { isStatic: true, friction: 0.8, restitution: 0.05 }
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

    // Create letter colliders - SMALLER than visual to avoid overlap
    const createLetterBody = (x: number, y: number, char: string, w: number, h: number) => {
      const opts: Matter.IBodyDefinition = {
        restitution: 0.05,
        friction: 0.6,
        frictionStatic: 0.8,
        density: 0.002,
        slop: 0.01,
      };

      // Stroke thickness - slightly smaller than visual (~14% of width)
      const t = w * 0.14;
      // Inset from edges
      const inset = w * 0.08;

      if (char === 'HEAD') {
        // Circle SMALLER than image - image is 90% of container, circle is 38%
        const radius = w * 0.38;
        return Bodies.circle(x, y, radius, opts);
      }

      switch (char.toUpperCase()) {
        case 'H': {
          // H = left vertical + right vertical + crossbar
          const hw = w / 2;
          const hh = h / 2;
          const barHeight = h * 0.85; // Shorter than full height

          // Left vertical bar (inset from edge)
          const leftBar = Bodies.rectangle(
            x - hw + inset + t/2,
            y,
            t,
            barHeight,
            opts
          );

          // Right vertical bar (inset from edge)
          const rightBar = Bodies.rectangle(
            x + hw - inset - t/2,
            y,
            t,
            barHeight,
            opts
          );

          // Crossbar (narrower)
          const crossbar = Bodies.rectangle(
            x,
            y,
            w - inset*2 - t*2,
            t * 0.8,
            opts
          );

          return Body.create({
            parts: [leftBar, rightBar, crossbar],
            ...opts
          });
        }

        case 'E': {
          // E = vertical spine + 3 arms
          const hw = w / 2;
          const hh = h / 2;
          const armLength = w * 0.55;
          const spineHeight = h * 0.85;

          // Vertical spine (inset from left)
          const spine = Bodies.rectangle(
            x - hw + inset + t/2,
            y,
            t,
            spineHeight,
            opts
          );

          // Top arm
          const topArm = Bodies.rectangle(
            x - hw + inset + t/2 + armLength/2,
            y - hh + inset + t/2,
            armLength,
            t,
            opts
          );

          // Middle arm (shorter)
          const midArm = Bodies.rectangle(
            x - hw + inset + t/2 + (armLength * 0.7)/2,
            y,
            armLength * 0.7,
            t * 0.75,
            opts
          );

          // Bottom arm
          const botArm = Bodies.rectangle(
            x - hw + inset + t/2 + armLength/2,
            y + hh - inset - t/2,
            armLength,
            t,
            opts
          );

          return Body.create({
            parts: [spine, topArm, midArm, botArm],
            ...opts
          });
        }

        case 'L': {
          // L = vertical spine + bottom arm
          const hw = w / 2;
          const hh = h / 2;
          const armLength = w * 0.55;
          const spineHeight = h * 0.85;

          // Vertical spine (inset)
          const spine = Bodies.rectangle(
            x - hw + inset + t/2,
            y,
            t,
            spineHeight,
            opts
          );

          // Bottom arm
          const botArm = Bodies.rectangle(
            x - hw + inset + t/2 + armLength/2,
            y + hh - inset - t/2,
            armLength,
            t,
            opts
          );

          return Body.create({
            parts: [spine, botArm],
            ...opts
          });
        }

        case 'O': {
          // O = circle SMALLER than the letter outline
          const radius = Math.min(w, h) * 0.36;
          return Bodies.circle(x, y, radius, opts);
        }

        default:
          return Bodies.rectangle(x, y, w * 0.7, h * 0.7, opts);
      }
    };

    const validLetterNodes = lettersRef.current.filter(n => n !== null);

    const bodiesWithNodes = validLetterNodes.map((node, i) => {
      if (!node) return null;

      const rect = node.getBoundingClientRect();
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

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx && showColliders) {
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    }

    let requestID: number;
    const updateLoop = () => {
      bodiesWithNodes.forEach(({ body, node, width, height }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        node.style.transform = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0) rotate(${angle}rad)`;
        node.style.opacity = '1';
        node.style.visibility = 'visible';
      });

      // Draw colliders in red
      if (ctx && showColliders && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';

        bodiesWithNodes.forEach(({ body }) => {
          const parts = body.parts;

          parts.forEach((part, partIndex) => {
            // Skip parent body in compound (index 0)
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

        // Draw boundary lines
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Ground
        ctx.beginPath();
        ctx.moveTo(0, containerHeight);
        ctx.lineTo(containerWidth, containerHeight);
        ctx.stroke();

        // Right wall
        ctx.beginPath();
        ctx.moveTo(containerWidth * 0.5, 0);
        ctx.lineTo(containerWidth * 0.5, containerHeight);
        ctx.stroke();

        ctx.setLineDash([]);
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
