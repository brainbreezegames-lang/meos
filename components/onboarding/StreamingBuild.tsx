'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, Brain, Compass, Hammer, FileText, Folder, Layout, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';

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

interface StreamingBuildProps {
  isActive: boolean;
  prompt: string;
  onComplete: (items: BuildItem[], summary: string) => void;
  onCancel: () => void;
}

type Phase = 'idle' | 'understanding' | 'planning' | 'building' | 'complete' | 'error';

interface PhaseInfo {
  icon: typeof Sparkles;
  label: string;
  color: string;
}

const PHASE_INFO: Record<Phase, PhaseInfo> = {
  idle: { icon: Sparkles, label: 'Starting', color: '#a3a3a3' },
  understanding: { icon: Brain, label: 'Understanding', color: '#8b5cf6' },
  planning: { icon: Compass, label: 'Planning', color: '#3b82f6' },
  building: { icon: Hammer, label: 'Building', color: '#f59e0b' },
  complete: { icon: Check, label: 'Complete', color: '#22c55e' },
  error: { icon: Loader2, label: 'Error', color: '#ef4444' },
};

const ICON_MAP: Record<string, typeof FileText> = {
  status: Layout,
  contact: MessageSquare,
  links: Layout,
  book: Layout,
  folder: Folder,
  note: FileText,
  'case-study': FileText,
};

interface LogEntry {
  id: string;
  type: 'phase' | 'thought' | 'action' | 'created' | 'error';
  content: string;
  detail?: string;
  timestamp: number;
}

export function StreamingBuild({ isActive, prompt, onComplete, onCancel }: StreamingBuildProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [createdItems, setCreatedItems] = useState<BuildItem[]>([]);
  const [understanding, setUnderstanding] = useState<string>('');
  const [planSummary, setPlanSummary] = useState<string>('');
  const [currentlyBuilding, setCurrentlyBuilding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasCompletedRef = useRef(false);

  const addLog = useCallback((type: LogEntry['type'], content: string, detail?: string) => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      detail,
      timestamp: Date.now(),
    }]);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Start streaming when active
  useEffect(() => {
    if (!isActive || !prompt || hasCompletedRef.current) return;

    // Reset state
    setPhase('idle');
    setLogs([]);
    setCreatedItems([]);
    setUnderstanding('');
    setPlanSummary('');
    setCurrentlyBuilding(null);
    setError(null);
    hasCompletedRef.current = false;

    const startBuild = async () => {
      try {
        const response = await fetch('/api/ai/build-space', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to start build');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              const dataLine = lines[lines.indexOf(line) + 1];
              if (dataLine?.startsWith('data: ')) {
                try {
                  const data = JSON.parse(dataLine.slice(6));
                  handleEvent(eventType, data);
                } catch (e) {
                  console.error('Failed to parse event data:', e);
                }
              }
            } else if (line.startsWith('data: ')) {
              // Handle data without explicit event type
              try {
                const data = JSON.parse(line.slice(6));
                if (data.phase) handleEvent('phase', data);
              } catch (e) {
                // Ignore parse errors for incomplete data
              }
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err);
        setPhase('error');
        setError(err instanceof Error ? err.message : 'Connection failed');
        addLog('error', 'Connection failed', 'Please try again');
      }
    };

    const handleEvent = (eventType: string, data: Record<string, unknown>) => {
      switch (eventType) {
        case 'phase':
          const newPhase = data.phase as Phase;
          setPhase(newPhase);
          addLog('phase', data.message as string);
          playSound('bubble');
          break;

        case 'understanding':
          setUnderstanding(data.summary as string);
          addLog('thought', 'I understand now', data.summary as string);
          playSound('bubble');
          break;

        case 'plan':
          setPlanSummary(data.summary as string);
          addLog('thought', data.summary as string, data.reasoning as string);
          playSound('bubble');
          break;

        case 'building':
          setCurrentlyBuilding(data.name as string);
          addLog('action', `Creating ${data.name}`, data.purpose as string);
          break;

        case 'created':
          const item = data.item as BuildItem;
          setCreatedItems(prev => [...prev, item]);
          setCurrentlyBuilding(null);
          addLog('created', `Created ${item.title}`);
          playSound('bubble');
          break;

        case 'complete':
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            setPhase('complete');
            addLog('phase', 'Your space is ready!');
            playSound('expand');

            const items = data.items as BuildItem[];
            const summary = data.summary as string;

            setTimeout(() => {
              onComplete(items, summary);
            }, 1500);
          }
          break;

        case 'error':
          setPhase('error');
          setError(data.message as string);
          addLog('error', data.message as string);
          break;
      }
    };

    startBuild();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [isActive, prompt, addLog, onComplete]);

  const PhaseIcon = PHASE_INFO[phase].icon;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[10000] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
            }}
          />

          {/* Left Panel: Progress Log */}
          <div className="relative w-1/2 p-8 flex flex-col">
            {/* Phase indicator */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: PHASE_INFO[phase].color + '20' }}
              >
                <PhaseIcon
                  size={20}
                  style={{ color: PHASE_INFO[phase].color }}
                  className={phase === 'building' || phase === 'understanding' || phase === 'planning' ? 'animate-pulse' : ''}
                />
              </div>
              <div>
                <h2 className="text-lg font-medium" style={{ color: '#171717' }}>
                  {phase === 'complete' ? 'Your space is ready' : 'Building your space'}
                </h2>
                <p className="text-sm" style={{ color: '#737373' }}>
                  {PHASE_INFO[phase].label}
                </p>
              </div>
            </motion.div>

            {/* Progress steps */}
            <div className="flex gap-2 mb-6">
              {(['understanding', 'planning', 'building', 'complete'] as Phase[]).map((p, i) => {
                const phaseOrder = ['understanding', 'planning', 'building', 'complete'];
                const currentOrder = phaseOrder.indexOf(phase);
                const thisOrder = phaseOrder.indexOf(p);
                const isComplete = thisOrder < currentOrder || phase === 'complete';
                const isCurrent = p === phase;

                return (
                  <div
                    key={p}
                    className="flex-1 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: isComplete ? '#22c55e' : isCurrent ? PHASE_INFO[p].color : '#e5e5e5',
                    }}
                  />
                );
              })}
            </div>

            {/* Logs */}
            <div
              className="flex-1 overflow-y-auto rounded-xl p-4 space-y-3"
              style={{ background: '#fff', border: '1px solid #e5e5e5' }}
            >
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3"
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: log.type === 'error' ? '#fef2f2' :
                          log.type === 'created' ? '#f0fdf4' :
                            log.type === 'phase' ? '#f5f3ff' : '#fafafa',
                      }}
                    >
                      {log.type === 'created' ? (
                        <Check size={12} style={{ color: '#22c55e' }} />
                      ) : log.type === 'error' ? (
                        <span style={{ color: '#ef4444' }}>!</span>
                      ) : log.type === 'thought' ? (
                        <Brain size={12} style={{ color: '#8b5cf6' }} />
                      ) : log.type === 'action' ? (
                        <Hammer size={12} style={{ color: '#f59e0b' }} />
                      ) : (
                        <Sparkles size={12} style={{ color: '#a3a3a3' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: log.type === 'error' ? '#ef4444' : '#171717',
                        }}
                      >
                        {log.content}
                      </p>
                      {log.detail && (
                        <p
                          className="text-xs mt-0.5 leading-relaxed"
                          style={{ color: '#737373' }}
                        >
                          {log.detail}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Currently building indicator */}
              {currentlyBuilding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 py-2"
                >
                  <Loader2 size={14} className="animate-spin" style={{ color: '#f59e0b' }} />
                  <span className="text-sm" style={{ color: '#737373' }}>
                    Writing content for {currentlyBuilding}...
                  </span>
                </motion.div>
              )}

              <div ref={logsEndRef} />
            </div>

            {/* Cancel button */}
            {phase !== 'complete' && (
              <button
                onClick={onCancel}
                className="mt-4 text-sm transition-opacity hover:opacity-70"
                style={{ color: '#a3a3a3' }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Right Panel: Preview */}
          <div className="relative w-1/2 p-8 flex items-center justify-center">
            <div
              className="w-full max-w-md rounded-2xl p-6 shadow-lg"
              style={{ background: '#fff', border: '1px solid #e5e5e5' }}
            >
              <h3
                className="text-sm uppercase tracking-wide font-medium mb-4"
                style={{ color: '#a3a3a3' }}
              >
                Preview
              </h3>

              {/* Created items */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {createdItems.map((item, index) => {
                    const Icon = ICON_MAP[item.widgetType || item.fileType || 'note'] || FileText;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: '#fafafa' }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: '#fff', border: '1px solid #e5e5e5' }}
                        >
                          <Icon size={18} style={{ color: '#525252' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#171717' }}>
                            {item.title}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#a3a3a3' }}>
                            {item.type === 'widget' ? item.widgetType : item.fileType}
                          </p>
                        </div>
                        <Check size={16} style={{ color: '#22c55e' }} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Placeholder when no items yet */}
                {createdItems.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm" style={{ color: '#a3a3a3' }}>
                      Components will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              {planSummary && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 pt-4"
                  style={{ borderTop: '1px solid #f5f5f4' }}
                >
                  <p className="text-xs" style={{ color: '#737373' }}>
                    {planSummary}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
