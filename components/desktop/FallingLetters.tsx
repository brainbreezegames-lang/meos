"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

// Custom collider data from the editor (percentages 0-1 of bounding box)
const COLLIDER_DATA: Record<string, Array<{
  type: 'rect' | 'ellipse';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radiusX?: number;
  radiusY?: number;
}>> = {
  "H": [
    { type: "rect", x: 0.26, y: 0.178125, width: 0.13, height: 0.56 },
    { type: "rect", x: 0.335, y: 0.413125, width: 0.295, height: 0.0675 },
    { type: "rect", x: 0.6075, y: 0.178125, width: 0.13249999999999995, height: 0.5650000000000001 }
  ],
  "E": [
    { type: "rect", x: 0.315, y: 0.180625, width: 0.15000000000000002, height: 0.5599999999999999 },
    { type: "rect", x: 0.4325, y: 0.400625, width: 0.2025, height: 0.10250000000000004 },
    { type: "rect", x: 0.4275, y: 0.178125, width: 0.28, height: 0.08249999999999999 },
    { type: "rect", x: 0.425, y: 0.638125, width: 0.30750000000000005, height: 0.10249999999999992 }
  ],
  "L": [
    { type: "rect", x: 0.3325, y: 0.180625, width: 0.13, height: 0.565 },
    { type: "rect", x: 0.3075, y: 0.610625, width: 0.4275, height: 0.14 }
  ],
  "O": [
    { type: "ellipse", x: 0.49, y: 0.465625, radiusX: 0.2825, radiusY: 0.28750000000000003 }
  ],
  "HEAD": [
    { type: "ellipse", x: 0.5, y: 0.5, radiusX: 0.10, radiusY: 0.10 }
  ]
};

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
  textSize = 910, // 2x bigger letters
  showColliders = false // Set to true for debugging colliders
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

    // Create letter colliders from custom editor data
    // IMPORTANT: Create parts relative to origin (0,0), then move body to desired position
    // This prevents Matter.js center-of-mass calculation from shifting colliders
    const createLetterBody = (x: number, y: number, char: string, w: number, h: number) => {
      const opts: Matter.IBodyDefinition = {
        restitution: 0.05,
        friction: 0.6,
        frictionStatic: 0.8,
        density: 0.002,
        slop: 0.01,
      };

      const key = char === 'HEAD' ? 'HEAD' : char.toUpperCase();
      const shapes = COLLIDER_DATA[key];

      if (!shapes || shapes.length === 0) {
        // Fallback to simple rectangle
        return Bodies.rectangle(x, y, w * 0.7, h * 0.7, opts);
      }

      // Convert editor shapes to Matter.js bodies
      // Editor coords: x,y are percentages (0-1) of bounding box
      // For rect: x,y is top-left corner
      // For ellipse: x,y is center
      // Create parts relative to origin (0,0), NOT world position
      const parts: Matter.Body[] = [];

      shapes.forEach(shape => {
        if (shape.type === 'rect') {
          // Convert top-left percentage to center position relative to origin
          const rectCenterX = (shape.x + (shape.width || 0) / 2 - 0.5) * w;
          const rectCenterY = (shape.y + (shape.height || 0) / 2 - 0.5) * h;
          const rectW = (shape.width || 0) * w;
          const rectH = (shape.height || 0) * h;

          parts.push(Bodies.rectangle(rectCenterX, rectCenterY, rectW, rectH, opts));
        } else if (shape.type === 'ellipse') {
          // Convert center percentage to position relative to origin
          const ellipseCenterX = (shape.x - 0.5) * w;
          const ellipseCenterY = (shape.y - 0.5) * h;
          // Use average radius for circle approximation
          const radius = ((shape.radiusX || 0) + (shape.radiusY || 0)) / 2 * Math.min(w, h);

          parts.push(Bodies.circle(ellipseCenterX, ellipseCenterY, radius, opts));
        }
      });

      if (parts.length === 1) {
        // For single part, move it to desired position
        Body.setPosition(parts[0], { x, y });
        return parts[0];
      }

      // Create compound body - parts are relative to (0,0)
      const compoundBody = Body.create({
        parts,
        ...opts
      });

      // Now move the entire compound body to the desired world position
      Body.setPosition(compoundBody, { x, y });

      return compoundBody;
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
            className="absolute top-0 left-0 will-change-transform pointer-events-none select-none"
            style={{
              // All containers are square like the editor canvas
              width: `${textSize}px`,
              height: `${textSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            {item === 'HEAD' ? (
              <img
                src="/zinoHead.png"
                alt=""
                style={{
                  // 50% smaller than before
                  width: '20%',
                  height: '20%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: `${textSize * 0.85}px`,
                  fontFamily: 'var(--font-averia), Georgia, serif',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  lineHeight: 0.85,
                  fontWeight: 700,
                }}
              >
                {item}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FallingLetters;
