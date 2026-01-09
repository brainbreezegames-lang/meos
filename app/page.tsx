'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';

const DEMO_ITEMS = [
  { id: '1', x: 15, y: 25, label: 'Projects', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop' },
  { id: '2', x: 35, y: 45, label: 'About Me', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '3', x: 55, y: 30, label: 'Photography', thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200&h=200&fit=crop' },
  { id: '4', x: 75, y: 50, label: 'Contact', thumbnail: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=200&h=200&fit=crop' },
];

const DOCK_ITEMS = ['🌐', '📧', '💼', '🎨', '📱'];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%)',
        }}
      />

      {/* Floating orbs */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
            left: '10%',
            top: '20%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
            right: '5%',
            bottom: '10%',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-2xl font-bold text-white tracking-tight">MeOS</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-gray-900 hover:bg-white/90">
                Get started
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Your personal
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  }}
                >
                  web desktop
                </span>
              </h1>
              <p className="text-xl text-white/60 mb-8 max-w-lg leading-relaxed">
                Create an explorable desktop experience for your portfolio, links, or personal brand.
                Beautiful, memorable, and uniquely yours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8">
                    Create your desktop
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-gray-900"
                      style={{
                        background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%) 0%, hsl(${i * 60 + 30}, 70%, 50%) 100%)`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/50 text-sm">
                  Join creators building their digital identity
                </p>
              </div>
            </motion.div>

            {/* Right: Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              {/* Mock desktop */}
              <div
                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)',
                  boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Menu bar */}
                <div
                  className="h-7 flex items-center justify-between px-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <span className="text-white/80 text-xs font-medium">MeOS</span>
                  <span className="text-white/60 text-xs">12:00 PM</span>
                </div>

                {/* Desktop items */}
                <div className="relative h-[calc(100%-7rem)] p-4">
                  <AnimatePresence>
                    {mounted && DEMO_ITEMS.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="absolute flex flex-col items-center gap-1 cursor-pointer"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -4 }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <motion.div
                          className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden"
                          style={{
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            boxShadow: hoveredItem === item.id
                              ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                              : '0 4px 12px rgba(0, 0, 0, 0.3)',
                          }}
                          animate={{
                            scale: hoveredItem === item.id ? 1.1 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                        <span
                          className="text-[9px] md:text-[10px] text-white font-medium px-1 py-0.5 rounded"
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Dock */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <motion.div
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1 }}
                  >
                    {DOCK_ITEMS.map((emoji, index) => (
                      <motion.div
                        key={index}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 247, 0.8) 100%)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                        whileHover={{ scale: 1.2, y: -8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-6 -left-6 px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                <span className="text-white/60 text-xs">Drag items anywhere</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Build a desktop that feels like an app, not a webpage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🖼️',
                title: 'Drag & Drop',
                description: 'Position items anywhere on your desktop. Make it yours.',
              },
              {
                icon: '🪟',
                title: 'Info Windows',
                description: 'Click items to reveal beautiful detail windows with all your info.',
              },
              {
                icon: '🚀',
                title: 'Instant Share',
                description: 'Get a unique URL. Share your desktop anywhere.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to build your desktop?
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Join now and create something memorable
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-10">
              Get started for free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/40 text-sm">
            © {new Date().getFullYear()} MeOS. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 text-sm hover:text-white/60 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-white/40 text-sm hover:text-white/60 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
