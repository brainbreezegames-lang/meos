'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'accent' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success-subtle)] text-[#166534]',
  warning: 'bg-[var(--color-warning-subtle)] text-[#854d0e]',
  accent: 'bg-[var(--color-accent-primary-subtle)] text-[var(--color-accent-primary)]',
  info: 'bg-[rgba(59,130,246,0.1)] text-[#1d4ed8]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-[12px] px-2.5 py-1',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-[var(--radius-sm)] whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Pill variant - fully rounded, for status indicators
export const BadgePill = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BadgePill.displayName = 'BadgePill';

// Dot badge - small indicator dot with optional label
interface DotBadgeProps extends Omit<BadgeProps, 'size'> {
  dot?: 'success' | 'warning' | 'error' | 'default';
}

const dotColors: Record<string, string> = {
  default: 'bg-[var(--color-text-muted)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
};

export const DotBadge = forwardRef<HTMLSpanElement, DotBadgeProps>(
  ({ className, dot = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 text-[12px] text-[var(--color-text-secondary)]',
          className
        )}
        {...props}
      >
        <span className={cn('w-2 h-2 rounded-full', dotColors[dot])} />
        {children}
      </span>
    );
  }
);

DotBadge.displayName = 'DotBadge';
