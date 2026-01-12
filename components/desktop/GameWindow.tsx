'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { X, RotateCcw } from 'lucide-react';
import type { DesktopItem } from '@/types';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';

interface GameWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

// Game constants
const MEOS_LETTERS = ['m', 'e', 'O', 'S'];
const ALPHABET = 'ABCDEFGHIJKLMNPQRTUVWXYZabcdfghijklnpqrtuvwxyz'.split(''); // Exclude m,e,O,S
const GRAVITY = 0.0008;
const FRICTION = 0.3;
const RESTITUTION = 0.4;
const AIR_FRICTION = 0.02;

// Font styles for variety
const FONT_WEIGHTS = ['400', '500', '600', '700'];
const FONT_STYLES = ['normal', 'italic'];

interface GameLetter {
  id: string;
  char: string;
  isProtected: boolean;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  body: Matter.Body;
}

interface Platform {
  id: string;
  body: Matter.Body;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

interface Exit {
  id: string;
  edge: 'top' | 'bottom' | 'left' | 'right';
  start: number;
  size: number;
}

type GameState = 'playing' | 'won' | 'lost';

export function GameWindow({ window: windowInstance, item }: GameWindowProps) {
  const windowContext = useWindowContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderLoopRef = useRef<number | null>(null);
  const lettersRef = useRef<GameLetter[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const exitsRef = useRef<Exit[]>([]);
  const wallsRef = useRef<Matter.Body[]>([]);
  const lastWindowPos = useRef({ x: 0, y: 0 });
  const windowVelocity = useRef({ x: 0, y: 0 });

  const [gameState, setGameState] = useState<GameState>('playing');
  const [remainingLetters, setRemainingLetters] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  // Generate random letters
  const generateRandomLetters = useCallback((count: number): string[] => {
    const shuffled = [...ALPHABET].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  // Generate random platforms
  const generatePlatforms = useCallback((width: number, height: number): Omit<Platform, 'body'>[] => {
    const platforms: Omit<Platform, 'body'>[] = [];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 platforms

    for (let i = 0; i < count; i++) {
      const platformWidth = 60 + Math.random() * 100;
      const platformHeight = 4;
      const x = 50 + Math.random() * (width - 100);
      const y = 80 + Math.random() * (height - 160);
      const angle = (Math.random() - 0.5) * 0.5; // -0.25 to 0.25 radians

      platforms.push({
        id: `platform-${i}`,
        x,
        y,
        width: platformWidth,
        height: platformHeight,
        angle,
      });
    }

    return platforms;
  }, []);

  // Generate random exits
  const generateExits = useCallback((width: number, height: number): Exit[] => {
    const exits: Exit[] = [];
    const edges: Exit['edge'][] = ['top', 'bottom', 'left', 'right'];
    const count = 1 + Math.floor(Math.random() * 2); // 1-2 exits
    const usedEdges: Exit['edge'][] = [];

    for (let i = 0; i < count; i++) {
      const availableEdges = edges.filter(e => !usedEdges.includes(e));
      if (availableEdges.length === 0) break;

      const edge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
      usedEdges.push(edge);

      const isHorizontal = edge === 'top' || edge === 'bottom';
      const maxLength = isHorizontal ? width : height;
      const size = 50 + Math.random() * 80; // 50-130px exit size
      const start = 30 + Math.random() * (maxLength - size - 60);

      exits.push({
        id: `exit-${i}`,
        edge,
        start,
        size,
      });
    }

    return exits;
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    setDimensions({ width, height });

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: GRAVITY * 1000 },
    });
    engineRef.current = engine;

    // Clear previous game state
    lettersRef.current = [];
    platformsRef.current = [];
    wallsRef.current = [];

    // Generate exits first (needed for wall creation)
    const exits = generateExits(width, height);
    exitsRef.current = exits;

    // Create walls with gaps for exits
    const wallThickness = 50;
    const walls: Matter.Body[] = [];

    // Helper to create wall segments
    const createWallWithGap = (
      edge: 'top' | 'bottom' | 'left' | 'right',
      exits: Exit[]
    ) => {
      const exit = exits.find(e => e.edge === edge);
      const isHorizontal = edge === 'top' || edge === 'bottom';

      if (!exit) {
        // Full wall
        if (isHorizontal) {
          const y = edge === 'top' ? -wallThickness / 2 : height + wallThickness / 2;
          walls.push(Matter.Bodies.rectangle(width / 2, y, width + wallThickness * 2, wallThickness, { isStatic: true, label: 'wall' }));
        } else {
          const x = edge === 'left' ? -wallThickness / 2 : width + wallThickness / 2;
          walls.push(Matter.Bodies.rectangle(x, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true, label: 'wall' }));
        }
      } else {
        // Wall with gap
        if (isHorizontal) {
          const y = edge === 'top' ? -wallThickness / 2 : height + wallThickness / 2;
          // Left segment
          if (exit.start > 0) {
            walls.push(Matter.Bodies.rectangle(exit.start / 2, y, exit.start, wallThickness, { isStatic: true, label: 'wall' }));
          }
          // Right segment
          const rightStart = exit.start + exit.size;
          if (rightStart < width) {
            const rightWidth = width - rightStart;
            walls.push(Matter.Bodies.rectangle(rightStart + rightWidth / 2, y, rightWidth, wallThickness, { isStatic: true, label: 'wall' }));
          }
        } else {
          const x = edge === 'left' ? -wallThickness / 2 : width + wallThickness / 2;
          // Top segment
          if (exit.start > 0) {
            walls.push(Matter.Bodies.rectangle(x, exit.start / 2, wallThickness, exit.start, { isStatic: true, label: 'wall' }));
          }
          // Bottom segment
          const bottomStart = exit.start + exit.size;
          if (bottomStart < height) {
            const bottomHeight = height - bottomStart;
            walls.push(Matter.Bodies.rectangle(x, bottomStart + bottomHeight / 2, wallThickness, bottomHeight, { isStatic: true, label: 'wall' }));
          }
        }
      }
    };

    createWallWithGap('top', exits);
    createWallWithGap('bottom', exits);
    createWallWithGap('left', exits);
    createWallWithGap('right', exits);

    wallsRef.current = walls;
    Matter.Composite.add(engine.world, walls);

    // Generate and create platforms
    const platformData = generatePlatforms(width, height);
    const platforms: Platform[] = platformData.map(p => {
      const body = Matter.Bodies.rectangle(p.x, p.y, p.width, p.height, {
        isStatic: true,
        angle: p.angle,
        friction: 0.5,
        label: 'platform',
      });
      Matter.Composite.add(engine.world, body);
      return { ...p, body };
    });
    platformsRef.current = platforms;

    // Generate letters
    const randomLetters = generateRandomLetters(3 + Math.floor(Math.random() * 3)); // 3-5 random letters
    const allLetterChars = [...MEOS_LETTERS, ...randomLetters];
    setRemainingLetters(randomLetters.length);

    const letters: GameLetter[] = allLetterChars.map((char, index) => {
      const isProtected = MEOS_LETTERS.includes(char);
      const fontSize = 24 + Math.random() * 32; // 24-56px
      const fontWeight = FONT_WEIGHTS[Math.floor(Math.random() * FONT_WEIGHTS.length)];
      const fontStyle = FONT_STYLES[Math.floor(Math.random() * FONT_STYLES.length)];

      // Calculate mass based on font size
      const mass = (fontSize / 40) * 2;
      const radius = fontSize * 0.5;

      // Random starting position
      const x = 60 + Math.random() * (width - 120);
      const y = 60 + Math.random() * (height * 0.4);

      const body = Matter.Bodies.circle(x, y, radius, {
        mass,
        friction: FRICTION,
        restitution: RESTITUTION,
        frictionAir: AIR_FRICTION,
        label: isProtected ? 'protected' : 'letter',
      });

      Matter.Composite.add(engine.world, body);

      return {
        id: `letter-${index}`,
        char,
        isProtected,
        fontSize,
        fontWeight,
        fontStyle,
        body,
      };
    });

    lettersRef.current = letters;

    // Start physics simulation
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Start render loop
    const render = () => {
      if (!canvasRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw exits (subtle highlight)
      ctx.save();
      exitsRef.current.forEach(exit => {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;

        let x, y, w, h;
        switch (exit.edge) {
          case 'top':
            x = exit.start;
            y = 0;
            w = exit.size;
            h = 8;
            break;
          case 'bottom':
            x = exit.start;
            y = height - 8;
            w = exit.size;
            h = 8;
            break;
          case 'left':
            x = 0;
            y = exit.start;
            w = 8;
            h = exit.size;
            break;
          case 'right':
            x = width - 8;
            y = exit.start;
            w = 8;
            h = exit.size;
            break;
        }

        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        // Draw exit arrow
        ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const arrowX = x + w / 2;
        const arrowY = y + h / 2;
        const arrow = exit.edge === 'top' ? '↑' : exit.edge === 'bottom' ? '↓' : exit.edge === 'left' ? '←' : '→';
        if (exit.edge === 'top' || exit.edge === 'bottom') {
          ctx.fillText(arrow, arrowX, exit.edge === 'top' ? 16 : height - 16);
        } else {
          ctx.fillText(arrow, exit.edge === 'left' ? 16 : width - 16, arrowY);
        }
      });
      ctx.restore();

      // Draw platforms (minimal, clean lines)
      ctx.save();
      platformsRef.current.forEach(platform => {
        ctx.translate(platform.body.position.x, platform.body.position.y);
        ctx.rotate(platform.body.angle);

        // Platform line
        ctx.fillStyle = 'var(--text-tertiary, rgba(0, 0, 0, 0.2))';
        ctx.fillRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height);

        // Subtle top highlight
        ctx.fillStyle = 'var(--border-medium, rgba(0, 0, 0, 0.1))';
        ctx.fillRect(-platform.width / 2, -platform.height / 2, platform.width, 1);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
      });
      ctx.restore();

      // Check for exits and update game state
      let protectedExited = false;
      let lettersRemaining = 0;

      lettersRef.current = lettersRef.current.filter(letter => {
        const pos = letter.body.position;
        const exited = pos.x < -30 || pos.x > width + 30 || pos.y < -30 || pos.y > height + 30;

        if (exited) {
          if (letter.isProtected) {
            protectedExited = true;
          }
          Matter.Composite.remove(engine.world, letter.body);
          return false;
        }

        if (!letter.isProtected) {
          lettersRemaining++;
        }
        return true;
      });

      if (protectedExited && gameState === 'playing') {
        setGameState('lost');
      } else if (lettersRemaining === 0 && gameState === 'playing' && lettersRef.current.length > 0) {
        // Check if all non-protected letters are gone
        const hasOnlyProtected = lettersRef.current.every(l => l.isProtected);
        if (hasOnlyProtected) {
          setGameState('won');
        }
      }

      setRemainingLetters(lettersRemaining);

      // Draw letters
      ctx.save();
      lettersRef.current.forEach(letter => {
        const pos = letter.body.position;

        ctx.font = `${letter.fontStyle} ${letter.fontWeight} ${letter.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (letter.isProtected) {
          // Protected letters have subtle glow
          ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
          ctx.shadowBlur = 8;
          ctx.fillStyle = 'var(--text-primary, #1a1a1a)';
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'var(--text-secondary, #666)';
        }

        ctx.fillText(letter.char, pos.x, pos.y);
      });
      ctx.restore();

      renderLoopRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      if (renderLoopRef.current) {
        cancelAnimationFrame(renderLoopRef.current);
      }
    };
  }, [generateExits, generatePlatforms, generateRandomLetters, gameState]);

  // Handle window drag physics
  useEffect(() => {
    if (!containerRef.current || !engineRef.current) return;

    const updateWindowPhysics = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const currentPos = { x: rect.left, y: rect.top };

      // Calculate velocity based on position change
      windowVelocity.current = {
        x: (currentPos.x - lastWindowPos.current.x) * 0.15,
        y: (currentPos.y - lastWindowPos.current.y) * 0.15,
      };

      lastWindowPos.current = currentPos;

      // Apply opposite force to letters (inertia effect)
      if (engineRef.current && Math.abs(windowVelocity.current.x) + Math.abs(windowVelocity.current.y) > 0.5) {
        lettersRef.current.forEach(letter => {
          Matter.Body.applyForce(letter.body, letter.body.position, {
            x: -windowVelocity.current.x * letter.body.mass * 0.0003,
            y: -windowVelocity.current.y * letter.body.mass * 0.0003,
          });
        });
      }
    };

    const interval = setInterval(updateWindowPhysics, 16);
    return () => clearInterval(interval);
  }, []);

  // Initialize game on mount and restart
  useEffect(() => {
    const cleanup = initGame();
    return cleanup;
  }, [gameKey, initGame]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      // Restart game on resize for simplicity
      // Could implement more sophisticated resize handling
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleRestart = () => {
    setGameState('playing');
    setGameKey(prev => prev + 1);
  };

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const windowWidth = Math.max(item.windowWidth || 520, 450);

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
      style={{
        padding: isMaximized ? '28px 0 0 0' : '40px',
      }}
    >
      <motion.div
        className="overflow-hidden flex flex-col pointer-events-auto"
        onClick={handleWindowClick}
        drag={!isMaximized}
        dragConstraints={{ top: -200, left: -300, right: 300, bottom: 200 }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{
          zIndex: windowInstance.zIndex + 200,
          width: isMaximized ? '100%' : windowWidth,
          maxWidth: isMaximized ? '100%' : '90vw',
          height: isMaximized ? '100%' : 480,
          maxHeight: isMaximized ? '100%' : 'calc(100vh - 120px)',
          borderRadius: isMaximized ? '0' : 'var(--radius-window, 12px)',
          background: 'var(--bg-elevated, #fff)',
          boxShadow: isActive
            ? 'var(--shadow-window, 0 24px 80px -12px rgba(0,0,0,0.25))'
            : 'var(--shadow-window-inactive, 0 12px 40px -8px rgba(0,0,0,0.15))',
          border: '1px solid var(--border-light, rgba(0,0,0,0.08))',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between h-[44px] px-4 shrink-0 select-none"
          style={{
            background: 'var(--bg-titlebar, linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.85) 100%))',
            borderBottom: '1px solid var(--border-light, rgba(0,0,0,0.06))',
            cursor: isMaximized ? 'default' : 'grab',
          }}
        >
          {/* Traffic Lights */}
          <div className="flex items-center gap-2 group/traffic" onPointerDown={(e) => e.stopPropagation()}>
            <button
              onClick={() => windowContext.closeWindow(windowInstance.id)}
              className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90"
              style={{
                background: 'linear-gradient(180deg, #FF5F57 0%, #E0443E 100%)',
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <X className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100" strokeWidth={2.5} style={{ color: 'rgba(77,0,0,0.7)' }} />
            </button>
            <button
              onClick={() => windowContext.minimizeWindow(windowInstance.id)}
              className="w-3 h-3 rounded-full transition-all duration-150 hover:brightness-90"
              style={{
                background: 'linear-gradient(180deg, #FFBD2E 0%, #DFA023 100%)',
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            />
            <button
              onClick={() => windowContext.maximizeWindow(windowInstance.id)}
              className="w-3 h-3 rounded-full transition-all duration-150 hover:brightness-90"
              style={{
                background: 'linear-gradient(180deg, #28CA41 0%, #1AAD2E 100%)',
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            />
          </div>

          {/* Title */}
          <span
            className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium"
            style={{ color: 'var(--text-secondary, #666)' }}
          >
            meOS Puzzle
          </span>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-black/5"
            style={{ color: 'var(--text-tertiary, #999)' }}
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Game Area */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          style={{
            background: 'var(--bg-secondary, #fafafa)',
          }}
        >
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              width: '100%',
              height: '100%',
            }}
          />

          {/* Status Bar */}
          <div
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              background: 'var(--bg-glass, rgba(255,255,255,0.8))',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-secondary, #666)',
              border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
            }}
          >
            {remainingLetters} letter{remainingLetters !== 1 ? 's' : ''} to eject
          </div>

          {/* Win/Lose Overlay */}
          <AnimatePresence>
            {gameState !== 'playing' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  background: gameState === 'won'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(4px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                >
                  <div
                    className="text-4xl mb-2"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  >
                    {gameState === 'won' ? '🎉' : '💔'}
                  </div>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: gameState === 'won' ? '#059669' : '#dc2626' }}
                  >
                    {gameState === 'won' ? 'Level Complete!' : 'Game Over'}
                  </h3>
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-secondary, #666)' }}
                  >
                    {gameState === 'won'
                      ? 'All extra letters ejected!'
                      : 'A meOS letter escaped!'}
                  </p>
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                    style={{
                      background: gameState === 'won' ? '#10b981' : '#ef4444',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    Play Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions (first few seconds) */}
          <motion.div
            className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-medium"
            style={{
              background: 'var(--bg-glass, rgba(255,255,255,0.9))',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-tertiary, #888)',
              border: '1px solid var(--border-light, rgba(0,0,0,0.06))',
            }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -10 }}
            transition={{ delay: 4, duration: 0.5 }}
          >
            Drag window to move letters • Keep meOS inside
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
