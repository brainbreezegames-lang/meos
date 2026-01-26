'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, Gamepad2 } from 'lucide-react';
import { WindowShell } from '../desktop/WindowShell';
import { playSound } from '@/lib/sounds';

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

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

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
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>(direction);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPlaying(false);
  }, [generateFood]);

  // Load high score from localStorage
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

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

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
          setGameOver(true);
          setIsPlaying(false);
          playSound('popReverse');
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setIsPlaying(false);
          playSound('popReverse');
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          setFood(generateFood(newSnake));
          setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
          playSound('pop');
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
  }, [isPlaying, gameOver, food, speed, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying && !gameOver && (e.key === ' ' || e.key === 'Enter')) {
        setIsPlaying(true);
        playSound('click');
        return;
      }

      if (gameOver && (e.key === ' ' || e.key === 'Enter')) {
        resetGame();
        playSound('click');
        return;
      }

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
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
  }, [isActive, isPlaying, gameOver, resetGame]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'var(--color-bg-subtle)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern (subtle)
    ctx.strokeStyle = 'var(--color-border-subtle)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food - using accent color
    const gradient = ctx.createRadialGradient(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      0,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2
    );
    gradient.addColorStop(0, '#ff9955');
    gradient.addColorStop(1, '#ff7722');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const radius = isHead ? 3 : 2;

      // Gradient from head to tail
      const alpha = 1 - (index / snake.length) * 0.4;
      ctx.fillStyle = isHead
        ? '#28c840' // Green from traffic lights
        : `rgba(40, 200, 64, ${alpha})`;

      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2,
        radius
      );
      ctx.fill();

      // Draw eyes on head
      if (isHead) {
        ctx.fillStyle = '#fff';
        const eyeOffset = CELL_SIZE / 4;
        const eyeSize = 2;

        let eyeX1 = segment.x * CELL_SIZE + CELL_SIZE / 2 - eyeOffset;
        let eyeX2 = segment.x * CELL_SIZE + CELL_SIZE / 2 + eyeOffset;
        let eyeY1 = segment.y * CELL_SIZE + CELL_SIZE / 3;
        let eyeY2 = eyeY1;

        if (direction === 'LEFT' || direction === 'RIGHT') {
          eyeY1 = segment.y * CELL_SIZE + CELL_SIZE / 2 - eyeOffset;
          eyeY2 = segment.y * CELL_SIZE + CELL_SIZE / 2 + eyeOffset;
          eyeX1 = direction === 'RIGHT'
            ? segment.x * CELL_SIZE + CELL_SIZE - CELL_SIZE / 3
            : segment.x * CELL_SIZE + CELL_SIZE / 3;
          eyeX2 = eyeX1;
        } else {
          eyeY1 = direction === 'DOWN'
            ? segment.y * CELL_SIZE + CELL_SIZE - CELL_SIZE / 3
            : segment.y * CELL_SIZE + CELL_SIZE / 3;
          eyeY2 = eyeY1;
        }

        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [snake, food, direction]);

  if (!isOpen) return null;

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
      width={GRID_SIZE * CELL_SIZE + 48}
      height={GRID_SIZE * CELL_SIZE + 180}
      minWidth={GRID_SIZE * CELL_SIZE + 48}
      minHeight={GRID_SIZE * CELL_SIZE + 180}
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
            padding: '8px 12px',
            background: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {score}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trophy size={14} color="var(--color-accent-primary)" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-accent-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {highScore}
            </span>
          </div>
        </div>

        {/* Game canvas */}
        <div
          style={{
            position: 'relative',
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            margin: '0 auto',
            borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--color-border-default)',
            overflow: 'hidden',
            background: 'var(--color-bg-subtle)',
          }}
        >
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            style={{
              display: 'block',
            }}
          />

          {/* Overlay states */}
          {(gameOver || !isPlaying) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: 'rgba(251, 249, 239, 0.9)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {gameOver ? (
                <>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Game Over
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Score: {score}
                  </span>
                  <button
                    onClick={() => {
                      resetGame();
                      playSound('click');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      background: 'var(--color-accent-primary)',
                      color: 'var(--color-text-on-accent)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <RotateCcw size={14} />
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <Gamepad2 size={32} color="var(--color-accent-primary)" />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Snake
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                      textAlign: 'center',
                    }}
                  >
                    Use arrow keys or WASD to move
                  </span>
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      playSound('click');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      background: 'var(--color-accent-primary)',
                      color: 'var(--color-text-on-accent)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Play size={14} />
                    Start Game
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Controls hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            padding: '8px 0',
          }}
        >
          {['W', 'A', 'S', 'D'].map((key) => (
            <div
              key={key}
              style={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {key}
            </div>
          ))}
        </div>
      </div>
    </WindowShell>
  );
}

export default GoOSSnakeGame;
