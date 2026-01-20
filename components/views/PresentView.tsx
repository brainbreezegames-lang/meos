'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause, Maximize2, Minimize2 } from 'lucide-react';
import type { DesktopItem, GoOSFileType } from '@/types';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/lib/goos/fileTypeMapping';

// goOS Design Tokens - Mediterranean Blue
const goOS = {
  colors: {
    paper: '#FFFFFF',
    border: '#2B4AE2',
    background: '#0B0F1A',
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)',
    },
    accent: '#2B4AE2',
  },
  shadows: {
    solid: '4px 4px 0 #2B4AE2',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

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
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: goOS.colors.background,
          zIndex: 99999,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            background: goOS.colors.paper,
            border: `2px solid ${goOS.colors.border}`,
            borderRadius: '8px',
            boxShadow: goOS.shadows.solid,
            padding: '48px',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: goOS.colors.accent,
              fontFamily: goOS.fonts.heading,
              marginBottom: '8px',
            }}
          >
            No slides to present
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: goOS.colors.accent,
              fontFamily: goOS.fonts.body,
              marginBottom: '24px',
              opacity: 0.7,
            }}
          >
            Create some content to start presenting
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              background: goOS.colors.accent,
              color: goOS.colors.paper,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: goOS.fonts.heading,
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
      style={{
        position: 'fixed',
        inset: 0,
        background: goOS.colors.background,
        zIndex: 99999,
      }}
    >
      {/* Slide content */}
      <PresentSlide key={currentItem.id} item={currentItem} />

      {/* Controls overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
            pointerEvents: 'auto',
          }}
        >
          {/* Slide counter */}
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: goOS.colors.paper,
              fontFamily: goOS.fonts.heading,
              background: goOS.colors.accent,
              padding: '6px 12px',
              borderRadius: '4px',
            }}
          >
            {currentIndex + 1} / {totalSlides}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                background: goOS.colors.paper,
                border: `2px solid ${goOS.colors.accent}`,
                color: goOS.colors.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPlaying ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                background: goOS.colors.paper,
                border: `2px solid ${goOS.colors.accent}`,
                color: goOS.colors.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFullscreen ? <Minimize2 size={18} strokeWidth={2} /> : <Maximize2 size={18} strokeWidth={2} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                background: goOS.colors.accent,
                border: 'none',
                color: goOS.colors.paper,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={goPrev}
              style={{
                position: 'absolute',
                left: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                background: goOS.colors.paper,
                border: `2px solid ${goOS.colors.accent}`,
                boxShadow: '3px 3px 0 ' + goOS.colors.accent,
                color: goOS.colors.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 ' + goOS.colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%)';
                e.currentTarget.style.boxShadow = '3px 3px 0 ' + goOS.colors.accent;
              }}
            >
              <ChevronLeft size={28} strokeWidth={2} />
            </button>

            <button
              onClick={goNext}
              style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                background: goOS.colors.paper,
                border: `2px solid ${goOS.colors.accent}`,
                boxShadow: '3px 3px 0 ' + goOS.colors.accent,
                color: goOS.colors.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = '5px 5px 0 ' + goOS.colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%)';
                e.currentTarget.style.boxShadow = '3px 3px 0 ' + goOS.colors.accent;
              }}
            >
              <ChevronRight size={28} strokeWidth={2} />
            </button>
          </>
        )}

        {/* Progress dots */}
        {totalSlides > 1 && totalSlides <= 20 && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'auto',
              background: goOS.colors.paper,
              padding: '8px 16px',
              borderRadius: '24px',
              border: `2px solid ${goOS.colors.accent}`,
            }}
          >
            {sortedItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: index === currentIndex ? '24px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: index === currentIndex ? goOS.colors.accent : 'rgba(43, 74, 226, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.2s ease, background 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
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
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 120px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '1200px',
        }}
      >
        {/* Image */}
        {imageUrl && fileType === 'image' && (
          <img
            src={imageUrl}
            alt={item.windowTitle || item.label}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: '8px',
              border: `2px solid ${goOS.colors.accent}`,
              boxShadow: '8px 8px 0 ' + goOS.colors.accent,
            }}
          />
        )}

        {/* Header image for non-image types */}
        {imageUrl && fileType !== 'image' && (
          <div
            style={{
              width: '100%',
              marginBottom: '32px',
              maxHeight: '40vh',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `2px solid ${goOS.colors.accent}`,
              boxShadow: '8px 8px 0 ' + goOS.colors.accent,
            }}
          >
            <img
              src={imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                maxHeight: '40vh',
              }}
            />
          </div>
        )}

        {/* Type badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            background: goOS.colors.accent,
            padding: '6px 12px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontSize: '20px' }}>
            {FILE_TYPE_ICONS[fileType] || '📄'}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: goOS.colors.paper,
              fontFamily: goOS.fonts.heading,
            }}
          >
            {FILE_TYPE_LABELS[fileType] || 'File'}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 700,
            color: goOS.colors.text.primary,
            fontFamily: goOS.fonts.heading,
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          {item.windowTitle || item.label}
        </h1>

        {/* Subtitle */}
        {item.windowSubtitle && (
          <p
            style={{
              textAlign: 'center',
              fontSize: 'clamp(16px, 2vw, 24px)',
              color: goOS.colors.text.secondary,
              fontFamily: goOS.fonts.body,
              maxWidth: '800px',
            }}
          >
            {item.windowSubtitle}
          </p>
        )}

        {/* Content preview */}
        {content && fileType !== 'image' && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '16px',
              color: goOS.colors.text.muted,
              fontFamily: goOS.fonts.body,
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            {content.length > 300 ? content.slice(0, 300) + '...' : content}
          </p>
        )}
      </div>
    </div>
  );
}
