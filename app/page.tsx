'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Image as ImageIcon, CreditCard, Command, ArrowRight, Apple, Wifi, BatteryMedium, Check } from 'lucide-react';
import Wallpaper from '@/components/desktop/Wallpaper';
import LandingDock from '@/components/desktop/LandingDock';
import LandingWindow from '@/components/desktop/LandingWindow';
import DesktopIcon from '@/components/desktop/DesktopIcon';

export default function Desktop() {
  console.log('MeOS Warm Theme Loaded');
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Window Management
  const [openWindows, setOpenWindows] = useState<string[]>(['welcome']);
  const [focusedWindow, setFocusedWindow] = useState<string>('welcome');
  const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>({
    welcome: 30,
    features: 29,
    examples: 29,
    pricing: 29,
    reviews: 29,
    help: 29,
    signup: 100
  });
  const [topZIndex, setTopZIndex] = useState(30);

  useEffect(() => {
    setMounted(true);
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

  const handleOpenWindow = (id: string) => {
    if (!openWindows.includes(id)) {
      setOpenWindows([...openWindows, id]);
    }
    handleFocusWindow(id);
  };

  const handleCloseWindow = (id: string) => {
    setOpenWindows(openWindows.filter(w => w !== id));
  };

  const handleFocusWindow = (id: string) => {
    setFocusedWindow(id);
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setWindowZIndexes(prev => ({
      ...prev,
      [id]: newZ
    }));
  };

  if (!mounted) return <div className="h-screen w-screen bg-[#FAFAF9]" />;

  return (
    <div className="h-screen w-screen overflow-hidden relative text-stone-800 font-sans selection:bg-stone-200">
      <div className="noise-overlay"></div>
      <Wallpaper />

      {/* Menu Bar */}
      <header className="fixed top-0 inset-x-0 h-9 z-50 flex items-center justify-between px-5 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm text-xs font-medium text-stone-600 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 group cursor-pointer text-stone-900">
            <Apple size={14} className="fill-current" />
            <span className="font-serif tracking-tight text-base ml-1 group-hover:text-stone-500 transition-colors">MeOS</span>
          </div>
          <nav className="hidden sm:flex gap-5">
            <button className="hover:text-stone-900 transition-colors">File</button>
            <button className="hover:text-stone-900 transition-colors">Edit</button>
            <button className="hover:text-stone-900 transition-colors">View</button>
            <button className="hover:text-stone-900 transition-colors">Window</button>
            <button className="hover:text-stone-900 transition-colors">Help</button>
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
      <main className="absolute inset-0 pt-12 px-6 z-10 pointer-events-none">
        <div className="grid grid-flow-col grid-rows-6 gap-y-6 gap-x-6 w-max pointer-events-auto items-start justify-items-center">

          {/* Icon: Welcome */}
          <DesktopIcon
            icon={<Sparkles size={32} strokeWidth={1} />}
            label="Start Here"
            onOpen={() => handleOpenWindow('welcome')}
            onFocus={() => handleFocusWindow('welcome')}
            className="bg-gradient-to-br from-stone-50 to-stone-100"
            delay={0.1}
          />

          {/* Icon: Features */}
          <DesktopIcon
            icon={<Layers size={32} strokeWidth={1} />}
            label="Features"
            onOpen={() => handleOpenWindow('features')}
            onFocus={() => handleFocusWindow('features')}
            className="bg-white"
            delay={0.15}
          />

          {/* Icon: Portfolio/Showcase */}
          <DesktopIcon
            icon={<ImageIcon size={32} strokeWidth={1} />}
            label="Showcase"
            onOpen={() => handleOpenWindow('examples')}
            onFocus={() => handleFocusWindow('examples')}
            className="bg-stone-50"
            delay={0.2}
          />

          {/* Icon: Pricing */}
          <DesktopIcon
            icon={<CreditCard size={32} strokeWidth={1} />}
            label="Pricing"
            onOpen={() => handleOpenWindow('pricing')}
            onFocus={() => handleFocusWindow('pricing')}
            className="bg-white"
            delay={0.25}
          />

          {/* Icon: Reviews */}
          <DesktopIcon
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            }
            label="Reviews"
            onOpen={() => handleOpenWindow('reviews')}
            onFocus={() => handleFocusWindow('reviews')}
            className="bg-white"
            delay={0.3}
          />

          {/* Icon: Help */}
          <DesktopIcon
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            }
            label="Help"
            onOpen={() => handleOpenWindow('help')}
            onFocus={() => handleFocusWindow('help')}
            className="bg-stone-50"
            delay={0.35}
          />

        </div>
      </main>

      {/* Windows Area */}
      <AnimatePresence>
        {/* WELCOME WINDOW */}
        <LandingWindow
          key="welcome"
          id="welcome"
          title="Read Me"
          isOpen={openWindows.includes('welcome')}
          onClose={() => handleCloseWindow('welcome')}
          onFocus={() => handleFocusWindow('welcome')}
          zIndex={windowZIndexes['welcome']}
          initialPosition={{ x: 100, y: 100 }}
          width="min(650px, 90vw)"
          height="550px"
        >
          <div className="flex-1 overflow-y-auto p-12 flex flex-col justify-center items-center text-center">
            <div className="mb-8 p-3 bg-stone-100 rounded-2xl shadow-inner">
              <Command size={32} className="text-stone-800" />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl text-stone-900 mb-6 leading-[0.9] tracking-tight">
              Your portfolio,<br />reimagined as an OS.
            </h1>
            <p className="text-stone-500 text-lg max-w-md mx-auto leading-relaxed mb-10 font-light">
              MeOS transforms your creative work into an immersive desktop experience. Quiet, tactile, and deeply personal.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleOpenWindow('signup')}
                className="bg-stone-900 text-stone-50 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={() => handleOpenWindow('features')} className="bg-white border border-stone-200 text-stone-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm">
                Explore Features
              </button>
            </div>
          </div>
        </LandingWindow>

        {/* FEATURES WINDOW */}
        <LandingWindow
          key="features"
          id="features"
          title="System Preferences"
          isOpen={openWindows.includes('features')}
          onClose={() => handleCloseWindow('features')}
          onFocus={() => handleFocusWindow('features')}
          zIndex={windowZIndexes['features']}
          initialPosition={{ x: 150, y: 150 }}
          width="900px"
          height="60vh"
        >
          <div className="flex-1 overflow-y-auto bg-stone-50/50 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Feature Cards */}
                <FeatureCard icon={<Layers size={20} />} title="Drag & Drop Layout" desc="Arrange your portfolio windows exactly how you want visitors to see them." />
                <FeatureCard icon={<CreditCard size={20} />} title="Editorial Typography" desc="Curated font pairings that make your case studies read like a magazine." />
                <FeatureCard icon={<Wifi size={20} />} title="Mobile Adaptive" desc="Translates the desktop metaphor into a clean feed for smaller screens." />
                <FeatureCard icon={<Apple size={20} />} title="Custom Domain" desc="Connect your own domain with one click. Free SSL included." />
                <FeatureCard icon={<Command size={20} />} title="Visitor Analytics" desc="See which windows are being opened and how long people stay." />
                <FeatureCard icon={<Sparkles size={20} />} title="Dark Mode" desc="Automatically respects user system preferences. Looks stunning in dark." />
              </div>
            </div>
          </div>
        </LandingWindow>

        {/* PRICING WINDOW */}
        {/* PRICING WINDOW */}
        <LandingWindow
          key="pricing"
          id="pricing"
          title="Membership"
          isOpen={openWindows.includes('pricing')}
          onClose={() => handleCloseWindow('pricing')}
          onFocus={() => handleFocusWindow('pricing')}
          zIndex={windowZIndexes['pricing']}
          initialPosition={{ x: 600, y: 100 }}
          width="360px"
          height="auto"
          className="bg-white"
        >
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium mb-4">Pro License</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-5xl text-stone-900">$12</span>
                <span className="text-stone-400 font-medium">/mo</span>
              </div>
              <p className="text-stone-500 text-sm mt-3 text-center max-w-[200px]">Everything you need to build a world-class portfolio.</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-900"><Check size={10} strokeWidth={3} /></div>
                <span>Unlimited windows & projects</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-900"><Check size={10} strokeWidth={3} /></div>
                <span>Custom domain support</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-900"><Check size={10} strokeWidth={3} /></div>
                <span>Visitor analytics & insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-stone-900"><Check size={10} strokeWidth={3} /></div>
                <span>Search engine optimization</span>
              </div>
            </div>

            <button className="w-full bg-stone-900 text-stone-50 h-11 rounded-lg text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10 flex items-center justify-center gap-2 group">
              <span>Start 14-day free trial</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-center text-[10px] text-stone-400 mt-4">Cancel anytime. No questions asked.</p>
          </div>
        </LandingWindow>

        {/* EXAMPLES/SHOWCASE WINDOW */}
        <LandingWindow
          key="examples"
          id="examples"
          title="Showcase"
          isOpen={openWindows.includes('examples')}
          onClose={() => handleCloseWindow('examples')}
          onFocus={() => handleFocusWindow('examples')}
          zIndex={windowZIndexes['examples']}
          initialPosition={{ x: 200, y: 200 }}
          width="800px"
          height="500px"
        >
          <div className="p-8 grid grid-cols-2 gap-4">
            <div className="aspect-video bg-stone-200 rounded-lg animate-pulse"></div>
            <div className="aspect-video bg-stone-200 rounded-lg animate-pulse"></div>
            <div className="aspect-video bg-stone-200 rounded-lg animate-pulse"></div>
            <div className="aspect-video bg-stone-200 rounded-lg animate-pulse"></div>
          </div>
        </LandingWindow>

        {/* REVIEWS WINDOW */}
        <LandingWindow
          key="reviews"
          id="reviews"
          title="Kind Words"
          isOpen={openWindows.includes('reviews')}
          onClose={() => handleCloseWindow('reviews')}
          onFocus={() => handleFocusWindow('reviews')}
          zIndex={windowZIndexes['reviews']}
          initialPosition={{ x: 300, y: 150 }}
          width="480px"
          height="600px"
          className="bg-[#FAFAF9]"
        >
          <div className="p-8 pb-12 space-y-8 overflow-y-auto h-full">
            <h2 className="font-serif text-3xl text-stone-900 leading-tight">
              Selected feedback from<br />the community.
            </h2>

            <div className="space-y-6">
              <ReviewCard
                quote="The case study format is perfect. It’s what got me my role at Linear."
                author="Sarah K."
                role="Product Designer"
              />
              <ReviewCard
                quote="Finally, a portfolio builder that feels like a design tool, not a website builder."
                author="Marcus C."
                role="Brand Director"
              />
              <ReviewCard
                quote="I set this up in 15 minutes and it looks better than the site I spent weeks coding."
                author="Alex R."
                role="Illustrator"
              />
              <ReviewCard
                quote="Recruiters actually commented on the OS feel. It’s memorable."
                author="Yuki T."
                role="UX Lead"
              />
            </div>
          </div>
        </LandingWindow>

        {/* HELP WINDOW */}
        <LandingWindow
          key="help"
          id="help"
          title="Support"
          isOpen={openWindows.includes('help')}
          onClose={() => handleCloseWindow('help')}
          onFocus={() => handleFocusWindow('help')}
          zIndex={windowZIndexes['help']}
          initialPosition={{ x: 400, y: 200 }}
          width="450px"
          height="500px"
          className="bg-white"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-stone-100/50">
              <div className="relative">
                <Command size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full bg-stone-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:ring-0"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Common Questions</h3>
              <div className="space-y-4">
                <FAQItem q="Do I need coding skills?" a="None at all. MeOS is strictly drag-and-drop." />
                <FAQItem q="Can I use a custom domain?" a="Yes, Pro plans include custom domain support." />
                <FAQItem q="Is it mobile responsive?" a="100%. It renders as a native-feeling app on phones." />
                <FAQItem q="How do I add case studies?" a="Use the 'Notes' app to write rich, formatted case studies." />
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Contact</h3>
                <a href="mailto:support@meos.app" className="flex items-center gap-2 text-stone-700 hover:text-orange-600 transition-colors">
                  <span className="text-sm font-medium">support@meos.app</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </LandingWindow>

        {/* SIGNUP WINDOW */}
        <LandingWindow
          key="signup"
          id="signup"
          title="Account"
          isOpen={openWindows.includes('signup')}
          onClose={() => handleCloseWindow('signup')}
          onFocus={() => handleFocusWindow('signup')}
          zIndex={windowZIndexes['signup']}
          initialPosition={{ x: 600, y: 100 }}
          width="380px"
          height="auto"
          className="bg-white"
        >
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-500">
              <Apple size={20} />
            </div>

            <h2 className="font-serif text-2xl text-stone-900 mb-2">Create your desktop.</h2>
            <p className="text-stone-500 text-sm mb-8">Join 2,400+ designers building on MeOS.</p>

            <div className="w-full space-y-3">
              <button className="w-full bg-white border border-stone-200 text-stone-800 font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-stone-50 transition-all hover:border-stone-300">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                <span className="text-sm">Continue with Google</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-white px-2 text-stone-300">Or use email</span></div>
              </div>

              <input type="email" placeholder="name@example.com" className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-sm focus:outline-none focus:border-stone-300 transition-colors" />
              <button className="w-full bg-stone-900 text-stone-50 font-medium py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm shadow-sm">
                Continue with Email
              </button>
            </div>

            <p className="mt-6 text-[11px] text-stone-400">
              By joining, you agree to our Terms of Service.
            </p>
          </div>
        </LandingWindow>

      </AnimatePresence>

      <LandingDock onOpenWindow={handleOpenWindow} />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4 text-stone-700">
        {icon}
      </div>
      <h3 className="font-medium text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}
function ReviewCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="group pb-6 border-b border-stone-200/60 last:border-0 hover:bg-white/50 transition-colors rounded-lg p-2 -mx-2">
      <div className="text-lg font-serif text-stone-800 leading-relaxed mb-3">&ldquo;{quote}&rdquo;</div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-stone-200 to-stone-300"></div>
        <div>
          <span className="text-xs font-semibold text-stone-900 block">{author}</span>
          <span className="text-[10px] text-stone-500 uppercase tracking-wide">{role}</span>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between py-2 text-left hover:text-stone-900 transition-colors"
      >
        <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{q}</span>
        <span className={`text-stone-400 transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-stone-500 leading-relaxed pb-3 pr-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
