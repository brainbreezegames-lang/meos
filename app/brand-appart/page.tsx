"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Home,
    Briefcase,
    Users,
    Mail,
    Globe,
    ArrowRight,
    Star
} from "lucide-react";

export default function BrandAppartPage() {
    return (
        <div className="theme-brand-appart min-h-screen relative pb-32">
            {/* Sidebar */}
            <nav className="brand-sidebar hidden md:flex">
                <div className="brand-sidebar-logo">
                    BA
                </div>

                <div className="brand-sidebar-icon active" data-label="Home">
                    <Home size={24} />
                </div>
                <div className="brand-sidebar-icon" data-label="Work">
                    <Briefcase size={24} />
                </div>
                <div className="brand-sidebar-icon" data-label="Team">
                    <Users size={24} />
                </div>
                <div className="brand-sidebar-icon" data-label="Contact">
                    <Mail size={24} />
                </div>

                <div className="mt-auto flex flex-col items-center gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-center opacity-50">
                        Brand<br />Appart
                    </div>
                    <div className="brand-sidebar-icon" data-label="Language">
                        <span className="font-bold text-sm">FR</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pl-0 md:pl-[80px]">

                {/* Hero Section */}
                <section className="brand-hero">
                    <h1 className="brand-hero-watermark">
                        big<br />results
                    </h1>

                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="hero-headline mb-0">
                            Small team,
                        </h2>
                        <h2 className="hero-headline text-[rgba(23,20,18,0.15)] mt-[-0.2em]">
                            big results
                        </h2>
                    </div>

                    {/* Scattered Team Photos */}
                    {/* Note: In a real app, these would be proper Image components */}
                    <div
                        className="brand-team-photo"
                        style={{
                            top: "20%",
                            left: "15%",
                            "--rotation": "-12deg"
                        } as any}
                    >
                        <div className="w-full h-full bg-gradient-to-b from-[#ff9966] to-[#ff5e62]" />
                    </div>

                    <div
                        className="brand-team-photo"
                        style={{
                            top: "15%",
                            right: "18%",
                            "--rotation": "8deg"
                        } as any}
                    >
                        <div className="w-full h-full bg-gradient-to-b from-[#4facfe] to-[#00f2fe]" />
                    </div>

                    <div
                        className="brand-team-photo"
                        style={{
                            bottom: "25%",
                            left: "25%",
                            "--rotation": "5deg"
                        } as any}
                    >
                        <div className="w-full h-full bg-gradient-to-b from-[#f093fb] to-[#f5576c]" />
                    </div>

                    <div className="brand-hero-location">
                        Paris, France 12:30 PM
                    </div>
                </section>

                {/* Featured Work Section */}
                <section className="brand-container py-24">
                    <div className="brand-section-heading">
                        <span className="brand-section-heading-main">Featured</span>
                        <span className="brand-section-heading-sub">work</span>
                        <div className="flex justify-center mt-8">
                            <ArrowRight className="animate-bounce" size={32} color="var(--brand-base)" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Project Card 1 */}
                        <div className="brand-project-card group cursor-pointer">
                            <div className="brand-project-card-header">
                                <div>
                                    <div className="brand-project-card-name">B2B SaaS Platform</div>
                                    <div className="brand-project-card-meta">2024 Strategy & Design</div>
                                </div>
                                <a href="#" className="brand-project-card-cta flex items-center gap-2">
                                    View Case <ArrowRight size={14} />
                                </a>
                            </div>
                            {/* Placeholder for project image */}
                            <div className="brand-project-image w-full h-full bg-gray-200 group-hover:bg-gray-300 transition-colors">
                                <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-white/10 text-9xl font-bold">
                                    01
                                </div>
                            </div>
                            <div className="brand-project-logo">
                                We Are.™
                            </div>
                        </div>

                        {/* Project Card 2 */}
                        <div className="brand-project-card mt-0 md:mt-24 group cursor-pointer">
                            <div className="brand-project-card-header">
                                <div>
                                    <div className="brand-project-card-name">Fintech App</div>
                                    <div className="brand-project-card-meta">2023 Rebranding</div>
                                </div>
                                <a href="#" className="brand-project-card-cta flex items-center gap-2">
                                    View Case <ArrowRight size={14} />
                                </a>
                            </div>
                            {/* Placeholder for project image */}
                            <div className="brand-project-image w-full h-full bg-gray-200 group-hover:bg-gray-300 transition-colors">
                                <div className="w-full h-full flex items-center justify-center bg-[#3D2FA9] text-white/10 text-9xl font-bold">
                                    02
                                </div>
                            </div>
                            <div className="brand-project-logo">
                                Vault
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="brand-container py-24">
                    <div className="brand-section-heading">
                        <span className="brand-section-heading-main">Client</span>
                        <span className="brand-section-heading-sub">love</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="brand-testimonial-card">
                            <div className="brand-testimonial-stars">
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                            </div>
                            <p className="brand-testimonial-quote">
                                "They completely transformed how we show up in the market. Bold, confident, and exactly what we needed."
                            </p>
                            <div className="brand-testimonial-cta">
                                Sarah J. <span className="opacity-50">— CMO @ TechFlow</span>
                            </div>
                        </div>

                        <div className="brand-testimonial-card" style={{ marginTop: "40px" }}>
                            <div className="brand-testimonial-stars">
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                            </div>
                            <p className="brand-testimonial-quote">
                                "Unlike any agency we've worked with. Fast, efficient, and the design quality is simply unmatched."
                            </p>
                            <div className="brand-testimonial-cta">
                                Mark R. <span className="opacity-50">— Founder @ Base</span>
                            </div>
                        </div>

                        <div className="brand-testimonial-card" style={{ marginTop: "80px" }}>
                            <div className="brand-testimonial-stars">
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                                <Star fill="currentColor" size={16} />
                            </div>
                            <p className="brand-testimonial-quote">
                                "The new branding helped us close our Series B. Investors immediately understood our premium positioning."
                            </p>
                            <div className="brand-testimonial-cta">
                                Elena T. <span className="opacity-50">— CEO @ Flux</span>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Floating CTA */}
            <div className="brand-floating-cta">
                <div className="brand-floating-cta-text">
                    Ready to transform your brand?
                </div>
                <button className="brand-floating-cta-button">
                    Book a Call <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
