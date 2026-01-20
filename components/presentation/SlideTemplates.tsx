'use client';

import React from 'react';
import type { Slide, SlideContent } from '@/lib/presentation/parser';
import type { PresentationTheme } from '@/lib/presentation/themes';

/**
 * Typography System - Fixed, beautiful defaults
 *
 * Based on a modular scale (1.333 - perfect fourth)
 * Base: 24px for body text at 1920x1080
 */
const typography = {
  // Display sizes (for titles, section headers)
  title: 'clamp(48px, 5vw, 72px)',           // Title slide main
  section: 'clamp(42px, 4.5vw, 64px)',       // Section headers
  heading: 'clamp(32px, 3.5vw, 48px)',       // Slide headings
  subheading: 'clamp(24px, 2.5vw, 32px)',    // Subtitles

  // Body sizes
  body: 'clamp(18px, 2vw, 24px)',            // Paragraph text
  list: 'clamp(20px, 2.2vw, 28px)',          // List items
  quote: 'clamp(24px, 3vw, 36px)',           // Quote text
  stat: 'clamp(72px, 10vw, 120px)',          // Big numbers

  // Small text
  caption: 'clamp(14px, 1.5vw, 18px)',       // Captions, attribution
  meta: 'clamp(12px, 1.2vw, 14px)',          // Author, date

  // Line heights
  tight: 1.15,
  normal: 1.5,
  relaxed: 1.7,

  // Letter spacing
  tightSpacing: '-0.02em',
  normalSpacing: '0',
  wideSpacing: '0.05em',
};

/**
 * Spacing System - 8px base unit
 */
const space = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
  xxl: '96px',
  slide: '80px', // Slide padding
};

interface SlideProps {
  slide: Slide;
  theme: PresentationTheme;
  size?: 'full' | 'thumbnail';
}

/**
 * Main Slide component - renders any slide template
 */
export function SlideRenderer({ slide, theme, size = 'full' }: SlideProps) {
  const scale = size === 'thumbnail' ? 0.167 : 1;
  const width = size === 'thumbnail' ? 320 : 1920;
  const height = size === 'thumbnail' ? 180 : 1080;

  const themeStyles: React.CSSProperties = {
    '--slide-bg': theme.colors.background,
    '--slide-surface': theme.colors.surface,
    '--slide-text': theme.colors.text,
    '--slide-text-muted': theme.colors.textMuted,
    '--slide-accent': theme.colors.accent,
    '--slide-accent-muted': theme.colors.accentMuted,
    '--slide-font-display': theme.fonts.display,
    '--slide-font-body': theme.fonts.body,
  } as React.CSSProperties;

  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        borderRadius: size === 'thumbnail' ? '4px' : 0,
      }}
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
          position: 'relative',
          ...themeStyles,
        }}
      >
        {renderTemplate(slide, theme)}
      </div>
    </div>
  );
}

/**
 * Render the appropriate template
 */
function renderTemplate(slide: Slide, theme: PresentationTheme) {
  switch (slide.template) {
    case 'title':
      return <TitleSlide content={slide.content} theme={theme} />;
    case 'section':
      return <SectionSlide content={slide.content} theme={theme} />;
    case 'content':
      return <ContentSlide content={slide.content} theme={theme} />;
    case 'image':
      return <ImageSlide content={slide.content} theme={theme} />;
    case 'image-text':
      return <ImageTextSlide content={slide.content} theme={theme} />;
    case 'quote':
      return <QuoteSlide content={slide.content} theme={theme} />;
    case 'list':
      return <ListSlide content={slide.content} theme={theme} />;
    case 'stat':
      return <StatSlide content={slide.content} theme={theme} />;
    case 'end':
      return <EndSlide content={slide.content} theme={theme} />;
    default:
      return <ContentSlide content={slide.content} theme={theme} />;
  }
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 1: TITLE SLIDE
// ─────────────────────────────────────────────────────────────

function TitleSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: space.slide,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Background image if provided */}
      {content.image && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            background: `url(${content.image}) center/cover no-repeat`,
          }}
        />
      )}

      <div style={{ position: 'relative', maxWidth: '1200px' }}>
        {/* Title */}
        <h1
          style={{
            fontSize: typography.title,
            fontFamily: theme.fonts.display,
            fontWeight: 700,
            lineHeight: typography.tight,
            letterSpacing: typography.tightSpacing,
            marginBottom: content.subheading ? space.lg : space.xl,
            color: theme.colors.text,
          }}
        >
          {content.heading}
        </h1>

        {/* Subtitle */}
        {content.subheading && (
          <p
            style={{
              fontSize: typography.subheading,
              fontFamily: theme.fonts.body,
              fontWeight: 400,
              lineHeight: typography.normal,
              color: theme.colors.textMuted,
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {content.subheading}
          </p>
        )}
      </div>

      {/* Author + Date - Bottom */}
      {(content.author || content.date) && (
        <div
          style={{
            position: 'absolute',
            bottom: space.slide,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: typography.meta,
              fontFamily: theme.fonts.body,
              color: theme.colors.textMuted,
              letterSpacing: typography.wideSpacing,
              textTransform: 'uppercase',
            }}
          >
            {content.author}
            {content.author && content.date && ' · '}
            {content.date}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 2: SECTION HEADER
// ─────────────────────────────────────────────────────────────

function SectionSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: space.slide,
      }}
    >
      {/* Accent line above */}
      <div
        style={{
          width: '60px',
          height: '4px',
          background: theme.colors.accent,
          marginBottom: space.lg,
        }}
      />

      <h2
        style={{
          fontSize: typography.section,
          fontFamily: theme.fonts.display,
          fontWeight: 700,
          lineHeight: typography.tight,
          letterSpacing: typography.tightSpacing,
          textAlign: 'center',
          maxWidth: '900px',
          color: theme.colors.text,
        }}
      >
        {content.heading}
      </h2>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 3: CONTENT SLIDE
// ─────────────────────────────────────────────────────────────

function ContentSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: space.slide,
        paddingLeft: '120px',
        paddingRight: '200px',
      }}
    >
      {/* Heading */}
      {content.heading && (
        <h3
          style={{
            fontSize: typography.heading,
            fontFamily: theme.fonts.display,
            fontWeight: 600,
            lineHeight: typography.tight,
            letterSpacing: typography.tightSpacing,
            marginBottom: space.lg,
            color: theme.colors.text,
          }}
        >
          {content.heading}
        </h3>
      )}

      {/* Body */}
      {content.body && (
        <p
          style={{
            fontSize: typography.body,
            fontFamily: theme.fonts.body,
            fontWeight: 400,
            lineHeight: typography.relaxed,
            color: theme.colors.text,
            maxWidth: '900px',
          }}
        >
          {content.body}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 4: IMAGE SLIDE (Full Bleed)
// ─────────────────────────────────────────────────────────────

function ImageSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: space.xl,
      }}
    >
      {/* Image container */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {content.image && (
          <img
            src={content.image}
            alt={content.caption || ''}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </div>

      {/* Caption */}
      {content.caption && (
        <p
          style={{
            marginTop: space.md,
            fontSize: typography.caption,
            fontFamily: theme.fonts.body,
            color: theme.colors.textMuted,
            textAlign: 'center',
          }}
        >
          {content.caption}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 5: IMAGE + TEXT SLIDE
// ─────────────────────────────────────────────────────────────

function ImageTextSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: space.xl,
        padding: space.slide,
        alignItems: 'center',
      }}
    >
      {/* Image - Left */}
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {content.image && (
          <img
            src={content.image}
            alt={content.caption || ''}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        )}
      </div>

      {/* Text - Right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {content.heading && (
          <h3
            style={{
              fontSize: typography.heading,
              fontFamily: theme.fonts.display,
              fontWeight: 600,
              lineHeight: typography.tight,
              letterSpacing: typography.tightSpacing,
              marginBottom: space.md,
              color: theme.colors.text,
            }}
          >
            {content.heading}
          </h3>
        )}

        {content.body && (
          <p
            style={{
              fontSize: typography.body,
              fontFamily: theme.fonts.body,
              fontWeight: 400,
              lineHeight: typography.relaxed,
              color: theme.colors.text,
            }}
          >
            {content.body}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 6: QUOTE SLIDE
// ─────────────────────────────────────────────────────────────

function QuoteSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: space.slide,
        paddingLeft: '160px',
        paddingRight: '160px',
      }}
    >
      {/* Opening quote mark */}
      <span
        style={{
          fontSize: '120px',
          fontFamily: theme.fonts.display,
          color: theme.colors.accentMuted,
          lineHeight: 1,
          marginBottom: '-40px',
          display: 'block',
        }}
      >
        "
      </span>

      {/* Quote text */}
      <blockquote
        style={{
          fontSize: typography.quote,
          fontFamily: theme.fonts.display,
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: typography.normal,
          textAlign: 'center',
          maxWidth: '900px',
          color: theme.colors.text,
          margin: 0,
        }}
      >
        {content.quote}
      </blockquote>

      {/* Attribution */}
      {content.attribution && (
        <cite
          style={{
            marginTop: space.lg,
            fontSize: typography.caption,
            fontFamily: theme.fonts.body,
            fontStyle: 'normal',
            fontWeight: 500,
            color: theme.colors.accent,
            letterSpacing: typography.wideSpacing,
            textTransform: 'uppercase',
          }}
        >
          — {content.attribution}
        </cite>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 7: LIST SLIDE
// ─────────────────────────────────────────────────────────────

function ListSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: space.slide,
        paddingLeft: '120px',
        paddingRight: '200px',
      }}
    >
      {/* Heading */}
      {content.heading && (
        <h3
          style={{
            fontSize: typography.heading,
            fontFamily: theme.fonts.display,
            fontWeight: 600,
            lineHeight: typography.tight,
            letterSpacing: typography.tightSpacing,
            marginBottom: space.xl,
            color: theme.colors.text,
          }}
        >
          {content.heading}
        </h3>
      )}

      {/* List */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {content.items?.map((item, index) => (
          <li
            key={index}
            style={{
              fontSize: typography.list,
              fontFamily: theme.fonts.body,
              fontWeight: 400,
              lineHeight: typography.normal,
              color: theme.colors.text,
              marginBottom: space.md,
              display: 'flex',
              alignItems: 'flex-start',
              gap: space.md,
            }}
          >
            {/* Custom bullet */}
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: theme.colors.accent,
                marginTop: '12px',
                flexShrink: 0,
              }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 8: STAT SLIDE
// ─────────────────────────────────────────────────────────────

function StatSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: space.slide,
      }}
    >
      {/* Big number */}
      <div
        style={{
          fontSize: typography.stat,
          fontFamily: theme.fonts.display,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: typography.tightSpacing,
          color: theme.colors.accent,
        }}
      >
        {content.stat_value}
      </div>

      {/* Label */}
      {content.stat_label && (
        <p
          style={{
            marginTop: space.lg,
            fontSize: typography.subheading,
            fontFamily: theme.fonts.body,
            fontWeight: 400,
            lineHeight: typography.normal,
            color: theme.colors.textMuted,
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          {content.stat_label}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 9: END SLIDE
// ─────────────────────────────────────────────────────────────

function EndSlide({ content, theme }: { content: SlideContent; theme: PresentationTheme }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: space.slide,
      }}
    >
      {/* Thank You */}
      <h2
        style={{
          fontSize: typography.section,
          fontFamily: theme.fonts.display,
          fontWeight: 700,
          lineHeight: typography.tight,
          marginBottom: space.lg,
          color: theme.colors.text,
        }}
      >
        Thank You
      </h2>

      {/* URL */}
      {content.url && (
        <a
          href={`https://${content.url}`}
          style={{
            fontSize: typography.subheading,
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            color: theme.colors.accent,
            textDecoration: 'none',
          }}
        >
          {content.url}
        </a>
      )}
    </div>
  );
}

export default SlideRenderer;
