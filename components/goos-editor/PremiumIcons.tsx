'use client';

import { useIconStyleSafe, type IconVisualDirection, type IconRenderStyle, VISUAL_DIRECTIONS } from '@/contexts/IconStyleContext';

// ============================================================================
// PREMIUM ICON SYSTEM - Truly beautiful icons, better than macOS
// ============================================================================

interface IconProps {
  size?: number;
  direction?: IconVisualDirection;
  style?: IconRenderStyle;
}

function useIconColors(directionOverride?: IconVisualDirection) {
  const context = useIconStyleSafe();
  const direction = directionOverride || context?.config.visualDirection || 'warm-editorial';
  const renderStyle = context?.config.renderStyle || 'soft-3d';
  const palette = VISUAL_DIRECTIONS[direction].palette;

  return {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    surface: palette.surface,
    is3D: renderStyle === 'soft-3d',
    direction,
  };
}

// ============================================================================
// NOTE ICON - Elegant paper with sophisticated fold and writing
// ============================================================================
export function NoteIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, secondary, accent, surface, is3D, direction } = useIconColors(dirOverride);
  const id = `note-${Math.random().toString(36).slice(2)}`;

  // Direction-specific styling
  const styles = {
    'warm-editorial': {
      paper: ['#FBF8F3', '#F5EFE5'],
      fold: ['#EDE5D8', '#E0D5C5'],
      lines: '#C4B5A0',
      accent: '#B87333',
      shadow: 'rgba(139, 115, 85, 0.2)',
    },
    'minimal-monochrome': {
      paper: ['#FFFFFF', '#F8F8F8'],
      fold: ['#E8E8E8', '#D8D8D8'],
      lines: '#CCCCCC',
      accent: '#333333',
      shadow: 'rgba(0, 0, 0, 0.15)',
    },
    'premium-playful': {
      paper: ['#FFF9E6', '#FFF3CC'],
      fold: ['#FFE680', '#FFD633'],
      lines: '#E6C200',
      accent: '#F97316',
      shadow: 'rgba(249, 115, 22, 0.2)',
    },
  }[direction];

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <linearGradient id={`${id}-paper`} x1="10" y1="4" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.paper[0]} />
          <stop offset="1" stopColor={styles.paper[1]} />
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="32" y1="4" x2="42" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.fold[0]} />
          <stop offset="1" stopColor={styles.fold[1]} />
        </linearGradient>
        {is3D && (
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={styles.shadow} floodOpacity="1" />
          </filter>
        )}
      </defs>

      {/* Main paper */}
      <g filter={is3D ? `url(#${id}-shadow)` : undefined}>
        <path
          d="M12 8C12 5.79 13.79 4 16 4H32L42 16V44C42 46.21 40.21 48 38 48H16C13.79 48 12 46.21 12 44V8Z"
          fill={`url(#${id}-paper)`}
        />

        {/* Inner highlight for 3D */}
        {is3D && (
          <path
            d="M13 8C13 6.34 14.34 5 16 5H31L32 6V16L42 16V44C42 45.66 40.66 47 39 47H16C14.34 47 13 45.66 13 44V8Z"
            fill="url(#${id}-paper)"
            opacity="0.5"
          />
        )}

        {/* Folded corner */}
        <path d="M32 4V14C32 15.1 32.9 16 34 16H42L32 4Z" fill={`url(#${id}-fold)`} />

        {/* Corner shadow */}
        {is3D && (
          <path d="M32 4L42 16H34C32.9 16 32 15.1 32 14V4Z" fill={styles.fold[1]} opacity="0.3" />
        )}

        {/* Elegant writing lines */}
        <g opacity="0.6">
          {/* Title line with accent */}
          <rect x="17" y="22" width="4" height="3" rx="1.5" fill={styles.accent} />
          <rect x="23" y="22" width="14" height="3" rx="1.5" fill={styles.lines} />

          {/* Body lines */}
          <rect x="17" y="29" width="18" height="2" rx="1" fill={styles.lines} opacity="0.7" />
          <rect x="17" y="34" width="14" height="2" rx="1" fill={styles.lines} opacity="0.5" />
          <rect x="17" y="39" width="16" height="2" rx="1" fill={styles.lines} opacity="0.4" />
        </g>

        {/* Border */}
        <path
          d="M12 8C12 5.79 13.79 4 16 4H32L42 16V44C42 46.21 40.21 48 38 48H16C13.79 48 12 46.21 12 44V8Z"
          stroke={styles.lines}
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="none"
        />
      </g>
    </svg>
  );
}

// ============================================================================
// FOLDER ICON - Premium macOS-style folder with depth and polish
// ============================================================================
export function FolderIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);
  const id = `folder-${Math.random().toString(36).slice(2)}`;

  const styles = {
    'warm-editorial': {
      front: ['#E8D5B5', '#D4BC95'],
      back: ['#F0E2C8', '#E0CCA8'],
      inner: '#C8B090',
      highlight: 'rgba(255, 255, 255, 0.4)',
      shadow: 'rgba(139, 115, 85, 0.25)',
    },
    'minimal-monochrome': {
      front: ['#E0E0E0', '#C8C8C8'],
      back: ['#F0F0F0', '#E0E0E0'],
      inner: '#B0B0B0',
      highlight: 'rgba(255, 255, 255, 0.6)',
      shadow: 'rgba(0, 0, 0, 0.15)',
    },
    'premium-playful': {
      front: ['#60A5FA', '#3B82F6'],
      back: ['#93C5FD', '#60A5FA'],
      inner: '#2563EB',
      highlight: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(59, 130, 246, 0.3)',
    },
  }[direction];

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <linearGradient id={`${id}-front`} x1="6" y1="18" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.front[0]} />
          <stop offset="1" stopColor={styles.front[1]} />
        </linearGradient>
        <linearGradient id={`${id}-back`} x1="6" y1="10" x2="46" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.back[0]} />
          <stop offset="1" stopColor={styles.back[1]} />
        </linearGradient>
        {is3D && (
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={styles.shadow} floodOpacity="1" />
          </filter>
        )}
      </defs>

      <g filter={is3D ? `url(#${id}-shadow)` : undefined}>
        {/* Back tab */}
        <path
          d="M9 14C9 12.34 10.34 11 12 11H20L24 7H40C41.66 7 43 8.34 43 10V16H9V14Z"
          fill={`url(#${id}-back)`}
        />

        {/* Main folder body */}
        <path
          d="M6 18C6 16.34 7.34 15 9 15H43C44.66 15 46 16.34 46 18V40C46 41.66 44.66 43 43 43H9C7.34 43 6 41.66 6 40V18Z"
          fill={`url(#${id}-front)`}
        />

        {/* Top edge highlight */}
        {is3D && (
          <path
            d="M7 18C7 16.9 7.9 16 9 16H43C44.1 16 45 16.9 45 18V19H7V18Z"
            fill={styles.highlight}
          />
        )}

        {/* Inner fold depth */}
        {is3D && (
          <path
            d="M9 20H43V39C43 40.1 42.1 41 41 41H11C9.9 41 9 40.1 9 39V20Z"
            fill={styles.inner}
            opacity="0.15"
          />
        )}

        {/* Decorative papers inside */}
        <rect x="14" y="24" width="16" height="2" rx="1" fill={styles.inner} opacity="0.2" />
        <rect x="14" y="29" width="12" height="2" rx="1" fill={styles.inner} opacity="0.15" />
      </g>
    </svg>
  );
}

// ============================================================================
// CASE STUDY ICON - Sleek presentation board with data visualization
// ============================================================================
export function CaseStudyIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { accent, is3D, direction } = useIconColors(dirOverride);
  const id = `case-${Math.random().toString(36).slice(2)}`;

  const styles = {
    'warm-editorial': {
      board: ['#FAFAF7', '#F0EDE5'],
      screen: '#FFFFFF',
      chart1: '#B87333',
      chart2: '#8B7355',
      chart3: '#C4A574',
      line: '#D4A574',
      stand: '#C8B8A0',
      shadow: 'rgba(139, 115, 85, 0.2)',
    },
    'minimal-monochrome': {
      board: ['#FFFFFF', '#F5F5F5'],
      screen: '#FAFAFA',
      chart1: '#333333',
      chart2: '#666666',
      chart3: '#999999',
      line: '#333333',
      stand: '#CCCCCC',
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
    'premium-playful': {
      board: ['#FFFFFF', '#F8F8FF'],
      screen: '#FAFAFF',
      chart1: '#8B5CF6',
      chart2: '#F97316',
      chart3: '#06B6D4',
      line: '#EC4899',
      stand: '#D1D5DB',
      shadow: 'rgba(139, 92, 246, 0.2)',
    },
  }[direction];

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <linearGradient id={`${id}-board`} x1="8" y1="6" x2="44" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.board[0]} />
          <stop offset="1" stopColor={styles.board[1]} />
        </linearGradient>
        {is3D && (
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={styles.shadow} floodOpacity="1" />
          </filter>
        )}
      </defs>

      <g filter={is3D ? `url(#${id}-shadow)` : undefined}>
        {/* Board */}
        <rect x="8" y="6" width="36" height="28" rx="4" fill={`url(#${id}-board)`} />

        {/* Screen inset */}
        <rect x="12" y="10" width="28" height="20" rx="2" fill={styles.screen} />

        {/* Data visualization - bar chart */}
        <rect x="16" y="22" width="5" height="6" rx="1" fill={styles.chart1} />
        <rect x="23" y="18" width="5" height="10" rx="1" fill={styles.chart2} />
        <rect x="30" y="20" width="5" height="8" rx="1" fill={styles.chart3} />

        {/* Trend line */}
        <path
          d="M18 21L25 16L33 18"
          stroke={styles.line}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Title area */}
        <rect x="16" y="12" width="12" height="2" rx="1" fill={styles.chart1} opacity="0.4" />

        {/* Stand */}
        <path d="M26 34V42" stroke={styles.stand} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="26" cy="44" rx="8" ry="2" fill={styles.stand} opacity="0.5" />
      </g>
    </svg>
  );
}

// ============================================================================
// CV ICON - Professional resume with elegant layout
// ============================================================================
export function CVIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);
  const id = `cv-${Math.random().toString(36).slice(2)}`;

  const styles = {
    'warm-editorial': {
      paper: ['#FFFDFB', '#F8F4ED'],
      header: ['#4A7C59', '#3D6B4A'],
      avatar: '#5A8F6A',
      text: '#8B7355',
      shadow: 'rgba(74, 124, 89, 0.2)',
    },
    'minimal-monochrome': {
      paper: ['#FFFFFF', '#FAFAFA'],
      header: ['#333333', '#222222'],
      avatar: '#444444',
      text: '#888888',
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
    'premium-playful': {
      paper: ['#FFFFFF', '#FFFBF5'],
      header: ['#8B5CF6', '#7C3AED'],
      avatar: '#A78BFA',
      text: '#9CA3AF',
      shadow: 'rgba(139, 92, 246, 0.2)',
    },
  }[direction];

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <linearGradient id={`${id}-paper`} x1="10" y1="3" x2="42" y2="49" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.paper[0]} />
          <stop offset="1" stopColor={styles.paper[1]} />
        </linearGradient>
        <linearGradient id={`${id}-header`} x1="10" y1="3" x2="42" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.header[0]} />
          <stop offset="1" stopColor={styles.header[1]} />
        </linearGradient>
        {is3D && (
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={styles.shadow} floodOpacity="1" />
          </filter>
        )}
      </defs>

      <g filter={is3D ? `url(#${id}-shadow)` : undefined}>
        {/* Paper */}
        <path
          d="M10 6C10 3.79 11.79 2 14 2H38C40.21 2 42 3.79 42 6V46C42 48.21 40.21 50 38 50H14C11.79 50 10 48.21 10 46V6Z"
          fill={`url(#${id}-paper)`}
        />

        {/* Header banner */}
        <path
          d="M10 6C10 3.79 11.79 2 14 2H38C40.21 2 42 3.79 42 6V12H10V6Z"
          fill={`url(#${id}-header)`}
        />

        {/* Avatar circle */}
        <circle cx="20" cy="22" r="7" fill={styles.avatar} />
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.9" />
        <ellipse cx="20" cy="26" rx="4" ry="2.5" fill="white" opacity="0.9" />

        {/* Name and title */}
        <rect x="30" y="18" width="9" height="3" rx="1.5" fill={styles.text} opacity="0.7" />
        <rect x="30" y="23" width="6" height="2" rx="1" fill={styles.text} opacity="0.4" />

        {/* Content sections */}
        <rect x="14" y="34" width="24" height="2.5" rx="1" fill={styles.text} opacity="0.5" />
        <rect x="14" y="39" width="18" height="2" rx="1" fill={styles.text} opacity="0.3" />
        <rect x="14" y="43" width="20" height="2" rx="1" fill={styles.text} opacity="0.3" />
      </g>
    </svg>
  );
}

// ============================================================================
// IMAGE ICON - Photo frame with landscape preview
// ============================================================================
export function ImageIcon({ size = 52, direction: dirOverride, imageUrl }: IconProps & { imageUrl?: string }) {
  const { is3D, direction } = useIconColors(dirOverride);
  const id = `img-${Math.random().toString(36).slice(2)}`;

  if (imageUrl) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: is3D ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        border: '2px solid rgba(255,255,255,0.8)',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
      </div>
    );
  }

  const styles = {
    'warm-editorial': {
      frame: ['#F5F0E8', '#E8E0D0'],
      sky: '#D4E5F7',
      sun: '#F5C563',
      hills: ['#7BA05B', '#5C8A3E'],
      shadow: 'rgba(139, 115, 85, 0.2)',
    },
    'minimal-monochrome': {
      frame: ['#F5F5F5', '#E5E5E5'],
      sky: '#E8E8E8',
      sun: '#CCCCCC',
      hills: ['#999999', '#777777'],
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
    'premium-playful': {
      frame: ['#FFF5F5', '#FFE5E5'],
      sky: '#DBEAFE',
      sun: '#FCD34D',
      hills: ['#34D399', '#10B981'],
      shadow: 'rgba(236, 72, 153, 0.2)',
    },
  }[direction];

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <linearGradient id={`${id}-frame`} x1="6" y1="8" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.frame[0]} />
          <stop offset="1" stopColor={styles.frame[1]} />
        </linearGradient>
        <linearGradient id={`${id}-hills`} x1="10" y1="28" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.hills[0]} />
          <stop offset="1" stopColor={styles.hills[1]} />
        </linearGradient>
        {is3D && (
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={styles.shadow} floodOpacity="1" />
          </filter>
        )}
      </defs>

      <g filter={is3D ? `url(#${id}-shadow)` : undefined}>
        {/* Frame */}
        <rect x="6" y="8" width="40" height="36" rx="4" fill={`url(#${id}-frame)`} />

        {/* Photo area */}
        <rect x="10" y="12" width="32" height="24" rx="2" fill={styles.sky} />

        {/* Sun */}
        <circle cx="18" cy="20" r="5" fill={styles.sun} />
        {is3D && <circle cx="17" cy="19" r="2" fill="white" opacity="0.4" />}

        {/* Mountains/hills */}
        <path d="M10 36L22 24L32 30L42 22V34C42 35.1 41.1 36 40 36H12C10.9 36 10 35.1 10 34V36Z" fill={`url(#${id}-hills)`} />
      </g>
    </svg>
  );
}

// ============================================================================
// LINK ICON - Modern web link with globe/arrow
// ============================================================================
export function LinkIcon({ size = 52, direction: dirOverride, faviconUrl }: IconProps & { faviconUrl?: string | null }) {
  const { accent, is3D, direction } = useIconColors(dirOverride);
  const id = `link-${Math.random().toString(36).slice(2)}`;

  const styles = {
    'warm-editorial': {
      bg: ['#FAF7F2', '#F0EBE0'],
      icon: '#8B7355',
      badge: ['#B87333', '#9A5F28'],
      shadow: 'rgba(139, 115, 85, 0.2)',
    },
    'minimal-monochrome': {
      bg: ['#F8F8F8', '#F0F0F0'],
      icon: '#444444',
      badge: ['#333333', '#222222'],
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
    'premium-playful': {
      bg: ['#FFF7ED', '#FFEDD5'],
      icon: '#EA580C',
      badge: ['#F97316', '#EA580C'],
      shadow: 'rgba(249, 115, 22, 0.2)',
    },
  }[direction];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: is3D ? `linear-gradient(145deg, ${styles.bg[0]}, ${styles.bg[1]})` : styles.bg[0],
      boxShadow: is3D ? `0 4px 12px ${styles.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      border: `1px solid ${styles.icon}15`,
    }}>
      {faviconUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={faviconUrl} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} draggable={false} />
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={styles.icon} strokeWidth="2" fill="none" />
          <ellipse cx="12" cy="12" rx="4" ry="9" stroke={styles.icon} strokeWidth="1.5" fill="none" />
          <line x1="3" y1="12" x2="21" y2="12" stroke={styles.icon} strokeWidth="1.5" />
        </svg>
      )}

      {/* Arrow badge */}
      <div style={{
        position: 'absolute',
        bottom: -3,
        right: -3,
        width: 20,
        height: 20,
        borderRadius: 7,
        background: is3D ? `linear-gradient(145deg, ${styles.badge[0]}, ${styles.badge[1]})` : styles.badge[0],
        border: '2.5px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H9M17 7V15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// GAME ICON - Premium gamepad with vibrant colors
// ============================================================================
export function GameIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);

  const styles = {
    'warm-editorial': {
      bg: ['#5C8A5E', '#4A7C4D'],
      controller: '#FFFFFF',
      dpad: '#3D6B40',
      buttons: ['#E07B4A', '#5C8A5E', '#D4A84B', '#7B5CB8'],
    },
    'minimal-monochrome': {
      bg: ['#444444', '#333333'],
      controller: '#FFFFFF',
      dpad: '#333333',
      buttons: ['#666666', '#555555', '#777777', '#888888'],
    },
    'premium-playful': {
      bg: ['#10B981', '#059669'],
      controller: '#FFFFFF',
      dpad: '#047857',
      buttons: ['#F43F5E', '#8B5CF6', '#FBBF24', '#3B82F6'],
    },
  }[direction];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 14,
      background: is3D ? `linear-gradient(145deg, ${styles.bg[0]}, ${styles.bg[1]})` : styles.bg[0],
      boxShadow: is3D ? `0 6px 16px ${styles.bg[1]}60, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* Controller body */}
        <path
          d="M6 14C6 10.69 8.69 8 12 8H20C23.31 8 26 10.69 26 14V18C26 21.31 23.31 24 20 24H12C8.69 24 6 21.31 6 18V14Z"
          fill={styles.controller}
        />

        {/* D-pad */}
        <rect x="10" y="14" width="5" height="2" rx="1" fill={styles.dpad} />
        <rect x="11.5" y="12.5" width="2" height="5" rx="1" fill={styles.dpad} />

        {/* Action buttons */}
        <circle cx="21" cy="13" r="1.5" fill={styles.buttons[0]} />
        <circle cx="24" cy="15" r="1.5" fill={styles.buttons[1]} />
        <circle cx="21" cy="17" r="1.5" fill={styles.buttons[2]} />
        <circle cx="18" cy="15" r="1.5" fill={styles.buttons[3]} />
      </svg>
    </div>
  );
}

// ============================================================================
// EMBED ICON - Video player with play button
// ============================================================================
export function EmbedIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);

  const styles = {
    'warm-editorial': {
      bg: ['#C75450', '#A8403D'],
      play: '#FFFFFF',
    },
    'minimal-monochrome': {
      bg: ['#444444', '#333333'],
      play: '#FFFFFF',
    },
    'premium-playful': {
      bg: ['#EF4444', '#DC2626'],
      play: '#FFFFFF',
    },
  }[direction];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 14,
      background: is3D ? `linear-gradient(145deg, ${styles.bg[0]}, ${styles.bg[1]})` : styles.bg[0],
      boxShadow: is3D ? `0 6px 16px ${styles.bg[1]}50, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 5.5V18.5L19 12L8 5.5Z" fill={styles.play} />
      </svg>
    </div>
  );
}

// ============================================================================
// DOWNLOAD ICON - File with download arrow
// ============================================================================
export function DownloadIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);
  const id = `dl-${Math.random().toString(36).slice(2)}`;

  const styles = {
    'warm-editorial': {
      paper: ['#F5F2ED', '#E8E3DB'],
      fold: '#D8D0C3',
      arrow: '#8B7355',
      shadow: 'rgba(139, 115, 85, 0.2)',
    },
    'minimal-monochrome': {
      paper: ['#F8F8F8', '#EFEFEF'],
      fold: '#DDDDDD',
      arrow: '#444444',
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
    'premium-playful': {
      paper: ['#E0F2FE', '#BAE6FD'],
      fold: '#7DD3FC',
      arrow: '#0284C7',
      shadow: 'rgba(2, 132, 199, 0.2)',
    },
  }[direction];

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <defs>
        <linearGradient id={`${id}-paper`} x1="12" y1="4" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={styles.paper[0]} />
          <stop offset="1" stopColor={styles.paper[1]} />
        </linearGradient>
        {is3D && (
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={styles.shadow} floodOpacity="1" />
          </filter>
        )}
      </defs>

      <g filter={is3D ? `url(#${id}-shadow)` : undefined}>
        <path
          d="M14 8C14 5.79 15.79 4 18 4H30L40 14V44C40 46.21 38.21 48 36 48H18C15.79 48 14 46.21 14 44V8Z"
          fill={`url(#${id}-paper)`}
        />
        <path d="M30 4V12C30 13.1 30.9 14 32 14H40L30 4Z" fill={styles.fold} />

        {/* Download arrow */}
        <path
          d="M27 20V32M27 32L22 27M27 32L32 27"
          stroke={styles.arrow}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="20" y="36" width="14" height="3" rx="1.5" fill={styles.arrow} opacity="0.4" />
      </g>
    </svg>
  );
}

// ============================================================================
// BOARD ICON - Kanban columns
// ============================================================================
export function BoardIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);

  const styles = {
    'warm-editorial': { bg: ['#6B8CCE', '#5474B4'] },
    'minimal-monochrome': { bg: ['#555555', '#444444'] },
    'premium-playful': { bg: ['#3B82F6', '#2563EB'] },
  }[direction];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 14,
      background: is3D ? `linear-gradient(145deg, ${styles.bg[0]}, ${styles.bg[1]})` : styles.bg[0],
      boxShadow: is3D ? `0 6px 16px ${styles.bg[1]}50, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      gap: 4,
    }}>
      {[0, 1, 2].map((col) => (
        <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.9)' }} />
          {[10, 8, 12].slice(0, 3 - col).map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 3, background: `rgba(255,255,255,${0.7 - i * 0.15})` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SHEET ICON - Spreadsheet grid
// ============================================================================
export function SheetIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);

  const styles = {
    'warm-editorial': { bg: ['#5C8A5E', '#4A7C4D'] },
    'minimal-monochrome': { bg: ['#555555', '#444444'] },
    'premium-playful': { bg: ['#10B981', '#059669'] },
  }[direction];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 14,
      background: is3D ? `linear-gradient(145deg, ${styles.bg[0]}, ${styles.bg[1]})` : styles.bg[0],
      boxShadow: is3D ? `0 6px 16px ${styles.bg[1]}50, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="5" rx="1" fill="rgba(255,255,255,0.9)" />
        {[8, 14].map((y) => (
          <g key={y}>
            <rect x="2" y={y} width="6" height="4" rx="0.5" fill="rgba(255,255,255,0.5)" />
            <rect x="9" y={y} width="6" height="4" rx="0.5" fill="rgba(255,255,255,0.4)" />
            <rect x="16" y={y} width="6" height="4" rx="0.5" fill="rgba(255,255,255,0.35)" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================================
// SLIDES ICON - Presentation with badge
// ============================================================================
export function SlidesIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { is3D, direction } = useIconColors(dirOverride);

  const styles = {
    'warm-editorial': {
      bg: ['#D4874B', '#C07038'],
      badge: ['#7B5CB8', '#6344A3'],
    },
    'minimal-monochrome': {
      bg: ['#555555', '#444444'],
      badge: ['#777777', '#666666'],
    },
    'premium-playful': {
      bg: ['#F97316', '#EA580C'],
      badge: ['#8B5CF6', '#7C3AED'],
    },
  }[direction];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 14,
      background: is3D ? `linear-gradient(145deg, ${styles.bg[0]}, ${styles.bg[1]})` : styles.bg[0],
      boxShadow: is3D ? `0 6px 16px ${styles.bg[1]}50, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width="32" height="28" viewBox="0 0 24 20" fill="none">
        <rect x="2" y="2" width="20" height="14" rx="2" fill="rgba(255,255,255,0.95)" />
        <rect x="4" y="4" width="10" height="2" rx="1" fill={`${styles.bg[1]}88`} />
        <rect x="4" y="8" width="8" height="1.5" rx="0.5" fill={`${styles.bg[1]}55`} />
        <rect x="4" y="11" width="6" height="1.5" rx="0.5" fill={`${styles.bg[1]}44`} />
        <rect x="14" y="7" width="6" height="6" rx="1" fill={`${styles.bg[1]}55`} />
        <circle cx="10" cy="18" r="1" fill="rgba(255,255,255,0.9)" />
        <circle cx="14" cy="18" r="1" fill="rgba(255,255,255,0.5)" />
      </svg>

      {/* Play badge */}
      <div style={{
        position: 'absolute',
        bottom: -3,
        right: -3,
        width: 20,
        height: 20,
        borderRadius: 7,
        background: is3D ? `linear-gradient(145deg, ${styles.badge[0]}, ${styles.badge[1]})` : styles.badge[0],
        border: '2.5px solid white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path d="M8 5V19L19 12L8 5Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// ICON SELECTOR
// ============================================================================
export function getPremiumIcon(
  type: string,
  props?: IconProps & { imageUrl?: string; faviconUrl?: string | null }
) {
  const { imageUrl, faviconUrl, ...iconProps } = props || {};

  switch (type) {
    case 'note': return <NoteIcon {...iconProps} />;
    case 'folder': return <FolderIcon {...iconProps} />;
    case 'case-study': return <CaseStudyIcon {...iconProps} />;
    case 'cv': return <CVIcon {...iconProps} />;
    case 'image': return <ImageIcon {...iconProps} imageUrl={imageUrl} />;
    case 'link': return <LinkIcon {...iconProps} faviconUrl={faviconUrl} />;
    case 'game': return <GameIcon {...iconProps} />;
    case 'embed': return <EmbedIcon {...iconProps} />;
    case 'download': return <DownloadIcon {...iconProps} />;
    case 'board': return <BoardIcon {...iconProps} />;
    case 'sheet': return <SheetIcon {...iconProps} />;
    case 'slides': return <SlidesIcon {...iconProps} />;
    default: return <NoteIcon {...iconProps} />;
  }
}
