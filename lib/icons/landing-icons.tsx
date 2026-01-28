// MeOS Landing Page Icon Library
// Premium macOS Sequoia-style SVG icons with depth, lighting, and glass effects

import { type LandingIconId } from './types';
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Unique ID generator for SVG gradients to avoid conflicts
let iconIdCounter = 0;
const useIconId = (prefix: string) => {
  const [id] = React.useState(() => `${prefix}-${++iconIdCounter}-${Math.random().toString(36).slice(2, 7)}`);
  return id;
};

// macOS Squircle path - continuous curvature corners (22% corner radius like Apple)
const SQUIRCLE_PATH = `
  M 114.4 0
  C 51.2 0, 25.6 0, 12.8 12.8
  C 0 25.6, 0 51.2, 0 114.4
  L 0 397.6
  C 0 460.8, 0 486.4, 12.8 499.2
  C 25.6 512, 51.2 512, 114.4 512
  L 397.6 512
  C 460.8 512, 486.4 512, 499.2 499.2
  C 512 486.4, 512 460.8, 512 397.6
  L 512 114.4
  C 512 51.2, 512 25.6, 499.2 12.8
  C 486.4 0, 460.8 0, 397.6 0
  Z
`;

// Finder - Premium blue with iconic face
export function FinderIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('finder');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0369A1" floodOpacity="0.4" />
        </filter>
        <filter id={`${id}-inner`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>
      {/* Base squircle with gradient */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      {/* Inner edge highlight */}
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-50" rx="350" ry="200" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Face background with shadow */}
      <rect x="72" y="110" width="368" height="292" rx="24" fill={`url(#${id}-face)`} filter={`url(#${id}-inner)`} />
      {/* Left eye */}
      <ellipse cx="175" cy="256" rx="44" ry="50" fill="#0F172A" />
      <circle cx="175" cy="244" r="14" fill="#FFFFFF" />
      {/* Right eye */}
      <ellipse cx="337" cy="256" rx="44" ry="50" fill="#0F172A" />
      <circle cx="337" cy="244" r="14" fill="#FFFFFF" />
      {/* Nose bridge */}
      <path d="M256 200 L256 310" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
      {/* Friendly smile */}
      <path d="M168 350 Q256 410 344 350" stroke="#334155" strokeWidth="8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Safari - Premium compass with depth and glass
export function SafariIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('safari');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id={`${id}-red`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id={`${id}-white`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1E40AF" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Compass outer ring with shadow */}
      <circle cx="256" cy="256" r="175" fill={`url(#${id}-ring)`} filter={`url(#${id}-shadow)`} />
      <circle cx="256" cy="256" r="175" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      {/* Inner compass face */}
      <circle cx="256" cy="256" r="158" fill={`url(#${id}-inner)`} />
      {/* Tick marks */}
      {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle) => (
        <line
          key={angle}
          x1="256"
          y1={angle % 90 === 0 ? 105 : angle % 45 === 0 ? 112 : 118}
          x2="256"
          y2="126"
          stroke={angle % 90 === 0 ? '#1E40AF' : '#64748B'}
          strokeWidth={angle % 90 === 0 ? 4 : 2}
          strokeLinecap="round"
          transform={`rotate(${angle} 256 256)`}
        />
      ))}
      {/* Compass needle - red/orange pointing NE */}
      <path d="M256 105 L275 244 L256 256 L237 244 Z" fill={`url(#${id}-red)`} />
      <path d="M256 407 L237 268 L256 256 L275 268 Z" fill={`url(#${id}-white)`} />
      {/* Center hub */}
      <circle cx="256" cy="256" r="18" fill="#1E293B" />
      <circle cx="256" cy="256" r="10" fill="#F97316" />
      <circle cx="256" cy="252" r="4" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
}

// Mail - Premium envelope with depth
export function MailIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('mail');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`${id}-envelope`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id={`${id}-flap`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1E40AF" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Envelope body with shadow */}
      <rect x="64" y="150" width="384" height="228" rx="18" fill={`url(#${id}-envelope)`} filter={`url(#${id}-shadow)`} />
      <rect x="64" y="150" width="384" height="228" rx="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      {/* Bottom shadow fold */}
      <path d="M82 358 Q256 320 430 358 L430 360 Q256 322 82 360 Z" fill="rgba(0,0,0,0.08)" />
      {/* Envelope flap (triangle) */}
      <path d="M70 162 L256 280 L442 162" fill={`url(#${id}-flap)`} />
      <path d="M70 162 L256 280 L442 162" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      {/* Flap highlight */}
      <path d="M85 165 L256 270 L427 165" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
    </svg>
  );
}

// Photos - Premium colorful flower petals with gradients
export function PhotosIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('photos');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Petal gradients - vibrant with glow */}
        <linearGradient id={`${id}-red`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id={`${id}-orange`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id={`${id}-yellow`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id={`${id}-green`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id={`${id}-cyan`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id={`${id}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id={`${id}-purple`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${id}-pink`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="100%" stopColor="#C026D3" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* 8 overlapping gradient petals forming a flower */}
      <g filter={`url(#${id}-glow)`}>
        <ellipse cx="256" cy="145" rx="55" ry="75" fill={`url(#${id}-red)`} opacity="0.95" />
        <ellipse cx="335" cy="176" rx="55" ry="75" fill={`url(#${id}-orange)`} opacity="0.95" transform="rotate(45 335 176)" />
        <ellipse cx="367" cy="256" rx="55" ry="75" fill={`url(#${id}-yellow)`} opacity="0.95" transform="rotate(90 367 256)" />
        <ellipse cx="335" cy="336" rx="55" ry="75" fill={`url(#${id}-green)`} opacity="0.95" transform="rotate(135 335 336)" />
        <ellipse cx="256" cy="367" rx="55" ry="75" fill={`url(#${id}-cyan)`} opacity="0.95" transform="rotate(180 256 367)" />
        <ellipse cx="177" cy="336" rx="55" ry="75" fill={`url(#${id}-blue)`} opacity="0.95" transform="rotate(225 177 336)" />
        <ellipse cx="145" cy="256" rx="55" ry="75" fill={`url(#${id}-purple)`} opacity="0.95" transform="rotate(270 145 256)" />
        <ellipse cx="177" cy="176" rx="55" ry="75" fill={`url(#${id}-pink)`} opacity="0.95" transform="rotate(315 177 176)" />
      </g>
      {/* Center circle */}
      <circle cx="256" cy="256" r="32" fill="#0F172A" />
      <circle cx="256" cy="256" r="28" fill="#1E293B" />
      <circle cx="252" cy="250" r="8" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// Messages - Premium chat bubble with depth
export function MessagesIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('msg');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
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
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#166534" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Chat bubble with shadow */}
      <path
        d="M256 88 C145 88 62 155 62 242 C62 295 92 342 140 372 L130 415 C128 425 140 432 148 426 L208 388 C223 392 240 394 256 394 C367 394 450 327 450 242 C450 155 367 88 256 88 Z"
        fill={`url(#${id}-bubble)`}
        filter={`url(#${id}-shadow)`}
      />
      {/* Bubble highlight */}
      <path
        d="M256 100 C155 100 80 160 80 240 C80 250 81 259 84 268"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Inner bubble edge */}
      <path
        d="M256 88 C145 88 62 155 62 242 C62 295 92 342 140 372 L130 415 C128 425 140 432 148 426 L208 388 C223 392 240 394 256 394 C367 394 450 327 450 242 C450 155 367 88 256 88 Z"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Notes - Premium yellow notepad with paper texture
export function NotesIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('notes');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
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
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#A16207" floodOpacity="0.3" />
        </filter>
        <filter id={`${id}-paper-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Paper sheet with shadow */}
      <rect x="90" y="56" width="332" height="400" rx="12" fill={`url(#${id}-paper)`} filter={`url(#${id}-paper-shadow)`} />
      {/* Paper edge highlight */}
      <rect x="90" y="56" width="332" height="400" rx="12" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
      {/* Red margin line */}
      <line x1="140" y1="56" x2="140" y2="456" stroke="#FCA5A5" strokeWidth="2" />
      {/* Horizontal ruled lines */}
      <line x1="120" y1="130" x2="400" y2="130" stroke="#E5E7EB" strokeWidth="2" />
      <line x1="120" y1="180" x2="400" y2="180" stroke="#E5E7EB" strokeWidth="2" />
      <line x1="120" y1="230" x2="400" y2="230" stroke="#E5E7EB" strokeWidth="2" />
      <line x1="120" y1="280" x2="400" y2="280" stroke="#E5E7EB" strokeWidth="2" />
      <line x1="120" y1="330" x2="400" y2="330" stroke="#E5E7EB" strokeWidth="2" />
      <line x1="120" y1="380" x2="400" y2="380" stroke="#E5E7EB" strokeWidth="2" />
      {/* Handwritten text simulation */}
      <path d="M155 125 Q200 120 280 130 Q320 135 360 125" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M155 175 Q230 180 290 172 Q340 168 380 178" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M155 225 Q195 220 250 228" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Calendar - Premium with red header and clean typography
export function CalendarIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('cal');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id={`${id}-red`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      {/* Red header band */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <rect x="0" y="0" width="512" height="145" fill={`url(#${id}-red)`} clipPath={`url(#${id}-clip)`} />
      <rect x="0" y="0" width="512" height="145" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Header divider with shadow */}
      <rect x="0" y="143" width="512" height="4" fill="rgba(0,0,0,0.1)" clipPath={`url(#${id}-clip)`} />
      {/* Day of week header */}
      <text x="77" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">S</text>
      <text x="137" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">M</text>
      <text x="197" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">T</text>
      <text x="257" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">W</text>
      <text x="317" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">T</text>
      <text x="377" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">F</text>
      <text x="437" y="190" textAnchor="middle" fill="#94A3B8" fontSize="22" fontWeight="500">S</text>
      {/* Today's date - big and bold */}
      <circle cx="256" cy="330" r="58" fill={`url(#${id}-red)`} filter={`url(#${id}-shadow)`} />
      <text x="256" y="352" textAnchor="middle" fill="#FFFFFF" fontSize="56" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">28</text>
      {/* Month name in header */}
      <text x="256" y="95" textAnchor="middle" fill="#FFFFFF" fontSize="36" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">January</text>
      {/* Year */}
      <text x="256" y="125" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="22" fontWeight="400">2025</text>
    </svg>
  );
}

// Settings - Premium gear with metallic finish
export function SettingsIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('settings');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="50%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
        <linearGradient id={`${id}-gear`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F9FAFB" />
          <stop offset="50%" stopColor="#E5E7EB" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#374151" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Gear with proper teeth */}
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="M286 95 L286 125 Q305 128 322 137 L343 115 L367 139 L345 160 Q354 177 357 196 L387 196 L387 226 L357 226 Q354 245 345 262 L367 283 L343 307 L322 285 Q305 294 286 297 L286 327 L256 327 L226 327 L226 297 Q207 294 190 285 L169 307 L145 283 L167 262 Q158 245 155 226 L125 226 L125 196 L155 196 Q158 177 167 160 L145 139 L169 115 L190 137 Q207 128 226 125 L226 95 L256 95 Z"
          fill={`url(#${id}-gear)`}
        />
        {/* Inner circle cutout */}
        <circle cx="256" cy="211" r="58" fill={`url(#${id}-bg)`} />
        {/* Inner gear highlight */}
        <circle cx="256" cy="211" r="58" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        {/* Center hub */}
        <circle cx="256" cy="211" r="28" fill={`url(#${id}-gear)`} />
        <circle cx="256" cy="211" r="12" fill={`url(#${id}-bg)`} />
      </g>
      {/* Gear edge highlight */}
      <path
        d="M286 95 L286 125 Q305 128 322 137 L343 115 L367 139 L345 160 Q354 177 357 196 L387 196 L387 226 L357 226 Q354 245 345 262 L367 283 L343 307 L322 285 Q305 294 286 297 L286 327 L256 327 L226 327 L226 297 Q207 294 190 285 L169 307 L145 283 L167 262 Q158 245 155 226 L125 226 L125 196 L155 196 Q158 177 167 160 L145 139 L169 115 L190 137 Q207 128 226 125 L226 95 L256 95 Z"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Welcome - Premium sparkle/star with vibrant orange
export function WelcomeIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('welcome');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id={`${id}-star`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FED7AA" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#C2410C" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* 8-point star burst with glow */}
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M256 70 L275 205 L410 175 L305 256 L410 337 L275 307 L256 442 L237 307 L102 337 L207 256 L102 175 L237 205 Z"
          fill={`url(#${id}-star)`}
          filter={`url(#${id}-shadow)`}
        />
      </g>
      {/* Center orb */}
      <circle cx="256" cy="256" r="48" fill={`url(#${id}-bg)`} />
      <circle cx="256" cy="256" r="48" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <circle cx="256" cy="256" r="24" fill="#FFFFFF" />
      <circle cx="250" cy="248" r="8" fill="rgba(251,146,60,0.5)" />
    </svg>
  );
}

// Features - Premium grid with glass cards
export function FeaturesIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('features');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id={`${id}-card`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.85)" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#5B21B6" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Grid of glass cards - 2x2 */}
      <g filter={`url(#${id}-shadow)`}>
        <rect x="72" y="72" width="165" height="165" rx="28" fill={`url(#${id}-card)`} />
        <rect x="72" y="72" width="165" height="165" rx="28" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      </g>
      <g filter={`url(#${id}-shadow)`} opacity="0.85">
        <rect x="275" y="72" width="165" height="165" rx="28" fill={`url(#${id}-card)`} />
        <rect x="275" y="72" width="165" height="165" rx="28" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      </g>
      <g filter={`url(#${id}-shadow)`} opacity="0.85">
        <rect x="72" y="275" width="165" height="165" rx="28" fill={`url(#${id}-card)`} />
        <rect x="72" y="275" width="165" height="165" rx="28" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      </g>
      <g filter={`url(#${id}-shadow)`} opacity="0.7">
        <rect x="275" y="275" width="165" height="165" rx="28" fill={`url(#${id}-card)`} />
        <rect x="275" y="275" width="165" height="165" rx="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </g>
      {/* Icons inside cards */}
      <circle cx="154" cy="154" r="32" fill="rgba(168,85,247,0.3)" />
      <rect x="340" y="138" width="34" height="34" rx="8" fill="rgba(168,85,247,0.3)" />
      <path d="M140 357 L154 340 L168 357 Z" fill="rgba(168,85,247,0.3)" />
      <path d="M340 340 L374 340 L374 374 L340 374 Z" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="4" rx="4" />
    </svg>
  );
}

// Examples - Premium photo stack with polaroid style
export function ExamplesIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('examples');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
        <linearGradient id={`${id}-photo`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id={`${id}-sky`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id={`${id}-mountain`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#9D174D" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Back polaroid - rotated */}
      <g transform="rotate(-12 256 280)" filter={`url(#${id}-shadow)`} opacity="0.7">
        <rect x="110" y="90" width="260" height="300" rx="8" fill={`url(#${id}-photo)`} />
        <rect x="126" y="106" width="228" height="200" rx="4" fill="#CBD5E1" />
      </g>
      {/* Middle polaroid - slight rotation */}
      <g transform="rotate(-4 256 280)" filter={`url(#${id}-shadow)`} opacity="0.85">
        <rect x="120" y="80" width="260" height="300" rx="8" fill={`url(#${id}-photo)`} />
        <rect x="136" y="96" width="228" height="200" rx="4" fill="#CBD5E1" />
      </g>
      {/* Front polaroid */}
      <g filter={`url(#${id}-shadow)`}>
        <rect x="130" y="70" width="260" height="300" rx="8" fill={`url(#${id}-photo)`} />
        <rect x="130" y="70" width="260" height="300" rx="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        {/* Photo area */}
        <rect x="146" y="86" width="228" height="200" rx="4" fill={`url(#${id}-sky)`} />
        {/* Mountain landscape */}
        <path d="M146 260 L220 180 L280 230 L350 150 L374 260 L374 286 L146 286 Z" fill={`url(#${id}-mountain)`} />
        {/* Sun */}
        <circle cx="320" cy="130" r="28" fill="#FBBF24" />
        <circle cx="320" cy="130" r="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        {/* Cloud */}
        <ellipse cx="200" cy="120" rx="30" ry="16" fill="rgba(255,255,255,0.8)" />
        <ellipse cx="220" cy="115" rx="20" ry="12" fill="rgba(255,255,255,0.8)" />
      </g>
    </svg>
  );
}

// Pricing - Premium price tag with depth
export function PricingIcon({ className = '', size = 64 }: IconProps) {
  const id = useIconId('pricing');
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`${id}-tag`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0%" y1="0%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="4" dy="8" stdDeviation="12" floodColor="#065F46" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Base squircle */}
      <path d={SQUIRCLE_PATH} fill={`url(#${id}-bg)`} />
      <path d={SQUIRCLE_PATH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Top shine */}
      <clipPath id={`${id}-clip`}>
        <path d={SQUIRCLE_PATH} />
      </clipPath>
      <ellipse cx="256" cy="-30" rx="320" ry="180" fill={`url(#${id}-shine)`} clipPath={`url(#${id}-clip)`} />
      {/* Price tag with shadow */}
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="M100 200 L100 120 C100 105 112 93 127 93 L300 93 C310 93 320 97 327 105 L415 200 C425 211 425 229 415 240 L280 400 C269 412 251 412 240 400 L108 255 C102 248 100 239 100 230 Z"
          fill={`url(#${id}-tag)`}
        />
        {/* Tag edge highlight */}
        <path
          d="M100 200 L100 120 C100 105 112 93 127 93 L300 93 C310 93 320 97 327 105 L415 200 C425 211 425 229 415 240 L280 400 C269 412 251 412 240 400 L108 255 C102 248 100 239 100 230 Z"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
        />
        {/* Tag hole */}
        <circle cx="175" cy="165" r="32" fill={`url(#${id}-bg)`} />
        <circle cx="175" cy="165" r="32" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <circle cx="175" cy="165" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        {/* Dollar sign */}
        <text x="280" y="290" fontSize="100" fontWeight="700" fill={`url(#${id}-bg)`} fontFamily="system-ui, -apple-system, sans-serif">$</text>
      </g>
    </svg>
  );
}

// Icon map for easy access
export const LANDING_ICONS: Record<LandingIconId, React.FC<IconProps>> = {
  welcome: WelcomeIcon,
  features: FeaturesIcon,
  examples: ExamplesIcon,
  pricing: PricingIcon,
  faq: WelcomeIcon, // Reuse for now
  reviews: MessagesIcon,
  'how-it-works': SettingsIcon,
  mobile: PhotosIcon,
  finder: FinderIcon,
  safari: SafariIcon,
  mail: MailIcon,
  photos: PhotosIcon,
  messages: MessagesIcon,
  notes: NotesIcon,
  calendar: CalendarIcon,
  settings: SettingsIcon,
};

