'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cursor types
type CursorStyle = 'default' | 'dot' | 'circle' | 'cross' | 'emoji';
type CursorColor = 'default' | 'black' | 'white' | 'custom';

interface CursorSettings {
  style: CursorStyle;
  color: CursorColor;
  customColor?: string;
  emoji?: string;
  clickRipple: boolean;
  hoverGlow: boolean;
  trail: boolean;
  intensity: number; // 0-100
}

interface CustomCursorProps {
  settings: CursorSettings;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

// Provider context for cursor settings
const CursorContext = React.createContext<{
  settings: CursorSettings;
  setSettings: (settings: CursorSettings) => void;
} | null>(null);

export function useCursorSettings() {
  const ctx = React.useContext(CursorContext);
  if (!ctx) throw new Error('useCursorSettings must be used within CursorProvider');
  return ctx;
}

export function CursorProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: Partial<CursorSettings>;
}) {
  const [settings, setSettings] = useState<CursorSettings>({
    style: 'default',
    color: 'default',
    clickRipple: false,
    hoverGlow: false,
    trail: false,
    intensity: 50,
    ...initialSettings,
  });

  return (
    <CursorContext.Provider value={{ settings, setSettings }}>
      {children}
      {settings.style !== 'default' && <CustomCursor settings={settings} />}
    </CursorContext.Provider>
  );
}

export function CustomCursor({ settings }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const rippleIdRef = useRef(0);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Update trail
      if (settings.trail && !prefersReducedMotion) {
        setTrail(prev => {
          const newTrail = [...prev, { x: e.clientX, y: e.clientY }];
          return newTrail.slice(-8); // Keep last 8 positions
        });
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.matches('a, button, [role="button"], input, select, textarea, [tabindex]');
      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => {
      setIsClicking(true);

      // Add ripple effect
      if (settings.clickRipple && !prefersReducedMotion) {
        const id = rippleIdRef.current++;
        setRipples(prev => [...prev, { id, x: position.x, y: position.y }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== id));
        }, 400);
      }
    };

    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [settings.clickRipple, settings.trail, prefersReducedMotion, position.x, position.y]);

  // Hide on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile || prefersReducedMotion || settings.style === 'default') {
    return null;
  }

  const getColor = () => {
    if (settings.color === 'default' || settings.color === 'black') return '#000000';
    if (settings.color === 'white') return '#FFFFFF';
    return settings.customColor || '#000000';
  };

  const color = getColor();
  const scale = isClicking ? 0.8 : isHovering ? 1.5 : 1;
  const opacity = isHovering ? 0.5 : 1;

  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Trail */}
      {settings.trail && (
        <>
          {trail.map((pos, i) => (
            <div
              key={i}
              className="fixed pointer-events-none z-[10000]"
              style={{
                left: pos.x,
                top: pos.y,
                transform: 'translate(-50%, -50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: color,
                opacity: (i / trail.length) * 0.5 * (settings.intensity / 100),
              }}
            />
          ))}
        </>
      )}

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[10001]"
        animate={{
          x: position.x,
          y: position.y,
          scale,
          opacity,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        {settings.style === 'dot' && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
            }}
          />
        )}

        {settings.style === 'circle' && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              background: isHovering ? `${color}20` : 'transparent',
            }}
          />
        )}

        {settings.style === 'cross' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2">
            <line x1="10" y1="0" x2="10" y2="20" />
            <line x1="0" y1="10" x2="20" y2="10" />
          </svg>
        )}

        {settings.style === 'emoji' && (
          <span style={{ fontSize: 24, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
            {settings.emoji || '👆'}
          </span>
        )}

        {/* Hover glow */}
        {settings.hoverGlow && isHovering && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
              width: 60,
              height: 60,
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: settings.intensity / 100 }}
          />
        )}
      </motion.div>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="fixed pointer-events-none z-[10000]"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: `2px solid ${color}`,
                opacity: settings.intensity / 100,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

// Settings panel component
interface CursorSettingsPanelProps {
  settings: CursorSettings;
  onChange: (settings: CursorSettings) => void;
}

export function CursorSettingsPanel({ settings, onChange }: CursorSettingsPanelProps) {
  const updateSetting = <K extends keyof CursorSettings>(key: K, value: CursorSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Cursor Style */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Cursor Style</label>
        <div className="grid grid-cols-5 gap-2">
          {(['default', 'dot', 'circle', 'cross', 'emoji'] as CursorStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => updateSetting('style', style)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                settings.style === style
                  ? 'bg-white/15 ring-2 ring-blue-500'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-lg">
                {style === 'default' && '↖'}
                {style === 'dot' && '●'}
                {style === 'circle' && '○'}
                {style === 'cross' && '+'}
                {style === 'emoji' && '👆'}
              </div>
              <span className="text-[9px] text-white/50 capitalize">{style}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emoji selector */}
      {settings.style === 'emoji' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Emoji</label>
          <div className="flex gap-2 flex-wrap">
            {['👆', '✨', '🎯', '💫', '🔥', '👀'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => updateSetting('emoji', emoji)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                  settings.emoji === emoji ? 'bg-white/15 ring-2 ring-blue-500' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {settings.style !== 'default' && settings.style !== 'emoji' && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Cursor Color</label>
          <div className="flex gap-2">
            {(['default', 'black', 'white', 'custom'] as CursorColor[]).map((color) => (
              <button
                key={color}
                onClick={() => updateSetting('color', color)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                  settings.color === color ? 'bg-white/15 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {color}
              </button>
            ))}
          </div>

          {settings.color === 'custom' && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={settings.customColor || '#000000'}
                onChange={(e) => updateSetting('customColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs text-white/50">{settings.customColor || '#000000'}</span>
            </div>
          )}
        </div>
      )}

      {/* Effects */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Effects</label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white/80">Click ripple</span>
          <button
            onClick={() => updateSetting('clickRipple', !settings.clickRipple)}
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.clickRipple ? 'bg-blue-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                settings.clickRipple ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white/80">Hover glow</span>
          <button
            onClick={() => updateSetting('hoverGlow', !settings.hoverGlow)}
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.hoverGlow ? 'bg-blue-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                settings.hoverGlow ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white/80">Trail</span>
          <button
            onClick={() => updateSetting('trail', !settings.trail)}
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.trail ? 'bg-blue-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                settings.trail ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Intensity */}
      {(settings.clickRipple || settings.hoverGlow || settings.trail) && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Effect intensity: {settings.intensity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.intensity}
            onChange={(e) => updateSetting('intensity', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      )}
    </div>
  );
}

export type { CursorStyle, CursorColor, CursorSettings };
