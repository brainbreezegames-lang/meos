import React, { useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';

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
    const constraintsRef = useRef(null);

    if (!isOpen) return null;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ opacity: 0, scale: 0.95, y: 20, x: initialPosition.x, top: initialPosition.y }}
            animate={{ opacity: 1, scale: 1, y: 0, x: initialPosition.x, top: initialPosition.y }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute flex flex-col window-glass rounded-xl overflow-hidden shadow-2xl ${className}`}
            style={{
                zIndex,
                width,
                height: typeof height === 'number' ? height : undefined,
                minHeight: typeof height === 'string' ? height : undefined
            }}
            onPointerDown={onFocus}
        >
            {/* Title Bar - Draggable Area */}
            <div
                className="h-10 bg-white/50 border-b border-stone-100 flex items-center px-4 justify-between select-none cursor-default"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <div className="flex gap-2 group">
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="flex items-center justify-center w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] text-transparent hover:text-white transition-colors border border-black/10"
                    >
                        <X size={8} strokeWidth={3} />
                    </button>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28CA41] border border-black/10"></div>
                </div>
                <span className="text-sm font-serif font-medium text-stone-500 tracking-wide pointer-events-none">
                    {title}
                </span>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
                {children}
            </div>
        </motion.div>
    );
}
