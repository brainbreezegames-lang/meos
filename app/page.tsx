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
// DESIGN SYSTEM - Warm Editorial
// =============================================================================

const COLORS = {
  bg: {
    primary: '#FAF7F2',
    secondary: '#F5F0E8',
    tertiary: '#EDE6DB',
  },
  text: {
    primary: '#2D2A26',
    secondary: '#5C564D',
    tertiary: '#8A8279',
    muted: '#B5AFA5',
  },
  accent: {
    primary: '#C4634F',
    hover: '#B85A47',
  },
  window: {
    bg: '#FFFDF9',
    header: '#FAF7F2',
    border: '#E8E2D9',
  },
  traffic: {
    close: '#FF5F57',
    minimize: '#FFBD2E',
    maximize: '#28CA41',
  }
};

// =============================================================================
// CUSTOM ICONS - Warm Editorial Style
// Hand-crafted icons with terracotta accent, no generic library icons
// =============================================================================

const WelcomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="6" width="20" height="16" rx="2" stroke="#C4634F" strokeWidth="1.5" fill="none" />
    <path d="M4 10L14 16L24 10" stroke="#C4634F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FeaturesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="9" stroke="#C4634F" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="14" r="3" fill="#C4634F" />
    <path d="M14 5V8M14 20V23M5 14H8M20 14H23" stroke="#C4634F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ExamplesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="2" fill="#C4634F" fillOpacity="0.2" stroke="#C4634F" strokeWidth="1.5" />
    <rect x="16" y="4" width="8" height="8" rx="2" stroke="#C4634F" strokeWidth="1.5" />
    <rect x="4" y="16" width="8" height="8" rx="2" stroke="#C4634F" strokeWidth="1.5" />
    <rect x="16" y="16" width="8" height="8" rx="2" fill="#C4634F" fillOpacity="0.2" stroke="#C4634F" strokeWidth="1.5" />
  </svg>
);

const PricingIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="3" y="7" width="22" height="14" rx="2" stroke="#C4634F" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="14" r="4" stroke="#C4634F" strokeWidth="1.5" />
    <path d="M14 12V16M12.5 13.5H15.5" stroke="#C4634F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ReviewsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M6 6H22V18H13L8 22V18H6V6Z" stroke="#C4634F" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    <circle cx="10" cy="12" r="1.5" fill="#C4634F" />
    <circle cx="14" cy="12" r="1.5" fill="#C4634F" />
    <circle cx="18" cy="12" r="1.5" fill="#C4634F" />
  </svg>
);

const HelpIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="10" stroke="#C4634F" strokeWidth="1.5" fill="none" />
    <path d="M11 11C11 9.34 12.34 8 14 8C15.66 8 17 9.34 17 11C17 12.66 15.66 14 14 14V16" stroke="#C4634F" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="19" r="1" fill="#C4634F" />
  </svg>
);

const HowItWorksIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="7" cy="14" r="3" stroke="#C4634F" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="14" r="3" fill="#C4634F" fillOpacity="0.3" stroke="#C4634F" strokeWidth="1.5" />
    <circle cx="21" cy="14" r="3" fill="#C4634F" />
    <path d="M10 14H11M17 14H18" stroke="#C4634F" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MobileIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="8" y="3" width="12" height="22" rx="2" stroke="#C4634F" strokeWidth="1.5" fill="none" />
    <path d="M12 5H16" stroke="#C4634F" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="21" r="1.5" fill="#C4634F" />
  </svg>
);

// Icon config for each app - maps to custom components
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

// Background colors for icon containers - warm paper tones
const ICON_BG: Record<string, string> = {
  welcome: '#F5EDE4',
  features: '#EDE4DB',
  examples: '#F0E8DF',
  pricing: '#EBE3DA',
  reviews: '#F3EBE2',
  help: '#EEE6DD',
  howItWorks: '#F2EAE1',
  mobile: '#ECE4DB',
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
  { icon: '◈', title: 'Themes', description: 'Four themes that transform the feel.', tag: 'Style' },
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
  { id: 'welcome', title: 'Welcome', isOpen: true, isMinimized: false, zIndex: 100, position: { x: 80, y: 60 }, size: { width: 380, height: 460 } },
  { id: 'features', title: 'Features', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 160, y: 80 }, size: { width: 500, height: 420 } },
  { id: 'examples', title: 'Examples', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 100 }, size: { width: 520, height: 380 } },
  { id: 'pricing', title: 'Pricing', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 140, y: 90 }, size: { width: 460, height: 440 } },
  { id: 'reviews', title: 'Reviews', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 220, y: 70 }, size: { width: 400, height: 400 } },
  { id: 'help', title: 'FAQ', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 180, y: 110 }, size: { width: 420, height: 380 } },
  { id: 'howItWorks', title: 'How It Works', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 240, y: 80 }, size: { width: 380, height: 340 } },
  { id: 'mobile', title: 'Mobile', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 300, y: 60 }, size: { width: 320, height: 460 } },
];

// Scattered desktop icons
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

  // Background: Upload 2560x1440 (16:9) image to /public/bg.jpg
  const backgroundImage = '/bg.jpg';

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
        <div className="mb-6">
          <h1 className="text-3xl tracking-tight" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif' }}>
            Me<span style={{ color: COLORS.accent.primary }}>OS</span>
          </h1>
        </div>
        <p className="text-base leading-relaxed mb-5" style={{ color: COLORS.text.secondary, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          The portfolio that feels<br />like home.
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: COLORS.text.tertiary }}>
          You&apos;re experiencing it now. Click the icons. Open windows. Drag them around.
        </p>
        <div className="flex items-center gap-5 text-xs mb-6" style={{ color: COLORS.text.tertiary }}>
          <div>
            <span className="text-base font-light" style={{ color: COLORS.text.primary }}>2.4k</span>
            <span className="ml-1">designers</span>
          </div>
          <div className="w-px h-3" style={{ background: COLORS.text.muted }} />
          <div>
            <span className="text-base font-light" style={{ color: COLORS.text.primary }}>4.9</span>
            <span className="ml-1">rating</span>
          </div>
        </div>
      </div>
      <div>
        <Link href="/signup" className="block">
          <button className="w-full py-3.5 text-sm font-medium tracking-wide transition-all hover:brightness-110 active:scale-[0.98]" style={{ background: COLORS.accent.primary, color: '#fff', borderRadius: '10px' }}>
            Create Your Desktop
          </button>
        </Link>
        <p className="text-center text-xs mt-3" style={{ color: COLORS.text.muted }}>Free forever · No credit card</p>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="h-full overflow-auto">
      {selectedFeature === null ? (
        <div className="p-5">
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: COLORS.text.tertiary }}>Everything you need</p>
          <div className="space-y-0.5">
            {FEATURES_DATA.map((feature, i) => (
              <button key={i} onClick={() => setSelectedFeature(i)} className="w-full flex items-center gap-3 p-3 text-left transition-all hover:bg-[#F5F0E8] group rounded-lg">
                <span className="text-base w-5" style={{ color: COLORS.accent.primary }}>{feature.icon}</span>
                <span className="flex-1 text-sm font-medium" style={{ color: COLORS.text.primary }}>{feature.title}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: COLORS.text.tertiary, background: COLORS.bg.secondary }}>{feature.tag}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <button onClick={() => setSelectedFeature(null)} className="text-sm mb-6" style={{ color: COLORS.accent.primary }}>← Back</button>
          <span className="text-2xl block mb-3" style={{ color: COLORS.accent.primary }}>{FEATURES_DATA[selectedFeature].icon}</span>
          <h3 className="text-lg mb-2" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif' }}>{FEATURES_DATA[selectedFeature].title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.text.secondary }}>{FEATURES_DATA[selectedFeature].description}</p>
        </div>
      )}
    </div>
  );

  const renderExamplesContent = () => (
    <div className="p-5 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-5" style={{ color: COLORS.text.tertiary }}>Real portfolios</p>
      <div className="grid grid-cols-3 gap-3">
        {EXAMPLES_DATA.map((ex, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-square mb-2 flex items-center justify-center transition-all group-hover:scale-[1.02] rounded-xl" style={{ background: COLORS.bg.tertiary }}>
              <span className="text-xl font-light" style={{ color: COLORS.text.tertiary, fontFamily: 'Georgia, serif' }}>{ex.initial}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>{ex.name}</p>
            <p className="text-xs" style={{ color: COLORS.text.tertiary }}>{ex.role}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricingContent = () => (
    <div className="p-5 h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="p-4 flex flex-col rounded-xl" style={{ background: COLORS.bg.secondary }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.text.tertiary }}>Free</p>
          <span className="text-2xl font-light mb-3" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif' }}>$0</span>
          <ul className="space-y-2 flex-1 text-sm" style={{ color: COLORS.text.secondary }}>
            {['Full desktop', '5 projects', 'MeOS subdomain', 'Mobile version'].map((f, i) => (
              <li key={i} className="flex items-center gap-2"><span style={{ color: COLORS.accent.primary }}>·</span>{f}</li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-3">
            <button className="w-full py-2 text-sm font-medium rounded-lg" style={{ border: `1px solid ${COLORS.text.muted}`, color: COLORS.text.primary }}>Get Started</button>
          </Link>
        </div>
        <div className="p-4 flex flex-col rounded-xl" style={{ background: COLORS.text.primary }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.bg.tertiary }}>Pro</p>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded" style={{ background: COLORS.accent.primary, color: '#fff' }}>Popular</span>
          </div>
          <span className="text-2xl font-light mb-3" style={{ color: COLORS.bg.primary, fontFamily: 'Georgia, serif' }}>$12<span className="text-sm ml-1" style={{ color: COLORS.text.muted }}>/mo</span></span>
          <ul className="space-y-2 flex-1 text-sm" style={{ color: COLORS.bg.tertiary }}>
            {['Everything free', 'Unlimited projects', 'Custom domain', 'Analytics', 'No branding'].map((f, i) => (
              <li key={i} className="flex items-center gap-2"><span style={{ color: COLORS.accent.primary }}>·</span>{f}</li>
            ))}
          </ul>
          <Link href="/signup" className="block mt-3">
            <button className="w-full py-2 text-sm font-medium rounded-lg" style={{ background: COLORS.bg.primary, color: COLORS.text.primary }}>Go Pro</button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="p-5 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-5" style={{ color: COLORS.text.tertiary }}>What they say</p>
      <div className="space-y-5">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div key={i}>
            <p className="text-sm leading-relaxed mb-2" style={{ color: COLORS.text.primary, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center text-xs font-medium rounded" style={{ background: COLORS.bg.tertiary, color: COLORS.text.secondary }}>{t.name.charAt(0)}</div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>{t.name}</p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHelpContent = () => (
    <div className="p-5 h-full overflow-auto">
      <p className="text-xs uppercase tracking-widest mb-5" style={{ color: COLORS.text.tertiary }}>Questions</p>
      <div className="space-y-0">
        {FAQ_DATA.map((faq, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${COLORS.bg.tertiary}` }}>
            <button className="w-full py-3 flex items-center justify-between text-left" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
              <span className="text-sm font-medium" style={{ color: COLORS.text.primary }}>{faq.q}</span>
              <span className="text-base" style={{ color: COLORS.text.tertiary, transform: expandedFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
            </button>
            <AnimatePresence>
              {expandedFaq === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <p className="pb-3 text-sm" style={{ color: COLORS.text.secondary }}>{faq.a}</p>
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
      { num: '01', title: 'Sign up', desc: 'Create your account.' },
      { num: '02', title: 'Add your work', desc: 'Drop in projects.' },
      { num: '03', title: 'Go live', desc: 'Share your link.' },
    ];
    return (
      <div className="p-5 h-full flex flex-col">
        <p className="text-xs uppercase tracking-widest mb-5" style={{ color: COLORS.text.tertiary }}>Three steps</p>
        <div className="space-y-3 flex-1">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 p-3 transition-colors cursor-pointer rounded-lg" style={{ background: howItWorksStep === i ? COLORS.bg.secondary : 'transparent' }} onClick={() => setHowItWorksStep(i)}>
              <span className="text-lg font-light" style={{ color: howItWorksStep === i ? COLORS.accent.primary : COLORS.text.muted, fontFamily: 'Georgia, serif' }}>{step.num}</span>
              <div>
                <h4 className="font-medium mb-0.5" style={{ color: COLORS.text.primary }}>{step.title}</h4>
                <p className="text-sm" style={{ color: COLORS.text.tertiary }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/signup" className="block mt-3">
          <button className="w-full py-2.5 text-sm font-medium rounded-lg" style={{ background: COLORS.accent.primary, color: '#fff' }}>Start Now</button>
        </Link>
      </div>
    );
  };

  const renderMobileContent = () => (
    <div className="flex flex-col items-center justify-center h-full p-5">
      <div className="relative mb-5">
        <div className="relative w-36 h-[280px] p-1" style={{ background: COLORS.text.primary, borderRadius: '24px' }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 z-10" style={{ background: '#000', borderRadius: '6px' }} />
          <div className="w-full h-full overflow-hidden" style={{ background: COLORS.bg.primary, borderRadius: '20px' }}>
            <div className="h-7 flex items-center justify-center pt-1">
              <span className="text-xs font-medium" style={{ color: COLORS.text.primary }}>9:41</span>
            </div>
            <div className="px-3 py-2">
              <div className="grid grid-cols-3 gap-2">
                {['◈', '◐', '¶', '◉', '⬡', '✦'].map((sym, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-9 h-9 flex items-center justify-center mb-1" style={{ background: COLORS.bg.tertiary, borderRadius: '8px' }}>
                      <span style={{ color: COLORS.accent.primary }}>{sym}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-center" style={{ color: COLORS.text.secondary }}>
        Automatic iOS interface.<br /><span style={{ color: COLORS.text.tertiary }}>Same content. Native feel.</span>
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
      {/* Background - your image at /public/bg.jpg */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${backgroundImage}')` }} />

      {/* Menu Bar */}
      <header className="fixed top-0 left-0 right-0 h-7 z-[200] flex items-center justify-between px-5" style={{ background: 'rgba(255,253,249,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${COLORS.window.border}` }}>
        <div className="flex items-center gap-6">
          <button onClick={() => openWindow('welcome')} style={{ color: COLORS.text.primary }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px' }}>Me<span style={{ color: COLORS.accent.primary }}>OS</span></span>
          </button>
          <div className="flex items-center gap-5 text-xs" style={{ color: COLORS.text.secondary }}>
            <button onClick={() => openWindow('features')} className="hover:opacity-70 transition-opacity">File</button>
            <button onClick={() => openWindow('help')} className="hover:opacity-70 transition-opacity">Help</button>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login"><span className="text-xs cursor-pointer hover:opacity-70" style={{ color: COLORS.text.secondary }}>Sign in</span></Link>
          <Link href="/signup">
            <button className="px-3 py-1 text-xs font-medium hover:brightness-110 rounded-md" style={{ background: COLORS.accent.primary, color: '#fff' }}>Get Started</button>
          </Link>
          <span className="text-xs tabular-nums" style={{ color: COLORS.text.tertiary }}>{currentTime}</span>
        </div>
      </header>

      {/* Desktop Icons */}
      {desktopIcons.map((icon) => {
        const isPressed = pressedIcon === icon.id;
        const IconComp = APP_ICONS[icon.id] || WelcomeIcon;
        const iconBg = ICON_BG[icon.id] || COLORS.bg.tertiary;

        return (
          <motion.div
            key={icon.id}
            className="absolute flex flex-col items-center gap-1.5 cursor-pointer z-10"
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
              className="w-14 h-14 rounded-[14px] flex items-center justify-center transition-shadow"
              style={{
                background: iconBg,
                boxShadow: isPressed ? '0 1px 4px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
              whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
            >
              <IconComp />
            </motion.div>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded max-w-[72px] truncate" style={{ color: COLORS.text.primary, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
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
              boxShadow: '0 20px 40px -12px rgba(45, 42, 38, 0.18), 0 0 0 1px rgba(232, 226, 217, 1)',
              borderRadius: '10px',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 3 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.18, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => focusWindow(win.id)}
          >
            <div className="h-9 flex items-center px-3 cursor-move" style={{ background: COLORS.window.header, borderBottom: `1px solid ${COLORS.window.border}` }} onMouseDown={(e) => handleWindowMouseDown(e, win.id)}>
              <div className="flex items-center gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-3 h-3 rounded-full hover:brightness-90 flex items-center justify-center group" style={{ background: COLORS.traffic.close }}>
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold" style={{ color: 'rgba(0,0,0,0.4)' }}>×</span>
                </button>
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.traffic.minimize }} />
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS.traffic.maximize }} />
              </div>
              <span className="flex-1 text-center text-xs font-medium pointer-events-none" style={{ color: COLORS.text.secondary }}>{win.title}</span>
              <div className="w-12" />
            </div>
            <div className="h-[calc(100%-36px)] overflow-hidden" style={{ background: COLORS.window.bg }}>
              {getWindowContent(win.id)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dock */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-1.5 px-2.5 py-1.5" style={{ background: 'rgba(255,253,249,0.75)', backdropFilter: 'blur(20px) saturate(180%)', borderRadius: '16px', boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 6px 24px -6px rgba(45, 42, 38, 0.12)' }}>
        {DOCK_APPS.map((appId) => {
          const win = windows.find(w => w.id === appId);
          const isOpen = win?.isOpen;
          const isHovered = hoveredDock === appId;
          const IconComp = APP_ICONS[appId] || WelcomeIcon;
          const iconBg = ICON_BG[appId] || COLORS.bg.tertiary;

          return (
            <motion.button
              key={appId}
              className="relative flex flex-col items-center"
              onClick={() => isOpen ? focusWindow(appId) : openWindow(appId)}
              onMouseEnter={() => setHoveredDock(appId)}
              onMouseLeave={() => setHoveredDock(null)}
              animate={{ y: isHovered ? -10 : 0, scale: isHovered ? 1.2 : 1 }}
              whileTap={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    className="absolute -top-9 px-2.5 py-1 text-xs font-medium whitespace-nowrap rounded-md"
                    style={{ background: COLORS.text.primary, color: COLORS.bg.primary }}
                  >
                    {win?.title || appId}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: COLORS.text.primary }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: iconBg,
                  boxShadow: isHovered ? '0 8px 20px -4px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <IconComp />
              </motion.div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div className="absolute -bottom-1 w-1 h-1 rounded-full" style={{ background: COLORS.text.secondary }} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        <div className="w-px h-9 mx-1 self-center" style={{ background: COLORS.window.border }} />

        <Link href="/signup">
          <motion.button className="px-3.5 py-2 text-xs font-medium rounded-lg" style={{ background: COLORS.accent.primary, color: '#fff' }} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.98 }}>
            Get Started
          </motion.button>
        </Link>
      </nav>

      {/* Hint */}
      <AnimatePresence>
        {showHint && !hintDismissed && (
          <motion.div className="fixed top-12 right-5 z-[300] w-60" initial={{ opacity: 0, y: -6, x: 6 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -3 }}>
            <div className="p-3.5 flex items-start gap-2.5 rounded-xl" style={{ background: COLORS.window.bg, boxShadow: `0 0 0 1px ${COLORS.window.border}, 0 10px 24px -6px rgba(45, 42, 38, 0.12)` }}>
              <span className="text-lg" style={{ color: COLORS.accent.primary }}>✦</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-0.5" style={{ color: COLORS.text.primary }}>Explore</p>
                <p className="text-xs" style={{ color: COLORS.text.tertiary }}>Click icons or use the dock.</p>
              </div>
              <button onClick={() => { setShowHint(false); setHintDismissed(true); }} className="text-base leading-none hover:opacity-60" style={{ color: COLORS.text.muted }}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
