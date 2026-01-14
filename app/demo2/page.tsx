'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ThemeProvider } from '@/contexts/ThemeContext';

// ============================================
// Types
// ============================================
interface WindowState {
  id: string;
  title: string;
  icon: IconType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  content: React.ReactNode;
}

type IconType = 'document' | 'folder' | 'spreadsheet' | 'video' | 'email' | 'trash' | 'calculator' | 'image' | 'code';

interface DesktopIconData {
  id: string;
  label: string;
  extension?: string;
  icon: IconType;
  windowTitle: string;
  windowContent: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

// ============================================
// Desktop Icon Data
// ============================================
const LEFT_ICONS: DesktopIconData[] = [
  { id: 'home', label: 'home', extension: '.mdx', icon: 'document', windowTitle: 'home.mdx', windowContent: 'home', defaultWidth: 900, defaultHeight: 600 },
  { id: 'products', label: 'Product OS', icon: 'folder', windowTitle: 'Product OS', windowContent: 'products', defaultWidth: 700, defaultHeight: 500 },
  { id: 'pricing', label: 'Pricing', icon: 'calculator', windowTitle: 'pricing.psheet', windowContent: 'pricing', defaultWidth: 600, defaultHeight: 450 },
  { id: 'customers', label: 'customers', extension: '.mdx', icon: 'document', windowTitle: 'customers.mdx', windowContent: 'customers', defaultWidth: 800, defaultHeight: 550 },
  { id: 'demo', label: 'demo', extension: '.mov', icon: 'video', windowTitle: 'demo.mov', windowContent: 'demo', defaultWidth: 640, defaultHeight: 400 },
  { id: 'docs', label: 'Docs', icon: 'folder', windowTitle: 'Documentation', windowContent: 'docs', defaultWidth: 700, defaultHeight: 500 },
  { id: 'contact', label: 'Talk to a human', icon: 'email', windowTitle: 'Contact Us', windowContent: 'contact', defaultWidth: 500, defaultHeight: 400 },
];

const RIGHT_ICONS: DesktopIconData[] = [
  { id: 'why', label: 'Why MeOS?', icon: 'document', windowTitle: 'why-meos.mdx', windowContent: 'why', defaultWidth: 600, defaultHeight: 450 },
  { id: 'changelog', label: 'Changelog', icon: 'code', windowTitle: 'CHANGELOG.md', windowContent: 'changelog', defaultWidth: 550, defaultHeight: 500 },
  { id: 'gallery', label: 'Gallery', icon: 'image', windowTitle: 'Gallery', windowContent: 'gallery', defaultWidth: 700, defaultHeight: 500 },
  { id: 'store', label: 'Store', icon: 'folder', windowTitle: 'MeOS Store', windowContent: 'store', defaultWidth: 600, defaultHeight: 450 },
  { id: 'careers', label: 'Work here', icon: 'folder', windowTitle: 'Careers', windowContent: 'careers', defaultWidth: 550, defaultHeight: 400 },
  { id: 'trash', label: 'Trash', icon: 'trash', windowTitle: 'Trash', windowContent: 'trash', defaultWidth: 400, defaultHeight: 300 },
];

// ============================================
// File Icons SVG Components
// ============================================
function FileIconSVG({ type, size = 48 }: { type: IconType; size?: number }) {
  const scale = size / 48;

  switch (type) {
    case 'document':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 6h18l10 10v26a2 2 0 01-2 2H12a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#FDFDF8" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M30 6v10h10" stroke="#BFC1B7" strokeWidth="1.5" fill="#E5E7E0" />
          <path d="M16 22h16M16 28h16M16 34h10" stroke="#9EA096" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'folder':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M6 14a2 2 0 012-2h12l4 4h16a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V14z" fill="#E5E7E0" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M6 18h36v20a2 2 0 01-2 2H8a2 2 0 01-2-2V18z" fill="#EEEFE9" />
        </svg>
      );
    case 'spreadsheet':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="8" y="6" width="32" height="36" rx="2" fill="#FDFDF8" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M8 14h32M20 14v28M32 14v28" stroke="#BFC1B7" strokeWidth="1" />
          <path d="M8 22h32M8 30h32" stroke="#E5E7E0" strokeWidth="1" />
          <rect x="10" y="8" width="6" height="4" fill="#6AA84F" />
        </svg>
      );
    case 'video':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="6" y="10" width="36" height="28" rx="2" fill="#23251D" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M20 17l12 7-12 7V17z" fill="#EB9D2A" />
          <rect x="6" y="10" width="36" height="4" fill="#3D3D3D" />
          <circle cx="10" cy="12" r="1.5" fill="#F54E00" />
          <circle cx="15" cy="12" r="1.5" fill="#EB9D2A" />
          <circle cx="20" cy="12" r="1.5" fill="#6AA84F" />
        </svg>
      );
    case 'email':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="6" y="12" width="36" height="24" rx="2" fill="#FDFDF8" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M6 14l18 10 18-10" stroke="#EB9D2A" strokeWidth="2" fill="none" />
          <path d="M6 36l12-10M42 36l-12-10" stroke="#BFC1B7" strokeWidth="1.5" />
        </svg>
      );
    case 'trash':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M14 16h20v24a2 2 0 01-2 2H16a2 2 0 01-2-2V16z" fill="#E5E7E0" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M10 16h28" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M18 12h12v4H18v-4z" fill="#FDFDF8" stroke="#BFC1B7" strokeWidth="1.5" />
          <path d="M20 22v12M24 22v12M28 22v12" stroke="#9EA096" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'calculator':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="6" width="28" height="36" rx="2" fill="#FDFDF8" stroke="#BFC1B7" strokeWidth="1.5" />
          <rect x="14" y="10" width="20" height="8" fill="#23251D" rx="1" />
          <text x="24" y="17" fill="#6AA84F" fontSize="8" fontFamily="monospace" textAnchor="middle">$0.00</text>
          <rect x="14" y="22" width="4" height="4" rx="1" fill="#E5E7E0" stroke="#BFC1B7" />
          <rect x="22" y="22" width="4" height="4" rx="1" fill="#E5E7E0" stroke="#BFC1B7" />
          <rect x="30" y="22" width="4" height="4" rx="1" fill="#EB9D2A" />
          <rect x="14" y="30" width="4" height="4" rx="1" fill="#E5E7E0" stroke="#BFC1B7" />
          <rect x="22" y="30" width="4" height="4" rx="1" fill="#E5E7E0" stroke="#BFC1B7" />
          <rect x="30" y="30" width="4" height="4" rx="1" fill="#EB9D2A" />
          <rect x="14" y="38" width="12" height="4" rx="1" fill="#E5E7E0" stroke="#BFC1B7" />
          <rect x="30" y="38" width="4" height="4" rx="1" fill="#6AA84F" />
        </svg>
      );
    case 'image':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="6" y="10" width="36" height="28" rx="2" fill="#FDFDF8" stroke="#BFC1B7" strokeWidth="1.5" />
          <circle cx="16" cy="20" r="4" fill="#EB9D2A" />
          <path d="M6 32l10-8 6 4 14-10v20H6v-6z" fill="#6AA84F" fillOpacity="0.4" />
          <path d="M22 28l14-10v20H6v-6l10-8 6 4z" fill="#2F80FA" fillOpacity="0.3" />
        </svg>
      );
    case 'code':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="8" y="6" width="32" height="36" rx="2" fill="#23251D" stroke="#BFC1B7" strokeWidth="1.5" />
          <text x="12" y="18" fill="#6AA84F" fontSize="7" fontFamily="monospace">## v2.0</text>
          <text x="12" y="26" fill="#9EA096" fontSize="6" fontFamily="monospace">- New feature</text>
          <text x="12" y="33" fill="#9EA096" fontSize="6" fontFamily="monospace">- Bug fixes</text>
          <text x="12" y="40" fill="#EB9D2A" fontSize="6" fontFamily="monospace">+ Breaking</text>
        </svg>
      );
    default:
      return null;
  }
}

// ============================================
// Desktop Icon Component
// ============================================
interface DesktopIconProps {
  data: DesktopIconData;
  onDoubleClick: () => void;
  isSelected: boolean;
  onSelect: () => void;
  position: 'left' | 'right';
}

function DesktopIcon({ data, onDoubleClick, isSelected, onSelect, position }: DesktopIconProps) {
  const displayLabel = data.extension ? `${data.label}${data.extension}` : data.label;

  return (
    <motion.button
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className="flex flex-col items-center p-2 rounded-lg cursor-default select-none relative"
      style={{
        width: '84px',
        background: isSelected ? 'rgba(47, 128, 250, 0.15)' : 'transparent',
        outline: isSelected ? '2px solid rgba(47, 128, 250, 0.4)' : 'none',
      }}
      whileHover={{
        background: isSelected ? 'rgba(47, 128, 250, 0.15)' : 'rgba(229, 231, 224, 0.6)',
        scale: 1.08,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}
      whileTap={{ scale: 0.92 }}
    >
      <div className="mb-1">
        <FileIconSVG type={data.icon} size={48} />
      </div>
      <span
        className="text-[11px] leading-tight text-center break-words w-full px-1 font-medium drop-shadow-md"
        style={{
          fontFamily: '"Source Code Pro", monospace',
          color: '#23251D',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)',
        }}
      >
        {displayLabel}
      </span>
    </motion.button>
  );
}

// ============================================
// Window Component
// ============================================
interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragEnd: (x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

function Window({ window: win, onClose, onMinimize, onMaximize, onFocus, onDragEnd, containerRef }: WindowProps) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, winX: 0, winY: 0 });

  if (win.isMinimized) return null;

  const windowStyle = win.isMaximized ? {
    position: 'fixed' as const,
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: 'calc(100vh - 48px)',
    zIndex: win.zIndex,
  } : {
    position: 'absolute' as const,
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.height,
    zIndex: win.zIndex,
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden flex flex-col backdrop-blur-sm"
      style={{
        ...windowStyle,
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: isDragging
          ? '0 0 0 1px rgba(0,0,0,0.08), 0 40px 80px -20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0,0,0,0.05)'
          : '0 0 0 1px rgba(0,0,0,0.06), 0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 30px rgba(0,0,0,0.03)',
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={(_, info) => {
        setIsDragging(true);
        dragStartRef.current = {
          x: info.point.x,
          y: info.point.y,
          winX: win.x,
          winY: win.y
        };
      }}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const deltaX = info.point.x - dragStartRef.current.x;
        const deltaY = info.point.y - dragStartRef.current.y;
        const newX = Math.max(0, dragStartRef.current.winX + deltaX);
        const newY = Math.max(48, dragStartRef.current.winY + deltaY);
        onDragEnd(newX, newY);
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="h-11 flex items-center justify-between px-4 cursor-default select-none"
        style={{
          background: 'linear-gradient(180deg, #F5F6F3 0%, #E8EAE5 100%)',
          borderBottom: '1px solid #D4D6CF',
        }}
        onPointerDown={(e) => {
          if (!win.isMaximized) {
            dragControls.start(e);
          }
        }}
        onDoubleClick={onMaximize}
      >
        {/* Left - File menu */}
        <div className="flex items-center gap-2 min-w-[80px]">
          <button className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-black/5">
            <FileIconSVG type={win.icon} size={16} />
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M2 3l2 2 2-2" stroke="#73756B" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        {/* Center - Title */}
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-medium" style={{ color: '#23251D', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            {win.title}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 4l2 2 2-2" stroke="#73756B" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Right - Window controls */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
              <rect width="10" height="2" rx="1" fill="#1D1F27" />
            </svg>
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="#1D1F27" strokeWidth="1" />
            </svg>
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1l-8 8" stroke="#1D1F27" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Toolbar */}
      <WindowToolbar />

      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ background: '#FFFFFF' }}>
        {win.content}
      </div>
    </motion.div>
  );
}

// ============================================
// Window Toolbar
// ============================================
function WindowToolbar() {
  return (
    <div
      className="h-11 flex items-center gap-1 px-3"
      style={{
        background: '#FDFDF8',
        borderBottom: '1px solid #E5E7E0',
      }}
    >
      <ToolbarGroup>
        <ToolbarButton icon="undo" />
        <ToolbarButton icon="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <select
        className="h-7 px-2 text-[12px] rounded cursor-pointer"
        style={{
          background: '#FFFFFF',
          border: '1px solid #BFC1B7',
          color: '#4D4F46',
          fontFamily: '"IBM Plex Sans", sans-serif',
        }}
        defaultValue="100"
      >
        <option value="75">75%</option>
        <option value="100">100%</option>
        <option value="125">125%</option>
      </select>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton label="B" bold />
        <ToolbarButton label="I" italic />
        <ToolbarButton label="U" underline />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton icon="align-left" />
        <ToolbarButton icon="align-center" />
        <ToolbarButton icon="align-right" />
      </ToolbarGroup>

      <div className="flex-1" />

      <ToolbarGroup>
        <ToolbarButton icon="search" />
      </ToolbarGroup>

      <motion.button
        className="ml-2 px-4 py-1.5 text-[12px] font-semibold rounded-lg shadow-sm"
        style={{
          background: 'linear-gradient(180deg, #F5A623 0%, #EB9D2A 100%)',
          color: 'white',
          fontFamily: '"IBM Plex Sans", sans-serif',
        }}
        whileHover={{ scale: 1.03, boxShadow: '0 4px 12px rgba(235, 157, 42, 0.4)' }}
        whileTap={{ scale: 0.97 }}
      >
        Get started - free
      </motion.button>
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarSeparator() {
  return <div className="w-px h-6 mx-1.5" style={{ background: '#E5E7E0' }} />;
}

function ToolbarButton({ icon, label, bold, italic, underline }: {
  icon?: string;
  label?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}) {
  return (
    <button
      className="w-7 h-7 rounded flex items-center justify-center text-[12px] border border-transparent hover:border-[#BFC1B7] hover:bg-[#E5E7E0] transition-all"
      style={{ color: '#4D4F46', fontFamily: '"IBM Plex Sans", sans-serif' }}
    >
      {label ? (
        <span style={{
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? 'italic' : 'normal',
          textDecoration: underline ? 'underline' : 'none'
        }}>
          {label}
        </span>
      ) : icon ? (
        <ToolbarIconSVG type={icon} />
      ) : null}
    </button>
  );
}

function ToolbarIconSVG({ type }: { type: string }) {
  switch (type) {
    case 'undo':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4h5a2.5 2.5 0 110 5H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M4 2.5L2.5 4 4 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'redo':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9.5 4h-5a2.5 2.5 0 100 5H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 2.5L9.5 4 8 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'align-left':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 2.5h10M1 5h6M1 7.5h10M1 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'align-center':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 2.5h10M3 5h6M1 7.5h10M3 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'align-right':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 2.5h10M5 5h6M1 7.5h10M5 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'search':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// ============================================
// Window Content Components
// ============================================
function HomeContent() {
  const [visitorCount, setVisitorCount] = useState(8294992);
  const [signupCount, setSignupCount] = useState(2728);

  useEffect(() => {
    const v = setInterval(() => setVisitorCount(p => p + 1), 3000);
    const s = setInterval(() => setSignupCount(p => p + Math.floor(Math.random() * 3)), 5000);
    return () => { clearInterval(v); clearInterval(s); };
  }, []);

  return (
    <div className="p-8" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <div className="grid md:grid-cols-2 gap-12 items-start max-w-4xl mx-auto">
        {/* Software Box */}
        <div className="relative">
          {/* Starburst Badge */}
          <div
            className="absolute -top-3 -right-4 w-20 h-20 flex flex-col items-center justify-center text-center text-[8px] font-bold text-white z-10"
            style={{
              background: '#EB9D2A',
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              transform: 'rotate(12deg)',
            }}
          >
            <span>ENDORSED</span>
            <span>BY KIM K*</span>
          </div>

          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              aspectRatio: '4/5',
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="text-7xl mb-4">🦔</div>
              <h2 className="text-3xl font-bold text-white mb-2">MeOS 3000</h2>
              <p className="text-sm text-gray-400 mb-6">Professional Portfolio Builder</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>✓ Multi-platform</span>
                <span>✓ Cloud Ready</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center mt-4 italic" style={{ color: '#73756B' }}>
            *MeOS is a web product and cannot be installed by CD.
            <br />
            We <a href="#" style={{ color: '#2F80FA' }}>did</a> once send someone a floppy disk but it was a Rickroll.
          </p>
        </div>

        {/* Pricing */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: '#73756B' }}>Digital download*</p>
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#23251D' }}>
            Starts at: <span style={{ color: '#EB9D2A' }}>$0</span>
            <span className="ml-3 text-sm px-2 py-1 rounded" style={{ background: '#EB9D2A', color: 'white' }}>
              FREE
            </span>
          </h2>
          <p className="text-sm mb-8" style={{ color: '#F54E00' }}>&gt;1 left at this price!!</p>

          <button
            className="w-full py-4 text-lg font-semibold rounded"
            style={{ background: '#EB9D2A', color: 'white' }}
          >
            Get started
          </button>

          {/* Urgency Banner */}
          <div className="flex items-start gap-3 p-4 rounded mt-6" style={{ background: '#FDFDF8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#73756B', flexShrink: 0 }}>
              <path d="M2 12h4l3-9 6 18 3-9h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm" style={{ color: '#4D4F46', lineHeight: 1.6 }}>
              <strong style={{ color: '#23251D' }}>Hurry:</strong>{' '}
              <span style={{ color: '#EB9D2A' }}>{signupCount.toLocaleString()}</span> companies signed up{' '}
              <strong style={{ color: '#EB9D2A' }}>today</strong>.
              Act now and get $0 off your first order.
            </p>
          </div>
        </div>
      </div>

      {/* Visitor Counter */}
      <div className="text-center mt-12 pt-8" style={{ borderTop: '1px solid #E5E7E0' }}>
        <p className="text-sm mb-3" style={{ color: '#4D4F46' }}>Thanks for being visitor number</p>
        <div className="inline-flex gap-0.5">
          {visitorCount.toString().padStart(7, '0').split('').map((digit, i) => (
            <span
              key={i}
              className="w-8 h-10 flex items-center justify-center text-xl font-bold rounded-sm"
              style={{
                background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                color: '#00FF00',
                fontFamily: '"Source Code Pro", monospace',
                border: '1px solid #333',
              }}
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const products = [
    { label: 'Portfolio Builder', icon: '🎨', color: '#EB9D2A' },
    { label: 'Analytics Dashboard', icon: '📊', color: '#2F80FA' },
    { label: 'Custom Domains', icon: '🌐', color: '#6AA84F' },
    { label: 'Theme Studio', icon: '🎭', color: '#B62AD9' },
    { label: 'SEO Tools', icon: '🔍', color: '#30ABC6' },
    { label: 'Contact Forms', icon: '📬', color: '#F54E00' },
    { label: 'Guestbook', icon: '📖', color: '#EB9D2A' },
    { label: 'Live Status', icon: '🟢', color: '#6AA84F' },
    { label: 'QR Codes', icon: '📱', color: '#2F80FA' },
  ];

  return (
    <div className="p-6" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#23251D' }}>Product OS</h2>
      <p className="text-sm mb-6" style={{ color: '#4D4F46' }}>Everything you need to build a stunning portfolio</p>

      <div className="grid grid-cols-3 gap-3">
        {products.map((p, i) => (
          <button
            key={i}
            className="flex flex-col items-center p-4 rounded hover:bg-black/5 transition-colors"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-2"
              style={{ background: `${p.color}15`, border: `1px solid ${p.color}30` }}
            >
              {p.icon}
            </div>
            <span className="text-xs text-center" style={{ color: '#4D4F46' }}>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PricingContent() {
  return (
    <div className="p-6" style={{ fontFamily: '"Source Code Pro", monospace' }}>
      <div className="mb-4">
        <span className="font-bold" style={{ color: '#23251D' }}>pricing</span>
        <span style={{ color: '#73756B' }}>.psheet</span>
      </div>

      <div className="border rounded" style={{ borderColor: '#BFC1B7' }}>
        <div className="flex" style={{ background: '#E5E7E0', borderBottom: '1px solid #BFC1B7' }}>
          <div className="flex-1 p-2 text-xs font-medium" style={{ color: '#73756B' }}>Plan</div>
          <div className="w-24 p-2 text-xs font-medium text-center" style={{ color: '#73756B', borderLeft: '1px solid #BFC1B7' }}>Price</div>
          <div className="w-32 p-2 text-xs font-medium text-center" style={{ color: '#73756B', borderLeft: '1px solid #BFC1B7' }}>Features</div>
        </div>
        {[
          { plan: 'Free', price: '$0', features: '3 pages' },
          { plan: 'Pro', price: '$9/mo', features: 'Unlimited' },
          { plan: 'Team', price: '$29/mo', features: 'Everything' },
        ].map((row, i) => (
          <div key={i} className="flex" style={{ borderBottom: i < 2 ? '1px solid #E5E7E0' : 'none' }}>
            <div className="flex-1 p-3 text-sm" style={{ color: '#23251D' }}>{row.plan}</div>
            <div className="w-24 p-3 text-sm text-center" style={{ color: '#EB9D2A', borderLeft: '1px solid #E5E7E0' }}>{row.price}</div>
            <div className="w-32 p-3 text-sm text-center" style={{ color: '#4D4F46', borderLeft: '1px solid #E5E7E0' }}>{row.features}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersContent() {
  const posts = [
    { date: 'Jan 13, 2026', title: 'How to build a memorable portfolio', tags: ['Design', 'Career'], author: 'Alex Chen' },
    { date: 'Jan 10, 2026', title: 'The art of personal branding', tags: ['Branding'], author: 'Sarah K.' },
    { date: 'Jan 8, 2026', title: 'Why your online presence matters', tags: ['Strategy'], author: 'Mike Dev' },
  ];

  return (
    <div className="p-6" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <div className="mb-4" style={{ fontFamily: '"Source Code Pro", monospace' }}>
        <span className="font-bold text-lg" style={{ color: '#23251D' }}>posts</span>
        <span style={{ color: '#73756B' }}>.psheet</span>
      </div>

      <div className="border rounded overflow-hidden" style={{ borderColor: '#BFC1B7' }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#FDFDF8', borderBottom: '1px solid #E5E7E0' }}>
          <span className="text-xs" style={{ color: '#73756B' }}>where</span>
          <strong className="text-xs" style={{ color: '#23251D' }}>category</strong>
          <span className="text-xs" style={{ color: '#73756B' }}>eq</span>
          <select className="h-6 px-2 text-xs rounded" style={{ background: '#fff', border: '1px solid #BFC1B7' }}>
            <option>Blog</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#E5E7E0' }}>
              <th className="p-2 text-left text-xs font-medium" style={{ color: '#73756B', width: '100px' }}>Date</th>
              <th className="p-2 text-left text-xs font-medium" style={{ color: '#73756B' }}>Title</th>
              <th className="p-2 text-left text-xs font-medium" style={{ color: '#73756B', width: '100px' }}>Tags</th>
              <th className="p-2 text-left text-xs font-medium" style={{ color: '#73756B', width: '100px' }}>Author</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E5E7E0' }}>
                <td className="p-2" style={{ color: '#4D4F46' }}>{post.date}</td>
                <td className="p-2 font-medium" style={{ color: '#23251D' }}>{post.title}</td>
                <td className="p-2">
                  {post.tags.map(t => (
                    <span key={t} className="mr-1 text-xs" style={{ color: '#2F80FA' }}>{t}</span>
                  ))}
                </td>
                <td className="p-2" style={{ color: '#4D4F46' }}>{post.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DemoContent() {
  return (
    <div className="h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(235, 157, 42, 0.2)' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M12 8l14 8-14 8V8z" fill="#EB9D2A" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: '#9EA096' }}>Click to play demo video</p>
      </div>
    </div>
  );
}


// Animation variants for content
const contentContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.4
    }
  }
};

const contentItem = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 }
  }
};

function DocsContent() {
  return (
    <motion.div
      className="p-8 max-w-2xl mx-auto"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      <motion.h2 variants={contentItem} className="text-3xl font-bold mb-6" style={{ color: '#23251D' }}>Documentation</motion.h2>
      <div className="space-y-4">
        {[
          { title: 'Getting Started', desc: 'Learn how to set up your portfolio in minutes.' },
          { title: 'Components', desc: 'Explore our library of pre-built components.' },
          { title: 'API Reference', desc: 'Detailed documentation for the MeOS API.' }
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={contentItem}
            className="p-5 rounded-xl border border-[#E5E7E0] bg-[#FDFDF8] hover:border-[#BFC1B7] hover:shadow-md cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg group-hover:text-[#2F80FA] transition-colors" style={{ color: '#23251D' }}>{item.title}</h3>
              <span className="text-[#BFC1B7] group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#4D4F46' }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ContactContent() {
  return (
    <motion.div
      className="p-8 flex flex-col items-center justify-center h-full text-center"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={contentItem} className="w-20 h-20 rounded-full bg-[#E5E7E0] flex items-center justify-center mb-6 text-3xl shadow-sm">
        👋
      </motion.div>
      <motion.h2 variants={contentItem} className="text-3xl font-bold mb-3" style={{ color: '#23251D' }}>Let's Talk</motion.h2>
      <motion.p variants={contentItem} className="text-[15px] mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: '#4D4F46' }}>
        We're here to help you build the perfect portfolio. Reach out for support or enterprise inquiries.
      </motion.p>
      <motion.button
        variants={contentItem}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 rounded-full bg-[#23251D] text-white text-sm font-semibold hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
      >
        Send us an email
      </motion.button>
    </motion.div>
  );
}

function WhyContent() {
  return (
    <motion.div
      className="p-8"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      <motion.h2 variants={contentItem} className="text-3xl font-bold mb-8" style={{ color: '#23251D' }}>Why MeOS?</motion.h2>
      <div className="grid gap-8">
        {[
          { title: 'Stand Out', desc: 'In a sea of identical static sites, give your visitors a memorable experience.', icon: '✨' },
          { title: 'Show, Don\'t Tell', desc: 'Demonstrate your technical capability by presenting your work in a fully functional OS.', icon: '🛠️' },
          { title: 'Joy of Computing', desc: 'Bring back the fun of personal computing with a retro-inspired interface.', icon: '💾' }
        ].map((item, i) => (
          <motion.div variants={contentItem} key={i} className="flex gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-[#F5F5F3] flex items-center justify-center text-xl border border-[#E5E7E0]">{item.icon}</div>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: '#23251D' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4D4F46' }}>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ChangelogContent() {
  return (
    <motion.div
      className="p-6 h-full overflow-auto"
      style={{ fontFamily: '"Source Code Pro", monospace' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      <motion.h2 variants={contentItem} className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#23251D' }}>
        <span>CHANGELOG.md</span>
        <span className="text-xs px-2 py-0.5 rounded bg-[#E5E7E0] text-[#4D4F46] font-normal">v2.1.0</span>
      </motion.h2>

      <div className="relative border-l-2 border-[#E5E7E0] pl-6 space-y-8 ml-2">
        <motion.div variants={contentItem} className="relative">
          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#EB9D2A] border-2 border-[#fff]" />
          <div className="text-sm font-bold text-[#EB9D2A] mb-2">v2.1.0 (Current)</div>
          <ul className="text-sm space-y-2" style={{ color: '#4D4F46' }}>
            <li>+ Added spring physics to window interactions</li>
            <li>+ Implemented dark/light mode toggle system</li>
            <li>+ Improved mobile responsiveness</li>
            <li>* Fixed layout shift on window resize</li>
          </ul>
        </motion.div>

        <motion.div variants={contentItem} className="relative">
          <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#BFC1B7] border-2 border-[#fff]" />
          <div className="text-sm font-bold text-[#4D4F46] mb-2">v2.0.0</div>
          <ul className="text-sm space-y-2" style={{ color: '#4D4F46' }}>
            <li>+ Complete rewrite of the window manager</li>
            <li>+ Added support for multiple workspaces</li>
            <li>+ New file system architecture</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

function GalleryContent() {
  return (
    <motion.div
      className="p-6 grid grid-cols-2 gap-4"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      {[1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          variants={contentItem}
          className="aspect-video bg-[#F5F5F3] rounded-lg border border-[#E5E7E0] flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-30 text-4xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">
            {['🏔️', '🌊', '🏜️', '🌲'][i - 1]}
          </div>
          <span className="relative z-10 text-xs font-medium bg-white/80 backdrop-blur px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-[#23251D]">View Image {i}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function StoreContent() {
  return (
    <motion.div
      className="p-6 h-full flex flex-col"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={contentItem} className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#23251D' }}>App Store</h2>
        <span className="text-xs bg-[#E5E7E0] px-2 py-1 rounded text-[#4D4F46] font-medium">2 Updates Available</span>
      </motion.div>

      <div className="space-y-4 overflow-auto pr-2">
        {[
          { name: 'Terminal', cat: 'Developer Tools', icon: 'Cmd' },
          { name: 'Notes', cat: 'Productivity', icon: 'N' },
          { name: 'Spotify', cat: 'Music & Audio', icon: 'S' },
          { name: 'Browser', cat: 'Internet', icon: 'W' }
        ].map((app, i) => (
          <motion.div
            key={i}
            variants={contentItem}
            className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7E0] bg-[#FDFDF8] hover:border-[#BFC1B7] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E5E7E0] to-[#D1D3CC] flex items-center justify-center font-bold text-[#4D4F46] shadow-inner">
                {app.icon}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#23251D' }}>{app.name}</div>
                <div className="text-xs text-[#73756B]">{app.cat}</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full bg-[#E5E7E0] text-xs font-bold text-[#2052a3] hover:bg-[#2052a3] hover:text-white transition-colors"
            >
              GET
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CareersContent() {
  return (
    <motion.div
      className="p-8 text-center h-full flex flex-col items-center justify-center"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      variants={contentContainer}
      initial="hidden"
      animate="show"
    >
      <motion.h2 variants={contentItem} className="text-2xl font-bold mb-2" style={{ color: '#23251D' }}>Join the team</motion.h2>
      <motion.p variants={contentItem} className="text-sm text-[#4D4F46] mb-8 max-w-sm mx-auto">
        We're building the future of personal websites. Help us make the web fun again.
      </motion.p>

      <div className="text-left space-y-3 w-full max-w-sm">
        {[
          { role: 'Senior Frontend Engineer', type: 'Remote • React, WebGL' },
          { role: 'Product Designer', type: 'Remote • UI/UX, Motion' }
        ].map((job, i) => (
          <motion.div
            key={i}
            variants={contentItem}
            whileHover={{ y: -2, borderColor: '#BFC1B7' }}
            className="p-4 border border-[#E5E7E0] rounded-lg cursor-pointer transition-all bg-[#FDFDF8] hover:shadow-md group"
          >
            <div className="font-semibold text-[#23251D] group-hover:text-[#2F80FA] transition-colors">{job.role}</div>
            <div className="text-xs text-[#73756B] mt-1">{job.type}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function GenericContent({ title }: { title: string }) {
  return (
    <motion.div
      className="p-8 flex flex-col items-center justify-center h-full"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="text-6xl mb-4">📄</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#23251D' }}>{title}</h2>
      <p className="text-sm" style={{ color: '#4D4F46' }}>Double-click desktop icons to open more windows</p>
    </motion.div>
  );
}

function TrashContent() {
  return (
    <motion.div
      className="p-8 flex flex-col items-center justify-center h-full"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="text-6xl mb-4">🗑️</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#23251D' }}>Trash is empty</h2>
      <p className="text-sm" style={{ color: '#73756B' }}>Nothing to see here...</p>
    </motion.div>
  );
}
// ============================================
// Top Navigation Bar
// ============================================
function TopNav({ minimizedWindows, onRestoreWindow }: {
  minimizedWindows: WindowState[];
  onRestoreWindow: (id: string) => void;
}) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-[1000]"
      style={{
        background: '#1D1F27',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-6">
        <a href="#" className="text-xl">🦔</a>
        <div className="hidden md:flex items-center gap-1">
          {['Product OS', 'Pricing', 'Docs', 'Community', 'Company'].map((item) => (
            <button
              key={item}
              className="px-2.5 py-1 text-[13px] font-medium rounded hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.85)', fontFamily: '"IBM Plex Sans", sans-serif' }}
            >
              {item}
            </button>
          ))}
          <button className="px-2.5 py-1 text-[13px] font-medium rounded hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
            More
          </button>
        </div>

        {/* Minimized windows */}
        {minimizedWindows.length > 0 && (
          <>
            <div className="w-px h-5 mx-2" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="flex items-center gap-1">
              {minimizedWindows.map(win => (
                <button
                  key={win.id}
                  onClick={() => onRestoreWindow(win.id)}
                  className="px-2 py-1 text-[11px] rounded hover:bg-black/5 flex items-center gap-1.5"
                  style={{ background: 'rgba(0,0,0,0.05)', fontFamily: '"Source Code Pro", monospace', color: '#4D4F46' }}
                >
                  <FileIconSVG type={win.icon} size={14} />
                  {win.title.length > 12 ? win.title.slice(0, 12) + '...' : win.title}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          className="px-4 py-1.5 text-[13px] font-semibold rounded-md"
          style={{
            background: '#F5A623',
            color: 'white',
            fontFamily: '"IBM Plex Sans", sans-serif',
          }}
          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(245, 166, 35, 0.35)' }}
          whileTap={{ scale: 0.98 }}
        >
          Get started – free
        </motion.button>

        <div className="hidden md:flex items-center gap-2 text-white/60">
          <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M7 5h2v4H7zM7 10h2v2H7z" /></svg>
          </button>
          <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6 6 0 110-12 6 6 0 010 12z" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// Main Demo2 Page
// ============================================
function Demo2PageInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);

  const getWindowContent = useCallback((contentId: string): React.ReactNode => {
    switch (contentId) {
      case 'home': return <HomeContent />;
      case 'products': return <ProductsContent />;
      case 'pricing': return <PricingContent />;
      case 'customers': return <CustomersContent />;
      case 'demo': return <DemoContent />;
      case 'trash': return <TrashContent />;
      case 'docs': return <DocsContent />;
      case 'contact': return <ContactContent />;
      case 'why': return <WhyContent />;
      case 'changelog': return <ChangelogContent />;
      case 'gallery': return <GalleryContent />;
      case 'store': return <StoreContent />;
      case 'careers': return <CareersContent />;
      default: return <GenericContent title={contentId} />;
    }
  }, []);

  const openWindow = useCallback((iconData: DesktopIconData) => {
    // Check if window already exists
    const existing = windows.find(w => w.id === iconData.id);
    if (existing) {
      // Focus existing window
      setWindows(prev => prev.map(w =>
        w.id === iconData.id
          ? { ...w, isMinimized: false, zIndex: nextZIndex }
          : w
      ));
      setNextZIndex(prev => prev + 1);
      return;
    }

    // Create new window with offset from center
    const offsetX = (windows.length % 5) * 30;
    const offsetY = (windows.length % 5) * 30;

    const newWindow: WindowState = {
      id: iconData.id,
      title: iconData.windowTitle,
      icon: iconData.icon,
      x: 150 + offsetX,
      y: 80 + offsetY,
      width: iconData.defaultWidth || 600,
      height: iconData.defaultHeight || 450,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false,
      content: getWindowContent(iconData.windowContent),
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  }, [windows, nextZIndex, getWindowContent]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, x, y } : w
    ));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  // Clear selection when clicking desktop
  const handleDesktopClick = useCallback(() => {
    setSelectedIcon(null);
  }, []);

  const minimizedWindows = windows.filter(w => w.isMinimized);

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: '#E8DCCC',
        backgroundImage: `
          radial-gradient(circle at 30% 80%, rgba(139, 92, 50, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(180, 140, 100, 0.06) 0%, transparent 40%),
          linear-gradient(180deg, rgba(232, 220, 204, 0) 0%, rgba(210, 195, 175, 0.3) 100%)
        `,
        paddingTop: '48px'
      }}
      onClick={handleDesktopClick}
    >
      <TopNav minimizedWindows={minimizedWindows} onRestoreWindow={restoreWindow} />

      {/* Desktop Layout */}
      <div className="flex min-h-[calc(100vh-48px)]">
        {/* Left Icons */}
        <aside
          className="hidden md:flex flex-col gap-1 p-3 w-[100px]"
          onClick={(e) => e.stopPropagation()}
        >
          {LEFT_ICONS.map((icon) => (
            <DesktopIcon
              key={icon.id}
              data={icon}
              position="left"
              isSelected={selectedIcon === icon.id}
              onSelect={() => setSelectedIcon(icon.id)}
              onDoubleClick={() => openWindow(icon)}
            />
          ))}
        </aside>

        {/* Main Desktop Area */}
        <main className="flex-1 relative">
          {/* Windows */}
          <AnimatePresence>
            {windows.map(win => (
              <Window
                key={win.id}
                window={win}
                containerRef={containerRef}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onMaximize={() => maximizeWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
                onDragEnd={(x, y) => updateWindowPosition(win.id, x, y)}
              />
            ))}
          </AnimatePresence>

          {/* Empty state hint */}
          {windows.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center" style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}>
                <div className="text-6xl mb-4 opacity-30">🖱️</div>
                <p className="text-sm" style={{ color: '#73756B' }}>
                  Double-click any icon to open a window
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Right Icons */}
        <aside
          className="hidden md:flex flex-col gap-1 p-3 w-[100px] items-end"
          onClick={(e) => e.stopPropagation()}
        >
          {RIGHT_ICONS.map((icon) => (
            <DesktopIcon
              key={icon.id}
              data={icon}
              position="right"
              isSelected={selectedIcon === icon.id}
              onSelect={() => setSelectedIcon(icon.id)}
              onDoubleClick={() => openWindow(icon)}
            />
          ))}
        </aside>
      </div>

      {/* Decorative hedgehog */}
      <div
        className="fixed bottom-8 right-8 text-8xl pointer-events-none opacity-10 hidden xl:block select-none"
        style={{ zIndex: 0 }}
      >
        🦔
      </div>

      <Dock onAppClick={(id) => {
        const map: Record<string, string> = {
          finder: 'home',
          terminal: 'changelog',
          mail: 'contact',
          photos: 'gallery',
          calculator: 'pricing',
          trash: 'trash'
        };
        const targetId = map[id] || 'home';
        const iconInfo = [...LEFT_ICONS, ...RIGHT_ICONS].find(i => i.id === targetId);
        if (iconInfo) {
          openWindow(iconInfo);
        }
      }} />
    </div>
  );
}

// ============================================
// Dock Component
// ============================================
const DOCK_ITEMS = [
  { id: 'finder', label: 'Finder', icon: 'folder' as const, color: '#2F80FA' },
  { id: 'terminal', label: 'Terminal', icon: 'code' as const, color: '#23251D' },
  { id: 'mail', label: 'Mail', icon: 'email' as const, color: '#F54E00' },
  { id: 'photos', label: 'Photos', icon: 'image' as const, color: '#EB9D2A' },
  { id: 'calculator', label: 'Calculator', icon: 'calculator' as const, color: '#6AA84F' },
  { id: 'trash', label: 'Trash', icon: 'trash' as const, color: '#73756B' },
];

function Dock({ onAppClick }: { onAppClick: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-4 pb-2 pt-2.5 rounded-2xl flex items-end gap-3 glass-dock shadow-2xl border"
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.2)'
      }}
    >
      {DOCK_ITEMS.map((item) => (
        <DockItem key={item.id} item={item} onClick={() => onAppClick(item.id)} />
      ))}
    </div>
  );
}

function DockItem({ item, onClick }: { item: typeof DOCK_ITEMS[0], onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center rounded-xl overflow-hidden shadow-lg group"
      style={{
        width: 50,
        height: 50,
        background: '#FFFFFF',
      }}
      whileHover={{
        scale: 1.2,
        y: -10,
        marginBottom: 10,
        zIndex: 50,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
    >
      <div
        className="w-full h-full flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
        }}
      >
        <FileIconSVG type={item.icon} size={32} />

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Label Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
        style={{
          background: 'rgba(35, 37, 29, 0.9)',
          color: '#FDFDF8',
          backdropFilter: 'blur(4px)'
        }}
      >
        {item.label}
      </div>

      {/* Active Dot indicator (mock) */}
      <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#4D4F46] opacity-0 group-hover:opacity-100" />
    </motion.button>
  );
}

// ============================================
// Export
// ============================================
export default function Demo2Page() {
  return (
    <ThemeProvider initialTheme="posthog">
      <Demo2PageInner />
    </ThemeProvider>
  );
}
