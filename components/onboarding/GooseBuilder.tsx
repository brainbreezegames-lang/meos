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
        <motion.div
          className="fixed z-[10000] flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={SPRING.smooth}
          style={{
            bottom: 96,
            right: 24,
            width: 380,
            maxHeight: '65vh',
            borderRadius: 'var(--radius-dock, 20px)',
            background: 'var(--color-bg-base, #fbf9ef)',
            border: '1px solid var(--color-border-default, rgba(23,20,18,0.08))',
            boxShadow: 'var(--shadow-window, 0 2px 4px rgba(23,20,18,0.04), 0 12px 32px rgba(23,20,18,0.12), 0 24px 60px rgba(23,20,18,0.08))',
          }}
        >
          {/* Subtle top accent line — shows phase color */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderRadius: 'var(--radius-dock, 20px) var(--radius-dock, 20px) 0 0',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <motion.div
              style={{ height: '100%' }}
              animate={{
                width: phase === 'complete'
                  ? '100%'
                  : phase === 'error'
                    ? '0%'
                    : `${Math.max(5, progressFraction * 100)}%`,
                backgroundColor: phase === 'complete'
                  ? 'var(--color-success, #22c55e)'
                  : 'var(--color-accent-primary, #ff7722)',
              }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>

          {/* Header */}
          <div
            style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--color-border-subtle, rgba(23,20,18,0.05))',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                      color: 'var(--color-text-primary, #171412)',
                      fontFamily: 'var(--font-display, Georgia, serif)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      margin: 0,
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
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary, #4a4744)',
                        marginTop: 2,
                        margin: 0,
                        marginBlockStart: 2,
                      }}
                    >
                      {statusMessage}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
              {phase !== 'complete' && (
                <button
                  onClick={handleCancel}
                  className="flex-shrink-0 flex items-center justify-center transition-colors"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted, #8e827c)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-subtle, #f2f0e7)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  aria-label="Cancel build"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto min-h-0"
            style={{ padding: '16px 20px 20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Understanding section */}
              <AnimatePresence>
                {understanding && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={spring}
                    style={{
                      borderRadius: 'var(--radius-lg, 12px)',
                      padding: 14,
                      background: 'var(--color-bg-subtle, #f2f0e7)',
                    }}
                  >
                    <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
                      <Brain size={12} style={{ color: 'var(--color-accent-primary, #ff7722)' }} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--color-text-muted, #8e827c)',
                        }}
                      >
                        Understanding
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        lineHeight: 1.55,
                        color: 'var(--color-text-primary, #171412)',
                        margin: 0,
                      }}
                    >
                      {understanding.summary}
                    </p>
                    {(understanding.identity?.profession || understanding.tone) && (
                      <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
                        {understanding.identity?.profession && (
                          <span
                            className="inline-flex items-center gap-1"
                            style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full, 9999px)',
                              fontSize: 11,
                              fontWeight: 500,
                              background: 'var(--color-bg-base, #fbf9ef)',
                              color: 'var(--color-text-secondary, #4a4744)',
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: 'var(--color-accent-primary, #ff7722)',
                              }}
                            />
                            {understanding.identity.profession}
                          </span>
                        )}
                        {understanding.tone && (
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full, 9999px)',
                              fontSize: 11,
                              fontWeight: 500,
                              background: 'var(--color-bg-base, #fbf9ef)',
                              color: 'var(--color-text-secondary, #4a4744)',
                            }}
                          >
                            {understanding.tone}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prompt keywords */}
              <AnimatePresence>
                {promptKeywords.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-1.5"
                  >
                    {promptKeywords.map((kw, i) => (
                      <motion.span
                        key={kw}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full, 9999px)',
                          fontSize: 11,
                          fontWeight: 500,
                          background: 'color-mix(in srgb, var(--color-accent-primary, #ff7722) 10%, transparent)',
                          color: 'var(--color-accent-primary, #ff7722)',
                        }}
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thinking lines */}
              <AnimatePresence>
                {thinkingLines.length > 0 && phase !== 'complete' && phase !== 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    {thinkingLines.slice(-3).map((line, i, arr) => (
                      <motion.p
                        key={`${line}-${i}`}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: i === arr.length - 1 ? 0.8 : 0.4, x: 0 }}
                        style={{
                          fontSize: 11,
                          fontStyle: 'italic',
                          lineHeight: 1.4,
                          color: 'var(--color-text-muted, #8e827c)',
                          margin: 0,
                        }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Plan checklist */}
              <AnimatePresence>
                {plan && plan.items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.1 }}
                    style={{
                      borderRadius: 'var(--radius-lg, 12px)',
                      padding: 14,
                      background: 'var(--color-bg-subtle, #f2f0e7)',
                    }}
                  >
                    <div className="flex items-center gap-1.5" style={{ marginBottom: 10 }}>
                      <Compass size={12} style={{ color: 'var(--color-accent-primary, #ff7722)' }} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--color-text-muted, #8e827c)',
                        }}
                      >
                        Plan
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          marginLeft: 'auto',
                          color: 'var(--color-text-muted, #8e827c)',
                          fontWeight: 500,
                        }}
                      >
                        {createdItems.length}/{plan.items.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                            className="flex items-center gap-2.5"
                          >
                            <div className="flex-shrink-0" style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
                              {isCreated ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bounce}>
                                  <Check size={13} strokeWidth={2.5} style={{ color: 'var(--color-success, #22c55e)' }} />
                                </motion.div>
                              ) : isCurrBuilding ? (
                                <Loader2 size={13} className="animate-spin" style={{ color: 'var(--color-accent-primary, #ff7722)' }} />
                              ) : (
                                <div
                                  style={{
                                    width: 13,
                                    height: 13,
                                    borderRadius: '50%',
                                    border: '1.5px solid var(--color-text-muted, #8e827c)',
                                    opacity: 0.5,
                                  }}
                                />
                              )}
                            </div>
                            <Icon
                              size={11}
                              style={{ color: 'var(--color-text-muted, #8e827c)', flexShrink: 0 }}
                            />
                            <span
                              className="truncate"
                              style={{
                                fontSize: '0.8125rem',
                                lineHeight: 1.3,
                                fontWeight: isCurrBuilding ? 500 : 400,
                                color: isCreated
                                  ? 'var(--color-success, #22c55e)'
                                  : isCurrBuilding
                                    ? 'var(--color-text-primary, #171412)'
                                    : 'var(--color-text-secondary, #4a4744)',
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
                    className="flex items-center gap-2"
                    style={{ paddingTop: 2 }}
                  >
                    <Loader2 size={12} className="animate-spin" style={{ color: 'var(--color-accent-primary, #ff7722)' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary, #4a4744)' }}>
                      Writing{' '}
                      <strong style={{ color: 'var(--color-text-primary, #171412)', fontWeight: 600 }}>
                        {currentlyBuilding}
                      </strong>
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
                    style={{
                      borderRadius: 'var(--radius-lg, 12px)',
                      padding: 14,
                      background: 'var(--color-bg-subtle, #f2f0e7)',
                    }}
                  >
                    <div className="flex items-center gap-1.5" style={{ marginBottom: 8 }}>
                      <AlertCircle size={12} style={{ color: 'var(--color-error, #ff3c34)' }} />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'var(--color-text-muted, #8e827c)',
                        }}
                      >
                        Error
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary, #4a4744)',
                        margin: 0,
                        marginBottom: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {error || 'Something went wrong.'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 transition-all"
                        style={{
                          padding: '8px 18px',
                          borderRadius: 'var(--radius-full, 9999px)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          background: 'var(--color-accent-primary, #ff7722)',
                          color: 'var(--color-text-on-accent, #fff)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={13} />
                        Try again
                      </button>
                      <button
                        onClick={handleCancel}
                        className="transition-all"
                        style={{
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-full, 9999px)',
                          fontSize: '0.8125rem',
                          color: 'var(--color-text-muted, #8e827c)',
                          background: 'none',
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

              {/* Complete */}
              <AnimatePresence>
                {phase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={bounce}
                    style={{
                      borderRadius: 'var(--radius-lg, 12px)',
                      padding: '20px 14px',
                      background: 'var(--color-bg-subtle, #f2f0e7)',
                      textAlign: 'center',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={bounce}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        margin: '0 auto 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent)',
                      }}
                    >
                      <Check size={20} style={{ color: 'var(--color-success, #22c55e)' }} />
                    </motion.div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary, #171412)',
                        margin: 0,
                      }}
                    >
                      {createdItems.length} item{createdItems.length !== 1 ? 's' : ''} created
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted, #8e827c)',
                        marginTop: 4,
                        margin: 0,
                        marginBlockStart: 4,
                      }}
                    >
                      Opening your space...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
