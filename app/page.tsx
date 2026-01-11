'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  MessagesIcon,
  NotesIcon,
} from '@/lib/icons';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load fonts
  useEffect(() => {
    const instrumentSerif = document.createElement('link');
    instrumentSerif.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap';
    instrumentSerif.rel = 'stylesheet';
    document.head.appendChild(instrumentSerif);

    const inter = document.createElement('link');
    inter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    inter.rel = 'stylesheet';
    document.head.appendChild(inter);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-stone-100" />;
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ fontFamily: '"Inter", -apple-system, sans-serif' }}
    >
      {/* Wallpaper Image - Beautiful landscape */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=2400&q=80)',
        }}
      />

      {/* Menu Bar */}
      <header
        className="fixed top-0 inset-x-0 h-7 z-50 flex items-center justify-between px-4"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex items-center gap-5">
          <span
            className="text-sm font-medium"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Me<span style={{ color: '#EA580C' }}>OS</span>
          </span>
          <div className="flex items-center gap-4 text-[13px] text-stone-600">
            <button className="hover:text-stone-900">File</button>
            <button className="hover:text-stone-900">Help</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[13px] text-stone-600 hover:text-stone-900">
            Sign in
          </Link>
          <Link href="/signup">
            <button
              className="px-3 py-1 text-[12px] font-medium rounded-md text-white"
              style={{ background: '#EA580C' }}
            >
              Get Started
            </button>
          </Link>
          <span className="text-[13px] text-stone-500 tabular-nums">
            {currentTime}
          </span>
        </div>
      </header>

      {/* Welcome Window */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Title Bar */}
          <div
            className="h-10 flex items-center px-4 relative"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28CA41' }} />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 text-[13px] text-stone-400">
              Welcome
            </span>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Logo */}
            <h1
              className="text-4xl mb-6"
              style={{ fontFamily: '"Instrument Serif", serif' }}
            >
              Me<span style={{ color: '#EA580C' }}>OS</span>
            </h1>

            {/* Headline */}
            <h2
              className="text-3xl leading-tight mb-4"
              style={{
                fontFamily: '"Instrument Serif", serif',
                fontStyle: 'italic',
                color: '#1C1917',
              }}
            >
              The portfolio that feels<br />like home.
            </h2>

            {/* Description */}
            <p className="text-[15px] text-stone-500 leading-relaxed mb-6">
              You&apos;re experiencing it now. Click the icons. Open windows. Drag them around. This is your future portfolio.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-stone-900">2.4k</span>
                <span className="text-sm text-stone-400">designers</span>
              </div>
              <div className="w-px h-6 bg-stone-200" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-stone-900">4.9</span>
                <span className="text-sm text-stone-400">rating</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/signup" className="block">
              <motion.button
                className="w-full py-3.5 rounded-lg text-white font-medium text-[15px]"
                style={{ background: '#EA580C' }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Create Your Desktop
              </motion.button>
            </Link>

            {/* Subtext */}
            <p className="text-center text-[13px] text-stone-400 mt-3">
              Free forever. No credit card.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
          style={{
            background: 'rgba(30, 28, 26, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Dock Icons - Real macOS-style icons */}
          {[
            { Icon: FinderIcon, label: 'Finder' },
            { Icon: SafariIcon, label: 'Safari' },
            { Icon: MailIcon, label: 'Mail' },
            { Icon: PhotosIcon, label: 'Photos' },
            { Icon: MessagesIcon, label: 'Messages' },
            { Icon: NotesIcon, label: 'Notes' },
          ].map((item, i) => (
            <motion.button
              key={i}
              className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              whileHover={{ y: -8, scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <item.Icon size={48} />
            </motion.button>
          ))}

          <div className="w-px h-10 bg-white/20 mx-2" />

          <Link href="/signup">
            <motion.button
              className="px-5 h-12 rounded-xl text-white text-sm font-semibold tracking-wide"
              style={{
                background: 'linear-gradient(180deg, #F97316 0%, #EA580C 100%)',
                boxShadow: '0 4px 12px rgba(234,88,12,0.4)',
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>

        {/* Dock reflection effect */}
        <div className="flex justify-center mt-2">
          <div
            className="w-32 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
