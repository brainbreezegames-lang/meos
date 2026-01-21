'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Related study card
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
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Large image */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 20,
          background: colors.borderLight,
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
              background: `linear-gradient(135deg, ${colors.borderLight} 0%, ${colors.border} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.display,
              fontSize: 32,
              fontStyle: 'italic',
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
          fontFamily: fonts.body,
          fontSize: typography.cardTitle.size,
          fontWeight: typography.cardTitle.weight,
          lineHeight: typography.cardTitle.lineHeight,
          color: colors.text,
          marginBottom: 6,
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
  const { colors, fonts, spacing } = caseStudyTokens;

  // Only show first 2 related studies
  const displayStudies = relatedStudies.slice(0, 2);

  return (
    <footer
      style={{
        maxWidth: spacing.contentMaxWidth,
        margin: '0 auto',
        padding: `64px ${spacing.contentPadding}px 96px`,
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
          {/* Section divider */}
          <div
            style={{
              width: 48,
              height: 1,
              background: colors.border,
              margin: '0 auto 48px',
            }}
          />

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

          {/* View all work button - full width */}
          {onViewAllClick && (
            <button
              onClick={onViewAllClick}
              style={{
                display: 'block',
                width: '100%',
                padding: '20px 24px',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                background: 'transparent',
                fontFamily: fonts.body,
                fontSize: 15,
                fontWeight: 500,
                color: colors.text,
                cursor: 'pointer',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.borderLight;
                e.currentTarget.style.borderColor = colors.textMuted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              View all work
            </button>
          )}
        </motion.section>
      )}

      {/* Footer info */}
      <div
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: fonts.ui,
            fontSize: 14,
            color: colors.textMuted,
          }}
        >
          {authorName}
        </p>
        <p
          style={{
            fontFamily: fonts.ui,
            fontSize: 12,
            color: colors.textLight,
            marginTop: 8,
          }}
        >
          Built with goOS
        </p>
      </div>
    </footer>
  );
}
