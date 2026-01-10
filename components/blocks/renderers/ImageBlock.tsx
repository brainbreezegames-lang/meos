'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageBlockData {
  url: string;
  caption?: string;
  alt?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
}

interface ImageBlockRendererProps {
  data: Record<string, unknown>;
}

export default function ImageBlockRenderer({ data }: ImageBlockRendererProps) {
  const { url, caption, alt, aspectRatio = 'auto' } = data as unknown as ImageBlockData;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!url) return null;

  const aspectRatioClass = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    'auto': '',
  }[aspectRatio];

  return (
    <>
      <div style={{ padding: 'var(--spacing-window-padding)' }}>
        <div
          className={`relative overflow-hidden cursor-pointer ${aspectRatioClass}`}
          style={{ borderRadius: 'var(--radius-lg)' }}
          onClick={() => setIsExpanded(true)}
        >
          {aspectRatio === 'auto' ? (
            <img
              src={url}
              alt={alt || 'Image'}
              className="w-full h-auto"
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
          ) : (
            <Image
              src={url}
              alt={alt || 'Image'}
              fill
              className="object-cover"
              style={{
                boxShadow: 'var(--shadow-sm)',
              }}
            />
          )}
        </div>
        {caption && (
          <p
            className="mt-2 text-center"
            style={{
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-stat-label)',
            }}
          >
            {caption}
          </p>
        )}
      </div>

      {/* Lightbox */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-8"
          style={{ background: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setIsExpanded(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-white text-2xl"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            ×
          </button>
          <img
            src={url}
            alt={alt || 'Image'}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
