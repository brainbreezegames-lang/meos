'use client';

import { forwardRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Check, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRING, REDUCED_MOTION, toast as toastVariants } from '@/lib/animations';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastProps {
  id: string;
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onDismiss?: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  info: <Info size={18} />,
  success: <Check size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
};

const typeStyles: Record<ToastType, string> = {
  info: 'text-[#1d4ed8]',
  success: 'text-[var(--color-success)]',
  error: 'text-[var(--color-error)]',
  warning: 'text-[#854d0e]',
};

const bgStyles: Record<ToastType, string> = {
  info: 'bg-[rgba(59,130,246,0.1)]',
  success: 'bg-[var(--color-success-subtle)]',
  error: 'bg-[var(--color-error-subtle)]',
  warning: 'bg-[var(--color-warning-subtle)]',
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ id, type = 'info', message, description, duration = 4000, onDismiss }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          onDismiss?.(id);
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [id, duration, onDismiss]);

    return (
      <motion.div
        ref={ref}
        layout
        initial={prefersReducedMotion ? { opacity: 0 } : toastVariants.initial}
        animate={prefersReducedMotion ? { opacity: 1 } : toastVariants.animate}
        exit={prefersReducedMotion ? { opacity: 0 } : toastVariants.exit}
        transition={prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.bouncy}
        className={cn(
          'pointer-events-auto',
          'flex items-start gap-3 min-w-[280px] max-w-[420px]',
          'px-4 py-3 rounded-[var(--radius-lg)]',
          'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]',
          'shadow-[var(--shadow-dropdown)]',
          'backdrop-blur-sm'
        )}
      >
        {/* Icon */}
        <div className={cn('flex-shrink-0 p-1.5 rounded-full', bgStyles[type], typeStyles[type])}>
          {icons[type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[14px] font-medium text-[var(--color-text-primary)] leading-tight">
            {message}
          </p>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)] leading-snug">
              {description}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss?.(id)}
          className={cn(
            'flex-shrink-0 p-1 rounded-[var(--radius-sm)]',
            'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-bg-subtle-hover)]',
            'transition-colors duration-150'
          )}
        >
          <X size={16} />
        </button>
      </motion.div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast container - positions toasts at bottom right
interface ToastContainerProps {
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionStyles: Record<string, string> = {
  'top-right': 'top-4 right-4 flex-col',
  'top-left': 'top-4 left-4 flex-col',
  'bottom-right': 'bottom-4 right-4 flex-col-reverse',
  'bottom-left': 'bottom-4 left-4 flex-col-reverse',
};

export const ToastContainer = ({
  toasts,
  onDismiss,
  position = 'bottom-right',
}: ToastContainerProps) => {
  return (
    <div
      className={cn(
        'fixed z-[var(--z-tooltip)] pointer-events-none',
        'flex gap-2',
        positionStyles[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
