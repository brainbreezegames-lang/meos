'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Matter from 'matter-js';
import { X, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import type { DesktopItem } from '@/types';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';

interface GameWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

// Game constants
const MEOS_LETTERS = ['m', 'e', 'O', 'S'];
const ALPHABET = 'ABCDEFGHIJKLNPQRTUVWXYZabcdfghijklnpqrtuvwxyz0123456789@#&!?'.split('');
const GRAVITY = 0.002;
const FRICTION = 0.4;
const RESTITUTION = 0.5;
const AIR_FRICTION = 0.01;

// Colors for meOS letters - vibrant and distinct
const MEOS_COLORS: Record<string, { fill: string; glow: string }> = {
  'm': { fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' },   // Rose
  'e': { fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.6)' },  // Violet
  'O': { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },   // Cyan
  'S': { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },  // Amber
};

interface GameLetter {
  id: string;
  char: string;
  isProtected: boolean;
  fontSize: number;
  fontWeight: string;
  body: Matter.Body;
  color: string;
  glow: string;
}

interface Platform {
  id: string;
  body: Matter.Body;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  type: 'platform' | 'blocker' | 'wedge';
}

interface Exit {
  id: string;
  start: number;
  size: number;
}

type GameState = 'playing' | 'won' | 'lost';

export function GameWindow({ window: windowInstance, item }: GameWindowProps) {
  const windowContext = useWindowContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const renderLoopRef = useRef<number | null>(null);
  const lettersRef = useRef<GameLetter[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const exitsRef = useRef<Exit[]>([]);
  const wallsRef = useRef<Matter.Body[]>([]);

  const [gameState, setGameState] = useState<GameState>('playing');
  const [remainingLetters, setRemainingLetters] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 420, height: 380 });
  const [isResizing, setIsResizing] = useState(false);

  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  // Apply force to all letters based on drag movement
  const applyDragForce = useCallback((deltaX: number, deltaY: number) => {
    if (!engineRef.current) return;

    const forceMult = 0.00015; // Strong force multiplier

    lettersRef.current.forEach(letter => {
      const force = {
        x: -deltaX * letter.body.mass * forceMult,
        y: -deltaY * letter.body.mass * forceMult,
      };
      Matter.Body.applyForce(letter.body, letter.body.position, force);
    });
  }, []);

  // Generate random letters (more variety)
  const generateRandomLetters = useCallback((count: number): string[] => {
    const shuffled = [...ALPHABET].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  // Generate obstacles with variety
  const generateObstacles = useCallback((width: number, height: number): Omit<Platform, 'body'>[] => {
    const obstacles: Omit<Platform, 'body'>[] = [];

    // Regular platforms (3-5)
    const platformCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < platformCount; i++) {
      const platformWidth = 50 + Math.random() * 120;
      const x = 40 + Math.random() * (width - 80);
      const y = 60 + Math.random() * (height - 140);
      const angle = (Math.random() - 0.5) * 0.6;

      obstacles.push({
        id: `platform-${i}`,
        x,
        y,
        width: platformWidth,
        height: 6,
        angle,
        type: 'platform',
      });
    }

    // Vertical blockers (1-2)
    const blockerCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < blockerCount; i++) {
      const blockerHeight = 40 + Math.random() * 60;
      const x = 50 + Math.random() * (width - 100);
      const y = 80 + Math.random() * (height - 160);

      obstacles.push({
        id: `blocker-${i}`,
        x,
        y,
        width: 8,
        height: blockerHeight,
        angle: 0,
        type: 'blocker',
      });
    }

    // Wedges/triangular blockers (0-2)
    const wedgeCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < wedgeCount; i++) {
      const wedgeWidth = 30 + Math.random() * 50;
      const x = 60 + Math.random() * (width - 120);
      const y = 100 + Math.random() * (height - 180);
      const angle = (Math.random() - 0.5) * 1.2;

      obstacles.push({
        id: `wedge-${i}`,
        x,
        y,
        width: wedgeWidth,
        height: 6,
        angle,
        type: 'wedge',
      });
    }

    return obstacles;
  }, []);

  // Generate exits (only on bottom)
  const generateExits = useCallback((width: number): Exit[] => {
    const exits: Exit[] = [];
    const exitCount = 1 + Math.floor(Math.random() * 2); // 1-2 exits

    // Ensure exits don't overlap
    const usedRanges: { start: number; end: number }[] = [];

    for (let i = 0; i < exitCount; i++) {
      const size = 60 + Math.random() * 80; // 60-140px
      let start: number;
      let attempts = 0;

      do {
        start = 40 + Math.random() * (width - size - 80);
        attempts++;
      } while (
        attempts < 20 &&
        usedRanges.some(r => !(start + size < r.start || start > r.end))
      );

      if (attempts < 20) {
        usedRanges.push({ start, end: start + size });
        exits.push({ id: `exit-${i}`, start, size });
      }
    }

    return exits;
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const width = windowSize.width;
    const height = windowSize.height - 44; // Subtract title bar

    canvas.width = width;
    canvas.height = height;

    // Clean up previous engine
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    if (renderLoopRef.current) {
      cancelAnimationFrame(renderLoopRef.current);
    }

    // Create engine with gravity
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: GRAVITY * 1000 },
    });
    engineRef.current = engine;

    // Clear refs
    lettersRef.current = [];
    platformsRef.current = [];
    wallsRef.current = [];

    // Generate exits (bottom only)
    const exits = generateExits(width);
    exitsRef.current = exits;

    // Create walls with gaps for bottom exits
    const wallThickness = 60;
    const walls: Matter.Body[] = [];

    // Top wall (solid)
    walls.push(Matter.Bodies.rectangle(
      width / 2, -wallThickness / 2,
      width + wallThickness * 2, wallThickness,
      { isStatic: true, label: 'wall' }
    ));

    // Left wall (solid)
    walls.push(Matter.Bodies.rectangle(
      -wallThickness / 2, height / 2,
      wallThickness, height + wallThickness * 2,
      { isStatic: true, label: 'wall' }
    ));

    // Right wall (solid)
    walls.push(Matter.Bodies.rectangle(
      width + wallThickness / 2, height / 2,
      wallThickness, height + wallThickness * 2,
      { isStatic: true, label: 'wall' }
    ));

    // Bottom wall with gaps for exits
    const sortedExits = [...exits].sort((a, b) => a.start - b.start);
    let lastEnd = 0;

    sortedExits.forEach(exit => {
      if (exit.start > lastEnd) {
        // Wall segment before exit
        const segmentWidth = exit.start - lastEnd;
        walls.push(Matter.Bodies.rectangle(
          lastEnd + segmentWidth / 2,
          height + wallThickness / 2,
          segmentWidth, wallThickness,
          { isStatic: true, label: 'wall' }
        ));
      }
      lastEnd = exit.start + exit.size;
    });

    // Final wall segment after last exit
    if (lastEnd < width) {
      const segmentWidth = width - lastEnd;
      walls.push(Matter.Bodies.rectangle(
        lastEnd + segmentWidth / 2,
        height + wallThickness / 2,
        segmentWidth, wallThickness,
        { isStatic: true, label: 'wall' }
      ));
    }

    wallsRef.current = walls;
    Matter.Composite.add(engine.world, walls);

    // Generate and create obstacles
    const obstacleData = generateObstacles(width, height);
    const platforms: Platform[] = obstacleData.map(p => {
      const body = Matter.Bodies.rectangle(p.x, p.y, p.width, p.height, {
        isStatic: true,
        angle: p.angle,
        friction: 0.6,
        restitution: 0.3,
        label: p.type,
      });
      Matter.Composite.add(engine.world, body);
      return { ...p, body };
    });
    platformsRef.current = platforms;

    // Generate letters with wide variety
    const randomCount = 4 + Math.floor(Math.random() * 4); // 4-7 random letters
    const randomLetters = generateRandomLetters(randomCount);
    const allLetterChars = [...MEOS_LETTERS, ...randomLetters];
    setRemainingLetters(randomLetters.length);

    const letters: GameLetter[] = allLetterChars.map((char, index) => {
      const isProtected = MEOS_LETTERS.includes(char);

      // Wide variety in sizes: meOS letters are larger
      const fontSize = isProtected
        ? 50 + Math.random() * 30  // 50-80px for meOS
        : 28 + Math.random() * 40; // 28-68px for others

      const fontWeight = isProtected
        ? '800'
        : ['400', '500', '600', '700'][Math.floor(Math.random() * 4)];

      // Calculate physics based on size
      const mass = Math.pow(fontSize / 40, 2) * 1.5;
      const radius = fontSize * 0.45;

      // Random starting position (upper portion)
      const x = 50 + Math.random() * (width - 100);
      const y = 40 + Math.random() * (height * 0.35);

      const body = Matter.Bodies.circle(x, y, radius, {
        mass,
        friction: FRICTION,
        restitution: RESTITUTION,
        frictionAir: AIR_FRICTION,
        label: isProtected ? 'protected' : 'letter',
      });

      // Add slight random initial velocity
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2,
      });

      Matter.Composite.add(engine.world, body);

      const colorInfo = isProtected ? MEOS_COLORS[char] : { fill: 'var(--text-tertiary, #999)', glow: 'transparent' };

      return {
        id: `letter-${index}`,
        char,
        isProtected,
        fontSize,
        fontWeight,
        body,
        color: colorInfo.fill,
        glow: colorInfo.glow,
      };
    });

    lettersRef.current = letters;

    // Start physics
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // Render loop
    const render = () => {
      if (!canvasRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Draw exits (bottom only) - green highlight
      ctx.save();
      exitsRef.current.forEach(exit => {
        // Exit zone background
        const gradient = ctx.createLinearGradient(exit.start, height - 40, exit.start, height);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(exit.start, height - 40, exit.size, 40);

        // Exit markers
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(exit.start, height - 3);
        ctx.lineTo(exit.start + exit.size, height - 3);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrows pointing down
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        const arrowCount = Math.floor(exit.size / 40);
        for (let i = 0; i < arrowCount; i++) {
          const arrowX = exit.start + (exit.size / (arrowCount + 1)) * (i + 1);
          ctx.fillText('↓', arrowX, height - 12);
        }
      });
      ctx.restore();

      // Draw obstacles with different styles
      ctx.save();
      platformsRef.current.forEach(platform => {
        ctx.save();
        ctx.translate(platform.body.position.x, platform.body.position.y);
        ctx.rotate(platform.body.angle);

        if (platform.type === 'platform') {
          // Regular platform - subtle with rounded ends
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.beginPath();
          const r = platform.height / 2;
          ctx.roundRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height, r);
          ctx.fill();

          // Top highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(-platform.width / 2 + 2, -platform.height / 2, platform.width - 4, 1);
        } else if (platform.type === 'blocker') {
          // Vertical blocker - darker
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.roundRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height, 3);
          ctx.fill();
        } else if (platform.type === 'wedge') {
          // Wedge - angled with different color
          ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
          ctx.beginPath();
          ctx.roundRect(-platform.width / 2, -platform.height / 2, platform.width, platform.height, 2);
          ctx.fill();
        }

        ctx.restore();
      });
      ctx.restore();

      // Check for exits and update game state
      let protectedExited = false;
      let lettersRemaining = 0;

      lettersRef.current = lettersRef.current.filter(letter => {
        const pos = letter.body.position;
        // Only check bottom exit (y > height)
        const exited = pos.y > height + 40;

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
        const angle = letter.body.angle;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);

        ctx.font = `${letter.fontWeight} ${letter.fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (letter.isProtected) {
          // Colorful glow for meOS letters
          ctx.shadowColor = letter.glow;
          ctx.shadowBlur = 15;
          ctx.fillStyle = letter.color;
          // Draw twice for stronger glow
          ctx.fillText(letter.char, 0, 0);
          ctx.shadowBlur = 8;
          ctx.fillText(letter.char, 0, 0);
        } else {
          // Gray for other letters
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(120, 120, 120, 0.7)';
          ctx.fillText(letter.char, 0, 0);
        }

        ctx.restore();
      });
      ctx.restore();

      renderLoopRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      if (renderLoopRef.current) cancelAnimationFrame(renderLoopRef.current);
    };
  }, [windowSize, generateExits, generateObstacles, generateRandomLetters, gameState]);

  // Initialize game on mount and restart
  useEffect(() => {
    const cleanup = initGame();
    return cleanup;
  }, [gameKey, initGame]);

  // Handle drag for physics
  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    applyDragForce(info.delta.x, info.delta.y);
  }, [applyDragForce]);

  const handleRestart = () => {
    setGameState('playing');
    setGameKey(prev => prev + 1);
  };

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  // Resize handlers
  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleResize = useCallback((e: PointerEvent) => {
    if (!isResizing) return;

    setWindowSize(prev => ({
      width: Math.max(350, Math.min(800, prev.width + e.movementX)),
      height: Math.max(300, Math.min(600, prev.height + e.movementY)),
    }));
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      // Restart game with new dimensions
      setGameKey(prev => prev + 1);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('pointermove', handleResize);
      window.addEventListener('pointerup', handleResizeEnd);
      return () => {
        window.removeEventListener('pointermove', handleResize);
        window.removeEventListener('pointerup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

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
        drag={!isMaximized && !isResizing}
        dragConstraints={{ top: -250, left: -400, right: 400, bottom: 250 }}
        dragElastic={0.03}
        dragMomentum={false}
        onDrag={handleDrag}
        style={{
          zIndex: windowInstance.zIndex + 200,
          width: isMaximized ? '100%' : windowSize.width,
          height: isMaximized ? '100%' : windowSize.height,
          borderRadius: isMaximized ? '0' : '12px',
          background: 'var(--bg-elevated, #fff)',
          boxShadow: isActive
            ? '0 25px 80px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)'
            : '0 12px 40px -8px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between h-[44px] px-4 shrink-0 select-none relative"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,248,250,0.9) 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
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
            >
              <Minimize2 className="w-1.5 h-1.5 opacity-0 group-hover/traffic:opacity-100" strokeWidth={2.5} style={{ color: 'rgba(77,50,0,0.7)' }} />
            </button>
            <button
              onClick={() => windowContext.maximizeWindow(windowInstance.id)}
              className="w-3 h-3 rounded-full transition-all duration-150 hover:brightness-90"
              style={{
                background: 'linear-gradient(180deg, #28CA41 0%, #1AAD2E 100%)',
                boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Maximize2 className="w-1.5 h-1.5 opacity-0 group-hover/traffic:opacity-100" strokeWidth={2.5} style={{ color: 'rgba(0,77,0,0.7)' }} />
            </button>
          </div>

          {/* Title */}
          <span
            className="absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold tracking-tight"
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
            background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />

          {/* Legend */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[10px]"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{ color: '#f43f5e' }}>m</span>
            <span style={{ color: '#8b5cf6' }}>e</span>
            <span style={{ color: '#06b6d4' }}>O</span>
            <span style={{ color: '#f59e0b' }}>S</span>
            <span style={{ color: '#999', marginLeft: 4 }}>= Keep</span>
          </div>

          {/* Win/Lose Overlay */}
          <AnimatePresence>
            {gameState !== 'playing' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  background: gameState === 'won'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  backdropFilter: 'blur(8px)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="text-center p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  }}
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                >
                  <div className="text-5xl mb-3">
                    {gameState === 'won' ? '🎉' : '💔'}
                  </div>
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ color: gameState === 'won' ? '#059669' : '#dc2626' }}
                  >
                    {gameState === 'won' ? 'You Win!' : 'Game Over'}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#666' }}>
                    {gameState === 'won'
                      ? 'All gray letters ejected!'
                      : 'A colored letter escaped!'}
                  </p>
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: gameState === 'won' ? '#10b981' : '#ef4444',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    Play Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <motion.div
            className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-[11px] font-medium text-center"
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -10 }}
            transition={{ delay: 5, duration: 0.5 }}
          >
            Drag the window to shake letters out! 🎮
          </motion.div>
        </div>

        {/* Resize Handle */}
        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
              borderBottomRightRadius: '12px',
            }}
            onPointerDown={handleResizeStart}
          />
        )}
      </motion.div>
    </div>
  );
}
