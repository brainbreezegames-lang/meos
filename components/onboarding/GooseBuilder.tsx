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
}

interface GooseBuilderProps {
  isActive: boolean;
  prompt: string;
  onItemCreated: (item: BuildItem, remaining: number) => void;
  onComplete: (items: BuildItem[], summary: string) => void;
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
// Cliento-inspired palette — solid darks, orange only on interactive elements
// ============================================================================

const C = {
  bg: '#0a0a0a',
  panel: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.06)',
  accent: '#F97316',
  text: 'rgba(255,255,255,0.9)',
  textSub: 'rgba(255,255,255,0.45)',
  textMuted: 'rgba(255,255,255,0.2)',
  success: '#22c55e',
  error: '#ef4444',
} as const;

// ============================================================================
// Constants
// ============================================================================

const ICON_MAP: Record<string, typeof FileText> = {
  note: FileText, 'case-study': FileText, folder: Folder, embed: Globe,
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

  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use refs for callbacks to avoid stale closures in the SSE reader loop.
  // The SSE loop captures startBuild → handleEvent at creation time. Without refs,
  // any state change that recreates these callbacks leaves the loop with stale versions.
  const onItemCreatedRef = useRef(onItemCreated);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  onItemCreatedRef.current = onItemCreated;
  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;

  // Queue for serializing item creation — prevents race conditions where
  // concurrent onItemCreated calls cause clearGoOSFiles to wipe newly-created files
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
        playSound('bubble');
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
        // Enqueue item creation to process sequentially (avoids race conditions)
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
          setTimeout(() => onCompleteRef.current(items, summary), 2500);
        }
        break;
      }
      case 'error': {
        setPhase('error');
        setError(data.message as string);
        setStatusMessage(pickLine('error'));
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

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

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ background: C.bg }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(249,115,22,0.03) 0%, transparent 70%)',
            }}
          />

          {/* Main content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-5 max-h-[85vh]">

              {/* =============== LEFT PANEL =============== */}
              <motion.div
                className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, ...SPRING.smooth }}
                style={{
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                }}
              >
                {/* Header */}
                <div className="p-6 pb-5">
                  <div className="flex items-center gap-3 mb-5">
                    <motion.span
                      className="text-3xl select-none"
                      animate={
                        phase === 'building'
                          ? { rotate: [-5, 5, -5], y: [0, -3, 0] }
                          : phase === 'complete'
                            ? { scale: [1, 1.3, 1] }
                            : {}
                      }
                      transition={{ repeat: phase === 'building' ? Infinity : 0, duration: 0.5 }}
                      role="img"
                      aria-label="Goose mascot"
                    >
                      🪿
                    </motion.span>
                    <div>
                      <h2
                        style={{
                          fontSize: '1.5rem',
                          color: C.text,
                          fontFamily: 'Georgia, "Times New Roman", serif',
                          fontStyle: 'italic',
                          fontWeight: 400,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {phase === 'complete' ? 'Your space is ready' : 'Building your space'}
                      </h2>
                      <motion.p
                        key={statusMessage}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm mt-0.5"
                        style={{ color: C.textSub }}
                      >
                        {statusMessage}
                      </motion.p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex gap-1.5" role="progressbar" aria-label="Build progress">
                    {PROGRESS_PHASES.map((p) => {
                      const curIdx = PROGRESS_PHASES.indexOf(phase as Phase);
                      const thisIdx = PROGRESS_PHASES.indexOf(p);
                      const done = thisIdx < curIdx || phase === 'complete';
                      const current = p === phase;
                      return (
                        <motion.div
                          key={p}
                          className="flex-1 h-1 rounded-full"
                          animate={{
                            backgroundColor: done
                              ? (phase === 'complete' ? C.success : C.accent)
                              : current
                                ? C.accent
                                : 'rgba(255,255,255,0.08)',
                          }}
                          transition={{ duration: 0.4 }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 min-h-0">

                  {/* Understanding */}
                  <AnimatePresence>
                    {understanding && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={spring}
                        className="rounded-xl p-4"
                        style={{ background: C.card, border: `1px solid ${C.border}` }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <Brain size={14} style={{ color: C.accent }} />
                          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                            Understanding
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                          {understanding.summary}
                        </p>
                        {(understanding.identity || understanding.goals || understanding.tone) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {understanding.identity?.profession && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: C.bg, color: C.textSub }}>
                                <span className="w-1 h-1 rounded-full" style={{ background: C.accent }} />
                                {understanding.identity.profession}
                              </span>
                            )}
                            {understanding.goals?.primary && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: C.bg, color: C.textSub }}>
                                <span className="w-1 h-1 rounded-full" style={{ background: C.accent }} />
                                {understanding.goals.primary}
                              </span>
                            )}
                            {understanding.tone && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: C.bg, color: C.textSub }}>
                                {understanding.tone} tone
                              </span>
                            )}
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
                        transition={{ ...spring, delay: 0.1 }}
                        className="rounded-xl p-4"
                        style={{ background: C.card, border: `1px solid ${C.border}` }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <Compass size={14} style={{ color: C.accent }} />
                          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                            Plan
                          </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: C.textSub }}>
                          {plan.summary}
                        </p>

                        <div className="space-y-3">
                          {plan.items.map((planItem, idx) => {
                            const isCreated = createdItems.some(ci => ci.title === planItem.name);
                            const isBuilding = currentlyBuilding === planItem.name;
                            const Icon = ICON_MAP[planItem.type] || FileText;

                            return (
                              <motion.div
                                key={planItem.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="flex items-start gap-2.5"
                              >
                                <div className="mt-0.5 flex-shrink-0">
                                  {isCreated ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bounce}>
                                      <Check size={14} style={{ color: C.success }} />
                                    </motion.div>
                                  ) : isBuilding ? (
                                    <Loader2 size={14} className="animate-spin" style={{ color: C.accent }} />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full" style={{ border: `2px solid ${C.textMuted}` }} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <Icon size={12} style={{ color: C.textMuted }} />
                                    <span
                                      className="text-sm font-medium"
                                      style={{
                                        color: isCreated ? C.success : isBuilding ? C.text : C.textSub,
                                      }}
                                    >
                                      {planItem.name}
                                    </span>
                                  </div>
                                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                                    {planItem.purpose}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Currently building */}
                  <AnimatePresence>
                    {currentlyBuilding && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 py-1"
                      >
                        <Loader2 size={14} className="animate-spin" style={{ color: C.accent }} />
                        <span className="text-sm" style={{ color: C.textSub }}>
                          Writing <strong style={{ color: C.text }}>{currentlyBuilding}</strong>
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  <AnimatePresence>
                    {phase === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4"
                        style={{ background: C.card, border: `1px solid ${C.border}` }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <AlertCircle size={14} style={{ color: C.error }} />
                          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                            Error
                          </span>
                        </div>
                        <p className="text-sm mb-4" style={{ color: C.textSub }}>
                          {error || 'Something went wrong.'}
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
                            style={{ background: C.accent, color: '#0a0a0a' }}
                          >
                            <RefreshCw size={14} />
                            Try again
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2.5 rounded-full text-sm transition-all hover:opacity-70"
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
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={bounce}
                        className="rounded-xl p-6 text-center"
                        style={{ background: C.card, border: `1px solid ${C.border}` }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={bounce}
                          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ background: 'rgba(34,197,94,0.1)' }}
                        >
                          <Check size={24} style={{ color: C.success }} />
                        </motion.div>
                        <p className="text-sm font-medium" style={{ color: C.text }}>
                          {createdItems.length} item{createdItems.length !== 1 ? 's' : ''} created
                        </p>
                        <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                          Opening your space...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                {phase !== 'complete' && phase !== 'error' && (
                  <div className="px-6 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
                    <button
                      onClick={handleCancel}
                      className="text-sm transition-all hover:opacity-70"
                      style={{ color: C.textMuted }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>

              {/* =============== RIGHT PANEL — Live Preview =============== */}
              <motion.div
                className="w-full lg:w-80 flex-shrink-0 rounded-2xl overflow-hidden flex flex-col min-h-0 max-h-[85vh]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, ...SPRING.smooth }}
                style={{
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="p-5 pb-3">
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: C.textMuted }}>
                    Your workspace
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    {createdItems.length > 0
                      ? `${createdItems.length} item${createdItems.length !== 1 ? 's' : ''} created`
                      : 'Items appear as they\u2019re built'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 min-h-0">
                  <AnimatePresence mode="popLayout">
                    {createdItems.map((item, index) => {
                      const Icon = ICON_MAP[item.widgetType || item.fileType || 'note'] || FileText;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 12 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.06, ...bounce }}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: C.card }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: C.bg }}
                          >
                            <Icon size={18} style={{ color: C.accent }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: C.text }}>
                              {item.title}
                            </p>
                            <p className="text-xs truncate" style={{ color: C.textMuted }}>
                              {item.purpose || (item.type === 'widget' ? item.widgetType : item.fileType)}
                            </p>
                          </div>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bounce}>
                            <Check size={16} style={{ color: C.success }} />
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Empty state */}
                  {createdItems.length === 0 && phase !== 'error' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <motion.span
                        className="text-4xl mb-3 select-none"
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      >
                        🪿
                      </motion.span>
                      <p className="text-sm" style={{ color: C.textMuted }}>
                        Items will appear here as they&apos;re created
                      </p>
                    </div>
                  )}
                </div>

                {/* Plan reasoning */}
                {plan?.reasoning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 py-4"
                    style={{ borderTop: `1px solid ${C.border}` }}
                  >
                    <p className="text-xs leading-relaxed italic" style={{ color: C.textMuted }}>
                      {plan.reasoning}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
