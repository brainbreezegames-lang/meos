'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Archive, ArchiveRestore, Trash2, Calendar, Image as ImageIcon, X } from 'lucide-react';
import type { DesktopItem, WorkbenchEntry } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { useThemeSafe, ThemeId } from '@/contexts/ThemeContext';

interface WorkbenchWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

interface ThemeColors {
  windowBg: string;
  windowShadow: string;
  windowShadowInactive: string;
  titleBarBg: string;
  titleBarBorder: string;
  titleText: string;
  iconColor: string;
  contentBg: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardSelectedBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  buttonBg: string;
  buttonHoverBg: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  emptyBg: string;
}

function getThemeColors(themeId: ThemeId | undefined): ThemeColors {
  const isDark = themeId === 'dark' || themeId === 'refined';

  if (themeId === 'dark') {
    return {
      windowBg: 'linear-gradient(180deg, rgba(32,32,38,0.98) 0%, rgba(22,22,26,0.96) 100%)',
      windowShadow: '0 35px 80px -20px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.08)',
      windowShadowInactive: '0 20px 50px -15px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.05)',
      titleBarBg: 'linear-gradient(180deg, rgba(40,40,48,1) 0%, rgba(32,32,38,1) 100%)',
      titleBarBorder: 'rgba(255,255,255,0.06)',
      titleText: '#F8F8FA',
      iconColor: '#5BA0FF',
      contentBg: 'rgba(22,22,26,1)',
      cardBg: 'rgba(255,255,255,0.04)',
      cardBorder: 'rgba(255,255,255,0.06)',
      cardHoverBorder: 'rgba(255,255,255,0.12)',
      cardSelectedBorder: '#5BA0FF',
      textPrimary: '#F8F8FA',
      textSecondary: '#94949C',
      textTertiary: '#56565C',
      accent: '#5BA0FF',
      accentLight: 'rgba(91,160,255,0.15)',
      buttonBg: 'rgba(255,255,255,0.06)',
      buttonHoverBg: 'rgba(255,255,255,0.1)',
      inputBg: 'rgba(255,255,255,0.06)',
      inputBorder: 'rgba(255,255,255,0.08)',
      inputFocusBorder: 'rgba(91,160,255,0.5)',
      emptyBg: 'linear-gradient(135deg, rgba(91,160,255,0.1) 0%, rgba(91,160,255,0.05) 100%)',
    };
  }

  if (themeId === 'refined') {
    return {
      windowBg: 'linear-gradient(180deg, rgba(28,28,28,0.98) 0%, rgba(21,21,21,0.96) 100%)',
      windowShadow: '0 24px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      windowShadowInactive: '0 16px 48px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
      titleBarBg: 'linear-gradient(180deg, rgba(32,32,32,1) 0%, rgba(24,24,24,1) 100%)',
      titleBarBorder: 'rgba(255,255,255,0.05)',
      titleText: '#f5f5f0',
      iconColor: '#cae8bd',
      contentBg: 'rgba(21,21,21,1)',
      cardBg: 'rgba(255,255,255,0.03)',
      cardBorder: 'rgba(255,255,255,0.05)',
      cardHoverBorder: 'rgba(255,255,255,0.1)',
      cardSelectedBorder: '#cae8bd',
      textPrimary: '#f5f5f0',
      textSecondary: 'rgba(245,245,240,0.6)',
      textTertiary: 'rgba(245,245,240,0.35)',
      accent: '#cae8bd',
      accentLight: 'rgba(202,232,189,0.1)',
      buttonBg: 'rgba(255,255,255,0.04)',
      buttonHoverBg: 'rgba(255,255,255,0.08)',
      inputBg: 'rgba(255,255,255,0.04)',
      inputBorder: 'rgba(255,255,255,0.06)',
      inputFocusBorder: 'rgba(202,232,189,0.4)',
      emptyBg: 'linear-gradient(135deg, rgba(202,232,189,0.08) 0%, rgba(202,232,189,0.03) 100%)',
    };
  }

  if (themeId === 'bluren') {
    return {
      windowBg: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 100%)',
      windowShadow: '0 16px 48px -8px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.04)',
      windowShadowInactive: '0 8px 32px -8px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.03)',
      titleBarBg: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(252,252,254,1) 100%)',
      titleBarBorder: 'rgba(0,0,0,0.04)',
      titleText: '#000000',
      iconColor: '#0071E3',
      contentBg: '#FEFEFE',
      cardBg: 'rgba(255,255,255,0.9)',
      cardBorder: 'rgba(0,0,0,0.04)',
      cardHoverBorder: 'rgba(0,0,0,0.08)',
      cardSelectedBorder: '#0071E3',
      textPrimary: '#000000',
      textSecondary: 'rgba(0,0,0,0.55)',
      textTertiary: 'rgba(0,0,0,0.35)',
      accent: '#0071E3',
      accentLight: 'rgba(0,113,227,0.08)',
      buttonBg: 'rgba(0,0,0,0.04)',
      buttonHoverBg: 'rgba(0,0,0,0.06)',
      inputBg: 'rgba(0,0,0,0.03)',
      inputBorder: 'rgba(0,0,0,0.06)',
      inputFocusBorder: 'rgba(0,113,227,0.4)',
      emptyBg: 'linear-gradient(135deg, rgba(0,113,227,0.06) 0%, rgba(0,113,227,0.02) 100%)',
    };
  }

  // Monterey default
  return {
    windowBg: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,252,0.96) 100%)',
    windowShadow: '0 32px 80px -20px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.8)',
    windowShadowInactive: '0 20px 50px -15px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.08)',
    titleBarBg: 'linear-gradient(180deg, rgba(253,253,253,1) 0%, rgba(247,247,250,1) 100%)',
    titleBarBorder: 'rgba(0,0,0,0.08)',
    titleText: '#1D1D1F',
    iconColor: '#A855F7',
    contentBg: '#FAFAFA',
    cardBg: 'white',
    cardBorder: 'rgba(0,0,0,0.06)',
    cardHoverBorder: 'rgba(0,0,0,0.12)',
    cardSelectedBorder: '#A855F7',
    textPrimary: '#1D1D1F',
    textSecondary: '#6B6B6B',
    textTertiary: '#86868B',
    accent: '#A855F7',
    accentLight: 'rgba(168,85,247,0.1)',
    buttonBg: 'rgba(0,0,0,0.04)',
    buttonHoverBg: 'rgba(0,0,0,0.06)',
    inputBg: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.08)',
    inputFocusBorder: 'rgba(168,85,247,0.4)',
    emptyBg: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0.03) 100%)',
  };
}

export function WorkbenchWindow({ window: windowInstance, item }: WorkbenchWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const themeContext = useThemeSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', description: '', imageUrl: '', context: '' });

  const isOwner = context?.isOwner ?? false;
  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';
  const colors = useMemo(() => getThemeColors(themeContext?.theme), [themeContext?.theme]);

  // Get workbench entries from desktop context
  const allEntries = context?.desktop?.workbenchEntries || [];
  const entries = showArchived
    ? allEntries.filter(e => e.isArchived)
    : allEntries.filter(e => !e.isArchived);

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const selectedEntry = sortedEntries.find(e => e.id === selectedEntryId);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        if (isAddingEntry) {
          setIsAddingEntry(false);
        } else if (selectedEntryId) {
          setSelectedEntryId(null);
        } else {
          windowContext.closeWindow(windowInstance.id);
        }
      }
    },
    [windowContext, windowInstance.id, isActive, isAddingEntry, selectedEntryId]
  );

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handleAddEntry = () => {
    if (!context || !newEntry.title.trim()) return;

    context.addWorkbenchEntry({
      title: newEntry.title,
      description: newEntry.description || null,
      imageUrl: newEntry.imageUrl || null,
      context: newEntry.context || null,
      isArchived: false,
    });

    setNewEntry({ title: '', description: '', imageUrl: '', context: '' });
    setIsAddingEntry(false);
  };

  const handleArchiveEntry = (entryId: string) => {
    if (!context) return;
    const entry = allEntries.find(e => e.id === entryId);
    if (entry) {
      context.updateWorkbenchEntry(entryId, { isArchived: !entry.isArchived });
      if (selectedEntryId === entryId) setSelectedEntryId(null);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!context) return;
    context.deleteWorkbenchEntry(entryId);
    if (selectedEntryId === entryId) setSelectedEntryId(null);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const windowWidth = Math.max(item.windowWidth || 720, 600);

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
            minHeight: 480,
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
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0,70,0,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: colors.iconColor }}>
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] font-medium" style={{ color: colors.titleText }}>
                {item.windowTitle || 'Now Thinking'}
              </span>
            </div>

            {/* Toolbar */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="p-2 rounded-md transition-all duration-150"
                style={{
                  color: showArchived ? colors.accent : colors.textTertiary,
                  background: showArchived ? colors.accentLight : 'transparent',
                }}
              >
                <Archive size={16} />
              </button>
              {isOwner && (
                <button
                  onClick={() => setIsAddingEntry(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: colors.accent,
                    color: 'white',
                  }}
                >
                  <Plus size={14} />
                  Add Entry
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ background: colors.contentBg }}
          >
            {/* Add Entry Form */}
            <AnimatePresence>
              {isAddingEntry && (
                <motion.div
                  className="mb-6 p-5 rounded-xl"
                  style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-semibold" style={{ color: colors.textPrimary }}>
                      New Workbench Entry
                    </h3>
                    <button onClick={() => setIsAddingEntry(false)} style={{ color: colors.textTertiary }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="What are you working on?"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
                      style={{
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        color: colors.textPrimary,
                      }}
                    />
                    <textarea
                      placeholder="Brief description (optional)"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all resize-none"
                      style={{
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        color: colors.textPrimary,
                      }}
                    />
                    <input
                      type="url"
                      placeholder="Image URL (optional)"
                      value={newEntry.imageUrl}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all"
                      style={{
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        color: colors.textPrimary,
                      }}
                    />
                    <textarea
                      placeholder="Context / deeper thoughts (optional)"
                      value={newEntry.context}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, context: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg text-[14px] outline-none transition-all resize-none"
                      style={{
                        background: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        color: colors.textPrimary,
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsAddingEntry(false)}
                        className="px-4 py-2 rounded-lg text-[13px] font-medium"
                        style={{ color: colors.textSecondary }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEntry}
                        disabled={!newEntry.title.trim()}
                        className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-50"
                        style={{ background: colors.accent, color: 'white' }}
                      >
                        Add Entry
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline */}
            {sortedEntries.length > 0 ? (
              <div className="space-y-4">
                {sortedEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className="p-5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: colors.cardBg,
                      border: `1px solid ${selectedEntryId === entry.id ? colors.cardSelectedBorder : colors.cardBorder}`,
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedEntryId(selectedEntryId === entry.id ? null : entry.id)}
                    whileHover={{ borderColor: colors.cardHoverBorder }}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      {entry.imageUrl && (
                        <div
                          className="w-24 h-24 rounded-lg shrink-0 overflow-hidden"
                          style={{ background: colors.inputBg }}
                        >
                          <img
                            src={entry.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
                            {entry.title}
                          </h3>
                          <span
                            className="text-[11px] font-medium shrink-0 flex items-center gap-1"
                            style={{ color: colors.textTertiary }}
                          >
                            <Calendar size={12} />
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>

                        {entry.description && (
                          <p
                            className="text-[13px] leading-relaxed mb-2"
                            style={{ color: colors.textSecondary }}
                          >
                            {entry.description}
                          </p>
                        )}

                        {/* Expanded context */}
                        <AnimatePresence>
                          {selectedEntryId === entry.id && entry.context && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3"
                              style={{ borderTop: `1px solid ${colors.cardBorder}` }}
                            >
                              <p
                                className="text-[13px] leading-relaxed"
                                style={{ color: colors.textPrimary }}
                              >
                                {entry.context}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Owner actions */}
                        {isOwner && selectedEntryId === entry.id && (
                          <motion.div
                            className="flex items-center gap-2 mt-4 pt-3"
                            style={{ borderTop: `1px solid ${colors.cardBorder}` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); handleArchiveEntry(entry.id); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                              style={{ background: colors.buttonBg, color: colors.textSecondary }}
                            >
                              {entry.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                              {entry.isArchived ? 'Restore' : 'Archive'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <motion.div
                className="flex flex-col items-center justify-center py-20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: colors.emptyBg }}
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" style={{ color: colors.accent }}>
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.2" />
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-[16px] font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  {showArchived ? 'No archived entries' : 'Your workbench is empty'}
                </h3>
                <p className="text-[13px] text-center max-w-[260px]" style={{ color: colors.textSecondary }}>
                  {showArchived
                    ? 'Entries you archive will appear here'
                    : 'Share what you\'re working on, thinking about, or exploring'}
                </p>
                {isOwner && !showArchived && (
                  <button
                    onClick={() => setIsAddingEntry(true)}
                    className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium"
                    style={{ background: colors.accent, color: 'white' }}
                  >
                    <Plus size={16} />
                    Add Your First Entry
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 flex items-center justify-between shrink-0"
            style={{ borderTop: `1px solid ${colors.cardBorder}` }}
          >
            <span className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>
              {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'}
              {showArchived ? ' (archived)' : ''}
            </span>
            <span className="text-[11px]" style={{ color: colors.textTertiary }}>
              {item.windowSubtitle || 'Work in progress'}
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}
