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
import { SPRING, DURATION, EASE } from '@/lib/animations';
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
// Constants — design system tokens only, no hardcoded values
// ============================================================================

const ICON_MAP: Record<string, typeof FileText> = {
  note: FileText, 'case-study': FileText, folder: Folder, embed: Globe,
  board: Kanban, sheet: Table2, link: Link2, 'custom-app': Layout,
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
  complete: ['Your space is ready.'],
  error: ['Something went wrong.'],
};

function pickLine(phase: Phase): string {
  const lines = GOOSE_LINES[phase];
  return lines[Math.floor(Math.random() * lines.length)];
}

const PHASE_ICON: Record<Phase, typeof FileText> = {
  connecting: Loader2,
  understanding: Brain,
  planning: Compass,
  building: Loader2,
  complete: Check,
  error: AlertCircle,
};

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
      // Brief pause between items to prevent API contention
      if (itemQueueRef.current.length > 0) {
        await new Promise(r => setTimeout(r, 300));
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

  const PhaseIcon = PHASE_ICON[phase];
  const isSpinning = phase === 'connecting' || phase === 'building';

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />

      <AnimatePresence>
        <motion.div
          className="fixed z-[10000] flex flex-col overflow-hidden onboarding-builder-panel"
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={SPRING.smooth}
          style={{
            bottom: 96,
            right: 24,
            width: 380,
            maxHeight: '65vh',
            borderRadius: 'var(--window-radius)',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--shadow-window)',
          }}
        >
          {/* ─── Progress bar ─── */}
          <AnimatePresence>
            {phase !== 'complete' && phase !== 'error' && (
              <motion.div
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE.out }}
                style={{
                  height: 2,
                  background: 'var(--color-border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'var(--color-accent-primary)',
                    borderRadius: 'var(--radius-full)',
                    transformOrigin: 'left',
                  }}
                  animate={{
                    scaleX: phaseProgress,
                    opacity: prefersReducedMotion ? 1 : [1, 0.5, 1],
                  }}
                  transition={{
                    scaleX: { duration: 0.6, ease: EASE.expo },
                    opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Header ─── */}
          <div style={{ padding: 'var(--space-4) var(--space-5) var(--space-2)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={SPRING.snappy}
                    className="flex-shrink-0"
                  >
                    <PhaseIcon
                      size={16}
                      strokeWidth={2}
                      className={isSpinning && !prefersReducedMotion ? 'animate-spin' : ''}
                      style={{
                        color: phase === 'complete'
                          ? 'var(--color-success)'
                          : phase === 'error'
                            ? 'var(--color-error)'
                            : 'var(--color-accent-primary)',
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.h2
                    key={phase === 'complete' ? 'done' : phase === 'error' ? 'err' : 'building'}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2, ease: EASE.out }}
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-weight-semibold)',
                      letterSpacing: 'var(--letter-spacing-tight)',
                      lineHeight: 'var(--line-height-snug)',
                      fontFamily: 'var(--font-body)',
                      margin: 0,
                    }}
                  >
                    {phase === 'complete' ? 'Your space is ready' : phase === 'error' ? 'Something went wrong' : 'Building your space'}
                  </motion.h2>
                </AnimatePresence>
              </div>

              {phase !== 'complete' && (
                <button
                  onClick={handleCancel}
                  className="flex-shrink-0 flex items-center justify-center transition-colors"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-subtle-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  aria-label="Cancel build"
                >
                  <X size={13} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>

            {/* Status line */}
            <div style={{ paddingLeft: 24 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusMessage}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 'var(--line-height-normal)',
                    margin: '2px 0 0',
                  }}
                >
                  {statusMessage}
                </motion.p>
              </AnimatePresence>

              {/* Build counter */}
              {(phase === 'building' || phase === 'complete') && totalPlan > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontFamily: 'var(--font-body)',
                    margin: '4px 0 0',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span style={{ color: 'var(--color-accent-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                    {createdItems.length}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {' '}/ {totalPlan} files
                  </span>
                </motion.p>
              )}
            </div>
          </div>

          {/* ─── Scrollable content ─── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto min-h-0"
            style={{ padding: '0 var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >

            {/* Thinking lines */}
            <AnimatePresence>
              {thinkingLines.length > 0 && phase !== 'complete' && phase !== 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4, paddingBottom: 4 }}
                >
                  {thinkingLines.slice(-3).map((line, i, arr) => {
                    const isLatest = i === arr.length - 1;
                    return (
                      <motion.p
                        key={`${line}-${i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{
                          opacity: isLatest ? 0.7 : 0.3,
                          y: 0,
                        }}
                        transition={isLatest ? SPRING.snappy : { duration: DURATION.normal, ease: EASE.out }}
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          fontFamily: 'var(--font-body)',
                          lineHeight: 'var(--line-height-normal)',
                          color: 'var(--color-text-muted)',
                          fontStyle: 'italic',
                          margin: 0,
                        }}
                      >
                        {line}
                      </motion.p>
                    );
                  })}
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
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                  }}
                >
                  <div className="flex items-center" style={{ gap: 6, marginBottom: 'var(--space-2)' }}>
                    <Brain size={12} style={{ color: 'var(--color-accent-primary)' }} />
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 'var(--font-weight-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: 'var(--letter-spacing-wider)',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Understanding
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 'var(--line-height-relaxed)',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {understanding.summary}
                  </p>
                  {(understanding.identity?.profession || understanding.tone || promptKeywords.length > 0) && (
                    <div className="flex flex-wrap" style={{ gap: 6, marginTop: 'var(--space-2)' }}>
                      {understanding.identity?.profession && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '10px',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: 'var(--font-body)',
                            background: 'var(--color-accent-primary-subtle)',
                            color: 'var(--color-accent-primary)',
                          }}
                        >
                          {understanding.identity.profession}
                        </span>
                      )}
                      {understanding.tone && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '10px',
                            fontFamily: 'var(--font-body)',
                            background: 'var(--color-bg-subtle-hover)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {understanding.tone}
                        </span>
                      )}
                      {promptKeywords.map((kw, i) => (
                        <motion.span
                          key={kw}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05, ...SPRING.snappy }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '10px',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: 'var(--font-body)',
                            background: 'var(--color-accent-primary-subtle)',
                            color: 'var(--color-accent-primary)',
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
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <Compass size={12} style={{ color: 'var(--color-accent-primary)' }} />
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 'var(--font-weight-semibold)',
                          textTransform: 'uppercase',
                          letterSpacing: 'var(--letter-spacing-wider)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Plan
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {createdItems.length}/{plan.items.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                          className="flex items-center"
                          style={{
                            position: 'relative',
                            gap: 'var(--space-2)',
                            padding: '4px var(--space-2)',
                            borderRadius: 'var(--radius-sm)',
                            background: isCurrBuilding ? 'var(--color-accent-primary-subtle)' : 'transparent',
                          }}
                        >
                          {/* Sliding accent indicator */}
                          {isCurrBuilding && !prefersReducedMotion && (
                            <motion.div
                              layoutId="active-build-indicator"
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 2,
                                bottom: 2,
                                width: 2,
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-accent-primary)',
                              }}
                              transition={SPRING.snappy}
                            />
                          )}
                          {/* Status indicator */}
                          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 16, height: 16 }}>
                            {isCreated ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={bounce}
                                className="flex items-center justify-center"
                                style={{
                                  width: 16, height: 16,
                                  borderRadius: 'var(--radius-full)',
                                  background: 'var(--color-success-subtle)',
                                }}
                              >
                                <Check size={10} strokeWidth={3} style={{ color: 'var(--color-success)' }} />
                              </motion.div>
                            ) : isCurrBuilding ? (
                              <motion.div
                                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                              >
                                <Loader2 size={14} style={{ color: 'var(--color-accent-primary)' }} />
                              </motion.div>
                            ) : (
                              <div
                                style={{
                                  width: 14, height: 14,
                                  borderRadius: 'var(--radius-full)',
                                  border: '1.5px solid var(--color-border-strong)',
                                }}
                              />
                            )}
                          </div>

                          <Icon
                            size={11}
                            className="flex-shrink-0"
                            style={{ color: isCurrBuilding ? 'var(--color-accent-primary)' : 'var(--color-text-muted)' }}
                          />
                          <span
                            className="truncate"
                            style={{
                              fontSize: '12px',
                              fontFamily: 'var(--font-body)',
                              color: isCreated
                                ? 'var(--color-success)'
                                : isCurrBuilding
                                  ? 'var(--color-text-primary)'
                                  : 'var(--color-text-secondary)',
                              fontWeight: isCurrBuilding ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
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

            {/* Recently created file */}
            <AnimatePresence>
              {recentlyCreated && phase === 'building' && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={SPRING.snappy}
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3)',
                  }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                    <motion.div
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: 32, height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-accent-primary-subtle)',
                      }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={SPRING.bouncy}
                    >
                      {(() => {
                        const Icon = ICON_MAP[recentlyCreated.fileType || ''] || FileText;
                        return <Icon size={14} style={{ color: 'var(--color-accent-primary)' }} />;
                      })()}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <motion.p
                        className="truncate"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-text-primary)',
                          margin: 0,
                        }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {recentlyCreated.title}
                      </motion.p>
                      <motion.p
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-body)',
                          color: 'var(--color-text-muted)',
                          margin: '2px 0 0',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Just created
                      </motion.p>
                    </div>
                    <motion.div
                      className="flex-shrink-0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...SPRING.bouncy, delay: 0.15 }}
                    >
                      <Check size={14} style={{ color: 'var(--color-success)' }} />
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
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 'var(--line-height-relaxed)',
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 var(--space-3)',
                    }}
                  >
                    {error || 'Something went wrong. Please try again.'}
                  </p>
                  <div className="flex" style={{ gap: 'var(--space-2)' }}>
                    <button
                      onClick={handleRetry}
                      className="flex items-center transition-all"
                      style={{
                        gap: 6,
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-body)',
                        background: 'var(--color-accent-primary)',
                        color: 'var(--color-text-on-accent)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={12} />
                      Try again
                    </button>
                    <button
                      onClick={handleCancel}
                      className="transition-all"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-sm)',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--color-text-muted)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complete state */}
            <AnimatePresence>
              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={bounce}
                  className="text-center"
                  style={{
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-5)',
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...SPRING.bouncy, delay: 0.1 }}
                    className="mx-auto flex items-center justify-center"
                    style={{
                      width: 48, height: 48,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-success-subtle)',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    <Check size={24} strokeWidth={2.5} style={{ color: 'var(--color-success)' }} />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {createdItems.length} item{createdItems.length !== 1 ? 's' : ''} created
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text-muted)',
                      margin: '4px 0 0',
                    }}
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
