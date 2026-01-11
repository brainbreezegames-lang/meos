'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                delay,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1]
            }}
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
            <span
                className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full backdrop-blur-md transition-all duration-300"
                style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-dock)',
                    border: '1px solid var(--border-glass-outer)',
                }}
            >
                {label}
            </span>

            {/* Open indicator dot */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
