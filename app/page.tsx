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

interface DesktopIcon {
  id: string;
  label: string;
  position: { x: number; y: number };
}

// =============================================================================
// DESIGN SYSTEM - Warm Stone Palette
// Based on user's HTML mockup: #FAFAF9 bg, stone colors, Instrument Serif
// =============================================================================

const COLORS = {
  bg: {
    primary: '#FAFAF9',      // stone-50 warm off-white
    secondary: '#F5F5F4',    // stone-100
    tertiary: '#E7E5E4',     // stone-200
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#1C1917',      // stone-900
    secondary: '#57534E',    // stone-600
    tertiary: '#78716C',     // stone-500
    muted: '#A8A29E',        // stone-400
  },
  accent: {
    primary: '#EA580C',      // orange-600
    hover: '#DC2626',        // slightly darker
    light: 'rgba(234, 88, 12, 0.08)',
  },
  window: {
    bg: '#FAFAF9',
    header: '#FFFFFF',
    border: 'rgba(28, 25, 23, 0.08)',
  },
  traffic: {
    close: '#FF5F57',
    minimize: '#FFBD2E',
    maximize: '#28CA41',
  },
  shadow: {
    soft: '0 25px 50px -12px rgba(28, 25, 23, 0.08), 0 12px 24px -8px rgba(28, 25, 23, 0.04)',
    medium: '0 25px 50px -12px rgba(28, 25, 23, 0.15), 0 12px 24px -8px rgba(28, 25, 23, 0.08)',
    elevated: '0 32px 64px -16px rgba(28, 25, 23, 0.18), 0 16px 32px -8px rgba(28, 25, 23, 0.1)',
  }
};

// =============================================================================
// CUSTOM ICONS - Warm Stone Style with Orange Accent
// =============================================================================

const WelcomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="6" width="20" height="16" rx="2" stroke={COLORS.accent.primary} strokeWidth="1.5" fill="none" />
    <path d="M4 10L14 16L24 10" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FeaturesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="9" stroke={COLORS.accent.primary} strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="14" r="3" fill={COLORS.accent.primary} />
    <path d="M14 5V8M14 20V23M5 14H8M20 14H23" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ExamplesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="2" fill={COLORS.accent.light} stroke={COLORS.accent.primary} strokeWidth="1.5" />
    <rect x="16" y="4" width="8" height="8" rx="2" stroke={COLORS.accent.primary} strokeWidth="1.5" />
    <rect x="4" y="16" width="8" height="8" rx="2" stroke={COLORS.accent.primary} strokeWidth="1.5" />
    <rect x="16" y="16" width="8" height="8" rx="2" fill={COLORS.accent.light} stroke={COLORS.accent.primary} strokeWidth="1.5" />
  </svg>
);

const PricingIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="3" y="7" width="22" height="14" rx="2" stroke={COLORS.accent.primary} strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="14" r="4" stroke={COLORS.accent.primary} strokeWidth="1.5" />
    <path d="M14 12V16M12.5 13.5H15.5" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ReviewsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M6 6H22V18H13L8 22V18H6V6Z" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    <circle cx="10" cy="12" r="1.5" fill={COLORS.accent.primary} />
    <circle cx="14" cy="12" r="1.5" fill={COLORS.accent.primary} />
    <circle cx="18" cy="12" r="1.5" fill={COLORS.accent.primary} />
  </svg>
);

const HelpIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="10" stroke={COLORS.accent.primary} strokeWidth="1.5" fill="none" />
    <path d="M11 11C11 9.34 12.34 8 14 8C15.66 8 17 9.34 17 11C17 12.66 15.66 14 14 14V16" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="19" r="1" fill={COLORS.accent.primary} />
  </svg>
);

const HowItWorksIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="7" cy="14" r="3" stroke={COLORS.accent.primary} strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="14" r="3" fill={COLORS.accent.light} stroke={COLORS.accent.primary} strokeWidth="1.5" />
    <circle cx="21" cy="14" r="3" fill={COLORS.accent.primary} />
    <path d="M10 14H11M17 14H18" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MobileIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="8" y="3" width="12" height="22" rx="2" stroke={COLORS.accent.primary} strokeWidth="1.5" fill="none" />
    <path d="M12 5H16" stroke={COLORS.accent.primary} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="21" r="1.5" fill={COLORS.accent.primary} />
  </svg>
);

const APP_ICONS: Record<string, React.FC> = {
  welcome: WelcomeIcon,
  features: FeaturesIcon,
  examples: ExamplesIcon,
  pricing: PricingIcon,
  reviews: ReviewsIcon,
  help: HelpIcon,
  howItWorks: HowItWorksIcon,
  mobile: MobileIcon,
};

// Icon background colors - warm stone tones
const ICON_BG: Record<string, string> = {
  welcome: '#F5F5F4',
  features: '#E7E5E4',
  examples: '#F5F5F4',
  pricing: '#E7E5E4',
  reviews: '#F5F5F4',
  help: '#E7E5E4',
  howItWorks: '#F5F5F4',
  mobile: '#E7E5E4',
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
  { text: "Got 3 interview requests in the first week. Recruiters always mention how unique my portfolio looks.", name: "Sarah Kim", role: "Product Designer", place: "San Francisco" },
  { text: "Finally something that doesn't look like every other portfolio. My clients always comment on it.", name: "Marcus Chen", role: "Brand Designer", place: "New York" },
  { text: "The case study format is perfect for showing process.", name: "Yuki Tanaka", role: "UX Lead", place: "Tokyo" },
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
  { id: 'welcome', title: 'Welcome', isOpen: true, isMinimized: false, zIndex: 100, position: { x: 80, y: 60 }, size: { width: 400, height: 480 } },
  { id: 'features', title: 'Features', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 160, y: 80 }, size: { width: 500, height: 420 } },
  { id: 'examples', title: 'Examples', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 100 }, size: { width: 520, height: 380 } },
  { id: 'pricing', title: 'Pricing', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 140, y: 90 }, size: { width: 480, height: 460 } },
  { id: 'reviews', title: 'Reviews', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 220, y: 70 }, size: { width: 420, height: 420 } },
  { id: 'help', title: 'FAQ', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 180, y: 110 }, size: { width: 440, height: 400 } },
  { id: 'howItWorks', title: 'How It Works', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 240, y: 80 }, size: { width: 400, height: 360 } },
  { id: 'mobile', title: 'Mobile', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 300, y: 60 }, size: { width: 340, height: 480 } },
];

const INITIAL_DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'features', label: 'Features', position: { x: 40, y: 70 } },
  { id: 'howItWorks', label: 'How It Works', position: { x: 50, y: 190 } },
  { id: 'examples', label: 'Examples', position: { x: 35, y: 320 } },
  { id: 'pricing', label: 'Pricing', position: { x: 60, y: 450 } },
  { id: 'reviews', label: 'Reviews', position: { x: -120, y: 90 } },
  { id: 'help', label: 'FAQ', position: { x: -100, y: 230 } },
  { id: 'mobile', label: 'Mobile', position: { x: -130, y: 370 } },
];

const DOCK_APPS = ['welcome', 'features', 'examples', 'pricing', 'reviews', 'help'];

// =============================================================================
// FONT STYLES - Instrument Serif for display, system for body
// =============================================================================

const fontDisplay = '"Instrument Serif", Georgia, serif';
const fontBody = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>(INITIAL_DESKTOP_ICONS);
  const [highestZ, setHighestZ] = useState(100);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, windowId: null, startPos: { x: 0, y: 0 }, startWindowPos: { x: 0, y: 0 } });
  const [iconDragState, setIconDragState] = useState<{ isDragging: boolean; iconId: string | null; startPos: { x: number; y: number }; startIconPos: { x: number; y: number } }>({ isDragging: false, iconId: null, startPos: { x: 0, y: 0 }, startIconPos: { x: 0, y: 0 } });
  const [currentTime, setCurrentTime] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [howItWorksStep, setHowItWorksStep] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [hoveredDock, setHoveredDock] = useState<string | null>(null);
  const [pressedIcon, setPressedIcon] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const backgroundImage = '/bg.jpg';

  // Load Instrument Serif font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
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

  const handleWindowMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    focusWindow(windowId);
    setDragState({ isDragging: true, windowId, startPos: { x: e.clientX, y: e.clientY }, startWindowPos: { x: win.position.x, y: win.position.y } });
  }, [windows, focusWindow]);

  const handleIconMouseDown = useCallback((e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    const icon = desktopIcons.find(i => i.id === iconId);
    if (!icon) return;
    setPressedIcon(iconId);
    setIconDragState({ isDragging: true, iconId, startPos: { x: e.clientX, y: e.clientY }, startIconPos: { x: icon.position.x, y: icon.position.y } });
  }, [desktopIcons]);

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
    if (iconDragState.isDragging && iconDragState.iconId) {
      const dx = e.clientX - iconDragState.startPos.x;
      const dy = e.clientY - iconDragState.startPos.y;
      setDesktopIcons(prev => prev.map(i =>
        i.id === iconDragState.iconId
          ? { ...i, position: { x: iconDragState.startIconPos.x + dx, y: iconDragState.startIconPos.y + dy } }
          : i
      ));
    }
  }, [dragState, iconDragState]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (iconDragState.isDragging && iconDragState.iconId) {
      const dx = Math.abs(e.clientX - iconDragState.startPos.x);
      const dy = Math.abs(e.clientY - iconDragState.startPos.y);
      if (dx < 5 && dy < 5) {
        openWindow(iconDragState.iconId);
      }
    }
    setDragState({ isDragging: false, windowId: null, startPos: { x: 0, y: 0 }, startWindowPos: { x: 0, y: 0 } });
    setIconDragState({ isDragging: false, iconId: null, startPos: { x: 0, y: 0 }, startIconPos: { x: 0, y: 0 } });
    setPressedIcon(null);
  }, [iconDragState, openWindow]);

  useEffect(() => {
    if (dragState.isDragging || iconDragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, iconDragState.isDragging, handleMouseMove, handleMouseUp]);

  // =============================================================================
  // WINDOW CONTENT
  // =============================================================================

  const renderWelcomeContent = () => (
    <div className="flex flex-col h-full p-8">
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight" style={{ color: COLORS.text.primary, fontFamily: fontDisplay }}>
            Me<span style={{ color: COLORS.accent.primary }}>OS</span>
          </h1>
        </div>
        <p className="text-xl leading-relaxed mb-6" style={{ color: COLORS.text.secondary, fontFamily: fontDisplay, fontStyle: 'italic' }}>
          The portfolio that feels<br />like home.
        </p>
        <p className="text-sm leading-relaxed mb-8" style={{ color: COLORS.text.tertiary, fontFamily: fontBody }}>
          You&apos;re experiencing it now. Click the icons. Open windows. Drag them around. This is your future portfolio.
        </p>
        <div className="flex items-center gap-6 text-xs mb-8" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>
          <div>
            <span className="text-lg font-light" style={{ color: COLORS.text.primary, fontFamily: fontDisplay }}>2.4k</span>
            <span className="ml-1.5">designers</span>
          </div>
          <div className="w-px h-4" style={{ background: COLORS.bg.tertiary }} />
          <div>
            <span className="text-lg font-light" style={{ color: COLORS.text.primary, fontFamily: fontDisplay }}>4.9</span>
            <span className="ml-1.5">rating</span>
          </div>
        </div>
      </div>
      <div>
        <Link href="/signup" className="block">
          <button
            className="w-full py-4 text-sm font-medium tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: COLORS.accent.primary,
              color: '#fff',
              borderRadius: '12px',
              fontFamily: fontBody,
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
            }}
          >
            Create Your Desktop
          </button>
        </Link>
        <p className="text-center text-xs mt-4" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Free forever · No credit card</p>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="h-full overflow-auto">
      {selectedFeature === null ? (
        <div className="p-6">
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Everything you need</p>
          <div className="space-y-1">
            {FEATURES_DATA.map((feature, i) => (
              <button
                key={i}
                onClick={() => setSelectedFeature(i)}
                className="w-full flex items-center gap-4 p-3 text-left transition-all hover:bg-stone-100 group rounded-xl"
              >
                <span className="text-base w-6" style={{ color: COLORS.accent.primary }}>{feature.icon}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>{feature.title}</span>
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ color: COLORS.text.muted, background: COLORS.bg.secondary, fontFamily: fontBody }}
                >
                  {feature.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8">
          <button onClick={() => setSelectedFeature(null)} className="text-sm mb-8 flex items-center gap-1" style={{ color: COLORS.accent.primary, fontFamily: fontBody }}>
            ← Back
          </button>
          <span className="text-3xl block mb-4" style={{ color: COLORS.accent.primary }}>{FEATURES_DATA[selectedFeature].icon}</span>
          <h3 className="text-2xl mb-3" style={{ color: COLORS.text.primary, fontFamily: fontDisplay }}>{FEATURES_DATA[selectedFeature].title}</h3>
          <p className="text-base leading-relaxed" style={{ color: COLORS.text.secondary, fontFamily: fontBody }}>{FEATURES_DATA[selectedFeature].description}</p>
        </div>
      )}
    </div>
  );

  const renderExamplesContent = () => (
    <div className="p-6 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-6" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Real portfolios</p>
      <div className="grid grid-cols-3 gap-4">
        {EXAMPLES_DATA.map((ex, i) => (
          <div key={i} className="group cursor-pointer">
            <div
              className="aspect-square mb-3 flex items-center justify-center transition-all group-hover:scale-[1.02] rounded-2xl"
              style={{ background: COLORS.bg.secondary }}
            >
              <span className="text-2xl font-light" style={{ color: COLORS.text.muted, fontFamily: fontDisplay }}>{ex.initial}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>{ex.name}</p>
            <p className="text-xs" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>{ex.role}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricingContent = () => (
    <div className="p-6 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-5 h-full">
        {/* Free Plan */}
        <div className="p-5 flex flex-col rounded-2xl" style={{ background: COLORS.bg.secondary }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Free</p>
          <span className="text-3xl font-light mb-4" style={{ color: COLORS.text.primary, fontFamily: fontDisplay }}>$0</span>
          <ul className="space-y-3 flex-1 text-sm" style={{ color: COLORS.text.secondary, fontFamily: fontBody }}>
            {['Full desktop', '5 projects', 'MeOS subdomain', 'Mobile version'].map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span style={{ color: COLORS.accent.primary }}>·</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-4">
            <button
              className="w-full py-2.5 text-sm font-medium rounded-xl transition-all hover:bg-stone-200"
              style={{ border: `1px solid ${COLORS.bg.tertiary}`, color: COLORS.text.primary, fontFamily: fontBody }}
            >
              Get Started
            </button>
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="p-5 flex flex-col rounded-2xl" style={{ background: COLORS.text.primary }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.bg.tertiary, fontFamily: fontBody }}>Pro</p>
            <span className="text-[10px] uppercase px-2.5 py-1 rounded-md font-medium" style={{ background: COLORS.accent.primary, color: '#fff', fontFamily: fontBody }}>Popular</span>
          </div>
          <span className="text-3xl font-light mb-4" style={{ color: COLORS.bg.primary, fontFamily: fontDisplay }}>
            $12<span className="text-sm ml-1" style={{ color: COLORS.text.muted }}>/mo</span>
          </span>
          <ul className="space-y-3 flex-1 text-sm" style={{ color: COLORS.bg.tertiary, fontFamily: fontBody }}>
            {['Everything free', 'Unlimited projects', 'Custom domain', 'Analytics', 'No branding'].map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span style={{ color: COLORS.accent.primary }}>·</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-4">
            <button
              className="w-full py-2.5 text-sm font-medium rounded-xl transition-all hover:brightness-95"
              style={{ background: COLORS.bg.primary, color: COLORS.text.primary, fontFamily: fontBody }}
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
      <p className="text-xs uppercase tracking-widest mb-6" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>What they say</p>
      <div className="space-y-6">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div key={i}>
            <p className="text-base leading-relaxed mb-3" style={{ color: COLORS.text.primary, fontFamily: fontDisplay, fontStyle: 'italic' }}>
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg"
                style={{ background: COLORS.bg.tertiary, color: COLORS.text.secondary, fontFamily: fontBody }}
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>{t.name}</p>
                <p className="text-xs" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHelpContent = () => (
    <div className="p-6 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-6" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Questions</p>
      <div className="space-y-0">
        {FAQ_DATA.map((faq, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${COLORS.bg.tertiary}` }}>
            <button
              className="w-full py-4 flex items-center justify-between text-left"
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <span className="text-sm font-medium" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>{faq.q}</span>
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
                  <p className="pb-4 text-sm" style={{ color: COLORS.text.secondary, fontFamily: fontBody }}>{faq.a}</p>
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
      { num: '01', title: 'Sign up', desc: 'Create your account in seconds.' },
      { num: '02', title: 'Add your work', desc: 'Drop in your projects and content.' },
      { num: '03', title: 'Go live', desc: 'Share your unique portfolio link.' },
    ];
    return (
      <div className="p-6 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest mb-6" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Three steps</p>
        <div className="space-y-3 flex-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 transition-colors cursor-pointer rounded-xl"
              style={{ background: howItWorksStep === i ? COLORS.bg.secondary : 'transparent' }}
              onClick={() => setHowItWorksStep(i)}
            >
              <span
                className="text-xl font-light"
                style={{ color: howItWorksStep === i ? COLORS.accent.primary : COLORS.text.muted, fontFamily: fontDisplay }}
              >
                {step.num}
              </span>
              <div>
                <h4 className="font-medium mb-1" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>{step.title}</h4>
                <p className="text-sm" style={{ color: COLORS.text.tertiary, fontFamily: fontBody }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/signup" className="block mt-4">
          <button
            className="w-full py-3 text-sm font-medium rounded-xl transition-all hover:brightness-110"
            style={{ background: COLORS.accent.primary, color: '#fff', fontFamily: fontBody }}
          >
            Start Now
          </button>
        </Link>
      </div>
    );
  };

  const renderMobileContent = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="relative mb-6">
        <div className="relative w-40 h-[300px] p-1" style={{ background: COLORS.text.primary, borderRadius: '28px' }}>
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 z-10" style={{ background: '#000', borderRadius: '8px' }} />
          <div className="w-full h-full overflow-hidden" style={{ background: COLORS.bg.primary, borderRadius: '24px' }}>
            <div className="h-8 flex items-center justify-center pt-1.5">
              <span className="text-xs font-medium" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>9:41</span>
            </div>
            <div className="px-3 py-3">
              <div className="grid grid-cols-3 gap-3">
                {['◈', '◐', '¶', '◉', '⬡', '✦'].map((sym, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center mb-1" style={{ background: COLORS.bg.secondary, borderRadius: '10px' }}>
                      <span style={{ color: COLORS.accent.primary }}>{sym}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-base text-center" style={{ color: COLORS.text.secondary, fontFamily: fontDisplay, fontStyle: 'italic' }}>
        Automatic iOS interface.
      </p>
      <p className="text-sm text-center mt-1" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>
        Same content. Native feel.
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

  if (!mounted) return <div className="fixed inset-0" style={{ background: COLORS.bg.primary }} />;

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden select-none" style={{ background: COLORS.bg.primary }}>
      {/* Background Image */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${backgroundImage}')` }} />

      {/* Menu Bar - Warm glassmorphism */}
      <header
        className="fixed top-0 left-0 right-0 h-7 z-[200] flex items-center justify-between px-5"
        style={{
          background: 'rgba(250, 250, 249, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${COLORS.window.border}`
        }}
      >
        <div className="flex items-center gap-6">
          <button onClick={() => openWindow('welcome')} style={{ color: COLORS.text.primary }}>
            <span style={{ fontFamily: fontDisplay, fontSize: '14px' }}>Me<span style={{ color: COLORS.accent.primary }}>OS</span></span>
          </button>
          <div className="flex items-center gap-5 text-xs" style={{ color: COLORS.text.secondary, fontFamily: fontBody }}>
            <button onClick={() => openWindow('features')} className="hover:opacity-70 transition-opacity">File</button>
            <button onClick={() => openWindow('help')} className="hover:opacity-70 transition-opacity">Help</button>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login">
            <span className="text-xs cursor-pointer hover:opacity-70 transition-opacity" style={{ color: COLORS.text.secondary, fontFamily: fontBody }}>Sign in</span>
          </Link>
          <Link href="/signup">
            <button
              className="px-3.5 py-1 text-xs font-medium hover:brightness-110 rounded-lg transition-all"
              style={{ background: COLORS.accent.primary, color: '#fff', fontFamily: fontBody }}
            >
              Get Started
            </button>
          </Link>
          <span className="text-xs tabular-nums" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>{currentTime}</span>
        </div>
      </header>

      {/* Desktop Icons */}
      {desktopIcons.map((icon) => {
        const isPressed = pressedIcon === icon.id;
        const IconComp = APP_ICONS[icon.id] || WelcomeIcon;
        const iconBg = ICON_BG[icon.id] || COLORS.bg.secondary;

        return (
          <motion.div
            key={icon.id}
            className="absolute flex flex-col items-center gap-2 cursor-pointer z-10"
            style={{
              left: icon.position.x > 0 ? icon.position.x : undefined,
              right: icon.position.x < 0 ? Math.abs(icon.position.x) : undefined,
              top: icon.position.y,
            }}
            onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
            animate={{ scale: isPressed ? 0.92 : 1 }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-shadow"
              style={{
                background: iconBg,
                boxShadow: isPressed ? COLORS.shadow.soft : COLORS.shadow.medium,
              }}
              whileHover={{ boxShadow: COLORS.shadow.elevated }}
            >
              <IconComp />
            </motion.div>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-md max-w-[80px] truncate"
              style={{
                color: COLORS.text.primary,
                background: 'rgba(250, 250, 249, 0.9)',
                backdropFilter: 'blur(8px)',
                fontFamily: fontBody,
              }}
            >
              {icon.label}
            </span>
          </motion.div>
        );
      })}

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
              background: COLORS.window.bg,
              boxShadow: COLORS.shadow.elevated,
              borderRadius: '12px',
              border: `1px solid ${COLORS.window.border}`,
            }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => focusWindow(win.id)}
          >
            {/* Window Title Bar */}
            <div
              className="h-10 flex items-center px-3.5 cursor-move"
              style={{
                background: COLORS.window.header,
                borderBottom: `1px solid ${COLORS.window.border}`
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
                style={{ color: COLORS.text.secondary, fontFamily: fontBody }}
              >
                {win.title}
              </span>
              <div className="w-14" />
            </div>

            {/* Window Content */}
            <div className="h-[calc(100%-40px)] overflow-hidden" style={{ background: COLORS.window.bg }}>
              {getWindowContent(win.id)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dock */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-2 px-3 py-2"
        style={{
          background: 'rgba(250, 250, 249, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '20px',
          boxShadow: `0 0 0 1px ${COLORS.window.border}, ${COLORS.shadow.medium}`
        }}
      >
        {DOCK_APPS.map((appId) => {
          const win = windows.find(w => w.id === appId);
          const isOpen = win?.isOpen;
          const isHovered = hoveredDock === appId;
          const IconComp = APP_ICONS[appId] || WelcomeIcon;
          const iconBg = ICON_BG[appId] || COLORS.bg.secondary;

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
                    style={{ background: COLORS.text.primary, color: COLORS.bg.primary, fontFamily: fontBody }}
                  >
                    {win?.title || appId}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: COLORS.text.primary }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: iconBg,
                  boxShadow: isHovered ? COLORS.shadow.elevated : COLORS.shadow.soft,
                }}
              >
                <IconComp />
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

        <div className="w-px h-10 mx-1.5 self-center" style={{ background: COLORS.bg.tertiary }} />

        <Link href="/signup">
          <motion.button
            className="px-4 py-2.5 text-xs font-medium rounded-xl"
            style={{
              background: COLORS.accent.primary,
              color: '#fff',
              fontFamily: fontBody,
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
            }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </Link>
      </nav>

      {/* Hint Tooltip */}
      <AnimatePresence>
        {showHint && !hintDismissed && (
          <motion.div
            className="fixed top-12 right-5 z-[300] w-64"
            initial={{ opacity: 0, y: -8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <div
              className="p-4 flex items-start gap-3 rounded-xl"
              style={{
                background: COLORS.window.bg,
                boxShadow: `0 0 0 1px ${COLORS.window.border}, ${COLORS.shadow.medium}`
              }}
            >
              <span className="text-lg" style={{ color: COLORS.accent.primary }}>✦</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-0.5" style={{ color: COLORS.text.primary, fontFamily: fontBody }}>Explore</p>
                <p className="text-xs" style={{ color: COLORS.text.muted, fontFamily: fontBody }}>Click icons or use the dock below.</p>
              </div>
              <button
                onClick={() => { setShowHint(false); setHintDismissed(true); }}
                className="text-lg leading-none hover:opacity-60 transition-opacity"
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
