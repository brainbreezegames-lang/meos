'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  onPageSelect?: (page: number) => void;
}

export function PageIndicator({ totalPages, currentPage, onPageSelect }: PageIndicatorProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: totalPages }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onPageSelect?.(index)}
          className="rounded-full"
          style={{
            width: index === currentPage ? 7 : 6,
            height: index === currentPage ? 7 : 6,
            background: index === currentPage
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(255, 255, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: index === currentPage ? 1 : 0.85,
          }}
        />
      ))}
    </div>
  );
}
