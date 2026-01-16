'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Image as ImageIcon, CreditCard, Command, ArrowRight, Wifi, Battery, Check, Folder, Mail, Terminal, MessageCircle } from 'lucide-react';
import LandingDock from '@/components/desktop/LandingDock';
import LandingWindow from '@/components/desktop/LandingWindow';

// Spring animation configs
const springSnappy = { type: "spring", stiffness: 400, damping: 25 };
const springNote = { type: "spring", stiffness: 300, damping: 15 };

// Sticky note colors
type StickyNoteColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';
const stickyNoteColors: Record<StickyNoteColor, string> = {
    yellow: '#fef08a',
    blue: '#bae6fd',
    pink: '#fbcfe8',
    green: '#bbf7d0',
    orange: '#fed7aa',
    purple: '#e9d5ff'
};

// Tactile Sticky Note component
const StickyNote = ({ children, color = 'yellow', rotation = 0 }: {
    children: React.ReactNode;
    color?: StickyNoteColor;
    rotation?: number;
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            drag
            dragMomentum={true}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ rotate: rotation, scale: 0.8, opacity: 0 }}
            animate={{
                rotate: isHovered ? 0 : rotation,
                scale: isDragging ? 1.05 : isHovered ? 1.05 : 1,
                opacity: 1,
                boxShadow: isDragging
                    ? '12px 12px 20px rgba(0,0,0,0.25)'
                    : isHovered
                        ? '8px 8px 12px rgba(0,0,0,0.15)'
                        : '4px 4px 8px rgba(0,0,0,0.1)'
            }}
            whileTap={{ scale: 1.02 }}
            transition={springNote}
            className="sticky-note relative cursor-grab active:cursor-grabbing select-none"
            style={{
                backgroundColor: stickyNoteColors[color],
                minWidth: '110px',
                padding: '14px 12px 18px 12px',
                zIndex: isDragging ? 100 : isHovered ? 50 : 1
            }}
        >
            <div className="relative z-10" style={{ fontFamily: 'var(--font-handwritten)' }}>
                {children}
            </div>
            {/* Tape strip */}
            <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3"
                animate={{ opacity: isDragging ? 0.9 : isHovered ? 0.8 : 0.6, scaleX: isDragging ? 1.1 : 1 }}
                transition={springNote}
                style={{
                    background: 'linear-gradient(135deg, rgba(240,240,230,0.95) 0%, rgba(210,210,200,0.85) 100%)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '1px',
                    transform: 'rotate(1deg)'
                }}
            />
            {/* Fold corner */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)' }}
            />
        </motion.div>
    );
};

// Menu bar item with hover effect
const MenuBarItem = ({ label }: { label: string }) => (
    <motion.span
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        transition={springSnappy}
        className="cursor-pointer text-[#3a3a3a] hover:text-orange-600 transition-colors select-none"
        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
    >
        {label}
    </motion.span>
);

// Desktop icon component
const DesktopIcon = ({ icon, label, onClick, isActive }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
}) => (
    <motion.button
        onClick={onClick}
        onDoubleClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={springSnappy}
        className={`group flex flex-col items-center gap-2 w-20 focus:outline-none ${isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
    >
        <div className="w-14 h-14 rounded-xl bg-white/80 border-2 border-[#2a2a2a] flex items-center justify-center group-hover:bg-[var(--accent-pale)] transition-colors"
            style={{ boxShadow: '3px 3px 0 #2a2a2a' }}>
            {icon}
        </div>
        <span className="text-[11px] font-medium text-[#2a2a2a] bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-body)' }}>
            {label}
        </span>
    </motion.button>
);

// Time-based greeting
const getGreeting = (hour: number): string => {
    if (hour < 5) return "Night owl? 🦉";
    if (hour < 12) return "Good morning! ☀️";
    if (hour < 17) return "Good afternoon! 🌤";
    if (hour < 21) return "Good evening! 🌅";
    return "Night owl? 🦉";
};

export default function GoOSLanding() {
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [greeting, setGreeting] = useState('');
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    // Window Management
    const [openWindows, setOpenWindows] = useState<string[]>(['welcome']);
    const [focusedWindow, setFocusedWindow] = useState<string>('welcome');
    const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>({
        welcome: 30,
        features: 29,
        examples: 29,
        pricing: 29
    });
    const [topZIndex, setTopZIndex] = useState(30);

    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            setGreeting(getGreeting(now.getHours()));
        };
        updateTime();
        const interval = setInterval(updateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenWindow = useCallback((id: string) => {
        setOpenWindows(prev => prev.includes(id) ? prev : [...prev, id]);
        handleFocusWindow(id);
    }, []);

    const handleCloseWindow = useCallback((id: string) => {
        setOpenWindows(prev => prev.filter(w => w !== id));
    }, []);

    const handleFocusWindow = useCallback((id: string) => {
        setFocusedWindow(id);
        setTopZIndex(prev => {
            const newZ = prev + 1;
            setWindowZIndexes(p => ({ ...p, [id]: newZ }));
            return newZ;
        });
    }, []);

    const handleLogoClick = useCallback(() => {
        const newCount = logoClickCount + 1;
        setLogoClickCount(newCount);
        if (newCount >= 5) {
            setShowEasterEgg(true);
            setLogoClickCount(0);
            setTimeout(() => setShowEasterEgg(false), 3000);
        }
    }, [logoClickCount]);

    if (!mounted) return <div className="h-screen w-screen bg-[#FAF8F0]" />;

    return (
        <div
            className="h-screen w-screen overflow-hidden relative cursor-default antialiased theme-sketch"
            style={{
                backgroundColor: '#FAF8F0',
                backgroundImage: 'radial-gradient(#d8d8d8 1px, transparent 1px)',
                backgroundSize: '28px 28px'
            }}
        >
            {/* Menu Bar */}
            <header
                className="fixed top-0 inset-x-0 h-10 z-[2000] flex items-center justify-between px-5 shadow-sm select-none"
                style={{ background: '#F0EDE0', borderBottom: '2px solid #2a2a2a' }}
            >
                <div className="flex items-center gap-8">
                    <motion.button
                        onClick={handleLogoClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95, rotate: [-5, 5, 0] }}
                        transition={springSnappy}
                        className="text-xl tracking-tight text-[#1a1a1a] cursor-pointer focus:outline-none relative"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                        goOS
                        {/* Easter egg burst */}
                        <AnimatePresence>
                            {showEasterEgg && (
                                <>
                                    {['🦆', '🥚', '✨', '🎉', '🦆', '💫'].map((emoji, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                            animate={{
                                                scale: [0, 1.5, 1],
                                                opacity: [1, 1, 0],
                                                x: (Math.random() - 0.5) * 120,
                                                y: -20 - Math.random() * 60
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8, delay: i * 0.08 }}
                                            className="absolute left-1/2 top-0 text-xl pointer-events-none"
                                        >
                                            {emoji}
                                        </motion.span>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 20 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute left-1/2 -translate-x-1/2 top-full whitespace-nowrap bg-[#E85D04] text-white px-2 py-1 rounded text-xs"
                                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                                    >
                                        You found the duck! 🦆
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.button>
                    <nav className="hidden sm:flex gap-5 text-sm">
                        {['File', 'Edit', 'View', 'Help'].map(item => (
                            <MenuBarItem key={item} label={item} />
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#3a3a3a]" style={{ fontFamily: "var(--font-body)" }}>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#666] hidden sm:block"
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                    >
                        {greeting}
                    </motion.span>
                    <div className="flex items-center gap-1.5">
                        <Battery size={15} strokeWidth={2} />
                        <span className="font-medium">87%</span>
                    </div>
                    <Wifi size={15} strokeWidth={2} />
                    <span className="font-semibold tabular-nums min-w-[44px] text-right text-[#1a1a1a]">{currentTime}</span>
                </div>
            </header>

            {/* Desktop Area */}
            <main className="absolute inset-0 pt-14 px-6 z-10">
                {/* Sticky Notes */}
                <div className="absolute top-16 right-6 flex flex-col gap-3 pointer-events-auto">
                    <StickyNote color="orange" rotation={3}>
                        <span className="text-lg text-[#2a2a2a]">Welcome to goOS! 🦆</span>
                    </StickyNote>
                    <StickyNote color="yellow" rotation={-2}>
                        <span className="text-[10px] text-[#666] uppercase tracking-wider block mb-1">tip</span>
                        <span className="text-sm text-[#2a2a2a]">Double-click icons to open windows</span>
                    </StickyNote>
                </div>

                {/* Desktop Icons Grid */}
                <div className="grid grid-flow-col grid-rows-4 gap-y-4 gap-x-4 w-max pointer-events-auto items-start justify-items-center pt-4">
                    <DesktopIcon
                        icon={<Sparkles size={24} className="text-[#E85D04]" />}
                        label="Start Here"
                        onClick={() => handleOpenWindow('welcome')}
                        isActive={openWindows.includes('welcome')}
                    />
                    <DesktopIcon
                        icon={<Layers size={24} className="text-[#2a2a2a]" />}
                        label="Features"
                        onClick={() => handleOpenWindow('features')}
                        isActive={openWindows.includes('features')}
                    />
                    <DesktopIcon
                        icon={<ImageIcon size={24} className="text-[#2a2a2a]" />}
                        label="Showcase"
                        onClick={() => handleOpenWindow('examples')}
                        isActive={openWindows.includes('examples')}
                    />
                    <DesktopIcon
                        icon={<CreditCard size={24} className="text-[#2a2a2a]" />}
                        label="Pricing"
                        onClick={() => handleOpenWindow('pricing')}
                        isActive={openWindows.includes('pricing')}
                    />
                </div>
            </main>

            {/* Windows */}
            <AnimatePresence>
                {/* WELCOME WINDOW */}
                <LandingWindow
                    key="welcome"
                    id="welcome"
                    title="Welcome.txt"
                    isOpen={openWindows.includes('welcome')}
                    onClose={() => handleCloseWindow('welcome')}
                    onFocus={() => handleFocusWindow('welcome')}
                    zIndex={windowZIndexes['welcome']}
                    initialPosition={{ x: 150, y: 80 }}
                    width="min(620px, 90vw)"
                    height="520px"
                >
                    <div className="flex-1 overflow-y-auto p-10 flex flex-col justify-center items-center text-center bg-[#FAF8F0]">
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                            className="mb-6 text-6xl"
                        >
                            🦆
                        </motion.div>
                        <h1
                            className="text-4xl sm:text-5xl text-[#1a1a1a] mb-4 leading-tight"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                        >
                            Your portfolio,<br />reimagined as an OS.
                        </h1>
                        <p
                            className="text-[#666] text-lg max-w-md mx-auto leading-relaxed mb-8"
                            style={{ fontFamily: 'var(--font-body)' }}
                        >
                            goOS transforms your creative work into an immersive desktop experience. Playful, tactile, and deeply personal.
                        </p>
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-[#E85D04] text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 border-2 border-[#2a2a2a]"
                                style={{ boxShadow: '3px 3px 0 #2a2a2a', fontFamily: 'var(--font-body)' }}
                            >
                                <span>Get Started</span>
                                <ArrowRight size={16} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOpenWindow('features')}
                                className="bg-white text-[#2a2a2a] px-6 py-3 rounded-lg text-sm font-semibold border-2 border-[#2a2a2a]"
                                style={{ boxShadow: '3px 3px 0 #2a2a2a', fontFamily: 'var(--font-body)' }}
                            >
                                Explore Features
                            </motion.button>
                        </div>
                    </div>
                </LandingWindow>

                {/* FEATURES WINDOW */}
                <LandingWindow
                    key="features"
                    id="features"
                    title="Features.md"
                    isOpen={openWindows.includes('features')}
                    onClose={() => handleCloseWindow('features')}
                    onFocus={() => handleFocusWindow('features')}
                    zIndex={windowZIndexes['features']}
                    initialPosition={{ x: 200, y: 120 }}
                    width="min(850px, 95vw)"
                    height="auto"
                >
                    <div className="flex-1 overflow-y-auto bg-[#FAF8F0] p-8">
                        <div className="max-w-3xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <FeatureCard icon={<Layers size={20} />} title="Drag & Drop" desc="Arrange windows exactly how you want." />
                                <FeatureCard icon={<CreditCard size={20} />} title="Beautiful Type" desc="Curated font pairings for every theme." />
                                <FeatureCard icon={<Wifi size={20} />} title="Mobile Ready" desc="Looks great on every screen size." />
                                <FeatureCard icon={<Command size={20} />} title="Analytics" desc="See how visitors explore your space." />
                                <FeatureCard icon={<Sparkles size={20} />} title="Themes" desc="Multiple themes to match your vibe." />
                                <FeatureCard icon={<Folder size={20} />} title="Custom Icons" desc="Upload your own icons and images." />
                            </div>
                        </div>
                    </div>
                </LandingWindow>

                {/* PRICING WINDOW */}
                <LandingWindow
                    key="pricing"
                    id="pricing"
                    title="Pricing.txt"
                    isOpen={openWindows.includes('pricing')}
                    onClose={() => handleCloseWindow('pricing')}
                    onFocus={() => handleFocusWindow('pricing')}
                    zIndex={windowZIndexes['pricing']}
                    initialPosition={{ x: 550, y: 100 }}
                    width="380px"
                >
                    <div className="p-6 bg-[#FAF8F0]">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                                Pro License
                            </h2>
                            <p className="text-[#666] text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                                One simple payment. Forever yours.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border-2 border-[#2a2a2a] p-5 mb-4" style={{ boxShadow: '3px 3px 0 #2a2a2a' }}>
                            <div className="flex items-baseline justify-center gap-1 mb-4">
                                <span className="text-3xl font-bold text-[#1a1a1a]">$12</span>
                                <span className="text-[#888] text-sm">/ month</span>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {['Unlimited Projects', 'Custom Domain', 'Analytics', 'Priority Support'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#2a2a2a]" style={{ fontFamily: 'var(--font-body)' }}>
                                        <Check size={14} className="text-[#E85D04]" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-[#E85D04] text-white h-10 rounded-md text-sm font-semibold border-2 border-[#2a2a2a]"
                                style={{ boxShadow: '2px 2px 0 #2a2a2a', fontFamily: 'var(--font-body)' }}
                            >
                                Upgrade to Pro
                            </motion.button>
                        </div>
                        <p className="text-center text-xs text-[#888]">14-day money-back guarantee</p>
                    </div>
                </LandingWindow>

                {/* SHOWCASE WINDOW */}
                <LandingWindow
                    key="examples"
                    id="examples"
                    title="Showcase.gallery"
                    isOpen={openWindows.includes('examples')}
                    onClose={() => handleCloseWindow('examples')}
                    onFocus={() => handleFocusWindow('examples')}
                    zIndex={windowZIndexes['examples']}
                    initialPosition={{ x: 250, y: 180 }}
                    width="min(750px, 95vw)"
                    height="450px"
                >
                    <div className="p-6 bg-[#FAF8F0] grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="aspect-video bg-white border-2 border-[#2a2a2a] rounded-lg flex items-center justify-center"
                                style={{ boxShadow: '3px 3px 0 #2a2a2a' }}
                            >
                                <span className="text-4xl">🦆</span>
                            </motion.div>
                        ))}
                    </div>
                </LandingWindow>
            </AnimatePresence>

            <LandingDock onOpenWindow={handleOpenWindow} />
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white p-5 rounded-lg border-2 border-[#2a2a2a] transition-shadow"
            style={{ boxShadow: '3px 3px 0 #2a2a2a' }}
        >
            <div className="w-10 h-10 bg-[#FFF3E0] border-2 border-[#2a2a2a] rounded-lg flex items-center justify-center mb-3 text-[#E85D04]">
                {icon}
            </div>
            <h3 className="font-semibold text-[#1a1a1a] mb-1" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
            <p className="text-sm text-[#666] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{desc}</p>
        </motion.div>
    );
}
