'use client';

import { useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, windowOpen, fade, REDUCED_MOTION, DURATION } from '@/lib/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, handleClickOutside]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[400]"
            style={{ background: 'rgba(23, 20, 18, 0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? DURATION.instant : DURATION.fast }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed left-1/2 top-1/2 z-[401] w-[480px] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col"
            style={{
              background: 'var(--color-bg-base)',
              backdropFilter: 'var(--blur-glass-heavy)',
              WebkitBackdropFilter: 'var(--blur-glass-heavy)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-lg, 18px)',
              boxShadow: 'var(--shadow-window)',
            }}
            initial={prefersReducedMotion ? { opacity: 0, x: '-50%', y: '-50%' } : { opacity: 0, scale: 0.8, y: '-45%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={prefersReducedMotion ? { opacity: 0, x: '-50%', y: '-50%' } : { opacity: 0, scale: 0.85, y: '-45%', x: '-50%' }}
            transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.smooth}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--color-border-default)' }}
            >
              <h2
                id="modal-title"
                className="text-[15px] font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
