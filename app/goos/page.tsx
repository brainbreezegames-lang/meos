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
        <span className="text-[13px] text-[#2a2a2a] text-center font-medium leading-tight select-none">
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
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white border-2 border-[#2a2a2a] rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap shadow-md z-50"
                    >
                        Quack! 🦆
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
                className="text-[13px] font-bold"
                animate={isHonking ? { scale: [1, 1.2, 1] } : {}}
            >
                Honk{honkCount > 0 ? ` ×${honkCount}` : ''}🔥
            </motion.span>

            {/* Big honk bubble */}
            <AnimatePresence>
                {isHonking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 0 }}
                        animate={{ scale: 1, opacity: 1, y: -60 }}
                        exit={{ scale: 1.5, opacity: 0, y: -80 }}
                        transition={springSnappy}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E85D04] text-white border-2 border-[#2a2a2a] rounded-lg px-3 py-1 text-sm font-bold whitespace-nowrap shadow-lg z-50"
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
                className={`text-[17px] ${checked ? 'line-through' : isHot ? 'font-bold text-[#E85D04]' : 'font-medium'}`}
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
                    {win.icon && <span className="opacity-70 scale-90">{win.icon}</span>}
                    <span className="text-[16px] font-bold text-[#2a2a2a]">
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
            className="min-h-screen w-full relative overflow-hidden cursor-default antialiased"
            style={{
                fontFamily: "'Patrick Hand', cursive",
                backgroundColor: '#FAF8F0',
                backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}
        >
            {/* ====================
                MENU BAR 
                ==================== */}
            <header
                className="h-9 flex items-center justify-between px-5 relative z-[2000] shadow-sm select-none"
                style={{ background: '#F0EDE0', borderBottom: '2px solid #2a2a2a' }}
            >
                <div className="flex items-center gap-8">
                    <span className="text-[19px] font-bold tracking-tighter">goOS</span>
                    <nav className="flex gap-6 text-[16px]">
                        {['File', 'Edit', 'View', 'Help'].map(item => (
                            <span key={item} className="cursor-pointer hover:text-orange-600 transition-colors">{item}</span>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-5 text-[15px]">
                    <div className="flex items-center gap-1.5 opacity-80">
                        <Battery size={16} strokeWidth={2.5} />
                        <span className="font-medium">87%</span>
                    </div>
                    <Wifi size={16} strokeWidth={2.5} className="opacity-80" />
                    <span className="font-bold tabular-nums min-w-[45px] text-right">{time}</span>
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
                            <span className="text-[19px] font-bold">Nest:</span>
                        </MemoizedStickyNote>
                        <MemoizedStickyNote color="#FFF9C4" rotation={4}>
                            <span className="text-[14px] opacity-70">todo:</span>
                            <div className="text-[20px] font-bold text-[#E85D04] leading-tight mt-1">honk!</div>
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
                                                <div className="absolute top-2 right-2 px-2 py-1 rounded text-[13px] font-bold bg-white/90 border border-[#2a2a2a]/20 shadow-sm">
                                                    Bookmark cut <span className="text-[#E85D04]">♦</span>
                                                </div>
                                            </div>
                                            <footer className="h-10 flex items-center justify-between px-4 bg-[#F5F3E8] border-t-2 border-[#2a2a2a]">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">Migration In</span>
                                                    <span className="text-[#E85D04] animate-pulse">▶▶▶▶</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="px-3 py-1 text-[13px] font-bold border-2 border-[#2a2a2a] bg-white hover:bg-black/5 rounded transition-colors active:scale-95">◀ Prev</button>
                                                    <button className="px-3 py-1 text-[13px] font-bold border-2 border-[#2a2a2a] bg-white hover:bg-black/5 rounded transition-colors active:scale-95">Next ▶</button>
                                                </div>
                                            </footer>
                                        </div>
                                    )}

                                    {id === 'quackmail' && (
                                        <div className="h-full flex flex-col p-4 text-[#2a2a2a]">
                                            <header className="flex items-center justify-between border-b-2 border-dashed border-[#2a2a2a]/30 pb-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#666] text-sm">From</span>
                                                    <span className="font-bold text-[17px] text-[#2a2a2a]">David ▼</span>
                                                    <span className="text-[#888] text-xs">12:05 PM</span>
                                                </div>
                                                <button className="flex items-center gap-1 text-[14px] font-bold hover:scale-110 transition-transform">
                                                    <Heart size={16} className="text-[#E85D04] fill-[#E85D04]" />
                                                </button>
                                            </header>
                                            <article className="flex-1 text-[18px] leading-relaxed text-[#2a2a2a]">
                                                <p className="font-bold text-[#2a2a2a]">Hey there! 👋</p>
                                                <p className="mt-3 text-[#333]">How's the migration going?</p>
                                            </article>
                                            <footer className="flex justify-end gap-2 pt-3 border-t-2 border-[#2a2a2a]/20">
                                                <button className="px-4 py-1.5 text-[15px] font-bold border-2 border-[#2a2a2a] bg-white text-[#2a2a2a] hover:bg-orange-100 rounded transition-all active:scale-95">
                                                    ↩ Reply
                                                </button>
                                            </footer>
                                        </div>
                                    )}

                                    {id === 'notes' && (
                                        <div className="h-full p-4 bg-[#FFFACD]">
                                            <motion.h3
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-[20px] font-bold mb-4 border-b-2 border-[#2a2a2a]/10 pb-1"
                                            >
                                                📝 Todo List
                                            </motion.h3>
                                            <ul className="space-y-2.5">
                                                <CelebratoryCheckbox defaultChecked={false} label="Finish the migration" />
                                                <CelebratoryCheckbox defaultChecked={true} label="Reply to David" />
                                                <CelebratoryCheckbox defaultChecked={false} label="HONK!!! 🦆" isHot />
                                                <CelebratoryCheckbox defaultChecked={true} label="Optimise layout" />
                                            </ul>
                                        </div>
                                    )}

                                    {id === 'shell' && (
                                        <div className="h-full p-4 bg-[#1a1a1a] text-[#0f0] font-mono whitespace-pre text-[14px] shadow-inner">
                                            <div className="opacity-50 mb-1">goOS Kernel v1.0.4-quack</div>
                                            <div>$ duck --status-check</div>
                                            <div className="text-white">    [OK] Quack levels nominal</div>
                                            <div className="text-white">    [OK] Bread crumbs detected</div>
                                            <div className="mt-2 text-yellow-500 underline">$ migration --start --force</div>
                                            <div className="mt-1 text-orange-500">    MIGRATING... [████████░░] 80%</div>
                                            <div className="animate-pulse mt-4">$ _</div>
                                        </div>
                                    )}

                                    {id === 'nest' && (
                                        <div className="h-full p-5 overflow-auto">
                                            <div className="grid grid-cols-3 gap-6">
                                                {['Docs', 'Photos', 'Cache', 'Music', 'Cloud', 'Trash'].map(name => (
                                                    <div key={name} className="flex flex-col items-center gap-1 group cursor-pointer">
                                                        <Folder size={40} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                                        <span className="text-sm font-bold">{name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {id === 'chat' && (
                                        <div className="h-full flex flex-col">
                                            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#FFFDF5]">
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-orange-300 border-2 border-[#2a2a2a] flex items-center justify-center text-sm shadow-sm flex-shrink-0">🦆</div>
                                                    <div className="bg-white border-2 border-[#2a2a2a] rounded-xl rounded-tl-none p-3 max-w-[80%] shadow-md">
                                                        <span className="text-[15px] font-bold text-[#2a2a2a]">Quack! Is the migration done yet?</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <div className="bg-[#FFE4C4] border-2 border-[#2a2a2a] rounded-xl rounded-tr-none p-3 max-w-[80%] shadow-md">
                                                        <span className="text-[15px] font-bold text-[#2a2a2a]">80% complete! Just polishing the windows.</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-[#F5F3E8] border-t-2 border-[#2a2a2a]">
                                                <input type="text" placeholder="Type a message..." className="w-full px-4 py-2 bg-white border-2 border-[#2a2a2a] rounded-lg text-[15px] font-bold text-[#2a2a2a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                                            </div>
                                        </div>
                                    )}

                                    {id === 'settings' && (
                                        <div className="h-full p-6 space-y-6 overflow-auto">
                                            <section>
                                                <h4 className="text-lg font-bold border-b-2 border-[#2a2a2a]/10 mb-3">Appearance</h4>
                                                <div className="flex items-center justify-between p-3 bg-white/40 border-2 border-[#2a2a2a] rounded-lg">
                                                    <span className="font-bold text-[16px]">Dark Mode</span>
                                                    <div className="w-10 h-5 bg-[#2a2a2a] rounded-full relative">
                                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            </section>
                                            <section>
                                                <h4 className="text-lg font-bold border-b-2 border-[#2a2a2a]/10 mb-3">Migration</h4>
                                                <button className="w-full p-3 bg-orange-500 text-white font-bold text-lg border-2 border-[#2a2a2a] rounded-lg shadow-[3px_3px_0px_#2a2a2a] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#2a2a2a] transition-all active:translate-y-[1px] active:shadow-none">
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98, x: 2, y: 2 }}
                        transition={springSnappy}
                        className="px-6 py-3 bg-[#FFFDF5] border-2 border-[#2a2a2a] rounded-lg font-bold text-[20px] text-[#2a2a2a]"
                        style={{ boxShadow: '4px 4px 0 #2a2a2a' }}
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
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F0EDE0] shadow-xl"
                    style={{ border: '2px solid #2a2a2a', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                >
                    <RubberDuck onClick={() => {}} />
                    <MemoizedDockIcon
                        icon={<Folder size={26} fill="#FFB347" stroke="#2a2a2a" strokeWidth={1.5} />}
                        onClick={() => toggleWindow('nest')}
                        isActive={winStates.nest.isOpen}
                        label="Nest"
                    />
                    <MemoizedDockIcon
                        icon={<div className="w-7 h-7 flex items-center justify-center rounded bg-white text-sm font-bold border-2 border-[#2a2a2a]">23</div>}
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
                            className="absolute -right-6 -top-12 bg-[#F2F0E4] border-2 border-[#2a2a2a] px-3 py-1.5 rounded-lg shadow-md pointer-events-none"
                        >
                            <span className="font-extrabold text-[#E85D04] animate-bounce inline-block">⚠ Honk!</span>
                            <div className="absolute -bottom-[7px] right-6 w-3 h-3 bg-[#F2F0E4] border-b-2 border-r-2 border-[#2a2a2a] rotate-45" />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </footer>
        </div>
    );
}
