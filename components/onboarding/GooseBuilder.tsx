'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Loader2,
  Brain,
  Compass,
  FileText,
  Folder,
  AlertCircle,
  RefreshCw,
  Layout,
  MessageSquare,
  Clock,
  CalendarCheck,
  Heart,
  Link2,
  Star,
  Globe,
  Table2,
  Kanban,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SPRING, DURATION, EASE } from '@/lib/animations';
import { playSound } from '@/lib/sounds';
import { ConfettiBurst, SparkleEffect } from '@/components/ui/Delight';

// ============================================================================
// Types
// ============================================================================

interface BuildItem {
  id: string;
  type: 'widget' | 'file';
  fileType?: string;
  widgetType?: string;
  title: string;
  content?: string;
  purpose?: string;
  config?: Record<string, unknown>;
  linkUrl?: string;
  parentFolder?: string;
}

interface GooseBuilderProps {
  isActive: boolean;
  prompt: string;
  onItemCreated: (item: BuildItem, remaining: number) => void;
  onComplete: (items: BuildItem[], summary: string) => void;
  onWallpaper: (url: string) => void;
  onError: (message: string) => void;
}

type Phase = 'connecting' | 'understanding' | 'planning' | 'building' | 'complete' | 'error';

interface UnderstandingData {
  summary: string;
  identity?: {
    profession: string;
    niche: string;
    personality: string;
    experienceHint: string;
  };
  goals?: {
    primary: string;
    secondary?: string[];
    successLooksLike: string;
  };
  tone?: string;
}

interface PlanItem {
  name: string;
  type: string;
  purpose: string;
}

interface PlanData {
  summary: string;
  reasoning: string;
  items: PlanItem[];
}

// ============================================================================
// Palette — uses design system CSS variables (light/dark aware)
// ============================================================================

const C = {
  panel: 'var(--color-bg-elevated, rgba(255,255,255,0.92))',
  card: 'var(--color-bg-subtle, rgba(0,0,0,0.03))',
  border: 'var(--color-border-default, rgba(0,0,0,0.08))',
  accent: 'var(--color-accent-primary, #ff7722)',
  text: 'var(--color-text-primary, #171412)',
  textSub: 'var(--color-text-secondary, #4a4744)',
  textMuted: 'var(--color-text-muted, #8e827c)',
  success: 'var(--color-success, #22c55e)',
  error: 'var(--color-error, #ff3c34)',
} as const;

// ============================================================================
// Constants
// ============================================================================

const ICON_MAP: Record<string, typeof FileText> = {
  note: FileText, 'case-study': FileText, folder: Folder, embed: Globe,
  board: Kanban, sheet: Table2, link: Link2,
  status: Star, contact: MessageSquare, links: Link2, book: CalendarCheck,
  tipjar: Heart, feedback: MessageSquare, clock: Clock, widget: Layout,
};

const GOOSE_LINES: Record<Phase, string[]> = {
  connecting: ['Getting things ready...'],
  understanding: [
    'Understanding who you are...',
    'Reading between the lines...',
    'Analyzing your vibe...',
  ],
  planning: [
    'Designing something special...',
    'Drafting your blueprint...',
    'Planning your workspace...',
  ],
  building: [
    'Building away...',
    'Writing your content...',
    'Putting it all together...',
  ],
  complete: [
    'Your space is ready.',
  ],
  error: [
    'Something went wrong.',
  ],
};

function pickLine(phase: Phase): string {
  const lines = GOOSE_LINES[phase];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ============================================================================
// Animated Phase Ring — the centerpiece visual
// ============================================================================

function PhaseRing({ phase, progress }: { phase: Phase; progress: number }) {
  const prefersReducedMotion = useReducedMotion();
  const size = 56;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const isActive = phase !== 'error' && phase !== 'complete';
  const isComplete = phase === 'complete';

  const orbiterCount = phase === 'building' ? 3 : phase === 'planning' ? 2 : 1;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Background track */}
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={C.border}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? C.success : C.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset: circumference - (progress * circumference),
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>

      {/* Orbiting particles */}
      {isActive && !prefersReducedMotion && (
        <>
          {Array.from({ length: orbiterCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: C.accent,
                top: '50%',
                left: '50%',
                marginTop: -2,
                marginLeft: -2,
                boxShadow: `0 0 6px ${C.accent}`,
              }}
              animate={{
                rotate: [0 + (i * (360 / orbiterCount)), 360 + (i * (360 / orbiterCount))],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              transformTemplate={({ rotate }) =>
                `rotate(${rotate}) translateY(-${radius}px)`
              }
            />
          ))}
        </>
      )}

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={SPRING.snappy}
            >
              <Loader2 size={20} className="animate-spin" style={{ color: C.accent }} />
            </motion.div>
          )}
          {phase === 'understanding' && (
            <motion.div
              key="understanding"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={SPRING.snappy}
            >
              <Brain size={20} style={{ color: C.accent }} />
            </motion.div>
          )}
          {phase === 'planning' && (
            <motion.div
              key="planning"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={SPRING.snappy}
            >
              <Compass size={20} style={{ color: C.accent }} />
            </motion.div>
          )}
          {phase === 'building' && (
            <motion.div
              key="building"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={SPRING.snappy}
            >
              <motion.div
                animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                <Zap size={20} style={{ color: C.accent }} />
              </motion.div>
            </motion.div>
          )}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING.bouncy}
            >
              <Check size={22} strokeWidth={2.5} style={{ color: C.success }} />
            </motion.div>
          )}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING.snappy}
            >
              <AlertCircle size={20} style={{ color: C.error }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// Waveform Visualizer — shows during thinking phases
// ============================================================================

function ThinkingWaveform({ isActive }: { isActive: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const barCount = 16;

  if (prefersReducedMotion || !isActive) return null;

  return (
    <div
      className="flex items-end justify-center gap-px"
      style={{ height: 20 }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 2,
            borderRadius: 1,
            background: C.accent,
            opacity: 0.4,
          }}
          animate={{
            height: [3, 8 + Math.random() * 12, 3],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.6,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function GooseBuilder({ isActive, prompt, onItemCreated, onComplete, onWallpaper, onError }: GooseBuilderProps) {
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('connecting');
  const [statusMessage, setStatusMessage] = useState('');
  const [understanding, setUnderstanding] = useState<UnderstandingData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [createdItems, setCreatedItems] = useState<BuildItem[]>([]);
  const [currentlyBuilding, setCurrentlyBuilding] = useState<string | null>(null);
  const [, setCurrentPurpose] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [thinkingLines, setThinkingLines] = useState<string[]>([]);
  const [promptKeywords, setPromptKeywords] = useState<string[]>([]);
  const [recentlyCreated, setRecentlyCreated] = useState<BuildItem | null>(null);

  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use refs for callbacks to avoid stale closures in the SSE reader loop.
  const onItemCreatedRef = useRef(onItemCreated);
  const onCompleteRef = useRef(onComplete);
  const onWallpaperRef = useRef(onWallpaper);
  const onErrorRef = useRef(onError);
  onItemCreatedRef.current = onItemCreated;
  onCompleteRef.current = onComplete;
  onWallpaperRef.current = onWallpaper;
  onErrorRef.current = onError;

  // Queue for serializing item creation — prevents race conditions
  const itemQueueRef = useRef<Array<{ item: BuildItem; remaining: number }>>([]);
  const processingRef = useRef(false);

  const processItemQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    while (itemQueueRef.current.length > 0) {
      const { item, remaining } = itemQueueRef.current.shift()!;
      try {
        await onItemCreatedRef.current(item, remaining);
      } catch (err) {
        console.error('Failed to create item:', item.title, err);
      }
    }
    processingRef.current = false;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [understanding, plan, createdItems, currentlyBuilding]);

  const handleEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    switch (eventType) {
      case 'phase': {
        const p = data.phase as Phase;
        setPhase(p);
        setStatusMessage(pickLine(p));
        if (p === 'understanding') playSound('bubble');
        else if (p === 'planning') playSound('bubble');
        else if (p === 'building') playSound('pop');
        break;
      }
      case 'understanding': {
        setUnderstanding({
          summary: data.summary as string,
          identity: data.identity as UnderstandingData['identity'],
          goals: data.goals as UnderstandingData['goals'],
          tone: data.tone as string,
        });
        playSound('bubble');
        break;
      }
      case 'plan': {
        setPlan({
          summary: data.summary as string,
          reasoning: data.reasoning as string,
          items: (data.items as PlanItem[]) || [],
        });
        playSound('bubble');
        break;
      }
      case 'building': {
        setCurrentlyBuilding(data.name as string);
        setCurrentPurpose(data.purpose as string);
        break;
      }
      case 'created': {
        const item = data.item as BuildItem;
        const remaining = data.remaining as number;
        setCreatedItems(prev => [...prev, item]);
        setCurrentlyBuilding(null);
        setCurrentPurpose(null);
        setRecentlyCreated(item);
        setTimeout(() => setRecentlyCreated(prev => prev?.id === item.id ? null : prev), 2000);
        itemQueueRef.current.push({ item, remaining });
        processItemQueue();
        playSound('bubble');
        break;
      }
      case 'wallpaper': {
        const url = data.url as string;
        if (url) {
          console.log('[GooseBuilder] Wallpaper event — setting immediately:', url);
          onWallpaperRef.current(url);
        }
        break;
      }
      case 'complete': {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setPhase('complete');
          setStatusMessage(pickLine('complete'));
          setCurrentlyBuilding(null);
          playSound('expand');
          setShowConfetti(true);
          const items = data.items as BuildItem[];
          const summary = data.summary as string;
          setTimeout(() => {
            onCompleteRef.current(items, summary);
          }, 2500);
        }
        break;
      }
      case 'error': {
        setPhase('error');
        setError(data.message as string);
        setStatusMessage(pickLine('error'));
        break;
      }
      case 'thinking': {
        const text = data.text as string;
        if (text) {
          setThinkingLines(prev => [...prev.slice(-4), text]);
          playSound('clickSoft');
        }
        break;
      }
      case 'prompt_keywords': {
        setPromptKeywords((data.keywords as string[]) || []);
        break;
      }
    }
  }, [processItemQueue]);

  const startBuild = useCallback(async () => {
    setPhase('connecting');
    setStatusMessage(pickLine('connecting'));
    try {
      const response = await fetch('/api/ai/build-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Failed to connect');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      const processSSEBuffer = (raw: string) => {
        const messages = raw.split('\n\n');
        const remainder = messages.pop() || '';
        for (const msg of messages) {
          if (!msg.trim()) continue;
          const lines = msg.split('\n');
          let eventType = 'message';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) eventData = line.slice(6);
          }
          if (eventData) {
            try {
              handleEvent(eventType, JSON.parse(eventData));
            } catch (e) {
              console.error('SSE parse error:', e);
            }
          }
        }
        return remainder;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = processSSEBuffer(buffer);
      }

      buffer += decoder.decode();
      if (buffer.trim()) {
        processSSEBuffer(buffer + '\n\n');
      }
    } catch (err) {
      console.error('Stream error:', err);
      setPhase('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
      setStatusMessage(pickLine('error'));
    }
  }, [prompt, handleEvent]);

  useEffect(() => {
    if (!isActive || !prompt || hasStartedRef.current) return;
    hasStartedRef.current = true;
    hasCompletedRef.current = false;
    setPhase('connecting');
    setStatusMessage('');
    setUnderstanding(null);
    setPlan(null);
    setCreatedItems([]);
    setCurrentlyBuilding(null);
    setCurrentPurpose(null);
    setError(null);
    setShowConfetti(false);
    startBuild();
  }, [isActive, prompt, startBuild]);

  useEffect(() => {
    if (!isActive) {
      hasStartedRef.current = false;
      hasCompletedRef.current = false;
    }
  }, [isActive]);

  const handleRetry = useCallback(() => {
    hasStartedRef.current = false;
    hasCompletedRef.current = false;
    setUnderstanding(null);
    setPlan(null);
    setCreatedItems([]);
    setCurrentlyBuilding(null);
    setCurrentPurpose(null);
    setError(null);
    setShowConfetti(false);
    startBuild();
  }, [startBuild]);

  const handleCancel = useCallback(() => {
    onError('Build cancelled');
  }, [onError]);

  if (!isActive) return null;

  const spring = prefersReducedMotion ? { duration: DURATION.instant } : SPRING.gentle;
  const bounce = prefersReducedMotion ? { duration: DURATION.instant } : SPRING.bouncy;
  const isBuilding = phase === 'building';
  const isThinking = phase === 'understanding' || phase === 'planning';

  const totalPlan = plan?.items.length || 0;
  const phaseProgress = (() => {
    if (phase === 'complete') return 1;
    if (phase === 'error') return 0;
    if (phase === 'connecting') return 0.03;
    if (phase === 'understanding') return 0.15;
    if (phase === 'planning') return 0.3;
    if (totalPlan > 0) return 0.3 + (createdItems.length / totalPlan) * 0.7;
    return 0.35;
  })();

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />

      <AnimatePresence>
        {/* Floating panel — bottom-right, transparent over the desktop */}
        <motion.div
          className="fixed z-[10000] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={SPRING.smooth}
          style={{
            bottom: 96,
            right: 24,
            width: 380,
            maxHeight: '65vh',
            borderRadius: 'var(--radius-xl, 20px)',
            background: C.panel,
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: `1px solid ${C.border}`,
            boxShadow: 'var(--shadow-xl, 0 16px 48px rgba(23,20,18,0.15))',
          }}
        >
          {/* Ambient glow — shifts color with phase */}
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ borderRadius: 'var(--radius-xl, 20px)', zIndex: 0 }}
          >
            <motion.div
              className="absolute"
              style={{
                width: '140%',
                height: '140%',
                top: '-20%',
                left: '-20%',
                borderRadius: '50%',
                opacity: 0.04,
                filter: 'blur(40px)',
              }}
              animate={{
                background: phase === 'complete'
                  ? `radial-gradient(ellipse at center, ${C.success} 0%, transparent 70%)`
                  : phase === 'error'
                    ? `radial-gradient(ellipse at center, ${C.error} 0%, transparent 70%)`
                    : `radial-gradient(ellipse at center, ${C.accent} 0%, transparent 70%)`,
                scale: isBuilding ? [1, 1.1, 1] : 1,
              }}
              transition={isBuilding ? { repeat: Infinity, duration: 3, ease: 'easeInOut' } : { duration: 0.8 }}
            />
          </motion.div>

          {/* Animated border glow during active phases */}
          {(isBuilding || isThinking) && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ borderRadius: 'var(--radius-xl, 20px)', zIndex: 1 }}
              animate={{
                boxShadow: isBuilding
                  ? [
                    `inset 0 0 0 1px color-mix(in srgb, ${C.accent} 10%, transparent)`,
                    `inset 0 0 0 1px color-mix(in srgb, ${C.accent} 25%, transparent), 0 0 20px color-mix(in srgb, ${C.accent} 8%, transparent)`,
                    `inset 0 0 0 1px color-mix(in srgb, ${C.accent} 10%, transparent)`,
                  ]
                  : [
                    `inset 0 0 0 1px color-mix(in srgb, ${C.accent} 5%, transparent)`,
                    `inset 0 0 0 1px color-mix(in srgb, ${C.accent} 15%, transparent)`,
                    `inset 0 0 0 1px color-mix(in srgb, ${C.accent} 5%, transparent)`,
                  ],
              }}
              transition={{ repeat: Infinity, duration: isBuilding ? 2 : 3, ease: 'easeInOut' }}
            />
          )}

          {/* ─── Header ─── */}
          <div className="relative z-10 px-5 pt-5 pb-2">
            <div className="flex items-start gap-4">
              {/* Phase ring — the hero visual */}
              <PhaseRing phase={phase} progress={phaseProgress} />

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={phase === 'complete' ? 'done' : phase === 'error' ? 'err' : 'building'}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2, ease: EASE.out }}
                      style={{
                        fontSize: '0.875rem',
                        color: C.text,
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3,
                      }}
                    >
                      {phase === 'complete' ? 'Your space is ready' : phase === 'error' ? 'Something went wrong' : 'Building your space'}
                    </motion.h2>
                  </AnimatePresence>

                  {phase !== 'complete' && (
                    <button
                      onClick={handleCancel}
                      className="flex-shrink-0 p-1 rounded-lg transition-colors"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-subtle, rgba(0,0,0,0.04))'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      aria-label="Cancel build"
                    >
                      <X size={14} style={{ color: C.textMuted }} />
                    </button>
                  )}
                </div>

                {/* Status line */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusMessage}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs mt-0.5"
                    style={{ color: C.textMuted }}
                  >
                    {statusMessage}
                  </motion.p>
                </AnimatePresence>

                {/* Build counter */}
                {(isBuilding || phase === 'complete') && totalPlan > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 mt-1.5"
                  >
                    <span className="text-[11px] font-medium tabular-nums" style={{ color: C.accent }}>
                      {createdItems.length}
                    </span>
                    <span className="text-[10px]" style={{ color: C.textMuted }}>
                      / {totalPlan} files
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Waveform visualizer during thinking */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 28 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE.out }}
                  className="mt-3 overflow-hidden"
                >
                  <ThinkingWaveform isActive={isThinking} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Scrollable content ─── */}
          <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-5 pb-4 space-y-3 min-h-0">

            {/* Thinking lines */}
            <AnimatePresence>
              {thinkingLines.length > 0 && phase !== 'complete' && phase !== 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1 py-1"
                >
                  {thinkingLines.slice(-3).map((line, i, arr) => (
                    <motion.p
                      key={`${line}-${i}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{
                        opacity: i === arr.length - 1 ? 0.7 : 0.3,
                        x: 0,
                      }}
                      className="text-[11px] leading-snug"
                      style={{
                        color: C.textMuted,
                        fontStyle: 'italic',
                      }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Understanding card */}
            <AnimatePresence>
              {understanding && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="rounded-xl p-3.5"
                  style={{ background: C.card }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Brain size={12} style={{ color: C.accent }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.textMuted }}>
                      Understanding
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: C.text }}>
                    {understanding.summary}
                  </p>
                  {(understanding.identity?.profession || understanding.tone || promptKeywords.length > 0) && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {understanding.identity?.profession && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: 'color-mix(in srgb, var(--color-accent-primary, #ff7722) 8%, transparent)', color: C.accent }}
                        >
                          {understanding.identity.profession}
                        </span>
                      )}
                      {understanding.tone && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]"
                          style={{ background: C.card, color: C.textSub }}
                        >
                          {understanding.tone}
                        </span>
                      )}
                      {promptKeywords.map((kw, i) => (
                        <motion.span
                          key={kw}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: 'color-mix(in srgb, var(--color-accent-primary, #ff7722) 8%, transparent)',
                            color: C.accent,
                          }}
                        >
                          {kw}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan checklist */}
            <AnimatePresence>
              {plan && plan.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.08 }}
                  className="rounded-xl p-3.5"
                  style={{ background: C.card }}
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Compass size={12} style={{ color: C.accent }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.textMuted }}>
                      Plan
                    </span>
                    <span className="text-[10px] tabular-nums ml-auto font-medium" style={{ color: C.textMuted }}>
                      {createdItems.length}/{plan.items.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {plan.items.map((planItem, idx) => {
                      const isCreated = createdItems.some(ci => ci.title === planItem.name);
                      const isCurrBuilding = currentlyBuilding === planItem.name;
                      const Icon = ICON_MAP[planItem.type] || FileText;

                      return (
                        <motion.div
                          key={planItem.name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, ...SPRING.snappy }}
                          className="flex items-center gap-2 py-1 rounded-lg px-2 transition-colors"
                          style={{
                            background: isCurrBuilding
                              ? 'color-mix(in srgb, var(--color-accent-primary, #ff7722) 6%, transparent)'
                              : 'transparent',
                          }}
                        >
                          {/* Status indicator */}
                          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            {isCreated ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={bounce}
                              >
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: 'color-mix(in srgb, var(--color-success, #22c55e) 15%, transparent)' }}
                                >
                                  <Check size={10} strokeWidth={3} style={{ color: C.success }} />
                                </div>
                              </motion.div>
                            ) : isCurrBuilding ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                              >
                                <Loader2 size={14} style={{ color: C.accent }} />
                              </motion.div>
                            ) : (
                              <div
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ border: `1.5px solid color-mix(in srgb, ${C.textMuted} 40%, transparent)` }}
                              />
                            )}
                          </div>

                          <Icon size={11} className="flex-shrink-0" style={{ color: isCurrBuilding ? C.accent : C.textMuted }} />
                          <span
                            className="text-[12px] truncate"
                            style={{
                              color: isCreated ? C.success : isCurrBuilding ? C.text : C.textSub,
                              fontWeight: isCurrBuilding ? 500 : 400,
                            }}
                          >
                            {planItem.name}
                          </span>

                          {isCurrBuilding && !prefersReducedMotion && (
                            <motion.div
                              className="flex-shrink-0 ml-auto"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            >
                              <Sparkles size={10} style={{ color: C.accent }} />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recently created file — celebratory flash */}
            <AnimatePresence>
              {recentlyCreated && phase === 'building' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={SPRING.snappy}
                  className="relative rounded-xl p-3 overflow-hidden"
                  style={{ background: C.card }}
                >
                  <SparkleEffect trigger={true} config={{ count: 6, spread: 30, minSize: 3, maxSize: 6 }} />

                  <div className="flex items-center gap-2.5">
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'color-mix(in srgb, var(--color-accent-primary, #ff7722) 12%, transparent)' }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={SPRING.bouncy}
                    >
                      {(() => {
                        const Icon = ICON_MAP[recentlyCreated.fileType || ''] || FileText;
                        return <Icon size={14} style={{ color: C.accent }} />;
                      })()}
                    </motion.div>
                    <div className="min-w-0">
                      <motion.p
                        className="text-xs font-medium truncate"
                        style={{ color: C.text }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {recentlyCreated.title}
                      </motion.p>
                      <motion.p
                        className="text-[10px] mt-0.5"
                        style={{ color: C.textMuted }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Just created
                      </motion.p>
                    </div>
                    <motion.div
                      className="flex-shrink-0 ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...SPRING.bouncy, delay: 0.15 }}
                    >
                      <Check size={14} style={{ color: C.success }} />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            <AnimatePresence>
              {phase === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="rounded-xl p-4"
                  style={{ background: C.card }}
                >
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: C.textSub }}>
                    {error || 'Something went wrong. Please try again.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all hover:brightness-110"
                      style={{ background: C.accent, color: 'var(--color-text-on-accent, #fff)' }}
                    >
                      <RefreshCw size={12} />
                      Try again
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 rounded-full text-xs transition-all hover:opacity-70"
                      style={{ color: C.textMuted }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complete state — triumphant */}
            <AnimatePresence>
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={bounce}
                  className="rounded-xl p-5 text-center"
                  style={{ background: C.card }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...SPRING.bouncy, delay: 0.1 }}
                    className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent)' }}
                  >
                    <Check size={24} strokeWidth={2.5} style={{ color: C.success }} />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-semibold"
                    style={{ color: C.text }}
                  >
                    {createdItems.length} item{createdItems.length !== 1 ? 's' : ''} created
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-xs mt-1"
                    style={{ color: C.textMuted }}
                  >
                    Opening your space...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
