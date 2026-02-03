'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SPRING, REDUCED_MOTION } from '@/lib/animations';

type CardVariant = 'soft' | 'raised';
type CardHover = 'lift' | 'glow' | 'none';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  hover?: CardHover;
  padding?: CardPadding;
  as?: 'div' | 'article' | 'section';
  children: React.ReactNode;
}

const paddingMap: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const hoverAnimations: Record<CardHover, { whileHover: object; whileTap: object }> = {
  lift: {
    whileHover: { y: -4, boxShadow: 'var(--shadow-lg)' },
    whileTap: { y: -2, boxShadow: 'var(--shadow-md)' },
  },
  glow: {
    whileHover: { boxShadow: '0 0 20px -5px var(--color-accent-primary-glow)' },
    whileTap: { boxShadow: '0 0 10px -5px var(--color-accent-primary-glow)' },
  },
  none: {
    whileHover: {},
    whileTap: {},
  },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'soft',
    hover = 'none',
    padding = 'md',
    as = 'div',
    children,
    onClick,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    const variantClass = variant === 'soft' ? 'card-soft' : 'card-raised';
    const isInteractive = hover !== 'none' || onClick;

    const hoverProps = prefersReducedMotion
      ? {}
      : hoverAnimations[hover];

    // Use motion.div for all cases - the 'as' prop is for semantic purposes
    // We'll set the role and other semantic attributes accordingly
    return (
      <motion.div
        ref={ref}
        className={cn(
          variantClass,
          paddingMap[padding],
          isInteractive && 'cursor-pointer',
          className
        )}
        role={as === 'article' ? 'article' : as === 'section' ? 'region' : undefined}
        onClick={onClick}
        whileHover={hoverProps.whileHover}
        whileTap={isInteractive ? hoverProps.whileTap : undefined}
        transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.gentle}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents for composition
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[var(--color-text-secondary)]', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
