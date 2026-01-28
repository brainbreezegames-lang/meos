'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface GooseBuilderProps {
  isActive: boolean;
  prompt: string;
  onItemCreated: (item: BuildItem, index: number) => void;
  onComplete: (items: BuildItem[], summary: string) => void;
  onError: (message: string) => void;
}

// Goose messages - funny and absurd
const GOOSE_MESSAGES = {
  understanding: [
    "Honk! Let me waddle through your request...",
    "Reading... *aggressive goose stare*",
    "Processing with my bird brain...",
    "Hmm yes, very interesting *steals your bread*",
  ],
  planning: [
    "Calculating optimal nest layout...",
    "Consulting the council of geese...",
    "Drawing blueprints with my beak...",
    "Flapping wings... this is complex stuff!",
  ],
  building: [
    "Laying a golden egg... I mean file",
    "Constructing with feathers and determination",
    "Pecking away at the keyboard...",
    "Building faster than a goose can honk!",
  ],
  created: [
    "Honk! Fresh from the nest!",
    "Ta-da! *proud goose noises*",
    "Another masterpiece! I accept bread as payment.",
    "Done! That one's a real feather in your cap.",
  ],
  complete: [
    "Your nest is ready! Honk honk!",
    "The goose has delivered! *bows dramatically*",
    "All done! Now where's my bread?",
    "Mission accomplished! *victory waddle*",
  ],
  error: [
    "Honk! Something went wrong... *sad goose*",
    "Error! Even geese make mistakes...",
    "Oops! Let me try that waddle again...",
  ],
};

const getRandomMessage = (category: keyof typeof GOOSE_MESSAGES) => {
  const messages = GOOSE_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
};

export function GooseBuilder({ isActive, prompt, onItemCreated, onComplete, onError }: GooseBuilderProps) {
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<'idle' | 'understanding' | 'planning' | 'building' | 'complete'>('idle');
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  const handleEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    switch (eventType) {
      case 'phase':
        const newPhase = data.phase as typeof phase;
        setPhase(newPhase);
        if (newPhase === 'understanding') {
          setMessage(getRandomMessage('understanding'));
        } else if (newPhase === 'planning') {
          setMessage(getRandomMessage('planning'));
        } else if (newPhase === 'building') {
          setMessage(getRandomMessage('building'));
        }
        playSound('bubble');
        break;

      case 'understanding':
      case 'plan':
        // Just update message, the real info is in the data
        break;

      case 'building':
        setMessage(`${getRandomMessage('building').split('...')[0]}... ${data.name}`);
        break;

      case 'created':
        const item = data.item as BuildItem;
        const remaining = data.remaining as number;
        setMessage(getRandomMessage('created'));
        onItemCreated(item, remaining);
        playSound('bubble');
        break;

      case 'complete':
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setPhase('complete');
          setMessage(getRandomMessage('complete'));
          playSound('expand');

          const items = data.items as BuildItem[];
          const summary = data.summary as string;

          setTimeout(() => {
            onComplete(items, summary);
          }, 1000);
        }
        break;

      case 'error':
        setMessage(getRandomMessage('error'));
        onError(data.message as string);
        break;
    }
  }, [onItemCreated, onComplete, onError]);

  useEffect(() => {
    if (!isActive || !prompt || hasStartedRef.current) return;
    hasStartedRef.current = true;
    hasCompletedRef.current = false;
    setPhase('idle');
    setMessage('');

    const startBuild = async () => {
      try {
        setMessage("Honk! Goose is getting ready...");
        setPhase('understanding');

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
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || '';

          for (const message of messages) {
            if (!message.trim()) continue;

            const lines = message.split('\n');
            let eventType = 'message';
            let eventData = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                eventData = line.slice(6);
              }
            }

            if (eventData) {
              try {
                const data = JSON.parse(eventData);
                handleEvent(eventType, data);
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err);
        setMessage(getRandomMessage('error'));
        onError(err instanceof Error ? err.message : 'Connection failed');
      }
    };

    startBuild();
  }, [isActive, prompt, handleEvent, onError]);

  useEffect(() => {
    if (!isActive) {
      hasStartedRef.current = false;
      hasCompletedRef.current = false;
    }
  }, [isActive]);

  if (!isActive || !message) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div
          className="px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Goose emoji with animation */}
          <motion.span
            className="text-2xl"
            animate={phase === 'building' ? {
              rotate: [-5, 5, -5],
              y: [0, -3, 0],
            } : phase === 'complete' ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{ repeat: phase === 'building' ? Infinity : 0, duration: 0.5 }}
          >
            🪿
          </motion.span>

          {/* Message */}
          <div className="flex flex-col">
            <motion.p
              key={message}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-medium"
              style={{ color: '#171717' }}
            >
              {message}
            </motion.p>

            {/* Progress dots */}
            {phase !== 'complete' && (
              <div className="flex gap-1 mt-1">
                {['understanding', 'planning', 'building'].map((p, i) => {
                  const phases = ['understanding', 'planning', 'building'];
                  const currentIndex = phases.indexOf(phase);
                  const isComplete = i < currentIndex;
                  const isCurrent = p === phase;

                  return (
                    <motion.div
                      key={p}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: isComplete ? '#22c55e' : isCurrent ? '#f59e0b' : '#e5e5e5',
                      }}
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
