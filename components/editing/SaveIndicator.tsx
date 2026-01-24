'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEditContextSafe } from '@/contexts/EditContext';
import { SparkleEffect, haptic } from '@/components/ui/Delight';
import { SPRING, toast as toastVariants, REDUCED_MOTION } from '@/lib/animations';

export function SaveIndicator() {
  const context = useEditContextSafe();
  const prefersReducedMotion = useReducedMotion();
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  const saveStatus = context?.saveStatus;

  // Trigger celebration effects on status change
  useEffect(() => {
    if (!context?.isOwner) return;

    if (saveStatus === 'saved' && prevStatus === 'saving') {
      setShowSparkles(true);
      haptic('success');
      setTimeout(() => setShowSparkles(false), 600);
    } else if (saveStatus === 'error' && prevStatus === 'saving') {
      haptic('error');
    }

    setPrevStatus(saveStatus || null);
  }, [saveStatus, prevStatus, context?.isOwner]);

  if (!context?.isOwner) return null;

  // Error shake animation
  const shakeAnimation = saveStatus === 'error' && !prefersReducedMotion
    ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
    : {};

  return (
    <AnimatePresence>
      {saveStatus !== 'idle' && (
        <motion.div
          className="fixed bottom-20 right-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
          initial={toastVariants.initial}
          animate={{
            ...toastVariants.animate,
            ...shakeAnimation,
          }}
          exit={toastVariants.exit}
          transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.bouncy}
          style={{
            background: saveStatus === 'error'
              ? 'rgba(239, 68, 68, 0.9)'
              : saveStatus === 'saved'
                ? 'rgba(34, 197, 94, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: saveStatus === 'saved'
              ? '0 4px 20px rgba(34, 197, 94, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            color: saveStatus === 'error' || saveStatus === 'saved' ? 'white' : '#1d1d1f',
          }}
        >
          {/* Sparkle celebration for save success */}
          <SparkleEffect
            trigger={showSparkles}
            config={{
              count: 10,
              spread: 50,
              colors: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f472b6'],
            }}
          />

          {saveStatus === 'saving' && (
            <>
              <motion.div
                className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <motion.svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={SPRING.bouncy}
              >
                <motion.path
                  d="M3 8l4 4 6-7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </motion.svg>
              <span>Saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.75" fill="currentColor" />
              </svg>
              <span>Save failed — try again</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast() {
  const context = useEditContextSafe();

  if (!context) return null;

  const { toast } = context;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="fixed bottom-20 left-1/2 z-[100] flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
          initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.8 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 25, x: '-50%', scale: 0.9 }}
          transition={SPRING.bouncy}
          style={{
            background: toast.type === 'error'
              ? 'rgba(239, 68, 68, 0.95)'
              : toast.type === 'success'
                ? 'rgba(34, 197, 94, 0.95)'
                : 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            color: 'white',
          }}
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="5" r="0.75" fill="currentColor" />
            </svg>
          )}
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
