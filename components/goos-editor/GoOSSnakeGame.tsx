'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, RotateCcw, Trophy, Gamepad2, Sparkles } from 'lucide-react';
import { WindowShell } from '../desktop/WindowShell';
import { playSound } from '@/lib/sounds';
import { SPRING } from '@/lib/animations';

interface GoOSSnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  zIndex?: number;
  isActive?: boolean;
  isMaximized?: boolean;
  onFocus?: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 18;
const INITIAL_SPEED = 180; // Slower start (was 150)
const SPEED_INCREMENT = 3; // Slower acceleration
const MIN_SPEED = 70;

// Colors - warm palette matching goOS
const COLORS = {
  bg: 'var(--color-bg-base)', // Warm cream background
  grid: 'rgba(209, 199, 178, 0.3)', // Very subtle grid
  gridAlt: 'rgba(209, 199, 178, 0.15)', // Even more subtle alternating
  snakeHead: '#28c840', // Bright green
  snakeBody: '#34d058', // Slightly lighter green
  snakeTail: '#85e89d', // Fade to light green
  food: 'var(--color-accent-primary)', // Orange accent
  foodGlow: '#ff9955', // Orange glow
  particle: ['var(--color-accent-primary)', '#ffaa44', '#ffcc66', '#ff9955'], // Orange particles
};

export function GoOSSnakeGame({
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  zIndex = 100,
  isActive = true,
  isMaximized = false,
  onFocus,
}: GoOSSnakeGameProps) {
  const prefersReducedMotion = useReducedMotion();

  // Game state
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'gameover'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
  const [foodPulse, setFoodPulse] = useState(0);

  // Refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const particleLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>(direction);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleIdRef = useRef(0);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Spawn particles
  const spawnParticles = useCallback((x: number, y: number, count: number = 8) => {
    if (prefersReducedMotion) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: particleIdRef.current++,
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: COLORS.particle[Math.floor(Math.random() * COLORS.particle.length)],
        size: 3 + Math.random() * 3,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, [prefersReducedMotion]);

  // Trigger screen shake
  const triggerShake = useCallback((intensity: number = 4) => {
    if (prefersReducedMotion) return;

    const shakeX = (Math.random() - 0.5) * intensity;
    const shakeY = (Math.random() - 0.5) * intensity;
    setScreenShake({ x: shakeX, y: shakeY });
    setTimeout(() => setScreenShake({ x: 0, y: 0 }), 100);
  }, [prefersReducedMotion]);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameState('idle');
    setCountdown(3);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setParticles([]);
  }, [generateFood]);

  // Start countdown
  const startGame = useCallback(() => {
    playSound('click');
    setGameState('countdown');
    setCountdown(3);
  }, []);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('goOS-snake-highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('goOS-snake-highscore', score.toString());
    }
  }, [score, highScore]);

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      playSound('clickSoft');
      const timer = setTimeout(() => setCountdown(countdown - 1), 800);
      return () => clearTimeout(timer);
    } else {
      playSound('pop');
      setGameState('playing');
    }
  }, [gameState, countdown]);

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    particleLoopRef.current = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            life: p.life - 0.03,
            size: p.size * 0.98,
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    return () => {
      if (particleLoopRef.current) clearInterval(particleLoopRef.current);
    };
  }, [particles.length > 0]);

  // Food pulse animation
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setFoodPulse(prev => (prev + 0.1) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDirection = directionRef.current;

        switch (currentDirection) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameState('gameover');
          playSound('popReverse');
          triggerShake(8);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameState('gameover');
          playSound('popReverse');
          triggerShake(8);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
          playSound('pop');
          spawnParticles(food.x, food.y, 12);
          triggerShake(3);
          // Don't pop - snake grows!
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, food, speed, generateFood, spawnParticles, triggerShake]);

  // Keyboard input
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Start game or restart
      if ((gameState === 'idle' || gameState === 'gameover') && (e.key === ' ' || e.key === 'Enter')) {
        if (gameState === 'gameover') resetGame();
        startGame();
        return;
      }

      // Ignore input during countdown
      if (gameState !== 'playing') return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      const newDirection = keyMap[e.key];
      if (!newDirection) return;

      // Prevent 180-degree turns
      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };

      if (opposites[newDirection] !== directionRef.current) {
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, gameState, resetGame, startGame]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with warm cream background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle checkerboard pattern
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = COLORS.gridAlt;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw food with glow and pulse
    const pulseSize = 1 + Math.sin(foodPulse) * 0.15;
    const foodCenterX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodCenterY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const foodRadius = (CELL_SIZE / 2 - 2) * pulseSize;

    // Food glow
    const glowGradient = ctx.createRadialGradient(
      foodCenterX, foodCenterY, 0,
      foodCenterX, foodCenterY, foodRadius * 2
    );
    glowGradient.addColorStop(0, 'var(--color-accent-primary-glow)');
    glowGradient.addColorStop(1, 'rgba(30, 82, 241, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, foodRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Food body
    const foodGradient = ctx.createRadialGradient(
      foodCenterX - 2, foodCenterY - 2, 0,
      foodCenterX, foodCenterY, foodRadius
    );
    foodGradient.addColorStop(0, COLORS.foodGlow);
    foodGradient.addColorStop(1, COLORS.food);
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2);
    ctx.fill();

    // Food shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(foodCenterX - 2, foodCenterY - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const progress = index / Math.max(snake.length - 1, 1);

      // Calculate color gradient from head to tail
      const r = Math.round(40 + progress * 93);
      const g = Math.round(200 - progress * 32);
      const b = Math.round(64 + progress * 93);

      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      const size = CELL_SIZE - 2;
      const radius = isHead ? 5 : 4 - progress * 2;

      // Snake segment shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, size, size, radius);
      ctx.fill();

      // Snake segment body
      if (isHead) {
        const headGradient = ctx.createLinearGradient(x, y, x + size, y + size);
        headGradient.addColorStop(0, '#34d058');
        headGradient.addColorStop(1, COLORS.snakeHead);
        ctx.fillStyle = headGradient;
      } else {
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      }

      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, size, size, radius);
      ctx.fill();

      // Head shine
      if (isHead) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, size / 3, size / 3, 2);
        ctx.fill();
      }

      // Draw eyes on head
      if (isHead) {
        ctx.fillStyle = '#fff';
        const eyeSize = 3;
        let eyeX1: number, eyeX2: number, eyeY1: number, eyeY2: number;
        const eyeOffset = 4;

        switch (direction) {
          case 'RIGHT':
            eyeX1 = eyeX2 = x + size - 4;
            eyeY1 = y + eyeOffset + 2;
            eyeY2 = y + size - eyeOffset - 2;
            break;
          case 'LEFT':
            eyeX1 = eyeX2 = x + 4;
            eyeY1 = y + eyeOffset + 2;
            eyeY2 = y + size - eyeOffset - 2;
            break;
          case 'UP':
            eyeY1 = eyeY2 = y + 4;
            eyeX1 = x + eyeOffset + 2;
            eyeX2 = x + size - eyeOffset - 2;
            break;
          case 'DOWN':
            eyeY1 = eyeY2 = y + size - 4;
            eyeX1 = x + eyeOffset + 2;
            eyeX2 = x + size - eyeOffset - 2;
            break;
        }

        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, 1.5, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw particles
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

  }, [snake, food, direction, particles, foodPulse]);

  if (!isOpen) return null;

  const canvasWidth = GRID_SIZE * CELL_SIZE;
  const canvasHeight = GRID_SIZE * CELL_SIZE;

  return (
    <WindowShell
      id="snake-game"
      title="Snake"
      icon={<Gamepad2 size={16} color="var(--color-text-secondary)" strokeWidth={1.5} />}
      variant="light"
      isActive={isActive}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onFocus={onFocus}
      width={canvasWidth + 48}
      height={canvasHeight + 180}
      minWidth={canvasWidth + 48}
      minHeight={canvasHeight + 180}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          background: 'var(--color-bg-base)',
        }}
      >
        {/* Score bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, rgba(30, 82, 241,0.08) 0%, rgba(30, 82, 241,0.03) 100%)',
            borderRadius: 10,
            border: '1px solid rgba(30, 82, 241,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={16} color="var(--color-accent-primary)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Score
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-accent-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {score}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={14} color="#d4af37" />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#d4af37',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {highScore}
            </span>
          </div>
        </div>

        {/* Game canvas */}
        <motion.div
          animate={{
            x: screenShake.x,
            y: screenShake.y,
          }}
          transition={{ duration: 0.05 }}
          style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
            margin: '0 auto',
            borderRadius: 12,
            border: '2px solid rgba(209, 199, 178, 0.5)',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ display: 'block' }}
          />

          {/* Countdown overlay */}
          <AnimatePresence>
            {gameState === 'countdown' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(251, 249, 239, 0.85)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={SPRING.bouncy}
                  style={{
                    fontSize: countdown === 0 ? 36 : 72,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: countdown === 0 ? '#28c840' : 'var(--color-accent-primary)',
                    textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {countdown === 0 ? 'GO!' : countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle / Game over overlay */}
          <AnimatePresence>
            {(gameState === 'idle' || gameState === 'gameover') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  background: 'rgba(251, 249, 239, 0.92)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {gameState === 'gameover' ? (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, ...SPRING.bouncy }}
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Game Over!
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        fontSize: 16,
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Score: <span style={{ fontWeight: 700, color: 'var(--color-accent-primary)' }}>{score}</span>
                    </motion.div>
                    {score === highScore && score > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, ...SPRING.bouncy }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)',
                          borderRadius: 20,
                          color: '#553c00',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <Trophy size={14} />
                        New High Score!
                      </motion.div>
                    )}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        resetGame();
                        startGame();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        marginTop: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        background: 'linear-gradient(135deg, #1e52f1 0%, #ff5500 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(30, 82, 241, 0.3)',
                      }}
                    >
                      <RotateCcw size={16} />
                      Play Again
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={SPRING.bouncy}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, #28c840 0%, #1ea835 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(40, 200, 64, 0.3)',
                      }}
                    >
                      <Gamepad2 size={32} color="white" />
                    </motion.div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Snake
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-body)',
                        textAlign: 'center',
                        lineHeight: 1.5,
                      }}
                    >
                      Use arrow keys or WASD to move
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startGame}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 28px',
                        marginTop: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        background: 'linear-gradient(135deg, #28c840 0%, #1ea835 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(40, 200, 64, 0.3)',
                      }}
                    >
                      <Play size={16} />
                      Start Game
                    </motion.button>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: 4,
                      }}
                    >
                      or press Space / Enter
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Controls hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: '4px 0',
          }}
        >
          {[
            { key: '↑', alt: 'W' },
            { key: '←', alt: 'A' },
            { key: '↓', alt: 'S' },
            { key: '→', alt: 'D' },
          ].map(({ key, alt }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(245,243,235,0.8) 100%)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                {key}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WindowShell>
  );
}

export default GoOSSnakeGame;
