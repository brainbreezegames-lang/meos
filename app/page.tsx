'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Image as ImageIcon, CreditCard, Command, ArrowRight, Apple, Wifi, BatteryMedium, Check } from 'lucide-react';
import Wallpaper from '@/components/desktop/Wallpaper';
import LandingDock from '@/components/desktop/LandingDock';
import LandingWindow from '@/components/desktop/LandingWindow';

export default function Desktop() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Window Management
  const [openWindows, setOpenWindows] = useState<string[]>(['welcome']);
  const [focusedWindow, setFocusedWindow] = useState<string>('welcome');
  const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>({
    welcome: 30,
    features: 29,
    examples: 29,
    pricing: 29
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
          <button onDoubleClick={() => handleOpenWindow('welcome')} onClick={() => handleFocusWindow('welcome')} className="group flex flex-col items-center gap-2 w-20 focus:outline-none">
            <div className="w-14 h-14 rounded-[14px] bg-stone-100 shadow-sm border border-stone-200/50 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all duration-300">
              <Sparkles size={24} className="text-stone-700" />
            </div>
            <span className="text-[11px] font-medium text-stone-600 drop-shadow-sm bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm group-hover:bg-white/60">Start Here</span>
          </button>

          {/* Icon: Features */}
          <button onDoubleClick={() => handleOpenWindow('features')} onClick={() => handleFocusWindow('features')} className="group flex flex-col items-center gap-2 w-20 focus:outline-none">
            <div className="w-14 h-14 rounded-[14px] bg-white shadow-sm border border-stone-200/50 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all duration-300">
              <Layers size={24} className="text-stone-600" />
            </div>
            <span className="text-[11px] font-medium text-stone-600 drop-shadow-sm bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm group-hover:bg-white/60">Features</span>
          </button>

          {/* Icon: Portfolio */}
          <button onDoubleClick={() => handleOpenWindow('examples')} onClick={() => handleFocusWindow('examples')} className="group flex flex-col items-center gap-2 w-20 focus:outline-none">
            <div className="w-14 h-14 rounded-[14px] bg-stone-50 shadow-sm border border-stone-200/50 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-100 to-transparent opacity-50"></div>
              <ImageIcon size={24} className="text-stone-600 relative z-10" />
            </div>
            <span className="text-[11px] font-medium text-stone-600 drop-shadow-sm bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm group-hover:bg-white/60">Showcase</span>
          </button>

          {/* Icon: Pricing */}
          <button onDoubleClick={() => handleOpenWindow('pricing')} onClick={() => handleFocusWindow('pricing')} className="group flex flex-col items-center gap-2 w-20 focus:outline-none">
            <div className="w-14 h-14 rounded-[14px] bg-white shadow-sm border border-stone-200/50 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all duration-300">
              <CreditCard size={24} className="text-stone-600" />
            </div>
            <span className="text-[11px] font-medium text-stone-600 drop-shadow-sm bg-white/40 px-2 py-0.5 rounded-full backdrop-blur-sm group-hover:bg-white/60">Pricing</span>
          </button>

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
              <button className="bg-stone-900 text-stone-50 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 flex items-center gap-2">
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
        <LandingWindow
          key="pricing"
          id="pricing"
          title="Plan"
          isOpen={openWindows.includes('pricing')}
          onClose={() => handleCloseWindow('pricing')}
          onFocus={() => handleFocusWindow('pricing')}
          zIndex={windowZIndexes['pricing']}
          initialPosition={{ x: 600, y: 100 }}
          width="400px"
        >
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="font-serif text-3xl text-stone-900">Pro License</h2>
              <p className="text-stone-500 text-sm mt-2">One simple payment. Lifetime access.</p>
            </div>

            <div className="bg-white rounded-lg border border-stone-200/60 p-6 shadow-sm mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-3xl font-medium text-stone-900">$12</span>
                <span className="text-stone-400 text-sm">/ month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['Unlimited Projects', 'Custom Domain', 'Analytics', 'SEO Optimization'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-stone-600">
                    <Check size={14} className="text-stone-800" /> {item}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-stone-900 text-white h-10 rounded-md text-sm font-medium hover:bg-stone-800 transition-colors">Upgrade to Pro</button>
            </div>
            <p className="text-center text-xs text-stone-400">Includes 14-day money-back guarantee.</p>
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
