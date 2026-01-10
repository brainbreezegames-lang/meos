'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface CarouselItem {
  image: string;
  title?: string;
  description?: string;
  url?: string;
}

interface CarouselBlockData {
  items: CarouselItem[];
  autoplay?: boolean;
  interval?: number;
}

interface CarouselBlockRendererProps {
  data: Record<string, unknown>;
}

export default function CarouselBlockRenderer({ data }: CarouselBlockRendererProps) {
  const { items = [], autoplay = false, interval = 5000 } = data as unknown as CarouselBlockData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay || isHovered || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, items.length, isHovered]);

  if (!items.length) return null;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="px-5 py-3">
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main image */}
        <div className="relative aspect-[16/9]">
          {currentItem.url ? (
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <Image
                src={currentItem.image}
                alt={currentItem.title || `Slide ${currentIndex + 1}`}
                fill
                className="object-cover transition-transform duration-500"
              />
            </a>
          ) : (
            <Image
              src={currentItem.image}
              alt={currentItem.title || `Slide ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-500"
            />
          )}

          {/* Gradient overlay */}
          {(currentItem.title || currentItem.description) && (
            <div
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          )}

          {/* Content */}
          {(currentItem.title || currentItem.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {currentItem.title && (
                <h3 className="text-[15px] font-semibold text-white leading-tight">
                  {currentItem.title}
                </h3>
              )}
              {currentItem.description && (
                <p className="text-[12px] text-white/80 mt-1 line-clamp-2">
                  {currentItem.description}
                </p>
              )}
            </div>
          )}

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M9 3L5 7L9 11"
                    stroke="#1d1d1f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M5 3L9 7L5 11"
                    stroke="#1d1d1f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots indicator */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all"
                style={{
                  width: index === currentIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: index === currentIndex
                    ? 'white'
                    : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
