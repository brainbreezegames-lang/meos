'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    const variants = {
      primary: 'text-white hover:brightness-110 focus-visible:ring-[var(--accent-primary)]',
      secondary: 'border hover:brightness-95 focus-visible:ring-[var(--accent-primary)]',
      ghost: 'hover:bg-black/5 focus-visible:ring-[var(--accent-primary)]',
      danger: 'text-white hover:brightness-110 focus-visible:ring-[var(--accent-danger)]',
    };

    const variantStyles = {
      primary: {
        background: 'var(--accent-primary)',
        boxShadow: 'var(--shadow-button)',
      },
      secondary: {
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-medium)',
        color: 'var(--text-primary)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--text-primary)',
      },
      danger: {
        background: 'var(--accent-danger)',
        boxShadow: 'var(--shadow-button)',
      },
    };

    const sizes = {
      sm: 'text-[12px] px-3 py-1.5 min-h-[32px]',
      md: 'text-[13px] px-4 py-2 min-h-[36px]',
      lg: 'text-[14px] px-5 py-2.5 min-h-[44px]',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={variantStyles[variant]}
        disabled={disabled || isLoading}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.1 }}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
