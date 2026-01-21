'use client';

import React, { useMemo, useEffect } from 'react';
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
  const { colors, fonts } = caseStudyTokens;

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
        />

        {/* Sidebar navigation (fixed position) */}
        <CaseStudySidebar
          entries={parsedContent.tableOfContents}
          onBack={onClose}
          authorName={author.name}
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

      {/* Google Fonts for Newsreader */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Selection color */
        ::selection {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
