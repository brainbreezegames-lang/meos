'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { useThemeSafe, ThemeId } from '@/contexts/ThemeContext';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { haptic } from '@/components/ui/Delight';
import { TrafficLights } from './TrafficLights';
import { WINDOW, TITLE_BAR, ANIMATION } from './windowStyles';

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

// Unified design system - uses CSS variables from design-system.css
function getThemeColors(_themeId: ThemeId | undefined): ThemeColors {
  // ONE design system - Appart theme via CSS variables
  return {
    windowBg: 'var(--color-bg-base, #fcfbf8)',
    windowShadow: 'var(--shadow-window, 0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08))',
    windowShadowInactive: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',

    titleBarBg: 'var(--color-bg-base, #fcfbf8)',
    titleBarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    titleText: 'var(--color-text-primary, #1c1c1c)',

    toolbarIconColor: 'var(--color-text-muted, #8d8d8b)',
    toolbarIconHoverBg: 'var(--color-accent-primary-subtle)',
    toolbarIconDisabled: 'rgba(23, 20, 18, 0.2)',
    toolbarDivider: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    viewToggleBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    viewToggleActiveBg: 'var(--color-accent-primary)',
    viewToggleActiveText: 'var(--color-bg-white, #ffffff)',

    sidebarBg: 'var(--color-bg-subtle, #f7f4ed)',
    sidebarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    sidebarHeader: 'var(--color-text-muted, #8d8d8b)',
    sidebarItemText: 'var(--color-text-primary, #1c1c1c)',
    sidebarItemHover: 'var(--color-accent-primary-subtle)',
    tagRed: '#ff3c34',
    tagOrange: '#ffc765',
    tagGreen: '#10b981',
    tagBlue: 'var(--color-accent-primary)',

    contentBg: 'var(--color-bg-base, #fcfbf8)',
    fileText: 'var(--color-text-primary, #1c1c1c)',
    fileSelectedBg: 'var(--color-accent-primary)',
    fileSelectedText: 'var(--color-bg-white, #ffffff)',
    fileHoverBg: 'var(--color-accent-primary-muted)',
    listHeaderText: 'var(--color-text-muted, #8d8d8b)',
    listRowBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',

    previewBg: 'var(--color-bg-subtle, #f7f4ed)',
    previewBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    previewText: 'var(--color-text-primary, #1c1c1c)',
    previewLabelText: 'var(--color-text-muted, #8d8d8b)',
    previewValueText: 'var(--color-text-primary, #1c1c1c)',
    previewBlockBg: 'var(--color-bg-base, #fcfbf8)',

    statusBarBg: 'var(--color-bg-subtle, #f7f4ed)',
    statusBarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    statusBarText: 'var(--color-text-muted, #8d8d8b)',

    emptyIcon: 'var(--color-text-muted, #8d8d8b)',
    emptyTitle: 'var(--color-text-primary, #1c1c1c)',
    emptyText: 'var(--color-text-muted, #8d8d8b)',

    accent: 'var(--color-accent-primary)',
  };
}

export function FinderWindow({ window: windowInstance, item }: FinderWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const themeContext = useThemeSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([item.windowTitle]);
  const [viewMode, setViewMode] = useState<'icons' | 'list'>('icons');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const prefersReducedMotion = useReducedMotion();

  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';
  // Unified design system - no theme-specific checks needed
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
        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      >
        <motion.div
          ref={windowRef}
          className="overflow-hidden flex flex-col pointer-events-auto"
          onClick={handleWindowClick}
          drag={!isMaximized}
          dragConstraints={false}
          dragElastic={0}
          dragMomentum={false}
          style={{
            zIndex: windowInstance.zIndex + 200,
            width: isMaximized ? '100%' : windowWidth,
            maxWidth: isMaximized ? '100%' : '95vw',
            height: isMaximized ? '100%' : 'auto',
            maxHeight: isMaximized ? '100%' : 'calc(100vh - 120px)',
            minHeight: 450,
            borderRadius: isMaximized ? WINDOW.borderRadiusMaximized : WINDOW.borderRadius,
            background: WINDOW.background,
            boxShadow: isMaximized ? WINDOW.shadowMaximized : WINDOW.shadow,
            border: isMaximized ? WINDOW.borderMaximized : WINDOW.border,
            opacity: isActive ? WINDOW.opacityActive : WINDOW.opacityInactive,
          }}
          initial={prefersReducedMotion ? ANIMATION.reducedInitial : ANIMATION.initial}
          animate={prefersReducedMotion ? ANIMATION.reducedAnimate : ANIMATION.animate}
          exit={prefersReducedMotion ? ANIMATION.reducedExit : ANIMATION.exit}
          transition={prefersReducedMotion ? ANIMATION.reducedTransition : ANIMATION.transition}
        >
          {/* Title Bar */}
          <div
            className="flex items-center justify-between px-3 shrink-0 select-none"
            style={{
              height: TITLE_BAR.height,
              background: TITLE_BAR.background,
              borderBottom: TITLE_BAR.borderBottom,
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights & Navigation */}
            <div className="flex items-center gap-3">
              <TrafficLights
                onClose={() => windowContext.closeWindow(windowInstance.id)}
                onMinimize={() => windowContext.minimizeWindow(windowInstance.id)}
                onMaximize={() => windowContext.maximizeWindow(windowInstance.id)}
                isMaximized={isMaximized}
              />

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
          </div >

          {/* Sidebar + Content */}
          < div className="flex flex-1 min-h-0" >
            {/* Sidebar */}
            < div
              className="w-44 shrink-0 py-3 overflow-y-auto"
              style={{
                background: colors.sidebarBg,
                borderRight: `1px solid ${colors.sidebarBorder}`,
              }
              }
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
            </div >

            {/* File Browser */}
            < div className="flex-1 overflow-y-auto p-4" style={{ background: colors.contentBg }}>
              {
                sortedContents.length > 0 ? (
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
                )
              }
            </div >

            {/* Preview Panel */}
            <AnimatePresence>
              {
                selectedItem && (
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
                )
              }
            </AnimatePresence >
          </div >

          {/* Status Bar */}
          < div
            className="flex items-center justify-between px-4 py-1.5 text-[11px] shrink-0"
            style={{
              background: colors.statusBarBg,
              borderTop: `1px solid ${colors.statusBarBorder}`,
              color: colors.statusBarText,
            }}
          >
            <span>{sortedContents.length} items</span>
            {selectedItem && <span>Selected: {selectedItem.name}</span>}
          </div >
        </motion.div >
      </div >
    </>
  );
}
