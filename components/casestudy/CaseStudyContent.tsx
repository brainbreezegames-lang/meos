'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { caseStudyTokens, type ContentBlock, type ImageData, type InfoGridItem, type CardGridItem, type ProcessStepperItem, type ComparisonData } from '@/lib/casestudy/types';

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

// Info grid — project metadata displayed as a ruled definition list
function ContentInfoGrid({ items }: { items: InfoGridItem[] }) {
  const { colors, fonts, typography } = caseStudyTokens;

  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
        gap: 0,
        margin: 0,
        marginTop: 48,
        marginBottom: 56,
        padding: '28px 0 0',
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            paddingRight: 24,
          }}
        >
          <dt
            style={{
              fontFamily: fonts.ui,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginBottom: 8,
            }}
          >
            {item.label}
          </dt>
          <dd
            style={{
              margin: 0,
              fontFamily: fonts.body,
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.5,
              color: colors.text,
            }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Callout — highlighted insight with left accent and tinted background
function ContentCallout({ html, variant = 'insight' }: { html: string; variant?: 'insight' | 'warning' | 'success' }) {
  const { colors, fonts } = caseStudyTokens;

  const accentMap = {
    insight: colors.accent,
    warning: 'var(--cs-warning, #e8a317)',
    success: 'var(--cs-success, #16a34a)',
  };

  const bgMap = {
    insight: 'var(--cs-callout-bg, rgba(255, 119, 34, 0.04))',
    warning: 'var(--cs-callout-warning-bg, rgba(232, 163, 23, 0.04))',
    success: 'var(--cs-callout-success-bg, rgba(22, 163, 74, 0.04))',
  };

  return (
    <aside
      style={{
        position: 'relative',
        marginTop: 48,
        marginBottom: 48,
        padding: '28px 32px',
        background: bgMap[variant],
        borderRadius: 2,
        borderLeft: `3px solid ${accentMap[variant]}`,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      className="cs-callout"
    />
  );
}

// Card grid — stakeholder or feature cards in an even row
function ContentCardGrid({ cards }: { cards: CardGridItem[] }) {
  const { colors, fonts, typography } = caseStudyTokens;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(cards.length, 3)}, 1fr)`,
        gap: 20,
        marginTop: 40,
        marginBottom: 48,
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            padding: '28px 24px',
            background: colors.surface,
            borderRadius: 14,
            border: `1px solid ${colors.border}`,
          }}
        >
          {card.icon && (
            <span
              style={{
                display: 'block',
                fontSize: 28,
                marginBottom: 16,
                lineHeight: 1,
              }}
            >
              {card.icon}
            </span>
          )}
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              fontWeight: 600,
              color: colors.text,
              marginBottom: 10,
              letterSpacing: '-0.01em',
            }}
          >
            {card.title}
          </p>
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.6,
              color: colors.textMuted,
              margin: 0,
            }}
          >
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}

// Process stepper — numbered design phases connected by a timeline
function ContentProcessStepper({ steps }: { steps: ProcessStepperItem[] }) {
  const { colors, fonts } = caseStudyTokens;

  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        marginTop: 48,
        marginBottom: 56,
        position: 'relative',
      }}
    >
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: '50%',
                right: '-50%',
                height: 2,
                background: colors.border,
                zIndex: 0,
              }}
            />
          )}

          {/* Step number circle */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: colors.text,
              color: colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.ui,
              fontSize: 13,
              fontWeight: 700,
              position: 'relative',
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            {String(step.number).padStart(2, '0')}
          </div>

          {/* Label */}
          <p
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              fontWeight: 600,
              color: colors.text,
              marginTop: 14,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {step.label}
          </p>

          {/* Description */}
          {step.description && (
            <p
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                fontWeight: 400,
                color: colors.textMuted,
                marginTop: 6,
                textAlign: 'center',
                lineHeight: 1.5,
                maxWidth: 140,
              }}
            >
              {step.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Key takeaway — distinct learning summary block
function ContentKeyTakeaway({ html }: { html: string }) {
  const { colors, fonts } = caseStudyTokens;

  return (
    <aside
      style={{
        position: 'relative',
        marginTop: 48,
        marginBottom: 48,
        padding: '28px 32px 28px 32px',
        background: colors.surfaceAlt,
        borderRadius: 12,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.ui,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: colors.textMuted,
          marginBottom: 14,
        }}
      >
        Key Takeaway
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="cs-key-takeaway"
      />
    </aside>
  );
}

// Tool badges — row of tool/technology pill badges
function ContentToolBadges({ tools }: { tools: string[] }) {
  const { colors, fonts } = caseStudyTokens;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 24,
        marginBottom: 40,
      }}
    >
      {tools.map((tool, i) => (
        <span
          key={i}
          style={{
            fontFamily: fonts.ui,
            fontSize: 12,
            fontWeight: 600,
            color: colors.text,
            background: colors.surfaceAlt,
            border: `1px solid ${colors.border}`,
            borderRadius: 100,
            padding: '6px 16px',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {tool}
        </span>
      ))}
    </div>
  );
}

// Comparison — before/after side-by-side
function ContentComparison({ data }: { data: ComparisonData }) {
  const { colors, fonts } = caseStudyTokens;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginTop: 48,
        marginBottom: 56,
      }}
    >
      {/* Before */}
      <div
        style={{
          padding: '28px 24px',
          background: colors.surfaceAlt,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.ui,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.textMuted,
            marginBottom: 16,
          }}
        >
          {data.beforeLabel}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.65,
            color: colors.text,
          }}
          dangerouslySetInnerHTML={{ __html: data.beforeContent }}
        />
      </div>

      {/* After */}
      <div
        style={{
          padding: '28px 24px',
          background: colors.surface,
          borderRadius: 14,
          border: `2px solid ${colors.accent}`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.ui,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: colors.accent,
            marginBottom: 16,
          }}
        >
          {data.afterLabel}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.65,
            color: colors.text,
          }}
          dangerouslySetInnerHTML={{ __html: data.afterContent }}
        />
      </div>
    </div>
  );
}

// Render a single content block
function ContentBlockRenderer({ block, phaseNumber }: { block: ContentBlock; phaseNumber?: number }) {
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
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
          }}
        >
          {phaseNumber != null && (
            <span
              style={{
                fontFamily: fonts.ui,
                fontSize: 13,
                fontWeight: 700,
                color: colors.accent,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              {String(phaseNumber).padStart(2, '0')}
            </span>
          )}
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
            fontFamily: 'var(--font-mono)',
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

    case 'info-grid':
      return <ContentInfoGrid items={block.content as InfoGridItem[]} />;

    case 'callout':
      return <ContentCallout html={block.content as string} variant={block.variant} />;

    case 'card-grid':
      return <ContentCardGrid cards={block.content as CardGridItem[]} />;

    case 'process-stepper':
      return <ContentProcessStepper steps={block.content as ProcessStepperItem[]} />;

    case 'key-takeaway':
      return <ContentKeyTakeaway html={block.content as string} />;

    case 'tool-badges':
      return <ContentToolBadges tools={block.content as string[]} />;

    case 'comparison':
      return <ContentComparison data={block.content as ComparisonData} />;

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

  // Compute phase numbers for heading-2 blocks
  const phaseMap = useMemo(() => {
    const map = new Map<string, number>();
    let phase = 0;
    for (const block of blocks) {
      if (block.type === 'heading-2') {
        phase++;
        map.set(block.id, phase);
      }
    }
    return map;
  }, [blocks]);

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
          <ContentBlockRenderer block={block} phaseNumber={phaseMap.get(block.id)} />
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

        /* Callout block inner typography */
        .cs-callout p {
          font-family: ${fonts.body};
          font-size: 16px;
          font-weight: 400;
          line-height: 1.65;
          color: ${colors.text};
          margin: 0 0 12px;
        }
        .cs-callout p:last-child {
          margin-bottom: 0;
        }
        .cs-callout strong {
          font-weight: 600;
        }

        /* Key takeaway block inner typography */
        .cs-key-takeaway p {
          font-family: ${fonts.body};
          font-size: 16px;
          font-weight: 400;
          line-height: 1.65;
          color: ${colors.text};
          margin: 0 0 12px;
        }
        .cs-key-takeaway p:last-child {
          margin-bottom: 0;
        }
        .cs-key-takeaway strong {
          font-weight: 600;
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
