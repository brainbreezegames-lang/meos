'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// =============================================================================
// TYPES
// =============================================================================

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface DragState {
  isDragging: boolean;
  windowId: string | null;
  startPos: { x: number; y: number };
  startWindowPos: { x: number; y: number };
}

// =============================================================================
// DESIGN SYSTEM - Warm Editorial Luxury
// =============================================================================

const COLORS = {
  // Warm cream/paper backgrounds
  bg: {
    primary: '#FAF7F2',
    secondary: '#F5F0E8',
    tertiary: '#EDE6DB',
    warm: '#F8F4ED',
  },
  // Rich, warm text colors (never pure black)
  text: {
    primary: '#2D2A26',
    secondary: '#5C564D',
    tertiary: '#8A8279',
    muted: '#B5AFA5',
  },
  // Accent - warm terracotta/rust
  accent: {
    primary: '#C4634F',
    hover: '#B85A47',
    light: '#E8D4CF',
  },
  // Window chrome
  window: {
    bg: '#FFFDF9',
    header: '#FAF7F2',
    border: '#E8E2D9',
  },
  // Traffic lights
  traffic: {
    close: '#E25D4E',
    minimize: '#E6B035',
    maximize: '#5BBF4A',
  }
};

// =============================================================================
// DATA
// =============================================================================

const FEATURES_DATA = [
  { icon: '✎', title: 'Case Studies', description: 'Rich documents with process, insights, and outcomes. Section navigation, insight cards, metrics displays.', tag: 'Content' },
  { icon: '◐', title: 'Photo Gallery', description: 'Masonry grids, albums, and lightbox viewing. EXIF data support for photographers.', tag: 'Media' },
  { icon: '¶', title: 'Notes', description: 'Long-form writing with markdown support. Blog posts, essays, and ideas organized in folders.', tag: 'Content' },
  { icon: '◉', title: 'Contact Card', description: 'Email, calendar booking, social links, and availability status. Make it easy to reach you.', tag: 'Connect' },
  { icon: '⬡', title: 'Downloads', description: 'Resume, assets, and resources organized and downloadable. Everything in one place.', tag: 'Files' },
  { icon: '◷', title: 'Analytics', description: 'See who visits, what they view, where they are from. Understand your audience.', tag: 'Insights' },
  { icon: '◈', title: 'Themes', description: 'Four distinct themes: Monterey, Dark, Bluren, Refined. Each transforms the entire feel.', tag: 'Style' },
  { icon: '▣', title: 'Mobile', description: 'Automatic iOS-style interface on mobile. Same content, native feel.', tag: 'Platform' },
  { icon: '⬢', title: 'Custom URL', description: 'Use your own domain on Pro. Free users get yourname.meos.app subdomain.', tag: 'Pro' },
];

const TESTIMONIALS_DATA = [
  { text: "Got 3 interview requests in the first week. Recruiters always mention how unique my portfolio looks.", name: "Sarah Kim", role: "Product Designer", place: "San Francisco" },
  { text: "Finally something that doesn&apos;t look like every other portfolio. My clients always comment on it.", name: "Marcus Chen", role: "Brand Designer", place: "New York" },
  { text: "The case study format is perfect for showing process. So much better than cramming everything into one scroll.", name: "Yuki Tanaka", role: "UX Lead", place: "Tokyo" },
];

const EXAMPLES_DATA = [
  { name: 'Sarah K.', role: 'Product', initial: 'S' },
  { name: 'Marcus C.', role: 'Brand', initial: 'M' },
  { name: 'Yuki T.', role: 'UX', initial: 'Y' },
  { name: 'Alex R.', role: 'Illustration', initial: 'A' },
  { name: 'Priya P.', role: 'Motion', initial: 'P' },
  { name: 'Tom A.', role: 'Photo', initial: 'T' },
];

const FAQ_DATA = [
  { q: "Do I need to know how to code?", a: "No. MeOS is entirely visual. Drag, drop, click, done." },
  { q: "How does it look on mobile?", a: "MeOS transforms into an iOS-style interface. Same content, native feel." },
  { q: "Can I use my own domain?", a: "Yes, on Pro. Free users get yourname.meos.app" },
  { q: "Will recruiters understand it?", a: "Yes. We tested with 50+ recruiters. The desktop metaphor is familiar." },
  { q: "What if I want to leave?", a: "Export your content anytime. No lock-in." },
];

const INITIAL_WINDOWS: WindowState[] = [
  { id: 'welcome', title: 'Welcome', isOpen: true, isMinimized: false, zIndex: 100, position: { x: 80, y: 60 }, size: { width: 400, height: 500 } },
  { id: 'features', title: 'Features', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 160, y: 80 }, size: { width: 560, height: 480 } },
  { id: 'examples', title: 'Examples', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 100 }, size: { width: 580, height: 420 } },
  { id: 'pricing', title: 'Pricing', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 140, y: 90 }, size: { width: 500, height: 500 } },
  { id: 'reviews', title: 'Reviews', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 220, y: 70 }, size: { width: 440, height: 460 } },
  { id: 'help', title: 'FAQ', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 180, y: 110 }, size: { width: 460, height: 420 } },
  { id: 'howItWorks', title: 'How It Works', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 240, y: 80 }, size: { width: 420, height: 380 } },
  { id: 'mobile', title: 'Mobile', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 300, y: 60 }, size: { width: 360, height: 500 } },
];

const DESKTOP_ICONS = [
  { id: 'features', label: 'Features', symbol: '✦' },
  { id: 'howItWorks', label: 'How It Works', symbol: '→' },
  { id: 'mobile', label: 'Mobile', symbol: '◻' },
  { id: 'examples', label: 'Examples', symbol: '◈' },
  { id: 'pricing', label: 'Pricing', symbol: '◇' },
  { id: 'reviews', label: 'Reviews', symbol: '❝' },
  { id: 'help', label: 'FAQ', symbol: '?' },
];

const DOCK_APPS = [
  { id: 'welcome', label: 'Welcome', symbol: '⌂' },
  { id: 'features', label: 'Features', symbol: '✦' },
  { id: 'examples', label: 'Examples', symbol: '◈' },
  { id: 'pricing', label: 'Pricing', symbol: '◇' },
  { id: 'reviews', label: 'Reviews', symbol: '❝' },
  { id: 'help', label: 'FAQ', symbol: '?' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [highestZ, setHighestZ] = useState(100);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, windowId: null, startPos: { x: 0, y: 0 }, startWindowPos: { x: 0, y: 0 } });
  const [currentTime, setCurrentTime] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [howItWorksStep, setHowItWorksStep] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [hoveredDock, setHoveredDock] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      setCurrentTime(`${date}  ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hintDismissed) return;
    const timer = setTimeout(() => {
      const openCount = windows.filter(w => w.isOpen && w.id !== 'welcome').length;
      if (openCount === 0) setShowHint(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [windows, hintDismissed]);

  const openWindow = useCallback((id: string) => {
    setShowHint(false);
    setHintDismissed(true);
    setHighestZ(prev => prev + 1);
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: highestZ + 1 } : w
    ));
  }, [highestZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setHighestZ(prev => prev + 1);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: highestZ + 1 } : w));
  }, [highestZ]);

  const handleMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    focusWindow(windowId);
    setDragState({
      isDragging: true,
      windowId,
      startPos: { x: e.clientX, y: e.clientY },
      startWindowPos: { x: win.position.x, y: win.position.y }
    });
  }, [windows, focusWindow]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.windowId) return;
    const dx = e.clientX - dragState.startPos.x;
    const dy = e.clientY - dragState.startPos.y;
    setWindows(prev => prev.map(w =>
      w.id === dragState.windowId
        ? { ...w, position: { x: Math.max(0, dragState.startWindowPos.x + dx), y: Math.max(28, dragState.startWindowPos.y + dy) } }
        : w
    ));
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, windowId: null, startPos: { x: 0, y: 0 }, startWindowPos: { x: 0, y: 0 } });
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // =============================================================================
  // WINDOW CONTENT
  // =============================================================================

  const renderWelcomeContent = () => (
    <div className="flex flex-col h-full p-10">
      <div className="flex-1">
        {/* Wordmark */}
        <div className="mb-10">
          <h1 className="text-5xl tracking-tight" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400 }}>
            Me<span style={{ color: COLORS.accent.primary }}>OS</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-lg leading-relaxed mb-8" style={{ color: COLORS.text.secondary, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          The portfolio that feels<br />
          like home.
        </p>

        {/* Description */}
        <p className="text-sm leading-relaxed mb-10" style={{ color: COLORS.text.tertiary }}>
          You&apos;re experiencing it now. Click the icons. Open windows. Explore. This is exactly what your visitors will see.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 text-xs mb-10" style={{ color: COLORS.text.tertiary }}>
          <div>
            <span className="text-lg font-light" style={{ color: COLORS.text.primary }}>2.4k</span>
            <span className="ml-1">designers</span>
          </div>
          <div className="w-px h-4" style={{ background: COLORS.text.muted }} />
          <div>
            <span className="text-lg font-light" style={{ color: COLORS.text.primary }}>4.9</span>
            <span className="ml-1">rating</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div>
        <Link href="/signup" className="block">
          <button
            className="w-full py-4 text-sm font-medium tracking-wide transition-all hover:translate-y-[-1px] active:translate-y-0"
            style={{
              background: COLORS.accent.primary,
              color: '#fff',
              borderRadius: '2px',
            }}
          >
            Create Your Desktop
          </button>
        </Link>
        <p className="text-center text-xs mt-4" style={{ color: COLORS.text.muted }}>
          Free forever · No credit card
        </p>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="h-full overflow-auto">
      {selectedFeature === null ? (
        <div className="p-8">
          <p className="text-xs uppercase tracking-widest mb-8" style={{ color: COLORS.text.tertiary }}>
            Everything you need
          </p>
          <div className="space-y-1">
            {FEATURES_DATA.map((feature, i) => (
              <button
                key={i}
                onClick={() => setSelectedFeature(i)}
                className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-[#F5F0E8] group"
                style={{ borderRadius: '2px' }}
              >
                <span className="text-xl w-8" style={{ color: COLORS.accent.primary }}>{feature.icon}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: COLORS.text.primary }}>{feature.title}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1" style={{ color: COLORS.text.tertiary, background: COLORS.bg.secondary, borderRadius: '2px' }}>
                  {feature.tag}
                </span>
                <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: COLORS.text.tertiary }}>→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-10">
          <button
            onClick={() => setSelectedFeature(null)}
            className="flex items-center gap-2 text-sm mb-10 transition-colors"
            style={{ color: COLORS.accent.primary }}
          >
            ← Back
          </button>
          <span className="text-4xl block mb-6" style={{ color: COLORS.accent.primary }}>
            {FEATURES_DATA[selectedFeature].icon}
          </span>
          <h3 className="text-2xl mb-4" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif' }}>
            {FEATURES_DATA[selectedFeature].title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>
            {FEATURES_DATA[selectedFeature].description}
          </p>
        </div>
      )}
    </div>
  );

  const renderExamplesContent = () => (
    <div className="p-8 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-8" style={{ color: COLORS.text.tertiary }}>
        Real portfolios
      </p>
      <div className="grid grid-cols-3 gap-6">
        {EXAMPLES_DATA.map((example, i) => (
          <div key={i} className="group cursor-pointer">
            <div
              className="aspect-square mb-3 flex items-center justify-center transition-all group-hover:scale-[1.02]"
              style={{ background: COLORS.bg.tertiary, borderRadius: '2px' }}
            >
              <span className="text-3xl font-light" style={{ color: COLORS.text.tertiary, fontFamily: 'Georgia, serif' }}>
                {example.initial}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>{example.name}</p>
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>{example.role}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricingContent = () => (
    <div className="p-8 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Free */}
        <div className="p-6 flex flex-col" style={{ background: COLORS.bg.secondary, borderRadius: '2px' }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: COLORS.text.tertiary }}>Free</p>
          <div className="mb-6">
            <span className="text-4xl font-light" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif' }}>$0</span>
          </div>
          <ul className="space-y-3 flex-1 text-sm" style={{ color: COLORS.text.secondary }}>
            {['Full desktop', '5 projects', 'MeOS subdomain', 'Mobile version'].map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span style={{ color: COLORS.accent.primary }}>·</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-6">
            <button
              className="w-full py-3 text-sm font-medium transition-colors"
              style={{ border: `1px solid ${COLORS.text.muted}`, color: COLORS.text.primary, borderRadius: '2px' }}
            >
              Get Started
            </button>
          </Link>
        </div>

        {/* Pro */}
        <div className="p-6 flex flex-col" style={{ background: COLORS.text.primary, borderRadius: '2px' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.bg.tertiary }}>Pro</p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1" style={{ background: COLORS.accent.primary, color: '#fff', borderRadius: '2px' }}>
              Popular
            </span>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-light" style={{ color: COLORS.bg.primary, fontFamily: 'Georgia, serif' }}>$12</span>
            <span className="text-sm ml-1" style={{ color: COLORS.text.muted }}>/mo</span>
          </div>
          <ul className="space-y-3 flex-1 text-sm" style={{ color: COLORS.bg.tertiary }}>
            {['Everything free', 'Unlimited projects', 'Custom domain', 'Analytics', 'No branding'].map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span style={{ color: COLORS.accent.primary }}>·</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-6">
            <button
              className="w-full py-3 text-sm font-medium transition-all hover:translate-y-[-1px]"
              style={{ background: COLORS.bg.primary, color: COLORS.text.primary, borderRadius: '2px' }}
            >
              Go Pro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="p-8 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-8" style={{ color: COLORS.text.tertiary }}>
        What they say
      </p>
      <div className="space-y-8">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div key={i}>
            <p className="text-base leading-relaxed mb-4" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-medium"
                style={{ background: COLORS.bg.tertiary, color: COLORS.text.secondary, borderRadius: '2px' }}
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>{t.name}</p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>{t.role} · {t.place}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHelpContent = () => (
    <div className="p-8 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-8" style={{ color: COLORS.text.tertiary }}>
        Questions
      </p>
      <div className="space-y-0">
        {FAQ_DATA.map((faq, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${COLORS.bg.tertiary}` }}>
            <button
              className="w-full py-5 flex items-center justify-between text-left"
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>{faq.q}</span>
              <span
                className="text-lg transition-transform"
                style={{ color: COLORS.text.tertiary, transform: expandedFaq === i ? 'rotate(45deg)' : 'none' }}
              >
                +
              </span>
            </button>
            <AnimatePresence>
              {expandedFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHowItWorksContent = () => {
    const steps = [
      { num: '01', title: 'Sign up', desc: 'Create your account with Google or email.' },
      { num: '02', title: 'Add your work', desc: 'Drop in projects, arrange your desktop.' },
      { num: '03', title: 'Go live', desc: 'Share your link. Average: 15 minutes.' },
    ];
    return (
      <div className="p-8 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest mb-8" style={{ color: COLORS.text.tertiary }}>
          Three steps
        </p>
        <div className="space-y-6 flex-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex gap-6 p-4 transition-colors cursor-pointer`}
              style={{
                background: howItWorksStep === i ? COLORS.bg.secondary : 'transparent',
                borderRadius: '2px'
              }}
              onClick={() => setHowItWorksStep(i)}
            >
              <span
                className="text-2xl font-light"
                style={{ color: howItWorksStep === i ? COLORS.accent.primary : COLORS.text.muted, fontFamily: 'Georgia, serif' }}
              >
                {step.num}
              </span>
              <div>
                <h4 className="font-medium mb-1" style={{ color: COLORS.text.primary }}>{step.title}</h4>
                <p className="text-sm" style={{ color: COLORS.text.tertiary }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/signup" className="block mt-6">
          <button
            className="w-full py-3 text-sm font-medium transition-all hover:translate-y-[-1px]"
            style={{ background: COLORS.accent.primary, color: '#fff', borderRadius: '2px' }}
          >
            Start Now
          </button>
        </Link>
      </div>
    );
  };

  const renderMobileContent = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="relative mb-8">
        {/* Phone frame */}
        <div
          className="relative w-44 h-[360px] p-1.5"
          style={{ background: COLORS.text.primary, borderRadius: '28px' }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 z-10"
            style={{ background: '#000', borderRadius: '10px' }}
          />
          {/* Screen */}
          <div
            className="w-full h-full overflow-hidden"
            style={{ background: COLORS.bg.primary, borderRadius: '22px' }}
          >
            {/* Status bar */}
            <div className="h-10 flex items-center justify-center pt-1">
              <span className="text-xs font-medium" style={{ color: COLORS.text.primary }}>9:41</span>
            </div>
            {/* App grid */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-3 gap-4">
                {['◈', '◐', '¶', '◉', '⬡', '✦'].map((sym, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-11 h-11 flex items-center justify-center mb-1"
                      style={{ background: COLORS.bg.tertiary, borderRadius: '10px' }}
                    >
                      <span style={{ color: COLORS.accent.primary }}>{sym}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-center leading-relaxed" style={{ color: COLORS.text.secondary }}>
        Automatic iOS interface.<br />
        <span style={{ color: COLORS.text.tertiary }}>Same content. Native feel.</span>
      </p>
    </div>
  );

  const getWindowContent = (id: string) => {
    switch (id) {
      case 'welcome': return renderWelcomeContent();
      case 'features': return renderFeaturesContent();
      case 'examples': return renderExamplesContent();
      case 'pricing': return renderPricingContent();
      case 'reviews': return renderReviewsContent();
      case 'help': return renderHelpContent();
      case 'howItWorks': return renderHowItWorksContent();
      case 'mobile': return renderMobileContent();
      default: return null;
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!mounted) {
    return <div className="fixed inset-0" style={{ background: COLORS.bg.primary }} />;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: COLORS.bg.primary }}
    >
      {/* Subtle warm gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(196, 99, 79, 0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(196, 99, 79, 0.02) 0%, transparent 50%)',
        }}
      />

      {/* ===== MENU BAR ===== */}
      <header
        className="fixed top-0 left-0 right-0 h-7 z-[200] flex items-center justify-between px-5"
        style={{ background: COLORS.bg.secondary, borderBottom: `1px solid ${COLORS.window.border}` }}
      >
        <div className="flex items-center gap-6">
          <button onClick={() => openWindow('welcome')} className="transition-colors" style={{ color: COLORS.text.primary }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px' }}>Me<span style={{ color: COLORS.accent.primary }}>OS</span></span>
          </button>
          <div className="flex items-center gap-5 text-xs" style={{ color: COLORS.text.secondary }}>
            <button onClick={() => openWindow('features')} className="hover:opacity-70 transition-opacity">File</button>
            <button onClick={() => openWindow('help')} className="hover:opacity-70 transition-opacity">Help</button>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login">
            <span className="text-xs cursor-pointer hover:opacity-70 transition-opacity" style={{ color: COLORS.text.secondary }}>Sign in</span>
          </Link>
          <Link href="/signup">
            <button
              className="px-3 py-1 text-xs font-medium transition-all hover:opacity-90"
              style={{ background: COLORS.accent.primary, color: '#fff', borderRadius: '2px' }}
            >
              Get Started
            </button>
          </Link>
          <span className="text-xs tabular-nums" style={{ color: COLORS.text.tertiary }}>{currentTime}</span>
        </div>
      </header>

      {/* ===== DESKTOP ICONS ===== */}
      {/* Left column */}
      <div className="fixed left-8 top-20 flex flex-col gap-6 z-10">
        {DESKTOP_ICONS.slice(0, 3).map((icon) => (
          <motion.button
            key={icon.id}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onDoubleClick={() => openWindow(icon.id)}
            whileHover={prefersReducedMotion ? {} : { y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="w-14 h-14 flex items-center justify-center text-xl transition-all group-hover:shadow-md"
              style={{ background: COLORS.bg.secondary, border: `1px solid ${COLORS.window.border}`, borderRadius: '4px' }}
            >
              <span style={{ color: COLORS.accent.primary }}>{icon.symbol}</span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: COLORS.text.secondary }}>
              {icon.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Right column */}
      <div className="fixed right-8 top-20 flex flex-col gap-6 z-10">
        {DESKTOP_ICONS.slice(3).map((icon) => (
          <motion.button
            key={icon.id}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onDoubleClick={() => openWindow(icon.id)}
            whileHover={prefersReducedMotion ? {} : { y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="w-14 h-14 flex items-center justify-center text-xl transition-all group-hover:shadow-md"
              style={{ background: COLORS.bg.secondary, border: `1px solid ${COLORS.window.border}`, borderRadius: '4px' }}
            >
              <span style={{ color: COLORS.accent.primary }}>{icon.symbol}</span>
            </div>
            <span className="text-[11px] font-medium" style={{ color: COLORS.text.secondary }}>
              {icon.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ===== WINDOWS ===== */}
      <AnimatePresence>
        {windows.filter(w => w.isOpen && !w.isMinimized).map((win) => (
          <motion.div
            key={win.id}
            className="absolute overflow-hidden"
            style={{
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
              zIndex: win.zIndex,
              background: COLORS.window.bg,
              boxShadow: '0 25px 50px -12px rgba(45, 42, 38, 0.15), 0 0 0 1px rgba(232, 226, 217, 1)',
              borderRadius: '8px',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => focusWindow(win.id)}
          >
            {/* Window header */}
            <div
              className="h-10 flex items-center px-4 cursor-move"
              style={{ background: COLORS.window.header, borderBottom: `1px solid ${COLORS.window.border}` }}
              onMouseDown={(e) => handleMouseDown(e, win.id)}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                  className="w-3 h-3 rounded-full transition-all hover:brightness-90 flex items-center justify-center group"
                  style={{ background: COLORS.traffic.close }}
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold" style={{ color: 'rgba(0,0,0,0.4)' }}>×</span>
                </button>
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.traffic.minimize }} />
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.traffic.maximize }} />
              </div>
              <span className="flex-1 text-center text-xs font-medium pointer-events-none" style={{ color: COLORS.text.secondary }}>
                {win.title}
              </span>
              <div className="w-14" />
            </div>
            {/* Window content */}
            <div className="h-[calc(100%-40px)] overflow-hidden" style={{ background: COLORS.window.bg }}>
              {getWindowContent(win.id)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ===== DOCK ===== */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-1 px-3 py-2"
        style={{
          background: 'rgba(245, 240, 232, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          boxShadow: `0 0 0 1px ${COLORS.window.border}, 0 8px 32px -8px rgba(45, 42, 38, 0.12)`,
        }}
      >
        {DOCK_APPS.map((app) => {
          const win = windows.find(w => w.id === app.id);
          const isOpen = win?.isOpen;
          const isHovered = hoveredDock === app.id;

          return (
            <motion.button
              key={app.id}
              className="relative flex flex-col items-center"
              onClick={() => isOpen ? focusWindow(app.id) : openWindow(app.id)}
              onMouseEnter={() => setHoveredDock(app.id)}
              onMouseLeave={() => setHoveredDock(null)}
              animate={{
                y: isHovered ? -6 : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute -top-8 px-2 py-1 text-[10px] font-medium whitespace-nowrap"
                    style={{ background: COLORS.text.primary, color: COLORS.bg.primary, borderRadius: '4px' }}
                  >
                    {app.label}
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="w-11 h-11 flex items-center justify-center transition-shadow"
                style={{
                  background: COLORS.bg.secondary,
                  border: `1px solid ${COLORS.window.border}`,
                  borderRadius: '10px',
                  boxShadow: isHovered ? '0 4px 12px rgba(45, 42, 38, 0.1)' : 'none',
                }}
              >
                <span className="text-lg" style={{ color: COLORS.accent.primary }}>{app.symbol}</span>
              </div>

              {/* Open indicator */}
              {isOpen && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full" style={{ background: COLORS.text.tertiary }} />
              )}
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 mx-2 self-center" style={{ background: COLORS.window.border }} />

        {/* CTA */}
        <Link href="/signup">
          <motion.button
            className="px-4 py-2.5 text-xs font-medium"
            style={{ background: COLORS.accent.primary, color: '#fff', borderRadius: '8px' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </Link>
      </nav>

      {/* ===== HINT NOTIFICATION ===== */}
      <AnimatePresence>
        {showHint && !hintDismissed && (
          <motion.div
            className="fixed top-12 right-5 z-[300] w-64"
            initial={{ opacity: 0, y: -8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <div
              className="p-4 flex items-start gap-3"
              style={{
                background: COLORS.window.bg,
                boxShadow: `0 0 0 1px ${COLORS.window.border}, 0 12px 32px -8px rgba(45, 42, 38, 0.15)`,
                borderRadius: '8px',
              }}
            >
              <span className="text-lg" style={{ color: COLORS.accent.primary }}>↗</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1" style={{ color: COLORS.text.primary }}>Explore</p>
                <p className="text-xs leading-relaxed" style={{ color: COLORS.text.tertiary }}>
                  Double-click icons or use the dock.
                </p>
              </div>
              <button
                onClick={() => { setShowHint(false); setHintDismissed(true); }}
                className="text-lg leading-none transition-opacity hover:opacity-60"
                style={{ color: COLORS.text.muted }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
