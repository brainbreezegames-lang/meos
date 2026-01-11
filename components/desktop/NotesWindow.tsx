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

function getThemeColors(themeId: ThemeId | undefined): ThemeColors {
  switch (themeId) {
    case 'dark':
      // Dark theme: Sharp, neon blue accents, futuristic
      return {
        windowBg: 'linear-gradient(180deg, rgba(32,32,38,0.98) 0%, rgba(22,22,26,0.96) 100%)',
        windowShadow: '0 35px 80px -20px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 0.5px 0 rgba(255,255,255,0.12)',
        windowShadowInactive: '0 20px 50px -15px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.05)',
        windowBorder: 'rgba(255,255,255,0.06)',

        titleBarBg: 'linear-gradient(180deg, rgba(40,40,48,1) 0%, rgba(32,32,38,1) 100%)',
        titleBarBorder: 'rgba(255,255,255,0.06)',
        titleText: '#F8F8FA',
        iconColor: '#5BA0FF',

        sidebarBg: 'linear-gradient(180deg, rgba(28,28,32,1) 0%, rgba(22,22,26,1) 100%)',
        sidebarBorder: 'rgba(255,255,255,0.06)',
        searchBg: 'rgba(255,255,255,0.06)',
        searchBgFocused: 'rgba(91,160,255,0.1)',
        searchBorder: 'transparent',
        searchBorderFocused: 'rgba(91,160,255,0.4)',
        searchShadowFocused: '0 0 0 3px rgba(91,160,255,0.15)',
        searchIcon: '#56565C',
        searchIconFocused: '#5BA0FF',
        searchText: '#F8F8FA',

        folderText: '#F8F8FA',
        folderCount: '#56565C',
        folderHoverBg: 'rgba(255,255,255,0.04)',

        noteCardBg: 'rgba(255,255,255,0.04)',
        noteCardShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.05)',
        noteCardHoverShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.08)',
        noteCardSelectedBg: 'linear-gradient(135deg, #5BA0FF 0%, #4A8FEE 100%)',
        noteCardSelectedShadow: '0 4px 16px rgba(91,160,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        noteTitle: '#F8F8FA',
        noteTitleSelected: '#FFFFFF',
        noteDate: '#5BA0FF',
        noteDateSelected: 'rgba(255,255,255,0.85)',
        notePreview: '#94949C',
        notePreviewSelected: 'rgba(255,255,255,0.7)',
        noteDot: 'rgba(255,255,255,0.15)',
        noteDotSelected: 'rgba(255,255,255,0.5)',

        contentBg: 'linear-gradient(180deg, rgba(22,22,26,1) 0%, rgba(18,18,22,1) 100%)',
        contentHeaderBg: 'linear-gradient(180deg, rgba(30,30,36,0.5) 0%, transparent 100%)',
        contentBorder: 'rgba(255,255,255,0.04)',
        contentTitle: '#F8F8FA',
        contentMeta: '#56565C',
        contentText: '#E8E8EA',

        emptyBg: 'linear-gradient(135deg, rgba(91,160,255,0.15) 0%, rgba(91,160,255,0.08) 100%)',
        emptyShadow: '0 8px 24px rgba(91,160,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
        emptyIconColor: '#5BA0FF',
        emptyTitle: '#F8F8FA',
        emptyText: '#56565C',

        buttonText: '#56565C',
        buttonHoverBg: 'rgba(255,255,255,0.06)',
        buttonHoverText: '#F8F8FA',
        primaryButtonBg: 'linear-gradient(135deg, #5BA0FF 0%, #4A8FEE 100%)',
        primaryButtonText: '#000000',
        primaryButtonShadow: '0 4px 12px rgba(91,160,255,0.4)',

        accent: '#5BA0FF',
        accentLight: 'rgba(91,160,255,0.15)',
      };

    case 'bluren':
      // Bluren: Ultra-minimal, airy, Apple-pure
      return {
        windowBg: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 100%)',
        windowShadow: '0 16px 48px -8px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)',
        windowShadowInactive: '0 8px 32px -8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.03)',
        windowBorder: 'rgba(0,0,0,0.04)',

        titleBarBg: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(252,252,254,1) 100%)',
        titleBarBorder: 'rgba(0,0,0,0.04)',
        titleText: '#000000',
        iconColor: '#0071E3',

        sidebarBg: 'linear-gradient(180deg, rgba(252,252,254,1) 0%, rgba(250,250,252,1) 100%)',
        sidebarBorder: 'rgba(0,0,0,0.04)',
        searchBg: 'rgba(0,0,0,0.02)',
        searchBgFocused: 'rgba(0,113,227,0.04)',
        searchBorder: 'transparent',
        searchBorderFocused: 'rgba(0,113,227,0.3)',
        searchShadowFocused: '0 0 0 3px rgba(0,113,227,0.1)',
        searchIcon: 'rgba(0,0,0,0.25)',
        searchIconFocused: '#0071E3',
        searchText: '#000000',

        folderText: '#000000',
        folderCount: 'rgba(0,0,0,0.35)',
        folderHoverBg: 'rgba(0,0,0,0.02)',

        noteCardBg: 'rgba(255,255,255,0.9)',
        noteCardShadow: '0 0.5px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.02)',
        noteCardHoverShadow: '0 2px 6px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.03)',
        noteCardSelectedBg: 'linear-gradient(135deg, #0071E3 0%, #0066CC 100%)',
        noteCardSelectedShadow: '0 2px 8px rgba(0,113,227,0.25)',
        noteTitle: '#000000',
        noteTitleSelected: '#FFFFFF',
        noteDate: '#0071E3',
        noteDateSelected: 'rgba(255,255,255,0.85)',
        notePreview: 'rgba(0,0,0,0.45)',
        notePreviewSelected: 'rgba(255,255,255,0.7)',
        noteDot: 'rgba(0,0,0,0.1)',
        noteDotSelected: 'rgba(255,255,255,0.4)',

        contentBg: 'linear-gradient(180deg, #FFFFFF 0%, #FEFEFE 100%)',
        contentHeaderBg: 'transparent',
        contentBorder: 'rgba(0,0,0,0.03)',
        contentTitle: '#000000',
        contentMeta: 'rgba(0,0,0,0.35)',
        contentText: 'rgba(0,0,0,0.85)',

        emptyBg: 'linear-gradient(135deg, rgba(0,113,227,0.06) 0%, rgba(0,113,227,0.02) 100%)',
        emptyShadow: '0 4px 12px rgba(0,113,227,0.06)',
        emptyIconColor: '#0071E3',
        emptyTitle: '#000000',
        emptyText: 'rgba(0,0,0,0.45)',

        buttonText: 'rgba(0,0,0,0.45)',
        buttonHoverBg: 'rgba(0,0,0,0.02)',
        buttonHoverText: '#000000',
        primaryButtonBg: 'linear-gradient(135deg, #0071E3 0%, #0066CC 100%)',
        primaryButtonText: '#FFFFFF',
        primaryButtonShadow: '0 2px 8px rgba(0,113,227,0.2)',

        accent: '#0071E3',
        accentLight: 'rgba(0,113,227,0.08)',
      };

    case 'refined':
      // Refined: Editorial luxury, warm dark, sage accents
      return {
        windowBg: 'linear-gradient(180deg, rgba(28,28,28,0.98) 0%, rgba(21,21,21,0.96) 100%)',
        windowShadow: '0 24px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        windowShadowInactive: '0 16px 48px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
        windowBorder: 'rgba(255,255,255,0.05)',

        titleBarBg: 'linear-gradient(180deg, rgba(32,32,32,1) 0%, rgba(24,24,24,1) 100%)',
        titleBarBorder: 'rgba(255,255,255,0.05)',
        titleText: '#f5f5f0',
        iconColor: '#cae8bd',

        sidebarBg: 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(18,18,18,1) 100%)',
        sidebarBorder: 'rgba(255,255,255,0.05)',
        searchBg: 'rgba(255,255,255,0.03)',
        searchBgFocused: 'rgba(202,232,189,0.08)',
        searchBorder: 'transparent',
        searchBorderFocused: 'rgba(202,232,189,0.3)',
        searchShadowFocused: '0 0 0 3px rgba(202,232,189,0.1)',
        searchIcon: 'rgba(245,245,240,0.25)',
        searchIconFocused: '#cae8bd',
        searchText: '#f5f5f0',

        folderText: '#f5f5f0',
        folderCount: 'rgba(245,245,240,0.35)',
        folderHoverBg: 'rgba(255,255,255,0.03)',

        noteCardBg: 'rgba(255,255,255,0.03)',
        noteCardShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 0.5px 0 rgba(255,255,255,0.03)',
        noteCardHoverShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.05)',
        noteCardSelectedBg: 'linear-gradient(135deg, #cae8bd 0%, #b8d9a8 100%)',
        noteCardSelectedShadow: '0 4px 16px rgba(202,232,189,0.25)',
        noteTitle: '#f5f5f0',
        noteTitleSelected: '#0d0d0d',
        noteDate: '#cae8bd',
        noteDateSelected: 'rgba(13,13,13,0.7)',
        notePreview: 'rgba(245,245,240,0.45)',
        notePreviewSelected: 'rgba(13,13,13,0.6)',
        noteDot: 'rgba(255,255,255,0.1)',
        noteDotSelected: 'rgba(13,13,13,0.3)',

        contentBg: 'linear-gradient(180deg, rgba(21,21,21,1) 0%, rgba(15,15,15,1) 100%)',
        contentHeaderBg: 'linear-gradient(180deg, rgba(202,232,189,0.03) 0%, transparent 100%)',
        contentBorder: 'rgba(255,255,255,0.03)',
        contentTitle: '#f5f5f0',
        contentMeta: 'rgba(245,245,240,0.35)',
        contentText: 'rgba(245,245,240,0.85)',

        emptyBg: 'linear-gradient(135deg, rgba(202,232,189,0.1) 0%, rgba(202,232,189,0.04) 100%)',
        emptyShadow: '0 8px 24px rgba(202,232,189,0.08)',
        emptyIconColor: '#cae8bd',
        emptyTitle: '#f5f5f0',
        emptyText: 'rgba(245,245,240,0.45)',

        buttonText: 'rgba(245,245,240,0.45)',
        buttonHoverBg: 'rgba(255,255,255,0.04)',
        buttonHoverText: '#f5f5f0',
        primaryButtonBg: 'linear-gradient(135deg, #cae8bd 0%, #b8d9a8 100%)',
        primaryButtonText: '#0d0d0d',
        primaryButtonShadow: '0 4px 12px rgba(202,232,189,0.2)',

        accent: '#cae8bd',
        accentLight: 'rgba(202,232,189,0.1)',
      };

    case 'warm':
      // Warm: Organic, stone, paper-like, editorial
      return {
        windowBg: '#FAFAF9',
        windowShadow: '0 24px 60px -12px rgba(28,25,23,0.15), 0 0 0 1px rgba(28,25,23,0.05)',
        windowShadowInactive: '0 12px 32px -8px rgba(28,25,23,0.1), 0 0 0 1px rgba(28,25,23,0.04)',
        windowBorder: 'rgba(28,25,23,0.05)',

        titleBarBg: '#F5F5F4',
        titleBarBorder: 'rgba(28,25,23,0.06)',
        titleText: '#1C1917',
        iconColor: '#EA580C',

        sidebarBg: '#F5F5F4',
        sidebarBorder: 'rgba(28,25,23,0.06)',
        searchBg: 'rgba(28,25,23,0.04)',
        searchBgFocused: '#FFFFFF',
        searchBorder: 'transparent',
        searchBorderFocused: 'rgba(234,88,12,0.3)',
        searchShadowFocused: '0 0 0 3px rgba(234,88,12,0.1)',
        searchIcon: '#A8A29E',
        searchIconFocused: '#EA580C',
        searchText: '#1C1917',

        folderText: '#44403C',
        folderCount: '#A8A29E',
        folderHoverBg: 'rgba(28,25,23,0.04)',

        noteCardBg: '#FFFFFF',
        noteCardShadow: '0 1px 2px rgba(28,25,23,0.06), 0 0 0 1px rgba(28,25,23,0.04)',
        noteCardHoverShadow: '0 4px 12px rgba(28,25,23,0.08), 0 0 0 1px rgba(28,25,23,0.06)',
        noteCardSelectedBg: '#FFFFFF',
        noteCardSelectedShadow: '0 8px 20px -4px rgba(234,88,12,0.15), 0 0 0 1.5px #EA580C',
        noteTitle: '#1C1917',
        noteTitleSelected: '#EA580C',
        noteDate: '#EA580C',
        noteDateSelected: '#EA580C',
        notePreview: '#78716C',
        notePreviewSelected: '#78716C',
        noteDot: 'rgba(28,25,23,0.1)',
        noteDotSelected: '#EA580C',

        contentBg: '#FAFAF9',
        contentHeaderBg: 'linear-gradient(180deg, rgba(245,245,244,0.5) 0%, transparent 100%)',
        contentBorder: 'rgba(28,25,23,0.04)',
        contentTitle: '#1C1917',
        contentMeta: '#78716C',
        contentText: '#1C1917',

        emptyBg: 'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(234,88,12,0.03) 100%)',
        emptyShadow: '0 8px 24px rgba(234,88,12,0.08)',
        emptyIconColor: '#EA580C',
        emptyTitle: '#1C1917',
        emptyText: '#78716C',

        buttonText: '#78716C',
        buttonHoverBg: 'rgba(28,25,23,0.05)',
        buttonHoverText: '#1C1917',
        primaryButtonBg: '#EA580C',
        primaryButtonText: '#FFFFFF',
        primaryButtonShadow: '0 4px 12px rgba(234,88,12,0.3)',

        accent: '#EA580C',
        accentLight: 'rgba(234,88,12,0.1)',
      };

    case 'monterey':
    default:
      // Monterey: Classic macOS, warm orange Notes accent
      return {
        windowBg: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,252,0.96) 100%)',
        windowShadow: '0 32px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.8)',
        windowShadowInactive: '0 20px 50px -15px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.08)',
        windowBorder: 'rgba(255,255,255,0.3)',

        titleBarBg: 'linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(247,247,250,1) 100%)',
        titleBarBorder: 'rgba(0,0,0,0.08)',
        titleText: '#1D1D1F',
        iconColor: '#FF9500',

        sidebarBg: 'linear-gradient(180deg, #F9F9FB 0%, #F4F4F6 100%)',
        sidebarBorder: 'rgba(0,0,0,0.08)',
        searchBg: 'rgba(0,0,0,0.04)',
        searchBgFocused: 'white',
        searchBorder: 'transparent',
        searchBorderFocused: 'rgba(255,149,0,0.4)',
        searchShadowFocused: '0 0 0 3px rgba(255,149,0,0.15), 0 1px 3px rgba(0,0,0,0.08)',
        searchIcon: '#AEAEB2',
        searchIconFocused: '#FF9500',
        searchText: '#1D1D1F',

        folderText: '#1D1D1F',
        folderCount: '#86868B',
        folderHoverBg: 'rgba(0,0,0,0.04)',

        noteCardBg: 'white',
        noteCardShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        noteCardHoverShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
        noteCardSelectedBg: 'linear-gradient(135deg, #FF9500 0%, #FF8C00 100%)',
        noteCardSelectedShadow: '0 4px 12px rgba(255,149,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        noteTitle: '#1D1D1F',
        noteTitleSelected: 'white',
        noteDate: '#FF9500',
        noteDateSelected: 'rgba(255,255,255,0.85)',
        notePreview: '#86868B',
        notePreviewSelected: 'rgba(255,255,255,0.8)',
        noteDot: 'rgba(0,0,0,0.15)',
        noteDotSelected: 'rgba(255,255,255,0.5)',

        contentBg: 'linear-gradient(180deg, #FFFFFF 0%, #FEFEFE 100%)',
        contentHeaderBg: 'linear-gradient(180deg, rgba(255,248,240,0.3) 0%, transparent 100%)',
        contentBorder: 'rgba(0,0,0,0.04)',
        contentTitle: '#1D1D1F',
        contentMeta: '#86868B',
        contentText: '#1D1D1F',

        emptyBg: 'linear-gradient(135deg, #FFF5E6 0%, #FFE5CC 100%)',
        emptyShadow: '0 8px 24px rgba(255,149,0,0.15), inset 0 2px 0 rgba(255,255,255,0.8)',
        emptyIconColor: '#FF9500',
        emptyTitle: '#1D1D1F',
        emptyText: '#86868B',

        buttonText: '#86868B',
        buttonHoverBg: 'rgba(0,0,0,0.04)',
        buttonHoverText: '#1D1D1F',
        primaryButtonBg: 'linear-gradient(135deg, #FF9500 0%, #FF8C00 100%)',
        primaryButtonText: 'white',
        primaryButtonShadow: '0 4px 12px rgba(255,149,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',

        accent: '#FF9500',
        accentLight: 'rgba(255,149,0,0.1)',
      };
  }
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

  // Get theme-specific colors
  const colors = useMemo(() => getThemeColors(themeContext?.theme), [themeContext?.theme]);
  const isDark = themeContext?.isDark ?? false;

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
              borderBottom: `1px solid ${colors.titleBarBorder}`,
              cursor: isMaximized ? 'default' : 'grab',
            }}
          >
            {/* Traffic Lights */}
            <div
              className="flex items-center gap-2 group/traffic"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => windowContext.closeWindow(windowInstance.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-all duration-150 hover:brightness-90 active:scale-90"
                style={{
                  background: 'linear-gradient(180deg, #FF5F57 0%, #E0443E 100%)',
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                }}
                aria-label="Close window"
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
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                }}
                aria-label="Minimize window"
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
                  boxShadow: '0 0.5px 1px rgba(0, 0, 0, 0.12), inset 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                }}
                aria-label="Maximize window"
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0,70,0,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
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
          </div>

          {/* ═══════════════════════════════════════════════════════
              MAIN CONTENT AREA
              ═══════════════════════════════════════════════════════ */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* ═══════════════════════════════════════════════════════
                SIDEBAR
                ═══════════════════════════════════════════════════════ */}
            <AnimatePresence initial={false}>
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
                            <path d="M4 4L8 8M8 4L4 8" stroke={isDark ? 'black' : 'white'} strokeWidth="1.2" strokeLinecap="round" />
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
              )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════
                NOTE CONTENT AREA
                ═══════════════════════════════════════════════════════ */}
            <div
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
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
