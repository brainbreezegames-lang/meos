'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import type { DesktopItem } from '@/types';
import { useEditContextSafe } from '@/contexts/EditContext';
import { useWindowContext, WindowInstance } from '@/contexts/WindowContext';
import { useThemeSafe, ThemeId } from '@/contexts/ThemeContext';
import { haptic } from '@/components/ui/Delight';

interface PhotosWindowProps {
  window: WindowInstance;
  item: DesktopItem;
}

interface PhotoItem {
  id: string;
  url: string;
  alt: string;
  date?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME-AWARE STYLING - Apple Photos inspired design
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
  badgeBg: string;
  badgeText: string;

  // Toolbar
  toolbarBg: string;
  toolbarBorder: string;
  toolbarText: string;
  toolbarHoverBg: string;
  toolbarActiveBg: string;
  toolbarActiveText: string;

  // Content
  contentBg: string;
  photoCardBg: string;
  photoCardShadow: string;
  photoCardHoverShadow: string;
  photoOverlay: string;

  // Empty state
  emptyBg: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyText: string;

  // Lightbox
  lightboxBg: string;
  lightboxText: string;
  lightboxButtonBg: string;
  lightboxButtonHoverBg: string;

  // Accent
  accent: string;
  favoriteColor: string;
}

// Unified design system - uses CSS variables from design-system.css
function getThemeColors(_themeId: ThemeId | undefined): ThemeColors {
  // ONE design system - Appart theme via CSS variables
  return {
    windowBg: 'var(--color-bg-base, #fbf9ef)',
    windowShadow: 'var(--shadow-window, 0 2px 4px rgba(23, 20, 18, 0.04), 0 12px 32px rgba(23, 20, 18, 0.12), 0 24px 60px rgba(23, 20, 18, 0.08))',
    windowShadowInactive: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',

    titleBarBg: 'var(--color-bg-base, #fbf9ef)',
    titleBarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    titleText: 'var(--color-text-primary, #171412)',
    badgeBg: 'rgba(255, 119, 34, 0.1)',
    badgeText: 'var(--color-accent-primary, #ff7722)',

    toolbarBg: 'var(--color-bg-subtle, #f2f0e7)',
    toolbarBorder: 'var(--color-border-default, rgba(23, 20, 18, 0.08))',
    toolbarText: 'var(--color-text-muted, #8e827c)',
    toolbarHoverBg: 'rgba(255, 119, 34, 0.08)',
    toolbarActiveBg: 'var(--color-accent-primary, #ff7722)',
    toolbarActiveText: 'var(--color-bg-white, #ffffff)',

    contentBg: 'var(--color-bg-base, #fbf9ef)',
    photoCardBg: 'var(--color-bg-white, #ffffff)',
    photoCardShadow: 'var(--shadow-sm, 0 2px 8px rgba(23, 20, 18, 0.06))',
    photoCardHoverShadow: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
    photoOverlay: 'linear-gradient(180deg, transparent 60%, rgba(23, 20, 18, 0.6) 100%)',

    emptyBg: 'rgba(255, 119, 34, 0.06)',
    emptyIcon: 'var(--color-text-muted, #8e827c)',
    emptyTitle: 'var(--color-text-primary, #171412)',
    emptyText: 'var(--color-text-muted, #8e827c)',

    lightboxBg: 'rgba(251, 249, 239, 0.98)',
    lightboxText: 'var(--color-text-primary, #171412)',
    lightboxButtonBg: 'rgba(23, 20, 18, 0.08)',
    lightboxButtonHoverBg: 'rgba(23, 20, 18, 0.15)',

    accent: 'var(--color-accent-primary, #ff7722)',
    favoriteColor: 'var(--color-accent-primary, #ff7722)',
  };
}

export function PhotosWindow({ window: windowInstance, item }: PhotosWindowProps) {
  const context = useEditContextSafe();
  const windowContext = useWindowContext();
  const themeContext = useThemeSafe();
  const windowRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  const isActive = windowContext.activeWindowId === windowInstance.id;
  const isMaximized = windowInstance.state === 'maximized';
  // Unified design system - no theme-specific checks needed

  const colors = useMemo(() => getThemeColors(themeContext?.theme), [themeContext?.theme]);

  // Extract photos from blocks
  const extractPhotos = (): PhotoItem[] => {
    const blocks = item.useTabs && item.tabs?.length > 0
      ? item.tabs.flatMap(t => t.blocks)
      : item.blocks || [];

    const photos: PhotoItem[] = [];

    blocks.forEach((block, idx) => {
      if (block.type === 'gallery' && Array.isArray(block.data.images)) {
        block.data.images.forEach((img: { url: string; alt?: string; caption?: string }, i: number) => {
          photos.push({
            id: `${block.id}-${i}`,
            url: img.url,
            alt: img.alt || img.caption || `Photo ${photos.length + 1}`,
          });
        });
      } else if (block.type === 'image' && block.data.url) {
        photos.push({
          id: block.id,
          url: block.data.url as string,
          alt: (block.data.alt as string) || (block.data.caption as string) || `Photo ${idx + 1}`,
        });
      }
    });

    if (item.windowHeaderImage) {
      photos.unshift({
        id: 'header',
        url: item.windowHeaderImage,
        alt: item.windowTitle,
      });
    }

    return photos;
  };

  const photos = extractPhotos();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else if (isActive) {
          windowContext.closeWindow(windowInstance.id);
        }
      }
      if (selectedPhoto) {
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setSelectedPhoto(photos[currentIndex - 1]);
        } else if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
          setSelectedPhoto(photos[currentIndex + 1]);
        }
      }
    },
    [windowContext, windowInstance.id, isActive, selectedPhoto, photos]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleWindowClick = () => {
    windowContext.focusWindow(windowInstance.id);
  };

  const handlePhotoClick = (photo: PhotoItem) => {
    setSelectedPhoto(photo);
    haptic('light');
  };

  const handleFavorite = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(photoId)) {
      newFavorites.delete(photoId);
    } else {
      newFavorites.add(photoId);
    }
    setFavorites(newFavorites);
    haptic('medium');
  };

  const windowWidth = Math.max(item.windowWidth || 860, 700);

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
            minHeight: 500,
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
            className="flex items-center justify-between h-[52px] px-4 shrink-0 select-none"
            style={{
              background: colors.titleBarBg,
              borderBottom: `1px solid ${colors.titleBarBorder}`,
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
                aria-label="Close"
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
                aria-label="Minimize"
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
                aria-label="Maximize"
              >
                <svg className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity" viewBox="0 0 8 8" fill="none">
                  <path d="M1 2.5L4 5.5L7 2.5" stroke="rgba(0, 70, 0, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 4 4)" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: colors.accent }}>
                <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.15" />
                <path d="M3 15L8 10L12 14L16 9L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="7" r="2" fill="currentColor" fillOpacity="0.4" />
              </svg>
              <span className="text-[13px] font-semibold" style={{ color: colors.titleText }}>
                {item.windowTitle}
              </span>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: colors.badgeBg, color: colors.badgeText }}
              >
                {photos.length} photos
              </span>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-1">
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: `1px solid ${colors.toolbarBorder}` }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-1.5 transition-all duration-150"
                  style={{
                    background: viewMode === 'grid' ? colors.toolbarActiveBg : 'transparent',
                    color: viewMode === 'grid' ? colors.toolbarActiveText : colors.toolbarText,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-1.5 transition-all duration-150"
                  style={{
                    background: viewMode === 'list' ? colors.toolbarActiveBg : 'transparent',
                    color: viewMode === 'list' ? colors.toolbarActiveText : colors.toolbarText,
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div >

          {/* Photo Grid */}
          < div
            className="flex-1 overflow-y-auto p-4"
            style={{ background: colors.contentBg }
            }
          >
            {
              photos.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-3 md:grid-cols-4 gap-3' : 'space-y-2'}>
                  {photos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      className={`relative group cursor-pointer overflow-hidden ${viewMode === 'grid' ? 'aspect-square rounded-lg' : 'flex items-center gap-4 p-3 rounded-xl'
                        }`}
                      style={{
                        background: colors.photoCardBg,
                        boxShadow: colors.photoCardShadow,
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      onClick={() => handlePhotoClick(photo)}
                      whileHover={{
                        scale: viewMode === 'grid' ? 1.02 : 1,
                        boxShadow: colors.photoCardHoverShadow,
                      }}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <Image
                            src={photo.url}
                            alt={photo.alt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 33vw, 25vw"
                          />
                          {/* Gradient overlay on hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: colors.photoOverlay }}
                          />
                          {/* Favorite button */}
                          <button
                            onClick={(e) => handleFavorite(photo.id, e)}
                            className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill={favorites.has(photo.id) ? colors.favoriteColor : 'none'}
                              viewBox="0 0 24 24"
                              stroke={favorites.has(photo.id) ? colors.favoriteColor : 'white'}
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          {/* Caption on hover */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-xs font-medium truncate">{photo.alt}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 relative rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={photo.url}
                              alt={photo.alt}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate" style={{ color: colors.titleText }}>
                              {photo.alt}
                            </p>
                            <p className="text-[11px]" style={{ color: colors.toolbarText }}>
                              Photo
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleFavorite(photo.id, e)}
                            className="p-2 transition-transform hover:scale-110"
                          >
                            <svg
                              className="w-5 h-5"
                              fill={favorites.has(photo.id) ? colors.favoriteColor : 'none'}
                              viewBox="0 0 24 24"
                              stroke={favorites.has(photo.id) ? colors.favoriteColor : colors.toolbarText}
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center h-full py-16"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: colors.emptyBg }}
                  >
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={colors.emptyIcon} strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold mb-1" style={{ color: colors.emptyTitle }}>
                    No Photos
                  </p>
                  <p className="text-[13px] text-center max-w-[240px]" style={{ color: colors.emptyText }}>
                    Add gallery or image blocks to see photos here
                  </p>
                </motion.div>
              )
            }
          </div >

          {/* Lightbox */}
          <AnimatePresence>
            {
              selectedPhoto && (
                <motion.div
                  className="absolute inset-0 z-50 flex items-center justify-center"
                  style={{ background: colors.lightboxBg }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPhoto(null)}
                >
                  {/* Close button */}
                  <button
                    className="absolute top-4 right-4 p-2.5 rounded-full transition-all duration-200 hover:scale-105"
                    style={{ background: colors.lightboxButtonBg, color: colors.lightboxText }}
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Navigation */}
                  {photos.findIndex(p => p.id === selectedPhoto.id) > 0 && (
                    <button
                      className="absolute left-4 p-3 rounded-full transition-all duration-200 hover:scale-105"
                      style={{ background: colors.lightboxButtonBg, color: colors.lightboxText }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = photos.findIndex(p => p.id === selectedPhoto.id);
                        if (idx > 0) setSelectedPhoto(photos[idx - 1]);
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {photos.findIndex(p => p.id === selectedPhoto.id) < photos.length - 1 && (
                    <button
                      className="absolute right-4 p-3 rounded-full transition-all duration-200 hover:scale-105"
                      style={{ background: colors.lightboxButtonBg, color: colors.lightboxText }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = photos.findIndex(p => p.id === selectedPhoto.id);
                        if (idx < photos.length - 1) setSelectedPhoto(photos[idx + 1]);
                      }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Image */}
                  <motion.div
                    className="relative max-w-[90%] max-h-[85%]"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={selectedPhoto.url}
                      alt={selectedPhoto.alt}
                      width={1200}
                      height={800}
                      className="max-h-[80vh] w-auto object-contain rounded-lg"
                      style={{ maxWidth: '100%' }}
                    />
                    <p className="text-center mt-4 text-[14px]" style={{ color: colors.lightboxText }}>
                      {selectedPhoto.alt}
                    </p>
                  </motion.div>
                </motion.div>
              )
            }
          </AnimatePresence >
        </motion.div >
      </div >
    </>
  );
}
