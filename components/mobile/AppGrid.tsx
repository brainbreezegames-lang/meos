'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { AppIcon } from './AppIcon';
import { PageIndicator } from './PageIndicator';
import { DesktopItem } from '@/types';

interface AppGridProps {
  items: DesktopItem[];
  onAppTap: (item: DesktopItem) => void;
  onAppLongPress?: (item: DesktopItem) => void;
  isEditing?: boolean;
  columns?: number;
  rows?: number;
}

export function AppGrid({
  items,
  onAppTap,
  onAppLongPress,
  isEditing = false,
  columns = 4,
  rows = 6,
}: AppGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const appsPerPage = columns * rows;
  const totalPages = Math.ceil(items.length / appsPerPage);

  // Swipe gesture
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      setIsDragging(false);
      const threshold = containerWidth * 0.2;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (offset < -threshold || velocity < -500) {
        // Swipe left - next page
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
      } else if (offset > threshold || velocity > 500) {
        // Swipe right - previous page
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      }
    },
    [containerWidth, totalPages]
  );

  // Get items for current page
  const getPageItems = (pageIndex: number) => {
    const start = pageIndex * appsPerPage;
    const end = start + appsPerPage;
    return items.slice(start, end);
  };

  // Create grid positions
  const gridGap = 24;
  const iconSize = 60;

  return (
    <div className="flex-1 flex flex-col" ref={containerRef}>
      {/* Grid container */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          animate={{ x: -currentPage * containerWidth }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          style={{ x: isDragging ? x : 0 }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 h-full px-6 pt-4"
              style={{ width: containerWidth }}
            >
              <div
                className="grid h-full content-start justify-items-center"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, auto)`,
                  gap: gridGap,
                }}
              >
                {getPageItems(pageIndex).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.03,
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                  >
                    <AppIcon
                      id={item.id}
                      icon={item.thumbnailUrl || '📁'}
                      label={item.label}
                      onTap={() => !isDragging && onAppTap(item)}
                      onLongPress={() => onAppLongPress?.(item)}
                      isEditing={isEditing}
                      size={iconSize}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Page indicator */}
      <PageIndicator
        totalPages={totalPages}
        currentPage={currentPage}
        onPageSelect={setCurrentPage}
      />
    </div>
  );
}
