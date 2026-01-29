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
} from 'lucide-react';
import { SPRING, DURATION } from '@/lib/animations';
import { playSound } from '@/lib/sounds';
import { ConfettiBurst } from '@/components/ui/Delight';

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
  onComplete: (items: BuildItem[], summary: string, wallpaper?: { url: string } | null) => void;
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

const PROGRESS_PHASES: Phase[] = ['understanding', 'planning', 'building', 'complete'];

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
// Component
// ============================================================================

export function GooseBuilder({ isActive, prompt, onItemCreated, onComplete, onError }: GooseBuilderProps) {
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

  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use refs for callbacks to avoid stale closures in the SSE reader loop.
  const onItemCreatedRef = useRef(onItemCreated);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  onItemCreatedRef.current = onItemCreated;
  onCompleteRef.current = onComplete;
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
        // Phase-specific sounds
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
        itemQueueRef.current.push({ item, remaining });
        processItemQueue();
        playSound('bubble');
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
          const wallpaper = data.wallpaper as { url: string } | null | undefined;
          console.log('[GooseBuilder] Complete event — wallpaper:', wallpaper);
          setTimeout(() => {
            console.log('[GooseBuilder] Calling onComplete with wallpaper:', wallpaper);
            onCompleteRef.current(items, summary, wallpaper);
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
          setThinkingLines(prev => [...prev.slice(-4), text]); // Keep last 5 lines
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

      // Flush remaining buffer — the stream may close before the final \n\n
      buffer += decoder.decode(); // flush TextDecoder
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

  // Progress fraction for the overall bar
  const totalPlan = plan?.items.length || 0;
  const progressFraction = totalPlan > 0 ? createdItems.length / totalPlan : 0;

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />

      <AnimatePresence>
        {/* Floating panel — bottom-right, transparent over the desktop */}
        <motion.div
          className="fixed z-[10000] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={SPRING.smooth}
          style={{
            bottom: 96,
            right: 24,
            width: 360,
            maxHeight: '60vh',
            borderRadius: 20,
            background: C.panel,
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: `1px solid ${C.border}`,
            boxShadow: 'var(--shadow-xl, 0 16px 48px rgba(23,20,18,0.15))',
          }}
        >
          {/* Animated glow border during building */}
          {isBuilding && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ borderRadius: 20, zIndex: 1 }}
              animate={{
                boxShadow: [
                  '0 0 0 1px rgba(249,115,22,0.08)',
                  '0 0 12px 1px rgba(249,115,22,0.15)',
                  '0 0 0 1px rgba(249,115,22,0.08)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          )}

          {/* Header */}
          <div className="relative z-10 px-5 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <motion.span
                  className="text-xl select-none"
                  animate={
                    isBuilding
                      ? { rotate: [-5, 5, -5], y: [0, -2, 0] }
                      : phase === 'complete'
                        ? { scale: [1, 1.2, 1] }
                        : {}
                  }
                  transition={{ repeat: isBuilding ? Infinity : 0, duration: 0.5 }}
                  role="img"
                  aria-label="Goose mascot"
                >
                  🪿
                </motion.span>
                <div>
                  <h2
                    style={{
                      fontSize: '0.9375rem',
                      color: C.text,
                      fontFamily: 'var(--font-display, Georgia, serif)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                    }}
                  >
                    {phase === 'complete' ? 'Your space is ready' : 'Building your space'}
                  </h2>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={statusMessage}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-0.5"
                      style={{ color: C.textSub }}
                    >
                      {statusMessage}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
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

            {/* Progress bar */}
            <div className="relative h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-subtle, rgba(0,0,0,0.04))' }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                animate={{
                  width: phase === 'complete'
                    ? '100%'
                    : phase === 'error'
                      ? '0%'
                      : `${Math.max(5, progressFraction * 100)}%`,
                  backgroundColor: phase === 'complete' ? C.success : C.accent,
                }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </div>

          {/* Scrollable content */}
          <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-5 pb-4 space-y-3 min-h-0">

            {/* Understanding — compact */}
            <AnimatePresence>
              {understanding && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="rounded-xl p-3"
                  style={{ background: C.card }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Brain size={12} style={{ color: C.accent }} />
                    <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                      Understanding
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: C.text }}>
                    {understanding.summary}
                  </p>
                  {(understanding.identity?.profession || understanding.tone) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {understanding.identity?.profession && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--color-bg-subtle, rgba(0,0,0,0.04))', color: C.textSub }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: C.accent }} />
                          {understanding.identity.profession}
                        </span>
                      )}
                      {understanding.tone && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--color-bg-subtle, rgba(0,0,0,0.04))', color: C.textSub }}>
                          {understanding.tone}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan checklist — compact */}
            <AnimatePresence>
              {plan && plan.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.1 }}
                  className="rounded-xl p-3"
                  style={{ background: C.card }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Compass size={12} style={{ color: C.accent }} />
                    <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                      Plan
                    </span>
                    <span className="text-[10px] ml-auto" style={{ color: C.textMuted }}>
                      {createdItems.length}/{plan.items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {plan.items.map((planItem, idx) => {
                      const isCreated = createdItems.some(ci => ci.title === planItem.name);
                      const isCurrBuilding = currentlyBuilding === planItem.name;
                      const Icon = ICON_MAP[planItem.type] || FileText;

                      return (
                        <motion.div
                          key={planItem.name}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex items-center gap-2"
                        >
                          <div className="flex-shrink-0">
                            {isCreated ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bounce}>
                                <Check size={12} style={{ color: C.success }} />
                              </motion.div>
                            ) : isCurrBuilding ? (
                              <Loader2 size={12} className="animate-spin" style={{ color: C.accent }} />
                            ) : (
                              <div className="w-3 h-3 rounded-full" style={{ border: `1.5px solid ${C.textMuted}` }} />
                            )}
                          </div>
                          <Icon size={10} style={{ color: C.textMuted }} className="flex-shrink-0" />
                          <span
                            className="text-xs truncate"
                            style={{
                              color: isCreated ? C.success : isCurrBuilding ? C.text : C.textSub,
                            }}
                          >
                            {planItem.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Currently building indicator */}
            <AnimatePresence>
              {currentlyBuilding && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 py-0.5"
                >
                  <Loader2 size={12} className="animate-spin" style={{ color: C.accent }} />
                  <span className="text-xs" style={{ color: C.textSub }}>
                    Writing <strong style={{ color: C.text }}>{currentlyBuilding}</strong>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {phase === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3"
                  style={{ background: C.card }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle size={12} style={{ color: C.error }} />
                    <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                      Error
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: C.textSub }}>
                    {error || 'Something went wrong.'}
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

            {/* Complete */}
            <AnimatePresence>
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={bounce}
                  className="rounded-xl p-4 text-center"
                  style={{ background: C.card }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={bounce}
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent)' }}
                  >
                    <Check size={20} style={{ color: C.success }} />
                  </motion.div>
                  <p className="text-sm font-medium" style={{ color: C.text }}>
                    {createdItems.length} item{createdItems.length !== 1 ? 's' : ''} created
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    Opening your space...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
