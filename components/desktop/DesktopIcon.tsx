'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DesktopIconProps {
    icon: React.ReactNode;
    label: string;
    onOpen: () => void;
    onFocus?: () => void; // Optional focus handler
    delay?: number;
    className?: string; // For custom styling on the icon container if needed
}

export default function DesktopIcon({
    icon,
    label,
    onOpen,
    onFocus,
    delay = 0,
    className = 'bg-white',
}: DesktopIconProps) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                delay,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] // Soft, elegant ease
            }}
            onDoubleClick={onOpen}
            onClick={onFocus}
            className="group flex flex-col items-center gap-3 w-[84px] focus:outline-none"
        >
            {/* Icon Container - "Furniture" */}
            <div
                className={`
          relative w-[68px] h-[68px] rounded-[18px] 
          flex items-center justify-center 
          shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_12px_-4px_rgba(0,0,0,0.04)] 
          group-hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08),0_4px_8px_-2px_rgba(0,0,0,0.04)]
          group-active:scale-95 group-active:shadow-sm
          border border-white/60
          transition-all duration-300 ease-out
          ${className}
        `}
            >
                {/* Shine effect logic or gradient could go here */}
                <div className="text-stone-600/90 group-hover:text-stone-800 transition-colors duration-300">
                    {icon}
                </div>
            </div>

            {/* Label - Editorial */}
            <span
                className="
          text-[11px] font-medium tracking-wide 
          text-stone-600/90 
          px-2.5 py-1 rounded-full 
          bg-white/40 backdrop-blur-md 
          border border-white/20
          shadow-sm
          group-hover:bg-white/70 group-hover:text-stone-900
          transition-all duration-300
        "
            >
                {label}
            </span>
        </motion.button>
    );
}
