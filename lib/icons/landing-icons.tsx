// MeOS Landing Page Icon Library
// High-quality SVG icons for the landing page desktop and dock

import { type LandingIconId } from './types';
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Finder - Blue gradient, two-tone face
export function FinderIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="finder-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6DD5FA" />
          <stop offset="100%" stopColor="#2980B9" />
        </linearGradient>
        <linearGradient id="finder-face" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E8E8" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#finder-bg)" />
      <rect x="80" y="120" width="352" height="272" rx="20" fill="url(#finder-face)" />
      {/* Left eye */}
      <circle cx="180" cy="256" r="50" fill="#1C1917" />
      <circle cx="180" cy="246" r="16" fill="#FFFFFF" />
      {/* Right eye */}
      <circle cx="332" cy="256" r="50" fill="#1C1917" />
      <circle cx="332" cy="246" r="16" fill="#FFFFFF" />
      {/* Nose line */}
      <path d="M256 210 L256 300" stroke="#1C1917" strokeWidth="8" strokeLinecap="round" />
      {/* Smile */}
      <path d="M180 330 Q256 380 332 330" stroke="#1C1917" strokeWidth="10" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Safari - Compass icon
export function SafariIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="safari-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5BC0F8" />
          <stop offset="100%" stopColor="#1A73E8" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#safari-bg)" />
      {/* Outer ring */}
      <circle cx="256" cy="256" r="170" fill="#FFFFFF" />
      <circle cx="256" cy="256" r="155" fill="#E8F4FD" />
      {/* Compass markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <line
          key={angle}
          x1="256"
          y1={angle % 90 === 0 ? 110 : 120}
          x2="256"
          y2="130"
          stroke="#1A73E8"
          strokeWidth={angle % 90 === 0 ? 4 : 2}
          transform={`rotate(${angle} 256 256)`}
        />
      ))}
      {/* Compass needle */}
      <path d="M256 100 L270 240 L256 256 L242 240 Z" fill="#EA580C" />
      <path d="M256 412 L242 272 L256 256 L270 272 Z" fill="#1C1917" />
      <path d="M100 256 L240 242 L256 256 L240 270 Z" fill="#1C1917" />
      <path d="M412 256 L272 270 L256 256 L272 242 Z" fill="#EA580C" />
      {/* Center */}
      <circle cx="256" cy="256" r="20" fill="#1C1917" />
      <circle cx="256" cy="256" r="8" fill="#EA580C" />
    </svg>
  );
}

// Mail - Envelope icon
export function MailIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="mail-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5BC0F8" />
          <stop offset="100%" stopColor="#1A73E8" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#mail-bg)" />
      {/* Envelope body */}
      <rect x="70" y="140" width="372" height="232" rx="16" fill="#FFFFFF" />
      {/* Envelope flap */}
      <path d="M70 156 L256 290 L442 156" fill="none" stroke="#1A73E8" strokeWidth="18" strokeLinejoin="round" />
      {/* Shadow line */}
      <line x1="70" y1="372" x2="442" y2="372" stroke="#E0E7FF" strokeWidth="4" />
    </svg>
  );
}

// Photos - Colorful flower icon
export function PhotosIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <rect width="512" height="512" rx="110" fill="#1C1917" />
      {/* Flower petals - 8 overlapping circles */}
      <circle cx="190" cy="180" r="80" fill="none" stroke="#FF6B6B" strokeWidth="28" />
      <circle cx="322" cy="180" r="80" fill="none" stroke="#FF8E53" strokeWidth="28" />
      <circle cx="370" cy="256" r="80" fill="none" stroke="#FFC93C" strokeWidth="28" />
      <circle cx="322" cy="332" r="80" fill="none" stroke="#6BCB77" strokeWidth="28" />
      <circle cx="190" cy="332" r="80" fill="none" stroke="#4D96FF" strokeWidth="28" />
      <circle cx="142" cy="256" r="80" fill="none" stroke="#9B5DE5" strokeWidth="28" />
    </svg>
  );
}

// Messages - Chat bubble
export function MessagesIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="msg-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5BF85B" />
          <stop offset="100%" stopColor="#34C759" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#msg-bg)" />
      {/* Chat bubble */}
      <path
        d="M256 80 C140 80 60 150 60 240 C60 330 140 380 256 380 C280 380 304 376 326 368 L420 420 L390 340 C430 300 452 270 452 240 C452 150 372 80 256 80 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// Notes - Yellow notepad
export function NotesIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="notes-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="100%" stopColor="#FFE082" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#notes-bg)" />
      {/* Paper */}
      <rect x="100" y="60" width="312" height="392" rx="16" fill="#FFFFFF" />
      {/* Lines */}
      <line x1="130" y1="150" x2="382" y2="150" stroke="#D7CCC8" strokeWidth="6" />
      <line x1="130" y1="210" x2="382" y2="210" stroke="#D7CCC8" strokeWidth="6" />
      <line x1="130" y1="270" x2="382" y2="270" stroke="#D7CCC8" strokeWidth="6" />
      <line x1="130" y1="330" x2="300" y2="330" stroke="#D7CCC8" strokeWidth="6" />
      {/* Pencil mark */}
      <path d="M140 145 Q200 140 260 155" stroke="#1C1917" strokeWidth="4" fill="none" opacity="0.3" />
    </svg>
  );
}

// Calendar
export function CalendarIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="cal-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F5F5" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#cal-bg)" />
      {/* Red header */}
      <rect x="60" y="60" width="392" height="100" rx="20" fill="#FF3B30" />
      {/* Calendar body */}
      <rect x="60" y="140" width="392" height="312" rx="0 0 20 20" fill="#FFFFFF" />
      {/* Date grid */}
      {[0, 1, 2, 3, 4, 5, 6].map((col) =>
        [0, 1, 2, 3, 4].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={80 + col * 52}
            y={170 + row * 54}
            width={40}
            height={40}
            rx="8"
            fill={col === 3 && row === 2 ? '#FF3B30' : 'transparent'}
          />
        ))
      )}
      {/* Current date highlight */}
      <text x="256" y="310" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="600">17</text>
      {/* Month text */}
      <text x="256" y="125" textAnchor="middle" fill="#FFFFFF" fontSize="32" fontWeight="600">JANUARY</text>
    </svg>
  );
}

// Settings - Gear icon
export function SettingsIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="settings-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8E8E93" />
          <stop offset="100%" stopColor="#636366" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#settings-bg)" />
      {/* Gear */}
      <path
        d="M256 150 L276 150 L284 110 Q296 106 308 110 L330 140 L350 130 Q362 138 370 150 L356 178 L370 198 Q378 208 378 220 L340 234 L340 256 L378 270 Q378 282 370 294 L356 306 L370 334 Q362 346 350 354 L330 344 L308 374 Q296 378 284 374 L276 334 L256 334 L236 334 L228 374 Q216 378 204 374 L182 344 L162 354 Q150 346 142 334 L156 306 L142 294 Q134 282 134 270 L172 256 L172 234 L134 220 Q134 208 142 198 L156 178 L142 150 Q150 138 162 130 L182 140 L204 110 Q216 106 228 110 L236 150 Z"
        fill="#FFFFFF"
      />
      {/* Inner circle */}
      <circle cx="256" cy="256" r="60" fill="url(#settings-bg)" />
    </svg>
  );
}

// Welcome - Sparkle/star icon for landing page
export function WelcomeIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="welcome-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#welcome-bg)" />
      {/* Star burst */}
      <path
        d="M256 80 L280 200 L400 180 L300 256 L400 332 L280 312 L256 432 L232 312 L112 332 L212 256 L112 180 L232 200 Z"
        fill="#FFFFFF"
      />
      <circle cx="256" cy="256" r="40" fill="url(#welcome-bg)" />
      <circle cx="256" cy="256" r="20" fill="#FFFFFF" />
    </svg>
  );
}

// Features - Grid icon
export function FeaturesIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="features-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#features-bg)" />
      {/* Grid of boxes */}
      <rect x="90" y="90" width="140" height="140" rx="24" fill="#FFFFFF" />
      <rect x="282" y="90" width="140" height="140" rx="24" fill="#FFFFFF" opacity="0.7" />
      <rect x="90" y="282" width="140" height="140" rx="24" fill="#FFFFFF" opacity="0.7" />
      <rect x="282" y="282" width="140" height="140" rx="24" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

// Examples - Image stack icon
export function ExamplesIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="examples-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#examples-bg)" />
      {/* Stacked images */}
      <rect x="130" y="80" width="280" height="200" rx="16" fill="#FFFFFF" opacity="0.5" transform="rotate(-6 270 180)" />
      <rect x="110" y="100" width="280" height="200" rx="16" fill="#FFFFFF" opacity="0.7" transform="rotate(-3 250 200)" />
      <rect x="90" y="120" width="280" height="200" rx="16" fill="#FFFFFF" />
      {/* Mountain scene */}
      <path d="M90 280 L180 180 L240 240 L320 160 L370 280 Z" fill="#34D399" />
      {/* Sun */}
      <circle cx="330" cy="160" r="25" fill="#FBBF24" />
    </svg>
  );
}

// Pricing - Tag icon
export function PricingIcon({ className = '', size = 64 }: IconProps) {
  return (
    <svg viewBox="0 0 512 512" className={className} width={size} height={size}>
      <defs>
        <linearGradient id="pricing-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="110" fill="url(#pricing-bg)" />
      {/* Price tag */}
      <path
        d="M120 180 L280 80 L400 200 L260 400 Z"
        fill="#FFFFFF"
      />
      {/* Hole */}
      <circle cx="320" cy="160" r="30" fill="url(#pricing-bg)" />
      {/* Dollar sign */}
      <text x="220" y="300" fontSize="120" fontWeight="700" fill="url(#pricing-bg)">$</text>
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

