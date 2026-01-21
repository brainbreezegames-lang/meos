'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { caseStudyTokens } from '@/lib/casestudy/types';

interface CaseStudyHeroProps {
  imageUrl: string | null;
  title: string;
  subtitle?: string | null;
}

// Extract first word for watermark effect
function getWatermarkText(title: string): string {
  const words = title.split(' ');
  // Use first word, or first two if first is short
  if (words[0].length <= 3 && words.length > 1) {
    return words.slice(0, 2).join(' ');
  }
  return words[0];
}

export function CaseStudyHero({ imageUrl, title, subtitle }: CaseStudyHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { colors, fonts, typography } = caseStudyTokens;

  const watermarkText = getWatermarkText(title);

  // Preload image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Animation variants
  const imageVariants = {
    initial: { scale: prefersReducedMotion ? 1 : 1.03 },
    animate: {
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const watermarkVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const titleVariants = {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // If no image, show a warm cream hero with title and watermark
  if (!imageUrl) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '70vh',
          position: 'relative',
          overflow: 'hidden',
          background: colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 80,
          paddingBottom: 120,
        }}
      >
        {/* Watermark text - massive faded background text */}
        <motion.div
          variants={prefersReducedMotion ? {} : watermarkVariants}
          initial="initial"
          animate="animate"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: fonts.display,
            fontSize: 'clamp(120px, 25vw, 320px)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 0.85,
            color: colors.watermark,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {watermarkText}
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={prefersReducedMotion ? {} : titleVariants}
          initial="initial"
          animate="animate"
          style={{
            position: 'relative',
            zIndex: 1,
            fontFamily: fonts.display,
            fontSize: `clamp(36px, 7vw, ${typography.heroTitle.size}px)`,
            fontWeight: typography.heroTitle.weight,
            letterSpacing: typography.heroTitle.letterSpacing,
            lineHeight: typography.heroTitle.lineHeight,
            color: colors.text,
            textAlign: 'center',
            maxWidth: 900,
            padding: '0 32px',
          }}
        >
          {title}
        </motion.h1>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '80vh',
        minHeight: 550,
        maxHeight: 900,
        position: 'relative',
        overflow: 'hidden',
        background: colors.hero,
      }}
    >
      {/* Image with subtle zoom animation */}
      <motion.div
        variants={imageVariants}
        initial="initial"
        animate={imageLoaded ? 'animate' : 'initial'}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        <img
          src={imageUrl}
          alt=""
          onLoad={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />

        {/* Gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </motion.div>

      {/* Watermark text on hero - positioned lower */}
      <motion.div
        variants={prefersReducedMotion ? {} : watermarkVariants}
        initial="initial"
        animate={imageLoaded ? 'animate' : 'initial'}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 160,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: fonts.display,
          fontSize: 'clamp(100px, 20vw, 280px)',
          fontWeight: 800,
          letterSpacing: '-0.05em',
          lineHeight: 0.85,
          color: 'rgba(255, 255, 255, 0.08)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {watermarkText}
      </motion.div>

      {/* Title centered on hero */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          paddingBottom: 100,
        }}
      >
        <motion.h1
          variants={prefersReducedMotion ? {} : titleVariants}
          initial="initial"
          animate={imageLoaded ? 'animate' : 'initial'}
          style={{
            fontFamily: fonts.display,
            fontSize: `clamp(36px, 7vw, ${typography.heroTitle.size}px)`,
            fontWeight: typography.heroTitle.weight,
            letterSpacing: typography.heroTitle.letterSpacing,
            lineHeight: typography.heroTitle.lineHeight,
            color: colors.heroText,
            textAlign: 'center',
            maxWidth: 900,
            textShadow: '0 4px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          {title}
        </motion.h1>

        {/* Optional subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: imageLoaded ? 0.9 : 0, y: imageLoaded ? 0 : 16 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              marginTop: 20,
              fontFamily: fonts.body,
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: colors.heroText,
              textAlign: 'center',
              maxWidth: 600,
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Curved wave transition to content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: colors.background,
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }}
      />

      {/* Loading state */}
      {!imageLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: 'rgba(255,255,255,0.7)',
              animation: 'casestudy-spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes casestudy-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
