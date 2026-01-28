'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, FileText, Folder, Layout, MessageSquare } from 'lucide-react';
import { playSound } from '@/lib/sounds';
import type { BuildItem } from '@/lib/ai/types';

interface BuildAnimationProps {
  isActive: boolean;
  items: BuildItem[];
  summary: string;
  understanding?: string;
  onComplete: () => void;
}

const ICON_MAP: Record<string, typeof FileText> = {
  status: Layout,
  contact: MessageSquare,
  links: Layout,
  clock: Layout,
  book: Layout,
  tipjar: Layout,
  feedback: MessageSquare,
  folder: Folder,
  note: FileText,
  'case-study': FileText,
};

export function BuildAnimation({ isActive, items, summary, understanding, onComplete }: BuildAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showUnderstanding, setShowUnderstanding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Show understanding first, then start building
  useEffect(() => {
    if (!isActive || items.length === 0) return;

    // Show understanding message first
    const understandingTimeout = setTimeout(() => {
      setShowUnderstanding(true);
      playSound('bubble');
    }, 300);

    // Start building after understanding is shown
    const buildTimeout = setTimeout(() => {
      setCurrentIndex(0);
      playSound('bubble');
    }, 2500);

    return () => {
      clearTimeout(understandingTimeout);
      clearTimeout(buildTimeout);
    };
  }, [isActive, items.length]);

  // Progress through items
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= items.length) return;

    const item = items[currentIndex];
    const delay = item.delay || 600;

    const timeout = setTimeout(() => {
      playSound('bubble');

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setTimeout(() => {
          setIsComplete(true);
          playSound('expand');
          setTimeout(onComplete, 1500);
        }, 800);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentIndex, items, onComplete]);

  const getItemIcon = (item: BuildItem) => {
    const iconType = item.type === 'widget' ? item.widgetType : item.fileType;
    const Icon = ICON_MAP[iconType || 'note'] || FileText;
    return Icon;
  };

  const getStatus = useCallback((index: number): 'pending' | 'building' | 'complete' => {
    if (index < currentIndex) return 'complete';
    if (index === currentIndex) return 'building';
    return 'pending';
  }, [currentIndex]);

  const completedCount = Math.max(0, currentIndex);
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Light background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f4 100%)',
            }}
          />

          {/* Content container */}
          <div className="relative z-10 w-full max-w-xl">
            {/* AI Understanding Section */}
            <AnimatePresence>
              {showUnderstanding && understanding && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div
                    className="px-5 py-4 rounded-xl"
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                    }}
                  >
                    <p
                      className="text-xs uppercase tracking-wide mb-2 font-medium"
                      style={{ color: '#a3a3a3' }}
                    >
                      What I understood
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#525252' }}
                    >
                      {understanding}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2
                className="text-xl font-medium mb-1"
                style={{ color: '#171717' }}
              >
                {isComplete ? 'Your space is ready' : 'Building your space'}
              </h2>
              <p
                className="text-sm"
                style={{ color: '#737373' }}
              >
                {summary}
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: '#e5e5e5' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: '#171717' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>

            {/* Items being created */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {items.map((item, index) => {
                const status = getStatus(index);
                const Icon = getItemIcon(item);
                const isVisible = currentIndex >= index - 1;

                return (
                  <motion.div
                    key={item.id}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: isVisible ? 1 : 0.3,
                      x: isVisible ? 0 : -10,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Status indicator */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        background: status === 'complete' ? '#171717' : status === 'building' ? '#fafafa' : '#fafafa',
                        border: status === 'building' ? '2px solid #171717' : '1px solid #e5e5e5',
                      }}
                    >
                      {status === 'complete' ? (
                        <Check size={14} className="text-white" />
                      ) : status === 'building' ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        >
                          <Icon size={14} style={{ color: '#171717' }} />
                        </motion.div>
                      ) : (
                        <Icon size={14} style={{ color: '#a3a3a3' }} />
                      )}
                    </div>

                    {/* Item info */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: status === 'pending' ? '#a3a3a3' : '#171717',
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide"
                          style={{
                            background: '#f5f5f4',
                            color: '#737373',
                          }}
                        >
                          {item.type === 'widget' ? item.widgetType : item.fileType}
                        </span>
                      </div>

                      {/* Reason - show when building or complete */}
                      {item.reason && (status === 'building' || status === 'complete') && (
                        <motion.p
                          className="text-xs leading-relaxed"
                          style={{ color: '#737373' }}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.reason}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Complete message */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p
                    className="text-sm"
                    style={{ color: '#737373' }}
                  >
                    Opening your workspace...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
