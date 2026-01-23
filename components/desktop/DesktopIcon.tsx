'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface DesktopIconProps {
    icon: React.ReactNode;
    label: string;
    onOpen: () => void;
    onFocus?: () => void;
    isOpen?: boolean;
    delay?: number;
    className?: string;
}

export default function DesktopIcon({
    icon,
    label,
    onOpen,
    onFocus,
    isOpen = false,
    delay = 0,
}: DesktopIconProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.button
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={prefersReducedMotion
                ? { duration: 0.1 }
                : { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
            }
            onDoubleClick={onOpen}
            onClick={onFocus}
            className="group flex flex-col items-center gap-2.5 w-[80px] focus:outline-none relative"
        >
            {/* Icon Container */}
            <div
                className="relative w-[64px] h-[64px] rounded-[16px] flex items-center justify-center transition-all duration-300 ease-out group-active:scale-95"
                style={{
                    background: 'var(--bg-item)',
                    boxShadow: 'var(--shadow-item)',
                    border: '1px solid var(--border-glass-inner)',
                }}
            >
                <div style={{ color: 'var(--text-secondary)' }} className="group-hover:opacity-80 transition-opacity duration-300">
                    {icon}
                </div>
            </div>

            {/* Label */}
            {/* Label / Tooltip */}
            <span
                className="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-md backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 shadow-lg"
                style={{
                    color: 'var(--text-primary)',
                    background: 'var(--bg-glass-elevated)',
                    border: '1px solid var(--border-glass-outer)',
                    position: 'absolute',
                    top: '100%',
                    whiteSpace: 'nowrap',
                    zIndex: 20
                }}
            >
                {label}
            </span>

            {/* Selection Ring (Focus State) */}
            <div className="absolute inset-0 rounded-[18px] border-2 border-[var(--accent-primary)] opacity-0 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ margin: '-4px' }} />

            {/* Open indicator dot */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        transition={prefersReducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                    >
                        <div
                            className="w-1 h-1 rounded-full"
                            style={{
                                background: 'var(--accent-primary)',
                                boxShadow: '0 0 4px var(--accent-primary)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
