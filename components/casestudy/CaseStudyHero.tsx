'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { caseStudyTokens } from '@/lib/casestudy/types';

interface CaseStudyHeroProps {
  imageUrl: string | null;
  title: string;
}

export function CaseStudyHero({ imageUrl, title }: CaseStudyHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { colors, fonts, typography } = caseStudyTokens;

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
    initial: { scale: prefersReducedMotion ? 1 : 1.05 },
    animate: {
      scale: 1,
      transition: {
        duration: 1.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const titleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // If no image, show a minimal dark hero with title
  if (!imageUrl) {
    return (
      <div
        style={{
          width: '100vw',
          height: '60vh',
          minHeight: 400,
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          position: 'relative',
          overflow: 'hidden',
          background: colors.hero,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Title on hero */}
        <motion.h1
          variants={prefersReducedMotion ? {} : titleVariants}
          initial="initial"
          animate="animate"
          style={{
            fontFamily: fonts.display,
            fontSize: `clamp(40px, 8vw, ${typography.heroTitle.size}px)`,
            fontWeight: typography.heroTitle.weight,
            fontStyle: 'italic',
            letterSpacing: typography.heroTitle.letterSpacing,
            lineHeight: typography.heroTitle.lineHeight,
            color: colors.heroText,
            textAlign: 'center',
            maxWidth: 900,
            padding: '0 24px',
          }}
        >
          {title}
        </motion.h1>

        {/* Decorative dot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: 140,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.heroText,
          }}
        />

        {/* Curved wave transition */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: colors.background,
            borderRadius: '100% 100% 0 0 / 100% 100% 0 0',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '75vh',
        minHeight: 500,
        maxHeight: 850,
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        position: 'relative',
        overflow: 'hidden',
        background: colors.hero,
      }}
    >
      {/* Image with zoom animation */}
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

        {/* Dark overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        />
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
          padding: '0 24px',
          paddingBottom: 80, // Account for wave
        }}
      >
        <motion.h1
          variants={prefersReducedMotion ? {} : titleVariants}
          initial="initial"
          animate={imageLoaded ? 'animate' : 'initial'}
          style={{
            fontFamily: fonts.display,
            fontSize: `clamp(40px, 8vw, ${typography.heroTitle.size}px)`,
            fontWeight: typography.heroTitle.weight,
            fontStyle: 'italic',
            letterSpacing: typography.heroTitle.letterSpacing,
            lineHeight: typography.heroTitle.lineHeight,
            color: colors.heroText,
            textAlign: 'center',
            maxWidth: 900,
            textShadow: '0 2px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {title}
        </motion.h1>

        {/* Decorative dot below title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          style={{
            marginTop: 24,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.heroText,
          }}
        />
      </div>

      {/* Curved wave transition to content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: colors.background,
          borderRadius: '100% 100% 0 0 / 100% 100% 0 0',
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
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `2px solid rgba(255,255,255,0.3)`,
              borderTopColor: 'rgba(255,255,255,0.8)',
              animation: 'casestudy-spin 1s linear infinite',
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
