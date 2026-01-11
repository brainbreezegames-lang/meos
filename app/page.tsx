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
// DESIGN SYSTEM - Warm Editorial Palette
// =============================================================================

const COLORS = {
  bg: '#FAFAF9',
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    tertiary: '#78716C',
    muted: '#A8A29E',
  },
  accent: '#EA580C',
  stone: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  traffic: {
    close: '#FF5F57',
    minimize: '#FFBD2E',
    maximize: '#28CA41',
  },
};

// =============================================================================
// DATA
// =============================================================================

const FEATURES_DATA = [
  { icon: '✎', title: 'Case Studies', description: 'Rich documents with process, insights, and outcomes.', tag: 'Content' },
  { icon: '◐', title: 'Photo Gallery', description: 'Masonry grids, albums, and lightbox viewing.', tag: 'Media' },
  { icon: '¶', title: 'Notes', description: 'Long-form writing with markdown support.', tag: 'Content' },
  { icon: '◉', title: 'Contact Card', description: 'Email, calendar booking, and social links.', tag: 'Connect' },
  { icon: '⬡', title: 'Downloads', description: 'Resume and resources organized.', tag: 'Files' },
  { icon: '◷', title: 'Analytics', description: 'See who visits and what they view.', tag: 'Insights' },
  { icon: '◈', title: 'Themes', description: 'Five themes that transform the feel.', tag: 'Style' },
  { icon: '▣', title: 'Mobile', description: 'Automatic iOS-style interface.', tag: 'Platform' },
  { icon: '⬢', title: 'Custom URL', description: 'Use your own domain on Pro.', tag: 'Pro' },
];

const TESTIMONIALS_DATA = [
  { text: "Got 3 interview requests in the first week. Recruiters always mention how unique my portfolio looks.", name: "Sarah Kim", role: "Product Designer" },
  { text: "Finally something that doesn't look like every other portfolio. My clients always comment on it.", name: "Marcus Chen", role: "Brand Designer" },
  { text: "The case study format is perfect for showing process.", name: "Yuki Tanaka", role: "UX Lead" },
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
  { id: 'welcome', title: 'Welcome', isOpen: true, isMinimized: false, zIndex: 100, position: { x: 80, y: 60 }, size: { width: 420, height: 500 } },
  { id: 'features', title: 'Features', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 80 }, size: { width: 480, height: 420 } },
  { id: 'examples', title: 'Examples', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 240, y: 100 }, size: { width: 520, height: 380 } },
  { id: 'pricing', title: 'Pricing', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 180, y: 90 }, size: { width: 500, height: 460 } },
  { id: 'reviews', title: 'Reviews', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 260, y: 70 }, size: { width: 420, height: 420 } },
  { id: 'help', title: 'FAQ', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 220, y: 110 }, size: { width: 440, height: 400 } },
];

const DOCK_APPS = ['welcome', 'features', 'examples', 'pricing', 'reviews', 'help'];

// =============================================================================
// NOISE TEXTURE COMPONENT
// =============================================================================

const NoiseOverlay = () => (
  <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]">
    <svg className="w-full h-full">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
);

// =============================================================================
// GENERATIVE GRADIENT WALLPAPER
// =============================================================================

const GradientWallpaper = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: COLORS.bg }}>
    {/* Orange/Rose orb - top left */}
    <div
      className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full"
      style={{
        background: 'linear-gradient(to bottom right, rgba(255, 237, 213, 0.5), rgba(254, 205, 211, 0.35), transparent)',
        filter: 'blur(120px)',
      }}
    />
    {/* Stone/Indigo orb - bottom right */}
    <div
      className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] rounded-full"
      style={{
        background: 'linear-gradient(to top left, rgba(214, 211, 209, 0.5), rgba(224, 231, 255, 0.25), transparent)',
        filter: 'blur(100px)',
      }}
    />
    {/* White center glow */}
    <div
      className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        filter: 'blur(80px)',
      }}
    />
    {/* Subtle warm accent orb */}
    <div
      className="absolute top-[20%] right-[20%] w-[25%] h-[25%] rounded-full"
      style={{
        background: 'rgba(234, 88, 12, 0.06)',
        filter: 'blur(60px)',
      }}
    />
  </div>
);

// =============================================================================
// DOCK ICONS
// =============================================================================

const DockIcon = ({ id, isActive }: { id: string; isActive?: boolean }) => {
  const icons: Record<string, React.ReactNode> = {
    welcome: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={COLORS.accent} strokeWidth="1.5" />
        <path d="M3 9L12 14L21 9" stroke={COLORS.accent} strokeWidth="1.5" />
      </svg>
    ),
    features: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke={COLORS.accent} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" fill={COLORS.accent} />
      </svg>
    ),
    examples: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={COLORS.accent} strokeWidth="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={COLORS.accent} strokeWidth="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={COLORS.accent} strokeWidth="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill={isActive ? COLORS.accent : 'none'} stroke={COLORS.accent} strokeWidth="1.5" />
      </svg>
    ),
    pricing: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="12" rx="2" stroke={COLORS.accent} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke={COLORS.accent} strokeWidth="1.5" />
      </svg>
    ),
    reviews: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 5H19V16H12L7 20V16H5V5Z" stroke={COLORS.accent} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="8" cy="10" r="1" fill={COLORS.accent} />
        <circle cx="12" cy="10" r="1" fill={COLORS.accent} />
        <circle cx="16" cy="10" r="1" fill={COLORS.accent} />
      </svg>
    ),
    help: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={COLORS.accent} strokeWidth="1.5" />
        <path d="M9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12V14" stroke={COLORS.accent} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill={COLORS.accent} />
      </svg>
    ),
  };
  return icons[id] || icons.welcome;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [highestZ, setHighestZ] = useState(100);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, windowId: null, startPos: { x: 0, y: 0 }, startWindowPos: { x: 0, y: 0 } });
  const [currentTime, setCurrentTime] = useState('');
  const [hoveredDock, setHoveredDock] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Instrument Serif font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const interLink = document.createElement('link');
    interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    interLink.rel = 'stylesheet';
    document.head.appendChild(interLink);
  }, []);

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

  const openWindow = useCallback((id: string) => {
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

  const handleWindowMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    focusWindow(windowId);
    setDragState({ isDragging: true, windowId, startPos: { x: e.clientX, y: e.clientY }, startWindowPos: { x: win.position.x, y: win.position.y } });
  }, [windows, focusWindow]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && dragState.windowId) {
      const dx = e.clientX - dragState.startPos.x;
      const dy = e.clientY - dragState.startPos.y;
      setWindows(prev => prev.map(w =>
        w.id === dragState.windowId
          ? { ...w, position: { x: Math.max(0, dragState.startWindowPos.x + dx), y: Math.max(28, dragState.startWindowPos.y + dy) } }
          : w
      ));
    }
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
    <div className="flex flex-col h-full p-8">
      <div className="flex-1">
        <div className="mb-8">
          <h1
            className="text-5xl tracking-tight"
            style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.text.primary }}
          >
            Me<span style={{ color: COLORS.accent }}>OS</span>
          </h1>
        </div>
        <p
          className="text-2xl leading-relaxed mb-6"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', color: COLORS.text.secondary }}
        >
          The portfolio that feels<br />like home.
        </p>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.tertiary }}
        >
          You&apos;re experiencing it now. Click the icons. Open windows. Drag them around. This is your future portfolio.
        </p>
        <div className="flex items-center gap-6 text-xs mb-8" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>
          <div>
            <span className="text-2xl" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.text.primary }}>2.4k</span>
            <span className="ml-2">designers</span>
          </div>
          <div className="w-px h-5" style={{ background: COLORS.stone[200] }} />
          <div>
            <span className="text-2xl" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.text.primary }}>4.9</span>
            <span className="ml-2">rating</span>
          </div>
        </div>
      </div>
      <div>
        <Link href="/signup" className="block">
          <button
            className="w-full py-4 text-sm font-medium tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: COLORS.accent,
              color: '#fff',
              borderRadius: '12px',
              fontFamily: '"Inter", sans-serif',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
            }}
          >
            Create Your Desktop
          </button>
        </Link>
        <p className="text-center text-xs mt-4" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>
          Free forever · No credit card
        </p>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="h-full overflow-auto">
      {selectedFeature === null ? (
        <div className="p-6">
          <p className="text-xs uppercase tracking-widest mb-6" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>
            Everything you need
          </p>
          <div className="space-y-1">
            {FEATURES_DATA.map((feature, i) => (
              <button
                key={i}
                onClick={() => setSelectedFeature(i)}
                className="w-full flex items-center gap-4 p-3 text-left transition-all hover:bg-stone-100/80 group rounded-xl"
              >
                <span className="text-base w-6" style={{ color: COLORS.accent }}>{feature.icon}</span>
                <span className="flex-1 text-sm font-medium" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.primary }}>
                  {feature.title}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted, background: COLORS.stone[100] }}
                >
                  {feature.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8">
          <button
            onClick={() => setSelectedFeature(null)}
            className="text-sm mb-8 flex items-center gap-1"
            style={{ fontFamily: '"Inter", sans-serif', color: COLORS.accent }}
          >
            ← Back
          </button>
          <span className="text-4xl block mb-4" style={{ color: COLORS.accent }}>{FEATURES_DATA[selectedFeature].icon}</span>
          <h3 className="text-2xl mb-3" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.text.primary }}>
            {FEATURES_DATA[selectedFeature].title}
          </h3>
          <p className="text-base leading-relaxed" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.secondary }}>
            {FEATURES_DATA[selectedFeature].description}
          </p>
        </div>
      )}
    </div>
  );

  const renderExamplesContent = () => (
    <div className="p-6 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-6" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>
        Real portfolios
      </p>
      <div className="grid grid-cols-3 gap-4">
        {EXAMPLES_DATA.map((ex, i) => (
          <div key={i} className="group cursor-pointer">
            <div
              className="aspect-square mb-3 flex items-center justify-center transition-all group-hover:scale-[1.02] rounded-2xl"
              style={{ background: COLORS.stone[100] }}
            >
              <span className="text-2xl" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.text.muted }}>
                {ex.initial}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.primary }}>{ex.name}</p>
            <p className="text-xs" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>{ex.role}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricingContent = () => (
    <div className="p-6 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-5 h-full">
        {/* Free Plan */}
        <div className="p-5 flex flex-col rounded-2xl" style={{ background: COLORS.stone[100] }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>Free</p>
          <span className="text-4xl mb-4" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.text.primary }}>$0</span>
          <ul className="space-y-3 flex-1 text-sm" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.secondary }}>
            {['Full desktop', '5 projects', 'MeOS subdomain', 'Mobile version'].map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span style={{ color: COLORS.accent }}>·</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-4">
            <button
              className="w-full py-2.5 text-sm font-medium rounded-xl transition-all hover:bg-stone-200"
              style={{ fontFamily: '"Inter", sans-serif', border: `1px solid ${COLORS.stone[300]}`, color: COLORS.text.primary }}
            >
              Get Started
            </button>
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="p-5 flex flex-col rounded-2xl" style={{ background: COLORS.text.primary }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.stone[400] }}>Pro</p>
            <span className="text-[10px] uppercase px-2.5 py-1 rounded-md font-medium" style={{ fontFamily: '"Inter", sans-serif', background: COLORS.accent, color: '#fff' }}>Popular</span>
          </div>
          <span className="text-4xl mb-4" style={{ fontFamily: '"Instrument Serif", Georgia, serif', color: COLORS.stone[50] }}>
            $12<span className="text-sm ml-1" style={{ color: COLORS.stone[500] }}>/mo</span>
          </span>
          <ul className="space-y-3 flex-1 text-sm" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.stone[300] }}>
            {['Everything free', 'Unlimited projects', 'Custom domain', 'Analytics', 'No branding'].map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span style={{ color: COLORS.accent }}>·</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-4">
            <button
              className="w-full py-2.5 text-sm font-medium rounded-xl transition-all hover:brightness-95"
              style={{ fontFamily: '"Inter", sans-serif', background: COLORS.stone[50], color: COLORS.text.primary }}
            >
              Go Pro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="p-6 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-6" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>
        What they say
      </p>
      <div className="space-y-6">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div key={i}>
            <p
              className="text-lg leading-relaxed mb-3"
              style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', color: COLORS.text.primary }}
            >
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg"
                style={{ fontFamily: '"Inter", sans-serif', background: COLORS.stone[200], color: COLORS.text.secondary }}
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.primary }}>{t.name}</p>
                <p className="text-xs" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHelpContent = () => (
    <div className="p-6 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-6" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>
        Questions
      </p>
      <div className="space-y-0">
        {FAQ_DATA.map((faq, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${COLORS.stone[200]}` }}>
            <button
              className="w-full py-4 flex items-center justify-between text-left"
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <span className="text-sm font-medium" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.primary }}>{faq.q}</span>
              <span
                className="text-lg transition-transform duration-200"
                style={{ color: COLORS.text.muted, transform: expandedFaq === i ? 'rotate(45deg)' : 'none' }}
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
                  <p className="pb-4 text-sm" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.secondary }}>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
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
      default: return null;
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!mounted) return <div className="fixed inset-0" style={{ background: COLORS.bg }} />;

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden select-none">
      {/* Generative Gradient Wallpaper */}
      <GradientWallpaper />

      {/* Noise Texture Overlay */}
      <NoiseOverlay />

      {/* Menu Bar - Glass effect */}
      <header
        className="fixed top-0 left-0 right-0 h-7 z-[200] flex items-center justify-between px-5"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex items-center gap-6">
          <button onClick={() => openWindow('welcome')}>
            <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: '14px', color: COLORS.text.primary }}>
              Me<span style={{ color: COLORS.accent }}>OS</span>
            </span>
          </button>
          <div className="flex items-center gap-5 text-xs" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.secondary }}>
            <button onClick={() => openWindow('features')} className="hover:text-stone-900 transition-colors">File</button>
            <button onClick={() => openWindow('help')} className="hover:text-stone-900 transition-colors">Help</button>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login">
            <span className="text-xs cursor-pointer hover:text-stone-900 transition-colors" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.secondary }}>
              Sign in
            </span>
          </Link>
          <Link href="/signup">
            <button
              className="px-3.5 py-1 text-xs font-medium hover:brightness-110 rounded-lg transition-all"
              style={{ fontFamily: '"Inter", sans-serif', background: COLORS.accent, color: '#fff' }}
            >
              Get Started
            </button>
          </Link>
          <span className="text-xs tabular-nums" style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.muted }}>{currentTime}</span>
        </div>
      </header>

      {/* Windows */}
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
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '12px',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 24px 64px -8px rgba(28, 25, 23, 0.08), 0 8px 24px -4px rgba(28, 25, 23, 0.04)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.25, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => focusWindow(win.id)}
          >
            {/* Window Title Bar */}
            <div
              className="h-11 flex items-center px-3.5 cursor-move"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
              }}
              onMouseDown={(e) => handleWindowMouseDown(e, win.id)}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                  className="w-3 h-3 rounded-full hover:brightness-90 flex items-center justify-center group transition-all"
                  style={{ background: COLORS.traffic.close }}
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold transition-opacity" style={{ color: 'rgba(0,0,0,0.5)' }}>×</span>
                </button>
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.traffic.minimize }} />
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.traffic.maximize }} />
              </div>
              <span
                className="flex-1 text-center text-xs font-medium pointer-events-none"
                style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.secondary }}
              >
                {win.title}
              </span>
              <div className="w-14" />
            </div>

            {/* Window Content */}
            <div className="h-[calc(100%-44px)] overflow-hidden">
              {getWindowContent(win.id)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dock - Glass effect */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-2 px-3 py-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderRadius: '20px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px -8px rgba(28, 25, 23, 0.1)',
        }}
      >
        {DOCK_APPS.map((appId) => {
          const win = windows.find(w => w.id === appId);
          const isOpen = win?.isOpen;
          const isHovered = hoveredDock === appId;

          return (
            <motion.button
              key={appId}
              className="relative flex flex-col items-center"
              onClick={() => isOpen ? focusWindow(appId) : openWindow(appId)}
              onMouseEnter={() => setHoveredDock(appId)}
              onMouseLeave={() => setHoveredDock(null)}
              animate={{ y: isHovered ? -12 : 0, scale: isHovered ? 1.2 : 1 }}
              whileTap={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    className="absolute -top-10 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg"
                    style={{ fontFamily: '"Inter", sans-serif', background: COLORS.text.primary, color: COLORS.stone[50] }}
                  >
                    {win?.title || appId}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: COLORS.text.primary }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: COLORS.stone[100],
                  boxShadow: isHovered
                    ? '0 8px 24px -4px rgba(28, 25, 23, 0.12)'
                    : '0 2px 8px -2px rgba(28, 25, 23, 0.08)',
                }}
              >
                <DockIcon id={appId} isActive={isOpen} />
              </motion.div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                    style={{ background: COLORS.text.tertiary }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        <div className="w-px h-10 mx-2 self-center" style={{ background: COLORS.stone[200] }} />

        <Link href="/signup">
          <motion.button
            className="px-5 py-2.5 text-xs font-medium rounded-xl"
            style={{
              fontFamily: '"Inter", sans-serif',
              background: COLORS.accent,
              color: '#fff',
              boxShadow: '0 8px 24px -4px rgba(234, 88, 12, 0.3)',
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </Link>
      </nav>
    </div>
  );
}
