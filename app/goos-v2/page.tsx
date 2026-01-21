'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Terminal,
  MessageCircle,
  Mail,
  StickyNote as StickyNoteIcon,
  Battery,
  Wifi,
  FileText,
  Settings,
  MessageSquare,
  BarChart3,
  Sun,
  Moon,
  Cloud,
  X,
  Minus,
  Maximize2,
  ChevronRight,
  Send,
  Heart,
  Sparkles,
} from 'lucide-react';
import { EditProvider, useEditContextSafe } from '@/contexts/EditContext';
import { WindowProvider, useWindowContext } from '@/contexts/WindowContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { type GuestbookEntry } from '@/components/desktop/Guestbook';
import type { DesktopItem, StatusWidget as StatusWidgetType } from '@/types';
import {
  GoOSFileIcon,
  GoOSDesktopContextMenu,
  GoOSFileContextMenu,
  GoOSFolderWindow,
  GoOSCreateFileDialog,
  type GoOSFile,
  type FileType,
} from '@/components/goos-editor';
import { GoOSProvider, useGoOS, type GoOSFileData } from '@/contexts/GoOSContext';
import { WidgetProvider, useWidgets } from '@/contexts/WidgetContext';
import { ViewSwitcher, PageView, PresentView } from '@/components/views';
import { CaseStudyPageView } from '@/components/casestudy';
import type { ViewMode, WidgetType } from '@/types';

// ============================================
// LAZY LOAD HEAVY EDITOR COMPONENT
// ============================================
const GoOSEditorWindow = dynamic(
  () => import('@/components/goos-editor/GoOSEditorWindow').then(mod => ({ default: mod.GoOSEditorWindow })),
  { loading: () => <LoadingSpinner />, ssr: false }
);

// ============================================
// LOADING SPINNER (Appart-styled)
// ============================================
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-8, 32px)',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 20,
          height: 20,
          border: '2px solid var(--color-border-default)',
          borderTopColor: 'var(--color-accent-primary)',
          borderRadius: 'var(--radius-full)',
        }}
      />
    </div>
  );
}

// ============================================
// DEMO DATA
// ============================================
const DEMO_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  { id: '1', name: 'Sarah Chen', message: 'Love the retro vibes! Takes me back to my first Mac.', timestamp: new Date('2024-01-15'), emoji: '💖' },
  { id: '2', name: 'Marcus Webb', message: 'The attention to detail here is incredible. Bookmarked!', timestamp: new Date('2024-01-14'), emoji: '🔥' },
  { id: '3', name: 'Yuki Tanaka', message: 'This is the coolest portfolio I\'ve ever seen!', timestamp: new Date('2024-01-13'), emoji: '✨' },
];

const DEMO_ANALYTICS_DATA = {
  totalViews: 12847,
  uniqueVisitors: 8234,
  avgTimeOnSite: '2m 34s',
  topPages: [
    { name: 'Home', views: 4521 },
    { name: 'Projects', views: 3102 },
    { name: 'About', views: 2891 },
    { name: 'Contact', views: 1433 },
  ],
  referrers: [
    { source: 'Twitter', visits: 2341 },
    { source: 'LinkedIn', visits: 1892 },
    { source: 'Direct', visits: 1543 },
    { source: 'Google', visits: 987 },
  ],
  weeklyViews: [320, 450, 380, 520, 610, 480, 590],
};

const DEMO_STATUS_WIDGET: StatusWidgetType = {
  id: 'status-1',
  desktopId: 'demo',
  status: 'available',
  title: 'Open for work',
  subtitle: 'Looking for exciting projects',
  showArrow: true,
  arrowUrl: 'mailto:hello@example.com',
  position: { x: 85, y: 85 },
};

// ============================================
// TRAFFIC LIGHTS (Window Controls)
// ============================================
const TrafficLights = React.memo(({
  onClose,
  onMinimize,
  onMaximize,
  isInactive = false,
}: {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isInactive?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = (color: string): React.CSSProperties => ({
    width: 'var(--window-traffic-size)',
    height: 'var(--window-traffic-size)',
    borderRadius: 'var(--radius-full)',
    background: isInactive ? 'var(--color-traffic-inactive)' : color,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background var(--transition-fast) var(--ease-out)`,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--window-traffic-gap)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} style={buttonStyle('var(--color-traffic-close)')} aria-label="Close">
        {isHovered && !isInactive && <X size={8} strokeWidth={2.5} style={{ color: 'rgba(77, 0, 0, 0.8)' }} />}
      </button>
      <button onClick={onMinimize} style={buttonStyle('var(--color-traffic-minimize)')} aria-label="Minimize">
        {isHovered && !isInactive && <Minus size={8} strokeWidth={2.5} style={{ color: 'rgba(100, 65, 0, 0.8)' }} />}
      </button>
      <button onClick={onMaximize} style={buttonStyle('var(--color-traffic-maximize)')} aria-label="Maximize">
        {isHovered && !isInactive && <Maximize2 size={7} strokeWidth={2.5} style={{ color: 'rgba(0, 70, 0, 0.8)' }} />}
      </button>
    </div>
  );
});
TrafficLights.displayName = 'TrafficLights';

// ============================================
// WINDOW COMPONENT (Appart-styled)
// ============================================
interface WindowProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  zIndex: number;
  defaultX?: number;
  defaultY?: number;
  width?: number;
  height?: number;
  onClose: () => void;
  onFocus: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

const Window = React.memo(({
  title,
  icon,
  isOpen,
  zIndex,
  defaultX = 100,
  defaultY = 100,
  width = 500,
  height = 400,
  onClose,
  onFocus,
  children,
  isActive = true,
}: WindowProps) => {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onClick={onFocus}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        width,
        height,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--window-radius)',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-window)',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          height: 'var(--window-titlebar-height)',
          padding: '0 14px',
          background: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
          cursor: 'grab',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <TrafficLights onClose={onClose} isInactive={!isActive} />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          {icon && <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>}
          <span style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}>
            {title}
          </span>
        </div>
        <div style={{ width: 52 }} /> {/* Balance for traffic lights */}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--color-bg-white)',
      }}>
        {children}
      </div>
    </motion.div>
  );
});
Window.displayName = 'Window';

// ============================================
// DOCK ICON (Appart-styled)
// ============================================
const DockIcon = React.memo(({
  icon,
  label,
  onClick,
  isActive = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number;
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15, y: -6 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      title={label}
      style={{
        width: 'var(--dock-icon-size)',
        height: 'var(--dock-icon-size)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--dock-icon-radius)',
        cursor: 'pointer',
        position: 'relative',
        color: 'var(--color-text-primary)',
        transition: `background var(--transition-fast) var(--ease-out)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-subtle-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}

      {/* Active indicator dot */}
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'var(--dock-active-dot-size)',
          height: 'var(--dock-active-dot-size)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-text-primary)',
        }} />
      )}

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <div style={{
          position: 'absolute',
          top: 2,
          right: 2,
          minWidth: 'var(--dock-badge-size)',
          height: 'var(--dock-badge-size)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-on-accent)',
          background: 'var(--color-accent-primary)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-badge)',
        }}>
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </motion.button>
  );
});
DockIcon.displayName = 'DockIcon';

// ============================================
// DOCK (Appart-styled)
// ============================================
const Dock = React.memo(({
  items,
}: {
  items: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
    badge?: number;
  }>;
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
      style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--dock-icon-gap)',
        padding: 'var(--dock-padding)',
        background: 'var(--color-bg-elevated)',
        backdropFilter: `blur(var(--blur-heavy))`,
        WebkitBackdropFilter: `blur(var(--blur-heavy))`,
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-dock)',
        boxShadow: 'var(--shadow-dock)',
        zIndex: 'var(--z-dock)',
      }}
    >
      {items.map((item) => (
        <DockIcon key={item.id} {...item} />
      ))}
    </motion.div>
  );
});
Dock.displayName = 'Dock';

// ============================================
// MENU BAR (Appart-styled with floating margins)
// ============================================
const MenuBar = React.memo(({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) => {
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good morning!');
      else if (hour < 17) setGreeting('Good afternoon!');
      else setGreeting('Good evening!');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed',
        top: 'var(--menubar-margin)',
        left: 'var(--menubar-margin)',
        right: 'var(--menubar-margin)',
        height: 'var(--menubar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--color-bg-overlay)',
        backdropFilter: `blur(var(--blur-medium))`,
        WebkitBackdropFilter: `blur(var(--blur-medium))`,
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-menubar)',
        zIndex: 'var(--z-menubar)',
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-base)',
      }}
    >
      {/* Left: Logo and menu items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          letterSpacing: 'var(--letter-spacing-tight)',
        }}>
          goOS
        </span>
        {['File', 'Edit', 'View', 'Help'].map((item) => (
          <button
            key={item}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: `background var(--transition-fast) var(--ease-out)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-subtle-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Center: View toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        background: 'var(--color-bg-subtle-hover)',
        borderRadius: 'var(--radius-md)',
      }}>
        {(['desktop', 'page'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              transition: `all var(--transition-fast) var(--ease-out)`,
              background: viewMode === mode ? 'var(--color-accent-primary)' : 'transparent',
              color: viewMode === mode ? 'var(--color-text-on-accent)' : 'var(--color-text-primary)',
              boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Right: Greeting and time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sun size={14} /> {greeting}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Battery size={14} style={{ color: 'var(--color-text-muted)' }} />
          <Wifi size={14} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <span style={{
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {time}
        </span>
      </div>
    </motion.div>
  );
});
MenuBar.displayName = 'MenuBar';

// ============================================
// STATUS WIDGET (Appart-styled)
// ============================================
const StatusWidget = React.memo(({
  status,
}: {
  status: StatusWidgetType | null;
}) => {
  if (!status) return null;

  const statusColor = status.status === 'available'
    ? 'var(--color-success)'
    : status.status === 'busy'
      ? 'var(--color-accent-primary)'
      : 'var(--color-text-muted)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: 'var(--status-padding)',
        background: 'var(--color-bg-white)',
        borderRadius: 'var(--status-radius)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-status)',
        zIndex: 'var(--z-status-widget)',
      }}
    >
      {/* Status dot with glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          width: 'var(--status-dot-size)',
          height: 'var(--status-dot-size)',
          borderRadius: 'var(--radius-full)',
          background: statusColor,
          boxShadow: `0 0 8px ${statusColor}`,
        }}
      />

      {/* Text */}
      <div>
        <div style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          {status.title}
        </div>
        {status.subtitle && (
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
          }}>
            {status.subtitle}
          </div>
        )}
      </div>

      {/* Arrow button */}
      {status.showArrow && (
        <a
          href={status.arrowUrl || '#'}
          style={{
            width: 'var(--status-arrow-size)',
            height: 'var(--status-arrow-size)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-inverse)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-inverse)',
            textDecoration: 'none',
            transition: `background var(--transition-fast) var(--ease-out)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-inverse)';
          }}
        >
          <ChevronRight size={16} style={{ transform: 'rotate(-45deg)' }} />
        </a>
      )}
    </motion.div>
  );
});
StatusWidget.displayName = 'StatusWidget';

// ============================================
// GUESTBOOK (Appart-styled)
// ============================================
const Guestbook = React.memo(({
  entries,
  onAddEntry,
}: {
  entries: GuestbookEntry[];
  onAddEntry: (entry: Omit<GuestbookEntry, 'id' | 'timestamp'>) => void;
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const emojis = ['💖', '🔥', '✨', '🚀', '👏', '🎉'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && message.trim()) {
      onAddEntry({ name: name.trim(), message: message.trim(), emoji: selectedEmoji });
      setName('');
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'var(--font-family)' }}>
      {/* Entry form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--input-padding)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--input-radius)',
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: `border var(--transition-fast) var(--ease-out), box-shadow var(--transition-fast) var(--ease-out)`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.boxShadow = `0 0 0 var(--input-focus-ring) var(--color-accent-primary-subtle)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <textarea
            placeholder="Leave a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--input-padding)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--input-radius)',
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-text-primary)',
              resize: 'none',
              outline: 'none',
              transition: `border var(--transition-fast) var(--ease-out), box-shadow var(--transition-fast) var(--ease-out)`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent-primary)';
              e.currentTarget.style.boxShadow = `0 0 0 var(--input-focus-ring) var(--color-accent-primary-subtle)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedEmoji === emoji ? 'var(--color-accent-primary-subtle)' : 'transparent',
                  border: selectedEmoji === emoji ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: 'var(--color-accent-primary)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px var(--color-accent-primary-glow)',
              transition: `background var(--transition-fast) var(--ease-out)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-primary)';
            }}
          >
            <Send size={14} /> Sign
          </button>
        </div>
      </form>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '12px',
              background: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>{entry.emoji}</span>
              <span style={{
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}>
                {entry.name}
              </span>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
                marginLeft: 'auto',
              }}>
                {entry.timestamp.toLocaleDateString()}
              </span>
            </div>
            <p style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-normal)',
            }}>
              {entry.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
Guestbook.displayName = 'Guestbook';

// ============================================
// ANALYTICS DASHBOARD (Appart-styled)
// ============================================
const AnalyticsDashboard = React.memo(({ data }: { data: typeof DEMO_ANALYTICS_DATA }) => {
  const maxViews = Math.max(...data.weeklyViews);

  return (
    <div style={{ padding: '20px', fontFamily: 'var(--font-family)' }}>
      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {[
          { label: 'Total Views', value: data.totalViews.toLocaleString() },
          { label: 'Unique Visitors', value: data.uniqueVisitors.toLocaleString() },
          { label: 'Avg. Time', value: data.avgTimeOnSite },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '16px',
              background: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              letterSpacing: 'var(--letter-spacing-tight)',
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}>
          Weekly Views
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: 100,
          padding: '12px',
          background: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
        }}>
          {data.weeklyViews.map((views, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(views / maxViews) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                flex: 1,
                background: 'var(--color-accent-primary)',
                borderRadius: 'var(--radius-xs)',
                minHeight: 4,
              }}
            />
          ))}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
        }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>

      {/* Top pages */}
      <div>
        <h3 style={{
          fontSize: 'var(--font-size-md)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}>
          Top Pages
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.topPages.map((page) => (
            <div
              key={page.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
              }}>
                {page.name}
              </span>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
              }}>
                {page.views.toLocaleString()} views
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
AnalyticsDashboard.displayName = 'AnalyticsDashboard';

// ============================================
// DESKTOP ICON (Appart-styled)
// ============================================
const DesktopIcon = React.memo(({
  file,
  isSelected,
  isDragOver,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
}: {
  file: GoOSFile;
  isSelected: boolean;
  isDragOver: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDragStart: () => void;
  onDragEnd: (pos: { x: number; y: number }) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
}) => {
  const getIcon = () => {
    switch (file.type) {
      case 'folder':
        return <Folder size={28} strokeWidth={1.5} />;
      case 'case-study':
        return <FileText size={28} strokeWidth={1.5} />;
      default:
        return <StickyNoteIcon size={28} strokeWidth={1.5} />;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={(e, info) => {
        // Calculate percentage position
        const x = ((file.position?.x || 0) + (info.offset.x / window.innerWidth) * 100);
        const y = ((file.position?.y || 0) + (info.offset.y / window.innerHeight) * 100);
        onDragEnd({ x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(90, y)) });
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onDragOver={(e) => {
        e.preventDefault();
        if (file.type === 'folder') onDragOver();
      }}
      onDragLeave={onDragLeave}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'absolute',
        left: `${file.position?.x || 5}%`,
        top: `${file.position?.y || 5}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--desktop-icon-gap)',
        padding: '8px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        outline: isSelected ? `2px solid var(--color-accent-primary)` : 'none',
        outlineOffset: '2px',
        background: isDragOver ? 'var(--color-accent-primary-subtle)' : 'transparent',
      }}
    >
      {/* Icon thumbnail */}
      <div style={{
        width: 'var(--desktop-icon-size)',
        height: 'var(--desktop-icon-size)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-subtle)',
        borderRadius: 'var(--desktop-icon-radius)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-icon)',
        color: 'var(--color-text-primary)',
        transition: `box-shadow var(--transition-medium) var(--ease-out)`,
      }}>
        {getIcon()}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        color: isSelected ? 'var(--color-text-on-accent)' : 'var(--color-text-primary)',
        background: isSelected ? 'var(--color-accent-primary)' : 'transparent',
        padding: isSelected ? '2px 8px' : '2px 4px',
        borderRadius: 'var(--radius-xs)',
        maxWidth: 'var(--desktop-icon-label-max-width)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {file.title}
      </span>
    </motion.div>
  );
});
DesktopIcon.displayName = 'DesktopIcon';

// ============================================
// MAIN CONTENT COMPONENT
// ============================================
function GoOSV2Content() {
  // goOS Context
  const goosContext = useGoOS();
  const {
    files: goosFilesRaw,
    createFile: createGoOSFile,
    updateFile: updateGoOSFile,
    deleteFile: deleteGoOSFile,
    moveFile: moveGoOSFile,
    refreshFiles,
    isLoading: goosLoading,
  } = goosContext;

  // Transform to component format
  const goosFiles: GoOSFile[] = useMemo(() => goosFilesRaw.map(f => ({
    id: f.id,
    type: f.type as FileType,
    title: f.title,
    content: f.content,
    status: f.status,
    accessLevel: f.accessLevel,
    createdAt: new Date(f.createdAt),
    updatedAt: new Date(f.updatedAt),
    parentFolderId: f.parentId || undefined,
    position: f.position,
  })), [goosFilesRaw]);

  // Convert to DesktopItem format for views
  const goosFilesAsDesktopItems: DesktopItem[] = useMemo(() => goosFilesRaw.map((f, index) => ({
    id: f.id,
    desktopId: '',
    label: f.title,
    windowTitle: f.title,
    windowSubtitle: null,
    windowHeaderImage: null,
    windowDescription: f.content || '',
    windowType: 'default' as const,
    windowDetails: null,
    windowGallery: null,
    windowLinks: null,
    thumbnailUrl: '',
    positionX: f.position?.x ?? 50,
    positionY: f.position?.y ?? 50,
    zIndex: 1,
    order: index,
    useTabs: false,
    tabs: [],
    blocks: [],
    commentsEnabled: false,
    isVisible: true,
    itemVariant: 'goos-file' as const,
    goosFileType: f.type as 'note' | 'case-study' | 'folder' | 'image' | 'link' | 'embed' | 'download',
    goosContent: f.content || '',
    publishStatus: f.status as 'draft' | 'published',
    accessLevel: f.accessLevel as 'free' | 'paid' | 'email',
    parentItemId: f.parentId || null,
    createdAt: new Date(f.createdAt),
    updatedAt: new Date(f.updatedAt),
  })), [goosFilesRaw]);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [openEditors, setOpenEditors] = useState<string[]>([]);
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null);
  const [draggingFileId, setDraggingFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Window state
  const [appWindows, setAppWindows] = useState<Record<string, boolean>>({
    guestbook: false,
    analytics: false,
    settings: false,
  });
  const [windowZ, setWindowZ] = useState<Record<string, number>>({
    guestbook: 50,
    analytics: 51,
    settings: 52,
  });
  const [topZIndex, setTopZIndex] = useState(100);

  // Guestbook entries
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(DEMO_GUESTBOOK_ENTRIES);

  // Load files on mount
  useEffect(() => {
    refreshFiles();
  }, []);

  // Desktop shows root-level files
  const filesOnDesktop = useMemo(() => goosFiles.filter(f => !f.parentFolderId), [goosFiles]);

  // Window management
  const bringToFront = useCallback((windowId: string) => {
    setTopZIndex(prev => prev + 1);
    setWindowZ(prev => ({ ...prev, [windowId]: topZIndex + 1 }));
  }, [topZIndex]);

  const toggleWindow = useCallback((windowId: string) => {
    setAppWindows(prev => {
      const newState = { ...prev, [windowId]: !prev[windowId] };
      if (newState[windowId]) {
        bringToFront(windowId);
      }
      return newState;
    });
  }, [bringToFront]);

  // File handlers
  const handleFileClick = useCallback((e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    setSelectedFileId(fileId);
  }, []);

  const handleFileDoubleClick = useCallback((fileId: string) => {
    const file = goosFiles.find(f => f.id === fileId);
    if (!file) return;

    if (file.type === 'folder') {
      // TODO: Open folder window
    } else {
      // Open in editor
      if (!openEditors.includes(fileId)) {
        setOpenEditors(prev => [...prev, fileId]);
      }
      setActiveEditorId(fileId);
    }
  }, [goosFiles, openEditors]);

  const handleCloseEditor = useCallback((fileId: string) => {
    setOpenEditors(prev => prev.filter(id => id !== fileId));
    if (activeEditorId === fileId) {
      setActiveEditorId(openEditors.find(id => id !== fileId) || null);
    }
  }, [activeEditorId, openEditors]);

  const handlePositionChange = useCallback((pos: { x: number; y: number }, fileId: string) => {
    if (draggingFileId && dragOverFolderId && dragOverFolderId !== draggingFileId) {
      moveGoOSFile(draggingFileId, dragOverFolderId);
    } else {
      updateGoOSFile(fileId, { position: pos });
    }
    setDraggingFileId(null);
    setDragOverFolderId(null);
  }, [draggingFileId, dragOverFolderId, moveGoOSFile, updateGoOSFile]);

  // Dock items
  const dockItems = useMemo(() => [
    { id: 'finder', icon: <Folder size={24} />, label: 'Finder', isActive: false },
    { id: 'notes', icon: <StickyNoteIcon size={24} />, label: 'Notes', isActive: openEditors.length > 0 },
    { id: 'guestbook', icon: <MessageSquare size={24} />, label: 'Guestbook', onClick: () => toggleWindow('guestbook'), isActive: appWindows.guestbook },
    { id: 'analytics', icon: <BarChart3 size={24} />, label: 'Analytics', onClick: () => toggleWindow('analytics'), isActive: appWindows.analytics },
    { id: 'settings', icon: <Settings size={24} />, label: 'Settings', onClick: () => toggleWindow('settings'), isActive: appWindows.settings },
  ], [openEditors, appWindows, toggleWindow]);

  return (
    <div
      onClick={() => setSelectedFileId(null)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg-gradient)',
        fontFamily: 'var(--font-family)',
        overflow: 'hidden',
      }}
    >
      {/* Menu Bar */}
      <MenuBar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Desktop View */}
      {viewMode === 'desktop' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          top: 60,
          bottom: 80,
        }}>
          {/* Desktop Icons */}
          {filesOnDesktop.map((file) => (
            <DesktopIcon
              key={file.id}
              file={file}
              isSelected={selectedFileId === file.id}
              isDragOver={dragOverFolderId === file.id}
              onClick={(e) => handleFileClick(e, file.id)}
              onDoubleClick={() => handleFileDoubleClick(file.id)}
              onDragStart={() => setDraggingFileId(file.id)}
              onDragEnd={(pos) => handlePositionChange(pos, file.id)}
              onDragOver={() => file.type === 'folder' && setDragOverFolderId(file.id)}
              onDragLeave={() => setDragOverFolderId(null)}
            />
          ))}

          {/* Editor Windows */}
          <AnimatePresence>
            {openEditors.map((fileId, index) => {
              const file = goosFiles.find(f => f.id === fileId);
              if (!file) return null;
              return (
                <GoOSEditorWindow
                  key={fileId}
                  file={file}
                  isActive={activeEditorId === fileId}
                  zIndex={topZIndex + index}
                  onClose={() => handleCloseEditor(fileId)}
                  onFocus={() => setActiveEditorId(fileId)}
                  onSave={(content) => updateGoOSFile(fileId, { content })}
                />
              );
            })}
          </AnimatePresence>

          {/* App Windows */}
          <AnimatePresence>
            <Window
              title="Guestbook"
              icon={<MessageSquare size={14} />}
              isOpen={appWindows.guestbook}
              zIndex={windowZ.guestbook}
              defaultX={150}
              defaultY={100}
              width={450}
              height={500}
              onClose={() => toggleWindow('guestbook')}
              onFocus={() => bringToFront('guestbook')}
            >
              <Guestbook
                entries={guestbookEntries}
                onAddEntry={(entry) => {
                  setGuestbookEntries(prev => [
                    { ...entry, id: Date.now().toString(), timestamp: new Date() },
                    ...prev,
                  ]);
                }}
              />
            </Window>

            <Window
              title="Analytics"
              icon={<BarChart3 size={14} />}
              isOpen={appWindows.analytics}
              zIndex={windowZ.analytics}
              defaultX={200}
              defaultY={120}
              width={500}
              height={550}
              onClose={() => toggleWindow('analytics')}
              onFocus={() => bringToFront('analytics')}
            >
              <AnalyticsDashboard data={DEMO_ANALYTICS_DATA} />
            </Window>
          </AnimatePresence>
        </div>
      )}

      {/* Page View */}
      {viewMode === 'page' && (
        <PageView
          items={goosFilesAsDesktopItems}
          isEditing={false}
        />
      )}

      {/* Dock */}
      <Dock items={dockItems} />

      {/* Status Widget */}
      <StatusWidget status={DEMO_STATUS_WIDGET} />

      {/* Loading Overlay */}
      {goosLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(251, 249, 239, 0.8)',
          zIndex: 9999,
        }}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE EXPORT
// ============================================
export default function GoOSV2Page() {
  return (
    <ThemeProvider>
      <EditProvider>
        <WindowProvider>
          <GoOSProvider>
            <WidgetProvider>
              <GoOSV2Content />
            </WidgetProvider>
          </GoOSProvider>
        </WindowProvider>
      </EditProvider>
    </ThemeProvider>
  );
}
