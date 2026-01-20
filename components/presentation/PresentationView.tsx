'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from 'lucide-react';
import { SlideRenderer } from './SlideTemplates';
import { parseNoteToSlidesSimple, type Slide, type NoteInput } from '@/lib/presentation/parser';
import { getTheme, type ThemeId, type PresentationTheme } from '@/lib/presentation/themes';

interface PresentationViewProps {
  note: {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
    headerImage?: string;
  };
  author: {
    username: string;
    name: string;
  };
  themeId?: ThemeId;
  backgroundImage?: string;
  showProgressBar?: boolean;
  showSlideNumbers?: boolean;
  onClose?: () => void;
}

/**
 * PresentationView - Fullscreen slide presentation
 *
 * Design direction: Editorial, refined, confident
 * - Minimal chrome that auto-hides
 * - Smooth, intentional transitions
 * - No gimmicks, just beautiful content
 */
export function PresentationView({
  note,
  author,
  themeId = 'paper',
  backgroundImage,
  showProgressBar = true,
  showSlideNumbers = true,
  onClose,
}: PresentationViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const theme = getTheme(themeId);

  // Parse note into slides
  const slides = useMemo(() => {
    const noteInput: NoteInput = {
      id: note.id,
      title: note.title,
      subtitle: note.subtitle,
      content: note.content,
      author: author.name,
      username: author.username,
      date: new Date(),
      headerImage: note.headerImage,
    };
    return parseNoteToSlidesSimple(noteInput);
  }, [note, author]);

  const totalSlides = slides.length;
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  // Navigation
  const goNext = useCallback(() => {
    setCurrentSlide((c) => Math.min(c + 1, totalSlides - 1));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((c) => Math.max(c - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setShowControls(true);

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose?.();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(totalSlides - 1);
          break;
        default:
          // Number keys 1-9
          if (e.key >= '1' && e.key <= '9') {
            const num = parseInt(e.key, 10);
            if (num <= totalSlides) {
              goToSlide(num - 1);
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, goToSlide, totalSlides, onClose]);

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [currentSlide, showControls]);

  // Mouse movement shows controls
  useEffect(() => {
    const handleMouseMove = () => setShowControls(true);
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Click to advance
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't advance if clicking on controls
    if ((e.target as HTMLElement).closest('[data-controls]')) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // Click on left 20% = prev, rest = next
    if (clickX < rect.width * 0.2) {
      goPrev();
    } else {
      goNext();
    }
  }, [goNext, goPrev]);

  const hasBackground = !!backgroundImage;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: hasBackground ? '#0A0A0A' : theme.colors.background,
        cursor: 'none',
      }}
      onClick={handleClick}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Custom background image */}
      {hasBackground && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Progress bar - top */}
      <AnimatePresence>
        {showControls && showProgressBar && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: hasBackground ? 'rgba(255,255,255,0.1)' : theme.colors.accentMuted,
              zIndex: 100,
            }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                background: theme.colors.accent,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide container */}
      <div
        style={{
          position: 'absolute',
          inset: hasBackground ? '5%' : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Slide card (with shadow if has background) */}
        <div
          style={{
            width: hasBackground ? '100%' : '100vw',
            height: hasBackground ? '100%' : '100vh',
            maxWidth: hasBackground ? 'calc(100vh * 16 / 9)' : undefined,
            aspectRatio: hasBackground ? '16 / 9' : undefined,
            background: theme.colors.background,
            borderRadius: hasBackground ? '12px' : 0,
            boxShadow: hasBackground
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              : 'none',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Slide content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SlideRenderer
                  slide={slides[currentSlide]}
                  theme={theme}
                  size="full"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            data-controls
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              cursor: 'default',
            }}
          >
            {/* Top right controls */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                gap: '8px',
                pointerEvents: 'auto',
              }}
            >
              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                }}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* Close */}
              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Navigation arrows - sides */}
            {currentSlide > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  transition: 'background 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {currentSlide < totalSlides - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                  transition: 'background 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Slide counter - bottom right */}
            {showSlideNumbers && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  pointerEvents: 'auto',
                  letterSpacing: '0.02em',
                }}
              >
                {currentSlide + 1} / {totalSlides}
              </div>
            )}

            {/* Keyboard hint - bottom left (only on first slide) */}
            {currentSlide === 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  fontSize: '12px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  color: 'rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none',
                }}
              >
                Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>→</kbd> or click to advance
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cursor visibility */}
      <style>{`
        div[style*="cursor: none"]:hover {
          cursor: ${showControls ? 'default' : 'none'};
        }
      `}</style>
    </div>
  );
}

export default PresentationView;
