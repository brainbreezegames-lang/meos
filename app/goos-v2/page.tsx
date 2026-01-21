'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Folder,
  FileText,
  StickyNote,
  MessageSquare,
  BarChart3,
  Settings,
  Mail,
  Terminal,
  Music,
  Camera,
  X,
  Minus,
  Maximize2,
  ChevronRight,
  Send,
  Sun,
  Moon,
  Cloud,
  Battery,
  Wifi,
  Search,
  Plus,
  MoreHorizontal,
  Heart,
  Sparkles,
  Zap,
  Star,
} from 'lucide-react';

// ============================================
// APPART DESIGN TOKENS (inline for reliability)
// ============================================
const appart = {
  // Backgrounds
  bg: '#fbf9ef',
  bgDarker: '#f2f0e7',
  bgDark: '#ebe9df',
  bgWhite: '#ffffff',

  // Text
  text: '#171412',
  textMuted: '#8e827c',
  textSecondary: '#4a4744',

  // Accent
  accent: '#ff7722',
  accentHover: '#e5691e',
  accentSubtle: 'rgba(255, 119, 34, 0.1)',
  accentGlow: 'rgba(255, 119, 34, 0.4)',
  secondary: '#3d2fa9',

  // Semantic
  success: '#22c55e',
  warning: '#ffc765',
  error: '#ff3c34',

  // Traffic lights
  trafficRed: '#ff5f57',
  trafficYellow: '#ffbd2e',
  trafficGreen: '#28c840',

  // Borders & Shadows
  border: 'rgba(23, 20, 18, 0.08)',
  borderSubtle: 'rgba(23, 20, 18, 0.05)',
  borderStrong: 'rgba(23, 20, 18, 0.15)',

  shadow: {
    sm: '0 2px 8px rgba(23, 20, 18, 0.06)',
    md: '0 4px 20px rgba(23, 20, 18, 0.08)',
    lg: '0 8px 32px rgba(23, 20, 18, 0.12)',
    window: '0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08)',
    dock: '0 8px 32px rgba(23, 20, 18, 0.12)',
  },

  // Radii
  radius: {
    sm: 6,
    md: 10,
    lg: 12,
    xl: 14,
    xxl: 16,
    dock: 20,
    full: 9999,
  },

  // Blur
  blur: {
    subtle: 12,
    medium: 20,
    heavy: 24,
  },
};

// ============================================
// DEMO DATA
// ============================================
const DEMO_FILES = [
  { id: '1', type: 'note', title: 'About Me', emoji: '👋', position: { x: 4, y: 8 }, color: '#ff7722' },
  { id: '2', type: 'folder', title: 'Projects', emoji: '📁', position: { x: 4, y: 24 }, color: '#3d2fa9' },
  { id: '3', type: 'case-study', title: 'Spotify Redesign', emoji: '🎵', position: { x: 4, y: 40 }, color: '#22c55e' },
  { id: '4', type: 'case-study', title: 'Airbnb Concept', emoji: '🏠', position: { x: 4, y: 56 }, color: '#ff3c34' },
  { id: '5', type: 'note', title: 'Resume.pdf', emoji: '📄', position: { x: 4, y: 72 }, color: '#ffc765' },
  { id: '6', type: 'note', title: 'Contact', emoji: '✉️', position: { x: 14, y: 8 }, color: '#8e827c' },
];

const GUESTBOOK_ENTRIES = [
  { id: '1', name: 'Sarah Chen', message: 'Love the retro vibes! Takes me back to my first Mac.', emoji: '💖', date: 'Jan 15' },
  { id: '2', name: 'Marcus Webb', message: 'The attention to detail here is incredible. Bookmarked!', emoji: '🔥', date: 'Jan 14' },
  { id: '3', name: 'Yuki Tanaka', message: 'This is the coolest portfolio I\'ve ever seen!', emoji: '✨', date: 'Jan 13' },
];

// ============================================
// PLAYFUL LOADING MESSAGES
// ============================================
const LOADING_MESSAGES = [
  { text: "Warming up the pixels...", emoji: "✨" },
  { text: "Feeding the code hamsters...", emoji: "🐹" },
  { text: "Brewing some fresh code...", emoji: "☕" },
  { text: "Polishing the interface...", emoji: "💅" },
];

// ============================================
// CONFETTI BURST
// ============================================
const ConfettiBurst = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: ['#ff7722', '#3d2fa9', '#22c55e', '#ffc765', '#ff3c34'][i % 5],
    x: Math.random() * 200 - 100,
    y: Math.random() * -200 - 50,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: '50vw', y: '50vh', scale: 0, rotate: 0 }}
          animate={{ x: `calc(50vw + ${p.x}px)`, y: `calc(50vh + ${p.y}px)`, scale: p.scale, rotate: p.rotation }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// TRAFFIC LIGHTS
// ============================================
const TrafficLights = ({ onClose, inactive }: { onClose?: () => void; inactive?: boolean }) => {
  const [hovered, setHovered] = useState(false);

  const Button = ({ color, icon, onClick }: { color: string; icon: React.ReactNode; onClick?: () => void }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        width: 12,
        height: 12,
        borderRadius: appart.radius.full,
        background: inactive ? appart.borderStrong : color,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {hovered && !inactive && icon}
    </motion.button>
  );

  return (
    <div
      style={{ display: 'flex', gap: 8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Button color={appart.trafficRed} onClick={onClose} icon={<X size={7} strokeWidth={3} color="rgba(77,0,0,0.8)" />} />
      <Button color={appart.trafficYellow} icon={<Minus size={7} strokeWidth={3} color="rgba(100,65,0,0.8)" />} />
      <Button color={appart.trafficGreen} icon={<Maximize2 size={6} strokeWidth={3} color="rgba(0,70,0,0.8)" />} />
    </div>
  );
};

// ============================================
// WINDOW COMPONENT
// ============================================
const Window = ({
  title,
  icon,
  isOpen,
  onClose,
  onFocus,
  zIndex,
  defaultPosition = { x: 100, y: 100 },
  size = { width: 500, height: 400 },
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  defaultPosition?: { x: number; y: number };
  size?: { width: number; height: number };
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      drag
      dragMomentum={false}
      onClick={onFocus}
      style={{
        position: 'fixed',
        top: defaultPosition.y,
        left: defaultPosition.x,
        width: size.width,
        height: size.height,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        background: appart.bgWhite,
        borderRadius: appart.radius.xl,
        border: `1px solid ${appart.border}`,
        boxShadow: appart.shadow.window,
        overflow: 'hidden',
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          padding: '0 14px',
          background: appart.bgDarker,
          borderBottom: `1px solid ${appart.borderSubtle}`,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <TrafficLights onClose={onClose} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {icon && <span style={{ color: appart.textMuted }}>{icon}</span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: appart.text }}>{title}</span>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', background: appart.bgWhite }}>
        {children}
      </div>
    </motion.div>
  );
};

// ============================================
// DESKTOP ICON
// ============================================
const DesktopIcon = ({
  file,
  isSelected,
  onClick,
  onDoubleClick,
}: {
  file: typeof DEMO_FILES[0];
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) => {
  const getIcon = () => {
    switch (file.type) {
      case 'folder': return <Folder size={28} strokeWidth={1.5} />;
      case 'case-study': return <FileText size={28} strokeWidth={1.5} />;
      default: return <StickyNote size={28} strokeWidth={1.5} />;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={onDoubleClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'absolute',
        left: `${file.position.x}%`,
        top: `${file.position.y}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        cursor: 'pointer',
        borderRadius: appart.radius.md,
        outline: isSelected ? `2px solid ${appart.accent}` : 'none',
        outlineOffset: 3,
      }}
    >
      {/* Icon container */}
      <motion.div
        whileHover={{ boxShadow: appart.shadow.lg }}
        style={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: appart.bgDarker,
          borderRadius: appart.radius.xxl,
          border: `1px solid ${appart.borderSubtle}`,
          boxShadow: appart.shadow.sm,
          color: appart.text,
          position: 'relative',
        }}
      >
        {getIcon()}
        {/* Emoji badge */}
        <span style={{
          position: 'absolute',
          bottom: -4,
          right: -4,
          fontSize: 16,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        }}>
          {file.emoji}
        </span>
      </motion.div>

      {/* Label */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: isSelected ? appart.bgWhite : appart.text,
          background: isSelected ? appart.accent : 'transparent',
          padding: isSelected ? '2px 8px' : '2px 4px',
          borderRadius: 4,
          maxWidth: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        {file.title}
      </span>
    </motion.div>
  );
};

// ============================================
// DOCK ICON
// ============================================
const DockIcon = ({
  icon,
  label,
  isActive,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}) => {
  const y = useMotionValue(0);
  const scale = useTransform(y, [-10, 0], [1.2, 1]);
  const springScale = useSpring(scale, { stiffness: 400, damping: 25 });

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => y.set(-10)}
      onHoverEnd={() => y.set(0)}
      style={{
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: appart.radius.lg,
        cursor: 'pointer',
        position: 'relative',
        color: appart.text,
        scale: springScale,
        y,
      }}
      whileTap={{ scale: 0.9 }}
      title={label}
    >
      {icon}

      {/* Active dot */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: appart.radius.full,
            background: appart.text,
          }}
        />
      )}

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            fontSize: 10,
            fontWeight: 700,
            color: appart.bgWhite,
            background: appart.accent,
            borderRadius: appart.radius.full,
            boxShadow: `0 2px 6px ${appart.accentGlow}`,
          }}
        >
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </motion.button>
  );
};

// ============================================
// DOCK
// ============================================
const Dock = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
    style={{
      position: 'fixed',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: `blur(${appart.blur.heavy}px)`,
      WebkitBackdropFilter: `blur(${appart.blur.heavy}px)`,
      border: `1px solid ${appart.borderSubtle}`,
      borderRadius: appart.radius.dock,
      boxShadow: appart.shadow.dock,
      zIndex: 1000,
    }}
  >
    {children}
  </motion.div>
);

// ============================================
// MENU BAR
// ============================================
const MenuBar = ({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'desktop' | 'page';
  onViewModeChange: (mode: 'desktop' | 'page') => void;
}) => {
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      const h = now.getHours();
      setGreeting(h < 12 ? 'Good morning!' : h < 17 ? 'Good afternoon!' : 'Good evening!');
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        right: 12,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(251, 249, 239, 0.8)',
        backdropFilter: `blur(${appart.blur.medium}px)`,
        WebkitBackdropFilter: `blur(${appart.blur.medium}px)`,
        border: `1px solid ${appart.borderSubtle}`,
        borderRadius: appart.radius.lg,
        boxShadow: appart.shadow.md,
        zIndex: 1001,
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSize: 13,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 700, color: appart.text, letterSpacing: '-0.02em' }}>goOS</span>
        {['File', 'Edit', 'View', 'Help'].map((item) => (
          <button
            key={item}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              borderRadius: appart.radius.sm,
              fontSize: 13,
              fontWeight: 500,
              color: appart.text,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = appart.bgDark}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Center - View Toggle */}
      <div style={{
        display: 'flex',
        gap: 2,
        padding: 3,
        background: appart.bgDark,
        borderRadius: appart.radius.md,
      }}>
        {(['desktop', 'page'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            style={{
              padding: '4px 14px',
              borderRadius: appart.radius.sm,
              border: 'none',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              background: viewMode === mode ? appart.accent : 'transparent',
              color: viewMode === mode ? appart.bgWhite : appart.text,
              boxShadow: viewMode === mode ? appart.shadow.sm : 'none',
              transition: 'all 150ms ease',
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: appart.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sun size={14} /> {greeting}
        </span>
        <div style={{ display: 'flex', gap: 8, color: appart.textMuted }}>
          <Battery size={14} />
          <Wifi size={14} />
        </div>
        <span style={{ fontWeight: 600, color: appart.text, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      </div>
    </motion.div>
  );
};

// ============================================
// STATUS WIDGET
// ============================================
const StatusWidget = () => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.4 }}
    style={{
      position: 'fixed',
      bottom: 80,
      right: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 18px',
      background: appart.bgWhite,
      borderRadius: appart.radius.xl,
      border: `1px solid ${appart.borderSubtle}`,
      boxShadow: appart.shadow.md,
      zIndex: 999,
    }}
  >
    {/* Pulsing dot */}
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        width: 10,
        height: 10,
        borderRadius: appart.radius.full,
        background: appart.success,
        boxShadow: `0 0 8px ${appart.success}`,
      }}
    />

    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: appart.text }}>Open for work</div>
      <div style={{ fontSize: 12, color: appart.textMuted }}>Looking for exciting projects</div>
    </div>

    <motion.a
      href="mailto:hello@example.com"
      whileHover={{ scale: 1.05, background: appart.accent }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: appart.text,
        borderRadius: appart.radius.full,
        color: appart.bgWhite,
        textDecoration: 'none',
      }}
    >
      <ChevronRight size={16} style={{ transform: 'rotate(-45deg)' }} />
    </motion.a>
  </motion.div>
);

// ============================================
// GUESTBOOK WINDOW CONTENT
// ============================================
const GuestbookContent = () => {
  const [entries, setEntries] = useState(GUESTBOOK_ENTRIES);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('💖');
  const emojis = ['💖', '🔥', '✨', '🚀', '👏', '🎉'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setEntries([{ id: Date.now().toString(), name, message, emoji, date: 'Just now' }, ...entries]);
    setName('');
    setMessage('');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            marginBottom: 12,
            padding: '10px 14px',
            background: appart.bgDarker,
            border: `1px solid ${appart.border}`,
            borderRadius: appart.radius.md,
            fontSize: 14,
            color: appart.text,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = appart.accent;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${appart.accentSubtle}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = appart.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <textarea
          placeholder="Leave a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            marginBottom: 12,
            padding: '10px 14px',
            background: appart.bgDarker,
            border: `1px solid ${appart.border}`,
            borderRadius: appart.radius.md,
            fontSize: 14,
            color: appart.text,
            resize: 'none',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = appart.accent;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${appart.accentSubtle}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = appart.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: emoji === e ? appart.accentSubtle : 'transparent',
                  border: emoji === e ? `2px solid ${appart.accent}` : `1px solid ${appart.borderSubtle}`,
                  borderRadius: appart.radius.sm,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '10px 20px',
              background: appart.accent,
              color: appart.bgWhite,
              border: 'none',
              borderRadius: appart.radius.md,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 2px 8px ${appart.accentGlow}`,
            }}
          >
            <Send size={14} /> Sign
          </motion.button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 12,
              background: appart.bgDarker,
              borderRadius: appart.radius.md,
              border: `1px solid ${appart.borderSubtle}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{entry.emoji}</span>
              <span style={{ fontWeight: 600, color: appart.text }}>{entry.name}</span>
              <span style={{ fontSize: 12, color: appart.textMuted, marginLeft: 'auto' }}>{entry.date}</span>
            </div>
            <p style={{ margin: 0, color: appart.textSecondary, lineHeight: 1.5 }}>{entry.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ANALYTICS WINDOW CONTENT
// ============================================
const AnalyticsContent = () => {
  const data = { views: 12847, visitors: 8234, time: '2m 34s' };
  const weeklyViews = [320, 450, 380, 520, 610, 480, 590];
  const maxViews = Math.max(...weeklyViews);

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Views', value: data.views.toLocaleString() },
          { label: 'Unique Visitors', value: data.visitors.toLocaleString() },
          { label: 'Avg. Time', value: data.time },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: 16, background: appart.bgDarker, borderRadius: appart.radius.md, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: appart.text, letterSpacing: '-0.02em' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: appart.textMuted, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: appart.text, marginBottom: 12 }}>Weekly Views</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, padding: 12, background: appart.bgDarker, borderRadius: appart.radius.md }}>
          {weeklyViews.map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / maxViews) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ flex: 1, background: appart.accent, borderRadius: 4, minHeight: 4 }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: appart.textMuted }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
        </div>
      </div>
    </div>
  );
};

// ============================================
// NOTE VIEWER CONTENT
// ============================================
const NoteViewerContent = ({ file }: { file: typeof DEMO_FILES[0] }) => (
  <div style={{ padding: 24, fontFamily: 'Inter, -apple-system, sans-serif' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <span style={{ fontSize: 32 }}>{file.emoji}</span>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: appart.text, margin: 0, letterSpacing: '-0.02em' }}>{file.title}</h1>
    </div>
    <p style={{ fontSize: 15, color: appart.textSecondary, lineHeight: 1.7 }}>
      {file.type === 'case-study'
        ? 'A deep dive into the design process, challenges, and solutions for this project. Scroll to explore the full case study with detailed breakdowns of each phase.'
        : 'This is where the content would be displayed. Double-click to edit and add your own content to this note.'}
    </p>
    {file.type === 'case-study' && (
      <div style={{ marginTop: 24, aspectRatio: '16/9', background: appart.bgDarker, borderRadius: appart.radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: appart.textMuted, border: `1px dashed ${appart.border}` }}>
        Hero Image Preview
      </div>
    )}
  </div>
);

// ============================================
// MAIN PAGE
// ============================================
export default function GoOSV2Page() {
  const [viewMode, setViewMode] = useState<'desktop' | 'page'>('desktop');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({ guestbook: false, analytics: false });
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [topZ, setTopZ] = useState(100);
  const [showConfetti, setShowConfetti] = useState(false);

  const bringToFront = (id: string) => setTopZ((z) => z + 1);

  const toggleWindow = (id: string) => {
    setOpenWindows((w) => ({ ...w, [id]: !w[id] }));
    bringToFront(id);
  };

  const openFile = (id: string) => {
    if (!openFiles.includes(id)) setOpenFiles((f) => [...f, id]);
    bringToFront(id);
  };

  const closeFile = (id: string) => setOpenFiles((f) => f.filter((x) => x !== id));

  return (
    <div
      onClick={() => setSelectedFileId(null)}
      style={{
        position: 'fixed',
        inset: 0,
        background: `linear-gradient(180deg, ${appart.bg} 0%, #f5f3e9 100%)`,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />

      {/* Menu Bar */}
      <MenuBar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Desktop Icons */}
      {viewMode === 'desktop' && (
        <div style={{ position: 'absolute', inset: 0, top: 60, bottom: 80 }}>
          {DEMO_FILES.map((file) => (
            <DesktopIcon
              key={file.id}
              file={file}
              isSelected={selectedFileId === file.id}
              onClick={() => setSelectedFileId(file.id)}
              onDoubleClick={() => openFile(file.id)}
            />
          ))}
        </div>
      )}

      {/* Page View */}
      {viewMode === 'page' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            top: 60,
            overflow: 'auto',
            padding: '40px 60px',
          }}
        >
          <h1 style={{ fontSize: 48, fontWeight: 700, color: appart.text, marginBottom: 8, letterSpacing: '-0.03em' }}>
            Hello, I'm Alex 👋
          </h1>
          <p style={{ fontSize: 18, color: appart.textSecondary, marginBottom: 40, maxWidth: 600, lineHeight: 1.6 }}>
            Product designer passionate about crafting delightful digital experiences. 5+ years of experience with startups and Fortune 500 companies.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {DEMO_FILES.filter(f => f.type !== 'folder').map((file) => (
              <motion.div
                key={file.id}
                whileHover={{ y: -4, boxShadow: appart.shadow.lg }}
                style={{
                  padding: 24,
                  background: appart.bgWhite,
                  borderRadius: appart.radius.xl,
                  border: `1px solid ${appart.border}`,
                  boxShadow: appart.shadow.sm,
                  cursor: 'pointer',
                }}
                onClick={() => openFile(file.id)}
              >
                <span style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>{file.emoji}</span>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: appart.text, margin: 0 }}>{file.title}</h3>
                <p style={{ fontSize: 14, color: appart.textMuted, margin: '8px 0 0' }}>
                  {file.type === 'case-study' ? 'Case Study' : 'Note'}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* File Windows */}
      <AnimatePresence>
        {openFiles.map((fileId, i) => {
          const file = DEMO_FILES.find(f => f.id === fileId);
          if (!file) return null;
          return (
            <Window
              key={fileId}
              title={file.title}
              icon={<span style={{ fontSize: 14 }}>{file.emoji}</span>}
              isOpen
              onClose={() => closeFile(fileId)}
              onFocus={() => bringToFront(fileId)}
              zIndex={topZ + i}
              defaultPosition={{ x: 150 + i * 30, y: 80 + i * 30 }}
              size={{ width: file.type === 'case-study' ? 700 : 500, height: file.type === 'case-study' ? 500 : 400 }}
            >
              <NoteViewerContent file={file} />
            </Window>
          );
        })}
      </AnimatePresence>

      {/* App Windows */}
      <AnimatePresence>
        <Window
          title="Guestbook"
          icon={<MessageSquare size={14} />}
          isOpen={openWindows.guestbook}
          onClose={() => toggleWindow('guestbook')}
          onFocus={() => bringToFront('guestbook')}
          zIndex={topZ}
          defaultPosition={{ x: 180, y: 100 }}
          size={{ width: 450, height: 520 }}
        >
          <GuestbookContent />
        </Window>

        <Window
          title="Analytics"
          icon={<BarChart3 size={14} />}
          isOpen={openWindows.analytics}
          onClose={() => toggleWindow('analytics')}
          onFocus={() => bringToFront('analytics')}
          zIndex={topZ}
          defaultPosition={{ x: 220, y: 120 }}
          size={{ width: 480, height: 400 }}
        >
          <AnalyticsContent />
        </Window>
      </AnimatePresence>

      {/* Dock */}
      <Dock>
        <DockIcon icon={<Folder size={24} />} label="Finder" />
        <DockIcon icon={<StickyNote size={24} />} label="Notes" isActive={openFiles.length > 0} />
        <DockIcon icon={<Mail size={24} />} label="Mail" badge={3} />
        <DockIcon icon={<MessageSquare size={24} />} label="Guestbook" isActive={openWindows.guestbook} onClick={() => toggleWindow('guestbook')} />
        <DockIcon icon={<BarChart3 size={24} />} label="Analytics" isActive={openWindows.analytics} onClick={() => toggleWindow('analytics')} />
        <div style={{ width: 1, height: 24, background: appart.border, margin: '0 4px' }} />
        <DockIcon icon={<Settings size={24} />} label="Settings" />
      </Dock>

      {/* Status Widget */}
      <StatusWidget />

      {/* Confetti */}
      <ConfettiBurst isActive={showConfetti} />
    </div>
  );
}
