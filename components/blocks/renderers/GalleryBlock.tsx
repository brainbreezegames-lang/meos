'use client';

import Image from 'next/image';
import { useState } from 'react';

interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

interface GalleryBlockData {
  columns: 2 | 3 | 4;
  images: GalleryImage[];
  expandable: boolean;
}

interface GalleryBlockRendererProps {
  data: Record<string, unknown>;
}

export default function GalleryBlockRenderer({ data }: GalleryBlockRendererProps) {
  const { columns = 2, images = [], expandable = true } = data as unknown as GalleryBlockData;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <div className="px-5 py-3">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square rounded-lg overflow-hidden ${expandable ? 'cursor-pointer' : ''}`}
              onClick={() => expandable && setExpandedIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || `Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {expandable && expandedIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-8"
          style={{ background: 'rgba(0, 0, 0, 0.9)' }}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-white text-2xl"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            onClick={() => setExpandedIndex(null)}
          >
            ×
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white text-xl"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex((expandedIndex - 1 + images.length) % images.length);
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white text-xl"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedIndex((expandedIndex + 1) % images.length);
                }}
              >
                ›
              </button>
            </>
          )}

          <div className="flex flex-col items-center" onClick={() => setExpandedIndex(null)}>
            <img
              src={images[expandedIndex].url}
              alt={images[expandedIndex].alt || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {images[expandedIndex].caption && (
              <p className="text-white text-sm mt-4 opacity-70">
                {images[expandedIndex].caption}
              </p>
            )}
            <p className="text-white text-xs mt-2 opacity-50">
              {expandedIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
