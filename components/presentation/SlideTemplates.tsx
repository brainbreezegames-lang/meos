'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Slide, SlideContent } from '@/lib/presentation/parser';
import type { PresentationTheme } from '@/lib/presentation/themes';
import {
  transitions,
  titleVariants,
  sectionVariants,
  contentVariants,
  imageVariants,
  imageTextVariants,
  quoteVariants,
  wordStagger,
  wordVariant,
  listVariants,
  statVariants,
  endVariants,
  withDelay,
} from '@/lib/presentation/animations';

/**
 * Typography System - Fixed, beautiful defaults
 */
const typography = {
  title: 'clamp(48px, 5vw, 72px)',
  section: 'clamp(42px, 4.5vw, 64px)',
  heading: 'clamp(32px, 3.5vw, 48px)',
  subheading: 'clamp(24px, 2.5vw, 32px)',
  body: 'clamp(18px, 2vw, 24px)',
  list: 'clamp(20px, 2.2vw, 28px)',
  quote: 'clamp(24px, 3vw, 36px)',
  stat: 'clamp(72px, 10vw, 120px)',
  caption: 'clamp(14px, 1.5vw, 18px)',
  meta: 'clamp(12px, 1.2vw, 14px)',
  tight: 1.15,
  normal: 1.5,
  relaxed: 1.7,
  tightSpacing: '-0.02em',
  normalSpacing: '0',
  wideSpacing: '0.05em',
};

const space = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
  xxl: '96px',
  slide: '80px',
};

interface SlideProps {
  slide: Slide;
  theme: PresentationTheme;
  size?: 'full' | 'thumbnail';
}

export function SlideRenderer({ slide, theme, size = 'full' }: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(size === 'thumbnail' ? 0.167 : 1);

  const baseWidth = 1920;
  const baseHeight = 1080;

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
          const scaleX = containerWidth / baseWidth;
          const scaleY = containerHeight / baseHeight;
          const newScale = Math.min(scaleX, scaleY, 1);
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
          perspective: '1200px',
          ...themeStyles,
        }}
      >
        {renderTemplate(slide, theme, animate)}
      </div>
    </div>
  );
}

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

// ═══════════════════════════════════════════════════════════════════════════
// TITLE SLIDE - Dramatic zoom entrance
// ═══════════════════════════════════════════════════════════════════════════

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
      {content.image && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 1.2 } : false}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={shouldAnimate ? { duration: 1.2, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: `url(${content.image}) center/cover no-repeat`,
          }}
        />
      )}

      <div style={{ position: 'relative', maxWidth: '1200px' }}>
        <motion.h1
          initial={shouldAnimate ? titleVariants.heading.hidden : false}
          animate={titleVariants.heading.visible}
          transition={shouldAnimate ? transitions.hero : { duration: 0 }}
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

        {content.subheading && (
          <motion.p
            initial={shouldAnimate ? titleVariants.subtitle.hidden : false}
            animate={titleVariants.subtitle.visible}
            transition={shouldAnimate ? withDelay(transitions.primary, 0.3) : { duration: 0 }}
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

      {(content.author || content.date) && (
        <motion.div
          initial={shouldAnimate ? titleVariants.meta.hidden : false}
          animate={titleVariants.meta.visible}
          transition={shouldAnimate ? withDelay(transitions.secondary, 0.6) : { duration: 0 }}
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

// ═══════════════════════════════════════════════════════════════════════════
// SECTION SLIDE - Line wipe + dramatic text rise
// ═══════════════════════════════════════════════════════════════════════════

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
      <motion.div
        initial={shouldAnimate ? sectionVariants.line.hidden : false}
        animate={sectionVariants.line.visible}
        transition={shouldAnimate ? transitions.primary : { duration: 0 }}
        style={{
          width: '80px',
          height: '4px',
          background: theme.colors.accent,
          marginBottom: space.lg,
          transformOrigin: 'center',
        }}
      />

      <motion.h2
        initial={shouldAnimate ? sectionVariants.heading.hidden : false}
        animate={sectionVariants.heading.visible}
        transition={shouldAnimate ? withDelay(transitions.hero, 0.2) : { duration: 0 }}
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

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT SLIDE - Sweeping entrance from left
// ═══════════════════════════════════════════════════════════════════════════

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
      {content.heading && (
        <motion.h3
          initial={shouldAnimate ? contentVariants.heading.hidden : false}
          animate={contentVariants.heading.visible}
          transition={shouldAnimate ? transitions.hero : { duration: 0 }}
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

      {content.body && (
        <motion.p
          initial={shouldAnimate ? contentVariants.body.hidden : false}
          animate={contentVariants.body.visible}
          transition={shouldAnimate ? withDelay(transitions.primary, 0.25) : { duration: 0 }}
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

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE SLIDE - Ken Burns zoom reveal
// ═══════════════════════════════════════════════════════════════════════════

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
      <motion.div
        initial={shouldAnimate ? imageVariants.container.hidden : false}
        animate={imageVariants.container.visible}
        transition={shouldAnimate ? { duration: 1, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
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

      {content.caption && (
        <motion.p
          initial={shouldAnimate ? imageVariants.caption.hidden : false}
          animate={imageVariants.caption.visible}
          transition={shouldAnimate ? withDelay(transitions.secondary, 0.4) : { duration: 0 }}
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

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE-TEXT SLIDE - Split reveal from sides
// ═══════════════════════════════════════════════════════════════════════════

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
      <motion.div
        initial={shouldAnimate ? imageTextVariants.image.hidden : false}
        animate={imageTextVariants.image.visible}
        transition={shouldAnimate ? transitions.hero : { duration: 0 }}
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {content.heading && (
          <motion.h3
            initial={shouldAnimate ? imageTextVariants.heading.hidden : false}
            animate={imageTextVariants.heading.visible}
            transition={shouldAnimate ? withDelay(transitions.primary, 0.2) : { duration: 0 }}
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
            initial={shouldAnimate ? imageTextVariants.body.hidden : false}
            animate={imageTextVariants.body.visible}
            transition={shouldAnimate ? withDelay(transitions.secondary, 0.4) : { duration: 0 }}
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

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE SLIDE - Word-by-word cinematic reveal
// ═══════════════════════════════════════════════════════════════════════════

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
        perspective: '1000px',
      }}
    >
      <motion.span
        initial={shouldAnimate ? quoteVariants.mark.hidden : false}
        animate={quoteVariants.mark.visible}
        transition={shouldAnimate ? transitions.bouncy : { duration: 0 }}
        style={{
          fontSize: '140px',
          fontFamily: theme.fonts.display,
          color: theme.colors.accentMuted,
          lineHeight: 1,
          marginBottom: '-50px',
          display: 'block',
        }}
      >
        "
      </motion.span>

      <motion.blockquote
        initial="hidden"
        animate="visible"
        variants={shouldAnimate ? wordStagger : undefined}
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
          transformStyle: 'preserve-3d',
        }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={shouldAnimate ? wordVariant : undefined}
            transition={shouldAnimate ? transitions.reveal : { duration: 0 }}
            style={{
              display: 'inline-block',
              marginRight: '0.3em',
              transformOrigin: 'center bottom',
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.blockquote>

      {content.attribution && (
        <motion.cite
          initial={shouldAnimate ? quoteVariants.attribution.hidden : false}
          animate={quoteVariants.attribution.visible}
          transition={shouldAnimate ? withDelay(transitions.secondary, 0.8 + words.length * 0.04) : { duration: 0 }}
          style={{
            marginTop: space.xl,
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

// ═══════════════════════════════════════════════════════════════════════════
// LIST SLIDE - Cascading stagger with dramatic timing
// ═══════════════════════════════════════════════════════════════════════════

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
      {content.heading && (
        <motion.h3
          initial={shouldAnimate ? listVariants.heading.hidden : false}
          animate={listVariants.heading.visible}
          transition={shouldAnimate ? transitions.hero : { duration: 0 }}
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

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={shouldAnimate ? listVariants.container : undefined}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {content.items?.map((item, index) => (
          <motion.li
            key={index}
            variants={shouldAnimate ? listVariants.item : undefined}
            transition={shouldAnimate ? transitions.primary : { duration: 0 }}
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
            <motion.span
              variants={shouldAnimate ? listVariants.bullet : undefined}
              transition={shouldAnimate ? transitions.bouncy : { duration: 0 }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: theme.colors.accent,
                marginTop: '10px',
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

// ═══════════════════════════════════════════════════════════════════════════
// STAT SLIDE - Impact entrance with counting
// ═══════════════════════════════════════════════════════════════════════════

function StatSlide({ content, theme, animate }: TemplateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const statValue = content.stat_value || '0';
  const match = statValue.match(/^([\d,.]+)(.*)$/);
  const numericPart = match ? match[1].replace(/,/g, '') : '0';
  const suffix = match ? match[2] : '';
  const targetValue = parseFloat(numericPart) || 0;

  const [displayValue, setDisplayValue] = useState(shouldAnimate ? 0 : targetValue);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(targetValue);
      return;
    }

    setDisplayValue(0);
    const duration = 1500;
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out curve
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(targetValue * eased);
      setDisplayValue(currentValue);
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animateCount);
    }, 400);

    return () => clearTimeout(timeout);
  }, [targetValue, shouldAnimate]);

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
      <motion.div
        initial={shouldAnimate ? statVariants.number.hidden : false}
        animate={statVariants.number.visible}
        transition={shouldAnimate ? transitions.bouncy : { duration: 0 }}
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

      {content.stat_label && (
        <motion.p
          initial={shouldAnimate ? statVariants.label.hidden : false}
          animate={statVariants.label.visible}
          transition={shouldAnimate ? withDelay(transitions.secondary, 0.5) : { duration: 0 }}
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

// ═══════════════════════════════════════════════════════════════════════════
// END SLIDE - Satisfying finale
// ═══════════════════════════════════════════════════════════════════════════

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
      <motion.h2
        initial={shouldAnimate ? endVariants.heading.hidden : false}
        animate={endVariants.heading.visible}
        transition={shouldAnimate ? transitions.bouncy : { duration: 0 }}
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

      {content.url && (
        <motion.a
          initial={shouldAnimate ? endVariants.url.hidden : false}
          animate={endVariants.url.visible}
          transition={shouldAnimate ? withDelay(transitions.secondary, 0.4) : { duration: 0 }}
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
