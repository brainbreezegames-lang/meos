'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { useThemeSafe, ThemeId } from '@/contexts/ThemeContext';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { haptic } from '@/components/ui/Delight';

interface FinderWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'document' | 'link';
  icon: string;
  size?: string;
  modified?: string;
  url?: string;
  children?: FileItem[];
  blocks?: BlockData[];
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME-AWARE STYLING - Apple Finder inspired design
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeColors {
  // Window
  windowBg: string;
  windowShadow: string;
  windowShadowInactive: string;

  // Title bar
  titleBarBg: string;
  titleBarBorder: string;
  titleText: string;

  // Toolbar
  toolbarIconColor: string;
  toolbarIconHoverBg: string;
  toolbarIconDisabled: string;
  toolbarDivider: string;
  viewToggleBorder: string;
  viewToggleActiveBg: string;
  viewToggleActiveText: string;

  // Sidebar
  sidebarBg: string;
  sidebarBorder: string;
  sidebarHeader: string;
  sidebarItemText: string;
  sidebarItemHover: string;
  tagRed: string;
  tagOrange: string;
  tagGreen: string;
  tagBlue: string;

  // Content
  contentBg: string;
  fileText: string;
  fileSelectedBg: string;
  fileSelectedText: string;
  fileHoverBg: string;
  listHeaderText: string;
  listRowBorder: string;

  // Preview panel
  previewBg: string;
  previewBorder: string;
  previewText: string;
  previewLabelText: string;
  previewValueText: string;
  previewBlockBg: string;

  // Status bar
  statusBarBg: string;
  statusBarBorder: string;
  statusBarText: string;

  // Empty state
  emptyIcon: string;
  emptyTitle: string;
  emptyText: string;

  // Accent
  accent: string;
}

function getThemeColors(themeId: ThemeId | undefined): ThemeColors {
  switch (themeId) {
    case 'dark':
      return {
        windowBg: '#1E1E1E',
        windowShadow: '0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.1)',
        windowShadowInactive: '0 20px 60px -15px rgba(0,0,0,0.6)',

        titleBarBg: 'linear-gradient(180deg, #3D3D3D 0%, #323232 100%)',
        titleBarBorder: 'rgba(0,0,0,0.3)',
        titleText: '#FFFFFF',

        toolbarIconColor: 'rgba(255,255,255,0.7)',
        toolbarIconHoverBg: 'rgba(255,255,255,0.1)',
        toolbarIconDisabled: 'rgba(255,255,255,0.25)',
        toolbarDivider: 'rgba(255,255,255,0.1)',
        viewToggleBorder: 'rgba(255,255,255,0.15)',
        viewToggleActiveBg: '#0A84FF',
        viewToggleActiveText: '#FFFFFF',

        sidebarBg: '#252526',
        sidebarBorder: 'rgba(255,255,255,0.06)',
        sidebarHeader: 'rgba(255,255,255,0.4)',
        sidebarItemText: 'rgba(255,255,255,0.85)',
        sidebarItemHover: 'rgba(255,255,255,0.08)',
        tagRed: '#FF453A',
        tagOrange: '#FF9F0A',
        tagGreen: '#32D74B',
        tagBlue: '#0A84FF',

        contentBg: '#1E1E1E',
        fileText: '#FFFFFF',
        fileSelectedBg: '#0A84FF',
        fileSelectedText: '#FFFFFF',
        fileHoverBg: 'rgba(255,255,255,0.06)',
        listHeaderText: 'rgba(255,255,255,0.5)',
        listRowBorder: 'rgba(255,255,255,0.04)',

        previewBg: '#252526',
        previewBorder: 'rgba(255,255,255,0.06)',
        previewText: '#FFFFFF',
        previewLabelText: 'rgba(255,255,255,0.5)',
        previewValueText: 'rgba(255,255,255,0.8)',
        previewBlockBg: '#1E1E1E',

        statusBarBg: '#252526',
        statusBarBorder: 'rgba(255,255,255,0.06)',
        statusBarText: 'rgba(255,255,255,0.5)',

        emptyIcon: 'rgba(255,255,255,0.3)',
        emptyTitle: 'rgba(255,255,255,0.9)',
        emptyText: 'rgba(255,255,255,0.5)',

        accent: '#0A84FF',
      };

    case 'bluren':
      return {
        windowBg: '#FFFFFF',
        windowShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.05)',
        windowShadowInactive: '0 10px 40px -10px rgba(0,0,0,0.1)',

        titleBarBg: 'linear-gradient(180deg, #FAFAFA 0%, #F2F2F2 100%)',
        titleBarBorder: 'rgba(0,0,0,0.08)',
        titleText: '#000000',

        toolbarIconColor: 'rgba(0,0,0,0.55)',
        toolbarIconHoverBg: 'rgba(0,0,0,0.05)',
        toolbarIconDisabled: 'rgba(0,0,0,0.2)',
        toolbarDivider: 'rgba(0,0,0,0.08)',
        viewToggleBorder: 'rgba(0,0,0,0.1)',
        viewToggleActiveBg: '#0071E3',
        viewToggleActiveText: '#FFFFFF',

        sidebarBg: '#F5F5F7',
        sidebarBorder: 'rgba(0,0,0,0.05)',
        sidebarHeader: 'rgba(0,0,0,0.35)',
        sidebarItemText: 'rgba(0,0,0,0.8)',
        sidebarItemHover: 'rgba(0,0,0,0.04)',
        tagRed: '#FF3B30',
        tagOrange: '#FF9500',
        tagGreen: '#34C759',
        tagBlue: '#0071E3',

        contentBg: '#FFFFFF',
        fileText: '#1D1D1F',
        fileSelectedBg: '#0071E3',
        fileSelectedText: '#FFFFFF',
        fileHoverBg: 'rgba(0,0,0,0.03)',
        listHeaderText: 'rgba(0,0,0,0.4)',
        listRowBorder: 'rgba(0,0,0,0.04)',

        previewBg: '#F5F5F7',
        previewBorder: 'rgba(0,0,0,0.05)',
        previewText: '#1D1D1F',
        previewLabelText: 'rgba(0,0,0,0.4)',
        previewValueText: 'rgba(0,0,0,0.7)',
        previewBlockBg: '#FFFFFF',

        statusBarBg: '#F5F5F7',
        statusBarBorder: 'rgba(0,0,0,0.05)',
        statusBarText: 'rgba(0,0,0,0.4)',

        emptyIcon: 'rgba(0,0,0,0.2)',
        emptyTitle: 'rgba(0,0,0,0.8)',
        emptyText: 'rgba(0,0,0,0.4)',

        accent: '#0071E3',
      };

    case 'refined':
      return {
        windowBg: '#1A1A1A',
        windowShadow: '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        windowShadowInactive: '0 15px 50px -15px rgba(0,0,0,0.5)',

        titleBarBg: 'linear-gradient(180deg, #2A2A2A 0%, #222222 100%)',
        titleBarBorder: 'rgba(255,255,255,0.05)',
        titleText: '#F5F5F0',

        toolbarIconColor: 'rgba(245,245,240,0.6)',
        toolbarIconHoverBg: 'rgba(255,255,255,0.06)',
        toolbarIconDisabled: 'rgba(245,245,240,0.2)',
        toolbarDivider: 'rgba(255,255,255,0.06)',
        viewToggleBorder: 'rgba(255,255,255,0.08)',
        viewToggleActiveBg: '#CAE8BD',
        viewToggleActiveText: '#0D0D0D',

        sidebarBg: '#1F1F1F',
        sidebarBorder: 'rgba(255,255,255,0.04)',
        sidebarHeader: 'rgba(245,245,240,0.35)',
        sidebarItemText: 'rgba(245,245,240,0.8)',
        sidebarItemHover: 'rgba(255,255,255,0.04)',
        tagRed: '#E57373',
        tagOrange: '#FFB74D',
        tagGreen: '#CAE8BD',
        tagBlue: '#81D4FA',

        contentBg: '#1A1A1A',
        fileText: '#F5F5F0',
        fileSelectedBg: '#CAE8BD',
        fileSelectedText: '#0D0D0D',
        fileHoverBg: 'rgba(255,255,255,0.04)',
        listHeaderText: 'rgba(245,245,240,0.4)',
        listRowBorder: 'rgba(255,255,255,0.03)',

        previewBg: '#1F1F1F',
        previewBorder: 'rgba(255,255,255,0.04)',
        previewText: '#F5F5F0',
        previewLabelText: 'rgba(245,245,240,0.4)',
        previewValueText: 'rgba(245,245,240,0.7)',
        previewBlockBg: '#1A1A1A',

        statusBarBg: '#1F1F1F',
        statusBarBorder: 'rgba(255,255,255,0.04)',
        statusBarText: 'rgba(245,245,240,0.4)',

        emptyIcon: 'rgba(245,245,240,0.2)',
        emptyTitle: 'rgba(245,245,240,0.85)',
        emptyText: 'rgba(245,245,240,0.4)',

        accent: '#CAE8BD',
      };

    case 'monterey':
    default:
      return {
        windowBg: '#FFFFFF',
        windowShadow: '0 35px 90px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.1)',
        windowShadowInactive: '0 20px 50px -15px rgba(0,0,0,0.2)',

        titleBarBg: 'linear-gradient(180deg, #E8E8E8 0%, #D4D4D4 100%)',
        titleBarBorder: 'rgba(0,0,0,0.15)',
        titleText: '#1D1D1F',

        toolbarIconColor: '#5E5E5E',
        toolbarIconHoverBg: 'rgba(0,0,0,0.06)',
        toolbarIconDisabled: '#AEAEB2',
        toolbarDivider: 'rgba(0,0,0,0.1)',
        viewToggleBorder: 'rgba(0,0,0,0.12)',
        viewToggleActiveBg: '#007AFF',
        viewToggleActiveText: '#FFFFFF',

        sidebarBg: '#F6F6F6',
        sidebarBorder: 'rgba(0,0,0,0.08)',
        sidebarHeader: '#86868B',
        sidebarItemText: '#1D1D1F',
        sidebarItemHover: 'rgba(0,0,0,0.04)',
        tagRed: '#FF3B30',
        tagOrange: '#FF9500',
        tagGreen: '#34C759',
        tagBlue: '#007AFF',

        contentBg: '#FFFFFF',
        fileText: '#1D1D1F',
        fileSelectedBg: '#007AFF',
        fileSelectedText: '#FFFFFF',
        fileHoverBg: 'rgba(0,0,0,0.03)',
        listHeaderText: '#86868B',
        listRowBorder: 'rgba(0,0,0,0.06)',

        previewBg: '#F6F6F6',
        previewBorder: 'rgba(0,0,0,0.08)',
        previewText: '#1D1D1F',
        previewLabelText: '#86868B',
        previewValueText: '#3C3C43',
        previewBlockBg: '#FFFFFF',

        statusBarBg: '#F6F6F6',
        statusBarBorder: 'rgba(0,0,0,0.08)',
        statusBarText: '#86868B',

        emptyIcon: '#AEAEB2',
        emptyTitle: '#1D1D1F',
        emptyText: '#86868B',

        accent: '#007AFF',
      };
  }
}

export function FinderWindow({ window: windowInstance, item }: FinderWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const themeContext = useThemeSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([item.windowTitle]);
  const [viewMode, setViewMode] = useState<'icons' | 'list'>('icons');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const prefersReducedMotion = useReducedMotion();

  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  const colors = useMemo(() => getThemeColors(themeContext?.theme), [themeContext?.theme]);

  // Convert tabs/blocks to file structure
  const buildFileStructure = (): FileItem[] => {
    const files: FileItem[] = [];

    if (item.useTabs && item.tabs?.length > 0) {
      item.tabs.forEach(tab => {
        files.push({
          id: tab.id,
          name: tab.label,
          type: 'folder',
          icon: '📁',
          children: tab.blocks.map(block => blockToFileItem(block)),
          blocks: tab.blocks,
        });
      });
    } else if (item.blocks?.length > 0) {
      item.blocks.forEach(block => {
        files.push(blockToFileItem(block));
      });
    }

    return files;
  };

  const blockToFileItem = (block: BlockData): FileItem => {
    const typeIcons: Record<string, { icon: string; type: FileItem['type'] }> = {
      text: { icon: '📄', type: 'document' },
      image: { icon: '🖼️', type: 'image' },
      gallery: { icon: '📸', type: 'folder' },
      video: { icon: '🎬', type: 'file' },
      links: { icon: '🔗', type: 'link' },
      buttons: { icon: '🔘', type: 'link' },
      download: { icon: '⬇️', type: 'file' },
      embed: { icon: '🌐', type: 'link' },
      'case-study': { icon: '📋', type: 'document' },
      timeline: { icon: '📅', type: 'document' },
      stats: { icon: '📊', type: 'document' },
      testimonial: { icon: '💬', type: 'document' },
      quote: { icon: '❝', type: 'document' },
    };

    const info = typeIcons[block.type] || { icon: '📄', type: 'file' };
    const name = (block.data.title as string) || (block.data.caption as string) || (block.data.fileName as string) || `${block.type} block`;

    return {
      id: block.id,
      name: name.slice(0, 30),
      type: info.type,
      icon: info.icon,
      size: `${JSON.stringify(block.data).length} bytes`,
      modified: 'Just now',
      blocks: [block],
    };
  };

  const files = buildFileStructure();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        if (selectedItem) {
          setSelectedItem(null);
        } else {
          windowContext.closeWindow(windowInstance.id);
        }
      }
      if (e.key === 'Backspace' && currentPath.length > 1) {
        goBack();
      }
    },
    [windowContext, windowInstance.id, isActive, selectedItem, currentPath]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handleItemClick = (file: FileItem) => {
    setSelectedItem(file);
    haptic('light');
  };

  const handleItemDoubleClick = (file: FileItem) => {
    if (file.type === 'folder' && file.children) {
      setCurrentPath([...currentPath, file.name]);
      setSelectedItem(null);
    }
    haptic('medium');
  };

  const goBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItem(null);
      haptic('light');
    }
  };

  const goToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedItem(null);
    haptic('light');
  };

  const getCurrentContents = (): FileItem[] => {
    if (currentPath.length === 1) {
      return files;
    }

    let current = files;
    for (let i = 1; i < currentPath.length; i++) {
      const folder = current.find(f => f.name === currentPath[i]);
      if (folder?.children) {
        current = folder.children;
      }
    }
    return current;
  };

  const currentContents = getCurrentContents();
  const sortedContents = [...currentContents].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const windowWidth = Math.max(item.windowWidth || 800, 600);

  return (
    <>
      <div
        ref={constraintsRef}
        className="fixed inset-0 z-[199] pointer-events-none"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      />

      <div
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      >
        <motion.div
          ref={windowRef}
          className="overflow-hidden flex flex-col pointer-events-auto"
          onClick={handleWindowClick}
          drag={!isMaximized}
          dragConstraints={constraintsRef}
          dragElastic={0.05}
          dragMomentum={false}
          style={{
            zIndex: windowInstance.zIndex + 200,
            width: isMaximized ? '100%' : windowWidth,
            maxWidth: isMaximized ? '100%' : '95vw',
            height: isMaximized ? '100%' : 'auto',
            maxHeight: isMaximized ? '100%' : 'calc(100vh - 120px)',
            minHeight: 450,
            borderRadius: isMaximized ? '0' : '12px',
            background: colors.windowBg,
            boxShadow: isActive ? colors.windowShadow : colors.windowShadowInactive,
            opacity: isActive ? 1 : 0.96,
          }}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : {
            type: 'spring',
            stiffness: 400,
            damping: 32,
            mass: 0.8
          }}
        >
          {/* Title Bar */}
          <div
            className="flex items-center justify-between h-[52px] px-3 shrink-0 select-none"
            style={{
              background: colors.titleBarBg,
              borderBottom: `1px solid ${colors.titleBarBorder}`,
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights & Navigation */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 group/traffic"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => windowContext.closeWindow(windowInstance.id)}
                  className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                  style={{
                    background: 'linear-gradient(180deg, #FF5F57 0%, #E0443E 100%)',
                    boxShadow: '0 0.5px 1px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(0,0,0,0.06)',
                  }}
                  aria-label="Close"
                >
                  <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77,0,0,0.7)" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => windowContext.minimizeWindow(windowInstance.id)}
                  className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                  style={{
                    background: 'linear-gradient(180deg, #FFBD2E 0%, #DFA023 100%)',
                    boxShadow: '0 0.5px 1px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(0,0,0,0.06)',
                  }}
                  aria-label="Minimize"
                >
                  <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4H7" stroke="rgba(100,65,0,0.7)" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => windowContext.maximizeWindow(windowInstance.id)}
                  className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                  style={{
                    background: 'linear-gradient(180deg, #28CA41 0%, #1AAD2E 100%)',
                    boxShadow: '0 0.5px 1px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(0,0,0,0.06)',
                  }}
                  aria-label="Maximize"
                >
                  <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                    <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0,70,0,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                  </svg>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center">
                <button
                  onClick={goBack}
                  disabled={currentPath.length <= 1}
                  className="p-1.5 rounded transition-all disabled:opacity-30"
                  style={{
                    color: colors.toolbarIconColor,
                  }}
                  onMouseEnter={(e) => {
                    if (currentPath.length > 1) e.currentTarget.style.background = colors.toolbarIconHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  disabled
                  className="p-1.5 rounded opacity-30"
                  style={{ color: colors.toolbarIconDisabled }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Title / Breadcrumb */}
            <div className="flex items-center gap-1">
              {currentPath.map((segment, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-3 h-3 mx-1" fill="none" viewBox="0 0 24 24" stroke={colors.toolbarIconDisabled} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  <button
                    onClick={() => goToPath(index)}
                    className="text-[13px] font-medium px-1.5 py-0.5 rounded transition-colors"
                    style={{
                      color: index === currentPath.length - 1 ? colors.titleText : colors.toolbarIconColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.toolbarIconHoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {index === 0 ? '📁' : ''} {segment}
                  </button>
                </div>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: `1px solid ${colors.viewToggleBorder}` }}
              >
                {(['icons', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="p-1.5 transition-all duration-150"
                    style={{
                      background: viewMode === mode ? colors.viewToggleActiveBg : 'transparent',
                      color: viewMode === mode ? colors.viewToggleActiveText : colors.toolbarIconColor,
                    }}
                  >
                    {mode === 'icons' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    )}
                    {mode === 'list' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <button
                className="p-1.5 rounded transition-colors"
                style={{ color: colors.toolbarIconColor }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.toolbarIconHoverBg}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar + Content */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <div
              className="w-44 shrink-0 py-3 overflow-y-auto"
              style={{
                background: colors.sidebarBg,
                borderRight: `1px solid ${colors.sidebarBorder}`,
              }}
            >
              <div className="px-3 mb-2">
                <h3
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: colors.sidebarHeader }}
                >
                  Favorites
                </h3>
              </div>
              <nav className="px-1.5">
                {[
                  { icon: '🏠', label: 'Home' },
                  { icon: '📄', label: 'Documents' },
                  { icon: '⬇️', label: 'Downloads' },
                ].map((fav, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPath([item.windowTitle]);
                      haptic('light');
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors"
                    style={{ color: colors.sidebarItemText }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.sidebarItemHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-sm">{fav.icon}</span>
                    <span className="text-[12px] font-medium">{fav.label}</span>
                  </button>
                ))}
              </nav>

              <div className="px-3 mt-4 mb-2">
                <h3
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: colors.sidebarHeader }}
                >
                  Tags
                </h3>
              </div>
              <nav className="px-1.5">
                {[
                  { color: colors.tagRed, label: 'Red' },
                  { color: colors.tagOrange, label: 'Orange' },
                  { color: colors.tagGreen, label: 'Green' },
                  { color: colors.tagBlue, label: 'Blue' },
                ].map((tag, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors"
                    style={{ color: colors.sidebarItemText }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.sidebarItemHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ background: tag.color }} />
                    <span className="text-[12px] font-medium">{tag.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* File Browser */}
            <div className="flex-1 overflow-y-auto p-4" style={{ background: colors.contentBg }}>
              {sortedContents.length > 0 ? (
                viewMode === 'icons' ? (
                  <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {sortedContents.map((file, index) => (
                      <motion.button
                        key={file.id}
                        onClick={() => handleItemClick(file)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all focus:outline-none"
                        style={{
                          background: selectedItem?.id === file.id ? colors.fileSelectedBg : 'transparent',
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{
                          scale: 1.05,
                          background: selectedItem?.id === file.id ? colors.fileSelectedBg : colors.fileHoverBg,
                        }}
                      >
                        <span className="text-4xl">{file.icon}</span>
                        <span
                          className="text-[11px] font-medium text-center line-clamp-2 px-1"
                          style={{ color: selectedItem?.id === file.id ? colors.fileSelectedText : colors.fileText }}
                        >
                          {file.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {/* Header */}
                    <div
                      className="flex items-center gap-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: colors.listHeaderText, borderBottom: `1px solid ${colors.listRowBorder}` }}
                    >
                      <span className="flex-1">Name</span>
                      <span className="w-24">Modified</span>
                      <span className="w-20 text-right">Size</span>
                    </div>
                    {sortedContents.map((file, index) => (
                      <motion.button
                        key={file.id}
                        onClick={() => handleItemClick(file)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all text-left"
                        style={{
                          background: selectedItem?.id === file.id ? colors.fileSelectedBg : 'transparent',
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{
                          background: selectedItem?.id === file.id ? colors.fileSelectedBg : colors.fileHoverBg,
                        }}
                      >
                        <span className="text-lg">{file.icon}</span>
                        <span
                          className="flex-1 text-[13px] font-medium truncate"
                          style={{ color: selectedItem?.id === file.id ? colors.fileSelectedText : colors.fileText }}
                        >
                          {file.name}
                        </span>
                        <span
                          className="w-24 text-[11px]"
                          style={{ color: selectedItem?.id === file.id ? colors.fileSelectedText : colors.listHeaderText }}
                        >
                          {file.modified}
                        </span>
                        <span
                          className="w-20 text-[11px] text-right"
                          style={{ color: selectedItem?.id === file.id ? colors.fileSelectedText : colors.listHeaderText }}
                        >
                          {file.size}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center h-full py-16"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="text-5xl mb-4">📂</span>
                  <p className="text-[16px] font-semibold mb-1" style={{ color: colors.emptyTitle }}>
                    This folder is empty
                  </p>
                  <p className="text-[13px]" style={{ color: colors.emptyText }}>
                    Add tabs or blocks to see content here
                  </p>
                </motion.div>
              )}
            </div>

            {/* Preview Panel */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 overflow-hidden"
                  style={{
                    background: colors.previewBg,
                    borderLeft: `1px solid ${colors.previewBorder}`,
                  }}
                >
                  <div className="p-4">
                    {/* Preview Icon */}
                    <div className="flex items-center justify-center py-6">
                      <span className="text-6xl">{selectedItem.icon}</span>
                    </div>

                    {/* Info */}
                    <h3
                      className="text-[14px] font-semibold text-center mb-4"
                      style={{ color: colors.previewText }}
                    >
                      {selectedItem.name}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span style={{ color: colors.previewLabelText }}>Kind</span>
                        <span style={{ color: colors.previewValueText }}>{selectedItem.type}</span>
                      </div>
                      {selectedItem.size && (
                        <div className="flex justify-between text-[12px]">
                          <span style={{ color: colors.previewLabelText }}>Size</span>
                          <span style={{ color: colors.previewValueText }}>{selectedItem.size}</span>
                        </div>
                      )}
                      {selectedItem.modified && (
                        <div className="flex justify-between text-[12px]">
                          <span style={{ color: colors.previewLabelText }}>Modified</span>
                          <span style={{ color: colors.previewValueText }}>{selectedItem.modified}</span>
                        </div>
                      )}
                    </div>

                    {/* Block Preview */}
                    {selectedItem.blocks && selectedItem.blocks.length > 0 && (
                      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.previewBorder}` }}>
                        <h4
                          className="text-[11px] font-semibold uppercase tracking-wide mb-2"
                          style={{ color: colors.previewLabelText }}
                        >
                          Preview
                        </h4>
                        <div
                          className="text-[12px] overflow-hidden rounded-lg p-2"
                          style={{ background: colors.previewBlockBg, maxHeight: 120 }}
                        >
                          <BlockRenderer block={selectedItem.blocks[0]} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5 text-[11px] shrink-0"
            style={{
              background: colors.statusBarBg,
              borderTop: `1px solid ${colors.statusBarBorder}`,
              color: colors.statusBarText,
            }}
          >
            <span>{sortedContents.length} items</span>
            {selectedItem && <span>Selected: {selectedItem.name}</span>}
          </div>
        </motion.div>
      </div>
    </>
  );
}
