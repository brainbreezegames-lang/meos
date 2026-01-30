'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface PomodoroWidgetConfig {
  workDuration: number;      // minutes
  breakDuration: number;     // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // sessions before long break
}

interface PomodoroWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

const DEFAULT_CONFIG: PomodoroWidgetConfig = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

type TimerPhase = 'idle' | 'work' | 'break' | 'longBreak';

const PHASE_COLORS: Record<TimerPhase, string> = {
  idle: '#ff6b00',
  work: '#ff6b00',
  break: '#4ade80',
  longBreak: '#60a5fa',
};

const PHASE_LABELS: Record<TimerPhase, string> = {
  idle: 'Ready',
  work: 'Focus',
  break: 'Break',
  longBreak: 'Long Break',
};

// Theme colors
const THEMES = {
  light: {
    housing: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.1),
      0 20px 48px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.03)
    `,
    face: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    faceShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    detailBg: 'linear-gradient(180deg, #f0f0ee 0%, #e4e4e0 100%)',
    detailDot: '#d0d0cc',
    buttonBg: 'linear-gradient(180deg, #f4f4f2 0%, #e8e8e4 100%)',
    buttonShadow: '0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
    buttonActiveBg: 'linear-gradient(180deg, #e0e0dc 0%, #d4d4d0 100%)',
  },
  dark: {
    housing: 'linear-gradient(180deg, #2a2a28 0%, #1e1e1c 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 20px 48px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
    face: 'linear-gradient(180deg, #242422 0%, #1a1a18 100%)',
    faceShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
    textPrimary: '#f0f0ec',
    textSecondary: '#a0a09c',
    textMuted: '#6a6a68',
    detailBg: 'linear-gradient(180deg, #3a3a38 0%, #2a2a28 100%)',
    detailDot: '#4a4a48',
    buttonBg: 'linear-gradient(180deg, #3a3a38 0%, #2e2e2c 100%)',
    buttonShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    buttonActiveBg: 'linear-gradient(180deg, #2e2e2c 0%, #242422 100%)',
  },
};

export function PomodoroWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: PomodoroWidgetProps) {
  const config: PomodoroWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<PomodoroWidgetConfig>) };

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(config.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dark mode detection
  useEffect(() => {
    setMounted(true);
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Timer finished — transition to next phase
          setIsRunning(false);
          if (phase === 'work') {
            const newCompleted = completedSessions + 1;
            setCompletedSessions(newCompleted);
            if (newCompleted % config.longBreakInterval === 0) {
              setPhase('longBreak');
              return config.longBreakDuration * 60;
            } else {
              setPhase('break');
              return config.breakDuration * 60;
            }
          } else {
            // After break, back to work
            setPhase('work');
            return config.workDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, completedSessions, config]);

  const handlePlayPause = useCallback(() => {
    if (phase === 'idle') {
      setPhase('work');
      setSecondsRemaining(config.workDuration * 60);
      setIsRunning(true);
    } else {
      setIsRunning(prev => !prev);
    }
  }, [phase, config.workDuration]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setPhase('idle');
    setSecondsRemaining(config.workDuration * 60);
    setCompletedSessions(0);
  }, [config.workDuration]);

  const handleSkip = useCallback(() => {
    setIsRunning(false);
    if (phase === 'work') {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      if (newCompleted % config.longBreakInterval === 0) {
        setPhase('longBreak');
        setSecondsRemaining(config.longBreakDuration * 60);
      } else {
        setPhase('break');
        setSecondsRemaining(config.breakDuration * 60);
      }
    } else {
      setPhase('work');
      setSecondsRemaining(config.workDuration * 60);
    }
  }, [phase, completedSessions, config]);

  const theme = isDark ? THEMES.dark : THEMES.light;
  const phaseColor = PHASE_COLORS[phase];

  // Calculate progress (0 to 1)
  const totalSeconds = phase === 'work' ? config.workDuration * 60
    : phase === 'break' ? config.breakDuration * 60
    : phase === 'longBreak' ? config.longBreakDuration * 60
    : config.workDuration * 60;
  const progress = 1 - (secondsRemaining / totalSeconds);

  // Format time
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const SIZE = 200;
  const FACE_SIZE = 170;
  const CENTER = FACE_SIZE / 2;
  const RING_RADIUS = 72;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  if (!mounted) {
    return (
      <WidgetWrapper widget={widget} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} onPositionChange={onPositionChange} onContextMenu={onContextMenu} isHighlighted={isHighlighted}>
        <div style={{ width: SIZE, height: SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: theme.textMuted, fontSize: 12 }}>...</div>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper widget={widget} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} onPositionChange={onPositionChange} onContextMenu={onContextMenu} isHighlighted={isHighlighted}>
      {/* Outer housing */}
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 24,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top-left detail */}
        <div
          style={{
            position: 'absolute', top: 12, left: 12,
            width: 10, height: 10, borderRadius: '50%',
            background: theme.detailBg,
            boxShadow: `inset 0 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.08}), 0 1px 0 rgba(255, 255, 255, ${isDark ? 0.05 : 0.8})`,
            transition: 'all 0.3s ease',
          }}
        />

        {/* Top-right speaker grille */}
        <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: 2 }}>
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: theme.detailDot, transition: 'all 0.3s ease' }} />
          ))}
        </div>

        {/* Clock face */}
        <div
          style={{
            width: FACE_SIZE,
            height: FACE_SIZE,
            borderRadius: '50%',
            background: theme.face,
            boxShadow: theme.faceShadow,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {/* SVG progress ring */}
          <svg
            width={FACE_SIZE}
            height={FACE_SIZE}
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            {/* Background track */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
              strokeWidth={4}
            />
            {/* Progress arc */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={phaseColor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              style={{ transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease' }}
            />
          </svg>

          {/* Phase label */}
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: phaseColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 2,
              transition: 'color 0.3s ease',
            }}
          >
            {PHASE_LABELS[phase]}
          </div>

          {/* Time display */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: theme.textPrimary,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              transition: 'color 0.3s ease',
            }}
          >
            {timeDisplay}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, position: 'relative', zIndex: 1 }}>
            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                width: 24, height: 24, borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: theme.buttonBg,
                boxShadow: theme.buttonShadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: theme.textSecondary,
                transition: 'all 0.15s ease',
              }}
              aria-label="Reset timer"
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M2 2v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.05 9A6 6 0 1 0 4.5 4.5L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={handlePlayPause}
              style={{
                width: 32, height: 24, borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: phaseColor,
                color: '#fff',
                boxShadow: `0 1px 3px ${phaseColor}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10,
                transition: 'all 0.15s ease',
              }}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1"/>
                  <rect x="9" y="2" width="4" height="12" rx="1"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2l10 6-10 6V2z"/>
                </svg>
              )}
            </button>

            {/* Skip */}
            <button
              onClick={handleSkip}
              style={{
                width: 24, height: 24, borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: theme.buttonBg,
                boxShadow: theme.buttonShadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: theme.textSecondary,
                transition: 'all 0.15s ease',
              }}
              aria-label="Skip to next phase"
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2l8 6-8 6V2z"/>
                <rect x="12" y="2" width="2" height="12"/>
              </svg>
            </button>
          </div>

          {/* Session dots */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8, position: 'relative', zIndex: 1 }}>
            {[...Array(config.longBreakInterval)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i < (completedSessions % config.longBreakInterval)
                    ? phaseColor
                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom feet */}
        {[
          { bottom: 8, left: 8 },
          { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', ...pos,
              width: 6, height: 6, borderRadius: '50%',
              background: theme.detailBg,
              boxShadow: `inset 0 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as POMODORO_WIDGET_DEFAULT_CONFIG };
