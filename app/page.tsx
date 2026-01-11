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
// DESIGN TOKENS - Warm Editorial (from HTML mockup)
// =============================================================================

const tokens = {
  // Fonts
  fontSans: '"Inter", system-ui, -apple-system, sans-serif',
  fontSerif: '"Instrument Serif", serif',

  // Easing
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Colors
  bg: '#FAFAF9',
  accent: '#EA580C', // orange-600

  // Stone palette
  stone: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },

  // Glass effects
  windowGlass: {
    background: 'rgba(255, 255, 255, 0.85)',
    blur: 'blur(24px)',
    shadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 1px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.02), 0 16px 32px -4px rgba(0,0,0,0.06), 0 24px 64px -8px rgba(28, 25, 23, 0.04)',
  },

  dockGlass: {
    background: 'rgba(255, 255, 255, 0.7)',
    blur: 'blur(32px)',
    shadow: '0 0 0 1px rgba(255,255,255,0.4) inset, 0 0 0 1px rgba(0,0,0,0.05), 0 12px 24px -6px rgba(0,0,0,0.05)',
  },

  menuBar: {
    background: 'rgba(255, 255, 255, 0.3)',
    blur: 'blur(12px)',
  },
};

// =============================================================================
// DATA
// =============================================================================

const FEATURES_DATA = [
  { icon: 'layout-template', title: 'Drag & Drop Layout', desc: 'Arrange your portfolio windows exactly how you want visitors to see them.' },
  { icon: 'pen-tool', title: 'Editorial Typography', desc: 'Curated font pairings that make your case studies read like a magazine.' },
  { icon: 'smartphone', title: 'Mobile Adaptive', desc: 'Translates the desktop metaphor into a clean feed for smaller screens.' },
  { icon: 'globe', title: 'Custom Domain', desc: 'Connect your own domain with one click. Free SSL included.' },
  { icon: 'bar-chart-3', title: 'Visitor Analytics', desc: 'See which windows are being opened and how long people stay.' },
  { icon: 'moon', title: 'Dark Mode', desc: 'Automatically respects user system preferences. Looks stunning in dark.' },
];

const DESKTOP_ICONS = [
  { id: 'welcome', label: 'Start Here', icon: 'sparkles', bgColor: tokens.stone[100] },
  { id: 'features', label: 'Features', icon: 'layers', bgColor: '#ffffff' },
  { id: 'examples', label: 'Showcase', icon: 'image', bgColor: tokens.stone[50] },
  { id: 'pricing', label: 'Pricing', icon: 'credit-card', bgColor: '#ffffff' },
];

const INITIAL_WINDOWS: WindowState[] = [
  { id: 'welcome', title: 'READ ME', isOpen: true, isMinimized: false, zIndex: 100, position: { x: -1, y: 64 }, size: { width: 640, height: 500 } },
  { id: 'features', title: 'SYSTEM PREFERENCES', isOpen: false, isMinimized: false, zIndex: 98, position: { x: 100, y: 96 }, size: { width: 900, height: 480 } },
  { id: 'pricing', title: 'PLAN', isOpen: false, isMinimized: false, zIndex: 99, position: { x: 600, y: 80 }, size: { width: 400, height: 480 } },
  { id: 'examples', title: 'SHOWCASE', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 300, y: 120 }, size: { width: 520, height: 420 } },
];

// =============================================================================
// SVG ICONS (Lucide-style)
// =============================================================================

const LucideIcon = ({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
        <path d="m22 12.18-8.58 3.91a2 2 0 0 1-1.66 0L3 12.18"/><path d="m22 17.18-8.58 3.91a2 2 0 0 1-1.66 0L3 17.18"/>
      </svg>
    ),
    image: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    ),
    'credit-card': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
    command: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
      </svg>
    ),
    'arrow-right': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
    'settings-2': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
      </svg>
    ),
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
      </svg>
    ),
    'layout-template': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>
      </svg>
    ),
    'pen-tool': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>
      </svg>
    ),
    smartphone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
      </svg>
    ),
    'bar-chart-3': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    ),
    moon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    ),
    wifi: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" x2="12.01" y1="20" y2="20"/>
      </svg>
    ),
    battery: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/>
      </svg>
    ),
    apple: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  };

  return icons[name] || <span>?</span>;
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Noise texture overlay (from mockup)
const NoiseOverlay = () => (
  <div
    className="fixed inset-0 z-50 pointer-events-none"
    style={{
      opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

// Generative gradient wallpaper (from mockup - exact values)
const Wallpaper = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: tokens.bg }}>
    {/* Warm glowing orb top left */}
    <div
      className="absolute rounded-full"
      style={{
        top: '-10%',
        left: '-10%',
        width: '60%',
        height: '60%',
        background: 'linear-gradient(to bottom right, rgba(255, 237, 213, 0.4), rgba(255, 228, 230, 0.3), transparent)',
        filter: 'blur(120px)',
      }}
    />
    {/* Cool calming orb bottom right */}
    <div
      className="absolute rounded-full"
      style={{
        bottom: '0%',
        right: '0%',
        width: '50%',
        height: '50%',
        background: 'linear-gradient(to top left, rgba(231, 229, 228, 0.4), rgba(224, 231, 255, 0.2), transparent)',
        filter: 'blur(100px)',
      }}
    />
    {/* Center highlight */}
    <div
      className="absolute rounded-full"
      style={{
        top: '40%',
        left: '40%',
        width: '30%',
        height: '30%',
        background: 'rgba(255, 255, 255, 0.6)',
        filter: 'blur(80px)',
      }}
    />
  </div>
);

// Desktop icon component (from mockup)
const DesktopIcon = ({
  icon,
  label,
  bgColor,
  onClick,
}: {
  icon: string;
  label: string;
  bgColor: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center gap-2 w-20 focus:outline-none"
  >
    <motion.div
      className="w-14 h-14 rounded-[14px] flex items-center justify-center relative overflow-hidden"
      style={{
        background: bgColor,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid rgba(231, 229, 228, 0.5)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {icon === 'image' && (
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: 'linear-gradient(to top right, rgba(245, 245, 244, 1), transparent)' }}
        />
      )}
      <LucideIcon name={icon} size={24} className="text-stone-700 relative z-10" />
    </motion.div>
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors"
      style={{
        fontFamily: tokens.fontSans,
        color: tokens.stone[600],
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        textShadow: '0 1px 2px rgba(255,255,255,0.5)',
      }}
    >
      {label}
    </span>
  </button>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [highestZ, setHighestZ] = useState(100);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    windowId: null,
    startPos: { x: 0, y: 0 },
    startWindowPos: { x: 0, y: 0 },
  });
  const [currentTime, setCurrentTime] = useState('');
  const [hoveredDock, setHoveredDock] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load fonts
  useEffect(() => {
    const instrumentSerif = document.createElement('link');
    instrumentSerif.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';
    instrumentSerif.rel = 'stylesheet';
    document.head.appendChild(instrumentSerif);

    const inter = document.createElement('link');
    inter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap';
    inter.rel = 'stylesheet';
    document.head.appendChild(inter);
  }, []);

  // Time display
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Center welcome window on mount
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const welcomeWin = INITIAL_WINDOWS.find(w => w.id === 'welcome');
      if (welcomeWin && welcomeWin.position.x === -1) {
        const centerX = Math.max(100, (window.innerWidth - welcomeWin.size.width) / 2);
        setWindows(prev => prev.map(w =>
          w.id === 'welcome' ? { ...w, position: { ...w.position, x: centerX } } : w
        ));
      }
    }
  }, [mounted]);

  // Window management
  const openWindow = useCallback((id: string) => {
    setHighestZ((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          // Position windows with some offset if multiple open
          let newPos = w.position;
          if (!w.isOpen && typeof window !== 'undefined') {
            const offset = Math.random() * 40 - 20;
            newPos = {
              x: Math.max(100, window.innerWidth / 3 + offset),
              y: 100 + offset,
            };
          }
          return { ...w, isOpen: true, isMinimized: false, zIndex: highestZ + 1, position: newPos };
        }
        return w;
      })
    );
  }, [highestZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setHighestZ((prev) => prev + 1);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: highestZ + 1 } : w)));
  }, [highestZ]);

  // Drag handling
  const handleWindowMouseDown = useCallback(
    (e: React.MouseEvent, windowId: string) => {
      const win = windows.find((w) => w.id === windowId);
      if (!win) return;
      focusWindow(windowId);
      setDragState({
        isDragging: true,
        windowId,
        startPos: { x: e.clientX, y: e.clientY },
        startWindowPos: { x: win.position.x, y: win.position.y },
      });
    },
    [windows, focusWindow]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragState.isDragging && dragState.windowId) {
        const dx = e.clientX - dragState.startPos.x;
        const dy = e.clientY - dragState.startPos.y;
        setWindows((prev) =>
          prev.map((w) =>
            w.id === dragState.windowId
              ? {
                  ...w,
                  position: {
                    x: Math.max(0, dragState.startWindowPos.x + dx),
                    y: Math.max(36, dragState.startWindowPos.y + dy),
                  },
                }
              : w
          )
        );
      }
    },
    [dragState]
  );

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
  // WINDOW CONTENT RENDERERS
  // =============================================================================

  const renderWelcomeContent = () => (
    <div className="flex-1 overflow-y-auto p-12 flex flex-col justify-center items-center text-center">
      {/* Icon */}
      <div
        className="mb-8 p-3 rounded-2xl"
        style={{ background: tokens.stone[100], boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}
      >
        <LucideIcon name="command" size={32} className="text-stone-800" />
      </div>

      {/* Headline */}
      <h1
        className="text-5xl sm:text-6xl mb-6 leading-[0.9]"
        style={{
          fontFamily: tokens.fontSerif,
          color: tokens.stone[900],
          letterSpacing: '-0.02em',
        }}
      >
        Your portfolio,<br />reimagined as an OS.
      </h1>

      {/* Subhead */}
      <p
        className="text-lg max-w-md mx-auto leading-relaxed mb-10"
        style={{
          fontFamily: tokens.fontSans,
          color: tokens.stone[500],
          fontWeight: 300,
        }}
      >
        MeOS transforms your creative work into an immersive desktop experience. Quiet, tactile, and deeply personal.
      </p>

      {/* CTA Buttons */}
      <div className="flex items-center gap-4">
        <Link href="/signup">
          <motion.button
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium"
            style={{
              fontFamily: tokens.fontSans,
              background: tokens.stone[900],
              color: tokens.stone[50],
              boxShadow: '0 4px 14px -4px rgba(28, 25, 23, 0.2)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
            <LucideIcon name="arrow-right" size={14} />
          </motion.button>
        </Link>
        <button
          onClick={() => openWindow('features')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-stone-50"
          style={{
            fontFamily: tokens.fontSans,
            color: tokens.stone[600],
            background: '#ffffff',
            border: `1px solid ${tokens.stone[200]}`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          Explore Features
        </button>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'rgba(250, 250, 249, 0.5)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {FEATURES_DATA.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl transition-shadow hover:shadow-md"
              style={{
                background: '#ffffff',
                border: `1px solid rgba(231, 229, 228, 0.6)`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: tokens.stone[100] }}
              >
                <LucideIcon name={feature.icon} size={20} className="text-stone-700" />
              </div>
              <h3
                className="font-medium mb-2"
                style={{ fontFamily: tokens.fontSans, color: tokens.stone[900] }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: tokens.fontSans, color: tokens.stone[500] }}
              >
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPricingContent = () => (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl"
          style={{ fontFamily: tokens.fontSerif, color: tokens.stone[900] }}
        >
          Pro License
        </h2>
        <p
          className="text-sm mt-2"
          style={{ fontFamily: tokens.fontSans, color: tokens.stone[500] }}
        >
          One simple payment. Lifetime access.
        </p>
      </div>

      {/* Price card */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{
          background: '#ffffff',
          border: `1px solid rgba(231, 229, 228, 0.6)`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-baseline justify-center gap-1 mb-4">
          <span
            className="text-3xl font-medium"
            style={{ fontFamily: tokens.fontSans, color: tokens.stone[900] }}
          >
            $12
          </span>
          <span
            className="text-sm"
            style={{ fontFamily: tokens.fontSans, color: tokens.stone[400] }}
          >
            / month
          </span>
        </div>

        <ul className="space-y-3 mb-6">
          {['Unlimited Projects', 'Custom Domain', 'Analytics', 'SEO Optimization'].map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: tokens.stone[600] }}>
              <LucideIcon name="check" size={14} className="text-stone-800" />
              <span style={{ fontFamily: tokens.fontSans }}>{feature}</span>
            </li>
          ))}
        </ul>

        <Link href="/signup" className="block">
          <button
            className="w-full h-10 rounded-md text-sm font-medium transition-colors hover:opacity-90"
            style={{
              fontFamily: tokens.fontSans,
              background: tokens.stone[900],
              color: '#ffffff',
            }}
          >
            Upgrade to Pro
          </button>
        </Link>
      </div>

      <p
        className="text-center text-xs"
        style={{ fontFamily: tokens.fontSans, color: tokens.stone[400] }}
      >
        Includes 14-day money-back guarantee.
      </p>
    </div>
  );

  const renderExamplesContent = () => (
    <div className="p-6 h-full overflow-auto">
      <p
        className="text-xs uppercase tracking-widest mb-6"
        style={{ fontFamily: tokens.fontSans, color: tokens.stone[400] }}
      >
        Featured Portfolios
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'Sarah K.', role: 'Product', initial: 'S' },
          { name: 'Marcus C.', role: 'Brand', initial: 'M' },
          { name: 'Yuki T.', role: 'UX', initial: 'Y' },
          { name: 'Alex R.', role: 'Motion', initial: 'A' },
          { name: 'Priya P.', role: 'Photo', initial: 'P' },
          { name: 'Tom A.', role: '3D', initial: 'T' },
        ].map((ex, i) => (
          <div key={i} className="group cursor-pointer">
            <div
              className="aspect-square mb-2 flex items-center justify-center rounded-xl transition-transform group-hover:scale-[1.02]"
              style={{ background: tokens.stone[100] }}
            >
              <span
                className="text-2xl"
                style={{ fontFamily: tokens.fontSerif, color: tokens.stone[400] }}
              >
                {ex.initial}
              </span>
            </div>
            <p
              className="text-sm font-medium"
              style={{ fontFamily: tokens.fontSans, color: tokens.stone[900] }}
            >
              {ex.name}
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: tokens.fontSans, color: tokens.stone[400] }}
            >
              {ex.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const getWindowContent = (id: string) => {
    switch (id) {
      case 'welcome': return renderWelcomeContent();
      case 'features': return renderFeaturesContent();
      case 'pricing': return renderPricingContent();
      case 'examples': return renderExamplesContent();
      default: return null;
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (!mounted) return <div className="fixed inset-0" style={{ background: tokens.bg }} />;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        fontFamily: tokens.fontSans,
        color: tokens.stone[800],
      }}
    >
      {/* Wallpaper */}
      <Wallpaper />

      {/* Noise texture */}
      <NoiseOverlay />

      {/* Menu Bar (from mockup: h-9 bg-white/30 backdrop-blur-md) */}
      <header
        className="fixed top-0 inset-x-0 h-9 z-[60] flex items-center justify-between px-5 text-xs font-medium select-none"
        style={{
          background: tokens.menuBar.background,
          backdropFilter: tokens.menuBar.blur,
          WebkitBackdropFilter: tokens.menuBar.blur,
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          color: tokens.stone[600],
        }}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => openWindow('welcome')}
            className="flex items-center gap-1 group cursor-pointer"
            style={{ color: tokens.stone[900] }}
          >
            <LucideIcon name="apple" size={14} />
            <span
              className="ml-1 group-hover:opacity-70 transition-opacity"
              style={{ fontFamily: tokens.fontSerif, fontSize: 16, letterSpacing: '-0.01em' }}
            >
              MeOS
            </span>
          </button>
          <nav className="hidden sm:flex gap-5">
            <button className="hover:text-stone-900 transition-colors">File</button>
            <button className="hover:text-stone-900 transition-colors">Edit</button>
            <button className="hover:text-stone-900 transition-colors">View</button>
            <button className="hover:text-stone-900 transition-colors">Window</button>
            <button className="hover:text-stone-900 transition-colors">Help</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <LucideIcon name="wifi" size={14} className="text-stone-400" />
            <LucideIcon name="battery" size={14} className="text-stone-400" />
          </div>
          <span className="tabular-nums">{currentTime}</span>
        </div>
      </header>

      {/* Desktop Grid (Icons) - from mockup */}
      <main className="absolute inset-0 pt-12 px-6 z-10 pointer-events-none">
        <div className="grid grid-flow-col grid-rows-6 gap-y-6 gap-x-6 w-max pointer-events-auto items-start justify-items-center">
          {DESKTOP_ICONS.map((item) => (
            <DesktopIcon
              key={item.id}
              icon={item.icon}
              label={item.label}
              bgColor={item.bgColor}
              onClick={() => openWindow(item.id)}
            />
          ))}
        </div>
      </main>

      {/* Windows Container */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {windows
            .filter((w) => w.isOpen && !w.isMinimized)
            .map((win) => (
              <motion.div
                key={win.id}
                className="absolute rounded-xl overflow-hidden pointer-events-auto flex flex-col"
                style={{
                  left: win.position.x,
                  top: win.position.y,
                  width: win.size.width,
                  height: win.id === 'pricing' ? 'auto' : win.size.height,
                  minHeight: win.id === 'welcome' ? 500 : undefined,
                  zIndex: win.zIndex,
                  background: tokens.windowGlass.background,
                  backdropFilter: tokens.windowGlass.blur,
                  WebkitBackdropFilter: tokens.windowGlass.blur,
                  boxShadow: tokens.windowGlass.shadow,
                }}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.4,
                  ease: [0.16, 1, 0.3, 1] // ease-out-expo
                }}
                onClick={() => focusWindow(win.id)}
              >
                {/* Title Bar (from mockup: h-10 bg-white/50 border-b border-stone-100) */}
                <div
                  className="h-10 flex items-center px-4 justify-between cursor-grab active:cursor-grabbing select-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderBottom: `1px solid ${tokens.stone[100]}`,
                  }}
                  onMouseDown={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    handleWindowMouseDown(e, win.id);
                  }}
                >
                  {/* Traffic lights (from mockup: w-3 h-3 rounded-full bg-stone-300) */}
                  <div className="flex gap-2 group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(win.id);
                      }}
                      className="w-3 h-3 rounded-full transition-colors"
                      style={{ background: tokens.stone[300] }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = tokens.stone[400])}
                      onMouseLeave={(e) => (e.currentTarget.style.background = tokens.stone[300])}
                    />
                    <div className="w-3 h-3 rounded-full" style={{ background: tokens.stone[200] }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: tokens.stone[200] }} />
                  </div>

                  {/* Title */}
                  <span
                    className="text-xs font-medium tracking-wide uppercase"
                    style={{ color: tokens.stone[400] }}
                  >
                    {win.title}
                  </span>

                  {/* Spacer for centering */}
                  <div className="w-10" />
                </div>

                {/* Content */}
                {getWindowContent(win.id)}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Dock (from mockup) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <nav
          className="px-4 py-3 rounded-2xl flex items-center gap-4"
          style={{
            background: tokens.dockGlass.background,
            backdropFilter: tokens.dockGlass.blur,
            WebkitBackdropFilter: tokens.dockGlass.blur,
            boxShadow: tokens.dockGlass.shadow,
          }}
        >
          {/* Home icon - dark bg */}
          <motion.button
            className="group relative flex flex-col items-center"
            onClick={() => openWindow('welcome')}
            onMouseEnter={() => setHoveredDock('welcome')}
            onMouseLeave={() => setHoveredDock(null)}
            animate={{ y: hoveredDock === 'welcome' ? -8 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: tokens.stone[800],
                boxShadow: '0 4px 14px -4px rgba(28, 25, 23, 0.2)',
              }}
            >
              <LucideIcon name="home" size={22} className="text-white" />
            </div>
            {windows.find(w => w.id === 'welcome')?.isOpen && (
              <div
                className="absolute -bottom-2 w-1 h-1 rounded-full"
                style={{ background: tokens.stone[400] }}
              />
            )}
          </motion.button>

          {/* Separator */}
          <div className="w-px h-8 mx-1" style={{ background: 'rgba(168, 162, 158, 0.5)' }} />

          {/* Settings icon */}
          <motion.button
            className="group relative flex flex-col items-center"
            onClick={() => openWindow('features')}
            onMouseEnter={() => setHoveredDock('features')}
            onMouseLeave={() => setHoveredDock(null)}
            animate={{ y: hoveredDock === 'features' ? -8 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: '#ffffff',
                border: `1px solid rgba(231, 229, 228, 0.5)`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <LucideIcon name="settings-2" size={22} className="text-stone-600" />
            </div>
            {windows.find(w => w.id === 'features')?.isOpen && (
              <div
                className="absolute -bottom-2 w-1 h-1 rounded-full"
                style={{ background: tokens.stone[400] }}
              />
            )}
          </motion.button>

          {/* Grid icon */}
          <motion.button
            className="group relative flex flex-col items-center"
            onClick={() => openWindow('examples')}
            onMouseEnter={() => setHoveredDock('examples')}
            onMouseLeave={() => setHoveredDock(null)}
            animate={{ y: hoveredDock === 'examples' ? -8 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: '#ffffff',
                border: `1px solid rgba(231, 229, 228, 0.5)`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <LucideIcon name="grid" size={22} className="text-stone-600" />
            </div>
            {windows.find(w => w.id === 'examples')?.isOpen && (
              <div
                className="absolute -bottom-2 w-1 h-1 rounded-full"
                style={{ background: tokens.stone[400] }}
              />
            )}
          </motion.button>

          {/* Credit card icon */}
          <motion.button
            className="group relative flex flex-col items-center"
            onClick={() => openWindow('pricing')}
            onMouseEnter={() => setHoveredDock('pricing')}
            onMouseLeave={() => setHoveredDock(null)}
            animate={{ y: hoveredDock === 'pricing' ? -8 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: '#ffffff',
                border: `1px solid rgba(231, 229, 228, 0.5)`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <LucideIcon name="credit-card" size={22} className="text-stone-600" />
            </div>
            {windows.find(w => w.id === 'pricing')?.isOpen && (
              <div
                className="absolute -bottom-2 w-1 h-1 rounded-full"
                style={{ background: tokens.stone[400] }}
              />
            )}
          </motion.button>

          {/* Separator */}
          <div className="w-px h-8 mx-1" style={{ background: 'rgba(168, 162, 158, 0.5)' }} />

          {/* CTA Button (from mockup: bg-orange-600/90) */}
          <Link href="/signup">
            <motion.button
              className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-medium"
              style={{
                fontFamily: tokens.fontSans,
                background: 'rgba(234, 88, 12, 0.9)',
                color: '#ffffff',
                boxShadow: '0 4px 14px -4px rgba(234, 88, 12, 0.4)',
              }}
              whileHover={{ y: -4, background: 'rgba(234, 88, 12, 1)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Sign Up
            </motion.button>
          </Link>
        </nav>
      </div>
    </div>
  );
}
