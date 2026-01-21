'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { caseStudyTokens, type TableOfContentsEntry } from '@/lib/casestudy/types';

interface CaseStudySidebarProps {
  entries: TableOfContentsEntry[];
  onBack: () => void;
  authorName?: string;
  isPastHero?: boolean;
}

// Custom hook for scroll spy
function useScrollSpy(sectionIds: string[]): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(
    sectionIds.length > 0 ? sectionIds[0] : null
  );

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

export function CaseStudySidebar({
  entries,
  onBack,
  authorName = 'Desktop',
  isPastHero = false,
}: CaseStudySidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isWideEnough, setIsWideEnough] = useState(false);
  const { colors, fonts, spacing, typography } = caseStudyTokens;

  const sectionIds = entries.map((e) => e.id);
  const activeSection = useScrollSpy(sectionIds);

  // Hide sidebar below 1024px
  useEffect(() => {
    const checkWidth = () => {
      setIsWideEnough(window.innerWidth > 1024);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    },
    [prefersReducedMotion]
  );

  // Don't render if screen is too narrow or haven't scrolled past hero
  if (!isWideEnough || !isPastHero) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: spacing.sidebarLeft,
        top: 120, // Fixed position near top, not vertically centered
        width: spacing.sidebarWidth,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
      aria-label="Table of contents"
    >
      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 0,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontFamily: fonts.ui,
          fontSize: typography.sidebar.size,
          fontWeight: typography.sidebar.weight,
          color: 'rgba(0, 0, 0, 0.35)', // 35% opacity - very muted
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(0, 0, 0, 0.35)';
        }}
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span>Back</span>
      </button>

      {/* Navigation links */}
      {entries.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {entries.map((entry) => {
            const isActive = activeSection === entry.id;

            return (
              <li key={entry.id}>
                <button
                  onClick={() => scrollToSection(entry.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: fonts.ui,
                    fontSize: isActive
                      ? typography.sidebarActive.size
                      : typography.sidebar.size,
                    fontWeight: isActive
                      ? typography.sidebarActive.weight
                      : typography.sidebar.weight,
                    // Very muted (35%) when inactive, 90% when active
                    color: isActive ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.35)',
                    lineHeight: typography.sidebar.lineHeight,
                    transition: 'color 0.2s ease',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(0, 0, 0, 0.35)';
                    }
                  }}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {entry.title}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </motion.nav>
  );
}
