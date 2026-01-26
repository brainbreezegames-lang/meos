"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
    Home,
    Briefcase,
    Users,
    Mail,
    ArrowRight,
    Star
} from "lucide-react";

const ANIMATION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // Expo out for premium feel

import { FallingLetters } from "@/components/desktop/FallingLetters";

export default function BrandAppartPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={containerRef} className="theme-brand-appart min-h-screen relative pb-32 selection:bg-[var(--brand-orange)] selection:text-white">
            {/* Sidebar */}
            <nav className="brand-sidebar hidden md:flex fixed">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, ease: ANIMATION_EASE, delay: 0.2 }}
                    className="brand-sidebar-logo"
                >
                    BA
                </motion.div>

                <div className="flex flex-col gap-4">
                    {['Home', 'Work', 'Team', 'Contact'].map((item, i) => (
                        <motion.div
                            key={item}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, ease: ANIMATION_EASE, delay: 0.4 + (i * 0.1) }}
                            className={`brand-sidebar-icon ${i === 0 ? 'active' : ''}`}
                            data-label={item}
                        >
                            {item === 'Home' && <Home size={24} />}
                            {item === 'Work' && <Briefcase size={24} />}
                            {item === 'Team' && <Users size={24} />}
                            {item === 'Contact' && <Mail size={24} />}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-auto flex flex-col items-center gap-4"
                >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-center opacity-50 font-headline">
                        Brand<br />Appart
                    </div>
                    <div className="brand-sidebar-icon" data-label="Language">
                        <span className="font-bold text-sm">FR</span>
                    </div>
                </motion.div>
            </nav>

            {/* Main Content */}
            <main className="pl-0 md:pl-[80px]">

                {/* Hero Section */}
                <section className="brand-hero overflow-hidden">
                    <motion.h1
                        style={{ y: heroY, opacity: heroOpacity }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: ANIMATION_EASE }}
                        className="brand-hero-watermark"
                    >
                        big<br />results
                    </motion.h1>

                    {/* Falling Physics Text */}
                    <div className="absolute inset-0 z-0 flex justify-center pointer-events-none">
                        <div className="w-full h-full max-w-[1400px] pointer-events-auto">
                            <FallingLetters
                                text="HELLO"
                                textSize={800}
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="overflow-hidden">
                            <motion.h2
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: ANIMATION_EASE, delay: 0.2 }}
                                className="hero-headline mb-0 block"
                            >
                                Small team,
                            </motion.h2>
                        </div>
                        <div className="overflow-hidden mt-[-0.2em]">
                            <motion.h2
                                initial={{ y: "150%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: ANIMATION_EASE, delay: 0.3 }}
                                className="hero-headline text-[rgba(23,20,18,0.15)] block"
                            >
                                big results
                            </motion.h2>
                        </div>
                    </div>

                    {/* Draggable scattered cards */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <TeamPhoto
                            color="from-[#ff9966] to-[#ff5e62]"
                            x="15%" y="20%" rotate="-12"
                            delay={0.6}
                        />
                        <TeamPhoto
                            color="from-[#3d2fa9] to-[#00f2fe]"
                            x="65%" y="15%" rotate="8"
                            delay={0.7}
                        />
                        <TeamPhoto
                            color="from-[#ffc765] to-[#f5576c]"
                            x="25%" y="65%" rotate="5"
                            delay={0.8}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="brand-hero-location"
                    >
                        Paris, France 12:30 PM
                    </motion.div>
                </section>

                {/* Featured Work Section */}
                <section className="brand-container py-24">
                    <div className="brand-section-heading">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="brand-section-heading-main"
                        >
                            Featured
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="brand-section-heading-sub"
                        >
                            work
                        </motion.span>
                        <div className="flex justify-center mt-8">
                            <ArrowRight className="animate-bounce" size={32} color="var(--brand-base)" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ProjectCard
                            title="B2B SaaS Platform"
                            category="2024 Strategy & Design"
                            number="01"
                            bgColor="bg-[#1a1a1a]"
                            logo="We Are.™"
                            delay={0}
                        />
                        <ProjectCard
                            title="Fintech App"
                            category="2023 Rebranding"
                            number="02"
                            bgColor="bg-[var(--brand-purple)]"
                            logo="Vault"
                            className="md:mt-24"
                            delay={0.2}
                        />
                    </div>
                </section>

                {/* Testimonials */}
                <section className="brand-container py-24">
                    <div className="brand-section-heading">
                        <span className="brand-section-heading-main">Client</span>
                        <span className="brand-section-heading-sub">love</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TestimonialCard
                            quote="They completely transformed how we show up in the market. Bold, confident, and exactly what we needed."
                            name="Sarah J."
                            role="CMO @ TechFlow"
                            delay={0}
                        />
                        <TestimonialCard
                            quote="Unlike any agency we've worked with. Fast, efficient, and the design quality is simply unmatched."
                            name="Mark R."
                            role="Founder @ Base"
                            marginTop="40px"
                            delay={0.1}
                        />
                        <TestimonialCard
                            quote="The new branding helped us close our Series B. Investors immediately understood our premium positioning."
                            name="Elena T."
                            role="CEO @ Flux"
                            marginTop="80px"
                            delay={0.2}
                        />
                    </div>
                </section>

            </main>

            {/* Floating CTA */}
            <motion.div
                initial={{ y: 100, x: "-50%" }}
                animate={{ y: 0, x: "-50%" }}
                transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
                className="brand-floating-cta glass-panel"
            >
                <div className="brand-floating-cta-text hidden sm:block">
                    Ready to transform your brand?
                </div>
                <button className="brand-floating-cta-button hover:bg-[var(--brand-orange)] transition-colors">
                    Book a Call <ArrowRight size={16} />
                </button>
            </motion.div>
        </div>
    );
}

function TeamPhoto({ color, x, y, rotate, delay }: { color: string, x: string, y: string, rotate: string, delay: number }) {
    return (
        <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            initial={{ scale: 0, rotate: 0, opacity: 0 }}
            animate={{ scale: 1, rotate: parseInt(rotate), opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 0, cursor: "grab", zIndex: 50 }}
            whileDrag={{ scale: 1.2, cursor: "grabbing", zIndex: 100 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay
            }}
            className="brand-team-photo absolute pointer-events-auto"
            style={{
                left: x,
                top: y,
            }}
        >
            <div className={`w-full h-full bg-gradient-to-b ${color}`} />
            {/* Placeholder for actual image */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        </motion.div>
    )
}

function ProjectCard({ title, category, number, bgColor, logo, className = "", delay = 0 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay }}
            className={`brand-project-card group cursor-pointer ${className}`}
        >
            <div className="brand-project-card-header">
                <div>
                    <div className="brand-project-card-name">{title}</div>
                    <div className="brand-project-card-meta">{category}</div>
                </div>
                <div className="brand-project-card-cta flex items-center gap-2 group-hover:bg-[var(--brand-orange)] transition-colors">
                    View Case <ArrowRight size={14} />
                </div>
            </div>
            <div className={`brand-project-image w-full h-full ${bgColor} transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110`}>
                <div className="w-full h-full flex items-center justify-center text-white/10 text-9xl font-bold font-headline select-none">
                    {number}
                </div>
            </div>
            <div className="brand-project-logo">
                {logo}
            </div>
        </motion.div>
    )
}

function TestimonialCard({ quote, name, role, marginTop = "0px", delay = 0 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="brand-testimonial-card hover:-translate-y-2 transition-transform duration-300"
            style={{ marginTop }}
        >
            <div className="brand-testimonial-stars">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" size={16} />)}
            </div>
            <p className="brand-testimonial-quote">
                "{quote}"
            </p>
            <div className="brand-testimonial-cta">
                {name} <span className="opacity-50">— {role}</span>
            </div>
        </motion.div>
    )
}
