'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';
import type { DesktopItem, GoOSFileType } from '@/types';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/lib/goos/fileTypeMapping';

interface PresentViewProps {
  items: DesktopItem[];
  presentOrder?: string[];
  onClose?: () => void;
  isOwner?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export function PresentView({
  items,
  presentOrder,
  onClose,
  isOwner = false,
  autoAdvance = false,
  autoAdvanceDelay = 5000,
}: PresentViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoAdvance);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Sort items by presentOrder if provided
  const sortedItems = useMemo(() => {
    const filteredItems = isOwner
      ? items
      : items.filter(item => item.publishStatus === 'published');

    if (presentOrder && presentOrder.length > 0) {
      const orderMap = new Map(presentOrder.map((id, index) => [id, index]));
      return [...filteredItems].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Infinity;
        const orderB = orderMap.get(b.id) ?? Infinity;
        return orderA - orderB;
      });
    }
    return [...filteredItems].sort((a, b) => a.order - b.order);
  }, [items, presentOrder, isOwner]);

  const currentItem = sortedItems[currentIndex];
  const totalSlides = sortedItems.length;

  // Navigation
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen?.();
          } else {
            onClose?.();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose, isFullscreen]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || totalSlides <= 1) return;

    const interval = setInterval(goNext, autoAdvanceDelay);
    return () => clearInterval(interval);
  }, [isPlaying, goNext, autoAdvanceDelay, totalSlides]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!currentItem) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          background: 'var(--bg-primary, #0a0a0a)',
          color: 'var(--text-primary, white)',
        }}
      >
        <div className="text-center">
          <span style={{ fontSize: '48px' }}>📭</span>
          <h3 style={{ fontSize: '18px', marginTop: '16px' }}>No slides to present</h3>
          <button
            onClick={onClose}
            style={{
              marginTop: '24px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'var(--bg-card, rgba(255,255,255,0.1))',
              color: 'var(--text-primary, white)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0"
      style={{
        background: 'var(--bg-primary, #0a0a0a)',
        zIndex: 99999,
      }}
    >
      {/* Slide content */}
      <AnimatePresence mode="wait">
        <PresentSlide key={currentItem.id} item={currentItem} />
      </AnimatePresence>

      {/* Controls overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between pointer-events-auto"
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
          }}
        >
          {/* Slide counter */}
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'var(--font-body, system-ui)',
            }}
          >
            {currentIndex + 1} / {totalSlides}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </motion.button>

            {/* Fullscreen */}
            <motion.button
              onClick={toggleFullscreen}
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </motion.button>

            {/* Close */}
            <motion.button
              onClick={onClose}
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* Navigation arrows */}
        {totalSlides > 1 && (
          <>
            <motion.button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.2)', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={24} />
            </motion.button>

            <motion.button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.2)', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          </>
        )}

        {/* Progress dots */}
        {totalSlides > 1 && totalSlides <= 20 && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto"
          >
            {sortedItems.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: index === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: index === currentIndex
                    ? 'white'
                    : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.2s ease, background 0.2s ease',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.6)' }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface PresentSlideProps {
  item: DesktopItem;
}

function PresentSlide({ item }: PresentSlideProps) {
  const isGoosFile = item.itemVariant === 'goos-file';
  const fileType = (item.goosFileType || 'note') as GoOSFileType;

  // Get image for the item
  const imageUrl = useMemo(() => {
    if (isGoosFile) {
      if (fileType === 'image' && item.goosImageUrl) return item.goosImageUrl;
    }
    return item.windowHeaderImage || item.thumbnailUrl;
  }, [isGoosFile, fileType, item]);

  // Get content
  const content = useMemo(() => {
    if (isGoosFile && item.goosContent) {
      return item.goosContent.replace(/<[^>]*>/g, '').trim();
    }
    return item.windowDescription || '';
  }, [isGoosFile, item.goosContent, item.windowDescription]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ padding: '80px 120px' }}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ maxWidth: '1200px' }}
      >
        {/* Image */}
        {imageUrl && fileType === 'image' && (
          <motion.img
            src={imageUrl}
            alt={item.windowTitle || item.label}
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          />
        )}

        {/* Header image for non-image types */}
        {imageUrl && fileType !== 'image' && (
          <motion.div
            className="w-full mb-8"
            style={{
              maxHeight: '40vh',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ maxHeight: '40vh' }}
            />
          </motion.div>
        )}

        {/* Type badge */}
        <motion.div
          className="flex items-center gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span style={{ fontSize: '20px' }}>
            {FILE_TYPE_ICONS[fileType] || '📄'}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-body, system-ui)',
            }}
          >
            {FILE_TYPE_LABELS[fileType] || 'File'}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-center"
          style={{
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 700,
            color: 'white',
            fontFamily: 'var(--font-heading, system-ui)',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {item.windowTitle || item.label}
        </motion.h1>

        {/* Subtitle */}
        {item.windowSubtitle && (
          <motion.p
            className="text-center"
            style={{
              fontSize: 'clamp(16px, 2vw, 24px)',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'var(--font-body, system-ui)',
              maxWidth: '800px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {item.windowSubtitle}
          </motion.p>
        )}

        {/* Content preview */}
        {content && fileType !== 'image' && (
          <motion.p
            className="text-center mt-6"
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-body, system-ui)',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {content.length > 300 ? content.slice(0, 300) + '...' : content}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
