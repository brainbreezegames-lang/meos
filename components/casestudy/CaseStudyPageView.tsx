'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { CaseStudyHero } from './CaseStudyHero';
import { CaseStudySidebar } from './CaseStudySidebar';
import { CaseStudyContent } from './CaseStudyContent';
import { CaseStudyFooter } from './CaseStudyFooter';
import { parseCaseStudyContent } from '@/lib/casestudy/parser';
import { caseStudyTokens, type CaseStudyPageViewProps, type RelatedStudy } from '@/lib/casestudy/types';

export function CaseStudyPageView({
  note,
  author,
  relatedStudies = [],
  onClose,
}: CaseStudyPageViewProps) {
  const { colors } = caseStudyTokens;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPastHero, setIsPastHero] = useState(false);

  // Parse content into structured blocks
  const parsedContent = useMemo(() => {
    return parseCaseStudyContent(note.content, note.headerImage);
  }, [note.content, note.headerImage]);

  // Lock body scroll when open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Track scroll position to show/hide sidebar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Hero is 75vh, show sidebar after scrolling past 60%
      const heroHeight = window.innerHeight * 0.6;
      setIsPastHero(container.scrollTop > heroHeight);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle related study click
  const handleStudyClick = (study: RelatedStudy) => {
    // For now, just log - in production this would navigate
    console.log('Navigate to study:', study.id);
  };

  // Handle view all click
  const handleViewAllClick = () => {
    onClose();
  };

  return (
    <div
      ref={scrollContainerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: colors.background,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Main scrollable content */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero with title overlay */}
        <CaseStudyHero
          imageUrl={parsedContent.heroImage}
          title={note.title}
          subtitle={note.subtitle}
        />

        {/* Sidebar navigation (fixed position, only visible after scrolling past hero) */}
        <CaseStudySidebar
          entries={parsedContent.tableOfContents}
          onBack={onClose}
          authorName={author.name}
          isPastHero={isPastHero}
        />

        {/* Main content area */}
        <main
          style={{
            flex: 1,
            position: 'relative',
          }}
        >
          <CaseStudyContent
            blocks={parsedContent.contentBlocks}
            projectName={note.title}
            projectTags={
              note.fileType === 'case-study' ? 'Case Study' : 'Note'
            }
            publishedAt={note.publishedAt}
          />

          <CaseStudyFooter
            relatedStudies={relatedStudies}
            authorName={author.name}
            authorUsername={author.username}
            onStudyClick={handleStudyClick}
            onViewAllClick={handleViewAllClick}
          />
        </main>
      </div>

      {/* Global styles - Brand Appart aesthetic */}
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.12);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Selection color - warm orange tint */
        ::selection {
          background: rgba(255, 119, 34, 0.15);
        }
      `}</style>
    </div>
  );
}
