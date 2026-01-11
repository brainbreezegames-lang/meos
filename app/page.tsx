'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Image as ImageIcon, CreditCard, Command, ArrowRight, Apple, Wifi, BatteryMedium, Check, HelpCircle, MessageSquare } from 'lucide-react';
import Wallpaper from '@/components/desktop/Wallpaper';
import LandingDock from '@/components/desktop/LandingDock';
import DesktopIcon from '@/components/desktop/DesktopIcon';

// =============================================================================
// STACKED WINDOW CONFIGURATION
// =============================================================================

interface StackedWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  stackOrder: number; // 0 = topmost when loaded
  width: number;
  height: number | 'auto';
}

const STACK_CONFIG = {
  basePosition: { x: 25, y: 12 }, // % from left/top
  stackOffset: { x: 1.5, y: 2 },   // % offset per layer
  baseZIndex: 100,
  zIndexStep: 10,
};

const LANDING_WINDOWS: StackedWindow[] = [
  { id: 'welcome', title: 'Read Me', icon: <Command size={16} />, stackOrder: 0, width: 620, height: 480 },
  { id: 'features', title: 'Features', icon: <Layers size={16} />, stackOrder: 1, width: 850, height: 520 },
  { id: 'examples', title: 'Showcase', icon: <ImageIcon size={16} />, stackOrder: 2, width: 750, height: 480 },
  { id: 'reviews', title: 'Kind Words', icon: <MessageSquare size={16} />, stackOrder: 3, width: 460, height: 520 },
  { id: 'pricing', title: 'Membership', icon: <CreditCard size={16} />, stackOrder: 4, width: 360, height: 520 },
  { id: 'help', title: 'FAQ', icon: <HelpCircle size={16} />, stackOrder: 5, width: 450, height: 480 },
];

function getWindowPosition(stackIndex: number) {
  return {
    x: STACK_CONFIG.basePosition.x + (stackIndex * STACK_CONFIG.stackOffset.x),
    y: STACK_CONFIG.basePosition.y + (stackIndex * STACK_CONFIG.stackOffset.y),
    zIndex: STACK_CONFIG.baseZIndex - (stackIndex * STACK_CONFIG.zIndexStep),
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Desktop() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Window state
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [focusedWindow, setFocusedWindow] = useState<string>('welcome');
  const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>({});
  const [topZIndex, setTopZIndex] = useState(STACK_CONFIG.baseZIndex);
  const [closingWindow, setClosingWindow] = useState<string | null>(null);

  // Initialize all windows as open with stacked positions
  useEffect(() => {
    setMounted(true);

    // Check if first visit
    const hasVisited = localStorage.getItem('meos_landing_visited');

    if (!hasVisited) {
      // First visit: All windows open in stack
      localStorage.setItem('meos_landing_visited', 'true');
      const allIds = LANDING_WINDOWS.map(w => w.id);
      setOpenWindows(allIds);

      // Set initial z-indexes based on stack order
      const zIndexes: Record<string, number> = {};
      LANDING_WINDOWS.forEach((w) => {
        const pos = getWindowPosition(w.stackOrder);
        zIndexes[w.id] = pos.zIndex;
      });
      zIndexes['signup'] = 200; // Always on top when opened
      setWindowZIndexes(zIndexes);
      setFocusedWindow('welcome');
    } else {
      // Return visit: Restore previous state or just welcome
      const saved = localStorage.getItem('meos_landing_open');
      if (saved) {
        try {
          const openIds = JSON.parse(saved);
          setOpenWindows(openIds.length > 0 ? openIds : ['welcome']);
        } catch {
          setOpenWindows(['welcome']);
        }
      } else {
        setOpenWindows(['welcome']);
      }

      const zIndexes: Record<string, number> = {};
      LANDING_WINDOWS.forEach((w) => {
        const pos = getWindowPosition(w.stackOrder);
        zIndexes[w.id] = pos.zIndex;
      });
      zIndexes['signup'] = 200;
      setWindowZIndexes(zIndexes);
      setFocusedWindow('welcome');
    }

    // Time updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save open windows to localStorage
  useEffect(() => {
    if (mounted && openWindows.length > 0) {
      localStorage.setItem('meos_landing_open', JSON.stringify(openWindows));
    }
  }, [openWindows, mounted]);

  // Show hint after 8 seconds if no interaction
  useEffect(() => {
    if (!hasInteracted && mounted && openWindows.includes('welcome')) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, mounted, openWindows]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + W: Close focused window
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        const focused = LANDING_WINDOWS.find(w => w.id === focusedWindow && openWindows.includes(w.id));
        if (focused) handleCloseWindow(focused.id);
      }

      // Escape: Close focused window
      if (e.key === 'Escape') {
        const focused = LANDING_WINDOWS.find(w => w.id === focusedWindow && openWindows.includes(w.id));
        if (focused) handleCloseWindow(focused.id);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedWindow, openWindows]);

  const handleOpenWindow = useCallback((id: string) => {
    setHasInteracted(true);
    if (!openWindows.includes(id)) {
      setOpenWindows(prev => [...prev, id]);
    }
    // Bring to front
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setWindowZIndexes(prev => ({ ...prev, [id]: newZ }));
    setFocusedWindow(id);
  }, [openWindows, topZIndex]);

  const handleCloseWindow = useCallback((id: string) => {
    setHasInteracted(true);
    setShowHint(false);
    setClosingWindow(id);

    // After animation, actually close
    setTimeout(() => {
      setOpenWindows(prev => {
        const newOpen = prev.filter(w => w !== id);

        // Focus next window in stack order
        const closedWindow = LANDING_WINDOWS.find(w => w.id === id);
        if (closedWindow) {
          const nextWindow = LANDING_WINDOWS
            .filter(w => newOpen.includes(w.id))
            .sort((a, b) => a.stackOrder - b.stackOrder)[0];

          if (nextWindow) {
            setFocusedWindow(nextWindow.id);
            const newZ = topZIndex + 1;
            setTopZIndex(newZ);
            setWindowZIndexes(prev => ({ ...prev, [nextWindow.id]: newZ }));
          }
        }

        return newOpen;
      });
      setClosingWindow(null);
    }, 250);
  }, [topZIndex]);

  const handleFocusWindow = useCallback((id: string) => {
    setHasInteracted(true);
    setFocusedWindow(id);
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setWindowZIndexes(prev => ({ ...prev, [id]: newZ }));
  }, [topZIndex]);

  if (!mounted) return <div className="h-screen w-screen" style={{ background: 'var(--bg-solid)' }} />;

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans selection:bg-stone-200" style={{ color: 'var(--text-primary)' }}>
      <div className="noise-overlay"></div>
      <Wallpaper />

      {/* Menu Bar */}
      <header
        className="fixed top-0 inset-x-0 h-9 z-50 flex items-center justify-between px-5 backdrop-blur-md border-b shadow-sm text-xs font-medium select-none"
        style={{
          background: 'var(--bg-menubar)',
          borderColor: 'var(--border-light)',
          color: 'var(--text-secondary)'
        }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 group cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <Apple size={14} className="fill-current" />
            <span className="font-serif tracking-tight text-base ml-1 group-hover:opacity-70 transition-opacity">MeOS</span>
          </div>
          <nav className="hidden sm:flex gap-5">
            <button className="hover:opacity-100 opacity-80 transition-opacity">File</button>
            <button className="hover:opacity-100 opacity-80 transition-opacity">Edit</button>
            <button className="hover:opacity-100 opacity-80 transition-opacity">View</button>
            <button className="hover:opacity-100 opacity-80 transition-opacity">Window</button>
            <button className="hover:opacity-100 opacity-80 transition-opacity">Help</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <Wifi size={14} />
            <BatteryMedium size={14} />
          </div>
          <span className="tabular-nums">{currentTime}</span>
        </div>
      </header>

      {/* Desktop Grid (Icons) */}
      <main className="absolute inset-0 pt-14 px-6 z-10 pointer-events-none">
        <div className="grid grid-flow-col grid-rows-6 gap-y-4 gap-x-4 w-max pointer-events-auto items-start justify-items-center">
          {LANDING_WINDOWS.map((window, index) => (
            <DesktopIcon
              key={window.id}
              icon={window.icon}
              label={window.title}
              onOpen={() => handleOpenWindow(window.id)}
              onFocus={() => handleFocusWindow(window.id)}
              isOpen={openWindows.includes(window.id)}
              delay={0.1 + index * 0.05}
            />
          ))}
        </div>
      </main>

      {/* Stacked Windows */}
      <AnimatePresence mode="popLayout">
        {LANDING_WINDOWS.map((window) => {
          const isOpen = openWindows.includes(window.id);
          const isFocused = focusedWindow === window.id;
          const isClosing = closingWindow === window.id;
          const position = getWindowPosition(window.stackOrder);

          if (!isOpen) return null;

          return (
            <StackedWindow
              key={window.id}
              id={window.id}
              title={window.title}
              icon={window.icon}
              isClosing={isClosing}
              isFocused={isFocused}
              zIndex={windowZIndexes[window.id] || position.zIndex}
              position={position}
              width={window.width}
              height={window.height}
              onClose={() => handleCloseWindow(window.id)}
              onFocus={() => handleFocusWindow(window.id)}
              showHint={showHint && window.id === 'welcome'}
              stackIndex={window.stackOrder}
            >
              <WindowContent
                windowId={window.id}
                onOpenWindow={handleOpenWindow}
                onCloseWindow={handleCloseWindow}
              />
            </StackedWindow>
          );
        })}

        {/* Signup Window (special, not in stack) */}
        {openWindows.includes('signup') && (
          <StackedWindow
            key="signup"
            id="signup"
            title="Account"
            icon={<Apple size={16} />}
            isClosing={closingWindow === 'signup'}
            isFocused={focusedWindow === 'signup'}
            zIndex={windowZIndexes['signup'] || 200}
            position={{ x: 55, y: 15, zIndex: 200 }}
            width={380}
            height="auto"
            onClose={() => handleCloseWindow('signup')}
            onFocus={() => handleFocusWindow('signup')}
            showHint={false}
            stackIndex={-1}
          >
            <SignupContent />
          </StackedWindow>
        )}
      </AnimatePresence>

      <LandingDock onOpenWindow={handleOpenWindow} />
    </div>
  );
}

// =============================================================================
// STACKED WINDOW COMPONENT
// =============================================================================

interface StackedWindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isClosing: boolean;
  isFocused: boolean;
  zIndex: number;
  position: { x: number; y: number; zIndex: number };
  width: number;
  height: number | 'auto';
  onClose: () => void;
  onFocus: () => void;
  showHint: boolean;
  stackIndex: number;
  children: React.ReactNode;
}

function StackedWindow({
  id,
  title,
  icon,
  isClosing,
  isFocused,
  zIndex,
  position,
  width,
  height,
  onClose,
  onFocus,
  showHint,
  stackIndex,
  children,
}: StackedWindowProps) {
  return (
    <motion.div
      layoutId={id}
      initial={{
        opacity: 0,
        scale: 0.96,
        y: -20,
      }}
      animate={{
        opacity: isClosing ? 0 : 1,
        scale: isClosing ? 0.95 : 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        delay: stackIndex >= 0 ? stackIndex * 0.06 : 0,
      }}
      className="absolute flex flex-col rounded-xl overflow-hidden"
      style={{
        zIndex,
        left: `${position.x}%`,
        top: `${position.y}%`,
        width,
        height: height === 'auto' ? 'auto' : height,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: isFocused
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-light)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border-light)',
        transition: 'box-shadow 0.2s ease',
      }}
      onPointerDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="h-11 flex items-center px-4 justify-between select-none cursor-default border-b"
        style={{
          background: isFocused ? 'var(--bg-elevated)' : 'var(--bg-glass)',
          borderColor: 'var(--border-light)',
        }}
      >
        <div className="flex gap-2 items-center">
          {/* Traffic Lights */}
          <div className="flex gap-1.5 relative">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className={`flex items-center justify-center w-3 h-3 rounded-full transition-all group ${showHint ? 'animate-pulse' : ''}`}
              style={{
                background: isFocused ? '#FF5F57' : 'var(--text-tertiary)',
                boxShadow: showHint ? '0 0 0 4px rgba(255, 95, 87, 0.3)' : 'none',
              }}
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-white/90">×</span>
            </button>
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: isFocused ? '#FFBD2E' : 'var(--text-tertiary)' }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: isFocused ? '#28CA41' : 'var(--text-tertiary)' }}
            />

            {/* Hint tooltip */}
            {showHint && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute left-10 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                Close to continue →
              </motion.div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <span className="opacity-60">{icon}</span>
          <span className="text-sm font-medium">{title}</span>
        </div>

        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </motion.div>
  );
}

// =============================================================================
// WINDOW CONTENT COMPONENTS
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

function WelcomeContent({
  onOpenWindow,
  onCloseWindow,
}: {
  onOpenWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
}) {
  return (
    <div className="flex-1 p-10 flex flex-col justify-center items-center text-center" style={{ background: 'var(--bg-elevated)' }}>
      <div className="mb-6 p-3 rounded-2xl" style={{ background: 'var(--bg-solid)' }}>
        <Command size={28} style={{ color: 'var(--text-primary)' }} />
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl mb-4 leading-[1.1] tracking-tight" style={{ color: 'var(--text-primary)' }}>
        Your portfolio,<br />reimagined as an OS.
      </h1>
      <p className="text-base max-w-sm mx-auto leading-relaxed mb-8 font-light" style={{ color: 'var(--text-secondary)' }}>
        MeOS transforms your creative work into an immersive desktop experience. Quiet, tactile, and deeply personal.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onOpenWindow('signup')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center gap-2"
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-elevated)',
          }}
        >
          <span>Get Started</span>
          <ArrowRight size={14} />
        </button>
        <button
          onClick={() => onCloseWindow('welcome')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-light)',
          }}
        >
          Explore Features
        </button>
      </div>
    </div>
  );
}

function FeaturesContent() {
  const features = [
    { icon: <Layers size={18} />, title: 'Drag & Drop Layout', desc: 'Arrange your portfolio windows exactly how you want visitors to see them.' },
    { icon: <CreditCard size={18} />, title: 'Editorial Typography', desc: 'Curated font pairings that make your case studies read like a magazine.' },
    { icon: <Wifi size={18} />, title: 'Mobile Adaptive', desc: 'Translates the desktop metaphor into a clean feed for smaller screens.' },
    { icon: <Apple size={18} />, title: 'Custom Domain', desc: 'Connect your own domain with one click. Free SSL included.' },
    { icon: <Command size={18} />, title: 'Visitor Analytics', desc: 'See which windows are being opened and how long people stay.' },
    { icon: <Sparkles size={18} />, title: 'Dark Mode', desc: 'Automatically respects user system preferences. Looks stunning in dark.' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-solid)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl border transition-shadow hover:shadow-md"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-light)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'var(--bg-solid)', color: 'var(--text-secondary)' }}
            >
              {f.icon}
            </div>
            <h3 className="font-medium mb-1.5 text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ShowcaseContent() {
  return (
    <div className="flex-1 p-6 grid grid-cols-2 gap-4 overflow-y-auto" style={{ background: 'var(--bg-solid)' }}>
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="aspect-video rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-glass)', color: 'var(--text-tertiary)' }}
        >
          <span className="text-xs font-medium">Portfolio {i}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ReviewsContent() {
  const reviews = [
    { quote: "The case study format is perfect. It's what got me my role at Linear.", author: "Sarah K.", role: "Product Designer" },
    { quote: "Finally, a portfolio builder that feels like a design tool, not a website builder.", author: "Marcus C.", role: "Brand Director" },
    { quote: "I set this up in 15 minutes and it looks better than the site I spent weeks coding.", author: "Alex R.", role: "Illustrator" },
    { quote: "Recruiters actually commented on the OS feel. It's memorable.", author: "Yuki T.", role: "UX Lead" },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-elevated)' }}>
      <h2 className="font-serif text-2xl mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
        Selected feedback from<br />the community.
      </h2>
      <div className="space-y-5">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="pb-5 border-b last:border-0"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <p className="text-base font-serif leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: 'var(--bg-solid)' }}
              />
              <div>
                <span className="text-xs font-medium block" style={{ color: 'var(--text-primary)' }}>{r.author}</span>
                <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{r.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PricingContent({ onOpenWindow }: { onOpenWindow: (id: string) => void }) {
  return (
    <div className="p-6" style={{ background: 'var(--bg-elevated)' }}>
      <div className="flex flex-col items-center mb-6">
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-medium mb-3"
          style={{ background: 'var(--bg-solid)', color: 'var(--text-secondary)' }}
        >
          Pro License
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-4xl" style={{ color: 'var(--text-primary)' }}>$12</span>
          <span className="font-medium" style={{ color: 'var(--text-tertiary)' }}>/mo</span>
        </div>
        <p className="text-xs mt-2 text-center max-w-[180px]" style={{ color: 'var(--text-secondary)' }}>
          Everything you need to build a world-class portfolio.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {['Unlimited windows & projects', 'Custom domain support', 'Visitor analytics & insights', 'Search engine optimization'].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-solid)', color: 'var(--text-primary)' }}
            >
              <Check size={8} strokeWidth={3} />
            </div>
            <span className="text-xs">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onOpenWindow('signup')}
        className="w-full h-10 rounded-lg text-sm font-medium transition-colors shadow-md flex items-center justify-center gap-2 group"
        style={{ background: 'var(--text-primary)', color: 'var(--bg-elevated)' }}
      >
        <span>Start 14-day free trial</span>
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
      <p className="text-center text-[10px] mt-3" style={{ color: 'var(--text-tertiary)' }}>
        Cancel anytime. No questions asked.
      </p>
    </div>
  );
}

function HelpContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'Do I need coding skills?', a: 'None at all. MeOS is strictly drag-and-drop.' },
    { q: 'Can I use a custom domain?', a: 'Yes, Pro plans include custom domain support.' },
    { q: 'Is it mobile responsive?', a: '100%. It renders as a native-feeling app on phones.' },
    { q: 'How do I add case studies?', a: "Use the 'Notes' app to write rich, formatted case studies." },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-elevated)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="relative">
          <Command size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full rounded-lg py-2 pl-8 pr-3 text-xs border-none focus:ring-0"
            style={{ background: 'var(--bg-solid)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Common Questions
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-start justify-between py-2 text-left"
              >
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                <span
                  className="text-sm transition-transform"
                  style={{
                    color: 'var(--text-tertiary)',
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  }}
                >
                  +
                </span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs leading-relaxed pb-2" style={{ color: 'var(--text-secondary)' }}>
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

function SignupContent() {
  return (
    <div className="p-6 flex flex-col items-center text-center" style={{ background: 'var(--bg-elevated)' }}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-solid)', color: 'var(--text-secondary)' }}
      >
        <Apple size={18} />
      </div>

      <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Create your desktop.</h2>
      <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>Join 2,400+ designers building on MeOS.</p>

      <div className="w-full space-y-2.5">
        <button
          className="w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-medium border"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-light)',
          }}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5 opacity-70" />
          <span>Continue with Google</span>
        </button>

        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border-light)' }} />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 text-[9px] uppercase tracking-widest" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
              Or use email
            </span>
          </div>
        </div>

        <input
          type="email"
          placeholder="name@example.com"
          className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none"
          style={{
            background: 'var(--bg-solid)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-light)',
          }}
        />
        <button
          className="w-full py-2 rounded-lg text-xs font-medium"
          style={{ background: 'var(--text-primary)', color: 'var(--bg-elevated)' }}
        >
          Continue with Email
        </button>
      </div>

      <p className="mt-4 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        By joining, you agree to our Terms of Service.
      </p>
    </div>
  );
}
