import React, { useRef } from 'react';
import { motion, useDragControls, useReducedMotion } from 'framer-motion';
import { TrafficLights } from './TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from './windowStyles';

interface WindowProps {
    id: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onFocus: () => void;
    zIndex: number;
    children: React.ReactNode;
    initialPosition?: { x: number; y: number };
    className?: string;
    width?: string | number;
    height?: string | number;
}

export default function Window({
    id,
    title,
    isOpen,
    onClose,
    onFocus,
    zIndex,
    children,
    initialPosition = { x: 100, y: 100 },
    className = "",
    width = "600px",
    height = "auto",
}: WindowProps) {
    const dragControls = useDragControls();
    const prefersReducedMotion = useReducedMotion();

    if (!isOpen) return null;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.05}
            initial={prefersReducedMotion ? ANIMATION.reducedInitial : { ...ANIMATION.initial, x: initialPosition.x, top: initialPosition.y }}
            animate={prefersReducedMotion ? ANIMATION.reducedAnimate : { ...ANIMATION.animate, x: initialPosition.x, top: initialPosition.y }}
            exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
            transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
            className={`absolute flex flex-col overflow-hidden ${className}`}
            style={{
                zIndex,
                width,
                height: typeof height === 'number' ? height : undefined,
                minHeight: typeof height === 'string' ? height : undefined,
                borderRadius: WINDOW.borderRadius,
                background: WINDOW.background,
                boxShadow: WINDOW.shadow,
                border: WINDOW.border,
            }}
            onPointerDown={onFocus}
        >
            {/* Title Bar - Draggable Area */}
            <div
                className="flex items-center justify-between select-none"
                style={{
                    height: TITLE_BAR.height,
                    paddingLeft: TITLE_BAR.paddingX,
                    paddingRight: TITLE_BAR.paddingX,
                    background: TITLE_BAR.background,
                    borderBottom: TITLE_BAR.borderBottom,
                    cursor: 'grab',
                }}
                onPointerDown={(e) => dragControls.start(e)}
            >
                <TrafficLights
                    onClose={onClose}
                    showAll={false}
                />
                <span
                    className="font-medium pointer-events-none select-none"
                    style={{
                        fontSize: TITLE_BAR.titleFontSize,
                        fontWeight: TITLE_BAR.titleFontWeight,
                        color: TITLE_BAR.titleColor,
                        letterSpacing: TITLE_BAR.titleLetterSpacing,
                        opacity: TITLE_BAR.titleOpacityActive,
                    }}
                >
                    {title}
                </span>
                <div style={{ width: 28 }}></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
                {children}
            </div>
        </motion.div>
    );
}
