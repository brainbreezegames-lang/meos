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
// Dark Theme Palette
// ============================================================================

const PALETTE = {
  // Surfaces
  panelBg: 'rgba(12, 10, 9, 0.94)',
  panelBgAlt: 'rgba(15, 13, 11, 0.90)',
  cardBg: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.07)',

  // Accent
  accent: '#F97316',
  accentLight: '#FB923C',
  accentSubtle: 'rgba(249, 115, 22, 0.10)',
  accentBorder: 'rgba(249, 115, 22, 0.18)',

  // Text
  textPrimary: 'rgba(255, 255, 255, 0.92)',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.30)',

  // Semantic
  success: '#22c55e',
  successSubtle: 'rgba(34, 197, 94, 0.10)',
  successBorder: 'rgba(34, 197, 94, 0.18)',
  error: '#ef4444',
  errorSubtle: 'rgba(239, 68, 68, 0.08)',
  errorBorder: 'rgba(239, 68, 68, 0.18)',

  // Misc
  divider: 'rgba(255, 255, 255, 0.06)',
  inactive: 'rgba(255, 255, 255, 0.08)',
  tagBg: 'rgba(255, 255, 255, 0.06)',
} as const;

const SERIF = 'Georgia, "Times New Roman", serif';

// ============================================================================
// Constants
// ============================================================================

const PHASE_CONFIG: Record<Phase, { label: string; color: string }> = {
  connecting: { label: 'Getting ready', color: PALETTE.textMuted },
  understanding: { label: 'Understanding you', color: PALETTE.accent },
  planning: { label: 'Designing your space', color: PALETTE.accentLight },
  building: { label: 'Creating your workspace', color: PALETTE.accent },
  complete: { label: 'All done!', color: PALETTE.success },
  error: { label: 'Something went wrong', color: PALETTE.error },
};

const ICON_MAP: Record<string, typeof FileText> = {
  // File types
  note: FileText,
  'case-study': FileText,
  folder: Folder,
  embed: Globe,
  // Widget types
  status: Star,
  contact: MessageSquare,
  links: Link2,
  book: CalendarCheck,
  tipjar: Heart,
  feedback: MessageSquare,
  clock: Clock,
  // Fallback for "widget" type in plan items
  widget: Layout,
};

const PROGRESS_PHASES: Phase[] = ['understanding', 'planning', 'building', 'complete'];

const GOOSE_LINES: Record<Phase, string[]> = {
  connecting: ['Honk! Getting things ready...'],
  understanding: [
    'Let me understand who you are...',
    'Reading between the lines... *goose stare*',
    'Analyzing your vibe...',
  ],
  planning: [
    'Designing something special for you...',
    'Drawing blueprints with my beak...',
    'Consulting the council of geese...',
  ],
  building: [
    'Now the fun part! Building away...',
    'Constructing with feathers and determination...',
    'Pecking away at the keyboard...',
  ],
  complete: [
    'Your nest is ready!',
    'Ta-da! *proud goose noises*',
  ],
  error: [
    'Honk! Something went sideways...',
    'Even geese make mistakes...',
  ],
};

function pickGooseLine(phase: Phase): string {
  const lines = GOOSE_LINES[phase];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ============================================================================
// Component
// ============================================================================

export function GooseBuilder({ isActive, prompt, onItemCreated, onComplete, onError }: GooseBuilderProps) {
  const prefersReducedMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>('connecting');
  const [gooseMessage, setGooseMessage] = useState('');
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

  // Auto-scroll progress panel
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [understanding, plan, createdItems, currentlyBuilding]);

  // SSE event handler
  const handleEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    switch (eventType) {
      case 'phase': {
        const p = data.phase as Phase;
        setPhase(p);
        setGooseMessage(pickGooseLine(p));
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
        onItemCreated(item, remaining);
        playSound('bubble');
        break;
      }
      case 'complete': {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setPhase('complete');
          setGooseMessage(pickGooseLine('complete'));
          setCurrentlyBuilding(null);
          playSound('expand');
          setShowConfetti(true);
          const items = data.items as BuildItem[];
          const summary = data.summary as string;
          setTimeout(() => onComplete(items, summary), 2500);
        }
        break;
      }
      case 'error': {
        setPhase('error');
        setError(data.message as string);
        setGooseMessage(pickGooseLine('error'));
        break;
      }
    }
  }, [onItemCreated, onComplete]);

  // Start SSE stream
  const startBuild = useCallback(async () => {
    setPhase('connecting');
    setGooseMessage(pickGooseLine('connecting'));
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
      setGooseMessage(pickGooseLine('error'));
    }
  }, [prompt, handleEvent]);

  // Lifecycle
  useEffect(() => {
    if (!isActive || !prompt || hasStartedRef.current) return;
    hasStartedRef.current = true;
    hasCompletedRef.current = false;
    setPhase('connecting');
    setGooseMessage('');
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
        >
          {/* Background — same image as OnboardingPrompt for visual continuity */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              backgroundImage: 'url(/bg21.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Solid dark base to fully cover desktop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.88)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.2) 100%)',
            }}
          />

          {/* Main content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-5 max-h-[85vh]">

              {/* =============== LEFT PANEL — Progress & Reasoning =============== */}
              <motion.div
                className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, ...SPRING.smooth }}
                style={{
                  background: PALETTE.panelBg,
                  backdropFilter: 'blur(40px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                {/* Header */}
                <div className="p-5 sm:p-6 pb-4">
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
                        className="text-xl"
                        style={{
                          color: PALETTE.textPrimary,
                          fontFamily: SERIF,
                          fontStyle: 'italic',
                          fontWeight: 400,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {phase === 'complete' ? 'Your space is ready' : 'Building your space'}
                      </h2>
                      <motion.p
                        key={gooseMessage}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm"
                        style={{ color: PALETTE.textSecondary }}
                      >
                        {gooseMessage}
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
                              ? (phase === 'complete' ? PALETTE.success : PALETTE.accent)
                              : current
                                ? PHASE_CONFIG[p].color
                                : PALETTE.inactive,
                          }}
                          transition={{ duration: 0.4 }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable reasoning content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 sm:px-6 pb-5 space-y-4 min-h-0">

                  {/* ── Understanding card ── */}
                  <AnimatePresence>
                    {understanding && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={spring}
                        className="rounded-xl p-4"
                        style={{
                          background: PALETTE.accentSubtle,
                          border: `1px solid ${PALETTE.accentBorder}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={14} style={{ color: PALETTE.accent }} />
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.accent }}>
                            Understanding
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: PALETTE.textPrimary }}>
                          {understanding.summary}
                        </p>
                        {(understanding.identity || understanding.goals || understanding.tone) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {understanding.identity?.profession && (
                              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: PALETTE.tagBg, color: PALETTE.accent }}>
                                {understanding.identity.profession}
                              </span>
                            )}
                            {understanding.goals?.primary && (
                              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: PALETTE.tagBg, color: PALETTE.accentLight }}>
                                {understanding.goals.primary}
                              </span>
                            )}
                            {understanding.tone && (
                              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: PALETTE.tagBg, color: PALETTE.textSecondary }}>
                                {understanding.tone} tone
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Plan card with item checklist ── */}
                  <AnimatePresence>
                    {plan && plan.items.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.1 }}
                        className="rounded-xl p-4"
                        style={{
                          background: PALETTE.cardBg,
                          border: `1px solid ${PALETTE.cardBorder}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Compass size={14} style={{ color: PALETTE.accentLight }} />
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.accentLight }}>
                            Plan
                          </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: PALETTE.textSecondary }}>
                          {plan.summary}
                        </p>

                        {/* Item checklist with live status */}
                        <div className="space-y-2.5">
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
                                {/* Status indicator */}
                                <div className="mt-0.5 flex-shrink-0">
                                  {isCreated ? (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={bounce}
                                    >
                                      <Check size={14} style={{ color: PALETTE.success }} />
                                    </motion.div>
                                  ) : isBuilding ? (
                                    <Loader2 size={14} className="animate-spin" style={{ color: PALETTE.accent }} />
                                  ) : (
                                    <div
                                      className="w-3.5 h-3.5 rounded-full border-2"
                                      style={{ borderColor: PALETTE.textMuted }}
                                    />
                                  )}
                                </div>

                                {/* Item details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <Icon size={12} style={{ color: PALETTE.textMuted }} />
                                    <span
                                      className="text-sm font-medium"
                                      style={{
                                        color: isCreated ? PALETTE.success : isBuilding ? PALETTE.textPrimary : PALETTE.textSecondary,
                                      }}
                                    >
                                      {planItem.name}
                                    </span>
                                  </div>
                                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: PALETTE.textMuted }}>
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

                  {/* ── Currently building indicator ── */}
                  <AnimatePresence>
                    {currentlyBuilding && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 py-1"
                      >
                        <Loader2 size={14} className="animate-spin" style={{ color: PALETTE.accent }} />
                        <span className="text-sm" style={{ color: PALETTE.textSecondary }}>
                          Writing content for <strong style={{ color: PALETTE.textPrimary }}>{currentlyBuilding}</strong>...
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Error state ── */}
                  <AnimatePresence>
                    {phase === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4"
                        style={{
                          background: PALETTE.errorSubtle,
                          border: `1px solid ${PALETTE.errorBorder}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle size={14} style={{ color: PALETTE.error }} />
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: PALETTE.error }}>
                            Error
                          </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: PALETTE.textSecondary }}>
                          {error || 'Something went wrong. The goose got confused.'}
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110"
                            style={{ background: PALETTE.accent, color: '#0c0a09' }}
                          >
                            <RefreshCw size={14} />
                            Try again
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70"
                            style={{ color: PALETTE.textMuted }}
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Completion state ── */}
                  <AnimatePresence>
                    {phase === 'complete' && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={bounce}
                        className="rounded-xl p-5 text-center"
                        style={{
                          background: PALETTE.successSubtle,
                          border: `1px solid ${PALETTE.successBorder}`,
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={bounce}
                          className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                        >
                          <Check size={24} style={{ color: PALETTE.success }} />
                        </motion.div>
                        <p className="text-sm font-medium" style={{ color: PALETTE.textPrimary }}>
                          {createdItems.length} item{createdItems.length !== 1 ? 's' : ''} created for your workspace
                        </p>
                        <p className="text-xs mt-1" style={{ color: PALETTE.textSecondary }}>
                          Opening your space in a moment...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer — cancel button */}
                {phase !== 'complete' && phase !== 'error' && (
                  <div className="px-5 sm:px-6 py-4" style={{ borderTop: `1px solid ${PALETTE.divider}` }}>
                    <button
                      onClick={handleCancel}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: PALETTE.textMuted }}
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
                  background: PALETTE.panelBgAlt,
                  backdropFilter: 'blur(40px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                <div className="p-5 pb-3">
                  <h3
                    className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: PALETTE.accent }}
                  >
                    Your workspace
                  </h3>
                  <p className="text-xs mt-1" style={{ color: PALETTE.textMuted }}>
                    {createdItems.length > 0
                      ? `${createdItems.length} item${createdItems.length !== 1 ? 's' : ''} created`
                      : 'Items will appear here'}
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
                          style={{ background: PALETTE.cardBg }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: PALETTE.accentSubtle,
                            }}
                          >
                            <Icon size={18} style={{ color: PALETTE.accent }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: PALETTE.textPrimary }}>
                              {item.title}
                            </p>
                            <p className="text-xs truncate" style={{ color: PALETTE.textMuted }}>
                              {item.purpose || (item.type === 'widget' ? item.widgetType : item.fileType)}
                            </p>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={bounce}
                          >
                            <Check size={16} style={{ color: PALETTE.success }} />
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
                      <p className="text-sm" style={{ color: PALETTE.textMuted }}>
                        Your workspace items will appear here as they&apos;re created
                      </p>
                    </div>
                  )}
                </div>

                {/* Plan reasoning at bottom */}
                {plan?.reasoning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 py-4"
                    style={{ borderTop: `1px solid ${PALETTE.divider}` }}
                  >
                    <p className="text-xs leading-relaxed italic" style={{ color: PALETTE.textMuted }}>
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
