'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEditContextSafe } from '@/contexts/EditContext';

export function SaveIndicator() {
  const context = useEditContextSafe();

  if (!context?.isOwner) return null;

  const { saveStatus } = context;

  return (
    <AnimatePresence>
      {saveStatus !== 'idle' && (
        <motion.div
          className="fixed bottom-20 right-4 z-[100] flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            background: saveStatus === 'error'
              ? 'rgba(239, 68, 68, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            color: saveStatus === 'error' ? 'white' : '#1d1d1f',
          }}
        >
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
                className="w-3 h-3"
                viewBox="0 0 12 12"
                fill="none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <path
                  d="M2 6l3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
              <span>Failed to save</span>
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
          initial={{ opacity: 0, y: 10, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.2 }}
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
