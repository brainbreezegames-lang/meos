'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Particle types
type ParticleType = 'none' | 'stars' | 'snow' | 'dust' | 'fireflies' | 'rain' | 'bubbles';

interface ParticleSettings {
  type: ParticleType;
  density: number; // 1-100
  speed: number; // 1-100
  respondToMouse: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue?: number;
  twinkle?: number;
  angle?: number;
}

interface ParticleBackgroundProps {
  settings: ParticleSettings;
  reduceWhenWindowsOpen?: boolean;
  windowsOpen?: number;
}

export function ParticleBackground({
  settings,
  reduceWhenWindowsOpen = true,
  windowsOpen = 0,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Check if tab is visible
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handler = () => setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Track mouse position
  useEffect(() => {
    if (!settings.respondToMouse) return;

    const handler = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [settings.respondToMouse]);

  // Create particles
  const createParticles = useCallback((width: number, height: number): Particle[] => {
    // Reduce count when windows are open
    const reductionFactor = reduceWhenWindowsOpen && windowsOpen > 0 ? 0.5 : 1;
    const count = Math.floor((settings.density / 100) * 50 * reductionFactor);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0,
        speedX: 0,
        speedY: 0,
        opacity: Math.random() * 0.5 + 0.3,
      };

      switch (settings.type) {
        case 'stars':
          particle.size = Math.random() * 2 + 1;
          particle.twinkle = Math.random() * Math.PI * 2;
          break;

        case 'snow':
          particle.size = Math.random() * 3 + 1;
          particle.speedY = (Math.random() * 0.5 + 0.2) * (settings.speed / 50);
          particle.speedX = (Math.random() - 0.5) * 0.3 * (settings.speed / 50);
          break;

        case 'dust':
          particle.size = Math.random() * 2 + 0.5;
          particle.speedX = (Math.random() - 0.5) * 0.2 * (settings.speed / 50);
          particle.speedY = (Math.random() - 0.5) * 0.2 * (settings.speed / 50);
          particle.opacity = Math.random() * 0.3 + 0.1;
          break;

        case 'fireflies':
          particle.size = Math.random() * 3 + 2;
          particle.hue = 50 + Math.random() * 20; // Yellow-green
          particle.speedX = (Math.random() - 0.5) * 0.5 * (settings.speed / 50);
          particle.speedY = (Math.random() - 0.5) * 0.5 * (settings.speed / 50);
          particle.twinkle = Math.random() * Math.PI * 2;
          break;

        case 'rain':
          particle.size = Math.random() * 1 + 0.5;
          particle.speedY = (Math.random() * 5 + 3) * (settings.speed / 50);
          particle.speedX = -1 * (settings.speed / 50);
          particle.opacity = Math.random() * 0.3 + 0.1;
          break;

        case 'bubbles':
          particle.size = Math.random() * 6 + 2;
          particle.speedY = -(Math.random() * 0.5 + 0.2) * (settings.speed / 50);
          particle.speedX = (Math.random() - 0.5) * 0.2 * (settings.speed / 50);
          particle.opacity = Math.random() * 0.2 + 0.1;
          break;
      }

      particles.push(particle);
    }

    return particles;
  }, [settings.type, settings.density, settings.speed, reduceWhenWindowsOpen, windowsOpen]);

  // Animation loop
  useEffect(() => {
    if (
      !canvasRef.current ||
      settings.type === 'none' ||
      prefersReducedMotion ||
      !isVisible
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = createParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Mouse interaction
        if (settings.respondToMouse) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const force = (100 - dist) / 100 * 0.5;
            particle.x -= (dx / dist) * force;
            particle.y -= (dy / dist) * force;
          }
        }

        // Wrap around screen
        if (particle.y > canvas.height + 10) particle.y = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.x < -10) particle.x = canvas.width + 10;

        // Draw based on type
        ctx.save();

        switch (settings.type) {
          case 'stars': {
            const twinkle = Math.sin(time * 2 + (particle.twinkle || 0)) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * twinkle})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'snow':
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'dust':
            ctx.fillStyle = `rgba(200, 200, 200, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'fireflies': {
            const glow = Math.sin(time * 3 + (particle.twinkle || 0)) * 0.5 + 0.5;
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${particle.opacity * glow})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'rain':
            ctx.strokeStyle = `rgba(150, 200, 255, ${particle.opacity})`;
            ctx.lineWidth = particle.size;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x + 2, particle.y + 10);
            ctx.stroke();
            break;

          case 'bubbles': {
            ctx.strokeStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.stroke();

            // Highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(
              particle.x - particle.size * 0.3,
              particle.y - particle.size * 0.3,
              particle.size * 0.2,
              0,
              Math.PI * 2
            );
            ctx.fill();
            break;
          }
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings, prefersReducedMotion, isVisible, createParticles]);

  if (settings.type === 'none' || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

// Settings panel component
interface ParticleSettingsPanelProps {
  settings: ParticleSettings;
  onChange: (settings: ParticleSettings) => void;
}

export function ParticleSettingsPanel({ settings, onChange }: ParticleSettingsPanelProps) {
  const updateSetting = <K extends keyof ParticleSettings>(key: K, value: ParticleSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const particleTypes: { value: ParticleType; label: string; desc: string }[] = [
    { value: 'none', label: 'None', desc: 'No particles' },
    { value: 'stars', label: 'Stars', desc: 'Gentle twinkling' },
    { value: 'snow', label: 'Snow', desc: 'Soft falling flakes' },
    { value: 'dust', label: 'Dust', desc: 'Floating particles' },
    { value: 'fireflies', label: 'Fireflies', desc: 'Glowing dots' },
    { value: 'rain', label: 'Rain', desc: 'Drops on screen' },
    { value: 'bubbles', label: 'Bubbles', desc: 'Rising softly' },
  ];

  return (
    <div className="space-y-6">
      {/* Particle Type */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Background Effect</label>
        <div className="grid grid-cols-2 gap-2">
          {particleTypes.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => updateSetting('type', value)}
              className={`px-3 py-2 rounded-lg text-left transition-all ${
                settings.type === value
                  ? 'bg-white/15 ring-2 ring-blue-500'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-sm text-white/90">{label}</div>
              <div className="text-xs text-white/40">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {settings.type !== 'none' && (
        <>
          {/* Density */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Density: {settings.density < 33 ? 'Low' : settings.density < 66 ? 'Medium' : 'High'}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.density}
              onChange={(e) => updateSetting('density', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Speed: {settings.speed < 33 ? 'Slow' : settings.speed < 66 ? 'Medium' : 'Fast'}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.speed}
              onChange={(e) => updateSetting('speed', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Mouse Response */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-white/80">Respond to mouse movement</span>
            <button
              onClick={() => updateSetting('respondToMouse', !settings.respondToMouse)}
              className={`w-10 h-6 rounded-full transition-colors ${
                settings.respondToMouse ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  settings.respondToMouse ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </>
      )}

      {/* Info */}
      <div
        className="p-3 rounded-lg text-xs text-white/50"
        style={{ background: 'rgba(255, 255, 255, 0.03)' }}
      >
        <p>Particles are automatically reduced when windows are open and disabled for visitors who prefer reduced motion.</p>
      </div>
    </div>
  );
}

export type { ParticleType, ParticleSettings };
