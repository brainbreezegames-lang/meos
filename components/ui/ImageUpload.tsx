'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | '16/9' | '4/3';
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  label,
  className,
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or GIF image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (_err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative rounded-xl overflow-hidden transition-all',
          aspectRatioClass[aspectRatio],
          isUploading && 'pointer-events-none',
          className
        )}
        style={{
          background: 'var(--bg-elevated)',
          border: `2px dashed ${error ? 'var(--accent-danger)' : 'var(--border-medium)'}`,
        }}
      >
        {value ? (
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              Click to upload
            </span>
          </div>
        )}

        {isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {value && !isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <span className="text-[12px] font-medium text-white">Change image</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <span className="text-[11px]" style={{ color: 'var(--accent-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
