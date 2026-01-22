'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { useThemeSafe, ThemeId } from '@/contexts/ThemeContext';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { EditableBlockRenderer } from '@/components/editing/EditableBlockRenderer';
import { haptic } from '@/components/ui/Delight';

interface PagesWindowProps {
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
  iconBg: string;
  iconColor: string;

  // Sidebar
  sidebarBg: string;
  sidebarBorder: string;
  sectionHeader: string;
  sectionItemBg: string;
  sectionItemSelectedBg: string;
  sectionItemText: string;
  sectionItemSelectedText: string;
  sectionNumber: string;
  sectionNumberBg: string;
  sectionNumberSelectedBg: string;

  // Content
  contentBg: string;
  contentText: string;
  contentTitle: string;
  contentSubtitle: string;
  contentBorder: string;

  // Progress
  progressBg: string;
  progressFill: string;
  progressText: string;

  // Buttons
  buttonText: string;
  buttonHoverBg: string;
  buttonDisabledText: string;

  // Empty state
  emptyBg: string;
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
    windowBg: 'var(--color-bg-base, #fbf9ef)',
    windowShadow: 'var(--shadow-window, 0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08))',
    windowShadowInactive: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
    windowBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',

    titleBarBg: 'var(--color-bg-base, #fbf9ef)',
    titleBarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    titleText: 'var(--color-text-primary, #171412)',
    iconBg: 'var(--color-accent-primary, #ff7722)',
    iconColor: 'var(--color-bg-white, #ffffff)',

    sidebarBg: 'var(--color-bg-subtle, #f2f0e7)',
    sidebarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    sectionHeader: 'var(--color-text-muted, #8e827c)',
    sectionItemBg: 'transparent',
    sectionItemSelectedBg: 'var(--color-accent-primary, #ff7722)',
    sectionItemText: 'var(--color-text-primary, #171412)',
    sectionItemSelectedText: 'var(--color-bg-white, #ffffff)',
    sectionNumber: 'var(--color-text-muted, #8e827c)',
    sectionNumberBg: 'rgba(23, 20, 18, 0.04)',
    sectionNumberSelectedBg: 'rgba(255, 255, 255, 0.2)',

    contentBg: 'var(--color-bg-base, #fbf9ef)',
    contentText: 'var(--color-text-primary, #171412)',
    contentTitle: 'var(--color-text-primary, #171412)',
    contentSubtitle: 'var(--color-text-muted, #8e827c)',
    contentBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',

    progressBg: 'rgba(23, 20, 18, 0.04)',
    progressFill: 'var(--color-accent-primary, #ff7722)',
    progressText: 'var(--color-text-muted, #8e827c)',

    buttonText: 'var(--color-text-muted, #8e827c)',
    buttonHoverBg: 'rgba(255, 119, 34, 0.08)',
    buttonDisabledText: 'rgba(23, 20, 18, 0.2)',

    emptyBg: 'rgba(255, 119, 34, 0.06)',
    emptyIcon: 'var(--color-text-muted, #8e827c)',
    emptyTitle: 'var(--color-text-primary, #171412)',
    emptyText: 'var(--color-text-muted, #8e827c)',

    accent: 'var(--color-accent-primary, #ff7722)',
  };
}

export function PagesWindow({ window: windowInstance, item }: PagesWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const themeContext = useThemeSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const isOwner = context?.isOwner ?? false;
  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';

  // Get theme-specific colors (unified design system)
  const colors = useMemo(() => getThemeColors(themeContext?.theme), [themeContext?.theme]);

  // Use tabs as document sections/chapters
  const sections = item.useTabs && item.tabs?.length > 0
    ? item.tabs.map(t => ({ id: t.id, label: t.label, blocks: t.blocks }))
    : [{ id: 'main', label: item.windowTitle, blocks: item.blocks || [] }];

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

  // Get blocks for current section
  const currentBlocks = sections[activeSection]?.blocks || [];
  const sortedBlocks = [...currentBlocks].sort((a, b) => a.order - b.order);

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

  const handleSectionChange = (index: number) => {
    setActiveSection(index);
    haptic('light');
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculate read progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
      setReadProgress(progress || 0);
    };

    const content = contentRef.current;
    content?.addEventListener('scroll', handleScroll);
    return () => content?.removeEventListener('scroll', handleScroll);
  }, []);

  // Estimate reading time
  const estimateReadTime = () => {
    const totalBlocks = sections.reduce((acc, s) => acc + s.blocks.length, 0);
    return Math.max(1, Math.ceil(totalBlocks * 0.5));
  };

  const windowWidth = Math.max(item.windowWidth || 780, 640);

  return (
    <>
      {/* Drag constraints */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 z-[199] pointer-events-none"
        style={{ padding: isMaximized ? '28px 0 0 0' : '40px' }}
      />

      {/* Pages Window */}
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
            damping: 30,
            mass: 0.8
          }}
        >
          {/* Title Bar */}
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

            {/* Document Icon & Title */}
            <div className="flex items-center gap-2.5 ml-4">
              <div
                className="w-5 h-6 rounded flex items-center justify-center"
                style={{
                  background: colors.iconBg,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill={colors.iconColor}>
                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z" />
                  <path d="M8 8h8v2H8V8zm0 4h8v2H8v-2z" />
                </svg>
              </div>
              <span
                className="text-[13px] font-semibold truncate max-w-[200px]"
                style={{ color: colors.titleText }}
              >
                {item.windowTitle}
              </span>
            </div>

            {/* Toolbar */}
            <div className="ml-auto flex items-center gap-1">
              {sections.length > 1 && (
                <button
                  onClick={() => setShowTableOfContents(!showTableOfContents)}
                  className="p-2 rounded-md transition-colors"
                  style={{
                    color: showTableOfContents ? colors.accent : colors.buttonText,
                    background: showTableOfContents ? colors.buttonHoverBg : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!showTableOfContents) {
                      e.currentTarget.style.background = colors.buttonHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showTableOfContents) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  aria-label="Toggle table of contents"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Reading Progress Bar */}
          <div className="h-[2px] shrink-0" style={{ background: colors.progressBg }}>
            <motion.div
              className="h-full"
              style={{
                background: colors.progressFill,
                width: `${readProgress}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Table of Contents Sidebar */}
            <AnimatePresence initial={false}>
              {showTableOfContents && sections.length > 1 && (
                <motion.div
                  className="shrink-0 flex flex-col overflow-hidden"
                  style={{
                    background: colors.sidebarBg,
                    borderRight: `1px solid ${colors.sidebarBorder}`,
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="p-4 flex-1 overflow-y-auto">
                    <h3
                      className="text-[11px] font-semibold uppercase tracking-wider mb-3"
                      style={{ color: colors.sectionHeader, letterSpacing: '0.05em' }}
                    >
                      Contents
                    </h3>
                    <nav className="space-y-1">
                      {sections.map((section, index) => {
                        const isSelected = activeSection === index;
                        return (
                          <motion.button
                            key={section.id}
                            onClick={() => handleSectionChange(index)}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all"
                            style={{
                              background: isSelected ? colors.sectionItemSelectedBg : colors.sectionItemBg,
                              color: isSelected ? colors.sectionItemSelectedText : colors.sectionItemText,
                              fontWeight: isSelected ? 600 : 400,
                              boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                            whileHover={!isSelected ? { background: colors.buttonHoverBg } : {}}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className="text-[11px] font-medium w-5 h-5 rounded flex items-center justify-center"
                                style={{
                                  background: isSelected ? colors.sectionNumberSelectedBg : colors.sectionNumberBg,
                                  color: isSelected ? colors.sectionItemSelectedText : colors.sectionNumber,
                                }}
                              >
                                {index + 1}
                              </span>
                              <span className="truncate">{section.label}</span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Reading Stats */}
                  <div
                    className="p-4 shrink-0"
                    style={{ borderTop: `1px solid ${colors.sidebarBorder}` }}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span style={{ color: colors.progressText }}>Progress</span>
                      <span style={{ color: colors.sectionItemText, fontWeight: 500 }}>
                        {Math.round(readProgress)}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: colors.progressBg }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${readProgress}%`,
                          background: colors.progressFill,
                        }}
                      />
                    </div>
                    <p
                      className="text-[10px] mt-2"
                      style={{ color: colors.progressText }}
                    >
                      ~{estimateReadTime()} min read
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto"
              style={{ background: colors.contentBg }}
            >
              {/* Document Paper */}
              <div className="max-w-[640px] mx-auto px-10 py-10">
                {/* Header Image */}
                {item.windowHeaderImage && (
                  <motion.div
                    className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8"
                    style={{
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.3 }}
                  >
                    <Image
                      src={item.windowHeaderImage}
                      alt={item.windowTitle}
                      fill
                      className="object-cover"
                      sizes="640px"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)',
                      }}
                    />
                  </motion.div>
                )}

                {/* Title & Subtitle */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h1
                    className="text-[32px] font-bold leading-tight mb-3"
                    style={{
                      color: colors.contentTitle,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {sections.length > 1 ? sections[activeSection].label : item.windowTitle}
                  </h1>
                  {item.windowSubtitle && (
                    <p
                      className="text-[16px] leading-relaxed"
                      style={{ color: colors.contentSubtitle }}
                    >
                      {item.windowSubtitle}
                    </p>
                  )}
                </motion.div>

                {/* Content Divider */}
                <motion.div
                  className="mb-8"
                  style={{ height: '1px', background: colors.contentBorder }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                />

                {/* Blocks */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: colors.contentText }}
                  >
                    {sortedBlocks.length > 0 ? (
                      sortedBlocks.map((block, index) => (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * Math.min(index, 8), duration: 0.25 }}
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
                      ))
                    ) : (
                      <motion.div
                        className="flex flex-col items-center justify-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                          style={{
                            background: colors.emptyBg,
                            boxShadow: `inset 0 0 0 1px ${colors.contentBorder}`,
                          }}
                        >
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.2}
                            style={{ color: colors.emptyIcon }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <h3
                          className="text-[15px] font-semibold mb-1"
                          style={{ color: colors.emptyTitle }}
                        >
                          No content yet
                        </h3>
                        <p
                          className="text-[13px] text-center max-w-[240px]"
                          style={{ color: colors.emptyText }}
                        >
                          Add blocks to build your document.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Section Navigation */}
                {sections.length > 1 && (
                  <motion.div
                    className="flex items-center justify-between mt-12 pt-8"
                    style={{ borderTop: `1px solid ${colors.contentBorder}` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => handleSectionChange(Math.max(0, activeSection - 1))}
                      disabled={activeSection === 0}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all disabled:opacity-30"
                      style={{ color: colors.buttonText }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <span
                      className="text-[12px] font-medium"
                      style={{ color: colors.progressText }}
                    >
                      {activeSection + 1} / {sections.length}
                    </span>

                    <button
                      onClick={() => handleSectionChange(Math.min(sections.length - 1, activeSection + 1))}
                      disabled={activeSection === sections.length - 1}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all disabled:opacity-30"
                      style={{ color: colors.buttonText }}
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </motion.div>
                )}

                {/* End of Document */}
                <motion.div
                  className="flex items-center justify-center py-10 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: colors.progressText }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
