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
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-[199]"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Window */}
          <motion.div
            ref={windowRef}
            className="fixed z-[200] w-[440px] max-w-[92vw] max-h-[85vh] overflow-hidden flex flex-col"
            style={{
              left: position?.x ?? '50%',
              top: position?.y ?? '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '14px',
              background: `
                linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.92) 0%,
                  rgba(255, 255, 255, 0.85) 100%
                )
              `,
              backdropFilter: 'blur(60px) saturate(200%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%)',
              boxShadow: `
                0 40px 80px -20px rgba(0, 0, 0, 0.4),
                0 20px 40px -10px rgba(0, 0, 0, 0.25),
                0 0 0 0.5px rgba(255, 255, 255, 0.4),
                inset 0 0 0 0.5px rgba(255, 255, 255, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
            }}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              mass: 0.8
            }}
          >
            {/* Title Bar */}
            <div
              className="flex items-center h-[52px] px-4 shrink-0 relative"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)',
              }}
            >
              {/* Traffic Lights */}
              <div className="flex items-center gap-2 group/traffic">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"
                  style={{
                    background: 'linear-gradient(180deg, #FF6058 0%, #FF4D44 100%)',
                    boxShadow: `
                      0 0.5px 1px rgba(0, 0, 0, 0.12),
                      inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)
                    `,
                  }}
                >
                  <svg
                    className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 1L7 7M7 1L1 7"
                      stroke="rgba(77, 0, 0, 0.7)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Minimize */}
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #FFBE2E 0%, #FFB014 100%)',
                    boxShadow: `
                      0 0.5px 1px rgba(0, 0, 0, 0.12),
                      inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)
                    `,
                  }}
                >
                  <svg
                    className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 4H7"
                      stroke="rgba(100, 65, 0, 0.7)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Maximize */}
                <div
                  className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #2ACB42 0%, #1DB934 100%)',
                    boxShadow: `
                      0 0.5px 1px rgba(0, 0, 0, 0.12),
                      inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)
                    `,
                  }}
                >
                  <svg
                    className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <path
                      d="M1 2.5L4 5.5L7 2.5"
                      stroke="rgba(0, 70, 0, 0.7)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform="rotate(45 4 4)"
                    />
                  </svg>
                </div>
              </div>

              {/* Centered Title */}
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium truncate max-w-[55%] select-none"
                style={{ color: 'rgba(0, 0, 0, 0.75)' }}
              >
                {item.windowTitle}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Header Section */}
              <div className="flex items-start gap-4 mb-5">
                {/* Header Image */}
                <div
                  className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0"
                  style={{
                    boxShadow: `
                      0 4px 16px -2px rgba(0, 0, 0, 0.15),
                      0 0 0 0.5px rgba(0, 0, 0, 0.05),
                      inset 0 0 0 0.5px rgba(255, 255, 255, 0.2)
                    `,
                  }}
                >
                  <Image
                    src={item.windowHeaderImage || item.thumbnailUrl}
                    alt={item.windowTitle}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Title + Subtitle */}
                <div className="flex flex-col min-w-0 pt-1.5">
                  <h2
                    className="text-[17px] font-semibold tracking-tight truncate leading-tight"
                    style={{ color: '#1D1D1F' }}
                  >
                    {item.windowTitle}
                  </h2>
                  {item.windowSubtitle && (
                    <p
                      className="text-[13px] mt-0.5 truncate"
                      style={{ color: '#6E6E73' }}
                    >
                      {item.windowSubtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div
                className="text-[13px] leading-[1.6] whitespace-pre-wrap"
                style={{ color: '#3D3D3F' }}
              >
                {item.windowDescription}
              </div>

              {/* Details Section */}
              {item.windowDetails && item.windowDetails.length > 0 && (
                <div
                  className="pt-4 mt-5"
                  style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}
                >
                  <div className="space-y-2.5">
                    {item.windowDetails.map((detail, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-[6px] h-[6px] rounded-full shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
                            boxShadow: '0 1px 3px rgba(52, 199, 89, 0.4)',
                          }}
                        />
                        <span
                          className="text-[12px]"
                          style={{ color: '#8E8E93' }}
                        >
                          {detail.label}
                        </span>
                        <span
                          className="text-[12px] font-medium ml-auto"
                          style={{ color: '#3D3D3F' }}
                        >
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Section */}
              {item.windowLinks && item.windowLinks.length > 0 && (
                <div
                  className="flex flex-wrap gap-2.5 mt-5 pt-4"
                  style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}
                >
                  {item.windowLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(180deg, #0A84FF 0%, #0070E0 100%)',
                        color: '#FFFFFF',
                        boxShadow: `
                          0 4px 12px -2px rgba(0, 122, 255, 0.4),
                          0 0 0 0.5px rgba(255, 255, 255, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                      }}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {link.label}
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </motion.a>
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
