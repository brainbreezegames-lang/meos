'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// Demo data
const DEMO_ITEMS = [
  { id: '1', x: 12, y: 20, label: 'Projects', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop' },
  { id: '2', x: 32, y: 55, label: 'About', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '3', x: 58, y: 25, label: 'Photos', thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop' },
  { id: '4', x: 78, y: 60, label: 'Contact', thumbnail: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=200&h=200&fit=crop' },
  { id: '5', x: 88, y: 18, label: 'Blog', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=200&fit=crop' },
];

const DOCK_ITEMS = ['🌐', '📧', '💼', '🎨', '📱'];

const FEATURES = [
  { icon: '📄', title: 'Rich Case Studies', app: 'Pages', description: 'Full documents with process, insights, and outcomes. Tell the story behind your work.' },
  { icon: '🖼️', title: 'Beautiful Galleries', app: 'Photos', description: 'Masonry grids, albums, and lightbox viewing. Your visual work, beautifully displayed.' },
  { icon: '👤', title: 'Professional Contact', app: 'Contacts', description: 'Email, calendar, social links, availability status. Make it easy to reach you.' },
  { icon: '📝', title: 'Long-form Writing', app: 'Notes', description: 'Blog posts, essays, and ideas with markdown support. Share your thoughts.' },
  { icon: '📁', title: 'File Downloads', app: 'Finder', description: 'Resume, assets, resources — organized and downloadable. Everything in one place.' },
  { icon: '📊', title: 'Know Your Visitors', app: 'Analytics', description: 'See who visits, what they view, where they are from. Understand your audience.' },
];

const TESTIMONIALS = [
  {
    text: "I got 3 interview requests in the first week after launching my MeOS portfolio. Recruiters actually mention how unique it looks.",
    name: "Sarah Kim",
    title: "Product Designer at Google",
    isRight: true,
  },
  {
    text: "Finally something that doesn't look like every other Squarespace site. My clients always comment on it.",
    name: "Marcus Chen",
    title: "Freelance Brand Designer",
    isRight: false,
  },
  {
    text: "The case study format is perfect for showing process. Way better than cramming everything into a scroll.",
    name: "Yuki Tanaka",
    title: "UX Lead at Spotify",
    isRight: true,
  },
];

const FAQS = [
  {
    question: "Do I need to know how to code?",
    answer: "No. MeOS is entirely visual. Drag, drop, click, done. If you can use a Mac, you can use MeOS."
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes, on the Pro plan. Free users get a yourname.meos.app subdomain."
  },
  {
    question: "How does it look on mobile?",
    answer: "MeOS automatically transforms into an iOS-style interface on mobile. Same content, native feel."
  },
  {
    question: "Can recruiters actually use this?",
    answer: "Yes. We've tested with 50+ recruiters. The desktop metaphor is familiar — they know how to click icons and open windows."
  },
  {
    question: "What if I want to switch away from MeOS?",
    answer: "Export your content anytime. No lock-in. Your work is yours."
  },
  {
    question: "Is my portfolio SEO-friendly?",
    answer: "Yes. Despite the desktop interface, all content is fully indexable by search engines."
  },
];

const SHOWCASE_PORTFOLIOS = [
  { name: 'Sarah K.', title: 'Product Designer', gradient: 'from-violet-600 to-indigo-600' },
  { name: 'Marcus T.', title: 'Brand Designer', gradient: 'from-rose-600 to-pink-600' },
  { name: 'Yuki M.', title: 'UX Design', gradient: 'from-cyan-600 to-blue-600' },
  { name: 'Alex R.', title: 'Creative Director', gradient: 'from-amber-600 to-orange-600' },
  { name: 'Jordan L.', title: 'Illustrator', gradient: 'from-emerald-600 to-teal-600' },
];

const NAV_SECTIONS = [
  { id: 'hero', icon: '🏠', label: 'Home' },
  { id: 'features', icon: '✨', label: 'Features' },
  { id: 'showcase', icon: '📸', label: 'Examples' },
  { id: 'pricing', icon: '💰', label: 'Pricing' },
  { id: 'faq', icon: '❓', label: 'FAQ' },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
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

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_SECTIONS.map(s => document.getElementById(s.id));
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(NAV_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex(i => (i + 1) % SHOWCASE_PORTFOLIOS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

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
        <div
          className="absolute -top-[40%] -left-[20%] w-[80vw] h-[80vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
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

      {/* ============================================
          MENU BAR (Fixed Top)
          ============================================ */}
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
                className="text-xl md:text-2xl font-bold tracking-tight cursor-pointer"
                onClick={() => scrollToSection('hero')}
                style={{
                  background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MeOS
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link href="/signup">
                <button
                  className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    color: '#0a0a0f',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  Get Started Free
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex flex-col justify-center">
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

            {/* Headline */}
            <motion.h1
              className="font-bold tracking-tight leading-[0.9] mb-8 md:mb-12"
              style={{
                fontSize: 'clamp(2.5rem, 10vw, 7rem)',
                color: '#fafafa',
                textWrap: 'balance',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your portfolio.
              <br />
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Your operating system.</span>
            </motion.h1>

            {/* Subhead and CTA */}
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
                  The portfolio platform that feels like home. Create a stunning desktop-style experience in minutes. No code required.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                        color: '#0a0a0f',
                        boxShadow: '0 4px 24px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                      }}
                    >
                      Create Your Desktop — Free
                    </button>
                  </Link>
                  <Link href="/demo" className="w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-2xl transition-all hover:bg-white/10"
                      style={{
                        background: 'transparent',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      See Examples
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Stats */}
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

        {/* Interactive Desktop Preview */}
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

              {/* Interaction hint */}
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
                  Try it — click around
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
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

      {/* ============================================
          SOCIAL PROOF BAR
          ============================================ */}
      <section className="relative py-16 md:py-20 px-6" aria-labelledby="social-proof-heading">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            {/* Metrics */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-10">
              {[
                { icon: '🎨', value: '2,400+', label: 'designers' },
                { icon: '⭐', value: '4.9', label: 'rating' },
                { icon: '🌍', value: '120', label: 'countries' },
              ].map((metric, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-white/90 font-semibold">{metric.value}</span>
                  <span className="text-white/40">{metric.label}</span>
                </div>
              ))}
            </div>

            {/* Company logos */}
            <p className="text-white/30 text-sm mb-6" id="social-proof-heading">Used by designers at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-40">
              {['Google', 'Stripe', 'Figma', 'Airbnb', 'Netflix', 'Spotify'].map((company, i) => (
                <span
                  key={i}
                  className="text-white/60 font-semibold text-lg md:text-xl tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PROBLEM → SOLUTION
          ============================================ */}
      <section className="relative py-24 md:py-32 px-6" aria-labelledby="problem-solution-heading">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Window container */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              {/* Window header */}
              <div
                className="h-12 flex items-center px-5"
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
                <h2 id="problem-solution-heading" className="flex-1 text-center text-sm text-white/60 font-medium">
                  About Your Portfolio
                </h2>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                {/* Problem */}
                <div className="p-8 md:p-10">
                  <div className="text-red-400/80 text-xs font-semibold uppercase tracking-widest mb-4">The Problem</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Your portfolio looks like everyone else's.
                  </h3>
                  <ul className="space-y-3 text-white/50">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400/60 mt-1">✕</span>
                      Template sites blend together
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400/60 mt-1">✕</span>
                      Recruiters scroll past in seconds
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400/60 mt-1">✕</span>
                      You're competing with 10,000 identical Webflow sites
                    </li>
                  </ul>
                </div>

                {/* Solution */}
                <div className="p-8 md:p-10">
                  <div className="text-green-400/80 text-xs font-semibold uppercase tracking-widest mb-4">The Solution</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    MeOS gives you a complete operating system.
                  </h3>
                  <ul className="space-y-3 text-white/50">
                    <li className="flex items-start gap-3">
                      <span className="text-green-400/60 mt-1">✓</span>
                      Your work lives in windows
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400/60 mt-1">✓</span>
                      Visitors explore, not scroll
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-400/60 mt-1">✓</span>
                      First impression that lasts
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section id="features" className="relative py-24 md:py-40 px-6" aria-labelledby="features-heading">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <motion.div
            className="mb-16 md:mb-24 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="features-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              style={{ color: '#fafafa' }}
            >
              Everything you need.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Nothing you don't.</span>
            </h2>
          </motion.div>

          {/* Feature windows grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.article
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="h-full rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Window header */}
                  <div
                    className="h-10 flex items-center px-4"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28ca41]/80" />
                    </div>
                    <span className="flex-1 text-center text-xs text-white/40">{feature.app}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* See all features link */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
            >
              See all features
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="relative py-24 md:py-32 px-6" aria-labelledby="how-it-works-heading">
        <div className="max-w-[1000px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="how-it-works-heading"
              className="text-4xl md:text-5xl font-bold text-white mb-16"
            >
              Ready in minutes.
            </h2>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-16">
            {[
              { step: '1', icon: '👤', title: 'Create Account', description: 'Sign up with Google or email. 30 seconds.' },
              { step: '2', icon: '🎨', title: 'Add Your Work', description: 'Drop in projects, write case studies, arrange your desktop.' },
              { step: '3', icon: '🚀', title: 'Go Live', description: "Share your link. You're done. Get discovered." },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Step number */}
                <div className="text-6xl font-bold text-white/10 mb-4">{item.step}</div>
                {/* Icon */}
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Time indicator */}
          <motion.p
            className="text-white/30 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Average setup time: <span className="text-white/60">15 minutes</span>
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/signup">
              <button
                className="px-8 py-4 text-base font-medium rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                  color: '#0a0a0f',
                  boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                }}
              >
                Start Building — Free
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SHOWCASE
          ============================================ */}
      <section id="showcase" className="relative py-24 md:py-32 px-6 overflow-hidden" aria-labelledby="showcase-heading">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="showcase-heading"
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Portfolios that get noticed.
            </h2>
            <p className="text-white/40">See how designers around the world use MeOS.</p>
          </motion.div>

          {/* Carousel */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {SHOWCASE_PORTFOLIOS.map((portfolio, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-[300px] md:w-[400px] snap-center"
                  animate={{
                    scale: index === showcaseIndex ? 1 : 0.95,
                    opacity: index === showcaseIndex ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Desktop preview */}
                  <div
                    className="aspect-[16/10] rounded-xl mb-4 overflow-hidden"
                    style={{
                      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${portfolio.gradient} flex items-center justify-center`}>
                      <div className="w-3/4 h-3/4 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                        <span className="text-white/60 text-sm">Portfolio Preview</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">{portfolio.name}</p>
                    <p className="text-white/40 text-sm">{portfolio.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-2 mt-8">
              {SHOWCASE_PORTFOLIOS.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === showcaseIndex ? 'bg-white w-6' : 'bg-white/30'
                  }`}
                  onClick={() => setShowcaseIndex(index)}
                  aria-label={`Go to portfolio ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
            >
              Explore All Examples
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section className="relative py-24 md:py-32 px-6" aria-labelledby="testimonials-heading">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="testimonials-heading"
              className="text-4xl md:text-5xl font-bold text-white"
            >
              What designers are saying.
            </h2>
          </motion.div>

          {/* Messages window */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              {/* Window header */}
              <div
                className="h-12 flex items-center px-5"
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
                <span className="flex-1 text-center text-sm text-white/60 font-medium">Messages</span>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-8">
                {TESTIMONIALS.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    className={`flex flex-col ${testimonial.isRight ? 'items-end' : 'items-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        testimonial.isRight
                          ? 'rounded-br-md bg-blue-500/20'
                          : 'rounded-bl-md bg-white/5'
                      }`}
                    >
                      <p className="text-white/80 text-sm leading-relaxed">{testimonial.text}</p>
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      {testimonial.name} • {testimonial.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          PRICING
          ============================================ */}
      <section id="pricing" className="relative py-24 md:py-32 px-6" aria-labelledby="pricing-heading">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="pricing-heading"
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Simple, transparent pricing.
            </h2>
            <p className="text-white/40">Start free. Upgrade when you're ready.</p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free tier */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="h-full rounded-2xl p-8"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <div className="text-5xl font-bold text-white">$0</div>
                  <p className="text-white/40 mt-1">forever</p>
                </div>

                <div className="border-t border-white/10 pt-8 mb-8">
                  <ul className="space-y-4">
                    {[
                      'Custom desktop',
                      '5 projects',
                      'Basic templates',
                      'MeOS subdomain',
                      'Mobile version',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/60">
                        <svg className="w-5 h-5 text-green-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/signup" className="block">
                  <button
                    className="w-full py-4 rounded-xl font-medium transition-all hover:bg-white/10"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Pro tier */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div
                className="h-full rounded-2xl p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Popular badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                      color: '#0a0a0f',
                    }}
                  >
                    Popular
                  </span>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="text-5xl font-bold text-white">$12</div>
                  <p className="text-white/40 mt-1">per month or $99/year</p>
                </div>

                <div className="border-t border-white/10 pt-8 mb-8">
                  <ul className="space-y-4">
                    {[
                      'Everything in Free',
                      'Unlimited projects',
                      'Custom domain',
                      'Analytics dashboard',
                      'Remove branding',
                      'Priority support',
                      'Early features',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/60">
                        <svg className="w-5 h-5 text-green-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/signup" className="block">
                  <button
                    className="w-full py-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                      color: '#0a0a0f',
                      boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                    }}
                  >
                    Go Pro
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Trust line */}
          <motion.p
            className="text-center text-white/30 text-sm mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Questions? See FAQ below or contact us.
          </motion.p>
        </div>
      </section>

      {/* ============================================
          FAQ
          ============================================ */}
      <section id="faq" className="relative py-24 md:py-32 px-6" aria-labelledby="faq-heading">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <h2
              id="faq-heading"
              className="text-4xl md:text-5xl font-bold text-white"
            >
              Frequently Asked
            </h2>
          </motion.div>

          {/* FAQ window */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              {/* Window header */}
              <div
                className="h-12 flex items-center px-5"
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
                <span className="flex-1 text-center text-sm text-white/60 font-medium">Help</span>
              </div>

              {/* FAQ items */}
              <div className="divide-y divide-white/5">
                {FAQS.map((faq, index) => (
                  <div key={index}>
                    <button
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      aria-expanded={expandedFaq === index}
                    >
                      <span className="text-white/80 font-medium flex items-center gap-3">
                        <span className="text-white/30">▶</span>
                        {faq.question}
                      </span>
                      <motion.span
                        className="text-white/30"
                        animate={{ rotate: expandedFaq === index ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ›
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pl-12 text-white/50 text-sm leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.p
            className="text-center text-white/30 text-sm mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Still have questions?{' '}
            <a href="mailto:hello@meos.app" className="text-white/50 hover:text-white/80 transition-colors">
              hello@meos.app
            </a>
          </motion.p>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="relative py-32 md:py-48 px-6" aria-labelledby="final-cta-heading">
        {/* Background accent */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,107,53,0.03) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-[600px] mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Dialog-style container */}
            <div
              className="rounded-3xl p-10 md:p-14"
              style={{
                background: 'rgba(255,255,255,0.03)',
                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              <div className="text-6xl mb-6">🖥️</div>
              <h2
                id="final-cta-heading"
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Ready to stand out?
              </h2>
              <p className="text-white/40 mb-8">
                Join 2,400+ designers who've already created their MeOS portfolio.
              </p>
              <Link href="/signup">
                <button
                  className="px-10 py-5 text-lg font-medium rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
                    color: '#0a0a0f',
                    boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                  }}
                >
                  Create Your Desktop — Free
                </button>
              </Link>
              <p className="text-white/30 text-sm mt-6">
                No credit card required.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
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

      {/* ============================================
          FIXED DOCK (Bottom Navigation)
          ============================================ */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2"
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '8px 12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
        aria-label="Page navigation"
      >
        {NAV_SECTIONS.map((section) => (
          <motion.button
            key={section.id}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${
              activeSection === section.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
            onClick={() => scrollToSection(section.id)}
            whileHover={prefersReducedMotion ? {} : { scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label={section.label}
            aria-current={activeSection === section.id ? 'true' : undefined}
          >
            {section.icon}
            {activeSection === section.id && (
              <motion.div
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-white"
                layoutId="activeDot"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* CTA */}
        <Link href="/signup">
          <motion.button
            className="px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
              color: '#0a0a0f',
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </Link>
      </nav>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-40" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.95) 40%)',
      }}>
        <Link href="/signup" className="block">
          <button
            className="w-full py-4 rounded-xl font-medium"
            style={{
              background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)',
              color: '#0a0a0f',
              boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
            }}
          >
            Create Your Desktop — Free
          </button>
        </Link>
      </div>

      {/* Extra padding for mobile CTA */}
      <div className="h-24 md:h-0" />
    </div>
  );
}
