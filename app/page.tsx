'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui';

const DEMO_ITEMS = [
  { id: '1', x: 12, y: 20, label: 'Projects', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop' },
  { id: '2', x: 32, y: 55, label: 'About', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '3', x: 58, y: 25, label: 'Photos', thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop' },
  { id: '4', x: 78, y: 60, label: 'Contact', thumbnail: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=200&h=200&fit=crop' },
  { id: '5', x: 88, y: 18, label: 'Blog', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=200&fit=crop' },
];

const DOCK_ITEMS = ['🌐', '📧', '💼', '🎨', '📱'];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0a0a0f]">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Dramatic ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Top-left warm glow */}
        <div
          className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Bottom-right cool glow */}
        <div
          className="absolute -bottom-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Center accent */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, transparent 50%)',
            filter: 'blur(100px)',
          }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header - Mobile-first with hamburger */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div
          className="mx-4 mt-4 md:mx-6 md:mt-6 rounded-2xl px-4 py-3 md:px-6 md:py-4"
          style={{
            background: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <span
                className="text-xl md:text-2xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MeOS
              </span>
            </motion.div>

            {/* Desktop nav */}
            <motion.nav
              className="hidden md:flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link href="/demo">
                <button className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                  Demo
                </button>
              </Link>
              <Link href="/login">
                <button className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    color: '#0a0a0f',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  Get started
                </button>
              </Link>
            </motion.nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M4 8h16" strokeLinecap="round" />
                    <path d="M4 16h16" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden pt-4 pb-2 flex flex-col gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/demo" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  Demo
                </button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  Log in
                </button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <button
                  className="w-full mt-2 px-4 py-3 text-sm font-medium rounded-xl"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    color: '#0a0a0f',
                  }}
                >
                  Get started free
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </header>

      {/* HERO - Asymmetric, dramatic */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center">
        <motion.div
          className="relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-12 md:pt-40 md:pb-20"
          style={{ y: prefersReducedMotion ? 0 : heroParallax, opacity: heroOpacity }}
        >
          <div className="max-w-[1400px] mx-auto">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 md:mb-8"
            >
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium"
                style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  color: '#ff6b35',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Your portfolio, reimagined
              </span>
            </motion.div>

            {/* MASSIVE headline - fluid sizing */}
            <motion.h1
              className="font-bold tracking-tight leading-[0.9] mb-8 md:mb-12"
              style={{
                fontSize: 'clamp(3rem, 12vw, 9rem)',
                color: '#fafafa',
                textWrap: 'balance',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Build your
              <br />
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>web desktop</span>
            </motion.h1>

            {/* Subhead and CTA - asymmetric layout */}
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-16 items-end">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p
                  className="text-lg md:text-xl leading-relaxed mb-8"
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    maxWidth: '480px',
                  }}
                >
                  An explorable desktop experience for creatives.
                  Drag icons, open windows, make it uniquely yours.
                </p>

                {/* CTAs - stacked on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/demo" className="w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                        color: '#0a0a0f',
                        boxShadow: '0 4px 24px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                      }}
                    >
                      View live demo
                    </button>
                  </Link>
                  <Link href="/signup" className="w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-2xl transition-all hover:bg-white/10"
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      Start building →
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Stats - bold numbers */}
              <motion.div
                className="hidden lg:flex items-end justify-end gap-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {[
                  { value: '4', label: 'Themes' },
                  { value: '∞', label: 'Layouts' },
                  { value: '0', label: 'Code needed' },
                ].map((stat, i) => (
                  <div key={i} className="text-right">
                    <div
                      className="text-5xl md:text-6xl font-bold tabular-nums"
                      style={{ color: 'rgba(255,255,255,0.9)' }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-sm uppercase tracking-widest mt-1"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Desktop Preview - the hero moment */}
        <motion.div
          className="relative z-20 px-4 md:px-12 lg:px-20 pb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="max-w-[1200px] mx-auto">
            <div
              className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1a1a2e 0%, #0f172a 50%, #0c1222 100%)',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.08),
                  0 40px 80px -20px rgba(0,0,0,0.8),
                  0 0 120px 20px rgba(56, 189, 248, 0.05)
                `,
              }}
            >
              {/* Window chrome */}
              <div
                className="h-8 md:h-10 flex items-center px-4 md:px-5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-[10px] md:text-xs text-white/40 font-medium">meos.app/your-name</span>
                </div>
                <span className="text-[10px] md:text-xs text-white/30">12:00 PM</span>
              </div>

              {/* Desktop area */}
              <div className="relative h-[calc(100%-3.5rem)] md:h-[calc(100%-4.5rem)]">
                {/* Desktop items */}
                {mounted && DEMO_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="absolute flex flex-col items-center gap-1.5 cursor-pointer"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.15 : 0.4,
                      delay: prefersReducedMotion ? 0 : 0.5 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.1, y: -4 }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <motion.div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden"
                      style={{
                        backgroundImage: `url(${item.thumbnail})`,
                        backgroundSize: 'cover',
                        boxShadow: hoveredItem === item.id
                          ? '0 20px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
                          : '0 8px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                      }}
                    />
                    <span
                      className="text-[10px] md:text-[11px] font-medium px-2 py-0.5 rounded-md"
                      style={{
                        color: 'rgba(255,255,255,0.9)',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(8px)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.div>
                ))}

                {/* Dock */}
                <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2">
                  <motion.div
                    className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3.5 py-2 md:py-2.5 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    {DOCK_ITEMS.map((emoji, index) => (
                      <motion.div
                        key={index}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 100%)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(0,0,0,0.05)',
                        }}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.15, y: -8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Floating interaction hint */}
              <motion.div
                className="absolute bottom-6 md:bottom-8 right-4 md:right-6 hidden sm:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  <span className="text-base">✨</span>
                  Drag anywhere
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
            animate={prefersReducedMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES - Not a card grid */}
      <section className="relative py-24 md:py-40 px-6 md:px-12" aria-labelledby="features-heading">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header - left aligned, not centered */}
          <motion.div
            className="mb-16 md:mb-24 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="features-heading"
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              style={{ color: '#fafafa' }}
            >
              Not another
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>link-in-bio</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
              A full desktop experience. Windows, icons, themes—all draggable,
              all customizable, all yours.
            </p>
          </motion.div>

          {/* Feature items - varied layout, not identical cards */}
          <div className="space-y-16 md:space-y-24">
            {[
              {
                number: '01',
                title: 'Drag. Drop. Done.',
                description: 'Position icons anywhere. No grid constraints. Your layout, your rules.',
                visual: '🖱️',
              },
              {
                number: '02',
                title: 'Windows that tell stories',
                description: 'Click any icon to open a rich detail window. Add images, links, descriptions—everything.',
                visual: '🪟',
              },
              {
                number: '03',
                title: 'Four distinct themes',
                description: 'From playful Monterey to refined Editorial. Each completely transforms the feel.',
                visual: '🎨',
              },
            ].map((feature, index) => (
              <motion.article
                key={index}
                className="grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-12 items-start"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Number */}
                <div
                  className="text-sm font-mono tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  {feature.number}
                </div>

                {/* Content */}
                <div className="max-w-xl">
                  <h3
                    className="text-2xl md:text-3xl font-semibold mb-3"
                    style={{ color: '#fafafa' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-base md:text-lg leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Visual accent */}
                <div
                  className="hidden md:flex w-20 h-20 rounded-2xl items-center justify-center text-4xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {feature.visual}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Full-bleed, dramatic */}
      <section className="relative py-32 md:py-48 px-6" aria-labelledby="cta-heading">
        {/* Background accent */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,107,53,0.03) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-[1400px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              id="cta-heading"
              className="font-bold tracking-tight mb-8"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                color: '#fafafa',
                lineHeight: 1,
              }}
            >
              Your corner of
              <br />
              the internet
            </h2>
            <p
              className="text-lg md:text-xl mb-12 mx-auto"
              style={{
                color: 'rgba(255,255,255,0.4)',
                maxWidth: '480px',
              }}
            >
              Stop blending in. Start building something memorable.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button
                  className="w-full sm:w-auto px-10 py-5 text-lg font-medium rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                    color: '#0a0a0f',
                    boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                  }}
                >
                  Create your desktop
                </button>
              </Link>
              <Link href="/demo">
                <button
                  className="w-full sm:w-auto px-10 py-5 text-lg font-medium rounded-2xl transition-colors hover:bg-white/10"
                  style={{
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  See it in action
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative py-8 px-6 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} MeOS
          </span>
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm transition-colors hover:text-white/60"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm transition-colors hover:text-white/60"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Terms
            </a>
            <a
              href="https://github.com"
              className="text-sm transition-colors hover:text-white/60"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
