'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Slide, SlideContent } from '@/lib/presentation/parser';
import type { PresentationTheme } from '@/lib/presentation/themes';
import {
  springs,
  fadeUp,
  fadeUpSubtle,
  slideFromLeft,
  slideFromRight,
  scaleIn,
  scaleInBouncy,
  growFromCenter,
  fadeIn,
  staggerWords,
  staggerItems,
  staggerSlide,
  listItem,
  listBullet,
  wordReveal,
  withDelay,
} from '@/lib/presentation/animations';

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
 * Scales to fit viewport when in full mode
 */
export function SlideRenderer({ slide, theme, size = 'full' }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(size === 'thumbnail' ? 0.167 : 1);

  // Base slide dimensions (16:9 aspect ratio)
  const baseWidth = 1920;
  const baseHeight = 1080;

  // Calculate scale to fit container
  useEffect(() => {
    if (size === 'thumbnail') {
      setScale(0.167);
      return;
    }

    const updateScale = () => {
      if (containerRef.current) {
        const container = containerRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;

          // Calculate scale to fit while maintaining 16:9 aspect ratio
          const scaleX = containerWidth / baseWidth;
          const scaleY = containerHeight / baseHeight;
          const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1

          setScale(newScale);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [size]);

  const containerWidth = size === 'thumbnail' ? 320 : '100%';
  const containerHeight = size === 'thumbnail' ? 180 : '100%';

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

  // Disable animations for thumbnails
  const animate = size !== 'thumbnail';

  return (
    <div
      ref={containerRef}
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'hidden',
        borderRadius: size === 'thumbnail' ? '4px' : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
          position: 'relative',
          flexShrink: 0,
          ...themeStyles,
        }}
      >
        {renderTemplate(slide, theme, animate)}
      </div>
    </div>
  );
}

/**
 * Render the appropriate template
 */
function renderTemplate(slide: Slide, theme: PresentationTheme, animate: boolean) {
  switch (slide.template) {
    case 'title':
      return <TitleSlide content={slide.content} theme={theme} animate={animate} />;
    case 'section':
      return <SectionSlide content={slide.content} theme={theme} animate={animate} />;
    case 'content':
      return <ContentSlide content={slide.content} theme={theme} animate={animate} />;
    case 'image':
      return <ImageSlide content={slide.content} theme={theme} animate={animate} />;
    case 'image-text':
      return <ImageTextSlide content={slide.content} theme={theme} animate={animate} />;
    case 'quote':
      return <QuoteSlide content={slide.content} theme={theme} animate={animate} />;
    case 'list':
      return <ListSlide content={slide.content} theme={theme} animate={animate} />;
    case 'stat':
      return <StatSlide content={slide.content} theme={theme} animate={animate} />;
    case 'end':
      return <EndSlide content={slide.content} theme={theme} animate={animate} />;
    default:
      return <ContentSlide content={slide.content} theme={theme} animate={animate} />;
  }
}

interface TemplateProps {
  content: SlideContent;
  theme: PresentationTheme;
  animate: boolean;
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 1: TITLE SLIDE
// Choreography: Background → Title → Subtitle → Author/Date
// ─────────────────────────────────────────────────────────────

function TitleSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
        <motion.div
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={{ opacity: 0.15 }}
          transition={shouldAnimate ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: `url(${content.image}) center/cover no-repeat`,
          }}
        />
      )}

      <div style={{ position: 'relative', maxWidth: '1200px' }}>
        {/* Title */}
        <motion.h1
          initial={shouldAnimate ? fadeUp.hidden : false}
          animate={fadeUp.visible}
          transition={shouldAnimate ? withDelay(springs.snappy, 100) : { duration: 0 }}
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
        </motion.h1>

        {/* Subtitle */}
        {content.subheading && (
          <motion.p
            initial={shouldAnimate ? fadeUpSubtle.hidden : false}
            animate={fadeUpSubtle.visible}
            transition={shouldAnimate ? withDelay(springs.smooth, 400) : { duration: 0 }}
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
          </motion.p>
        )}
      </div>

      {/* Author + Date - Bottom */}
      {(content.author || content.date) && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? withDelay(springs.gentle, 600) : { duration: 0 }}
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
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 2: SECTION HEADER
// Choreography: Accent line grows → Heading fades up
// ─────────────────────────────────────────────────────────────

function SectionSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
      {/* Accent line above - grows from center */}
      <motion.div
        initial={shouldAnimate ? growFromCenter.hidden : false}
        animate={growFromCenter.visible}
        transition={shouldAnimate ? springs.snappy : { duration: 0 }}
        style={{
          width: '60px',
          height: '4px',
          background: theme.colors.accent,
          marginBottom: space.lg,
          transformOrigin: 'center',
        }}
      />

      {/* Heading */}
      <motion.h2
        initial={shouldAnimate ? fadeUp.hidden : false}
        animate={fadeUp.visible}
        transition={shouldAnimate ? withDelay(springs.snappy, 200) : { duration: 0 }}
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
      </motion.h2>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 3: CONTENT SLIDE
// Choreography: Heading slides from left → Body fades up
// ─────────────────────────────────────────────────────────────

function ContentSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
        <motion.h3
          initial={shouldAnimate ? slideFromLeft.hidden : false}
          animate={slideFromLeft.visible}
          transition={shouldAnimate ? springs.snappy : { duration: 0 }}
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
        </motion.h3>
      )}

      {/* Body */}
      {content.body && (
        <motion.p
          initial={shouldAnimate ? fadeUpSubtle.hidden : false}
          animate={fadeUpSubtle.visible}
          transition={shouldAnimate ? withDelay(springs.smooth, 200) : { duration: 0 }}
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
        </motion.p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 4: IMAGE SLIDE (Full Bleed)
// Choreography: Image scales in → Caption fades up
// ─────────────────────────────────────────────────────────────

function ImageSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
      <motion.div
        initial={shouldAnimate ? scaleIn.hidden : false}
        animate={scaleIn.visible}
        transition={shouldAnimate ? springs.smooth : { duration: 0 }}
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
      </motion.div>

      {/* Caption */}
      {content.caption && (
        <motion.p
          initial={shouldAnimate ? fadeUpSubtle.hidden : false}
          animate={fadeUpSubtle.visible}
          transition={shouldAnimate ? withDelay(springs.gentle, 300) : { duration: 0 }}
          style={{
            marginTop: space.md,
            fontSize: typography.caption,
            fontFamily: theme.fonts.body,
            color: theme.colors.textMuted,
            textAlign: 'center',
          }}
        >
          {content.caption}
        </motion.p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 5: IMAGE + TEXT SLIDE
// Choreography: Image from left → Heading from right → Body fades
// ─────────────────────────────────────────────────────────────

function ImageTextSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
      <motion.div
        initial={shouldAnimate ? slideFromLeft.hidden : false}
        animate={slideFromLeft.visible}
        transition={shouldAnimate ? springs.snappy : { duration: 0 }}
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
      </motion.div>

      {/* Text - Right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {content.heading && (
          <motion.h3
            initial={shouldAnimate ? slideFromRight.hidden : false}
            animate={slideFromRight.visible}
            transition={shouldAnimate ? withDelay(springs.snappy, 150) : { duration: 0 }}
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
          </motion.h3>
        )}

        {content.body && (
          <motion.p
            initial={shouldAnimate ? fadeUpSubtle.hidden : false}
            animate={fadeUpSubtle.visible}
            transition={shouldAnimate ? withDelay(springs.smooth, 300) : { duration: 0 }}
            style={{
              fontSize: typography.body,
              fontFamily: theme.fonts.body,
              fontWeight: 400,
              lineHeight: typography.relaxed,
              color: theme.colors.text,
            }}
          >
            {content.body}
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 6: QUOTE SLIDE ✨
// Choreography: Quote mark bounces → Words reveal one-by-one → Attribution fades
// ─────────────────────────────────────────────────────────────

function QuoteSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;
  const words = content.quote?.split(' ') || [];

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
      {/* Opening quote mark - bouncy entrance */}
      <motion.span
        initial={shouldAnimate ? scaleInBouncy.hidden : false}
        animate={scaleInBouncy.visible}
        transition={shouldAnimate ? springs.bouncy : { duration: 0 }}
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
      </motion.span>

      {/* Quote text - word by word reveal */}
      <motion.blockquote
        initial="hidden"
        animate="visible"
        variants={shouldAnimate ? staggerWords : undefined}
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
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={shouldAnimate ? wordReveal : undefined}
            transition={shouldAnimate ? springs.gentle : { duration: 0 }}
            style={{ display: 'inline-block', marginRight: '0.3em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.blockquote>

      {/* Attribution */}
      {content.attribution && (
        <motion.cite
          initial={shouldAnimate ? fadeUpSubtle.hidden : false}
          animate={fadeUpSubtle.visible}
          transition={shouldAnimate ? withDelay(springs.gentle, 600 + words.length * 30) : { duration: 0 }}
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
        </motion.cite>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 7: LIST SLIDE ✨
// Choreography: Heading slides in → Items stagger one-by-one
// ─────────────────────────────────────────────────────────────

function ListSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
        <motion.h3
          initial={shouldAnimate ? slideFromLeft.hidden : false}
          animate={slideFromLeft.visible}
          transition={shouldAnimate ? springs.snappy : { duration: 0 }}
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
        </motion.h3>
      )}

      {/* List - staggered items */}
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={shouldAnimate ? staggerItems : undefined}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {content.items?.map((item, index) => (
          <motion.li
            key={index}
            variants={shouldAnimate ? listItem : undefined}
            transition={shouldAnimate ? springs.snappy : { duration: 0 }}
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
            {/* Custom bullet - scales in */}
            <motion.span
              variants={shouldAnimate ? listBullet : undefined}
              transition={shouldAnimate ? springs.bouncy : { duration: 0 }}
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
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 8: STAT SLIDE ✨
// Choreography: Number counts up with spring → Label fades up
// ─────────────────────────────────────────────────────────────

function StatSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  // Parse the stat value to extract number and suffix
  const statValue = content.stat_value || '0';
  const match = statValue.match(/^([\d,.]+)(.*)$/);
  const numericPart = match ? match[1].replace(/,/g, '') : '0';
  const suffix = match ? match[2] : '';
  const targetValue = parseFloat(numericPart) || 0;

  // Animated counter state
  const [displayValue, setDisplayValue] = useState(shouldAnimate ? 0 : targetValue);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(targetValue);
      return;
    }

    // Reset on mount for animation
    setDisplayValue(0);

    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(targetValue * eased);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    // Delay start to let scale animation begin
    const timeout = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, 200);

    return () => clearTimeout(timeout);
  }, [targetValue, shouldAnimate]);

  // Format the display value with commas
  const formattedValue = displayValue.toLocaleString();

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
      {/* Big number - bouncy scale entrance */}
      <motion.div
        initial={shouldAnimate ? scaleInBouncy.hidden : false}
        animate={scaleInBouncy.visible}
        transition={shouldAnimate ? springs.bouncy : { duration: 0 }}
        style={{
          fontSize: typography.stat,
          fontFamily: theme.fonts.display,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: typography.tightSpacing,
          color: theme.colors.accent,
        }}
      >
        {formattedValue}{suffix}
      </motion.div>

      {/* Label */}
      {content.stat_label && (
        <motion.p
          initial={shouldAnimate ? fadeUpSubtle.hidden : false}
          animate={fadeUpSubtle.visible}
          transition={shouldAnimate ? withDelay(springs.smooth, 300) : { duration: 0 }}
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
        </motion.p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 9: END SLIDE
// Choreography: Thank you scales in → URL slides up
// ─────────────────────────────────────────────────────────────

function EndSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

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
      {/* Thank You - satisfying spring entrance */}
      <motion.h2
        initial={shouldAnimate ? scaleInBouncy.hidden : false}
        animate={scaleInBouncy.visible}
        transition={shouldAnimate ? springs.bouncy : { duration: 0 }}
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
      </motion.h2>

      {/* URL */}
      {content.url && (
        <motion.a
          initial={shouldAnimate ? fadeUpSubtle.hidden : false}
          animate={fadeUpSubtle.visible}
          transition={shouldAnimate ? withDelay(springs.smooth, 300) : { duration: 0 }}
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
        </motion.a>
      )}
    </div>
  );
}

export default SlideRenderer;
