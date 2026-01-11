'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Image as ImageIcon, CreditCard, Command, ArrowRight, Apple, Wifi, BatteryMedium, Check, HelpCircle, MessageSquare } from 'lucide-react';
import Wallpaper from '@/components/desktop/Wallpaper';
import LandingDock from '@/components/desktop/LandingDock';
import DesktopIcon from '@/components/desktop/DesktopIcon';

// =============================================================================
// DESIGN TOKENS - macOS Atomic Uniformity
// =============================================================================

const DESIGN = {
  // Radii - consistent across all elements
  radius: {
    window: 10,      // macOS Big Sur window corners
    button: 6,
    input: 6,
    icon: 8,
    pill: 9999,
  },
  // Spacing - 4px base unit
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  // Title bar
  titleBar: {
    height: 44,
    trafficLightSize: 12,
    trafficLightGap: 8,
  },
  // Animation timing - expo ease out for natural deceleration
  motion: {
    spring: { type: 'spring', stiffness: 400, damping: 30 },
    springGentle: { type: 'spring', stiffness: 300, damping: 35 },
    springBouncy: { type: 'spring', stiffness: 500, damping: 25 },
    duration: { fast: 0.15, normal: 0.25, slow: 0.4 },
    ease: [0.16, 1, 0.3, 1], // expo out
    easeIn: [0.4, 0, 1, 1],
  },
  // Shadows - layered for depth
  shadow: {
    window: '0 0 0 0.5px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.02), 0 8px 16px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.08)',
    windowFocused: '0 0 0 0.5px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.12)',
    subtle: '0 1px 2px rgba(0,0,0,0.04)',
  },
};

// =============================================================================
// WINDOW CONFIGURATION - Centered Stack
// =============================================================================

interface WindowConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  stackOrder: number;
  width: number;
  height: number;
}

// Windows sized with golden ratio proportions, centered on screen
const WINDOWS: WindowConfig[] = [
  { id: 'welcome', title: 'Welcome', icon: <Command size={14} />, stackOrder: 0, width: 480, height: 400 },
  { id: 'features', title: 'Features', icon: <Layers size={14} />, stackOrder: 1, width: 640, height: 440 },
  { id: 'examples', title: 'Showcase', icon: <ImageIcon size={14} />, stackOrder: 2, width: 560, height: 400 },
  { id: 'reviews', title: 'Kind Words', icon: <MessageSquare size={14} />, stackOrder: 3, width: 400, height: 440 },
  { id: 'pricing', title: 'Pricing', icon: <CreditCard size={14} />, stackOrder: 4, width: 340, height: 420 },
  { id: 'help', title: 'Help', icon: <HelpCircle size={14} />, stackOrder: 5, width: 380, height: 400 },
];

// Stack configuration - windows cascade from center
const STACK = {
  offsetX: 24,    // px offset per layer
  offsetY: 24,    // px offset per layer
  baseZ: 100,
  zStep: 10,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Desktop() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Window state - always start with all windows open
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [focusedWindow, setFocusedWindow] = useState<string>('welcome');
  const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>({});
  const [topZIndex, setTopZIndex] = useState(STACK.baseZ + WINDOWS.length * STACK.zStep);
  const [closingWindow, setClosingWindow] = useState<string | null>(null);

  // Initialize - always fresh, no localStorage
  useEffect(() => {
    setMounted(true);

    // All windows open in stack order (first = top)
    const allIds = WINDOWS.map(w => w.id);
    setOpenWindows(allIds);

    // Set initial z-indexes - first window on top
    const zIndexes: Record<string, number> = {};
    WINDOWS.forEach((w, i) => {
      zIndexes[w.id] = STACK.baseZ + (WINDOWS.length - i) * STACK.zStep;
    });
    zIndexes['signup'] = STACK.baseZ + WINDOWS.length * STACK.zStep + 50;
    setWindowZIndexes(zIndexes);

    // Time
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show hint after delay
  useEffect(() => {
    if (!hasInteracted && mounted && openWindows.includes('welcome')) {
      const timer = setTimeout(() => setShowHint(true), 6000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, mounted, openWindows]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (focusedWindow && openWindows.includes(focusedWindow)) {
          handleCloseWindow(focusedWindow);
        }
      }
      if (e.key === 'Escape' && focusedWindow && openWindows.includes(focusedWindow)) {
        handleCloseWindow(focusedWindow);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedWindow, openWindows]);

  const handleOpenWindow = useCallback((id: string) => {
    setHasInteracted(true);
    if (!openWindows.includes(id)) {
      setOpenWindows(prev => [...prev, id]);
    }
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setWindowZIndexes(prev => ({ ...prev, [id]: newZ }));
    setFocusedWindow(id);
  }, [openWindows, topZIndex]);

  const handleCloseWindow = useCallback((id: string) => {
    setHasInteracted(true);
    setShowHint(false);
    setClosingWindow(id);

    setTimeout(() => {
      setOpenWindows(prev => {
        const newOpen = prev.filter(w => w !== id);
        // Focus next window
        const nextWindow = WINDOWS
          .filter(w => newOpen.includes(w.id))
          .sort((a, b) => a.stackOrder - b.stackOrder)[0];
        if (nextWindow) {
          setFocusedWindow(nextWindow.id);
          const newZ = topZIndex + 1;
          setTopZIndex(newZ);
          setWindowZIndexes(prev => ({ ...prev, [nextWindow.id]: newZ }));
        }
        return newOpen;
      });
      setClosingWindow(null);
    }, 200);
  }, [topZIndex]);

  const handleFocusWindow = useCallback((id: string) => {
    if (focusedWindow === id) return;
    setHasInteracted(true);
    setFocusedWindow(id);
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setWindowZIndexes(prev => ({ ...prev, [id]: newZ }));
  }, [focusedWindow, topZIndex]);

  if (!mounted) {
    return <div className="h-screen w-screen" style={{ background: 'var(--bg-solid)' }} />;
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden relative font-sans"
      style={{ color: 'var(--text-primary)' }}
    >
      <div className="noise-overlay" />
      <Wallpaper />

      {/* Menu Bar */}
      <MenuBar currentTime={currentTime} />

      {/* Desktop Icons */}
      <main className="absolute inset-0 pt-14 px-6 z-10 pointer-events-none">
        <div className="grid grid-flow-col grid-rows-6 gap-y-4 gap-x-3 w-max pointer-events-auto">
          {WINDOWS.map((w, i) => (
            <DesktopIcon
              key={w.id}
              icon={w.icon}
              label={w.title}
              onOpen={() => handleOpenWindow(w.id)}
              onFocus={() => handleFocusWindow(w.id)}
              isOpen={openWindows.includes(w.id)}
              delay={0.05 + i * 0.04}
            />
          ))}
        </div>
      </main>

      {/* Centered Window Stack */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-9 pb-20">
        <AnimatePresence mode="popLayout">
          {WINDOWS.map((w, index) => {
            if (!openWindows.includes(w.id)) return null;

            const isFocused = focusedWindow === w.id;
            const isClosing = closingWindow === w.id;
            const zIndex = windowZIndexes[w.id] || (STACK.baseZ + (WINDOWS.length - index) * STACK.zStep);

            // Calculate offset from center based on stack position
            const offsetX = index * STACK.offsetX;
            const offsetY = index * STACK.offsetY;

            return (
              <Window
                key={w.id}
                id={w.id}
                title={w.title}
                icon={w.icon}
                width={w.width}
                height={w.height}
                offsetX={offsetX}
                offsetY={offsetY}
                zIndex={zIndex}
                isFocused={isFocused}
                isClosing={isClosing}
                showHint={showHint && w.id === 'welcome'}
                stackIndex={index}
                onClose={() => handleCloseWindow(w.id)}
                onFocus={() => handleFocusWindow(w.id)}
              >
                <WindowContent
                  windowId={w.id}
                  onOpenWindow={handleOpenWindow}
                  onCloseWindow={handleCloseWindow}
                />
              </Window>
            );
          })}

          {/* Signup Window */}
          {openWindows.includes('signup') && (
            <Window
              key="signup"
              id="signup"
              title="Account"
              icon={<Apple size={14} />}
              width={360}
              height={400}
              offsetX={WINDOWS.length * STACK.offsetX + 40}
              offsetY={0}
              zIndex={windowZIndexes['signup'] || 999}
              isFocused={focusedWindow === 'signup'}
              isClosing={closingWindow === 'signup'}
              showHint={false}
              stackIndex={-1}
              onClose={() => handleCloseWindow('signup')}
              onFocus={() => handleFocusWindow('signup')}
            >
              <SignupContent />
            </Window>
          )}
        </AnimatePresence>
      </div>

      <LandingDock onOpenWindow={handleOpenWindow} />
    </div>
  );
}

// =============================================================================
// MENU BAR
// =============================================================================

function MenuBar({ currentTime }: { currentTime: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: DESIGN.motion.ease }}
      className="fixed top-0 inset-x-0 h-9 z-50 flex items-center justify-between px-5 select-none"
      style={{
        background: 'var(--bg-menubar)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid var(--border-light)',
      }}
    >
      <div className="flex items-center gap-6">
        <motion.div
          className="flex items-center gap-1 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ color: 'var(--text-primary)' }}
        >
          <Apple size={14} className="fill-current" />
          <span className="font-serif text-sm ml-0.5 tracking-tight">MeOS</span>
        </motion.div>
        <nav className="hidden sm:flex gap-5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {['File', 'Edit', 'View', 'Window', 'Help'].map((item) => (
            <motion.button
              key={item}
              className="hover:text-[var(--text-primary)] transition-colors"
              whileHover={{ y: -0.5 }}
              whileTap={{ y: 0 }}
            >
              {item}
            </motion.button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        <div className="hidden sm:flex items-center gap-3">
          <Wifi size={14} />
          <BatteryMedium size={14} />
        </div>
        <span className="tabular-nums font-medium">{currentTime}</span>
      </div>
    </motion.header>
  );
}

// =============================================================================
// WINDOW COMPONENT - Liquid Glass
// =============================================================================

interface WindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  zIndex: number;
  isFocused: boolean;
  isClosing: boolean;
  showHint: boolean;
  stackIndex: number;
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

function Window({
  id: _id,
  title,
  icon,
  width,
  height,
  offsetX,
  offsetY,
  zIndex,
  isFocused,
  isClosing,
  showHint,
  stackIndex,
  onClose,
  onFocus,
  children,
}: WindowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{
        opacity: isClosing ? 0 : 1,
        scale: isClosing ? 0.95 : 1,
        y: isClosing ? -10 : 0,
        x: offsetX,
        translateY: offsetY,
      }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{
        layout: { ...DESIGN.motion.springGentle },
        opacity: { duration: DESIGN.motion.duration.fast },
        scale: { ...DESIGN.motion.spring },
        y: { ...DESIGN.motion.spring },
        x: { ...DESIGN.motion.springGentle },
        translateY: { ...DESIGN.motion.springGentle },
        delay: stackIndex >= 0 ? stackIndex * 0.05 : 0,
      }}
      className="absolute pointer-events-auto flex flex-col overflow-hidden"
      style={{
        width,
        height,
        zIndex,
        borderRadius: DESIGN.radius.window,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        boxShadow: isFocused ? DESIGN.shadow.windowFocused : DESIGN.shadow.window,
        border: '0.5px solid var(--border-glass-outer)',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="flex items-center px-4 justify-between select-none cursor-default shrink-0"
        style={{
          height: DESIGN.titleBar.height,
          background: isFocused ? 'var(--bg-glass-elevated)' : 'transparent',
          borderBottom: '0.5px solid var(--border-light)',
        }}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="flex" style={{ gap: DESIGN.titleBar.trafficLightGap }}>
            <motion.button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              onMouseEnter={() => setCloseHovered(true)}
              onMouseLeave={() => setCloseHovered(false)}
              className="relative flex items-center justify-center transition-colors"
              style={{
                width: DESIGN.titleBar.trafficLightSize,
                height: DESIGN.titleBar.trafficLightSize,
                borderRadius: DESIGN.radius.pill,
                background: isFocused || isHovered ? '#FF5F57' : 'var(--text-tertiary)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: closeHovered ? 1 : 0 }}
                className="text-[10px] font-bold leading-none"
                style={{ color: 'rgba(0,0,0,0.5)' }}
              >
                ×
              </motion.span>
              {/* Hint ring */}
              {showHint && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  style={{ border: '2px solid #FF5F57' }}
                />
              )}
            </motion.button>
            <div
              className="transition-colors"
              style={{
                width: DESIGN.titleBar.trafficLightSize,
                height: DESIGN.titleBar.trafficLightSize,
                borderRadius: DESIGN.radius.pill,
                background: isFocused || isHovered ? '#FFBD2E' : 'var(--text-tertiary)',
              }}
            />
            <div
              className="transition-colors"
              style={{
                width: DESIGN.titleBar.trafficLightSize,
                height: DESIGN.titleBar.trafficLightSize,
                borderRadius: DESIGN.radius.pill,
                background: isFocused || isHovered ? '#28CA41' : 'var(--text-tertiary)',
              }}
            />
          </div>

          {/* Hint tooltip */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={DESIGN.motion.springGentle}
                className="ml-2 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  boxShadow: DESIGN.shadow.subtle,
                }}
              >
                Click to close & explore
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <span className="opacity-50" style={{ color: 'var(--text-secondary)' }}>{icon}</span>
          <span
            className="text-[13px] font-medium"
            style={{ color: isFocused ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {title}
          </span>
        </div>

        <div style={{ width: 52 }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </motion.div>
  );
}

// =============================================================================
// WINDOW CONTENT
// =============================================================================

function WindowContent({
  windowId,
  onOpenWindow,
  onCloseWindow,
}: {
  windowId: string;
  onOpenWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
}) {
  switch (windowId) {
    case 'welcome':
      return <WelcomeContent onOpenWindow={onOpenWindow} onCloseWindow={onCloseWindow} />;
    case 'features':
      return <FeaturesContent />;
    case 'examples':
      return <ShowcaseContent />;
    case 'reviews':
      return <ReviewsContent />;
    case 'pricing':
      return <PricingContent onOpenWindow={onOpenWindow} />;
    case 'help':
      return <HelpContent />;
    default:
      return null;
  }
}

// =============================================================================
// WELCOME
// =============================================================================

function WelcomeContent({
  onOpenWindow,
  onCloseWindow,
}: {
  onOpenWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
}) {
  return (
    <div
      className="flex-1 h-full flex flex-col items-center justify-center text-center px-8 py-10"
      style={{ background: 'var(--bg-elevated)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...DESIGN.motion.springBouncy, delay: 0.1 }}
        className="mb-5 p-3 rounded-2xl"
        style={{ background: 'var(--bg-solid)' }}
      >
        <Command size={24} style={{ color: 'var(--text-primary)' }} />
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...DESIGN.motion.spring, delay: 0.15 }}
        className="font-serif text-3xl mb-3 leading-tight tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        Your portfolio,<br />reimagined.
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...DESIGN.motion.spring, delay: 0.2 }}
        className="text-sm max-w-[280px] leading-relaxed mb-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        Build an immersive desktop experience for your creative work.
      </motion.p>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...DESIGN.motion.spring, delay: 0.25 }}
        className="flex items-center gap-2.5"
      >
        <motion.button
          onClick={() => onOpenWindow('signup')}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-elevated)',
            borderRadius: DESIGN.radius.button,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Get Started</span>
          <ArrowRight size={14} />
        </motion.button>
        <motion.button
          onClick={() => onCloseWindow('welcome')}
          className="px-4 py-2 text-sm font-medium"
          style={{
            color: 'var(--text-secondary)',
            borderRadius: DESIGN.radius.button,
          }}
          whileHover={{ color: 'var(--text-primary)' }}
          whileTap={{ scale: 0.98 }}
        >
          Explore
        </motion.button>
      </motion.div>
    </div>
  );
}

// =============================================================================
// FEATURES
// =============================================================================

function FeaturesContent() {
  const features = [
    { icon: <Layers size={16} />, title: 'Drag & Drop', desc: 'Arrange windows exactly how you want.' },
    { icon: <CreditCard size={16} />, title: 'Typography', desc: 'Curated fonts for your case studies.' },
    { icon: <Wifi size={16} />, title: 'Mobile Ready', desc: 'Adapts beautifully to any screen.' },
    { icon: <Apple size={16} />, title: 'Custom Domain', desc: 'Connect your domain with one click.' },
    { icon: <Command size={16} />, title: 'Analytics', desc: 'See how visitors explore your work.' },
    { icon: <Sparkles size={16} />, title: 'Dark Mode', desc: 'Respects system preferences.' },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto" style={{ background: 'var(--bg-solid)' }}>
      <div className="grid grid-cols-2 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...DESIGN.motion.spring, delay: 0.05 * i }}
            className="p-4 rounded-lg"
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: DESIGN.radius.window,
              border: '0.5px solid var(--border-light)',
            }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center mb-2.5"
              style={{
                background: 'var(--bg-solid)',
                color: 'var(--text-secondary)',
                borderRadius: DESIGN.radius.icon,
              }}
            >
              {f.icon}
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {f.title}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// SHOWCASE
// =============================================================================

function ShowcaseContent() {
  return (
    <div className="flex-1 p-5 grid grid-cols-2 gap-3 overflow-y-auto" style={{ background: 'var(--bg-solid)' }}>
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...DESIGN.motion.spring, delay: i * 0.08 }}
          className="aspect-video rounded-lg flex items-center justify-center cursor-pointer transition-shadow hover:shadow-md"
          style={{
            background: 'var(--bg-glass)',
            color: 'var(--text-tertiary)',
            borderRadius: DESIGN.radius.window,
            border: '0.5px solid var(--border-light)',
          }}
        >
          <span className="text-xs font-medium">Portfolio {i}</span>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// REVIEWS
// =============================================================================

function ReviewsContent() {
  const reviews = [
    { quote: 'The case study format is perfect. Got me my role at Linear.', author: 'Sarah K.', role: 'Product Designer' },
    { quote: 'Finally, a portfolio builder that feels like a design tool.', author: 'Marcus C.', role: 'Brand Director' },
    { quote: 'Set up in 15 minutes. Better than weeks of coding.', author: 'Alex R.', role: 'Illustrator' },
  ];

  return (
    <div className="flex-1 p-5 overflow-y-auto" style={{ background: 'var(--bg-elevated)' }}>
      <h2
        className="font-serif text-xl mb-5 leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        Kind words from<br />the community.
      </h2>
      <div className="space-y-4">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...DESIGN.motion.spring, delay: i * 0.1 }}
            className="pb-4 border-b last:border-0"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <p
              className="text-sm font-serif leading-relaxed mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: 'var(--bg-solid)' }}
              />
              <div>
                <span className="text-xs font-medium block" style={{ color: 'var(--text-primary)' }}>
                  {r.author}
                </span>
                <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                  {r.role}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PRICING
// =============================================================================

function PricingContent({ onOpenWindow }: { onOpenWindow: (id: string) => void }) {
  const features = ['Unlimited projects', 'Custom domain', 'Analytics', 'Priority support'];

  return (
    <div className="flex-1 p-5 flex flex-col" style={{ background: 'var(--bg-elevated)' }}>
      <div className="text-center mb-5">
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-medium mb-3"
          style={{ background: 'var(--bg-solid)', color: 'var(--text-secondary)' }}
        >
          Pro
        </motion.span>
        <div className="flex items-baseline justify-center gap-0.5">
          <span className="font-serif text-4xl" style={{ color: 'var(--text-primary)' }}>$12</span>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/mo</span>
        </div>
      </div>

      <div className="space-y-2.5 mb-5 flex-1">
        {features.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...DESIGN.motion.spring, delay: 0.05 * i }}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-solid)', color: 'var(--text-primary)' }}
            >
              <Check size={8} strokeWidth={3} />
            </div>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item}</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={() => onOpenWindow('signup')}
        className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        style={{
          background: 'var(--text-primary)',
          color: 'var(--bg-elevated)',
          borderRadius: DESIGN.radius.button,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span>Start free trial</span>
        <ArrowRight size={14} />
      </motion.button>
      <p className="text-center text-[10px] mt-2.5" style={{ color: 'var(--text-tertiary)' }}>
        14 days free. Cancel anytime.
      </p>
    </div>
  );
}

// =============================================================================
// HELP / FAQ
// =============================================================================

function HelpContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'Do I need coding skills?', a: 'None at all. MeOS is drag-and-drop.' },
    { q: 'Can I use a custom domain?', a: 'Yes, Pro plans include custom domain support.' },
    { q: 'Is it mobile responsive?', a: '100%. Renders as a native-feeling app.' },
    { q: 'How do I add case studies?', a: 'Use the Notes app for rich content.' },
  ];

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg-elevated)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="relative">
          <Command
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 pl-8 pr-3 text-sm border-none outline-none"
            style={{
              background: 'var(--bg-solid)',
              color: 'var(--text-primary)',
              borderRadius: DESIGN.radius.input,
            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3
          className="text-[10px] font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-tertiary)' }}
        >
          FAQ
        </h3>
        <div className="space-y-1">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-start justify-between py-2 text-left"
              >
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: openFaq === i ? 45 : 0 }}
                  transition={DESIGN.motion.spring}
                  className="text-sm ml-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm leading-relaxed pb-2" style={{ color: 'var(--text-secondary)' }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SIGNUP
// =============================================================================

function SignupContent() {
  return (
    <div className="flex-1 p-5 flex flex-col items-center text-center" style={{ background: 'var(--bg-elevated)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={DESIGN.motion.springBouncy}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-solid)', color: 'var(--text-secondary)' }}
      >
        <Apple size={18} />
      </motion.div>

      <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
        Create your desktop
      </h2>
      <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
        Join 2,400+ designers on MeOS.
      </p>

      <div className="w-full space-y-2.5">
        <motion.button
          className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
          style={{
            background: 'var(--bg-solid)',
            color: 'var(--text-primary)',
            border: '0.5px solid var(--border-light)',
            borderRadius: DESIGN.radius.button,
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 opacity-80" />
          <span>Continue with Google</span>
        </motion.button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border-light)' }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-2 text-[9px] uppercase tracking-widest"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}
            >
              or
            </span>
          </div>
        </div>

        <input
          type="email"
          placeholder="name@example.com"
          className="w-full px-3 py-2.5 text-sm outline-none"
          style={{
            background: 'var(--bg-solid)',
            color: 'var(--text-primary)',
            border: '0.5px solid var(--border-light)',
            borderRadius: DESIGN.radius.input,
          }}
        />
        <motion.button
          className="w-full py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-elevated)',
            borderRadius: DESIGN.radius.button,
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Continue
        </motion.button>
      </div>

      <p className="mt-4 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        By joining, you agree to our Terms.
      </p>
    </div>
  );
}
