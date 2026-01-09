'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem } from '@/types';

interface InfoWindowProps {
  item: DesktopItem | null;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function InfoWindow({ item, onClose, position }: InfoWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[199]"
            style={{ background: 'var(--bg-overlay)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          {/* Window */}
          <motion.div
            ref={windowRef}
            className="fixed z-[200] w-[420px] max-w-[90vw] max-h-[80vh] overflow-hidden rounded-xl flex flex-col"
            style={{
              left: position?.x ?? '50%',
              top: position?.y ?? '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 25px 60px -12px rgba(0, 0, 0, 0.35),
                0 0 0 1px rgba(0, 0, 0, 0.03),
                inset 0 0 0 1px rgba(255, 255, 255, 0.4)
              `,
            }}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            {/* Title Bar */}
            <div className="flex items-center h-12 px-4 shrink-0 relative">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="w-3 h-3 rounded-full flex items-center justify-center group transition-colors"
                  style={{ background: 'var(--traffic-red)' }}
                >
                  <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'rgba(77, 0, 0, 0.8)' }}>
                    ×
                  </span>
                </button>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: 'var(--traffic-yellow)' }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: 'var(--traffic-green)' }}
                />
              </div>

              {/* Title (centered) */}
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium truncate max-w-[60%]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {item.windowTitle}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {/* Header */}
              <div className="flex items-start gap-3.5 mb-4">
                {/* Header Image */}
                <div
                  className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                >
                  <Image
                    src={item.windowHeaderImage || item.thumbnailUrl}
                    alt={item.windowTitle}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>

                {/* Title + Subtitle */}
                <div className="flex flex-col min-w-0 pt-1">
                  <h2
                    className="text-[15px] font-semibold tracking-tight truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.windowTitle}
                  </h2>
                  {item.windowSubtitle && (
                    <p
                      className="text-[13px] truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.windowSubtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div
                className="text-[13px] leading-relaxed mb-4 whitespace-pre-wrap"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.windowDescription}
              </div>

              {/* Details */}
              {item.windowDetails && item.windowDetails.length > 0 && (
                <div
                  className="pt-3.5 mt-4"
                  style={{ borderTop: '1px solid var(--border-light)' }}
                >
                  <div className="space-y-2">
                    {item.windowDetails.map((detail, index) => (
                      <div key={index} className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: 'var(--dot-color)' }}
                        />
                        <span
                          className="text-[12px]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {detail.label}
                        </span>
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {item.windowLinks && item.windowLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3.5" style={{ borderTop: '1px solid var(--border-light)' }}>
                  {item.windowLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all hover:scale-105 active:scale-100"
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                      }}
                    >
                      {link.label}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
