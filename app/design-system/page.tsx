'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Type, Layout, Layers, Sparkles, MousePointer, Copy, Check,
  Sun, Moon, ChevronRight, ExternalLink, Folder, FileText, Image as ImageIcon,
  Link2, Settings, Search, User, Bell, Heart, Star, Zap, Code, Grid,
  Clock, Mail, MessageSquare, DollarSign, Book, ThumbsUp, Activity,
  Monitor, Smartphone, PanelLeft, X, Minus, Square, ChevronDown, ChevronUp,
  Plus, Trash2, Edit3, MoreHorizontal, Play, Pause, Volume2, Download,
  Share2, Bookmark, Filter, SortAsc, LayoutGrid, List, ArrowRight,
  Calendar, MapPin, Globe, Twitter, Github, Linkedin, Instagram, Youtube,
  Quote, AlertCircle, Info, CheckCircle, AlertTriangle, Terminal, Cpu,
  Database, Cloud, Lock, Unlock, Eye, EyeOff, RefreshCw, RotateCcw,
  Maximize2, Minimize2, Move, GripVertical, Home, ArrowLeft, Menu,
  Command, Option, CornerDownLeft, Delete
} from 'lucide-react';
import '@/styles/design-system.css';

// ============================================================================
// COMPREHENSIVE DESIGN SYSTEM
// Complete documentation of all goOS design tokens and components
// ============================================================================

const SPRING = {
  smooth: { type: 'spring' as const, stiffness: 300, damping: 30 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 35 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 25 },
};

const sections = [
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'spacing', label: 'Spacing', icon: Layout },
  { id: 'effects', label: 'Effects', icon: Layers },
  { id: 'motion', label: 'Motion', icon: Sparkles },
  { id: 'icons', label: 'Icons', icon: Grid },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'windows', label: 'Windows', icon: PanelLeft },
  { id: 'widgets', label: 'Widgets', icon: Clock },
  { id: 'blocks', label: 'Content Blocks', icon: LayoutGrid },
  { id: 'forms', label: 'Forms & Inputs', icon: Edit3 },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('colors');
  const [isDark, setIsDark] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bg = isDark ? '#0d0c0b' : '#fbf9ef';
  const text = isDark ? '#f5f3eb' : '#171412';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, -apple-system, sans-serif', transition: 'all 0.3s ease' }}>
      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: isDark ? 'rgba(13,12,11,0.85)' : 'rgba(251,249,239,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ff7722 0%, #e5691e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,119,34,0.3)' }}>
              <Code size={20} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700 }}>goOS Design System</h1>
              <p style={{ fontSize: 12, opacity: 0.6 }}>Complete component reference</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setIsDark(!isDark)} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a href="/goos-v2" style={{ padding: '10px 16px', borderRadius: 10, background: '#ff7722', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              View Live <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', paddingTop: 80 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, position: 'fixed', top: 80, left: 0, bottom: 0, padding: '24px 12px', borderRight: `1px solid ${border}`, overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: 'none', background: isActive ? (isDark ? 'rgba(255,119,34,0.15)' : 'rgba(255,119,34,0.1)') : 'transparent', color: isActive ? '#ff7722' : 'inherit', opacity: isActive ? 1 : 0.7, cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 500, textAlign: 'left', width: '100%' }}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: 220, flex: 1, padding: '32px 48px', maxWidth: 1180 }}>

          {/* ================================================================
              COLORS
              ================================================================ */}
          <Section id="colors" title="Colors" desc="Warm, natural palette" refs={sectionRefs}>
            <Subsection title="Backgrounds">
              <ColorGrid isDark={isDark} colors={[
                { name: 'bg-base', light: '#fbf9ef', dark: '#0d0c0b', token: '--color-bg-base' },
                { name: 'bg-elevated', light: 'rgba(255,255,255,0.85)', dark: 'rgba(30,28,26,0.85)', token: '--color-bg-elevated' },
                { name: 'bg-subtle', light: '#f2f0e7', dark: '#1a1917', token: '--color-bg-subtle' },
                { name: 'bg-subtle-hover', light: '#ebe9df', dark: '#252320', token: '--color-bg-subtle-hover' },
                { name: 'bg-inverse', light: '#171412', dark: '#f5f3eb', token: '--color-bg-inverse' },
                { name: 'bg-white', light: '#ffffff', dark: '#1e1c1a', token: '--color-bg-white' },
                { name: 'bg-overlay', light: 'rgba(251,249,239,0.8)', dark: 'rgba(13,12,11,0.8)', token: '--color-bg-overlay' },
              ]} />
            </Subsection>
            <Subsection title="Text">
              <ColorGrid isDark={isDark} colors={[
                { name: 'text-primary', light: '#171412', dark: '#f5f3eb', token: '--color-text-primary' },
                { name: 'text-secondary', light: '#4a4744', dark: '#a8a29e', token: '--color-text-secondary' },
                { name: 'text-muted', light: '#8e827c', dark: '#6b6561', token: '--color-text-muted' },
                { name: 'text-inverse', light: '#ffffff', dark: '#171412', token: '--color-text-inverse' },
                { name: 'text-on-accent', light: '#ffffff', dark: '#ffffff', token: '--color-text-on-accent' },
              ]} />
            </Subsection>
            <Subsection title="Accent Primary (Orange)">
              <ColorGrid isDark={isDark} colors={[
                { name: 'accent-primary', light: '#ff7722', dark: '#ff8844', token: '--color-accent-primary' },
                { name: 'accent-primary-hover', light: '#e5691e', dark: '#ff9955', token: '--color-accent-primary-hover' },
                { name: 'accent-primary-active', light: '#cc5d1a', dark: '#ffaa66', token: '--color-accent-primary-active' },
                { name: 'accent-primary-subtle', light: 'rgba(255,119,34,0.1)', dark: 'rgba(255,136,68,0.15)', token: '--color-accent-primary-subtle' },
                { name: 'accent-primary-glow', light: 'rgba(255,119,34,0.4)', dark: 'rgba(255,136,68,0.4)', token: '--color-accent-primary-glow' },
              ]} />
            </Subsection>
            <Subsection title="Accent Secondary (Purple)">
              <ColorGrid isDark={isDark} colors={[
                { name: 'accent-secondary', light: '#3d2fa9', dark: '#6b5dd3', token: '--color-accent-secondary' },
                { name: 'accent-secondary-hover', light: '#352994', dark: '#7d70e0', token: '--color-accent-secondary-hover' },
                { name: 'accent-secondary-subtle', light: 'rgba(61,47,169,0.1)', dark: 'rgba(107,93,211,0.15)', token: '--color-accent-secondary-subtle' },
              ]} />
            </Subsection>
            <Subsection title="Semantic">
              <ColorGrid isDark={isDark} colors={[
                { name: 'success', light: '#22c55e', dark: '#34d970', token: '--color-success' },
                { name: 'success-subtle', light: 'rgba(34,197,94,0.15)', dark: 'rgba(52,217,112,0.15)', token: '--color-success-subtle' },
                { name: 'warning', light: '#ffc765', dark: '#ffd077', token: '--color-warning' },
                { name: 'warning-subtle', light: 'rgba(255,199,101,0.2)', dark: 'rgba(255,208,119,0.2)', token: '--color-warning-subtle' },
                { name: 'error', light: '#ff3c34', dark: '#ff5046', token: '--color-error' },
                { name: 'error-subtle', light: 'rgba(255,60,52,0.1)', dark: 'rgba(255,80,70,0.15)', token: '--color-error-subtle' },
              ]} />
            </Subsection>
            <Subsection title="Borders">
              <ColorGrid isDark={isDark} colors={[
                { name: 'border-subtle', light: 'rgba(23,20,18,0.05)', dark: 'rgba(255,255,255,0.05)', token: '--color-border-subtle' },
                { name: 'border-default', light: 'rgba(23,20,18,0.08)', dark: 'rgba(255,255,255,0.08)', token: '--color-border-default' },
                { name: 'border-strong', light: 'rgba(23,20,18,0.15)', dark: 'rgba(255,255,255,0.15)', token: '--color-border-strong' },
              ]} />
            </Subsection>
            <Subsection title="Traffic Lights">
              <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ c: '#ff5f57', n: 'Close' }, { c: '#ffbd2e', n: 'Minimize' }, { c: '#28c840', n: 'Maximize' }].map(t => (
                    <div key={t.n} style={{ width: 12, height: 12, borderRadius: '50%', background: t.c }} title={t.n} />
                  ))}
                </div>
                <span style={{ fontSize: 13, opacity: 0.5 }}>Active</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(23,20,18,0.15)' }} />
                  ))}
                </div>
                <span style={{ fontSize: 13, opacity: 0.5 }}>Inactive</span>
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              TYPOGRAPHY
              ================================================================ */}
          <Section id="typography" title="Typography" desc="Three typefaces for hierarchy" refs={sectionRefs}>
            <Subsection title="Font Families">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TypeCard name="Display" family="Averia Serif Libre" sample="The quick brown fox" usage="Headlines, hero text" font="Georgia, serif" isDark={isDark} />
                <TypeCard name="Sans" family="Instrument Sans" sample="The quick brown fox" usage="Body, UI, buttons" font="system-ui, sans-serif" isDark={isDark} />
                <TypeCard name="Mono" family="SF Mono" sample="const x = 42;" usage="Code, technical" font="ui-monospace, monospace" isDark={isDark} />
              </div>
            </Subsection>
            <Subsection title="Type Scale">
              <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                {[
                  { name: '5xl', size: 48, use: 'Display' },
                  { name: '4xl', size: 40, use: 'H1' },
                  { name: '3xl', size: 32, use: 'H2' },
                  { name: '2xl', size: 24, use: 'H3' },
                  { name: 'xl', size: 20, use: 'H4' },
                  { name: 'lg', size: 18, use: 'Large' },
                  { name: 'base', size: 14, use: 'Body' },
                  { name: 'sm', size: 12, use: 'Small' },
                  { name: 'xs', size: 10, use: 'Caption' },
                ].map((t, i, arr) => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                    <span style={{ width: 40, fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{t.name}</span>
                    <span style={{ fontSize: t.size, fontWeight: 600, flex: 1 }}>Aa</span>
                    <span style={{ fontSize: 12, opacity: 0.5 }}>{t.size}px</span>
                    <span style={{ fontSize: 12, opacity: 0.5, width: 60 }}>{t.use}</span>
                  </div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Font Weights">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[{ w: 400, n: 'Regular' }, { w: 500, n: 'Medium' }, { w: 600, n: 'Semibold' }, { w: 700, n: 'Bold' }].map(fw => (
                  <div key={fw.w} style={{ padding: '16px 20px', borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                    <span style={{ fontSize: 24, fontWeight: fw.w }}>{fw.w}</span>
                    <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{fw.n}</p>
                  </div>
                ))}
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              SPACING
              ================================================================ */}
          <Section id="spacing" title="Spacing & Layout" desc="8-point grid system" refs={sectionRefs}>
            <Subsection title="Spacing Scale">
              <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                {[
                  { name: 'space-1', v: 4, desc: 'Tight' },
                  { name: 'space-2', v: 8, desc: 'Compact' },
                  { name: 'space-3', v: 12, desc: 'Default' },
                  { name: 'space-4', v: 16, desc: 'Comfortable' },
                  { name: 'space-5', v: 20, desc: 'Relaxed' },
                  { name: 'space-6', v: 24, desc: 'Spacious' },
                  { name: 'space-8', v: 32, desc: 'Large' },
                  { name: 'space-10', v: 40, desc: 'XL' },
                  { name: 'space-12', v: 48, desc: 'Section' },
                  { name: 'space-16', v: 64, desc: 'Page' },
                ].map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                    <span style={{ width: 70, fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }}>{s.name}</span>
                    <div style={{ width: s.v, height: 20, background: 'linear-gradient(90deg, #ff7722, #e5691e)', borderRadius: 4 }} />
                    <span style={{ width: 40, fontSize: 12, opacity: 0.6 }}>{s.v}px</span>
                    <span style={{ fontSize: 12, opacity: 0.4 }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Border Radius">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[{ n: 'xs', v: 4 }, { n: 'sm', v: 6 }, { n: 'md', v: 10 }, { n: 'lg', v: 12 }, { n: 'xl', v: 14 }, { n: '2xl', v: 16 }, { n: 'dock', v: 20 }, { n: 'full', v: 9999 }].map(r => (
                  <div key={r.n} style={{ textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, background: isDark ? 'rgba(255,119,34,0.2)' : 'rgba(255,119,34,0.1)', border: '2px solid #ff7722', borderRadius: r.v, marginBottom: 6 }} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{r.n}</span>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', opacity: 0.5 }}>{r.v === 9999 ? 'full' : `${r.v}px`}</p>
                  </div>
                ))}
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              EFFECTS
              ================================================================ */}
          <Section id="effects" title="Effects" desc="Shadows, blur, glassmorphism" refs={sectionRefs}>
            <Subsection title="Shadows">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {[
                  { n: 'sm', v: '0 2px 8px rgba(23,20,18,0.06)' },
                  { n: 'md', v: '0 4px 20px rgba(23,20,18,0.08)' },
                  { n: 'lg', v: '0 8px 32px rgba(23,20,18,0.12)' },
                  { n: 'xl', v: '0 16px 48px rgba(23,20,18,0.15)' },
                  { n: 'window', v: '0 2px 4px rgba(23,20,18,0.04), 0 12px 32px rgba(23,20,18,0.12)' },
                  { n: 'dock', v: '0 8px 32px rgba(23,20,18,0.12)' },
                  { n: 'badge', v: '0 2px 6px rgba(255,119,34,0.4)' },
                ].map(s => (
                  <div key={s.n} style={{ padding: 20, borderRadius: 12, background: isDark ? '#1a1917' : '#fff', boxShadow: s.v, textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>shadow-{s.n}</span>
                  </div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Glassmorphism">
              <div style={{ padding: 32, borderRadius: 16, background: 'linear-gradient(135deg, #ff7722 0%, #3d2fa9 50%, #22c55e 100%)', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[{ n: 'Subtle', blur: 12, op: 0.5 }, { n: 'Medium', blur: 20, op: 0.6 }, { n: 'Heavy', blur: 24, op: 0.7 }].map(g => (
                  <div key={g.n} style={{ width: 120, height: 80, background: `rgba(255,255,255,${g.op})`, backdropFilter: `blur(${g.blur}px)`, WebkitBackdropFilter: `blur(${g.blur}px)`, borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#171412' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{g.n}</span>
                    <span style={{ fontSize: 10, opacity: 0.6 }}>{g.blur}px</span>
                  </div>
                ))}
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              MOTION
              ================================================================ */}
          <Section id="motion" title="Motion" desc="Spring-based animations" refs={sectionRefs}>
            <Subsection title="Spring Presets">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { n: 'smooth', s: 300, d: 30, desc: 'Modals, transitions' },
                  { n: 'snappy', s: 500, d: 35, desc: 'Buttons, toggles' },
                  { n: 'bouncy', s: 400, d: 25, desc: 'Dock icons, fun' },
                ].map(sp => (
                  <motion.div
                    key={sp.n}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ type: 'spring', stiffness: sp.s, damping: sp.d }}
                    style={{ flex: 1, minWidth: 180, padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}`, cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#ff7722' }}>{sp.n}</span>
                    <p style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.6, marginTop: 4 }}>stiffness: {sp.s}, damping: {sp.d}</p>
                    <p style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>{sp.desc}</p>
                    <p style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>Hover to preview</p>
                  </motion.div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Dock Animation">
              <DockDemo isDark={isDark} />
            </Subsection>
          </Section>

          {/* ================================================================
              ICONS
              ================================================================ */}
          <Section id="icons" title="Icons" desc="Lucide icons at 1.5px stroke" refs={sectionRefs}>
            <Subsection title="Common Icons">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                {[
                  { i: Folder, n: 'Folder' }, { i: FileText, n: 'File' }, { i: ImageIcon, n: 'Image' },
                  { i: Link2, n: 'Link' }, { i: Settings, n: 'Settings' }, { i: Search, n: 'Search' },
                  { i: User, n: 'User' }, { i: Bell, n: 'Bell' }, { i: Heart, n: 'Heart' },
                  { i: Star, n: 'Star' }, { i: Mail, n: 'Mail' }, { i: Calendar, n: 'Calendar' },
                  { i: Clock, n: 'Clock' }, { i: Globe, n: 'Globe' }, { i: MapPin, n: 'Location' },
                  { i: Download, n: 'Download' }, { i: Share2, n: 'Share' }, { i: Bookmark, n: 'Bookmark' },
                  { i: Plus, n: 'Plus' }, { i: X, n: 'Close' }, { i: Check, n: 'Check' },
                  { i: ChevronDown, n: 'ChevDown' }, { i: ChevronRight, n: 'ChevRight' }, { i: ArrowRight, n: 'Arrow' },
                  { i: Edit3, n: 'Edit' }, { i: Trash2, n: 'Delete' }, { i: Copy, n: 'Copy' },
                  { i: MoreHorizontal, n: 'More' }, { i: Filter, n: 'Filter' }, { i: SortAsc, n: 'Sort' },
                  { i: Play, n: 'Play' }, { i: Pause, n: 'Pause' }, { i: Volume2, n: 'Volume' },
                  { i: Eye, n: 'View' }, { i: EyeOff, n: 'Hide' }, { i: Lock, n: 'Lock' },
                  { i: RefreshCw, n: 'Refresh' }, { i: Home, n: 'Home' }, { i: Menu, n: 'Menu' },
                ].map(({ i: Icon, n }) => (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, borderRadius: 8, background: cardBg, border: `1px solid ${border}` }}>
                    <Icon size={20} strokeWidth={1.5} />
                    <span style={{ fontSize: 10, opacity: 0.5 }}>{n}</span>
                  </div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Social Icons">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[Twitter, Github, Linkedin, Instagram, Youtube, Globe].map((Icon, i) => (
                  <div key={i} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: cardBg, border: `1px solid ${border}` }}>
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Keyboard Shortcuts">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ i: Command, l: '⌘' }, { i: Option, l: '⌥' }, { i: CornerDownLeft, l: '↩' }, { i: Delete, l: '⌫' }].map((k, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, background: cardBg, border: `1px solid ${border}`, fontSize: 12 }}>
                    <k.i size={14} /> <span>{k.l}</span>
                  </div>
                ))}
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              DESKTOP COMPONENTS
              ================================================================ */}
          <Section id="desktop" title="Desktop Components" desc="Core desktop UI" refs={sectionRefs}>
            <Subsection title="Menu Bar">
              <MenuBarDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Dock">
              <DockFullDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Desktop Icons">
              <DesktopIconsDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Traffic Lights">
              <TrafficLightsDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Context Menu">
              <ContextMenuDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Command Palette">
              <CommandPaletteDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Welcome Notification">
              <NotificationDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Made With Badge">
              <BadgeDemo isDark={isDark} />
            </Subsection>
          </Section>

          {/* ================================================================
              WINDOWS
              ================================================================ */}
          <Section id="windows" title="Windows" desc="Window types and states" refs={sectionRefs}>
            <Subsection title="Standard Window">
              <WindowDemo isDark={isDark} title="About Me" type="standard" />
            </Subsection>
            <Subsection title="Finder Window">
              <WindowDemo isDark={isDark} title="Projects" type="finder" />
            </Subsection>
            <Subsection title="Notes Window">
              <WindowDemo isDark={isDark} title="Notes" type="notes" />
            </Subsection>
            <Subsection title="Photos Window">
              <WindowDemo isDark={isDark} title="Gallery" type="photos" />
            </Subsection>
            <Subsection title="Browser Window">
              <WindowDemo isDark={isDark} title="Links" type="browser" />
            </Subsection>
            <Subsection title="Settings Window">
              <WindowDemo isDark={isDark} title="Settings" type="settings" />
            </Subsection>
            <Subsection title="Workbench Window">
              <WindowDemo isDark={isDark} title="Now" type="workbench" />
            </Subsection>
            <Subsection title="Window States">
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {['Default', 'Focused', 'Inactive', 'Maximized'].map(state => (
                  <div key={state} style={{ padding: 12, borderRadius: 8, background: cardBg, border: `1px solid ${border}`, fontSize: 13 }}>
                    {state}
                  </div>
                ))}
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              WIDGETS
              ================================================================ */}
          <Section id="widgets" title="Widgets" desc="Desktop widgets" refs={sectionRefs}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              <WidgetDemo name="Clock" icon={Clock} isDark={isDark}>
                <div style={{ fontSize: 32, fontWeight: 700 }}>12:34</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>San Francisco</div>
              </WidgetDemo>
              <WidgetDemo name="Contact" icon={Mail} isDark={isDark}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Get in Touch</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>hello@example.com</div>
              </WidgetDemo>
              <WidgetDemo name="Links" icon={Link2} isDark={isDark}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Quick Links</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>5 links</div>
              </WidgetDemo>
              <WidgetDemo name="Tip Jar" icon={DollarSign} isDark={isDark}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Support My Work</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>Buy me a coffee</div>
              </WidgetDemo>
              <WidgetDemo name="Book" icon={Book} isDark={isDark}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Currently Reading</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>The Design of...</div>
              </WidgetDemo>
              <WidgetDemo name="Feedback" icon={ThumbsUp} isDark={isDark}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Rate this site</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>{[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#ff7722" color="#ff7722" />)}</div>
              </WidgetDemo>
              <WidgetDemo name="Status" icon={Activity} isDark={isDark}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Available</span>
                </div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>Open to work</div>
              </WidgetDemo>
            </div>
          </Section>

          {/* ================================================================
              CONTENT BLOCKS
              ================================================================ */}
          <Section id="blocks" title="Content Blocks" desc="30+ block types for rich content" refs={sectionRefs}>
            <Subsection title="Text Blocks">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <BlockDemo name="Heading" isDark={isDark}>
                  <h2 style={{ fontSize: 24, fontWeight: 700 }}>Section Title</h2>
                </BlockDemo>
                <BlockDemo name="Text" isDark={isDark}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.8 }}>Body text with rich formatting support. This is a paragraph of sample text demonstrating the typography and spacing.</p>
                </BlockDemo>
                <BlockDemo name="Quote" isDark={isDark}>
                  <blockquote style={{ borderLeft: '3px solid #ff7722', paddingLeft: 16, fontStyle: 'italic', opacity: 0.9 }}>
                    &ldquo;Design is not just what it looks like and feels like. Design is how it works.&rdquo;
                    <footer style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>— Steve Jobs</footer>
                  </blockquote>
                </BlockDemo>
                <BlockDemo name="Callout" isDark={isDark}>
                  <div style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 12, background: isDark ? 'rgba(255,119,34,0.1)' : 'rgba(255,119,34,0.08)' }}>
                    <AlertCircle size={20} color="#ff7722" />
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Note</div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>Important information goes here.</div>
                    </div>
                  </div>
                </BlockDemo>
                <BlockDemo name="Divider" isDark={isDark}>
                  <hr style={{ border: 'none', height: 1, background: border, margin: '16px 0' }} />
                </BlockDemo>
              </div>
            </Subsection>
            <Subsection title="List Blocks">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <BlockDemo name="Bullet List" isDark={isDark}>
                  <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2 }}>
                    <li>First item</li>
                    <li>Second item</li>
                    <li>Third item</li>
                  </ul>
                </BlockDemo>
                <BlockDemo name="Numbered List" isDark={isDark}>
                  <ol style={{ paddingLeft: 20, fontSize: 14, lineHeight: 2 }}>
                    <li>Step one</li>
                    <li>Step two</li>
                    <li>Step three</li>
                  </ol>
                </BlockDemo>
                <BlockDemo name="Checklist" isDark={isDark}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Complete design', 'Review code', 'Ship feature'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${i === 0 ? '#22c55e' : border}`, background: i === 0 ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {i === 0 && <Check size={12} color="white" />}
                        </div>
                        <span style={{ textDecoration: i === 0 ? 'line-through' : 'none', opacity: i === 0 ? 0.5 : 1 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </BlockDemo>
              </div>
            </Subsection>
            <Subsection title="Media Blocks">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <BlockDemo name="Image" isDark={isDark}>
                  <div style={{ width: '100%', height: 120, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={32} style={{ opacity: 0.3 }} />
                  </div>
                </BlockDemo>
                <BlockDemo name="Gallery" isDark={isDark}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)' }} />
                    ))}
                  </div>
                </BlockDemo>
                <BlockDemo name="Video" isDark={isDark}>
                  <div style={{ width: '100%', height: 120, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={32} style={{ opacity: 0.3 }} />
                  </div>
                </BlockDemo>
                <BlockDemo name="Embed" isDark={isDark}>
                  <div style={{ width: '100%', height: 120, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${border}` }}>
                    <Globe size={24} style={{ opacity: 0.3 }} />
                    <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.4 }}>Embed URL</span>
                  </div>
                </BlockDemo>
              </div>
            </Subsection>
            <Subsection title="Data Blocks">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <BlockDemo name="Stats" isDark={isDark}>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[{ n: '50+', l: 'Projects' }, { n: '10y', l: 'Experience' }, { n: '100%', l: 'Satisfaction' }].map(s => (
                      <div key={s.n} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#ff7722' }}>{s.n}</div>
                        <div style={{ fontSize: 11, opacity: 0.6 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </BlockDemo>
                <BlockDemo name="Timeline" isDark={isDark}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[{ y: '2024', t: 'Senior Designer' }, { y: '2022', t: 'Designer' }].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff7722', marginTop: 6 }} />
                        <div>
                          <div style={{ fontSize: 11, color: '#ff7722', fontWeight: 600 }}>{item.y}</div>
                          <div style={{ fontSize: 13 }}>{item.t}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </BlockDemo>
                <BlockDemo name="Details/Accordion" isDark={isDark}>
                  <details style={{ fontSize: 14 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>Click to expand</summary>
                    <p style={{ opacity: 0.7, paddingLeft: 16 }}>Hidden content revealed on click.</p>
                  </details>
                </BlockDemo>
              </div>
            </Subsection>
            <Subsection title="Interactive Blocks">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <BlockDemo name="Buttons" isDark={isDark}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#ff7722', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Primary</button>
                    <button style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${border}`, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'inherit' }}>Secondary</button>
                  </div>
                </BlockDemo>
                <BlockDemo name="Links" isDark={isDark}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Portfolio', 'GitHub', 'LinkedIn'].map(link => (
                      <div key={link} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,20,18,0.03)', fontSize: 13 }}>
                        <span>{link}</span>
                        <ArrowRight size={14} style={{ opacity: 0.4 }} />
                      </div>
                    ))}
                  </div>
                </BlockDemo>
                <BlockDemo name="Social Links" isDark={isDark}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                      <div key={i} style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Icon size={18} />
                      </div>
                    ))}
                  </div>
                </BlockDemo>
                <BlockDemo name="Download" isDark={isDark}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,20,18,0.03)' }}>
                    <Download size={20} color="#ff7722" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Resume.pdf</div>
                      <div style={{ fontSize: 11, opacity: 0.5 }}>245 KB</div>
                    </div>
                    <ArrowRight size={14} style={{ opacity: 0.4 }} />
                  </div>
                </BlockDemo>
              </div>
            </Subsection>
            <Subsection title="Showcase Blocks">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <BlockDemo name="Case Study" isDark={isDark}>
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}` }}>
                    <div style={{ height: 100, background: 'linear-gradient(135deg, #ff7722, #e5691e)' }} />
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 11, color: '#ff7722', fontWeight: 600, marginBottom: 4 }}>UI/UX Design</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>App Redesign</div>
                      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Complete mobile app redesign...</p>
                    </div>
                  </div>
                </BlockDemo>
                <BlockDemo name="Testimonial" isDark={isDark}>
                  <div style={{ padding: 20, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,119,34,0.05)' }}>
                    <Quote size={20} color="#ff7722" style={{ opacity: 0.5 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12, fontStyle: 'italic' }}>&ldquo;Amazing work! Exceeded expectations.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ff7722' }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>John Doe</div>
                        <div style={{ fontSize: 11, opacity: 0.6 }}>CEO, Company</div>
                      </div>
                    </div>
                  </div>
                </BlockDemo>
                <BlockDemo name="Product" isDark={isDark}>
                  <div style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
                    <div style={{ width: 80, height: 80, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Design Course</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#ff7722', marginTop: 4 }}>$99</div>
                      <button style={{ marginTop: 8, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#ff7722', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Buy Now</button>
                    </div>
                  </div>
                </BlockDemo>
                <BlockDemo name="Logos" isDark={isDark}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ width: 48, height: 48, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)' }} />
                    ))}
                  </div>
                </BlockDemo>
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              FORMS & INPUTS
              ================================================================ */}
          <Section id="forms" title="Forms & Inputs" desc="Form elements and controls" refs={sectionRefs}>
            <Subsection title="Text Inputs">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                <InputDemo label="Default" placeholder="Enter text..." isDark={isDark} />
                <InputDemo label="With Icon" placeholder="Search..." icon={Search} isDark={isDark} />
                <InputDemo label="Focused" placeholder="Focused input" focused isDark={isDark} />
                <InputDemo label="Error" placeholder="Invalid input" error isDark={isDark} />
                <InputDemo label="Disabled" placeholder="Disabled" disabled isDark={isDark} />
              </div>
            </Subsection>
            <Subsection title="Textarea">
              <div style={{ maxWidth: 400 }}>
                <textarea
                  placeholder="Write your message..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: 'inherit',
                    fontSize: 14,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            </Subsection>
            <Subsection title="Toggles & Checkboxes">
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                <ToggleDemo label="Toggle Off" checked={false} isDark={isDark} />
                <ToggleDemo label="Toggle On" checked={true} isDark={isDark} />
                <CheckboxDemo label="Checkbox" checked={false} isDark={isDark} />
                <CheckboxDemo label="Checked" checked={true} isDark={isDark} />
              </div>
            </Subsection>
            <Subsection title="Buttons">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#ff7722', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Primary</button>
                <button style={{ padding: '12px 24px', borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Secondary</button>
                <button style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', color: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Ghost</button>
                <button style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#ff3c34', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Danger</button>
                <button style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#ff7722', color: '#fff', fontSize: 14, fontWeight: 600, opacity: 0.5, cursor: 'not-allowed' }}>Disabled</button>
              </div>
            </Subsection>
            <Subsection title="Button Sizes">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#ff7722', color: '#fff', fontSize: 12, fontWeight: 600 }}>Small</button>
                <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#ff7722', color: '#fff', fontSize: 14, fontWeight: 600 }}>Medium</button>
                <button style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: '#ff7722', color: '#fff', fontSize: 16, fontWeight: 600 }}>Large</button>
              </div>
            </Subsection>
            <Subsection title="Icon Buttons">
              <div style={{ display: 'flex', gap: 12 }}>
                {[Plus, Edit3, Trash2, Share2, Download, MoreHorizontal].map((Icon, i) => (
                  <button key={i} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'inherit' }}>
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </Subsection>
            <Subsection title="Select/Dropdown">
              <div style={{ maxWidth: 300 }}>
                <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: 14 }}>Select option</span>
                  <ChevronDown size={16} style={{ opacity: 0.5 }} />
                </div>
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              FEEDBACK
              ================================================================ */}
          <Section id="feedback" title="Feedback" desc="Alerts, toasts, and badges" refs={sectionRefs}>
            <Subsection title="Alerts">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { type: 'info', icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                  { type: 'success', icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                  { type: 'warning', icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { type: 'error', icon: AlertCircle, color: '#ff3c34', bg: 'rgba(255,60,52,0.1)' },
                ].map(alert => (
                  <div key={alert.type} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, background: alert.bg }}>
                    <alert.icon size={20} color={alert.color} />
                    <span style={{ fontSize: 14, textTransform: 'capitalize' }}>{alert.type} message</span>
                  </div>
                ))}
              </div>
            </Subsection>
            <Subsection title="Badges">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { l: 'Primary', bg: '#ff7722', c: '#fff' },
                  { l: 'Subtle', bg: 'rgba(255,119,34,0.1)', c: '#ff7722' },
                  { l: 'Success', bg: '#22c55e', c: '#fff' },
                  { l: 'Warning', bg: '#ffc765', c: '#171412' },
                  { l: 'Error', bg: '#ff3c34', c: '#fff' },
                  { l: 'Neutral', bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', c: 'inherit' },
                  { l: 'New', bg: '#3d2fa9', c: '#fff' },
                ].map(b => (
                  <span key={b.l} style={{ padding: '5px 10px', borderRadius: 9999, background: b.bg, color: b.c, fontSize: 11, fontWeight: 600 }}>{b.l}</span>
                ))}
              </div>
            </Subsection>
            <Subsection title="Toast Notification">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: cardBg, border: `1px solid ${border}`, boxShadow: '0 8px 32px rgba(23,20,18,0.12)' }}>
                <CheckCircle size={20} color="#22c55e" />
                <span style={{ fontSize: 14 }}>Changes saved successfully</span>
                <button style={{ marginLeft: 8, padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5 }}>
                  <X size={16} />
                </button>
              </div>
            </Subsection>
            <Subsection title="Loading States">
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 14 }}>Loading...</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff7722', animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </Subsection>
            <Subsection title="Empty States">
              <div style={{ padding: 40, textAlign: 'center', borderRadius: 16, background: cardBg, border: `1px dashed ${border}` }}>
                <Folder size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No items yet</div>
                <p style={{ fontSize: 13, opacity: 0.5, marginBottom: 16 }}>Create your first item to get started</p>
                <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#ff7722', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Create Item
                </button>
              </div>
            </Subsection>
          </Section>

          {/* ================================================================
              MOBILE
              ================================================================ */}
          <Section id="mobile" title="Mobile" desc="iOS-style mobile components" refs={sectionRefs}>
            <Subsection title="Mobile Preview">
              <MobilePreviewDemo isDark={isDark} />
            </Subsection>
            <Subsection title="Mobile Components">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Lock Screen</div>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>Time, date, notifications</p>
                </div>
                <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Home Screen</div>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>App grid, dock</p>
                </div>
                <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Control Center</div>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>Quick settings</p>
                </div>
                <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>App Icons</div>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>Rounded squares, labels</p>
                </div>
                <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Mobile Dock</div>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>Bottom navigation</p>
                </div>
                <div style={{ padding: 20, borderRadius: 12, background: cardBg, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Contact Sheet</div>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>Action sheet modal</p>
                </div>
              </div>
            </Subsection>
          </Section>

        </main>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function Section({ id, title, desc, children, refs }: { id: string; title: string; desc: string; children: React.ReactNode; refs: React.MutableRefObject<{ [key: string]: HTMLElement | null }> }) {
  return (
    <section ref={(el) => { refs.current[id] = el; }} id={id} style={{ marginBottom: 80, scrollMarginTop: 100 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{title}</h2>
      <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 32 }}>{desc}</p>
      {children}
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function ColorGrid({ colors, isDark }: { colors: Array<{ name: string; light: string; dark: string; token: string }>; isDark: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
      {colors.map(c => (
        <div
          key={c.name}
          onClick={() => { navigator.clipboard.writeText(c.token); setCopied(c.name); setTimeout(() => setCopied(null), 1500); }}
          style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}` }}
        >
          <div style={{ height: 60, background: isDark ? c.dark : c.light, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}` }} />
          <div style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
              {copied === c.name ? <Check size={12} color="#22c55e" /> : <Copy size={12} style={{ opacity: 0.3 }} />}
            </div>
            <p style={{ fontSize: 10, fontFamily: 'monospace', opacity: 0.5, marginTop: 2 }}>{c.token}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TypeCard({ name, family, sample, usage, font, isDark }: { name: string; family: string; sample: string; usage: string; font: string; isDark: boolean }) {
  return (
    <div style={{ padding: 20, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#ff7722', textTransform: 'uppercase' }}>{name}</span>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: font, marginTop: 2 }}>{family}</div>
        </div>
        <span style={{ fontSize: 10, opacity: 0.5 }}>{usage}</span>
      </div>
      <p style={{ fontSize: 20, fontFamily: font, opacity: 0.8 }}>{sample}</p>
    </div>
  );
}

function DockDemo({ isDark }: { isDark: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const icons = [Folder, FileText, ImageIcon, Link2, Settings];
  return (
    <div style={{ padding: 40, borderRadius: 16, background: isDark ? 'linear-gradient(180deg, #1a1917, #0d0c0b)' : 'linear-gradient(180deg, #f2f0e7, #e8e5db)', display: 'flex', justifyContent: 'center' }}>
      <motion.div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 20, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'}`, boxShadow: '0 8px 32px rgba(23,20,18,0.12)' }}>
        {icons.map((Icon, i) => {
          const dist = hovered !== null ? Math.abs(hovered - i) : null;
          const scale = dist === null ? 1 : dist === 0 ? 1.4 : dist === 1 ? 1.15 : 1;
          const y = dist === null ? 0 : dist === 0 ? -12 : dist === 1 ? -4 : 0;
          return (
            <motion.div key={i} onHoverStart={() => setHovered(i)} onHoverEnd={() => setHovered(null)} animate={{ scale, y }} transition={SPRING.bouncy} style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)', borderRadius: 12, cursor: 'pointer', color: isDark ? '#f5f3eb' : '#171412' }}>
              <Icon size={24} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function MenuBarDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: '#ff7722', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>g</span>
        </div>
        {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map(m => (
          <span key={m} style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, cursor: 'pointer' }}>{m}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Activity size={14} style={{ opacity: 0.6 }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>12:34 PM</span>
      </div>
    </div>
  );
}

function DockFullDemo({ isDark }: { isDark: boolean }) {
  const items = [
    { icon: Folder, name: 'Finder', active: true },
    { icon: FileText, name: 'Notes' },
    { icon: ImageIcon, name: 'Photos' },
    { icon: Mail, name: 'Mail' },
    { icon: Settings, name: 'Settings' },
  ];
  return (
    <div style={{ padding: 32, borderRadius: 16, background: isDark ? 'linear-gradient(180deg, #1a1917, #0d0c0b)' : 'linear-gradient(180deg, #f2f0e7, #e8e5db)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: 20, border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)'}` }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)', borderRadius: 12 }}>
              <item.icon size={22} />
            </div>
            {item.active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(23,20,18,0.4)' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopIconsDemo({ isDark }: { isDark: boolean }) {
  const icons = [
    { icon: Folder, name: 'Projects', color: '#3b82f6' },
    { icon: FileText, name: 'About Me', color: '#ff7722' },
    { icon: ImageIcon, name: 'Gallery', color: '#22c55e' },
    { icon: Link2, name: 'Links', color: '#8b5cf6' },
  ];
  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(23,20,18,0.02)' }}>
      {icons.map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}20`, borderRadius: 16, boxShadow: '0 2px 8px rgba(23,20,18,0.06)' }}>
            <item.icon size={28} color={item.color} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, textAlign: 'center' }}>{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function TrafficLightsDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: 20, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}` }}>
      <div>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>With icons (hover)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ c: '#ff5f57', i: X }, { c: '#ffbd2e', i: Minus }, { c: '#28c840', i: Maximize2 }].map((t, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: t.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <t.i size={8} color="rgba(0,0,0,0.5)" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>Default</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>Inactive</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(23,20,18,0.15)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ContextMenuDemo({ isDark }: { isDark: boolean }) {
  const items = [
    { label: 'Open', shortcut: '⌘O' },
    { label: 'Rename', shortcut: '⌘R' },
    { label: 'Duplicate', shortcut: '⌘D' },
    { divider: true },
    { label: 'Move to Trash', shortcut: '⌘⌫', danger: true },
  ];
  return (
    <div style={{ width: 200, borderRadius: 10, background: isDark ? 'rgba(40,38,36,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(23,20,18,0.15)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.08)'}`, overflow: 'hidden', padding: '4px 0' }}>
      {items.map((item, i) => item.divider ? (
        <div key={i} style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)', margin: '4px 8px' }} />
      ) : (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: 13, color: item.danger ? '#ff3c34' : 'inherit', cursor: 'pointer' }}>
          <span>{item.label}</span>
          <span style={{ opacity: 0.4, fontSize: 12 }}>{item.shortcut}</span>
        </div>
      ))}
    </div>
  );
}

function CommandPaletteDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ width: 500, borderRadius: 16, background: isDark ? 'rgba(30,28,26,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)', boxShadow: '0 16px 48px rgba(23,20,18,0.2)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.08)'}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Search size={18} style={{ opacity: 0.4 }} />
        <span style={{ fontSize: 15, opacity: 0.5 }}>Search files and actions...</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <span style={{ padding: '2px 6px', borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', fontSize: 11 }}>⌘K</span>
        </div>
      </div>
      <div style={{ padding: 8 }}>
        {[
          { icon: FileText, name: 'About Me', type: 'Note' },
          { icon: Folder, name: 'Projects', type: 'Folder' },
          { icon: Settings, name: 'Settings', type: 'Action' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: i === 0 ? (isDark ? 'rgba(255,119,34,0.15)' : 'rgba(255,119,34,0.1)') : 'transparent' }}>
            <item.icon size={18} color={i === 0 ? '#ff7722' : undefined} style={{ opacity: i === 0 ? 1 : 0.5 }} />
            <span style={{ flex: 1, fontSize: 14, color: i === 0 ? '#ff7722' : 'inherit' }}>{item.name}</span>
            <span style={{ fontSize: 11, opacity: 0.4 }}>{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, background: isDark ? 'rgba(30,28,26,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(23,20,18,0.15)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.08)'}` }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #ff7722, #e5691e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20 }}>👋</span>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Welcome to goOS</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Click anywhere to explore</div>
      </div>
    </div>
  );
}

function BadgeDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9999, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)', fontSize: 12, fontWeight: 500 }}>
      <span style={{ opacity: 0.6 }}>Made with</span>
      <span style={{ fontWeight: 700, color: '#ff7722' }}>goOS</span>
    </div>
  );
}

function WindowDemo({ isDark, title, type }: { isDark: boolean; title: string; type: string }) {
  const content: Record<string, React.ReactNode> = {
    standard: <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.7 }}>Standard window with rich content. Supports text, images, and interactive elements.</p>,
    finder: (
      <div style={{ display: 'flex', gap: 8 }}>
        {['Projects', 'Archive', 'Shared'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,20,18,0.03)', fontSize: 13 }}>
            <Folder size={16} color="#3b82f6" /> {f}
          </div>
        ))}
      </div>
    ),
    notes: (
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 120, borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}`, paddingRight: 16 }}>
          {['All Notes', 'Favorites'].map(f => <div key={f} style={{ padding: '6px 8px', fontSize: 12, opacity: 0.7 }}>{f}</div>)}
        </div>
        <div style={{ flex: 1, fontSize: 14, opacity: 0.7 }}>Note content area...</div>
      </div>
    ),
    photos: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.05)' }} />
        ))}
      </div>
    ),
    browser: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['Portfolio', 'Twitter', 'GitHub'].map(l => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,20,18,0.03)', fontSize: 13 }}>
            <span>{l}</span>
            <ArrowRight size={14} style={{ opacity: 0.4 }} />
          </div>
        ))}
      </div>
    ),
    settings: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['General', 'Appearance', 'Sounds', 'Privacy'].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 13 }}>
            <Settings size={16} style={{ opacity: 0.5 }} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    ),
    workbench: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['Building new feature', 'Reading design books'].map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(23,20,18,0.03)', fontSize: 13 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff7722', marginTop: 4 }} />
            <span>{e}</span>
          </div>
        ))}
      </div>
    ),
  };
  return (
    <div style={{ width: '100%', maxWidth: 450, borderRadius: 12, background: isDark ? 'rgba(30,28,26,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)', boxShadow: '0 2px 4px rgba(23,20,18,0.04), 0 12px 32px rgba(23,20,18,0.12)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.05)'}` }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500 }}>{title}</span>
        <div style={{ width: 52 }} />
      </div>
      <div style={{ padding: 16 }}>{content[type]}</div>
    </div>
  );
}

function WidgetDemo({ name, icon: Icon, children, isDark }: { name: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode; isDark: boolean }) {
  return (
    <div style={{ padding: 20, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(23,20,18,0.06)'}`, boxShadow: '0 4px 20px rgba(23,20,18,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon size={16} />
        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.5, textTransform: 'uppercase' }}>{name}</span>
      </div>
      {children}
    </div>
  );
}

function BlockDemo({ name, children, isDark }: { name: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div style={{ padding: 20, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(23,20,18,0.08)'}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.4, textTransform: 'uppercase', marginBottom: 12 }}>{name}</div>
      {children}
    </div>
  );
}

function InputDemo({ label, placeholder, icon: Icon, focused, error, disabled, isDark }: { label: string; placeholder: string; icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; focused?: boolean; error?: boolean; disabled?: boolean; isDark: boolean }) {
  const border = error ? '#ff3c34' : focused ? '#ff7722' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(23,20,18,0.15)';
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, marginBottom: 6, display: 'block' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />}
        <input
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: Icon ? '12px 14px 12px 40px' : '12px 14px',
            borderRadius: 10,
            border: `1px solid ${border}`,
            boxShadow: focused ? '0 0 0 3px rgba(255,119,34,0.15)' : 'none',
            background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
            color: 'inherit',
            fontSize: 14,
            outline: 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>
      {error && <p style={{ fontSize: 11, color: '#ff3c34', marginTop: 4 }}>This field is required</p>}
    </div>
  );
}

function ToggleDemo({ label, checked, isDark }: { label: string; checked: boolean; isDark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#ff7722' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(23,20,18,0.15)'), padding: 2, cursor: 'pointer' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: checked ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s ease' }} />
      </div>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

function CheckboxDemo({ label, checked, isDark }: { label: string; checked: boolean; isDark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? '#ff7722' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(23,20,18,0.2)')}`, background: checked ? '#ff7722' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <Check size={12} color="white" />}
      </div>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

function MobilePreviewDemo({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(23,20,18,0.02)', borderRadius: 16 }}>
      <div style={{ width: 280, height: 560, borderRadius: 40, background: isDark ? '#1a1917' : '#fff', border: `8px solid ${isDark ? '#2a2826' : '#e0ded6'}`, overflow: 'hidden', position: 'relative' }}>
        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', fontSize: 12, fontWeight: 600 }}>
          <span>9:41</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <Activity size={12} />
            <Activity size={12} />
          </div>
        </div>
        {/* Home indicator */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 120, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(23,20,18,0.2)' }} />
        {/* App grid */}
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[Folder, FileText, ImageIcon, Mail, Calendar, Settings, Globe, Star].map((Icon, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `hsl(${i * 45}, 70%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} color="white" />
              </div>
              <span style={{ fontSize: 9, opacity: 0.7 }}>App</span>
            </div>
          ))}
        </div>
        {/* Dock */}
        <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, display: 'flex', justifyContent: 'center', gap: 16, padding: 8, borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
          {[Folder, Mail, Globe, Settings].map((Icon, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: `hsl(${i * 90}, 70%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color="white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
