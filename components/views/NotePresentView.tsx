'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  FileText,
  Presentation,
} from 'lucide-react';
import { parseContentToSlides } from '@/lib/utils';

// Brand Appart design tokens (aligned with useWidgetTheme)
const goOS = {
  colors: {
    paper: '#fbf9ef',         // Brand cream
    border: '#171412',        // Brand base dark
    background: '#171412',    // Dark presentation background
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)',
    },
    accent: '#ff7722',        // Brand orange
  },
  shadows: {
    solid: '4px 4px 0 rgba(23, 20, 18, 0.2)',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

interface NotePresentViewProps {
  note: {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;
    headerImage: string | null;
    fileType: 'note' | 'case-study';
  };
  author: {
    username: string;
    name: string;
  };
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  onClose?: () => void;
}

export function NotePresentView({
  note,
  author,
  autoAdvance = false,
  autoAdvanceDelay = 5000,
  onClose,
}: NotePresentViewProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoAdvance);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Generate slides from content
  const slides = useMemo(() => {
    const contentSlides = parseContentToSlides(note.content);

    // Create title slide
    const titleSlide = {
      type: 'title' as const,
      heading: note.title,
      content: note.subtitle || undefined,
      imageUrl: note.headerImage || undefined,
    };

    return [titleSlide, ...contentSlides];
  }, [note]);

  const totalSlides = slides.length;

  // Navigation
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Navigate back to the article page
      router.push(`/${author.username}/${note.id}`);
    }
  };

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
            handleClose();
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
  }, [goNext, goPrev, isFullscreen]);

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

  const currentSlide = slides[currentIndex];
  const FileIcon = note.fileType === 'case-study' ? Presentation : FileText;

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
      <SlideRenderer slide={currentSlide} isFirst={currentIndex === 0} FileIcon={FileIcon} />

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

          {/* Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: goOS.colors.text.primary,
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: goOS.fonts.heading,
            }}
          >
            <FileIcon size={16} strokeWidth={2} />
            <span style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {note.title}
            </span>
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
              onClick={handleClose}
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
            {slides.map((_, index) => (
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

interface SlideRendererProps {
  slide: {
    type: 'title' | 'content' | 'image';
    heading?: string;
    content?: string;
    imageUrl?: string;
    imageAlt?: string;
  };
  isFirst?: boolean;
  FileIcon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

function SlideRenderer({ slide, isFirst, FileIcon }: SlideRendererProps) {
  if (slide.type === 'image' && slide.imageUrl) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <img
          src={slide.imageUrl}
          alt={slide.imageAlt || ''}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            border: `2px solid ${goOS.colors.accent}`,
            boxShadow: '8px 8px 0 ' + goOS.colors.accent,
          }}
        />
      </div>
    );
  }

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
          maxWidth: '1000px',
          textAlign: 'center',
        }}
      >
        {/* Title slide badge */}
        {isFirst && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              background: goOS.colors.accent,
              padding: '8px 16px',
              borderRadius: '6px',
            }}
          >
            <FileIcon size={18} strokeWidth={2} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: goOS.colors.paper,
                fontFamily: goOS.fonts.heading,
              }}
            >
              Presentation
            </span>
          </div>
        )}

        {/* Header image for title slide */}
        {isFirst && slide.imageUrl && (
          <div
            style={{
              width: '100%',
              marginBottom: '32px',
              maxHeight: '35vh',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `2px solid ${goOS.colors.accent}`,
              boxShadow: '8px 8px 0 ' + goOS.colors.accent,
            }}
          >
            <img
              src={slide.imageUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                maxHeight: '35vh',
              }}
            />
          </div>
        )}

        {/* Heading */}
        {slide.heading && (
          <h1
            style={{
              fontSize: isFirst ? 'clamp(36px, 6vw, 72px)' : 'clamp(28px, 5vw, 56px)',
              fontWeight: 700,
              color: goOS.colors.text.primary,
              fontFamily: goOS.fonts.heading,
              lineHeight: 1.2,
              marginBottom: slide.content ? '24px' : 0,
              letterSpacing: '-0.02em',
            }}
          >
            {slide.heading}
          </h1>
        )}

        {/* Content */}
        {slide.content && (
          <p
            style={{
              fontSize: isFirst ? 'clamp(18px, 2.5vw, 28px)' : 'clamp(16px, 2vw, 24px)',
              color: isFirst ? goOS.colors.text.secondary : goOS.colors.text.primary,
              fontFamily: goOS.fonts.body,
              lineHeight: 1.6,
              maxWidth: '800px',
            }}
          >
            {slide.content}
          </p>
        )}
      </div>
    </div>
  );
}
