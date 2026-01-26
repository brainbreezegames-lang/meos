'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING, fileIconPop, REDUCED_MOTION } from '@/lib/animations';

interface DesktopIconProps {
    icon: React.ReactNode;
    label: string;
    onOpen: () => void;
    onFocus?: () => void;
    isOpen?: boolean;
    delay?: number;
    className?: string;
}

// Braun-inspired theme colors
const THEMES = {
    light: {
        buttonBg: 'linear-gradient(180deg, #ffffff 0%, #f5f5f3 100%)',
        buttonPressedBg: 'linear-gradient(180deg, #f0f0ee 0%, #fafafa 100%)',
        buttonShadow: `
            0 1px 2px rgba(0, 0, 0, 0.05),
            0 3px 6px rgba(0, 0, 0, 0.04),
            0 6px 12px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 0 0 1px rgba(0, 0, 0, 0.04)
        `,
        buttonPressedShadow: `
            inset 0 1px 3px rgba(0, 0, 0, 0.1),
            inset 0 0 0 1px rgba(0, 0, 0, 0.04),
            0 1px 1px rgba(255, 255, 255, 0.5)
        `,
        iconColor: '#3a3a3a',
        labelBg: 'rgba(255, 255, 255, 0.95)',
        labelColor: '#1a1a1a',
        labelShadow: '0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
    },
    dark: {
        buttonBg: 'linear-gradient(180deg, #3a3a38 0%, #2e2e2c 100%)',
        buttonPressedBg: 'linear-gradient(180deg, #2a2a28 0%, #323230 100%)',
        buttonShadow: `
            0 1px 2px rgba(0, 0, 0, 0.2),
            0 3px 6px rgba(0, 0, 0, 0.15),
            0 6px 12px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 0 0 1px rgba(255, 255, 255, 0.04)
        `,
        buttonPressedShadow: `
            inset 0 1px 3px rgba(0, 0, 0, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            0 1px 1px rgba(255, 255, 255, 0.03)
        `,
        iconColor: '#e0e0dc',
        labelBg: 'rgba(40, 40, 38, 0.95)',
        labelColor: '#f0f0ec',
        labelShadow: '0 2px 8px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
    },
};

const DesktopIcon = memo(function DesktopIcon({
    icon,
    label,
    onOpen,
    onFocus,
    isOpen = false,
    delay = 0,
}: DesktopIconProps) {
    const prefersReducedMotion = useReducedMotion();
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode - dark class is on document.documentElement (html element)
    useEffect(() => {
        const checkDarkMode = () => {
            const hasDarkClass = document.documentElement.classList.contains('dark');
            setIsDark(hasDarkClass);
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const theme = isDark ? THEMES.dark : THEMES.light;

    return (
        <motion.button
            initial={prefersReducedMotion ? REDUCED_MOTION.fade.initial : fileIconPop.initial}
            animate={prefersReducedMotion ? REDUCED_MOTION.fade.animate : fileIconPop.animate}
            transition={prefersReducedMotion
                ? REDUCED_MOTION.transition
                : { delay, ...SPRING.bouncy }
            }
            onDoubleClick={onOpen}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsPressed(false);
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            className="group flex flex-col items-center gap-2.5 w-[80px] focus:outline-none relative"
        >
            {/* Physical button container - Braun-style raised plastic */}
            <motion.div
                animate={{
                    scale: isPressed ? 0.95 : isHovered ? 1.04 : 1,
                    y: isHovered && !isPressed ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative w-[64px] h-[64px] rounded-[16px] flex items-center justify-center"
                style={{
                    background: isPressed ? theme.buttonPressedBg : theme.buttonBg,
                    boxShadow: isPressed ? theme.buttonPressedShadow : theme.buttonShadow,
                    transition: 'background 0.1s ease, box-shadow 0.1s ease',
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        color: theme.iconColor,
                        transform: isPressed ? 'translateY(1px)' : 'none',
                        transition: 'transform 0.1s ease, color 0.3s ease',
                    }}
                >
                    {icon}
                </div>

                {/* Orange indicator dot - Braun signature (when open) */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={SPRING.bouncy}
                            className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full"
                            style={{
                                background: '#ff6b00',
                                boxShadow: '0 0 6px rgba(255, 107, 0, 0.5)',
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Corner detail dot - physical hardware detail */}
                <div
                    className="absolute bottom-2 left-2 w-[3px] h-[3px] rounded-full"
                    style={{
                        background: isDark ? '#4a4a48' : '#e0dcd8',
                        transition: 'background 0.3s ease',
                    }}
                />
            </motion.div>

            {/* Label / Tooltip - physical tag style */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-lg"
                        style={{
                            color: theme.labelColor,
                            background: theme.labelBg,
                            boxShadow: theme.labelShadow,
                            position: 'absolute',
                            top: '100%',
                            marginTop: 4,
                            whiteSpace: 'nowrap',
                            zIndex: 20,
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Selection Ring (Focus State) */}
            <div
                className="absolute inset-0 rounded-[18px] border-2 opacity-0 group-focus:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                    borderColor: '#ff6b00',
                    margin: '-4px',
                }}
            />
        </motion.button>
    );
});

export default DesktopIcon;
