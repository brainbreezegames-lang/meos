'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Check, Star } from 'lucide-react';

// ============================================
// ANIMATION CONSTANTS
// ============================================
const springNote = { type: "spring", stiffness: 300, damping: 15 };
const springBouncy = { type: "spring", stiffness: 400, damping: 20 };
const easeOutQuart = [0.25, 1, 0.5, 1];

// ============================================
// STICKY NOTE COLORS
// ============================================
type StickyColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';
const stickyColors: Record<StickyColor, string> = {
    yellow: '#fef08a',
    blue: '#bae6fd',
    pink: '#fbcfe8',
    green: '#bbf7d0',
    orange: '#fed7aa',
    purple: '#e9d5ff'
};

// ============================================
// DRAGGABLE STICKY NOTE
// ============================================
const DraggableStickyNote = ({
    children,
    color = 'yellow',
    rotation = 0,
    className = '',
    size = 'md'
}: {
    children: React.ReactNode;
    color?: StickyColor;
    rotation?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
        sm: 'p-3 min-w-[100px]',
        md: 'p-4 min-w-[140px]',
        lg: 'p-5 min-w-[180px]'
    };

    return (
        <motion.div
            drag
            dragMomentum={true}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ rotate: rotation, scale: 0, opacity: 0 }}
            animate={{
                rotate: isHovered ? 0 : rotation,
                scale: isDragging ? 1.08 : isHovered ? 1.05 : 1,
                opacity: 1,
                boxShadow: isDragging
                    ? '14px 14px 24px rgba(0,0,0,0.25)'
                    : isHovered
                        ? '10px 10px 16px rgba(0,0,0,0.15)'
                        : '5px 5px 10px rgba(0,0,0,0.1)'
            }}
            transition={springNote}
            className={`sticky-note relative cursor-grab active:cursor-grabbing select-none ${sizeClasses[size]} ${className}`}
            style={{
                backgroundColor: stickyColors[color],
                zIndex: isDragging ? 100 : isHovered ? 50 : 1,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 88%, 92% 100%, 0% 100%)'
            }}
        >
            {/* Tape */}
            <motion.div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-3.5"
                animate={{ opacity: isDragging ? 0.9 : 0.6 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(245,245,235,0.95), rgba(215,215,205,0.85))',
                    border: '1px solid rgba(0,0,0,0.08)',
                    transform: 'rotate(1deg)'
                }}
            />
            {/* Content */}
            <div className="relative z-10" style={{ fontFamily: 'var(--font-handwritten)' }}>
                {children}
            </div>
            {/* Corner fold */}
            <div
                className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%)' }}
            />
        </motion.div>
    );
};

// ============================================
// QUACKING DUCK MASCOT
// ============================================
const DuckMascot = ({ size = 120 }: { size?: number }) => {
    const [isQuacking, setIsQuacking] = useState(false);
    const [quackCount, setQuackCount] = useState(0);

    const handleQuack = () => {
        setIsQuacking(true);
        setQuackCount(prev => prev + 1);
        setTimeout(() => setIsQuacking(false), 600);
    };

    const quackMessages = [
        "Quack!",
        "HONK!",
        "Welcome!",
        "Try me!",
        "Duck yeah!",
        "Waddle on!"
    ];

    return (
        <motion.button
            onClick={handleQuack}
            className="relative focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                animate={isQuacking ? {
                    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                    y: [0, -10, 0]
                } : {
                    rotate: [0, 2, 0, -2, 0],
                    y: [0, -3, 0]
                }}
                transition={isQuacking ? { duration: 0.5 } : { duration: 3, repeat: Infinity }}
            >
                <Image
                    src="/assets/sketch/duck-detective.png"
                    alt="goOS Duck Mascot"
                    width={size}
                    height={size}
                    className="object-contain drop-shadow-lg"
                    priority
                />
            </motion.div>

            {/* Quack bubble */}
            <AnimatePresence>
                {isQuacking && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: -20 }}
                        exit={{ scale: 0, opacity: 0, y: -40 }}
                        transition={springBouncy}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border-2 border-[#2a2a2a] rounded-full px-4 py-2 whitespace-nowrap z-50"
                        style={{ fontFamily: 'var(--font-handwritten)', boxShadow: '4px 4px 0 rgba(0,0,0,0.1)' }}
                    >
                        <span className="text-lg text-[#2a2a2a]">
                            {quackMessages[quackCount % quackMessages.length]}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sparkles */}
            <AnimatePresence>
                {isQuacking && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <motion.span
                                key={i}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 1.5],
                                    opacity: [1, 0],
                                    x: [0, (Math.random() - 0.5) * 80],
                                    y: [0, (Math.random() - 0.5) * 80]
                                }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, delay: i * 0.05 }}
                                className="absolute top-1/2 left-1/2 text-xl"
                            >
                                {['✨', '🦆', '⭐', '💫'][i % 4]}
                            </motion.span>
                        ))}
                    </>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// ============================================
// FEATURE CARD
// ============================================
const FeatureCard = ({
    icon,
    title,
    description,
    delay = 0
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: easeOutQuart }}
        whileHover={{ y: -4, boxShadow: '6px 6px 0 rgba(0,0,0,0.12)' }}
        className="p-6 bg-[#FFFDF5] border-2 border-[#2a2a2a] relative"
        style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.08)' }}
    >
        <div className="w-12 h-12 rounded-lg bg-[#fed7aa] border-2 border-[#2a2a2a] flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl mb-2 text-[#1a1a1a]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {title}
        </h3>
        <p className="text-[#4a4a4a] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            {description}
        </p>
    </motion.div>
);

// ============================================
// CTA BUTTON
// ============================================
const GoOSButton = ({
    children,
    href,
    variant = 'primary',
    size = 'md'
}: {
    children: React.ReactNode;
    href: string;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}) => {
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const variantClasses = {
        primary: 'bg-[#E85D04] text-white border-[#2a2a2a] hover:brightness-110',
        secondary: 'bg-white text-[#2a2a2a] border-[#2a2a2a] hover:bg-[#f5f5f0]'
    };

    return (
        <Link href={href}>
            <motion.span
                whileHover={{ y: -2, boxShadow: '5px 5px 0 #2a2a2a' }}
                whileTap={{ y: 1, boxShadow: '2px 2px 0 #2a2a2a' }}
                transition={springBouncy}
                className={`inline-flex items-center gap-2 border-2 font-semibold cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]}`}
                style={{ fontFamily: 'var(--font-body)', boxShadow: '4px 4px 0 #2a2a2a' }}
            >
                {children}
            </motion.span>
        </Link>
    );
};

// ============================================
// TESTIMONIAL
// ============================================
const Testimonial = ({
    quote,
    author,
    role,
    color = 'yellow',
    rotation = 0
}: {
    quote: string;
    author: string;
    role: string;
    color?: StickyColor;
    rotation?: number;
}) => (
    <DraggableStickyNote color={color} rotation={rotation} size="lg">
        <p className="text-lg text-[#2a2a2a] mb-3 leading-snug">"{quote}"</p>
        <div className="border-t border-[#2a2a2a]/20 pt-2 mt-2">
            <p className="text-sm font-bold text-[#2a2a2a]">{author}</p>
            <p className="text-xs text-[#666]">{role}</p>
        </div>
    </DraggableStickyNote>
);

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function GoOSLanding() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className="min-h-screen w-full overflow-x-hidden theme-sketch"
            style={{
                backgroundColor: '#FAF8F0',
                backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}
        >
            {/* ==================== NAVIGATION ==================== */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
                style={{
                    background: 'rgba(250, 248, 240, 0.9)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '2px solid #2a2a2a'
                }}
            >
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/sketch/rubber-duck.png"
                        alt="goOS"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    <span
                        className="text-2xl text-[#1a1a1a]"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                    >
                        goOS
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Pricing', 'About'].map(item => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            whileHover={{ y: -2 }}
                            className="text-[#3a3a3a] hover:text-[#E85D04] transition-colors cursor-pointer"
                            style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                        >
                            {item}
                        </motion.a>
                    ))}
                </div>
                <GoOSButton href="/signup" size="sm">
                    Get Started <ArrowRight size={16} />
                </GoOSButton>
            </motion.nav>

            {/* ==================== HERO SECTION ==================== */}
            <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
                {/* Floating decorative sticky notes */}
                {mounted && (
                    <>
                        <div className="absolute top-20 left-[5%] hidden lg:block">
                            <DraggableStickyNote color="pink" rotation={-8} size="sm">
                                <span className="text-sm">drag me!</span>
                            </DraggableStickyNote>
                        </div>
                        <div className="absolute top-40 right-[8%] hidden lg:block">
                            <DraggableStickyNote color="blue" rotation={12} size="sm">
                                <span className="text-sm">todo: ship it</span>
                            </DraggableStickyNote>
                        </div>
                        <div className="absolute bottom-20 left-[12%] hidden lg:block">
                            <DraggableStickyNote color="green" rotation={-5} size="sm">
                                <span className="text-sm">done!</span>
                                <Check size={14} className="inline ml-1 text-green-600" />
                            </DraggableStickyNote>
                        </div>
                    </>
                )}

                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: easeOutQuart }}
                            className="flex-1 text-center lg:text-left"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#fed7aa] border-2 border-[#2a2a2a] mb-6"
                                style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}
                            >
                                <Sparkles size={16} className="text-[#E85D04]" />
                                <span style={{ fontFamily: 'var(--font-handwritten)' }} className="text-[#2a2a2a]">
                                    Your Personal Web Desktop
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] mb-6 leading-[1.1]"
                                style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                            >
                                A portfolio that
                                <br />
                                <span className="relative inline-block">
                                    <span className="relative z-10">actually</span>
                                    <motion.span
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.5, duration: 0.4 }}
                                        className="absolute bottom-1 left-0 w-full h-3 bg-[#fef08a] -z-0 origin-left"
                                    />
                                </span>
                                {' '}feels like
                                <span
                                    className="text-[#E85D04] block mt-2"
                                    style={{ fontFamily: 'var(--font-handwritten)' }}
                                >
                                    you
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p
                                className="text-lg md:text-xl text-[#4a4a4a] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                                style={{ fontFamily: 'var(--font-body)' }}
                            >
                                Create an explorable desktop experience for your portfolio,
                                links, or personal brand. Beautiful, memorable, and uniquely yours.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <GoOSButton href="/signup" size="lg">
                                    Start Building Free <ArrowRight size={20} />
                                </GoOSButton>
                                <GoOSButton href="/goos" variant="secondary" size="lg">
                                    See Demo
                                </GoOSButton>
                            </div>

                            {/* Social proof */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
                            >
                                <div className="flex -space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#fed7aa] to-[#fbcfe8]"
                                            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>
                                    <span className="font-semibold text-[#2a2a2a]">2,847+</span> creatives building
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Right: Duck Mascot + Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: easeOutQuart }}
                            className="flex-1 relative"
                        >
                            <div className="relative">
                                {/* Desktop preview mockup */}
                                <div
                                    className="relative bg-[#FFFDF5] border-2 border-[#2a2a2a] p-4 overflow-hidden"
                                    style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.1)' }}
                                >
                                    {/* Title bar */}
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[#2a2a2a]/20">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                                            <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
                                            <div className="w-3 h-3 rounded-full bg-[#6BCB77]" />
                                        </div>
                                        <span className="text-xs text-[#888] ml-2" style={{ fontFamily: 'var(--font-body)' }}>
                                            your-portfolio.meos.app
                                        </span>
                                    </div>
                                    {/* Preview content */}
                                    <div className="aspect-[4/3] bg-[#FAF8F0] relative overflow-hidden rounded"
                                        style={{ backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                                    >
                                        {/* Mini windows */}
                                        <div className="absolute top-4 left-4 w-24 h-16 bg-white border border-[#2a2a2a]/30 rounded-sm p-1">
                                            <div className="w-full h-2 bg-[#f0ede0] rounded-sm mb-1" />
                                            <div className="w-full h-full bg-[#bae6fd]/30 rounded-sm" />
                                        </div>
                                        <div className="absolute top-8 right-4 w-20 h-20 bg-white border border-[#2a2a2a]/30 rounded-sm p-1">
                                            <div className="w-full h-2 bg-[#f0ede0] rounded-sm mb-1" />
                                            <div className="w-full h-full bg-[#fbcfe8]/30 rounded-sm" />
                                        </div>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 bg-white/80 border border-[#2a2a2a]/20 rounded-lg">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-6 h-6 bg-[#fed7aa]/50 rounded-md" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Duck mascot overlay */}
                                <div className="absolute -bottom-8 -right-8 z-10">
                                    <DuckMascot size={140} />
                                </div>

                                {/* Floating note */}
                                <div className="absolute -top-6 -left-6 z-20">
                                    <DraggableStickyNote color="yellow" rotation={-6} size="sm">
                                        <span className="text-sm">click the duck!</span>
                                        <span className="block text-lg">👆</span>
                                    </DraggableStickyNote>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== FEATURES SECTION ==================== */}
            <section id="features" className="px-6 py-20 md:py-28 bg-[#F5F3E8]" style={{ borderTop: '2px solid #2a2a2a' }}>
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2
                            className="text-3xl md:text-4xl text-[#1a1a1a] mb-4"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                        >
                            Everything you need to
                            <span className="text-[#E85D04]" style={{ fontFamily: 'var(--font-handwritten)' }}> stand out</span>
                        </h2>
                        <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
                            Create something memorable. Not another boring website.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<span className="text-2xl">🖼️</span>}
                            title="Draggable Windows"
                            description="Real desktop-like windows that your visitors can move, resize, and interact with."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<span className="text-2xl">🎨</span>}
                            title="Multiple Themes"
                            description="From sleek dark mode to playful sketch style. Express your personality."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<span className="text-2xl">🦆</span>}
                            title="Fun Easter Eggs"
                            description="Hide surprises for your visitors. Quacking ducks optional but encouraged."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<span className="text-2xl">📱</span>}
                            title="Works Everywhere"
                            description="Desktop or mobile, your portfolio looks amazing on any device."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<span className="text-2xl">⚡</span>}
                            title="Lightning Fast"
                            description="Built with Next.js and optimized for performance. No waiting around."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<span className="text-2xl">🔗</span>}
                            title="Custom Domain"
                            description="Use your own domain or get a beautiful meos.app subdomain."
                            delay={0.5}
                        />
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIALS ==================== */}
            <section className="px-6 py-20 md:py-28 relative overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2
                            className="text-3xl md:text-4xl text-[#1a1a1a] mb-4"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                        >
                            Creatives
                            <span className="text-[#E85D04]" style={{ fontFamily: 'var(--font-handwritten)' }}> love</span> it
                        </h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                        <Testimonial
                            quote="Finally, a portfolio that matches my personality!"
                            author="Sarah K."
                            role="UI Designer"
                            color="yellow"
                            rotation={-4}
                        />
                        <Testimonial
                            quote="My clients can't stop playing with it. 10/10 would recommend."
                            author="Mike T."
                            role="Freelance Developer"
                            color="pink"
                            rotation={3}
                        />
                        <Testimonial
                            quote="The duck sold me. I'm not even joking."
                            author="Alex R."
                            role="Creative Director"
                            color="blue"
                            rotation={-2}
                        />
                    </div>
                </div>
            </section>

            {/* ==================== CTA SECTION ==================== */}
            <section className="px-6 py-20 md:py-28 bg-[#2a2a2a] relative">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2
                            className="text-3xl md:text-5xl text-white mb-6"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                        >
                            Ready to be
                            <span className="text-[#E85D04]" style={{ fontFamily: 'var(--font-handwritten)' }}> unforgettable</span>?
                        </h2>
                        <p
                            className="text-lg text-[#a0a0a0] mb-10 max-w-xl mx-auto"
                            style={{ fontFamily: 'var(--font-body)' }}
                        >
                            Join thousands of creatives who've ditched boring portfolios for something people actually remember.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <motion.span
                                    whileHover={{ y: -3, boxShadow: '6px 6px 0 #E85D04' }}
                                    whileTap={{ y: 1 }}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#E85D04] text-white text-lg font-semibold border-2 border-white cursor-pointer"
                                    style={{ fontFamily: 'var(--font-body)', boxShadow: '4px 4px 0 #E85D04' }}
                                >
                                    Start Free <ArrowRight size={20} />
                                </motion.span>
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>
                            No credit card required. Build something amazing today.
                        </p>
                    </motion.div>
                </div>

                {/* Decorative ducks */}
                <div className="absolute bottom-4 left-8 opacity-20">
                    <span className="text-6xl">🦆</span>
                </div>
                <div className="absolute top-8 right-12 opacity-20">
                    <span className="text-4xl">🦆</span>
                </div>
            </section>

            {/* ==================== FOOTER ==================== */}
            <footer className="px-6 py-8 border-t-2 border-[#2a2a2a] bg-[#FAF8F0]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/assets/sketch/rubber-duck.png"
                            alt="goOS"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                        <span
                            className="text-lg text-[#1a1a1a]"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                        >
                            goOS
                        </span>
                    </div>
                    <p className="text-sm text-[#666]" style={{ fontFamily: 'var(--font-body)' }}>
                        Made with 🦆 by creative people, for creative people.
                    </p>
                    <div className="flex items-center gap-6">
                        {['Privacy', 'Terms', 'Contact'].map(link => (
                            <a
                                key={link}
                                href="#"
                                className="text-sm text-[#666] hover:text-[#E85D04] transition-colors"
                                style={{ fontFamily: 'var(--font-body)' }}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
