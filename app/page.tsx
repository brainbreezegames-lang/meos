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
  icon: string;
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
// DATA
// =============================================================================

const FEATURES_DATA = [
  { icon: '📄', title: 'Case Studies', description: 'Rich documents with process, insights, and outcomes. Section navigation, insight cards, metrics displays.' },
  { icon: '📸', title: 'Photo Gallery', description: 'Masonry grids, albums, and lightbox viewing. EXIF data support for photographers.' },
  { icon: '📝', title: 'Notes', description: 'Long-form writing with markdown support. Blog posts, essays, and ideas organized in folders.' },
  { icon: '👤', title: 'Contact Card', description: 'Email, calendar booking, social links, and availability status. Make it easy to reach you.' },
  { icon: '📁', title: 'File Downloads', description: 'Resume, assets, and resources organized and downloadable. Everything in one place.' },
  { icon: '📊', title: 'Analytics', description: 'See who visits, what they view, where they are from. Understand your audience.' },
  { icon: '🎨', title: 'Themes', description: 'Four distinct themes: Monterey, Dark, Bluren, Refined. Each transforms the entire feel.' },
  { icon: '📱', title: 'Mobile View', description: 'Automatic iOS-style interface on mobile. Same content, native feel.' },
  { icon: '🔗', title: 'Custom Domain', description: 'Use your own domain on Pro. Free users get yourname.meos.app subdomain.' },
];

const TESTIMONIALS_DATA = [
  { text: "Got 3 interview requests in the first week. Recruiters always mention how unique my portfolio looks now.", name: "Sarah Kim", title: "Product Designer @ Google", isRight: true },
  { text: "Finally something that doesn't look like every other portfolio. My clients always comment on it.", name: "Marcus Chen", title: "Freelance Brand Designer", isRight: false },
  { text: "The case study format is perfect for showing process. So much better than cramming everything into one scroll.", name: "Yuki Tanaka", title: "UX Lead @ Spotify", isRight: true },
  { text: "Setup took 20 minutes. I've been putting off redoing my portfolio for 2 years. Finally done.", name: "Alex Rivera", title: "Illustrator", isRight: false },
];

const EXAMPLES_DATA = [
  { name: 'Sarah Kim', title: 'Product Designer', company: 'Google', gradient: 'from-violet-500 to-purple-600' },
  { name: 'Marcus Chen', title: 'Brand Designer', company: 'Freelance', gradient: 'from-rose-500 to-pink-600' },
  { name: 'Yuki Tanaka', title: 'UX Research', company: 'Spotify', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Alex Rivera', title: 'Illustrator', company: 'Freelance', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Priya Patel', title: 'Motion Design', company: 'Netflix', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Tom Anderson', title: 'Photography', company: 'Freelance', gradient: 'from-indigo-500 to-blue-600' },
];

const FAQ_DATA = [
  { q: "Do I need to know how to code?", a: "No. MeOS is entirely visual. Drag, drop, click, done. If you can use a Mac, you can use MeOS." },
  { q: "How does it look on mobile?", a: "MeOS automatically transforms into an iOS-style interface on mobile. Same content, native feel." },
  { q: "Can I use my own domain?", a: "Yes, on the Pro plan. Free users get a yourname.meos.app subdomain." },
  { q: "Will recruiters understand how to use it?", a: "Yes. We've tested with 50+ recruiters. The desktop metaphor is familiar — they know how to click icons and open windows." },
  { q: "What if I want to leave MeOS?", a: "Export your content anytime. No lock-in. Your work is yours." },
  { q: "Is it SEO friendly?", a: "Yes. Despite the desktop interface, all content is fully indexable by search engines." },
  { q: "How long does setup take?", a: "Average setup time is 15 minutes. Sign up, add your projects, arrange your desktop, go live." },
];

const INITIAL_WINDOWS: WindowState[] = [
  { id: 'welcome', title: 'Welcome to MeOS', icon: '👋', isOpen: true, isMinimized: false, zIndex: 100, position: { x: 80, y: 80 }, size: { width: 480, height: 520 } },
  { id: 'features', title: 'Features', icon: '✨', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 150, y: 60 }, size: { width: 600, height: 500 } },
  { id: 'examples', title: 'Examples', icon: '📸', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 100 }, size: { width: 700, height: 480 } },
  { id: 'pricing', title: 'Pricing', icon: '💰', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 180, y: 80 }, size: { width: 560, height: 520 } },
  { id: 'reviews', title: 'Reviews', icon: '💬', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 220, y: 120 }, size: { width: 500, height: 500 } },
  { id: 'help', title: 'Help', icon: '❓', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 160, y: 90 }, size: { width: 520, height: 480 } },
  { id: 'howItWorks', title: 'How It Works', icon: '🎯', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 70 }, size: { width: 500, height: 420 } },
  { id: 'mobile', title: 'Mobile Preview', icon: '📱', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 240, y: 60 }, size: { width: 420, height: 560 } },
];

const DESKTOP_ICONS = [
  { id: 'examples', label: 'Examples', icon: '📸', x: 85, y: 12 },
  { id: 'pricing', label: 'Pricing', icon: '💰', x: 85, y: 26 },
  { id: 'help', label: 'Help', icon: '❓', x: 85, y: 40 },
  { id: 'reviews', label: 'Reviews', icon: '💬', x: 85, y: 54 },
];

const DOCK_ITEMS = [
  { id: 'welcome', icon: '👋', label: 'Welcome' },
  { id: 'features', icon: '✨', label: 'Features' },
  { id: 'examples', icon: '📸', label: 'Examples' },
  { id: 'reviews', icon: '💬', label: 'Reviews' },
  { id: 'pricing', icon: '💰', label: 'Pricing' },
  { id: 'help', icon: '❓', label: 'Help' },
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
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Mount and time
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show hint after inactivity
  useEffect(() => {
    if (hintDismissed) return;
    const timer = setTimeout(() => {
      const openCount = windows.filter(w => w.isOpen && w.id !== 'welcome').length;
      if (openCount === 0) setShowHint(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [windows, hintDismissed]);

  // Window management
  const openWindow = useCallback((id: string) => {
    setShowHint(false);
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

  // Drag handling
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
  // WINDOW CONTENT RENDERERS
  // =============================================================================

  const renderWelcomeContent = () => (
    <div className="flex flex-col items-center text-center p-6 h-full">
      <div className="text-6xl mb-4">🖥️</div>
      <h1 className="text-2xl font-bold text-white mb-2">Your portfolio.</h1>
      <h1 className="text-2xl font-bold text-white/40 mb-6">Your operating system.</h1>
      <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
        This is MeOS — the portfolio platform that feels like home.
        You&apos;re experiencing it right now.
      </p>
      <p className="text-white/40 text-sm mb-8">
        Click the icons. Open the apps. Explore.<br />
        This is exactly what your visitors will do.
      </p>
      <Link href="/signup" className="w-full max-w-xs">
        <button className="w-full py-3.5 rounded-xl font-medium text-[#0a0a0f] transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)', boxShadow: '0 4px 20px rgba(255,255,255,0.2)' }}>
          Create Your Desktop — Free
        </button>
      </Link>
      <p className="text-white/30 text-xs mt-3">No credit card required</p>
      <div className="mt-auto pt-6 border-t border-white/10 w-full">
        <div className="flex justify-center gap-8 text-xs">
          <span className="text-white/50">🎨 2,400+ designers</span>
          <span className="text-white/50">⭐ 4.9 rating</span>
          <span className="text-white/50">🌍 120 countries</span>
        </div>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="p-4 h-full overflow-auto">
      {selectedFeature === null ? (
        <>
          <div className="text-center mb-4">
            <p className="text-white/40 text-sm">Click any feature to learn more</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {FEATURES_DATA.map((feature, i) => (
              <button
                key={i}
                onClick={() => setSelectedFeature(i)}
                className="flex flex-col items-center p-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <span className="text-white/80 text-xs text-center">{feature.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedFeature(null)} className="flex items-center gap-2 text-white/50 hover:text-white/80 mb-4 text-sm">
            ← All Features
          </button>
          <div className="text-center">
            <div className="text-5xl mb-4">{FEATURES_DATA[selectedFeature].icon}</div>
            <h3 className="text-xl font-semibold text-white mb-4">{FEATURES_DATA[selectedFeature].title}</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
              {FEATURES_DATA[selectedFeature].description}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderExamplesContent = () => (
    <div className="p-4 h-full overflow-auto">
      <div className="text-center mb-4">
        <p className="text-white/40 text-sm">Click any to visit live →</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {EXAMPLES_DATA.map((example, i) => (
          <div key={i} className="group cursor-pointer">
            <div className={`aspect-[4/3] rounded-lg bg-gradient-to-br ${example.gradient} mb-2 flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform`}>
              <div className="w-[80%] h-[70%] bg-white/10 rounded backdrop-blur-sm flex items-center justify-center">
                <span className="text-white/40 text-xs">Preview</span>
              </div>
            </div>
            <p className="text-white/80 text-sm font-medium">{example.name}</p>
            <p className="text-white/40 text-xs">{example.title}</p>
            <p className="text-white/30 text-xs">{example.company}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-white/30 text-xs mt-4">
        🔗 Want yours featured? Get verified after signup.
      </p>
    </div>
  );

  const renderPricingContent = () => (
    <div className="p-6 h-full overflow-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Simple pricing.</h3>
        <p className="text-white/40 text-sm">Start free, upgrade anytime.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Free */}
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-white">Free</h4>
            <div className="text-3xl font-bold text-white mt-1">$0</div>
            <p className="text-white/40 text-xs">forever</p>
          </div>
          <div className="border-t border-white/10 pt-4 mb-4">
            <ul className="space-y-2 text-sm">
              {['Full desktop', '5 projects', 'MeOS subdomain', 'Mobile version', 'Basic analytics'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-white/60">
                  <span className="text-green-400/60">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/signup" className="block">
            <button className="w-full py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Get Started
            </button>
          </Link>
        </div>
        {/* Pro */}
        <div className="rounded-xl p-5 relative" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)', color: '#0a0a0f' }}>★ RECOMMENDED</span>
          </div>
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-white">Pro</h4>
            <div className="text-3xl font-bold text-white mt-1">$12</div>
            <p className="text-white/40 text-xs">per month or $99/year</p>
          </div>
          <div className="border-t border-white/10 pt-4 mb-4">
            <ul className="space-y-2 text-sm">
              {['Everything Free', 'Unlimited projects', 'Custom domain', 'Full analytics', 'Remove branding', 'Priority support', 'Early access'].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-white/60">
                  <span className="text-green-400/60">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/signup" className="block">
            <button className="w-full py-2.5 rounded-lg text-sm font-medium text-[#0a0a0f] transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)' }}>
              Go Pro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderReviewsContent = () => (
    <div className="p-4 h-full overflow-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">What designers are saying</h3>
      </div>
      <div className="space-y-6">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div key={i} className={`flex flex-col ${t.isRight ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${t.isRight ? 'rounded-br-md bg-blue-500/20' : 'rounded-bl-md bg-white/5'}`}>
              <p className="text-white/80 leading-relaxed">{t.text}</p>
            </div>
            <p className="text-white/40 text-xs mt-1">{t.name} · {t.title}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHelpContent = () => (
    <div className="p-4 h-full overflow-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
      </div>
      <div className="divide-y divide-white/5">
        {FAQ_DATA.map((faq, i) => (
          <div key={i}>
            <button
              className="w-full py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                <span className="text-white/30 text-xs">{expandedFaq === i ? '▼' : '▶'}</span>
                {faq.q}
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
                  <p className="pb-4 pl-6 text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="text-center text-white/30 text-xs mt-4">
        Still have questions? <a href="mailto:hello@meos.app" className="text-white/50 hover:text-white/80">hello@meos.app</a>
      </p>
    </div>
  );

  const renderHowItWorksContent = () => {
    const steps = [
      { step: 1, icon: '👤', title: 'Create Account', desc: 'Sign up with Google or email.\n30 seconds.' },
      { step: 2, icon: '🎨', title: 'Add Your Work', desc: 'Drop in projects, write case studies,\narrange your desktop.' },
      { step: 3, icon: '🚀', title: 'Go Live', desc: "Share your link. You're done.\nGet discovered." },
    ];
    const current = steps[howItWorksStep];
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-white/20 text-sm mb-2">Step {current.step}</div>
        <div className="text-6xl mb-4">{current.icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{current.title}</h3>
        <p className="text-white/50 text-sm whitespace-pre-line mb-6">{current.desc}</p>
        {howItWorksStep === 2 && (
          <>
            <p className="text-white/30 text-xs mb-4">Average setup time: 15 minutes</p>
            <Link href="/signup">
              <button className="px-6 py-2.5 rounded-xl font-medium text-sm text-[#0a0a0f] transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)' }}>
                Create Your Desktop — Free
              </button>
            </Link>
          </>
        )}
        <div className="mt-auto pt-4 flex items-center gap-4">
          <button onClick={() => setHowItWorksStep(Math.max(0, howItWorksStep - 1))} disabled={howItWorksStep === 0} className="text-white/30 hover:text-white/60 disabled:opacity-30">←</button>
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === howItWorksStep ? 'bg-white' : 'bg-white/20'}`} />
            ))}
          </div>
          <button onClick={() => setHowItWorksStep(Math.min(2, howItWorksStep + 1))} disabled={howItWorksStep === 2} className="text-white/30 hover:text-white/60 disabled:opacity-30">→</button>
        </div>
      </div>
    );
  };

  const renderMobileContent = () => (
    <div className="flex flex-col items-center p-4 h-full">
      <p className="text-white/50 text-sm text-center mb-4">
        MeOS automatically adapts to mobile.<br />Same content. Native iOS experience.
      </p>
      <div className="relative flex-1 flex items-center justify-center">
        {/* iPhone frame */}
        <div className="relative w-[200px] h-[400px] rounded-[36px] p-2" style={{ background: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />
          {/* Screen */}
          <div className="w-full h-full rounded-[28px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #1e1e2e 0%, #0f0f1a 100%)' }}>
            {/* Status bar */}
            <div className="h-10 flex items-center justify-center">
              <span className="text-white/60 text-xs">9:41</span>
            </div>
            {/* App grid */}
            <div className="px-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '📄', label: 'Projects' },
                  { icon: '📸', label: 'Photos' },
                  { icon: '👤', label: 'About' },
                  { icon: '📧', label: 'Contact' },
                  { icon: '📁', label: 'Files' },
                  { icon: '✨', label: 'More' },
                ].map((app, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg mb-1">{app.icon}</div>
                    <span className="text-white/60 text-[8px]">{app.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Dock */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex gap-2 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {['🏠', '🔍', '⚙️'].map((icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">{icon}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-white/30 text-xs mt-4">90% of visitors are mobile.</p>
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
    return <div className="fixed inset-0 bg-[#0a0a0f]" />;
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden select-none" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #0f172a 50%, #0c1222 100%)' }}>
      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* ===== MENU BAR ===== */}
      <header className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-4" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => openWindow('welcome')} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold">
            <span className="text-base">🍎</span>
            <span>MeOS</span>
          </button>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <button onClick={() => openWindow('features')} className="hover:text-white/80">File</button>
            <button onClick={() => openWindow('help')} className="hover:text-white/80">Help</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-xs">🎵 Tycho — Awake</span>
          <Link href="/signup">
            <button className="px-3 py-1 rounded-md text-xs font-medium text-[#0a0a0f]" style={{ background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)' }}>
              Sign Up
            </button>
          </Link>
          <span className="text-white/50 text-xs tabular-nums">{currentTime}</span>
        </div>
      </header>

      {/* ===== DESKTOP ICONS ===== */}
      {DESKTOP_ICONS.map((icon) => (
        <motion.button
          key={icon.id}
          className="absolute flex flex-col items-center gap-1 cursor-pointer z-10"
          style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
          onDoubleClick={() => openWindow(icon.id)}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            {icon.icon}
          </div>
          <span className="text-white text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.5)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {icon.label}
          </span>
        </motion.button>
      ))}

      {/* Additional icons on left */}
      {[
        { id: 'features', label: 'Features', icon: '✨', x: 4, y: 12 },
        { id: 'howItWorks', label: 'How It Works', icon: '🎯', x: 4, y: 26 },
        { id: 'mobile', label: 'Mobile', icon: '📱', x: 4, y: 40 },
      ].map((icon) => (
        <motion.button
          key={icon.id}
          className="absolute flex flex-col items-center gap-1 cursor-pointer z-10"
          style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
          onDoubleClick={() => openWindow(icon.id)}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            {icon.icon}
          </div>
          <span className="text-white text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.5)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {icon.label}
          </span>
        </motion.button>
      ))}

      {/* ===== WINDOWS ===== */}
      <AnimatePresence>
        {windows.filter(w => w.isOpen && !w.isMinimized).map((win) => (
          <motion.div
            key={win.id}
            className="absolute rounded-xl overflow-hidden"
            style={{
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
              zIndex: win.zIndex,
              background: 'rgba(22, 22, 26, 0.92)',
              backdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
            onClick={() => focusWindow(win.id)}
          >
            {/* Window header */}
            <div
              className="h-10 flex items-center px-3 cursor-move"
              style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              onMouseDown={(e) => handleMouseDown(e, win.id)}
            >
              <div className="flex items-center gap-2">
                <button onClick={() => closeWindow(win.id)} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
              </div>
              <span className="flex-1 text-center text-sm text-white/60 font-medium pointer-events-none">{win.title}</span>
              <div className="w-14" /> {/* Spacer for symmetry */}
            </div>
            {/* Window content */}
            <div className="h-[calc(100%-40px)] overflow-hidden">
              {getWindowContent(win.id)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ===== DOCK ===== */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '18px', padding: '6px 10px', boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {DOCK_ITEMS.map((item) => {
          const win = windows.find(w => w.id === item.id);
          const isOpen = win?.isOpen;
          return (
            <motion.button
              key={item.id}
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              onClick={() => isOpen ? focusWindow(item.id) : openWindow(item.id)}
              whileHover={prefersReducedMotion ? {} : { scale: 1.2, y: -8 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              title={item.label}
            >
              {item.icon}
              {isOpen && (
                <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-white/80" />
              )}
            </motion.button>
          );
        })}
        {/* Divider */}
        <div className="w-px h-8 bg-white/20 mx-2" />
        {/* Sign Up */}
        <Link href="/signup">
          <motion.button
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'linear-gradient(180deg, #fff 0%, #e5e5e5 100%)', color: '#0a0a0f' }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
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
            className="fixed top-12 right-4 z-[60] max-w-xs"
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="rounded-xl p-4" style={{ background: 'rgba(30,30,35,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-medium mb-1">Tip</p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Double-click the icons to explore, or use the dock at the bottom.
                  </p>
                </div>
                <button onClick={() => { setShowHint(false); setHintDismissed(true); }} className="text-white/30 hover:text-white/60 text-lg">×</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
