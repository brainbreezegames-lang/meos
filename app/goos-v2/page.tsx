'use client';

// goOS v2 - Clean architecture with CSS design system
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Presentation,
  Folder,
  Terminal,
  Settings,
  User,
  Palette,
  Mail,
  Star,
  StickyNote,
} from 'lucide-react';

// V2 Components - all using design-system.css tokens
import { MenuBar } from '@/components/v2/MenuBar';
import { Desktop } from '@/components/v2/Desktop';
import { Dock } from '@/components/v2/Dock';
import { Window } from '@/components/v2/Window';
import { StatusWidget } from '@/components/v2/StatusWidget';

// ============================================
// TYPES
// ============================================
type Theme = 'brand-appart' | 'sketch' | 'monterey' | 'dark';

interface OpenWindow {
  id: string;
  title: string;
  type: 'note' | 'case-study' | 'folder' | 'about' | 'settings';
  icon: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// ============================================
// SAMPLE DATA
// ============================================
const DESKTOP_FILES = [
  { id: 'about', type: 'note' as const, title: 'About Me', position: { x: 3, y: 8 } },
  { id: 'projects', type: 'folder' as const, title: 'Projects', position: { x: 3, y: 22 } },
  { id: 'case-spotify', type: 'case-study' as const, title: 'Spotify Redesign', position: { x: 3, y: 36 } },
  { id: 'case-airbnb', type: 'case-study' as const, title: 'Airbnb Concept', position: { x: 3, y: 50 } },
  { id: 'resume', type: 'note' as const, title: 'Resume.pdf', position: { x: 3, y: 64 } },
];

// ============================================
// THEME SWITCHER COMPONENT
// ============================================
function ThemeSwitcher({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  const themes: { id: Theme; label: string; preview: string }[] = [
    { id: 'brand-appart', label: 'Appart', preview: '#fbf9ef' },
    { id: 'sketch', label: 'Sketch', preview: '#ffffff' },
    { id: 'monterey', label: 'Monterey', preview: '#f5f5f7' },
    { id: 'dark', label: 'Dark', preview: '#1a1a24' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-2)',
      }}
    >
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onThemeChange(theme.id)}
          title={theme.label}
          style={{
            width: 16,
            height: 16,
            borderRadius: 'var(--ds-radius-full)',
            background: theme.preview,
            border: currentTheme === theme.id
              ? '2px solid var(--ds-accent)'
              : '1px solid var(--ds-border-medium)',
            cursor: 'pointer',
            transition: `border var(--ds-duration-fast) var(--ds-ease-out)`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// WINDOW CONTENT COMPONENTS
// ============================================
function AboutContent() {
  return (
    <div
      style={{
        padding: 'var(--ds-space-6)',
        fontFamily: 'var(--ds-font-body)',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--ds-text-3xl)',
          fontWeight: 'var(--ds-weight-bold)',
          fontFamily: 'var(--ds-font-display)',
          color: 'var(--ds-text-primary)',
          marginBottom: 'var(--ds-space-4)',
          letterSpacing: 'var(--ds-tracking-tight)',
        }}
      >
        Hello, I'm Alex 👋
      </h1>
      <p
        style={{
          fontSize: 'var(--ds-text-base)',
          lineHeight: 'var(--ds-leading-relaxed)',
          color: 'var(--ds-text-secondary)',
          marginBottom: 'var(--ds-space-4)',
        }}
      >
        I'm a product designer passionate about creating delightful digital experiences.
        With 5+ years of experience, I've worked with startups and Fortune 500 companies
        to ship products that matter.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-space-3)',
          marginTop: 'var(--ds-space-6)',
        }}
      >
        <button
          style={{
            padding: 'var(--ds-space-2) var(--ds-space-4)',
            background: 'var(--ds-accent)',
            color: 'var(--ds-text-inverse)',
            border: 'none',
            borderRadius: 'var(--ds-radius-md)',
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 'var(--ds-weight-medium)',
            fontFamily: 'var(--ds-font-body)',
            cursor: 'pointer',
          }}
        >
          View Work
        </button>
        <button
          style={{
            padding: 'var(--ds-space-2) var(--ds-space-4)',
            background: 'transparent',
            color: 'var(--ds-text-primary)',
            border: '2px solid var(--ds-border-strong)',
            borderRadius: 'var(--ds-radius-md)',
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 'var(--ds-weight-medium)',
            fontFamily: 'var(--ds-font-body)',
            cursor: 'pointer',
          }}
        >
          Contact
        </button>
      </div>
    </div>
  );
}

function CaseStudyContent({ title }: { title: string }) {
  return (
    <div
      style={{
        padding: 'var(--ds-space-6)',
        fontFamily: 'var(--ds-font-body)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--ds-text-xs)',
          fontWeight: 'var(--ds-weight-semibold)',
          color: 'var(--ds-accent)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--ds-tracking-wider)',
          marginBottom: 'var(--ds-space-2)',
        }}
      >
        Case Study
      </div>
      <h1
        style={{
          fontSize: 'var(--ds-text-2xl)',
          fontWeight: 'var(--ds-weight-bold)',
          fontFamily: 'var(--ds-font-display)',
          color: 'var(--ds-text-primary)',
          marginBottom: 'var(--ds-space-4)',
          letterSpacing: 'var(--ds-tracking-tight)',
        }}
      >
        {title}
      </h1>
      <div
        style={{
          aspectRatio: '16/9',
          background: 'var(--ds-surface-sunken)',
          borderRadius: 'var(--ds-radius-lg)',
          border: '1px solid var(--ds-border-subtle)',
          marginBottom: 'var(--ds-space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ds-text-muted)',
          fontSize: 'var(--ds-text-sm)',
        }}
      >
        Hero Image Placeholder
      </div>
      <p
        style={{
          fontSize: 'var(--ds-text-base)',
          lineHeight: 'var(--ds-leading-relaxed)',
          color: 'var(--ds-text-secondary)',
        }}
      >
        A deep dive into the design process, challenges, and solutions for this project.
        Scroll to explore the full case study.
      </p>
    </div>
  );
}

function FolderContent() {
  const items = ['Design Files', 'Documentation', 'Assets', 'Archive'];
  return (
    <div
      style={{
        padding: 'var(--ds-space-4)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: 'var(--ds-space-4)',
      }}
    >
      {items.map((item) => (
        <div
          key={item}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--ds-space-2)',
            padding: 'var(--ds-space-2)',
            borderRadius: 'var(--ds-radius-md)',
            cursor: 'pointer',
          }}
        >
          <Folder size={32} style={{ color: 'var(--ds-accent)' }} />
          <span
            style={{
              fontSize: 'var(--ds-text-xs)',
              color: 'var(--ds-text-primary)',
              textAlign: 'center',
            }}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function SettingsContent({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}) {
  const themes: { id: Theme; label: string; description: string }[] = [
    { id: 'brand-appart', label: 'Brand Appart', description: 'Warm cream with bold shadows' },
    { id: 'sketch', label: 'Sketch', description: 'Blueprint blue and white' },
    { id: 'monterey', label: 'Monterey', description: 'Classic macOS styling' },
    { id: 'dark', label: 'Dark', description: 'Premium dark mode' },
  ];

  return (
    <div
      style={{
        padding: 'var(--ds-space-6)',
        fontFamily: 'var(--ds-font-body)',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--ds-text-lg)',
          fontWeight: 'var(--ds-weight-semibold)',
          color: 'var(--ds-text-primary)',
          marginBottom: 'var(--ds-space-4)',
        }}
      >
        Appearance
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-space-3)',
              padding: 'var(--ds-space-3)',
              background: currentTheme === theme.id ? 'var(--ds-accent-subtle)' : 'transparent',
              border: currentTheme === theme.id
                ? '2px solid var(--ds-accent)'
                : '1px solid var(--ds-border-subtle)',
              borderRadius: 'var(--ds-radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 'var(--ds-radius-full)',
                border: '2px solid var(--ds-border-strong)',
                background: currentTheme === theme.id ? 'var(--ds-accent)' : 'transparent',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 'var(--ds-text-sm)',
                  fontWeight: 'var(--ds-weight-medium)',
                  color: 'var(--ds-text-primary)',
                }}
              >
                {theme.label}
              </div>
              <div
                style={{
                  fontSize: 'var(--ds-text-xs)',
                  color: 'var(--ds-text-muted)',
                }}
              >
                {theme.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function GoOSV2Page() {
  const prefersReducedMotion = useReducedMotion();
  const [currentTheme, setCurrentTheme] = useState<Theme>('brand-appart');
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windowCounter, setWindowCounter] = useState(0);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = currentTheme;
  }, [currentTheme]);

  const handleFileDoubleClick = useCallback((fileId: string) => {
    // Check if window already open
    const existingWindow = openWindows.find((w) => w.id === fileId);
    if (existingWindow) {
      setActiveWindowId(fileId);
      return;
    }

    // Find file data
    const file = DESKTOP_FILES.find((f) => f.id === fileId);
    if (!file) return;

    // Calculate position with offset
    const baseX = 150;
    const baseY = 80;
    const offset = (windowCounter % 5) * 30;

    const newWindow: OpenWindow = {
      id: fileId,
      title: file.title,
      type: file.type,
      icon: file.type === 'case-study' ? (
        <Presentation size={14} />
      ) : file.type === 'folder' ? (
        <Folder size={14} />
      ) : (
        <FileText size={14} />
      ),
      position: { x: baseX + offset, y: baseY + offset },
      size: { width: file.type === 'case-study' ? 700 : 500, height: file.type === 'case-study' ? 500 : 400 },
    };

    setOpenWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(fileId);
    setWindowCounter((c) => c + 1);
  }, [openWindows, windowCounter]);

  const handleCloseWindow = useCallback((windowId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const handleOpenSettings = useCallback(() => {
    const settingsWindow = openWindows.find((w) => w.id === 'settings');
    if (settingsWindow) {
      setActiveWindowId('settings');
      return;
    }

    const offset = (windowCounter % 5) * 30;
    setOpenWindows((prev) => [
      ...prev,
      {
        id: 'settings',
        title: 'Settings',
        type: 'settings',
        icon: <Settings size={14} />,
        position: { x: 200 + offset, y: 100 + offset },
        size: { width: 400, height: 350 },
      },
    ]);
    setActiveWindowId('settings');
    setWindowCounter((c) => c + 1);
  }, [openWindows, windowCounter]);

  const dockItems = [
    { id: 'finder', icon: <Folder size={24} />, label: 'Finder', isActive: openWindows.some((w) => w.type === 'folder') },
    { id: 'notes', icon: <StickyNote size={24} />, label: 'Notes', isActive: openWindows.some((w) => w.type === 'note') },
    { id: 'mail', icon: <Mail size={24} />, label: 'Mail' },
    { id: 'terminal', icon: <Terminal size={24} />, label: 'Terminal' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Settings', onClick: handleOpenSettings },
  ];

  const renderWindowContent = (window: OpenWindow) => {
    switch (window.type) {
      case 'note':
        return <AboutContent />;
      case 'case-study':
        return <CaseStudyContent title={window.title} />;
      case 'folder':
        return <FolderContent />;
      case 'settings':
        return <SettingsContent currentTheme={currentTheme} onThemeChange={setCurrentTheme} />;
      default:
        return <div style={{ padding: 'var(--ds-space-4)' }}>Content</div>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--ds-surface-base)',
        fontFamily: 'var(--ds-font-body)',
        overflow: 'hidden',
      }}
    >
      {/* Menu Bar */}
      <MenuBar
        appName="goOS v2"
        rightContent={
          <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
        }
      />

      {/* Desktop with file icons */}
      <Desktop
        files={DESKTOP_FILES}
        onFileDoubleClick={handleFileDoubleClick}
      >
        {/* Windows */}
        <AnimatePresence>
          {openWindows.map((window) => (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              icon={window.icon}
              isActive={activeWindowId === window.id}
              initialPosition={window.position}
              initialSize={window.size}
              onClose={() => handleCloseWindow(window.id)}
              onFocus={() => setActiveWindowId(window.id)}
              zIndex={300 + openWindows.indexOf(window) * 10}
            >
              {renderWindowContent(window)}
            </Window>
          ))}
        </AnimatePresence>
      </Desktop>

      {/* Dock */}
      <Dock items={dockItems} />

      {/* Status Widget */}
      <StatusWidget status="available" label="Open to work" sublabel="PST timezone" />
    </div>
  );
}
