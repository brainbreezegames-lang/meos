'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditContextSafe } from '@/contexts/EditContext';
import { cn } from '@/lib/utils';

interface EditableProps {
  id: string;
  children: React.ReactNode;
  editComponent: React.ReactNode;
  onSave?: (value: unknown) => void;
  className?: string;
  editClassName?: string;
  type?: 'text' | 'image' | 'custom';
}

export function Editable({
  id,
  children,
  editComponent,
  className,
  editClassName,
  type = 'custom',
}: EditableProps) {
  const context = useEditContextSafe();
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // If no context or not owner, just render children
  if (!context?.isOwner) {
    return <>{children}</>;
  }

  const isEditing = context.activeEditId === id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context.setActiveEditId(id);
  };

  return (
    <div
      ref={ref}
      data-editable={id}
      className={cn(
        'relative transition-all duration-200',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Editable indicator on hover */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              background: 'rgba(0, 122, 255, 0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(0, 122, 255, 0.15)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Pencil icon on hover */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            className="absolute -right-1 -top-1 w-5 h-5 rounded-full flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              background: 'rgba(0, 122, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <svg
              className="w-2.5 h-2.5 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 1.5l2 2M1 11l.7-2.8a.5.5 0 01.14-.24l6.66-6.66a.5.5 0 01.7 0l1.8 1.8a.5.5 0 010 .7L4.34 10.46a.5.5 0 01-.24.14L1 11z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content or Edit component */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            className={cn('relative', editClassName)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {editComponent}
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              cursor: type === 'text' ? 'text' : type === 'image' ? 'pointer' : 'default',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline text editor
interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function InlineTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = 'Type something...',
  multiline = false,
  className,
  autoFocus = true,
}: InlineTextEditorProps) {
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      // Place cursor at end
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (multiline && ref.current) {
      const textarea = ref.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [localValue, multiline]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setLocalValue(e.target.value);
    // Don't call onChange on every keystroke - only on blur for performance
  };

  const handleBlur = () => {
    // Only trigger onChange if value actually changed
    if (localValue !== value) {
      onChange(localValue);
    }
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Revert to original value on escape
      setLocalValue(value);
      onBlur?.();
    }
    if (!multiline && e.key === 'Enter') {
      // Save on enter for single-line inputs
      if (localValue !== value) {
        onChange(localValue);
      }
      onBlur?.();
    }
  };

  const baseClasses = cn(
    'w-full bg-transparent border-none outline-none resize-none',
    'text-inherit font-inherit leading-inherit',
    'placeholder:text-[var(--text-tertiary)]',
    className
  );

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={baseClasses}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
}

// Editable text wrapper (combines Editable + InlineTextEditor)
interface EditableTextProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export function EditableText({
  id,
  value,
  onChange,
  children,
  placeholder,
  multiline = false,
  className,
}: EditableTextProps) {
  const context = useEditContextSafe();

  return (
    <Editable
      id={id}
      type="text"
      className={className}
      editComponent={
        <InlineTextEditor
          value={value}
          onChange={onChange}
          onBlur={() => context?.setActiveEditId(null)}
          placeholder={placeholder}
          multiline={multiline}
        />
      }
    >
      {children}
    </Editable>
  );
}

// Editable image wrapper
interface EditableImageProps {
  id: string;
  value: string;
  onChange: (url: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function EditableImage({
  id: _id,
  value: _value,
  onChange,
  children,
  className,
}: EditableImageProps) {
  const context = useEditContextSafe();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      onChange(url);
      context?.setActiveEditId(null);
    } catch (error) {
      console.error('Upload failed:', error);
      context?.showToast('Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!context?.isOwner) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn('relative group cursor-pointer', className)}
      onClick={handleClick}
    >
      {children}

      {/* Overlay on hover */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
              <path d="M2 11l3-3 2 2 4-4 3 3" />
            </svg>
            Change
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
