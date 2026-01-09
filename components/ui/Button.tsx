'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'text-white hover:brightness-110',
      secondary: 'border hover:brightness-95',
      ghost: 'hover:bg-black/5',
      danger: 'text-white hover:brightness-110',
    };

    const variantStyles = {
      primary: {
        background: 'var(--accent-primary)',
        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
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
        boxShadow: '0 2px 8px rgba(255, 59, 48, 0.3)',
      },
    };

    const sizes = {
      sm: 'text-[12px] px-3 py-1.5',
      md: 'text-[13px] px-4 py-2',
      lg: 'text-[14px] px-5 py-2.5',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={variantStyles[variant]}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
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
