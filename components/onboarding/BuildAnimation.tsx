'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, FileText, Folder, Layout, Sparkles } from 'lucide-react';
import { SPRING } from '@/lib/animations';
import { playSound } from '@/lib/sounds';
import type { BuildItem } from '@/lib/ai/types';

interface BuildAnimationProps {
  isActive: boolean;
  items: BuildItem[];
  summary: string;
  onComplete: () => void;
}

// Progress item component
const ProgressItem = React.memo(({
  item,
  status,
  index,
}: {
  item: BuildItem;
  status: 'pending' | 'building' | 'complete';
  index: number;
}) => {
  const Icon = item.type === 'widget' ? Layout
    : item.fileType === 'folder' ? Folder
    : FileText;

  return (
    <motion.div
      className="flex items-center gap-3 py-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, ...SPRING.gentle }}
    >
      {/* Status indicator */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: status === 'complete'
            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
            : status === 'building'
            ? 'rgba(255, 119, 34, 0.2)'
            : 'rgba(255, 255, 255, 0.05)',
          border: status === 'building'
            ? '2px solid #ff7722'
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {status === 'complete' ? (
          <Check size={12} className="text-white" />
        ) : status === 'building' ? (
          <motion.div
            className="w-2 h-2 rounded-full bg-orange-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        )}
      </div>

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: status === 'complete'
            ? 'rgba(34, 197, 94, 0.1)'
            : 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Icon
          size={16}
          className={status === 'complete' ? 'text-green-400' : 'text-white/40'}
        />
      </div>

      {/* Label */}
      <span
        className="text-sm font-medium flex-1"
        style={{
          color: status === 'complete'
            ? 'rgba(255, 255, 255, 0.9)'
            : status === 'building'
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(255, 255, 255, 0.4)',
        }}
      >
        {item.title}
      </span>

      {/* Type badge */}
      <span
        className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          color: 'rgba(255, 255, 255, 0.3)',
        }}
      >
        {item.type === 'widget' ? item.widgetType : item.fileType}
      </span>
    </motion.div>
  );
});

ProgressItem.displayName = 'ProgressItem';

export function BuildAnimation({ isActive, items, summary, onComplete }: BuildAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Process items one by one
  useEffect(() => {
    if (!isActive || items.length === 0) return;

    // Start building after initial delay
    const startTimeout = setTimeout(() => {
      setCurrentIndex(0);
      playSound('bubble');
    }, 500);

    return () => clearTimeout(startTimeout);
  }, [isActive, items.length]);

  // Progress through items
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= items.length) return;

    const item = items[currentIndex];
    const delay = item.delay || 300;

    const timeout = setTimeout(() => {
      playSound('bubble');

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All items complete
        setTimeout(() => {
          setIsComplete(true);
          playSound('expand');
          setTimeout(onComplete, 1000);
        }, 500);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentIndex, items, onComplete]);

  // Get status for each item
  const getStatus = useCallback((index: number): 'pending' | 'building' | 'complete' => {
    if (index < currentIndex) return 'complete';
    if (index === currentIndex) return 'building';
    return 'pending';
  }, [currentIndex]);

  const progress = items.length > 0
    ? Math.round(((currentIndex + 1) / items.length) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(145deg, #1a1714 0%, #0d0b09 50%, #151210 100%)',
            }}
          />

          {/* Ambient glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 119, 34, 0.08) 0%, transparent 70%)',
            }}
            animate={!prefersReducedMotion ? {
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-md px-6">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 119, 34, 0.2) 0%, rgba(255, 119, 34, 0.05) 100%)',
                  border: '1px solid rgba(255, 119, 34, 0.2)',
                }}
                animate={!prefersReducedMotion ? {
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={28} className="text-orange-400" />
              </motion.div>

              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, #a8a29e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {isComplete ? 'Your space is ready!' : 'Building your space...'}
              </h2>
              <p className="text-white/40 text-sm">{summary}</p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">Progress</span>
                <span className="text-xs text-white/60 font-medium">{progress}%</span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #ff7722 0%, #ff9944 100%)',
                    boxShadow: '0 0 20px rgba(255, 119, 34, 0.5)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>

            {/* Items list */}
            <motion.div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="px-4 py-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                {items.map((item, index) => (
                  <ProgressItem
                    key={item.id}
                    item={item}
                    status={getStatus(index)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>

            {/* Complete state */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-white/50">
                    Entering your space...
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
