'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { caseStudyTokens, type ContentBlock, type ImageData } from '@/lib/casestudy/types';

interface CaseStudyContentProps {
  blocks: ContentBlock[];
  projectName?: string;
  projectIcon?: string | null;
  projectTags?: string;
  publishedAt?: Date | null;
}

// Stagger animation for content blocks
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Single image component - stays within content area
function ContentImage({ image }: { image: ImageData }) {
  const { spacing, colors } = caseStudyTokens;

  return (
    <figure
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        maxWidth: spacing.contentMaxWidth,
        marginTop: 56,
        marginBottom: 56,
      }}
    >
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: 12,
        }}
      />
      {image.caption && (
        <figcaption
          style={{
            marginTop: 14,
            fontFamily: caseStudyTokens.fonts.ui,
            fontSize: 13,
            fontWeight: 500,
            color: caseStudyTokens.colors.textMuted,
            textAlign: 'center',
            letterSpacing: '0.01em',
          }}
        >
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Image grid component (2-up or 3-up) - stays within content area
function ContentImageGrid({ images }: { images: ImageData[] }) {
  const { spacing } = caseStudyTokens;
  const columns = images.length >= 3 ? 3 : 2;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
        width: '100%',
        maxWidth: spacing.contentMaxWidth,
        marginTop: 56,
        marginBottom: 56,
      }}
    >
      {images.map((image, index) => (
        <figure key={index} style={{ margin: 0, borderRadius: 12, overflow: 'hidden' }}>
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </figure>
      ))}
    </div>
  );
}

// Render a single content block
function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  const { colors, fonts, typography, spacing } = caseStudyTokens;

  switch (block.type) {
    case 'section-label':
      return (
        <p
          style={{
            fontFamily: fonts.ui,
            fontSize: typography.sectionLabel.size,
            fontWeight: typography.sectionLabel.weight,
            letterSpacing: typography.sectionLabel.letterSpacing,
            lineHeight: typography.sectionLabel.lineHeight,
            textTransform: 'uppercase',
            color: colors.accent,
            marginTop: 100,
            marginBottom: 20,
          }}
        >
          {block.content as string}
        </p>
      );

    case 'heading-1':
      return (
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: typography.h1.size,
            fontWeight: typography.h1.weight,
            letterSpacing: typography.h1.letterSpacing,
            lineHeight: typography.h1.lineHeight,
            color: colors.text,
            marginTop: 12,
            marginBottom: 32,
            maxWidth: 640,
          }}
        >
          {block.content as string}
        </h2>
      );

    case 'heading-2':
      return (
        <h3
          id={block.sectionId}
          style={{
            fontFamily: fonts.display,
            fontSize: typography.h2.size,
            fontWeight: typography.h2.weight,
            letterSpacing: typography.h2.letterSpacing,
            lineHeight: typography.h2.lineHeight,
            color: colors.text,
            marginTop: 88,
            marginBottom: 28,
            maxWidth: 640,
            scrollMarginTop: 100,
          }}
        >
          {block.content as string}
        </h3>
      );

    case 'heading-3':
      return (
        <h4
          style={{
            fontFamily: fonts.body,
            fontSize: typography.h3.size,
            fontWeight: typography.h3.weight,
            letterSpacing: typography.h3.letterSpacing,
            lineHeight: typography.h3.lineHeight,
            color: colors.text,
            marginTop: 48,
            marginBottom: 18,
          }}
        >
          {block.content as string}
        </h4>
      );

    case 'paragraph':
      return (
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: block.isLead ? typography.lead.size : typography.body.size,
            fontWeight: typography.body.weight,
            lineHeight: block.isLead ? typography.lead.lineHeight : typography.body.lineHeight,
            letterSpacing: block.isLead ? typography.lead.letterSpacing : typography.body.letterSpacing,
            color: colors.text,
            marginBottom: 32,
          }}
          dangerouslySetInnerHTML={{ __html: block.content as string }}
        />
      );

    case 'quote':
      return (
        <blockquote
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.4,
            color: colors.text,
            borderLeft: `3px solid ${colors.accent}`,
            paddingLeft: 28,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 48,
            marginBottom: 48,
          }}
          dangerouslySetInnerHTML={{ __html: block.content as string }}
        />
      );

    case 'list':
      const ListTag = block.listType === 'ol' ? 'ol' : 'ul';
      return (
        <ListTag
          style={{
            fontFamily: fonts.body,
            fontSize: typography.body.size,
            lineHeight: typography.body.lineHeight,
            color: colors.text,
            paddingLeft: 24,
            marginTop: 20,
            marginBottom: 28,
          }}
          dangerouslySetInnerHTML={{ __html: block.content as string }}
        />
      );

    case 'code':
      return (
        <pre
          style={{
            fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 14,
            lineHeight: 1.65,
            color: colors.text,
            background: colors.surfaceAlt,
            padding: 28,
            borderRadius: 12,
            overflow: 'auto',
            marginTop: 36,
            marginBottom: 36,
            border: `1px solid ${colors.border}`,
          }}
        >
          <code>{block.content as string}</code>
        </pre>
      );

    case 'divider':
      return (
        <hr
          style={{
            border: 'none',
            height: 1,
            background: colors.border,
            marginTop: 64,
            marginBottom: 64,
          }}
        />
      );

    case 'image':
      return <ContentImage image={block.content as ImageData} />;

    case 'image-grid':
      return <ContentImageGrid images={block.content as ImageData[]} />;

    default:
      return null;
  }
}

export function CaseStudyContent({
  blocks,
  projectName,
  projectIcon,
  projectTags,
  publishedAt,
}: CaseStudyContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const { colors, fonts, typography, spacing } = caseStudyTokens;

  return (
    <motion.article
      variants={prefersReducedMotion ? {} : containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        maxWidth: spacing.contentMaxWidth,
        margin: '0 auto',
        padding: `0 ${spacing.contentPadding}px 120px`,
      }}
    >
      {/* Project Meta Section */}
      {(projectName || projectIcon) && (
        <motion.header
          variants={prefersReducedMotion ? {} : itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginBottom: 64,
            marginTop: -32,
          }}
        >
          {/* Project Icon */}
          {projectIcon && (
            <img
              src={projectIcon}
              alt=""
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                objectFit: 'cover',
              }}
            />
          )}

          <div>
            {/* Project Name */}
            {projectName && (
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: typography.metaName.size,
                  fontWeight: typography.metaName.weight,
                  letterSpacing: typography.metaName.letterSpacing,
                  color: colors.text,
                  marginBottom: 3,
                }}
              >
                {projectName}
              </p>
            )}

            {/* Tags/Type */}
            {projectTags && (
              <p
                style={{
                  fontFamily: fonts.body,
                  fontSize: typography.metaTags.size,
                  fontWeight: typography.metaTags.weight,
                  letterSpacing: typography.metaTags.letterSpacing,
                  color: colors.accent,
                  textTransform: 'uppercase',
                }}
              >
                {projectTags}
              </p>
            )}
          </div>
        </motion.header>
      )}

      {/* Content Blocks */}
      {blocks.map((block) => (
        <motion.div
          key={block.id}
          variants={prefersReducedMotion ? {} : itemVariants}
        >
          <ContentBlockRenderer block={block} />
        </motion.div>
      ))}

      {/* Global styles for content */}
      <style jsx global>{`
        /* Link styles */
        .casestudy-content a {
          color: ${colors.accent};
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.15s ease;
        }
        .casestudy-content a:hover {
          opacity: 0.75;
        }

        /* List item spacing */
        .casestudy-content li {
          margin-bottom: 10px;
        }

        /* Strong text */
        .casestudy-content strong {
          font-weight: 600;
        }

        /* Emphasis */
        .casestudy-content em {
          font-style: italic;
        }
      `}</style>
    </motion.article>
  );
}

// Deliverable link component (for external links)
export function DeliverableLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { colors, fonts } = caseStudyTokens;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: fonts.body,
        fontSize: 16,
        fontWeight: 600,
        color: colors.accent,
        textDecoration: 'none',
        transition: 'opacity 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.75';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {children}
      <ExternalLink size={15} />
    </a>
  );
}
