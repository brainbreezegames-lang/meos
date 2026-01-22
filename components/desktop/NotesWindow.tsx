'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { DesktopItem, BlockData } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { useThemeSafe, ThemeId } from '@/contexts/ThemeContext';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import { haptic } from '@/components/ui/Delight';

interface NotesWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME-AWARE STYLING - Each theme has its own distinctive personality
// ═══════════════════════════════════════════════════════════════════════════

interface ThemeColors {
  // Window
  windowBg: string;
  windowShadow: string;
  windowShadowInactive: string;
  windowBorder: string;

  // Title bar
  titleBarBg: string;
  titleBarBorder: string;
  titleText: string;
  iconColor: string;

  // Sidebar
  sidebarBg: string;
  sidebarBorder: string;
  searchBg: string;
  searchBgFocused: string;
  searchBorder: string;
  searchBorderFocused: string;
  searchShadowFocused: string;
  searchIcon: string;
  searchIconFocused: string;
  searchText: string;

  // Folders
  folderText: string;
  folderCount: string;
  folderHoverBg: string;

  // Note cards
  noteCardBg: string;
  noteCardShadow: string;
  noteCardHoverShadow: string;
  noteCardSelectedBg: string;
  noteCardSelectedShadow: string;
  noteTitle: string;
  noteTitleSelected: string;
  noteDate: string;
  noteDateSelected: string;
  notePreview: string;
  notePreviewSelected: string;
  noteDot: string;
  noteDotSelected: string;

  // Content area
  contentBg: string;
  contentHeaderBg: string;
  contentBorder: string;
  contentTitle: string;
  contentMeta: string;
  contentText: string;

  // Empty states
  emptyBg: string;
  emptyShadow: string;
  emptyIconColor: string;
  emptyTitle: string;
  emptyText: string;

  // Buttons
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  primaryButtonShadow: string;

  // Accent
  accent: string;
  accentLight: string;
}

// Unified design system - uses CSS variables from design-system.css
function getThemeColors(_themeId: ThemeId | undefined): ThemeColors {
  // ONE design system - Appart theme via CSS variables
  return {
    windowBg: 'var(--color-bg-base, #fbf9ef)',
    windowShadow: 'var(--shadow-window, 0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08))',
    windowShadowInactive: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
    windowBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',

    titleBarBg: 'var(--color-bg-base, #fbf9ef)',
    titleBarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    titleText: 'var(--color-text-primary, #171412)',
    iconColor: 'var(--color-accent-primary, #ff7722)',

    sidebarBg: 'var(--color-bg-subtle, #f2f0e7)',
    sidebarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    searchBg: 'var(--color-bg-white, #ffffff)',
    searchBgFocused: 'var(--color-bg-white, #ffffff)',
    searchBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    searchBorderFocused: 'var(--color-accent-primary, #ff7722)',
    searchShadowFocused: '0 0 0 3px rgba(255, 119, 34, 0.15)',
    searchIcon: 'var(--color-text-muted, #8e827c)',
    searchIconFocused: 'var(--color-accent-primary, #ff7722)',
    searchText: 'var(--color-text-primary, #171412)',

    folderText: 'var(--color-text-primary, #171412)',
    folderCount: 'var(--color-text-muted, #8e827c)',
    folderHoverBg: 'rgba(255, 119, 34, 0.08)',

    noteCardBg: 'var(--color-bg-white, #ffffff)',
    noteCardShadow: 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))',
    noteCardHoverShadow: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
    noteCardSelectedBg: 'var(--color-accent-primary, #ff7722)',
    noteCardSelectedShadow: '0 4px 16px rgba(255, 119, 34, 0.25)',
    noteTitle: 'var(--color-text-primary, #171412)',
    noteTitleSelected: 'var(--color-bg-white, #ffffff)',
    noteDate: 'var(--color-accent-primary, #ff7722)',
    noteDateSelected: 'rgba(255, 255, 255, 0.9)',
    notePreview: 'var(--color-text-muted, #8e827c)',
    notePreviewSelected: 'rgba(255, 255, 255, 0.8)',
    noteDot: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    noteDotSelected: 'rgba(255, 255, 255, 0.5)',

    contentBg: 'var(--color-bg-base, #fbf9ef)',
    contentHeaderBg: 'transparent',
    contentBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    contentTitle: 'var(--color-text-primary, #171412)',
    contentMeta: 'var(--color-text-muted, #8e827c)',
    contentText: 'var(--color-text-primary, #171412)',

    emptyBg: 'rgba(255, 119, 34, 0.06)',
    emptyShadow: '0 8px 24px rgba(255, 119, 34, 0.08)',
    emptyIconColor: 'var(--color-accent-primary, #ff7722)',
    emptyTitle: 'var(--color-text-primary, #171412)',
    emptyText: 'var(--color-text-muted, #8e827c)',

    buttonText: 'var(--color-text-muted, #8e827c)',
    buttonHoverBg: 'rgba(255, 119, 34, 0.08)',
    buttonHoverText: 'var(--color-text-primary, #171412)',
    primaryButtonBg: 'var(--color-accent-primary, #ff7722)',
    primaryButtonText: 'var(--color-bg-white, #ffffff)',
    primaryButtonShadow: '0 4px 12px rgba(255, 119, 34, 0.25)',

    accent: 'var(--color-accent-primary, #ff7722)',
    accentLight: 'rgba(255, 119, 34, 0.1)',
  };
}

export function NotesWindow({ window: windowInstance, item }: NotesWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const themeContext = useThemeSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isOwner = context?.isOwner ?? false;
  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  // Get theme-specific colors (unified design system)
  const colors = useMemo(() => getThemeColors(themeContext?.theme), [themeContext?.theme]);

  // Use tabs as individual notes, or blocks as a single note
  const notes = item.useTabs && item.tabs?.length > 0
    ? item.tabs.map(t => ({
      id: t.id,
      title: t.label,
      blocks: t.blocks,
      preview: getPreviewText(t.blocks),
      date: new Date(),
      folder: t.icon || 'Notes',
    }))
    : [{
      id: 'main',
      title: item.windowTitle,
      blocks: item.blocks || [],
      preview: getPreviewText(item.blocks || []),
      date: new Date(),
      folder: 'Notes',
    }];

  const folders = [...new Set(notes.map(n => n.folder))];

  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  function getPreviewText(blocks: BlockData[]): string {
    const textBlock = blocks.find(b => b.type === 'text');
    if (textBlock && typeof textBlock.data.content === 'string') {
      return textBlock.data.content.slice(0, 100);
    }
    return 'No additional text';
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        windowContext.closeWindow(windowInstance.id);
      }
    },
    [windowContext, windowInstance.id, isActive]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const activeNote = notes.find(n => n.id === activeNoteId);
  const sortedBlocks = activeNote ? [...activeNote.blocks].sort((a, b) => a.order - b.order) : [];

  const filteredNotes = searchQuery
    ? notes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.preview.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : notes;

  const handleBlockUpdate = (blockId: string, data: Record<string, unknown>) => {
    if (!item || !context) return;
    context.updateBlock(item.id, blockId, { data });
  };

  const handleBlockDelete = (blockId: string) => {
    if (!item || !context) return;
    context.deleteBlock(item.id, blockId);
  };

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handleNoteSelect = (noteId: string) => {
    setActiveNoteId(noteId);
    haptic('light');
  };

  const windowWidth = Math.max(item.windowWidth || 860, 700);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getWordCount = (blocks: BlockData[]) => {
    return blocks.reduce((count, block) => {
      if (block.type === 'text' && typeof block.data.content === 'string') {
        return count + block.data.content.split(/\s+/).length;
      }
      return count;
    }, 0);
  };

  const wordCount = activeNote ? getWordCount(activeNote.blocks) : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      {/* Drag constraints */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 z-[199] pointer-events-none"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      />

      {/* Notes Window */}
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
            minHeight: 520,
            borderRadius: isMaximized ? '0' : '12px',
            background: colors.windowBg,
            boxShadow: isActive ? colors.windowShadow : colors.windowShadowInactive,
            border: isMaximized ? 'none' : '2px solid var(--color-text-primary, #171412)',
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
          {/* ═══════════════════════════════════════════════════════
              TITLE BAR
              ═══════════════════════════════════════════════════════ */}
          <div
            className="flex items-center h-[52px] px-4 shrink-0 relative select-none"
            style={{
              background: colors.titleBarBg,
              borderBottom: '2px solid var(--color-text-primary, #171412)',
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights - unified 12px design */}
            <div
              className="flex items-center group/traffic"
              style={{ gap: 'var(--window-traffic-gap, 8px)' }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => windowContext.closeWindow(windowInstance.id)}
                className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  width: 'var(--window-traffic-size, 12px)',
                  height: 'var(--window-traffic-size, 12px)',
                  borderRadius: '50%',
                  background: 'var(--color-traffic-close, #ff5f57)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Close window"
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="rgba(77, 0, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => windowContext.minimizeWindow(windowInstance.id)}
                className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  width: 'var(--window-traffic-size, 12px)',
                  height: 'var(--window-traffic-size, 12px)',
                  borderRadius: '50%',
                  background: 'var(--color-traffic-minimize, #ffbd2e)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Minimize window"
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4H7" stroke="rgba(100, 65, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => windowContext.maximizeWindow(windowInstance.id)}
                className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{
                  width: 'var(--window-traffic-size, 12px)',
                  height: 'var(--window-traffic-size, 12px)',
                  borderRadius: '50%',
                  background: 'var(--color-traffic-maximize, #28c840)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Maximize window"
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: colors.iconColor }}>
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M7 7H17M7 11H17M7 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[13px] font-medium" style={{ color: colors.titleText }}>
                Notes
              </span>
            </div>

            {/* Toolbar Actions */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md transition-all duration-150"
                style={{ color: colors.buttonText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.buttonHoverBg;
                  e.currentTarget.style.color = colors.buttonHoverText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.buttonText;
                }}
                aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M4.5 4.5h15a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V6a1.5 1.5 0 011.5-1.5z" />
                  )}
                </svg>
              </button>
            </div>
          </div >

          {/* ═══════════════════════════════════════════════════════
              MAIN CONTENT AREA
              ═══════════════════════════════════════════════════════ */}
          < div className="flex flex-1 min-h-0 overflow-hidden" >

            {/* ═══════════════════════════════════════════════════════
                SIDEBAR
                ═══════════════════════════════════════════════════════ */}
            < AnimatePresence initial={false} >
              {!sidebarCollapsed && (
                <motion.div
                  className="shrink-0 flex flex-col overflow-hidden"
                  style={{
                    background: colors.sidebarBg,
                    borderRight: `1px solid ${colors.sidebarBorder}`,
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Search Bar */}
                  <div className="p-3 shrink-0">
                    <motion.div
                      className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg transition-all duration-200"
                      style={{
                        background: searchFocused ? colors.searchBgFocused : colors.searchBg,
                        boxShadow: searchFocused ? colors.searchShadowFocused : 'none',
                        border: `1px solid ${searchFocused ? colors.searchBorderFocused : colors.searchBorder}`,
                      }}
                      animate={{ scale: searchFocused ? 1.01 : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <svg
                        className="w-4 h-4 shrink-0 transition-colors duration-150"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: searchFocused ? colors.searchIconFocused : colors.searchIcon }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-50"
                        style={{ color: colors.searchText }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                          style={{ color: colors.searchIcon }}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="6" fill="currentColor" fillOpacity="0.3" />
                            <path d="M4 4L8 8M8 4L4 8" stroke="var(--color-bg-white, #ffffff)" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </motion.div>
                  </div>

                  {/* Folders Section */}
                  <div className="px-3 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: colors.folderCount }}>
                        Folders
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {folders.map((folder) => (
                        <button
                          key={folder}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150"
                          style={{ background: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.folderHoverBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span className="text-base">📁</span>
                          <span className="text-[13px] font-medium" style={{ color: colors.folderText }}>
                            {folder}
                          </span>
                          <span className="ml-auto text-[11px] font-medium tabular-nums" style={{ color: colors.folderCount }}>
                            {notes.filter(n => n.folder === folder).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-3 my-2" style={{ height: '1px', background: colors.sidebarBorder }} />

                  {/* Notes List */}
                  <div className="flex-1 overflow-y-auto px-3 pb-3">
                    <AnimatePresence mode="popLayout">
                      {filteredNotes.map((note, index) => {
                        const isSelected = activeNoteId === note.id;
                        return (
                          <motion.button
                            key={note.id}
                            onClick={() => handleNoteSelect(note.id)}
                            className="w-full text-left p-3 rounded-xl mb-1.5 transition-all duration-200 relative overflow-hidden"
                            style={{
                              background: isSelected ? colors.noteCardSelectedBg : colors.noteCardBg,
                              boxShadow: isSelected ? colors.noteCardSelectedShadow : colors.noteCardShadow,
                            }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            whileHover={!isSelected ? { boxShadow: colors.noteCardHoverShadow, y: -1 } : {}}
                            whileTap={{ scale: 0.98 }}
                          >
                            <h4
                              className="text-[14px] font-semibold mb-1 truncate leading-snug"
                              style={{ color: isSelected ? colors.noteTitleSelected : colors.noteTitle }}
                            >
                              {note.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[11px] font-medium shrink-0"
                                style={{ color: isSelected ? colors.noteDateSelected : colors.noteDate }}
                              >
                                {formatDate(note.date)}
                              </span>
                              <span style={{ color: isSelected ? colors.noteDotSelected : colors.noteDot }}>•</span>
                              <p
                                className="text-[12px] truncate"
                                style={{ color: isSelected ? colors.notePreviewSelected : colors.notePreview }}
                              >
                                {note.preview}
                              </p>
                            </div>
                            {isSelected && (
                              <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>

                    {/* Empty Search State */}
                    {filteredNotes.length === 0 && (
                      <motion.div
                        className="flex flex-col items-center justify-center py-12 px-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: colors.accentLight, boxShadow: `0 4px 12px ${colors.accentLight}` }}
                        >
                          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" style={{ color: colors.accent }}>
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                        <p className="text-[14px] font-semibold mb-1" style={{ color: colors.emptyTitle }}>
                          No Results
                        </p>
                        <p className="text-[12px] text-center" style={{ color: colors.emptyText }}>
                          No notes match &ldquo;{searchQuery}&rdquo;
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Footer - Note Count */}
                  <div
                    className="px-4 py-3 shrink-0 flex items-center justify-between"
                    style={{ borderTop: `1px solid ${colors.sidebarBorder}` }}
                  >
                    <span className="text-[11px] font-medium" style={{ color: colors.folderCount }}>
                      {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </span>
                    {isOwner && (
                      <button
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all duration-150"
                        style={{ color: colors.accent }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = colors.accentLight; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        + New Note
                      </button>
                    )}
                  </div>
                </motion.div>
              )
              }
            </AnimatePresence >

            {/* ═══════════════════════════════════════════════════════
                NOTE CONTENT AREA
                ═══════════════════════════════════════════════════════ */}
            < div
              ref={contentRef}
              className="flex-1 overflow-y-auto"
              style={{ background: colors.contentBg }}
            >
              <AnimatePresence mode="wait">
                {activeNote ? (
                  <motion.div
                    key={activeNote.id}
                    className="min-h-full"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Note Header */}
                    <div
                      className="px-10 pt-10 pb-6"
                      style={{ borderBottom: `1px solid ${colors.contentBorder}`, background: colors.contentHeaderBg }}
                    >
                      <motion.h1
                        className="text-[32px] font-bold leading-tight mb-3"
                        style={{ color: colors.contentTitle, letterSpacing: '-0.02em' }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.25 }}
                      >
                        {activeNote.title}
                      </motion.h1>

                      <motion.div
                        className="flex items-center gap-4 flex-wrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.25 }}
                      >
                        <span className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: colors.contentMeta }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {activeNote.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: colors.contentMeta }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {readingTime} min read
                        </span>
                        {wordCount > 0 && (
                          <span className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: colors.contentMeta }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {wordCount.toLocaleString()} words
                          </span>
                        )}
                      </motion.div>
                    </div>

                    {/* Note Content - Blocks */}
                    <div className="px-10 py-8">
                      {sortedBlocks.length > 0 ? (
                        <motion.div
                          className="space-y-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {sortedBlocks.map((block, index) => (
                            <motion.div
                              key={block.id}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                              style={{ fontSize: '15px', lineHeight: '1.7', color: colors.contentText }}
                            >
                              {isOwner ? (
                                <EditableBlockRenderer
                                  block={block}
                                  itemId={item.id}
                                  onUpdate={handleBlockUpdate}
                                  onDelete={handleBlockDelete}
                                />
                              ) : (
                                <BlockRenderer block={block} />
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        /* Empty Note State */
                        <motion.div
                          className="flex flex-col items-center justify-center py-20"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          <div
                            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden"
                            style={{ background: colors.emptyBg, boxShadow: colors.emptyShadow }}
                          >
                            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                              <path
                                d="M12 8H36C38.2091 8 40 9.79086 40 12V36C40 38.2091 38.2091 40 36 40H12C9.79086 40 8 38.2091 8 36V12C8 9.79086 9.79086 8 12 8Z"
                                fill={colors.emptyIconColor}
                                fillOpacity="0.15"
                              />
                              <path d="M16 16H32" stroke={colors.emptyIconColor} strokeWidth="2.5" strokeLinecap="round" />
                              <path d="M16 24H32" stroke={colors.emptyIconColor} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" />
                              <path d="M16 32H24" stroke={colors.emptyIconColor} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.3" />
                            </svg>
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                          </div>

                          <h3 className="text-[18px] font-semibold mb-2" style={{ color: colors.emptyTitle }}>
                            Start Writing
                          </h3>
                          <p className="text-[14px] text-center max-w-[280px] leading-relaxed" style={{ color: colors.emptyText }}>
                            This note is empty. Add some thoughts, ideas, or anything you&apos;d like to remember.
                          </p>

                          {isOwner && (
                            <motion.button
                              className="mt-6 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200"
                              style={{
                                background: colors.primaryButtonBg,
                                color: colors.primaryButtonText,
                                boxShadow: colors.primaryButtonShadow,
                              }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              Add Content
                            </motion.button>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {sortedBlocks.length > 0 && (
                      <motion.div
                        className="px-10 py-6 flex items-center justify-center gap-3 border-t"
                        style={{ borderColor: colors.contentBorder }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {['Share', 'Export PDF', 'Copy Link'].map((label, i) => (
                          <button
                            key={label}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-150"
                            style={{ color: colors.buttonText }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.buttonHoverBg;
                              e.currentTarget.style.color = colors.buttonHoverText;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = colors.buttonText;
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />}
                              {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />}
                              {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />}
                            </svg>
                            {label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  /* No Note Selected State */
                  <motion.div
                    className="flex items-center justify-center h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center">
                      <div
                        className="w-28 h-28 rounded-[28px] flex items-center justify-center mx-auto mb-5 relative overflow-hidden"
                        style={{ background: colors.emptyBg, boxShadow: colors.emptyShadow }}
                      >
                        <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none">
                          <path
                            d="M14 10H42C44.7614 10 47 12.2386 47 15V41C47 43.7614 44.7614 46 42 46H14C11.2386 46 9 43.7614 9 41V15C9 12.2386 11.2386 10 14 10Z"
                            fill={colors.emptyIconColor}
                            fillOpacity="0.12"
                          />
                          <path d="M19 20H37M19 28H37M19 36H28" stroke={colors.emptyIconColor} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
                        </svg>
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                      </div>
                      <p className="text-[15px] font-medium" style={{ color: colors.emptyText }}>
                        Select a note to view
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div >
          </div >
        </motion.div >
      </div >
    </>
  );
}
