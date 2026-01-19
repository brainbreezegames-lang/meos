'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, THEMES, type ThemeId } from '@/contexts/ThemeContext';

interface SettingsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

// Theme preview thumbnails
const themePreviewStyles: Record<ThemeId, { bg: string; window: string; dock: string }> = {
  monterey: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    window: 'rgba(255, 255, 255, 0.85)',
    dock: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    window: 'rgba(32, 32, 38, 0.9)',
    dock: 'rgba(18, 18, 22, 0.72)',
  },
  bluren: {
    bg: 'linear-gradient(180deg, #f8f8f8 0%, #ffffff 50%, #f5f5f7 100%)',
    window: 'rgba(255, 255, 255, 0.95)',
    dock: 'rgba(255, 255, 255, 0.75)',
  },
  refined: {
    bg: 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)',
    window: 'rgba(23, 23, 23, 0.92)',
    dock: 'rgba(255, 255, 255, 0.06)',
  },
  warm: {
    bg: 'linear-gradient(180deg, #F5F5F4 0%, #E7E5E4 100%)',
    window: 'rgba(250, 250, 249, 0.95)',
    dock: 'rgba(255, 255, 255, 0.7)',
  },
  clay: {
    bg: 'linear-gradient(165deg, #F7F4F0 0%, #EDE8E1 100%)',
    window: 'linear-gradient(165deg, #FFFDFB 0%, #F5F1EB 50%, #EDE8E1 100%)',
    dock: 'rgba(237, 232, 225, 0.85)',
  },
  posthog: {
    bg: 'linear-gradient(180deg, #EEEFE9 0%, #E5E7E0 100%)',
    window: '#FFFFFF',
    dock: 'rgba(229, 231, 224, 0.9)',
  },
  sketch: {
    bg: '#FFFFFF',
    window: '#FFFFFF',
    dock: '#FFFFFF',
  },
};

function ThemePreview({ themeId, isActive, onClick }: { themeId: ThemeId; isActive: boolean; onClick: () => void }) {
  const theme = THEMES[themeId];
  const preview = themePreviewStyles[themeId];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="relative w-[100px] h-[70px] rounded-lg overflow-hidden transition-all duration-200"
        style={{
          background: preview.bg,
          boxShadow: isActive
            ? '0 0 0 3px var(--accent-primary), 0 4px 12px rgba(0, 0, 0, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border-light)',
          transform: isActive ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {/* Mini menubar */}
        <div
          className="absolute top-0 left-0 right-0 h-[6px]"
          style={{
            background: theme.isDark ? 'rgba(13, 13, 13, 0.85)' : 'rgba(255, 255, 255, 0.8)',
          }}
        />

        {/* Mini window */}
        <div
          className="absolute top-[12px] left-[8px] w-[55px] h-[35px] rounded-[3px]"
          style={{
            background: preview.window,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Traffic lights */}
          <div className="flex gap-[2px] p-[3px]">
            <div className="w-[4px] h-[4px] rounded-full bg-[#FF5F57]" />
            <div className="w-[4px] h-[4px] rounded-full bg-[#FFBD2E]" />
            <div className="w-[4px] h-[4px] rounded-full bg-[#28CA41]" />
          </div>
        </div>

        {/* Mini dock */}
        <div
          className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[50px] h-[10px] rounded-[3px]"
          style={{
            background: preview.dock,
          }}
        />

        {/* Active checkmark */}
        {isActive && (
          <div
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-primary)' }}
          >
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="text-center">
        <div
          className="text-[12px] font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {theme.name}
        </div>
        <div
          className="text-[10px]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {theme.description}
        </div>
      </div>
    </button>
  );
}

export function SettingsWindow({ isOpen, onClose }: SettingsWindowProps) {
  const { theme, setTheme, availableThemes } = useTheme();
  const isSketch = theme === 'sketch';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[199]"
            style={{
              background: 'var(--bg-overlay)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Window */}
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <motion.div
              className="settings-window pointer-events-auto overflow-hidden"
              style={{
                width: 520,
                maxWidth: '90vw',
                borderRadius: '14px',
                background: isSketch ? '#FFFFFF' : 'var(--bg-glass-elevated)',
                backdropFilter: isSketch ? 'none' : 'blur(60px) saturate(200%)',
                WebkitBackdropFilter: isSketch ? 'none' : 'blur(60px) saturate(200%)',
                boxShadow: isSketch
                  ? '6px 6px 0 #2B4AE2'
                  : 'var(--shadow-window)',
                border: isSketch ? '1px solid #2B4AE2' : '1px solid var(--border-glass-outer)',
              }}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8
              }}
            >
              {/* Title Bar */}
              <div
                className="flex items-center h-[52px] px-4 shrink-0 relative"
                style={{ borderBottom: isSketch ? '1px solid #2B4AE2' : '1px solid var(--border-light)' }}
              >
                {/* Traffic Lights */}
                <div className="flex items-center gap-2 group/traffic">
                  <button
                    onClick={onClose}
                    className={isSketch ? "w-[13px] h-[13px] rounded-full flex items-center justify-center group hover:bg-[#2B4AE2] transition-colors" : "w-[13px] h-[13px] rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:brightness-75"}
                    style={isSketch ? {
                      background: '#FFFFFF',
                      border: '1.5px solid #2B4AE2',
                    } : {
                      background: 'linear-gradient(180deg, #FF6058 0%, #FF4D44 100%)',
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {isSketch ? (
                      <svg className="w-1.5 h-1.5 text-[#2B4AE2] group-hover:text-white" viewBox="0 0 8 8" fill="none" strokeWidth={3}>
                        <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg
                        className="w-[8px] h-[8px] opacity-0 group-hover/traffic:opacity-100 transition-opacity duration-150"
                        viewBox="0 0 8 8"
                        fill="none"
                      >
                        <path
                          d="M1 1L7 7M7 1L1 7"
                          stroke="rgba(77, 0, 0, 0.7)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                  <div
                    className={isSketch ? "w-[13px] h-[13px] rounded-full flex items-center justify-center" : "w-[13px] h-[13px] rounded-full"}
                    style={isSketch ? {
                      background: '#FFFFFF',
                      border: '1.5px solid #2B4AE2',
                    } : {
                      background: 'linear-gradient(180deg, #FFBE2E 0%, #FFB014 100%)',
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {isSketch && (
                      <svg className="w-1.5 h-1.5 text-[#2B4AE2]" viewBox="0 0 8 8" fill="none" strokeWidth={3}>
                        <path d="M1 4H7" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div
                    className={isSketch ? "w-[13px] h-[13px] rounded-full flex items-center justify-center" : "w-[13px] h-[13px] rounded-full"}
                    style={isSketch ? {
                      background: '#FFFFFF',
                      border: '1.5px solid #2B4AE2',
                    } : {
                      background: 'linear-gradient(180deg, #2ACB42 0%, #1DB934 100%)',
                      boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    {isSketch && (
                      <svg className="w-1.5 h-1.5 text-[#2B4AE2]" viewBox="0 0 8 8" fill="none" strokeWidth={3}>
                        <rect x="1" y="2.5" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Title */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium select-none"
                  style={{ color: isSketch ? '#2B4AE2' : 'var(--text-secondary)' }}
                >
                  Settings
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Appearance Section */}
                <div>
                  <h3
                    className="text-[13px] font-medium uppercase tracking-wide mb-4"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Appearance
                  </h3>

                  {/* Theme Grid */}
                  <div className="mb-6">
                    <label
                      className="text-[13px] font-medium mb-3 block"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Theme
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      {availableThemes.map((t) => (
                        <ThemePreview
                          key={t.id}
                          themeId={t.id}
                          isActive={theme === t.id}
                          onClick={() => setTheme(t.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'var(--accent-primary)',
                        }}
                      >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div
                          className="text-[14px] font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {THEMES[theme].name}
                        </div>
                        <div
                          className="text-[12px]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {THEMES[theme].description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
