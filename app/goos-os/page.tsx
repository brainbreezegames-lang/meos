'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Layers, Image as ImageIcon, CreditCard, ArrowRight,
    Wifi, Battery, Check, Star, MessageCircle, HelpCircle, Quote,
    Zap, Palette, BarChart3, Globe, Moon, ChevronRight
} from 'lucide-react';
import LandingDock from '@/components/desktop/LandingDock';
import LandingWindow from '@/components/desktop/LandingWindow';

// ============================================
// DESIGN SYSTEM: goOS Sketch Theme
// ============================================
// Typography: Averia Serif Libre (display) + Instrument Sans (body) + Gochi Hand (handwritten)
// Colors: Warm paper (#FAF8F0), Orange accent (#E85D04), Charcoal text (#1a1a1a)
// Style: Hand-drawn aesthetic with 2px borders, offset shadows, paper texture

const easeOutQuart = [0.25, 1, 0.5, 1];
const springSnappy = { type: "spring", stiffness: 400, damping: 25 };
const springBouncy = { type: "spring", stiffness: 300, damping: 15 };

// ============================================
// STICKY NOTE COMPONENT
// ============================================
type StickyNoteColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';
const stickyNoteColors: Record<StickyNoteColor, string> = {
    yellow: '#fef08a',
    blue: '#bae6fd',
    pink: '#fbcfe8',
    green: '#bbf7d0',
    orange: '#fed7aa',
    purple: '#e9d5ff'
};

const StickyNote = ({ children, color = 'yellow', rotation = 0, className = '' }: {
    children: React.ReactNode;
    color?: StickyNoteColor;
    rotation?: number;
    className?: string;
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
            initial={{ rotate: rotation, scale: 0.9, opacity: 0 }}
            animate={{
                rotate: isHovered ? 0 : rotation,
                scale: isDragging ? 1.08 : isHovered ? 1.04 : 1,
                opacity: 1,
                boxShadow: isDragging
                    ? '10px 10px 20px rgba(0,0,0,0.2)'
                    : isHovered
                        ? '6px 6px 12px rgba(0,0,0,0.12)'
                        : '3px 3px 8px rgba(0,0,0,0.08)'
            }}
            whileTap={{ scale: 1.02 }}
            transition={springBouncy}
            className={`sticky-note relative cursor-grab active:cursor-grabbing select-none ${className}`}
            style={{
                backgroundColor: stickyNoteColors[color],
                padding: '14px 12px 18px 12px',
                zIndex: isDragging ? 200 : isHovered ? 100 : 10
            }}
        >
            <div className="relative z-10" style={{ fontFamily: 'var(--font-handwritten)' }}>
                {children}
            </div>
            {/* Tape strip */}
            <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3"
                animate={{ opacity: isDragging ? 0.95 : isHovered ? 0.85 : 0.7 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(245,245,235,0.95) 0%, rgba(220,218,210,0.9) 100%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '1px',
                    transform: 'rotate(1deg)'
                }}
            />
        </motion.div>
    );
};

// ============================================
// MENU BAR ITEM
// ============================================
const MenuBarItem = ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        transition={springSnappy}
        className="cursor-pointer text-[#3a3a3a] hover:text-[#E85D04] transition-colors select-none text-sm"
        style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
    >
        {label}
    </motion.button>
);

// ============================================
// DESKTOP ICON
// ============================================
const DesktopIcon = ({ icon, label, onClick, isActive }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
}) => (
    <motion.button
        onClick={onClick}
        onDoubleClick={onClick}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
        transition={springSnappy}
        className="group flex flex-col items-center gap-2 w-20 focus:outline-none"
    >
        <motion.div
            className="w-14 h-14 rounded-xl bg-white border-2 border-[#2a2a2a] flex items-center justify-center"
            animate={{
                boxShadow: isActive
                    ? '4px 4px 0 #E85D04'
                    : '3px 3px 0 #2a2a2a'
            }}
            whileHover={{
                backgroundColor: '#FFF3E0',
                boxShadow: '4px 4px 0 #E85D04'
            }}
        >
            {icon}
        </motion.div>
        <span
            className="text-[11px] font-medium text-[#2a2a2a] bg-white/80 px-2 py-0.5 rounded-full border border-[#2a2a2a]/20"
            style={{ fontFamily: 'var(--font-body)' }}
        >
            {label}
        </span>
    </motion.button>
);

// ============================================
// FEATURE CARD
// ============================================
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <motion.div
        whileHover={{ y: -4, boxShadow: '5px 5px 0 #E85D04' }}
        transition={springSnappy}
        className="bg-white p-5 rounded-lg border-2 border-[#2a2a2a]"
        style={{ boxShadow: '3px 3px 0 #2a2a2a' }}
    >
        <div className="w-10 h-10 bg-[#FFF3E0] border-2 border-[#2a2a2a] rounded-lg flex items-center justify-center mb-3 text-[#E85D04]">
            {icon}
        </div>
        <h3 className="font-semibold text-[#1a1a1a] mb-1 text-base" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
        <p className="text-sm text-[#555] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{desc}</p>
    </motion.div>
);

// ============================================
// TESTIMONIAL CARD
// ============================================
const TestimonialCard = ({ quote, author, role, avatar }: {
    quote: string;
    author: string;
    role: string;
    avatar: string;
}) => (
    <motion.div
        whileHover={{ y: -3 }}
        className="bg-white p-5 rounded-lg border-2 border-[#2a2a2a] relative"
        style={{ boxShadow: '3px 3px 0 #2a2a2a' }}
    >
        <Quote size={20} className="text-[#E85D04] mb-3 opacity-60" />
        <p className="text-[#2a2a2a] text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)' }}>
            "{quote}"
        </p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF3E0] border-2 border-[#2a2a2a] flex items-center justify-center text-lg">
                {avatar}
            </div>
            <div>
                <p className="font-semibold text-sm text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>{author}</p>
                <p className="text-xs text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>{role}</p>
            </div>
        </div>
    </motion.div>
);

// ============================================
// SKETCH BUTTON
// ============================================
const SketchButton = ({ children, variant = 'primary', onClick, className = '' }: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    className?: string;
}) => (
    <motion.button
        onClick={onClick}
        whileHover={{ y: -2, boxShadow: variant === 'primary' ? '4px 4px 0 #1a1a1a' : '4px 4px 0 #2a2a2a' }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={springSnappy}
        className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 border-[#2a2a2a] flex items-center gap-2 ${className}`}
        style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: variant === 'primary' ? '#E85D04' : '#fff',
            color: variant === 'primary' ? '#fff' : '#2a2a2a',
            boxShadow: '3px 3px 0 #2a2a2a'
        }}
    >
        {children}
    </motion.button>
);

// ============================================
// TIME-BASED GREETING
// ============================================
const getGreeting = (hour: number): string => {
    if (hour < 5) return "Night owl? 🦉";
    if (hour < 12) return "Good morning! ☀️";
    if (hour < 17) return "Good afternoon! 🌤";
    if (hour < 21) return "Good evening! 🌅";
    return "Night owl? 🦉";
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
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
        welcome: 30, features: 29, examples: 29, pricing: 29, reviews: 29, help: 29, signup: 29
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
        setFocusedWindow(id);
        setTopZIndex(prev => {
            const newZ = prev + 1;
            setWindowZIndexes(p => ({ ...p, [id]: newZ }));
            return newZ;
        });
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
                backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}
        >
            {/* ==================== MENU BAR ==================== */}
            <header
                className="fixed top-0 inset-x-0 h-10 z-[2000] flex items-center justify-between px-5 select-none"
                style={{
                    background: 'linear-gradient(180deg, #F5F2E8 0%, #EBE8DD 100%)',
                    borderBottom: '2px solid #2a2a2a'
                }}
            >
                <div className="flex items-center gap-8">
                    {/* Logo with Easter Egg */}
                    <motion.button
                        onClick={handleLogoClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95, rotate: [-3, 3, 0] }}
                        transition={springSnappy}
                        className="flex items-center gap-2 cursor-pointer focus:outline-none relative"
                    >
                        <span className="text-2xl">🦆</span>
                        <span
                            className="text-xl tracking-tight text-[#1a1a1a]"
                            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                        >
                            goOS
                        </span>
                        {/* Easter egg explosion */}
                        <AnimatePresence>
                            {showEasterEgg && (
                                <>
                                    {['🦆', '🥚', '✨', '🎉', '🦆', '💫', '🐣'].map((emoji, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                            animate={{
                                                scale: [0, 1.5, 1],
                                                opacity: [1, 1, 0],
                                                x: (Math.random() - 0.5) * 150,
                                                y: -30 - Math.random() * 80
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1, delay: i * 0.06 }}
                                            className="absolute left-1/2 top-0 text-2xl pointer-events-none"
                                        >
                                            {emoji}
                                        </motion.span>
                                    ))}
                                    <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 25, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute left-1/2 -translate-x-1/2 top-full whitespace-nowrap bg-[#E85D04] text-white px-3 py-1.5 rounded-lg text-xs border-2 border-[#2a2a2a]"
                                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600, boxShadow: '2px 2px 0 #2a2a2a' }}
                                    >
                                        You found the ducks! 🦆🦆🦆
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    <nav className="hidden sm:flex gap-5">
                        {['File', 'Edit', 'View', 'Window', 'Help'].map(item => (
                            <MenuBarItem key={item} label={item} />
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4 text-sm text-[#3a3a3a]" style={{ fontFamily: "var(--font-body)" }}>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#666] hidden md:block font-medium"
                    >
                        {greeting}
                    </motion.span>
                    <div className="flex items-center gap-1.5">
                        <Battery size={15} strokeWidth={2} />
                        <span className="font-medium text-xs">87%</span>
                    </div>
                    <Wifi size={15} strokeWidth={2} />
                    <span className="font-semibold tabular-nums text-[#1a1a1a]">{currentTime}</span>
                </div>
            </header>

            {/* ==================== DESKTOP AREA ==================== */}
            <main className="absolute inset-0 pt-14 px-6 z-10">
                {/* Sticky Notes - Top Right */}
                <div className="absolute top-16 right-6 flex flex-col gap-4 pointer-events-auto">
                    <StickyNote color="orange" rotation={4}>
                        <span className="text-lg text-[#2a2a2a] leading-tight block">
                            Welcome to<br/>goOS! 🦆
                        </span>
                    </StickyNote>
                    <StickyNote color="yellow" rotation={-3}>
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-1">tip</span>
                        <span className="text-sm text-[#2a2a2a] leading-snug block">
                            Double-click icons<br/>to open windows
                        </span>
                    </StickyNote>
                    <StickyNote color="pink" rotation={2}>
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-1">new</span>
                        <span className="text-sm text-[#2a2a2a] leading-snug block">
                            Drag me around!
                        </span>
                    </StickyNote>
                </div>

                {/* Desktop Icons Grid - Left Side */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: easeOutQuart }}
                    className="grid grid-flow-col grid-rows-5 gap-y-3 gap-x-3 w-max pointer-events-auto pt-2"
                >
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
                    <DesktopIcon
                        icon={<Star size={24} className="text-[#2a2a2a]" />}
                        label="Reviews"
                        onClick={() => handleOpenWindow('reviews')}
                        isActive={openWindows.includes('reviews')}
                    />
                    <DesktopIcon
                        icon={<HelpCircle size={24} className="text-[#2a2a2a]" />}
                        label="Help"
                        onClick={() => handleOpenWindow('help')}
                        isActive={openWindows.includes('help')}
                    />
                </motion.div>
            </main>

            {/* ==================== WINDOWS ==================== */}
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
                    initialPosition={{ x: 180, y: 60 }}
                    width="min(580px, 90vw)"
                    height="500px"
                >
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-center items-center text-center bg-[#FAF8F0]">
                        <motion.div
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                            className="mb-5 text-7xl"
                        >
                            🦆
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl sm:text-5xl text-[#1a1a1a] mb-4 leading-[1.1]"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                        >
                            Your portfolio,<br />reimagined as an OS.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-[#555] text-lg max-w-md mx-auto leading-relaxed mb-8"
                            style={{ fontFamily: 'var(--font-body)' }}
                        >
                            goOS transforms your creative work into an immersive desktop experience. Playful, tactile, and deeply personal.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center justify-center gap-4"
                        >
                            <SketchButton variant="primary" onClick={() => handleOpenWindow('signup')}>
                                Get Started Free <ArrowRight size={16} />
                            </SketchButton>
                            <SketchButton variant="secondary" onClick={() => handleOpenWindow('features')}>
                                Explore Features
                            </SketchButton>
                        </motion.div>
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
                    initialPosition={{ x: 220, y: 100 }}
                    width="min(820px, 95vw)"
                    height="auto"
                >
                    <div className="flex-1 overflow-y-auto bg-[#FAF8F0] p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl text-[#1a1a1a] mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                                Everything you need to stand out
                            </h2>
                            <p className="text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>
                                Craft an unforgettable portfolio experience
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FeatureCard icon={<Layers size={20} />} title="Drag & Drop Layout" desc="Arrange windows exactly how you want visitors to see them." />
                            <FeatureCard icon={<Palette size={20} />} title="Beautiful Themes" desc="4 distinct themes to match your vibe. From playful to professional." />
                            <FeatureCard icon={<Globe size={20} />} title="Custom Domain" desc="Connect your own domain with one click. Free SSL included." />
                            <FeatureCard icon={<BarChart3 size={20} />} title="Visitor Analytics" desc="See which windows are opened and how long people explore." />
                            <FeatureCard icon={<Moon size={20} />} title="Dark Mode" desc="Automatic dark mode that respects system preferences." />
                            <FeatureCard icon={<Zap size={20} />} title="Lightning Fast" desc="Static generation means your portfolio loads instantly." />
                        </div>
                    </div>
                </LandingWindow>

                {/* REVIEWS WINDOW */}
                <LandingWindow
                    key="reviews"
                    id="reviews"
                    title="Reviews.txt"
                    isOpen={openWindows.includes('reviews')}
                    onClose={() => handleCloseWindow('reviews')}
                    onFocus={() => handleFocusWindow('reviews')}
                    zIndex={windowZIndexes['reviews']}
                    initialPosition={{ x: 280, y: 140 }}
                    width="min(750px, 95vw)"
                    height="auto"
                >
                    <div className="flex-1 overflow-y-auto bg-[#FAF8F0] p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl text-[#1a1a1a] mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                                Loved by creators
                            </h2>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={18} className="text-[#E85D04] fill-[#E85D04]" />
                                ))}
                                <span className="text-sm text-[#666] ml-2" style={{ fontFamily: 'var(--font-body)' }}>4.9 average rating</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TestimonialCard
                                quote="Finally, a portfolio that feels like me. The duck theme is everything."
                                author="Sarah Chen"
                                role="Product Designer"
                                avatar="🎨"
                            />
                            <TestimonialCard
                                quote="My clients love exploring my work this way. It's memorable and fun!"
                                author="Marcus Johnson"
                                role="Freelance Developer"
                                avatar="💻"
                            />
                            <TestimonialCard
                                quote="The sticky notes feature is genius. I use them for project descriptions."
                                author="Emma Watson"
                                role="Illustrator"
                                avatar="✏️"
                            />
                            <TestimonialCard
                                quote="Setup took 10 minutes. Now I have the coolest portfolio in my cohort."
                                author="Alex Rivera"
                                role="Design Student"
                                avatar="🎓"
                            />
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
                    initialPosition={{ x: 520, y: 80 }}
                    width="380px"
                >
                    <div className="p-6 bg-[#FAF8F0]">
                        <div className="text-center mb-5">
                            <h2 className="text-2xl text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                                Simple pricing
                            </h2>
                            <p className="text-[#666] text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                                Start free, upgrade when ready
                            </p>
                        </div>

                        {/* Free Tier */}
                        <div className="bg-white rounded-lg border-2 border-[#2a2a2a] p-4 mb-3" style={{ boxShadow: '3px 3px 0 #2a2a2a' }}>
                            <div className="flex items-baseline justify-between mb-3">
                                <span className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>Free</span>
                                <span className="text-2xl font-bold text-[#1a1a1a]">$0</span>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {['1 project', 'goOS subdomain', 'Basic analytics'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#2a2a2a]" style={{ fontFamily: 'var(--font-body)' }}>
                                        <Check size={14} className="text-[#E85D04]" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Tier */}
                        <div className="bg-[#FFF3E0] rounded-lg border-2 border-[#E85D04] p-4 relative" style={{ boxShadow: '3px 3px 0 #E85D04' }}>
                            <div className="absolute -top-3 right-4 bg-[#E85D04] text-white text-xs px-2 py-1 rounded border-2 border-[#2a2a2a]" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                                Popular
                            </div>
                            <div className="flex items-baseline justify-between mb-3">
                                <span className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>Pro</span>
                                <div>
                                    <span className="text-2xl font-bold text-[#1a1a1a]">$12</span>
                                    <span className="text-sm text-[#666]">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-2 mb-4">
                                {['Unlimited projects', 'Custom domain', 'Advanced analytics', 'Priority support', 'Remove branding'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#2a2a2a]" style={{ fontFamily: 'var(--font-body)' }}>
                                        <Check size={14} className="text-[#E85D04]" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <SketchButton variant="primary" className="w-full justify-center">
                                Upgrade to Pro <ChevronRight size={16} />
                            </SketchButton>
                        </div>
                        <p className="text-center text-xs text-[#888] mt-3">14-day money-back guarantee</p>
                    </div>
                </LandingWindow>

                {/* HELP WINDOW */}
                <LandingWindow
                    key="help"
                    id="help"
                    title="Help.md"
                    isOpen={openWindows.includes('help')}
                    onClose={() => handleCloseWindow('help')}
                    onFocus={() => handleFocusWindow('help')}
                    zIndex={windowZIndexes['help']}
                    initialPosition={{ x: 350, y: 180 }}
                    width="450px"
                >
                    <div className="p-6 bg-[#FAF8F0]">
                        <h2 className="text-xl text-[#1a1a1a] mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {[
                                { q: "How do I get started?", a: "Sign up for free, choose a theme, and start adding your content. It takes about 5 minutes!" },
                                { q: "Can I use my own domain?", a: "Yes! Pro users can connect any custom domain with free SSL certificates." },
                                { q: "Is there a mobile version?", a: "goOS adapts beautifully to mobile screens with a clean, scrollable layout." },
                                { q: "What about SEO?", a: "Your portfolio is fully indexable with customizable meta tags and Open Graph support." },
                            ].map((faq, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border-2 border-[#2a2a2a]" style={{ boxShadow: '2px 2px 0 #2a2a2a' }}>
                                    <h3 className="font-semibold text-[#1a1a1a] mb-2 text-sm" style={{ fontFamily: 'var(--font-display)' }}>{faq.q}</h3>
                                    <p className="text-sm text-[#555] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{faq.a}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 p-4 bg-[#FFF3E0] rounded-lg border-2 border-[#E85D04]">
                            <p className="text-sm text-[#2a2a2a] mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                                Still have questions?
                            </p>
                            <SketchButton variant="secondary" className="text-xs px-4 py-2">
                                <MessageCircle size={14} /> Chat with us
                            </SketchButton>
                        </div>
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
                    initialPosition={{ x: 260, y: 160 }}
                    width="min(700px, 95vw)"
                    height="420px"
                >
                    <div className="p-6 bg-[#FAF8F0]">
                        <h2 className="text-xl text-[#1a1a1a] mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                            See what others have built
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: "Sarah's Portfolio", emoji: "🎨", desc: "Product Designer" },
                                { name: "DevDuck Studio", emoji: "🦆", desc: "Dev Agency" },
                                { name: "Pixel Perfect", emoji: "✨", desc: "Illustrator" },
                                { name: "Code & Coffee", emoji: "☕", desc: "Fullstack Dev" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -4, boxShadow: '5px 5px 0 #E85D04' }}
                                    className="bg-white border-2 border-[#2a2a2a] rounded-lg p-4 cursor-pointer"
                                    style={{ boxShadow: '3px 3px 0 #2a2a2a' }}
                                >
                                    <div className="aspect-video bg-[#FAF8F0] border-2 border-[#e5e5e5] rounded flex items-center justify-center mb-3">
                                        <span className="text-4xl">{item.emoji}</span>
                                    </div>
                                    <p className="font-semibold text-sm text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)' }}>{item.name}</p>
                                    <p className="text-xs text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </LandingWindow>

                {/* SIGNUP WINDOW */}
                <LandingWindow
                    key="signup"
                    id="signup"
                    title="GetStarted.exe"
                    isOpen={openWindows.includes('signup')}
                    onClose={() => handleCloseWindow('signup')}
                    onFocus={() => handleFocusWindow('signup')}
                    zIndex={windowZIndexes['signup']}
                    initialPosition={{ x: 300, y: 120 }}
                    width="400px"
                >
                    <div className="p-6 bg-[#FAF8F0]">
                        <div className="text-center mb-5">
                            <span className="text-5xl mb-3 block">🦆</span>
                            <h2 className="text-2xl text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                                Join the flock
                            </h2>
                            <p className="text-[#666] text-sm mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                                Create your goOS portfolio in minutes
                            </p>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-lg border-2 border-[#2a2a2a] text-sm focus:outline-none focus:border-[#E85D04] bg-white"
                                style={{ fontFamily: 'var(--font-body)', boxShadow: '2px 2px 0 #2a2a2a' }}
                            />
                            <SketchButton variant="primary" className="w-full justify-center">
                                Get Started Free <ArrowRight size={16} />
                            </SketchButton>
                        </div>
                        <p className="text-center text-xs text-[#888] mt-4">
                            No credit card required
                        </p>
                    </div>
                </LandingWindow>
            </AnimatePresence>

            {/* ==================== DOCK ==================== */}
            <LandingDock onOpenWindow={handleOpenWindow} />
        </div>
    );
}
