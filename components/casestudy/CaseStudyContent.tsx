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
      staggerChildren: 0.04,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Single image component
function ContentImage({ image }: { image: ImageData }) {
  const { spacing } = caseStudyTokens;
  const isFullWidth = image.layout === 'full-width';

  return (
    <figure
      style={{
        margin: 0,
        padding: 0,
        ...(isFullWidth
          ? {
              // Break out of content container but don't go full viewport
              // Stay within a reasonable max-width to avoid sidebar overlap
              width: 'calc(100% + 120px)',
              maxWidth: 1000,
              marginLeft: -60,
              marginRight: -60,
              marginTop: 48,
              marginBottom: 48,
            }
          : {
              width: '100%',
              maxWidth: spacing.contentMaxWidth,
              marginTop: 32,
              marginBottom: 32,
            }),
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
          ...(isFullWidth
            ? {}
            : {
                borderRadius: 8,
              }),
        }}
      />
      {image.caption && (
        <figcaption
          style={{
            marginTop: 12,
            fontFamily: caseStudyTokens.fonts.ui,
            fontSize: 14,
            color: caseStudyTokens.colors.textMuted,
            textAlign: 'center',
          }}
        >
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Image grid component (2-up or 3-up)
function ContentImageGrid({ images }: { images: ImageData[] }) {
  const columns = images.length >= 3 ? 3 : 2;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
        // Break out of content container but stay within bounds
        width: 'calc(100% + 120px)',
        maxWidth: 1000,
        marginLeft: -60,
        marginRight: -60,
        marginTop: 48,
        marginBottom: 48,
      }}
    >
      {images.map((image, index) => (
        <figure key={index} style={{ margin: 0 }}>
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
            color: colors.textMuted,
            marginTop: 72,
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
            marginTop: 8,
            marginBottom: 28,
            maxWidth: 600,
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
            marginTop: 64,
            marginBottom: 24,
            maxWidth: 600,
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
            marginTop: 40,
            marginBottom: 16,
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
            lineHeight: typography.body.lineHeight,
            color: colors.text,
            marginBottom: 24,
          }}
          dangerouslySetInnerHTML={{ __html: block.content as string }}
        />
      );

    case 'quote':
      return (
        <blockquote
          style={{
            fontFamily: fonts.display,
            fontSize: 22,
            fontStyle: 'italic',
            lineHeight: 1.5,
            color: colors.text,
            borderLeft: `2px solid ${colors.border}`,
            paddingLeft: 24,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 40,
            marginBottom: 40,
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
            marginTop: 16,
            marginBottom: 24,
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
            lineHeight: 1.6,
            color: colors.text,
            background: colors.borderLight,
            padding: 24,
            borderRadius: 8,
            overflow: 'auto',
            marginTop: 32,
            marginBottom: 32,
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
            marginTop: 56,
            marginBottom: 56,
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
        padding: `0 ${spacing.contentPadding}px 96px`,
      }}
    >
      {/* Project Meta Section */}
      {(projectName || projectIcon) && (
        <motion.header
          variants={prefersReducedMotion ? {} : itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
            marginTop: -40, // Pull up into curved wave area
          }}
        >
          {/* Project Icon */}
          {projectIcon && (
            <img
              src={projectIcon}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
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
                  color: colors.text,
                  marginBottom: 4,
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
                  color: colors.textMuted,
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
          color: ${colors.text};
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
          transition: opacity 0.15s ease;
        }
        .casestudy-content a:hover {
          opacity: 0.7;
        }

        /* List item spacing */
        .casestudy-content li {
          margin-bottom: 8px;
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
        gap: 6,
        fontFamily: fonts.body,
        fontSize: 16,
        color: colors.text,
        textDecoration: 'none',
        transition: 'opacity 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = 'none';
      }}
    >
      {children}
      <ExternalLink size={14} style={{ opacity: 0.6 }} />
    </a>
  );
}
