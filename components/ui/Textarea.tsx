'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[12px] font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-[13px] transition-all resize-none',
            'focus:outline-none',
            error && 'border-[var(--accent-danger)]',
            className
          )}
          style={{
            background: 'var(--bg-elevated)',
            border: `1px solid ${error ? 'var(--accent-danger)' : 'var(--border-medium)'}`,
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && (
          <span
            className="text-[11px]"
            style={{ color: 'var(--accent-danger)' }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
