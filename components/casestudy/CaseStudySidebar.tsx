'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Circle, Target, Lightbulb, Layers, CheckCircle2, Zap, Search, Users, Crosshair, Compass, PenTool } from 'lucide-react';
import { caseStudyTokens, type TableOfContentsEntry } from '@/lib/casestudy/types';

interface CaseStudySidebarProps {
  entries: TableOfContentsEntry[];
  onBack: () => void;
  authorName?: string;
  isPastHero?: boolean;
}

// Map section titles to icons based on common UX case study patterns
function getSectionIcon(title: string, index: number) {
  const t = title.toLowerCase();

  if (t.includes('overview') || t.includes('intro') || t.includes('about')) return Circle;
  if (t.includes('current') || t.includes('landscape') || t.includes('space')) return Compass;
  if (t.includes('research') || t.includes('discovery') || t.includes('insight')) return Search;
  if (t.includes('stakeholder') || t.includes('persona') || t.includes('user')) return Users;
  if (t.includes('problem') || t.includes('challenge')) return Target;
  if (t.includes('opportunity') || t.includes('how might')) return Lightbulb;
  if (t.includes('approach') || t.includes('scope') || t.includes('strategy')) return Crosshair;
  if (t.includes('exploration') || t.includes('design') || t.includes('prototype')) return PenTool;
  if (t.includes('solution') || t.includes('final')) return Layers;
  if (t.includes('process') || t.includes('build')) return Layers;
  if (t.includes('result') || t.includes('outcome') || t.includes('impact')) return CheckCircle2;
  if (t.includes('feature') || t.includes('highlight')) return Zap;

  const defaultIcons = [Circle, Target, Lightbulb, Layers, CheckCircle2, Zap];
  return defaultIcons[index % defaultIcons.length];
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
        rootMargin: '-20% 0px -70% 0px',
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { colors, fonts, spacing, typography } = caseStudyTokens;

  const sectionIds = entries.map((e) => e.id);
  const activeSection = useScrollSpy(sectionIds);

  // Hide sidebar below 1024px — use matchMedia for efficient breakpoint detection
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1025px)');
    setIsWideEnough(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsWideEnough(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
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
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: 'fixed',
        left: spacing.sidebarLeft,
        top: 100,
        width: spacing.sidebarWidth,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      aria-label="Table of contents"
    >
      {/* Back button - icon only with hover label */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onBack}
          onMouseEnter={() => setHoveredId('back')}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            padding: 0,
            border: 'none',
            borderRadius: 10,
            background: hoveredId === 'back' ? colors.surfaceAlt : 'transparent',
            cursor: 'pointer',
            color: colors.textMuted,
            transition: 'all 0.2s ease',
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>

        {/* Hover label */}
        <AnimatePresence>
          {hoveredId === 'back' && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                left: 48,
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: fonts.ui,
                fontSize: typography.sidebar.size,
                fontWeight: typography.sidebar.weight,
                color: colors.text,
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                background: colors.surface,
                borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              Back
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      {entries.length > 0 && (
        <div
          style={{
            width: 24,
            height: 1,
            background: colors.border,
            marginLeft: 8,
          }}
        />
      )}

      {/* Navigation icons */}
      {entries.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {entries.map((entry, index) => {
            const isActive = activeSection === entry.id;
            const isHovered = hoveredId === entry.id;
            const Icon = getSectionIcon(entry.title, index);

            return (
              <li key={entry.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => scrollToSection(entry.id)}
                  onMouseEnter={() => setHoveredId(entry.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    padding: 0,
                    border: 'none',
                    borderRadius: 10,
                    background: isActive
                      ? colors.text
                      : isHovered
                        ? colors.surfaceAlt
                        : 'transparent',
                    cursor: 'pointer',
                    color: isActive ? colors.surface : colors.textMuted,
                    transition: 'all 0.2s ease',
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  aria-label={`${String(index + 1).padStart(2, '0')} ${entry.title}`}
                >
                  <span
                    style={{
                      fontFamily: fonts.ui,
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </button>

                {/* Hover label */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        left: 48,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontFamily: fonts.ui,
                        fontSize: typography.sidebar.size,
                        fontWeight: isActive
                          ? typography.sidebarActive.weight
                          : typography.sidebar.weight,
                        color: colors.text,
                        whiteSpace: 'nowrap',
                        padding: '6px 12px',
                        background: colors.surface,
                        borderRadius: 8,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {entry.title}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </motion.nav>
  );
}
