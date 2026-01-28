// Premium macOS-style Dock Icons for GoOS v2
// Beautiful squircle icons with depth, lighting, and glass effects

import React from 'react';

interface DockIconProps {
  size?: number;
  className?: string;
}

// Unique ID generator for SVG gradients
let dockIconIdCounter = 0;
const useDockIconId = (prefix: string) => {
  const [id] = React.useState(() => `dock-${prefix}-${++dockIconIdCounter}-${Math.random().toString(36).slice(2, 7)}`);
  return id;
};

// Mail Icon - Blue envelope with depth
export function MailDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('mail');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`${id}-env`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id={`${id}-flap`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1E40AF" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.35)" />
      <rect x="64" y="150" width="384" height="228" rx="18" fill={`url(#${id}-env)`} filter={`url(#${id}-shadow)`} />
      <path d="M70 162 L256 280 L442 162" fill={`url(#${id}-flap)`} />
      <path d="M85 165 L256 270 L427 165" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
    </svg>
  );
}

// Notes Icon - Yellow notepad
export function NotesDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('notes');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id={`${id}-paper`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FAFAFA" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.5)" />
      <rect x="90" y="56" width="332" height="400" rx="12" fill={`url(#${id}-paper)`} filter={`url(#${id}-shadow)`} />
      <line x1="140" y1="56" x2="140" y2="456" stroke="#FCA5A5" strokeWidth="3" />
      <line x1="120" y1="130" x2="400" y2="130" stroke="#E5E7EB" strokeWidth="3" />
      <line x1="120" y1="180" x2="400" y2="180" stroke="#E5E7EB" strokeWidth="3" />
      <line x1="120" y1="230" x2="400" y2="230" stroke="#E5E7EB" strokeWidth="3" />
      <line x1="120" y1="280" x2="400" y2="280" stroke="#E5E7EB" strokeWidth="3" />
      <path d="M155 125 Q200 120 280 130 Q320 135 360 125" stroke="#374151" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M155 175 Q230 180 290 172 Q340 168 380 178" stroke="#374151" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Messages/Chat Icon - Green bubble
export function ChatDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('chat');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id={`${id}-bubble`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#166534" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.35)" />
      <path
        d="M256 88 C145 88 62 155 62 242 C62 295 92 342 140 372 L130 415 C128 425 140 432 148 426 L208 388 C223 392 240 394 256 394 C367 394 450 327 450 242 C450 155 367 88 256 88 Z"
        fill={`url(#${id}-bubble)`}
        filter={`url(#${id}-shadow)`}
      />
      <path d="M256 100 C155 100 80 160 80 240 C80 250 81 259 84 268" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// Terminal Icon - Black terminal window
export function TerminalDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('terminal');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.1)" />
      {/* Terminal window */}
      <rect x="60" y="80" width="392" height="352" rx="20" fill={`url(#${id}-screen)`} filter={`url(#${id}-shadow)`} />
      <rect x="60" y="80" width="392" height="352" rx="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      {/* Title bar */}
      <rect x="60" y="80" width="392" height="40" rx="20" fill="rgba(255,255,255,0.05)" />
      {/* Traffic lights */}
      <circle cx="95" cy="100" r="10" fill="#EF4444" />
      <circle cx="125" cy="100" r="10" fill="#F59E0B" />
      <circle cx="155" cy="100" r="10" fill="#22C55E" />
      {/* Prompt */}
      <path d="M100 180 L140 220 L100 260" stroke="#22C55E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="165" y="210" width="120" height="20" rx="4" fill="#22C55E" opacity="0.8" />
      {/* Blinking cursor */}
      <rect x="300" y="205" width="12" height="28" rx="2" fill="#22C55E" />
    </svg>
  );
}

// Book/Guestbook Icon - Brown book
export function GuestbookDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('book');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id={`${id}-cover`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="50%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id={`${id}-pages`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#7C2D12" floodOpacity="0.4" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.35)" />
      {/* Book spine */}
      <rect x="100" y="90" width="60" height="332" rx="8" fill={`url(#${id}-cover)`} filter={`url(#${id}-shadow)`} />
      {/* Book cover */}
      <rect x="145" y="90" width="267" height="332" rx="8" fill={`url(#${id}-cover)`} />
      <rect x="145" y="90" width="267" height="332" rx="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      {/* Pages */}
      <rect x="160" y="100" width="240" height="312" rx="4" fill={`url(#${id}-pages)`} />
      {/* Page lines */}
      <line x1="180" y1="150" x2="380" y2="150" stroke="#D1D5DB" strokeWidth="2" />
      <line x1="180" y1="190" x2="380" y2="190" stroke="#D1D5DB" strokeWidth="2" />
      <line x1="180" y1="230" x2="380" y2="230" stroke="#D1D5DB" strokeWidth="2" />
      <line x1="180" y1="270" x2="380" y2="270" stroke="#D1D5DB" strokeWidth="2" />
      <line x1="180" y1="310" x2="380" y2="310" stroke="#D1D5DB" strokeWidth="2" />
      {/* Bookmark ribbon */}
      <path d="M350 90 L350 160 L365 145 L380 160 L380 90" fill="#DC2626" />
    </svg>
  );
}

// Launchpad Icon - Grid of dots (already exists but making a nicer version)
export function LaunchpadDockIconPremium({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('launchpad');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="50%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.15)" />
      {/* 3x3 Grid of glowing circles */}
      <g filter={`url(#${id}-glow)`}>
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => (
            <circle
              key={`${row}-${col}`}
              cx={140 + col * 116}
              cy={140 + row * 116}
              r="42"
              fill={
                row === 0 && col === 0 ? '#F472B6' :
                row === 0 && col === 1 ? '#FB923C' :
                row === 0 && col === 2 ? '#FBBF24' :
                row === 1 && col === 0 ? '#4ADE80' :
                row === 1 && col === 1 ? '#22D3EE' :
                row === 1 && col === 2 ? '#818CF8' :
                row === 2 && col === 0 ? '#A78BFA' :
                row === 2 && col === 1 ? '#F87171' :
                '#60A5FA'
              }
            />
          ))
        )}
      </g>
    </svg>
  );
}

// Presentation/Case Study Icon - For minimized files
export function PresentationDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('presentation');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#9D174D" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.35)" />
      {/* Presentation board */}
      <rect x="80" y="100" width="352" height="260" rx="12" fill={`url(#${id}-screen)`} filter={`url(#${id}-shadow)`} />
      <rect x="80" y="100" width="352" height="260" rx="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
      {/* Chart bars */}
      <rect x="120" y="260" width="50" height="80" rx="4" fill="#EC4899" />
      <rect x="190" y="200" width="50" height="140" rx="4" fill="#F472B6" />
      <rect x="260" y="160" width="50" height="180" rx="4" fill="#EC4899" />
      <rect x="330" y="120" width="50" height="220" rx="4" fill="#F472B6" />
      {/* Stand */}
      <rect x="240" y="360" width="32" height="80" rx="4" fill="#9D174D" />
      <rect x="180" y="420" width="152" height="20" rx="10" fill="#9D174D" />
    </svg>
  );
}

// File/Document Icon - For minimized note files
export function FileDockIcon({ size = 44, className = '' }: DockIconProps) {
  const id = useDockIconId('file');
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id={`${id}-paper`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#4338CA" floodOpacity="0.35" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="110" fill={`url(#${id}-bg)`} />
      <rect width="512" height="512" rx="110" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill="rgba(255,255,255,0.35)" />
      {/* Document */}
      <path
        d="M140 60 L320 60 L380 120 L380 452 L140 452 Z"
        fill={`url(#${id}-paper)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* Folded corner */}
      <path d="M320 60 L320 120 L380 120 Z" fill="#CBD5E1" />
      <path d="M320 60 L320 120 L380 120" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      {/* Text lines */}
      <rect x="175" y="160" width="170" height="12" rx="4" fill="#CBD5E1" />
      <rect x="175" y="195" width="140" height="12" rx="4" fill="#CBD5E1" />
      <rect x="175" y="230" width="170" height="12" rx="4" fill="#CBD5E1" />
      <rect x="175" y="265" width="100" height="12" rx="4" fill="#CBD5E1" />
      <rect x="175" y="320" width="170" height="12" rx="4" fill="#CBD5E1" />
      <rect x="175" y="355" width="150" height="12" rx="4" fill="#CBD5E1" />
    </svg>
  );
}
