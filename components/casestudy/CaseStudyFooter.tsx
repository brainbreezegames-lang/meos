'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { caseStudyTokens, type RelatedStudy } from '@/lib/casestudy/types';

interface CaseStudyFooterProps {
  relatedStudies?: RelatedStudy[];
  authorName: string;
  authorUsername: string;
  onStudyClick?: (study: RelatedStudy) => void;
  onViewAllClick?: () => void;
}

// Card animation
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Related study card - Brand Appart style
function StudyCard({
  study,
  onClick,
}: {
  study: RelatedStudy;
  onClick?: () => void;
}) {
  const { colors, fonts, typography } = caseStudyTokens;
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        padding: 0,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Image container */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
          background: colors.surfaceAlt,
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        {study.headerImage ? (
          <img
            src={study.headerImage}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${colors.surfaceAlt} 0%, ${colors.border} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.display,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: colors.textMuted,
            }}
          >
            {study.title.charAt(0)}
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: fonts.display,
          fontSize: typography.cardTitle.size,
          fontWeight: typography.cardTitle.weight,
          letterSpacing: typography.cardTitle.letterSpacing,
          lineHeight: typography.cardTitle.lineHeight,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {study.title}
      </h3>

      {/* Subtitle */}
      {study.subtitle && (
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: typography.cardSubtitle.size,
            fontWeight: typography.cardSubtitle.weight,
            lineHeight: typography.cardSubtitle.lineHeight,
            color: colors.textMuted,
          }}
        >
          {study.subtitle}
        </p>
      )}
    </button>
  );
}

export function CaseStudyFooter({
  relatedStudies = [],
  authorName,
  authorUsername,
  onStudyClick,
  onViewAllClick,
}: CaseStudyFooterProps) {
  const prefersReducedMotion = useReducedMotion();
  const { colors, fonts, spacing, typography } = caseStudyTokens;

  // Only show first 2 related studies
  const displayStudies = relatedStudies.slice(0, 2);

  return (
    <footer
      style={{
        maxWidth: spacing.contentMaxWidth,
        margin: '0 auto',
        padding: `80px ${spacing.contentPadding}px 120px`,
      }}
    >
      {/* More Case Studies Section */}
      {displayStudies.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Section header */}
          <div style={{ marginBottom: 40 }}>
            <p
              style={{
                fontFamily: fonts.ui,
                fontSize: typography.sectionLabel.size,
                fontWeight: typography.sectionLabel.weight,
                letterSpacing: typography.sectionLabel.letterSpacing,
                textTransform: 'uppercase',
                color: colors.accent,
                marginBottom: 12,
              }}
            >
              More Work
            </p>
            <h2
              style={{
                fontFamily: fonts.display,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: colors.text,
              }}
            >
              Related Projects
            </h2>
          </div>

          {/* Grid of related studies */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                displayStudies.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: 32,
              marginBottom: 48,
            }}
          >
            {displayStudies.map((study, index) => (
              <motion.div
                key={study.id}
                variants={prefersReducedMotion ? {} : cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1 }}
              >
                <StudyCard
                  study={study}
                  onClick={() => onStudyClick?.(study)}
                />
              </motion.div>
            ))}
          </div>

          {/* View all work button - accent styled */}
          {onViewAllClick && (
            <button
              onClick={onViewAllClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                border: 'none',
                borderRadius: 12,
                background: colors.text,
                fontFamily: fonts.body,
                fontSize: 15,
                fontWeight: 600,
                color: colors.background,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              View all work
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          )}
        </motion.section>
      )}

      {/* Footer info */}
      <div
        style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontFamily: fonts.ui,
            fontSize: 14,
            fontWeight: 500,
            color: colors.textMuted,
          }}
        >
          {authorName}
        </p>
        <p
          style={{
            fontFamily: fonts.ui,
            fontSize: 12,
            fontWeight: 500,
            color: colors.textLight,
          }}
        >
          Built with goOS
        </p>
      </div>
    </footer>
  );
}
