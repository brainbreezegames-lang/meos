'use client';

import { useIconStyleSafe, type IconVisualDirection, type IconRenderStyle, VISUAL_DIRECTIONS } from '@/contexts/IconStyleContext';

// ============================================================================
// PREMIUM ICON SYSTEM - Beautiful icons that respond to style settings
// ============================================================================

interface IconProps {
  size?: number;
  direction?: IconVisualDirection;
  style?: IconRenderStyle;
}

// Get colors from visual direction
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

// Shared 3D effect styles
function get3DStyles(is3D: boolean, baseColor: string, lightColor: string = 'rgba(255,255,255,0.4)') {
  if (!is3D) return {};
  return {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
  };
}

// ============================================================================
// NOTE ICON - Paper with folded corner
// ============================================================================
export function NoteIcon({ size = 52, direction: dirOverride, style: styleOverride }: IconProps) {
  const { primary, secondary, surface, accent, is3D, direction } = useIconColors(dirOverride);

  // Direction-specific colors
  const paperColor = direction === 'minimal-monochrome' ? '#ffffff' : surface;
  const lineColor = direction === 'minimal-monochrome' ? primary : `${primary}20`;
  const foldColor = direction === 'minimal-monochrome' ? '#e5e5e5' : `${secondary}30`;

  const gradientId = `note-grad-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={get3DStyles(is3D, surface)}>
      <defs>
        {is3D && (
          <linearGradient id={gradientId} x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor={paperColor} />
            <stop offset="1" stopColor={direction === 'minimal-monochrome' ? '#f5f5f5' : `${secondary}15`} />
          </linearGradient>
        )}
      </defs>

      {/* Shadow */}
      {is3D && (
        <path
          d="M12 8C12 5.79 13.79 4 16 4H32L42 14V44C42 46.21 40.21 48 38 48H16C13.79 48 12 46.21 12 44V8Z"
          fill="rgba(0,0,0,0.08)"
          transform="translate(1, 1)"
        />
      )}

      {/* Paper body */}
      <path
        d="M12 8C12 5.79 13.79 4 16 4H32L42 14V44C42 46.21 40.21 48 38 48H16C13.79 48 12 46.21 12 44V8Z"
        fill={is3D ? `url(#${gradientId})` : paperColor}
        stroke={`${primary}20`}
        strokeWidth="1"
      />

      {/* Folded corner */}
      <path
        d="M32 4V12C32 13.1 32.9 14 34 14H42L32 4Z"
        fill={foldColor}
      />

      {/* Inner highlight for 3D */}
      {is3D && (
        <path
          d="M13 8C13 6.34 14.34 5 16 5H31V6H16C14.9 6 14 6.9 14 8V43H13V8Z"
          fill="rgba(255,255,255,0.5)"
        />
      )}

      {/* Text lines */}
      <rect x="17" y="20" width="18" height="2.5" rx="1.25" fill={lineColor} />
      <rect x="17" y="26" width="14" height="2" rx="1" fill={`${primary}12`} />
      <rect x="17" y="31" width="16" height="2" rx="1" fill={`${primary}12`} />
      <rect x="17" y="36" width="10" height="2" rx="1" fill={`${primary}08`} />

      {/* Accent line */}
      <rect x="17" y="20" width="3" height="2.5" rx="1" fill={accent} opacity="0.8" />
    </svg>
  );
}

// ============================================================================
// FOLDER ICON - Classic folder with depth
// ============================================================================
export function FolderIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, secondary, accent, is3D, direction } = useIconColors(dirOverride);

  // Direction-specific folder colors
  const folderColors = {
    'warm-editorial': { main: '#E8D5B5', tab: '#F0E2C8', inner: '#DCC9A8' },
    'minimal-monochrome': { main: '#E5E5E5', tab: '#F0F0F0', inner: '#D5D5D5' },
    'premium-playful': { main: '#FFD580', tab: '#FFE4A8', inner: '#FFC44D' },
  };

  const colors = folderColors[direction];
  const gradientId = `folder-grad-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={get3DStyles(is3D, colors.main)}>
      <defs>
        {is3D && (
          <linearGradient id={gradientId} x1="6" y1="14" x2="46" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor={colors.tab} />
            <stop offset="0.5" stopColor={colors.main} />
            <stop offset="1" stopColor={colors.inner} />
          </linearGradient>
        )}
      </defs>

      {/* Shadow */}
      {is3D && (
        <path
          d="M6 16C6 14.34 7.34 13 9 13H19L23 9H43C44.66 9 46 10.34 46 12V38C46 39.66 44.66 41 43 41H9C7.34 41 6 39.66 6 38V16Z"
          fill="rgba(0,0,0,0.1)"
          transform="translate(1, 1)"
        />
      )}

      {/* Back tab */}
      <path
        d="M9 13H18L22 9H43C44.66 9 46 10.34 46 12V16H6V16C6 14.34 7.34 13 9 13Z"
        fill={colors.tab}
      />

      {/* Main folder body */}
      <path
        d="M6 16H46V38C46 39.66 44.66 41 43 41H9C7.34 41 6 39.66 6 38V16Z"
        fill={is3D ? `url(#${gradientId})` : colors.main}
      />

      {/* Top highlight */}
      {is3D && (
        <path
          d="M6 18C6 16.9 6.9 16 8 16H44C45.1 16 46 16.9 46 18V19H6V18Z"
          fill="rgba(255,255,255,0.35)"
        />
      )}

      {/* Border */}
      <path
        d="M9 13H18L22 9H43C44.66 9 46 10.34 46 12V38C46 39.66 44.66 41 43 41H9C7.34 41 6 39.66 6 38V16C6 14.34 7.34 13 9 13Z"
        stroke={`${primary}18`}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

// ============================================================================
// CASE STUDY ICON - Presentation board with chart
// ============================================================================
export function CaseStudyIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, secondary, accent, surface, is3D, direction } = useIconColors(dirOverride);

  const boardColor = direction === 'minimal-monochrome' ? '#ffffff' : surface;
  const chartColor1 = direction === 'minimal-monochrome' ? '#333333' : accent;
  const chartColor2 = direction === 'minimal-monochrome' ? '#666666' : secondary;

  const gradientId = `case-grad-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={get3DStyles(is3D, boardColor)}>
      <defs>
        {is3D && (
          <linearGradient id={gradientId} x1="8" y1="6" x2="44" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor={boardColor} />
            <stop offset="1" stopColor={direction === 'minimal-monochrome' ? '#f0f0f0' : `${secondary}10`} />
          </linearGradient>
        )}
      </defs>

      {/* Shadow */}
      {is3D && (
        <rect x="9" y="7" width="34" height="28" rx="4" fill="rgba(0,0,0,0.1)" />
      )}

      {/* Board body */}
      <rect x="8" y="6" width="34" height="28" rx="4" fill={is3D ? `url(#${gradientId})` : boardColor} stroke={`${primary}15`} strokeWidth="1" />

      {/* Screen area */}
      <rect x="12" y="10" width="26" height="18" rx="2" fill={direction === 'minimal-monochrome' ? '#fafafa' : `${surface}`} />

      {/* Chart bars */}
      <rect x="16" y="21" width="5" height="5" rx="1" fill={chartColor1} opacity="0.9" />
      <rect x="23" y="16" width="5" height="10" rx="1" fill={chartColor2} opacity="0.8" />
      <rect x="30" y="18" width="5" height="8" rx="1" fill={chartColor1} opacity="0.7" />

      {/* Trend line */}
      <path d="M16 20L21 17L28 14L35 16" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* Stand */}
      <path d="M26 34V42" stroke={`${primary}30`} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="26" cy="44" rx="8" ry="2.5" fill={`${primary}10`} />
    </svg>
  );
}

// ============================================================================
// CV ICON - Professional document with photo
// ============================================================================
export function CVIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, secondary, accent, surface, is3D, direction } = useIconColors(dirOverride);

  const paperColor = direction === 'minimal-monochrome' ? '#ffffff' : surface;
  const headerColor = direction === 'minimal-monochrome' ? '#333333' :
                     direction === 'premium-playful' ? '#22c55e' : '#4a7c59';

  const gradientId = `cv-grad-${Math.random().toString(36).slice(2)}`;
  const avatarGradId = `cv-avatar-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={get3DStyles(is3D, paperColor)}>
      <defs>
        {is3D && (
          <>
            <linearGradient id={gradientId} x1="10" y1="4" x2="42" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor={paperColor} />
              <stop offset="1" stopColor={direction === 'minimal-monochrome' ? '#f5f5f5' : `${secondary}10`} />
            </linearGradient>
            <linearGradient id={avatarGradId} x1="14" y1="14" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor={headerColor} />
              <stop offset="1" stopColor={direction === 'minimal-monochrome' ? '#555555' : `${headerColor}dd`} />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Shadow */}
      {is3D && (
        <path
          d="M11 7C11 4.79 12.79 3 15 3H37C39.21 3 41 4.79 41 7V45C41 47.21 39.21 49 37 49H15C12.79 49 11 47.21 11 45V7Z"
          fill="rgba(0,0,0,0.08)"
          transform="translate(1, 1)"
        />
      )}

      {/* Document body */}
      <path
        d="M11 7C11 4.79 12.79 3 15 3H37C39.21 3 41 4.79 41 7V45C41 47.21 39.21 49 37 49H15C12.79 49 11 47.21 11 45V7Z"
        fill={is3D ? `url(#${gradientId})` : paperColor}
        stroke={`${primary}15`}
        strokeWidth="1"
      />

      {/* Header bar */}
      <rect x="11" y="3" width="30" height="8" rx="2" fill={is3D ? `url(#${avatarGradId})` : headerColor} />

      {/* Avatar circle */}
      <circle cx="20" cy="20" r="6" fill={is3D ? `url(#${avatarGradId})` : headerColor} />
      <circle cx="20" cy="18.5" r="2.5" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="20" cy="23.5" rx="3.5" ry="2" fill="rgba(255,255,255,0.9)" />

      {/* Name lines */}
      <rect x="29" y="16" width="9" height="3" rx="1.5" fill={`${primary}20`} />
      <rect x="29" y="21" width="6" height="2" rx="1" fill={`${primary}10`} />

      {/* Content lines */}
      <rect x="15" y="32" width="22" height="2.5" rx="1" fill={`${primary}12`} />
      <rect x="15" y="37" width="18" height="2" rx="1" fill={`${primary}08`} />
      <rect x="15" y="41" width="20" height="2" rx="1" fill={`${primary}08`} />
    </svg>
  );
}

// ============================================================================
// IMAGE ICON - Photo with landscape
// ============================================================================
export function ImageIcon({ size = 52, direction: dirOverride, imageUrl }: IconProps & { imageUrl?: string }) {
  const { primary, secondary, accent, surface, is3D, direction } = useIconColors(dirOverride);

  if (imageUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          overflow: 'hidden',
          background: `${primary}08`,
          border: `1px solid ${primary}15`,
          boxShadow: is3D ? '0 3px 10px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />
      </div>
    );
  }

  const frameColor = direction === 'minimal-monochrome' ? '#e5e5e5' : `${secondary}30`;
  const sunColor = direction === 'minimal-monochrome' ? '#999999' : accent;
  const hillColor = direction === 'minimal-monochrome' ? '#666666' : '#4a7c59';

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={get3DStyles(is3D, frameColor)}>
      {/* Shadow */}
      {is3D && (
        <rect x="7" y="9" width="38" height="34" rx="4" fill="rgba(0,0,0,0.1)" />
      )}

      {/* Frame */}
      <rect x="6" y="8" width="38" height="34" rx="4" fill={frameColor} stroke={`${primary}12`} strokeWidth="1" />

      {/* Photo area */}
      <rect x="10" y="12" width="30" height="24" rx="2" fill={direction === 'minimal-monochrome' ? '#fafafa' : '#e8f4fd'} />

      {/* Sun */}
      <circle cx="18" cy="20" r="4" fill={sunColor} opacity="0.9" />

      {/* Mountains */}
      <path d="M10 36L22 24L30 30L40 20V34C40 35.1 39.1 36 38 36H12C10.9 36 10 35.1 10 34V36Z" fill={hillColor} opacity="0.7" />
    </svg>
  );
}

// ============================================================================
// LINK ICON - Globe/chain link
// ============================================================================
export function LinkIcon({ size = 52, direction: dirOverride, faviconUrl }: IconProps & { faviconUrl?: string | null }) {
  const { primary, secondary, accent, surface, is3D, direction } = useIconColors(dirOverride);

  const bgColor = direction === 'minimal-monochrome' ? '#f5f5f5' : surface;
  const linkColor = direction === 'minimal-monochrome' ? '#333333' : accent;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: is3D
          ? `linear-gradient(145deg, ${bgColor} 0%, ${direction === 'minimal-monochrome' ? '#e8e8e8' : `${secondary}20`} 100%)`
          : bgColor,
        boxShadow: is3D
          ? `0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)`
          : 'none',
        border: `1px solid ${primary}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {faviconUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={faviconUrl}
          alt=""
          style={{ width: 28, height: 28, objectFit: 'contain' }}
          draggable={false}
        />
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M10 6H7C5.89543 6 5 6.89543 5 8V10M10 18H7C5.89543 18 5 17.1046 5 16V14M14 6H17C18.1046 6 19 6.89543 19 8V10M14 18H17C18.1046 18 19 17.1046 19 16V14M8 12H16"
            stroke={linkColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Link badge */}
      <div
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 18,
          height: 18,
          borderRadius: 6,
          background: is3D
            ? `linear-gradient(145deg, ${accent} 0%, ${accent}dd 100%)`
            : accent,
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H8M17 7V16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// GAME ICON - Gamepad
// ============================================================================
export function GameIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, accent, is3D, direction } = useIconColors(dirOverride);

  const bgColor = direction === 'minimal-monochrome'
    ? '#333333'
    : direction === 'premium-playful'
      ? '#22c55e'
      : '#4a7c59';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: is3D
          ? `linear-gradient(145deg, ${bgColor}ee 0%, ${bgColor} 50%, ${bgColor}cc 100%)`
          : bgColor,
        boxShadow: is3D
          ? `0 4px 12px ${bgColor}40, inset 0 1px 0 rgba(255,255,255,0.25)`
          : 'none',
        border: `0.5px solid ${primary}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 11C6 8.79 7.79 7 10 7H14C16.21 7 18 8.79 18 11V13C18 15.21 16.21 17 14 17H10C7.79 17 6 15.21 6 13V11Z"
          fill="rgba(255,255,255,0.95)"
        />
        <rect x="8.5" y="10.5" width="3" height="1" rx="0.5" fill={bgColor} />
        <rect x="9.5" y="9.5" width="1" height="3" rx="0.5" fill={bgColor} />
        <circle cx="14" cy="10" r="0.8" fill={accent} />
        <circle cx="15.5" cy="11" r="0.8" fill={direction === 'minimal-monochrome' ? '#666' : '#7c3aed'} />
        <circle cx="14" cy="12" r="0.8" fill="#22c55e" />
        <circle cx="12.5" cy="11" r="0.8" fill="#f59e0b" />
      </svg>
    </div>
  );
}

// ============================================================================
// EMBED ICON - Video play button
// ============================================================================
export function EmbedIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, accent, is3D, direction } = useIconColors(dirOverride);

  const bgColor = direction === 'minimal-monochrome' ? '#333333' : '#dc2626';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: is3D
          ? `linear-gradient(145deg, ${bgColor}ee 0%, ${bgColor} 50%, ${bgColor}bb 100%)`
          : bgColor,
        boxShadow: is3D
          ? `0 4px 12px ${bgColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`
          : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M8 5V19L19 12L8 5Z" fill="white" />
      </svg>
    </div>
  );
}

// ============================================================================
// DOWNLOAD ICON - File with arrow
// ============================================================================
export function DownloadIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, secondary, accent, surface, is3D, direction } = useIconColors(dirOverride);

  const paperColor = direction === 'minimal-monochrome' ? '#f5f5f5' : surface;
  const arrowColor = direction === 'minimal-monochrome' ? '#333333' : accent;

  const gradientId = `dl-grad-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={get3DStyles(is3D, paperColor)}>
      <defs>
        {is3D && (
          <linearGradient id={gradientId} x1="12" y1="4" x2="40" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor={paperColor} />
            <stop offset="1" stopColor={direction === 'minimal-monochrome' ? '#e8e8e8' : `${secondary}15`} />
          </linearGradient>
        )}
      </defs>

      {/* Shadow */}
      {is3D && (
        <path
          d="M14 8C14 5.79 15.79 4 18 4H30L40 14V44C40 46.21 38.21 48 36 48H18C15.79 48 14 46.21 14 44V8Z"
          fill="rgba(0,0,0,0.08)"
          transform="translate(1, 1)"
        />
      )}

      {/* Paper body */}
      <path
        d="M14 8C14 5.79 15.79 4 18 4H30L40 14V44C40 46.21 38.21 48 36 48H18C15.79 48 14 46.21 14 44V8Z"
        fill={is3D ? `url(#${gradientId})` : paperColor}
        stroke={`${primary}15`}
        strokeWidth="1"
      />

      {/* Folded corner */}
      <path d="M30 4V12C30 13.1 30.9 14 32 14H40L30 4Z" fill={`${secondary}30`} />

      {/* Download arrow */}
      <path d="M27 22V34M27 34L22 29M27 34L32 29" stroke={arrowColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================================
// BOARD ICON - Kanban board
// ============================================================================
export function BoardIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, is3D, direction } = useIconColors(dirOverride);

  const bgColor = direction === 'minimal-monochrome' ? '#333333' : '#3b82f6';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: is3D
          ? `linear-gradient(145deg, ${bgColor}ee 0%, ${bgColor} 50%, ${bgColor}cc 100%)`
          : bgColor,
        boxShadow: is3D
          ? `0 4px 12px ${bgColor}40, inset 0 1px 0 rgba(255,255,255,0.25)`
          : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        gap: 4,
      }}
    >
      {[0, 1, 2].map((col) => (
        <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.9)' }} />
          {[8, 10, 6].slice(0, 3 - col).map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 2, background: `rgba(255,255,255,${0.6 - i * 0.15})` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SHEET ICON - Spreadsheet
// ============================================================================
export function SheetIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, is3D, direction } = useIconColors(dirOverride);

  const bgColor = direction === 'minimal-monochrome' ? '#333333' : '#22c55e';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: is3D
          ? `linear-gradient(145deg, ${bgColor}ee 0%, ${bgColor} 50%, ${bgColor}cc 100%)`
          : bgColor,
        boxShadow: is3D
          ? `0 4px 12px ${bgColor}40, inset 0 1px 0 rgba(255,255,255,0.25)`
          : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="1" width="22" height="5" rx="1" fill="rgba(255,255,255,0.85)" />
        <line x1="8" y1="1" x2="8" y2="23" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <line x1="15" y1="1" x2="15" y2="23" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <rect x="1" y="8" width="6" height="4" rx="0.5" fill="rgba(255,255,255,0.5)" />
        <rect x="9" y="8" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.4)" />
        <rect x="16" y="8" width="7" height="4" rx="0.5" fill="rgba(255,255,255,0.35)" />
        <rect x="1" y="14" width="6" height="4" rx="0.5" fill="rgba(255,255,255,0.4)" />
        <rect x="9" y="14" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.5)" />
        <rect x="16" y="14" width="7" height="4" rx="0.5" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

// ============================================================================
// SLIDES ICON - Presentation slides
// ============================================================================
export function SlidesIcon({ size = 52, direction: dirOverride }: IconProps) {
  const { primary, accent, is3D, direction } = useIconColors(dirOverride);

  const bgColor = direction === 'minimal-monochrome' ? '#333333' : '#f97316';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: is3D
          ? `linear-gradient(145deg, ${bgColor}ee 0%, ${bgColor} 50%, ${bgColor}cc 100%)`
          : bgColor,
        boxShadow: is3D
          ? `0 4px 12px ${bgColor}40, inset 0 1px 0 rgba(255,255,255,0.25)`
          : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="14" rx="2" fill="rgba(255,255,255,0.9)" />
        <rect x="4" y="6" width="10" height="2" rx="1" fill={`${bgColor}99`} />
        <rect x="4" y="10" width="8" height="1.5" rx="0.5" fill={`${bgColor}55`} />
        <rect x="4" y="13" width="6" height="1.5" rx="0.5" fill={`${bgColor}44`} />
        <rect x="14" y="9" width="6" height="6" rx="1" fill={`${bgColor}66`} />
        <circle cx="10" cy="20" r="1" fill="rgba(255,255,255,0.9)" />
        <circle cx="14" cy="20" r="1" fill="rgba(255,255,255,0.4)" />
      </svg>

      {/* Play badge */}
      <div
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 18,
          height: 18,
          borderRadius: 6,
          background: direction === 'minimal-monochrome' ? '#555' : '#7c3aed',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path d="M8 5V19L19 12L8 5Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// ICON SELECTOR - Returns the right icon for a file type
// ============================================================================
export function getPremiumIcon(
  type: string,
  props?: IconProps & { imageUrl?: string; faviconUrl?: string | null }
) {
  const { imageUrl, faviconUrl, ...iconProps } = props || {};

  switch (type) {
    case 'note':
      return <NoteIcon {...iconProps} />;
    case 'folder':
      return <FolderIcon {...iconProps} />;
    case 'case-study':
      return <CaseStudyIcon {...iconProps} />;
    case 'cv':
      return <CVIcon {...iconProps} />;
    case 'image':
      return <ImageIcon {...iconProps} imageUrl={imageUrl} />;
    case 'link':
      return <LinkIcon {...iconProps} faviconUrl={faviconUrl} />;
    case 'game':
      return <GameIcon {...iconProps} />;
    case 'embed':
      return <EmbedIcon {...iconProps} />;
    case 'download':
      return <DownloadIcon {...iconProps} />;
    case 'board':
      return <BoardIcon {...iconProps} />;
    case 'sheet':
      return <SheetIcon {...iconProps} />;
    case 'slides':
      return <SlidesIcon {...iconProps} />;
    default:
      return <NoteIcon {...iconProps} />;
  }
}
