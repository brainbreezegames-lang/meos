'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    Folder,
    Terminal,
    HardDrive,
    MessageCircle,
    Mail,
    StickyNote as StickyNoteIcon,
    Battery,
    Wifi,
    Camera,
    Gamepad2,
    FileText,
    Heart,
    X,
    Minus,
    Square,
    Music,
    Image as ImageIcon,
    Settings,
    Check,
    Sparkles
} from 'lucide-react';

// ============================================
// ANIMATION CONSTANTS
// ============================================
const springSnappy = { type: "spring", damping: 20, stiffness: 400 };
const springGentle = { type: "spring", damping: 25, stiffness: 200 };
const easeOutQuart = [0.25, 1, 0.5, 1];

// ============================================
// TYPES
// ============================================
interface WindowState {
    id: string;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    zIndex: number;
    defaultX: number;
    defaultY: number;
    width: number;
    height: number;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

// ============================================
// MEMOIZED SUB-COMPONENTS WITH DELIGHT
// ============================================

const MemoizedDesktopIcon = React.memo(({ label, icon, onClick, badge, isActive }: {
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    badge?: number,
    isActive?: boolean
}) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08, rotate: [-1, 1, 0] }}
        whileTap={{ scale: 0.92 }}
        transition={springSnappy}
        className={`
            flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer
            transition-colors duration-200 w-16 group
            ${isActive ? 'bg-orange-100/50 shadow-inner' : 'hover:bg-black/5'}
        `}
    >
        <motion.div
            className="relative w-10 h-10 flex items-center justify-center"
            animate={isActive ? { y: [0, -2, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
            {icon}
            <AnimatePresence>
                {badge !== undefined && badge > 0 && (
                    <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={springSnappy}
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 z-10"
                        style={{ background: '#E85D04', border: '1.5px solid #2a2a2a' }}
                    >
                        {badge > 99 ? '99+' : badge}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
        <span
            className="text-xs text-[#2a2a2a] text-center leading-tight select-none"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
        >
            {label}
        </span>
    </motion.button>
));

MemoizedDesktopIcon.displayName = 'DesktopIcon';

// Dock icon with satisfying lift and subtle rotation
const MemoizedDockIcon = React.memo(({ icon, onClick, isActive, badge, label, isSpecial }: {
    icon: React.ReactNode,
    onClick: () => void,
    isActive?: boolean,
    badge?: number,
    label?: string,
    isSpecial?: boolean
}) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
        <motion.button
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            whileHover={{ y: -8, rotate: isSpecial ? [0, -5, 5, 0] : 0 }}
            whileTap={{ y: -4, scale: 0.95 }}
            transition={springGentle}
            className="relative group flex flex-col items-center focus:outline-none"
            title={label}
            aria-label={badge ? `${label}, ${badge} notifications` : label}
        >
            <motion.div
                animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
                transition={springSnappy}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-lg
                    transition-colors duration-200
                    ${isActive ? 'bg-orange-100 shadow-sm' : 'group-hover:bg-black/5'}
                `}
                style={{ border: isActive ? '1.5px solid #2a2a2a' : 'none' }}
            >
                <div className="w-7 h-7 flex items-center justify-center">
                    {icon}
                </div>
            </motion.div>

            {/* Badge with pop animation */}
            <AnimatePresence>
                {badge !== undefined && badge > 0 && (
                    <motion.span
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0 }}
                        transition={springSnappy}
                        className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold px-0.5 z-10 shadow-sm"
                        style={{ background: '#E85D04' }}
                    >
                        {badge}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Active indicator with spring */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={springSnappy}
                        className="w-1.5 h-1.5 rounded-full bg-[#2a2a2a] mt-1"
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
});

MemoizedDockIcon.displayName = 'DockIcon';

// Sticky note with paper-like hover feel
const MemoizedStickyNote = React.memo(({ children, color = '#FFB347', rotation = 0 }: {
    children: React.ReactNode;
    color?: string;
    rotation?: number;
}) => (
    <motion.div
        initial={{ rotate: rotation, scale: 0.8, opacity: 0 }}
        animate={{ rotate: rotation, scale: 1, opacity: 1 }}
        whileHover={{
            scale: 1.08,
            rotate: rotation + 3,
            boxShadow: "8px 8px 0 rgba(0,0,0,0.1)"
        }}
        whileTap={{ scale: 1.02 }}
        transition={springGentle}
        className="relative cursor-pointer"
    >
        <div
            className="p-3 shadow-md"
            style={{
                backgroundColor: color,
                border: '1.5px solid rgba(0,0,0,0.15)',
                minWidth: '100px'
            }}
        >
            {children}
        </div>
        {/* Tape with subtle shine */}
        <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2.5 opacity-60"
            whileHover={{ opacity: 0.8 }}
            style={{
                background: 'linear-gradient(135deg, rgba(220,220,220,0.9), rgba(200,200,200,0.7))',
                border: '1px solid rgba(0,0,0,0.1)',
                transform: 'rotate(1deg)'
            }}
        />
    </motion.div>
));

MemoizedStickyNote.displayName = 'StickyNote';

// Rubber Duck with wobble animation
const RubberDuck = React.memo(({ onClick }: { onClick: () => void }) => {
    const [isQuacking, setIsQuacking] = useState(false);

    const handleClick = () => {
        setIsQuacking(true);
        onClick();
        setTimeout(() => setIsQuacking(false), 600);
    };

    return (
        <motion.button
            onClick={handleClick}
            className="relative group flex flex-col items-center focus:outline-none"
            title="Quack!"
            whileHover={{ y: -8 }}
            transition={springGentle}
        >
            <motion.div
                animate={isQuacking ? {
                    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                    y: [0, -5, 0, -3, 0]
                } : {
                    rotate: [0, 2, 0, -2, 0],
                    y: [0, -2, 0]
                }}
                transition={isQuacking ? {
                    duration: 0.5,
                    ease: easeOutQuart
                } : {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-black/5 transition-colors"
            >
                <Image
                    src="/assets/sketch/rubber-duck.png"
                    alt="Rubber Duck"
                    width={32}
                    height={32}
                    className="object-contain"
                />
            </motion.div>

            {/* Quack bubble */}
            <AnimatePresence>
                {isQuacking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: -35 }}
                        exit={{ scale: 0, opacity: 0, y: -45 }}
                        transition={springSnappy}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white border-2 border-[var(--border-strong)] rounded-full px-3 py-1 text-xs whitespace-nowrap z-50"
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}
                    >
                        <span className="text-[var(--text-primary)]">Quack! 🦆</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

RubberDuck.displayName = 'RubberDuck';

// Honk Button with dramatic effect
const HonkButton = React.memo(() => {
    const [honkCount, setHonkCount] = useState(0);
    const [isHonking, setIsHonking] = useState(false);

    const handleHonk = () => {
        setIsHonking(true);
        setHonkCount(prev => prev + 1);
        setTimeout(() => setIsHonking(false), 400);
    };

    return (
        <motion.button
            onClick={handleHonk}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-black/5 w-16 group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="w-12 h-12 relative flex items-center justify-center"
                animate={isHonking ? {
                    rotate: [0, -20, 20, -15, 15, -5, 5, 0],
                    scale: [1, 1.2, 1.1, 1.15, 1]
                } : {}}
                transition={{ duration: 0.4 }}
            >
                <Image
                    src="/assets/sketch/duck-detective.png"
                    alt="Honk"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
                />

                {/* Honk sparkles */}
                <AnimatePresence>
                    {isHonking && (
                        <>
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{
                                        scale: [0, 1.5],
                                        opacity: [1, 0],
                                        x: [0, (Math.random() - 0.5) * 50],
                                        y: [0, (Math.random() - 0.5) * 50]
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                    className="absolute text-[#E85D04] text-lg"
                                    style={{ left: '50%', top: '50%' }}
                                >
                                    ✨
                                </motion.div>
                            ))}
                        </>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.span
                className="text-xs text-[#2a2a2a]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                animate={isHonking ? { scale: [1, 1.2, 1] } : {}}
            >
                Honk{honkCount > 0 ? ` ×${honkCount}` : ''} 🔥
            </motion.span>

            {/* Big honk bubble */}
            <AnimatePresence>
                {isHonking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 0 }}
                        animate={{ scale: 1, opacity: 1, y: -60 }}
                        exit={{ scale: 1.5, opacity: 0, y: -80 }}
                        transition={springSnappy}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--accent-primary)] text-white border-2 border-[var(--border-strong)] rounded-lg px-3 py-1.5 text-sm whitespace-nowrap z-50"
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 700, boxShadow: 'var(--shadow-md)' }}
                    >
                        HONK!!!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

HonkButton.displayName = 'HonkButton';

// Coffee cup with steam animation
const CoffeeCup = React.memo(() => (
    <div className="relative">
        <Image
            src="/assets/sketch/coffee-cup.png"
            alt=""
            width={70}
            height={70}
            className="object-contain opacity-40 -rotate-12"
        />
        {/* Steam wisps */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className="w-1.5 h-6 bg-gradient-to-t from-transparent to-gray-400/30 rounded-full"
                    animate={{
                        y: [0, -8, 0],
                        opacity: [0.3, 0.6, 0.3],
                        scaleY: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    </div>
));

CoffeeCup.displayName = 'CoffeeCup';

// Plant with gentle sway
const SwayingPlant = React.memo(() => (
    <motion.div
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: 'bottom center' }}
    >
        <Image
            src="/assets/sketch/plant-pot.png"
            alt=""
            width={60}
            height={80}
            className="object-contain opacity-60"
        />
    </motion.div>
));

SwayingPlant.displayName = 'SwayingPlant';

// Interactive checkbox with celebration
const CelebratoryCheckbox = React.memo(({ defaultChecked, label, isHot }: {
    defaultChecked: boolean;
    label: string;
    isHot?: boolean;
}) => {
    const [checked, setChecked] = useState(defaultChecked);
    const [justChecked, setJustChecked] = useState(false);

    const handleChange = () => {
        const newValue = !checked;
        setChecked(newValue);
        if (newValue) {
            setJustChecked(true);
            setTimeout(() => setJustChecked(false), 600);
        }
    };

    return (
        <motion.li
            className="flex items-center gap-3 relative"
            whileHover={{ x: 3 }}
            transition={springGentle}
        >
            <motion.div
                className="relative"
                animate={justChecked ? { scale: [1, 1.3, 1] } : {}}
                transition={springSnappy}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#E85D04] cursor-pointer"
                />
                <AnimatePresence>
                    {justChecked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-full bg-[#E85D04]/30"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.span
                animate={checked ? { opacity: 0.4 } : { opacity: 1 }}
                className={`text-sm text-[#2a2a2a] ${checked ? 'line-through' : isHot ? 'text-[#D64C00]' : ''}`}
                style={{ fontFamily: "var(--font-body)", fontWeight: isHot ? 600 : checked ? 400 : 500 }}
            >
                {label}
            </motion.span>

            {/* Celebration sparkles */}
            <AnimatePresence>
                {justChecked && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.span
                                key={i}
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{
                                    scale: [0, 1],
                                    opacity: [1, 0],
                                    x: (Math.random() - 0.5) * 40,
                                    y: (Math.random() - 0.5) * 40 - 10
                                }}
                                transition={{ duration: 0.5, delay: i * 0.03 }}
                                className="absolute left-4 text-[#E85D04]"
                            >
                                ✓
                            </motion.span>
                        ))}
                    </>
                )}
            </AnimatePresence>
        </motion.li>
    );
});

CelebratoryCheckbox.displayName = 'CelebratoryCheckbox';

// ============================================
// WINDOW COMPONENT (WITH DRAG & ANIMATION)
// ============================================

const windowTransition = {
    type: "spring",
    damping: 25,
    stiffness: 300
};

function SketchWindow({
    win,
    onClose,
    onMinimize,
    onFocus,
    children
}: {
    win: WindowState,
    onClose: () => void,
    onMinimize: () => void,
    onFocus: () => void,
    children: React.ReactNode
}) {
    return (
        <motion.div
            drag
            dragMomentum={false}
            dragListener={true}
            dragControls={undefined}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={windowTransition}
            onMouseDown={onFocus}
            className="absolute flex flex-col bg-[#FFFDF5] rounded-sm overflow-hidden pointer-events-auto"
            style={{
                left: win.defaultX,
                top: win.defaultY,
                width: win.width,
                height: win.height,
                zIndex: win.zIndex,
                border: '2px solid #2a2a2a',
                boxShadow: '6px 6px 0 rgba(0,0,0,0.1)'
            }}
        >
            {/* Title Bar */}
            <div
                className="h-8 flex items-center justify-between px-3 select-none cursor-move flex-shrink-0"
                style={{
                    background: '#F5F3E8',
                    borderBottom: '2px solid #2a2a2a'
                }}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    {win.icon && <span className="opacity-60">{win.icon}</span>}
                    <span
                        className="text-base text-[#1a1a1a]"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                        {win.title}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 z-10">
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-400 border border-yellow-600 hover:bg-yellow-300 transition-colors"
                        aria-label="Minimize"
                    >
                        <Minus size={10} strokeWidth={3} className="text-yellow-800" />
                    </button>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-green-400 border border-green-600 hover:bg-green-300 transition-colors"
                        aria-label="Maximize"
                    >
                        <Square size={8} strokeWidth={3} className="text-green-800" />
                    </button>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-red-400 border border-red-600 hover:bg-red-300 transition-colors"
                        aria-label="Close"
                    >
                        <X size={10} strokeWidth={3} className="text-red-800" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#FFFDF5]">
                {children}
            </div>
        </motion.div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function GoOSPage() {
    const [time, setTime] = useState('00:00');
    const [topZIndex, setTopZIndex] = useState(100);

    // Window initialization with ids and default data
    const [winStates, setWinStates] = useState<Record<string, { isOpen: boolean, isMinimized: boolean, zIndex: number }>>({
        goOS: { isOpen: true, isMinimized: false, zIndex: 10 },
        quackmail: { isOpen: true, isMinimized: false, zIndex: 11 },
        notes: { isOpen: false, isMinimized: false, zIndex: 12 },
        shell: { isOpen: false, isMinimized: false, zIndex: 13 },
        nest: { isOpen: false, isMinimized: false, zIndex: 14 },
        chat: { isOpen: false, isMinimized: false, zIndex: 15 },
        settings: { isOpen: false, isMinimized: false, zIndex: 16 },
    });

    // Static window configs
    const windowConfigs = useMemo(() => ({
        goOS: { title: 'goOS', icon: <ImageIcon size={14} />, width: 440, height: 350, x: 280, y: 70 },
        quackmail: { title: 'Quackmail', icon: <Mail size={14} />, width: 360, height: 240, x: 550, y: 300 },
        notes: { title: 'Notes', icon: <StickyNoteIcon size={14} />, width: 300, height: 280, x: 150, y: 180 },
        shell: { title: 'Shell', icon: <Terminal size={14} />, width: 480, height: 320, x: 220, y: 120 },
        nest: { title: 'Nest', icon: <Folder size={14} />, width: 420, height: 360, x: 120, y: 100 },
        chat: { title: 'Chat', icon: <MessageCircle size={14} />, width: 340, height: 420, x: 650, y: 120 },
        settings: { title: 'Settings', icon: <Settings size={14} />, width: 380, height: 320, x: 380, y: 150 },
    }), []);

    // Update time optimized
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 30000); // Only update every 30s
        return () => clearInterval(interval);
    }, []);

    // Optimized Window operations
    const focusWindow = useCallback((id: string) => {
        setWinStates(prev => {
            if (prev[id].zIndex === topZIndex) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], zIndex: topZIndex + 1, isMinimized: false }
            };
        });
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const openWindow = useCallback((id: string) => {
        setWinStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: topZIndex + 1 }
        }));
        setTopZIndex(prev => prev + 1);
    }, [topZIndex]);

    const closeWindow = useCallback((id: string) => {
        setWinStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: false }
        }));
    }, []);

    const minimizeWindow = useCallback((id: string) => {
        setWinStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: true }
        }));
    }, []);

    const toggleWindow = useCallback((id: string) => {
        const win = winStates[id];
        if (!win.isOpen || win.isMinimized) {
            openWindow(id);
        } else {
            minimizeWindow(id);
        }
    }, [winStates, openWindow, minimizeWindow]);

    return (
        <div
            className="min-h-screen w-full relative overflow-hidden cursor-default antialiased theme-sketch"
            style={{
                backgroundColor: '#FAF8F0',
                backgroundImage: 'url(/honk.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* ====================
                MENU BAR 
                ==================== */}
            <header
                className="h-10 flex items-center justify-between px-5 relative z-[2000] shadow-sm select-none"
                style={{ background: '#F0EDE0', borderBottom: '2px solid #2a2a2a' }}
            >
                <div className="flex items-center gap-8">
                    <span
                        className="text-xl tracking-tight text-[#1a1a1a]"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                        goOS
                    </span>
                    <nav className="flex gap-5 text-sm">
                        {['File', 'Edit', 'View', 'Help'].map(item => (
                            <span
                                key={item}
                                className="cursor-pointer text-[#3a3a3a] hover:text-orange-600 transition-colors"
                                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                            >
                                {item}
                            </span>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#3a3a3a]" style={{ fontFamily: "var(--font-body)" }}>
                    <div className="flex items-center gap-1.5">
                        <Battery size={15} strokeWidth={2} />
                        <span className="font-medium">87%</span>
                    </div>
                    <Wifi size={15} strokeWidth={2} />
                    <span className="font-semibold tabular-nums min-w-[44px] text-right text-[#1a1a1a]">{time}</span>
                </div>
            </header>

            {/* ====================
                DESKTOP AREA
                ==================== */}
            <main className="absolute inset-0 pt-9 pointer-events-none overflow-hidden">

                {/* Icons - Left */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easeOutQuart }}
                    className="absolute top-14 left-5 flex flex-col gap-2 pointer-events-auto"
                >
                    <div className="mb-4 flex flex-col gap-3">
                        <MemoizedStickyNote color="#FFB347" rotation={-3}>
                            <span
                                className="text-lg text-[#1a1a1a]"
                                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                            >
                                Nest:
                            </span>
                        </MemoizedStickyNote>
                        <MemoizedStickyNote color="#FFF9C4" rotation={4}>
                            <span
                                className="text-xs text-[#555] uppercase tracking-wide"
                                style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                            >
                                todo
                            </span>
                            <div
                                className="text-xl text-[#D64C00] leading-tight mt-0.5"
                                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                            >
                                honk!
                            </div>
                        </MemoizedStickyNote>
                    </div>

                    <MemoizedDesktopIcon
                        label="Nest"
                        icon={<Folder size={30} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('nest')}
                        isActive={winStates.nest.isOpen && !winStates.nest.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Shell"
                        icon={<Terminal size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('shell')}
                        badge={250}
                        isActive={winStates.shell.isOpen && !winStates.shell.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Migration"
                        icon={<HardDrive size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                    />

                    {/* Delightful Honk Button */}
                    <HonkButton />
                </motion.div>

                {/* Icons - Right */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easeOutQuart, delay: 0.1 }}
                    className="absolute top-14 right-5 flex flex-col gap-2 items-end pointer-events-auto"
                >
                    <MemoizedDesktopIcon
                        label="Mail"
                        icon={<Mail size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('quackmail')}
                        badge={3}
                        isActive={winStates.quackmail.isOpen && !winStates.quackmail.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Chat"
                        icon={<MessageCircle size={30} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('chat')}
                        isActive={winStates.chat.isOpen && !winStates.chat.isMinimized}
                    />
                    <MemoizedDesktopIcon
                        label="Notes"
                        icon={<StickyNoteIcon size={30} fill="#FFF9C4" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('notes')}
                        isActive={winStates.notes.isOpen && !winStates.notes.isMinimized}
                    />
                    <div className="mt-8 select-none">
                        <SwayingPlant />
                    </div>
                </motion.div>

                {/* WINDOWS LAYER */}
                <div className="relative w-full h-full">
                    <AnimatePresence>
                        {Object.entries(winStates).map(([id, state]) => {
                            if (!state.isOpen || state.isMinimized) return null;
                            const config = windowConfigs[id as keyof typeof windowConfigs];

                            return (
                                <SketchWindow
                                    key={id}
                                    win={{
                                        id,
                                        title: config.title,
                                        isOpen: state.isOpen,
                                        isMinimized: state.isMinimized,
                                        zIndex: state.zIndex,
                                        defaultX: config.x,
                                        defaultY: config.y,
                                        width: config.width,
                                        height: config.height,
                                        icon: config.icon,
                                        content: null
                                    }}
                                    onClose={() => closeWindow(id)}
                                    onMinimize={() => minimizeWindow(id)}
                                    onFocus={() => focusWindow(id)}
                                >
                                    {/* Window Contents Integrated for performance */}
                                    {id === 'goOS' && (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 m-3 relative border-2 border-[#2a2a2a]/10 overflow-hidden bg-white/50">
                                                <Image
                                                    src="/assets/sketch/duck-water.png"
                                                    alt="Duck"
                                                    fill
                                                    className="object-cover"
                                                    sizes="400px"
                                                />
                                                <div
                                                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-white/90 border border-[#2a2a2a]/20 shadow-sm text-[#3a3a3a]"
                                                    style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                                                >
                                                    Bookmark <span className="text-[#D64C00]">♦</span>
                                                </div>
                                            </div>
                                            <footer className="h-11 flex items-center justify-between px-4 bg-[#F5F3E8] border-t-2 border-[#2a2a2a]">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-sm text-[#1a1a1a]"
                                                        style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                                                    >
                                                        Migration In
                                                    </span>
                                                    <span className="text-[#D64C00] animate-pulse text-xs">▶▶▶▶</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="px-3 py-1 text-xs border-2 border-[#2a2a2a] bg-white text-[#2a2a2a] hover:bg-black/5 rounded transition-colors active:scale-95"
                                                        style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                                                    >
                                                        ◀ Prev
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 text-xs border-2 border-[#2a2a2a] bg-white text-[#2a2a2a] hover:bg-black/5 rounded transition-colors active:scale-95"
                                                        style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                                                    >
                                                        Next ▶
                                                    </button>
                                                </div>
                                            </footer>
                                        </div>
                                    )}

                                    {id === 'quackmail' && (
                                        <div className="h-full flex flex-col p-4">
                                            <header className="flex items-center justify-between border-b border-[var(--border-medium)] pb-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>From</span>
                                                    <span className="text-sm text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>David</span>
                                                    <span className="text-xs text-[var(--text-tertiary)]" style={{ fontFamily: 'var(--font-body)' }}>12:05 PM</span>
                                                </div>
                                                <button className="flex items-center hover:scale-110 transition-transform" aria-label="Favorite">
                                                    <Heart size={18} className="text-[var(--accent-primary)]" fill="var(--accent-primary)" />
                                                </button>
                                            </header>
                                            <article className="flex-1">
                                                <p className="text-lg text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Hey there! 👋</p>
                                                <p className="text-base text-[var(--text-secondary)] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>How's the migration going?</p>
                                            </article>
                                            <footer className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                                                <button
                                                    className="px-4 py-2 text-sm border-2 border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:bg-[var(--accent-pale)] rounded transition-all active:translate-y-px"
                                                    style={{ fontFamily: 'var(--font-body)', fontWeight: 600, boxShadow: 'var(--shadow-button)' }}
                                                >
                                                    ↩ Reply
                                                </button>
                                            </footer>
                                        </div>
                                    )}

                                    {id === 'notes' && (
                                        <div className="h-full p-5 bg-[#FFFACD]">
                                            <motion.h3
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-lg text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-medium)]"
                                                style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                                            >
                                                📝 Todo List
                                            </motion.h3>
                                            <ul className="space-y-3">
                                                <CelebratoryCheckbox defaultChecked={false} label="Finish the migration" />
                                                <CelebratoryCheckbox defaultChecked={true} label="Reply to David" />
                                                <CelebratoryCheckbox defaultChecked={false} label="HONK!!! 🦆" isHot />
                                                <CelebratoryCheckbox defaultChecked={true} label="Optimise layout" />
                                            </ul>
                                        </div>
                                    )}

                                    {id === 'shell' && (
                                        <div
                                            className="h-full p-4 bg-[#0d0d0d] whitespace-pre text-sm shadow-inner leading-relaxed"
                                            style={{ fontFamily: "'SF Mono', 'Fira Code', 'Monaco', monospace" }}
                                        >
                                            <div className="text-[#666] text-xs mb-2">goOS Kernel v1.0.4-quack</div>
                                            <div className="text-[#4ade80]">$ duck --status-check</div>
                                            <div className="text-[#a3a3a3] pl-4">[OK] Quack levels nominal</div>
                                            <div className="text-[#a3a3a3] pl-4">[OK] Bread crumbs detected</div>
                                            <div className="mt-3 text-[#facc15]">$ migration --start --force</div>
                                            <div className="mt-1 text-[var(--accent-primary)] pl-4">MIGRATING... [████████░░] 80%</div>
                                            <div className="text-[#4ade80] animate-pulse mt-4">$ _</div>
                                        </div>
                                    )}

                                    {id === 'nest' && (
                                        <div className="h-full p-6 overflow-auto">
                                            <div className="grid grid-cols-3 gap-5">
                                                {['Docs', 'Photos', 'Cache', 'Music', 'Cloud', 'Trash'].map(name => (
                                                    <button
                                                        key={name}
                                                        className="flex flex-col items-center gap-2 p-3 group cursor-pointer rounded-lg hover:bg-[var(--border-subtle)] transition-colors"
                                                    >
                                                        <Folder size={42} fill="var(--accent-light)" stroke="var(--border-strong)" strokeWidth={1.5} className="group-hover:scale-105 transition-transform" />
                                                        <span
                                                            className="text-sm text-[var(--text-primary)]"
                                                            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                                                        >
                                                            {name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {id === 'chat' && (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[var(--bg-surface)]">
                                                {/* Incoming message */}
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] border-2 border-[var(--border-strong)] flex items-center justify-center text-sm shadow-sm flex-shrink-0">🦆</div>
                                                    <div className="bg-white border-2 border-[var(--border-strong)] rounded-xl rounded-tl-none px-4 py-2.5 max-w-[80%]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                                                        <span className="text-sm text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>Quack! Is the migration done yet?</span>
                                                    </div>
                                                </div>
                                                {/* Outgoing message */}
                                                <div className="flex gap-3 justify-end">
                                                    <div className="bg-[var(--accent-pale)] border-2 border-[var(--border-strong)] rounded-xl rounded-tr-none px-4 py-2.5 max-w-[80%]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                                                        <span className="text-sm text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>80% complete! Just polishing the windows.</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-[var(--bg-elevated)] border-t-2 border-[var(--border-strong)]">
                                                <input
                                                    type="text"
                                                    placeholder="Type a message..."
                                                    className="w-full px-4 py-2.5 bg-white border-2 border-[var(--border-strong)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)]"
                                                    style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {id === 'settings' && (
                                        <div className="h-full p-5 space-y-5 overflow-auto">
                                            <section>
                                                <h4
                                                    className="text-base text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-medium)]"
                                                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                                                >
                                                    Appearance
                                                </h4>
                                                <div className="flex items-center justify-between p-4 bg-white border-2 border-[var(--border-strong)] rounded-lg" style={{ boxShadow: 'var(--shadow-sm)' }}>
                                                    <span
                                                        className="text-sm text-[var(--text-primary)]"
                                                        style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                                                    >
                                                        Dark Mode
                                                    </span>
                                                    <div className="w-11 h-6 bg-[var(--border-strong)] rounded-full relative cursor-pointer">
                                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all" />
                                                    </div>
                                                </div>
                                            </section>
                                            <section>
                                                <h4
                                                    className="text-base text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-medium)]"
                                                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                                                >
                                                    Migration
                                                </h4>
                                                <button
                                                    className="w-full p-3 bg-[var(--accent-primary)] text-white text-base border-2 border-[var(--border-strong)] rounded-lg hover:brightness-110 transition-all active:translate-y-px"
                                                    style={{ fontFamily: 'var(--font-body)', fontWeight: 600, boxShadow: 'var(--shadow-button)' }}
                                                >
                                                    Force Sync (80%)
                                                </button>
                                            </section>
                                        </div>
                                    )}
                                </SketchWindow>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Open Nest Floating Button */}
                <div className="absolute bottom-32 left-24 pointer-events-auto">
                    <motion.button
                        onClick={() => openWindow('nest')}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98, y: 2 }}
                        transition={springSnappy}
                        className="px-5 py-3 bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] rounded-lg text-[var(--text-primary)]"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', boxShadow: 'var(--shadow-solid)' }}
                    >
                        🦆 Open Nest
                    </motion.button>
                    <div className="absolute -left-16 -bottom-6 pointer-events-none">
                        <CoffeeCup />
                    </div>
                </div>
            </main>

            {/* ====================
                DOCK
                ==================== */}
            <footer className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[3000]">
                <div
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--bg-muted)]"
                    style={{ border: '2px solid var(--border-strong)', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}
                >
                    <RubberDuck onClick={() => {}} />
                    <MemoizedDockIcon
                        icon={<Folder size={26} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('nest')}
                        isActive={winStates.nest.isOpen}
                        label="Nest"
                    />
                    <MemoizedDockIcon
                        icon={
                            <div
                                className="w-7 h-7 flex items-center justify-center rounded bg-white border-2 border-[var(--border-strong)] text-[var(--text-primary)]"
                                style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem' }}
                            >
                                23
                            </div>
                        }
                        onClick={() => { }}
                        label="Calendar"
                    />
                    <MemoizedDockIcon
                        icon={<Mail size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('quackmail')}
                        isActive={winStates.quackmail.isOpen}
                        badge={3}
                        label="Mail"
                    />
                    <MemoizedDockIcon
                        icon={<Camera size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('goOS')}
                        isActive={winStates.goOS.isOpen}
                        label="Photos"
                    />
                    <MemoizedDockIcon
                        icon={<FileText size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('notes')}
                        isActive={winStates.notes.isOpen}
                        label="Notes"
                    />

                    <div className="w-[1.5px] h-9 mx-1 bg-black/10 rounded-full" />

                    <MemoizedDockIcon
                        icon={<Gamepad2 size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                        label="Games"
                    />
                    <MemoizedDockIcon
                        icon={<Music size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => { }}
                        label="Music"
                    />
                    <MemoizedDockIcon
                        icon={<Settings size={26} stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('settings')}
                        isActive={winStates.settings.isOpen}
                        label="Settings"
                    />

                    {/* Notification Balloon */}
                    <AnimatePresence>
                        <motion.div
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="absolute -right-6 -top-12 bg-[var(--bg-muted)] border-2 border-[var(--border-strong)] px-3 py-1.5 rounded-lg pointer-events-none"
                            style={{ boxShadow: 'var(--shadow-md)' }}
                        >
                            <span
                                className="text-[var(--accent-dark)] animate-bounce inline-block text-sm"
                                style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}
                            >
                                ⚠ Honk!
                            </span>
                            <div className="absolute -bottom-[7px] right-6 w-3 h-3 bg-[var(--bg-muted)] border-b-2 border-r-2 border-[var(--border-strong)] rotate-45" />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </footer>
        </div>
    );
}
