'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AppIcon } from './AppIcon';
import { PageIndicator } from './PageIndicator';
import { DesktopItem } from '@/types';
import { FloatingElement } from '@/components/ui/Delight';

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
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const prefersReducedMotion = useReducedMotion();

  const appsPerPage = columns * rows;
  const totalPages = Math.ceil(items.length / appsPerPage);

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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (items.length === 0) return;

    const currentPageItems = getPageItems(currentPage);
    const itemsOnPage = currentPageItems.length;

    let newIndex = focusedIndex;
    let newPage = currentPage;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (focusedIndex === -1) {
          newIndex = 0;
        } else if ((focusedIndex + 1) % columns === 0) {
          // At right edge, go to next page
          if (currentPage < totalPages - 1) {
            newPage = currentPage + 1;
            newIndex = Math.floor(focusedIndex / columns) * columns;
          }
        } else if (focusedIndex < itemsOnPage - 1) {
          newIndex = focusedIndex + 1;
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (focusedIndex === -1) {
          newIndex = 0;
        } else if (focusedIndex % columns === 0) {
          // At left edge, go to previous page
          if (currentPage > 0) {
            newPage = currentPage - 1;
            newIndex = Math.floor(focusedIndex / columns) * columns + (columns - 1);
          }
        } else if (focusedIndex > 0) {
          newIndex = focusedIndex - 1;
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (focusedIndex === -1) {
          newIndex = 0;
        } else if (focusedIndex + columns < itemsOnPage) {
          newIndex = focusedIndex + columns;
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex === -1) {
          newIndex = 0;
        } else if (focusedIndex - columns >= 0) {
          newIndex = focusedIndex - columns;
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < itemsOnPage) {
          onAppTap(currentPageItems[focusedIndex]);
        }
        break;

      case 'Home':
        e.preventDefault();
        newPage = 0;
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newPage = totalPages - 1;
        newIndex = getPageItems(totalPages - 1).length - 1;
        break;

      default:
        return;
    }

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  }, [focusedIndex, currentPage, items.length, columns, totalPages, onAppTap]);

  // Get items for a specific page
  const getPageItems = useCallback((pageIndex: number) => {
    const start = pageIndex * appsPerPage;
    const end = start + appsPerPage;
    return items.slice(start, end);
  }, [items, appsPerPage]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current) {
      const buttons = gridRef.current.querySelectorAll('button[data-app-id]');
      const button = buttons[focusedIndex] as HTMLButtonElement;
      button?.focus();
    }
  }, [focusedIndex, currentPage]);

  const gridGap = 24;
  const iconSize = 60;

  // Empty state with floating animation
  if (items.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-6"
        role="status"
        aria-label="No apps available"
      >
        <FloatingElement amplitude={6} duration={2.5}>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            aria-hidden="true"
          >
            <span className="text-4xl">📱</span>
          </div>
        </FloatingElement>
        <h3
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--text-on-image, white)' }}
        >
          Nothing here yet
        </h3>
        <p
          className="text-sm text-center max-w-xs"
          style={{ color: 'var(--text-on-image, white)', opacity: 0.6 }}
        >
          Desktop items will appear here as apps
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col"
      ref={containerRef}
      role="application"
      aria-label="App grid"
    >
      {/* Grid container */}
      <div
        className="flex-1 overflow-hidden relative"
        onKeyDown={handleKeyDown}
      >
        <motion.div
          className="flex h-full"
          animate={{ x: -currentPage * containerWidth }}
          transition={prefersReducedMotion ? { duration: 0 } : {
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 h-full px-6 pt-4"
              style={{ width: containerWidth }}
              role="tabpanel"
              aria-label={`Page ${pageIndex + 1} of ${totalPages}`}
              hidden={pageIndex !== currentPage}
            >
              <div
                ref={pageIndex === currentPage ? gridRef : undefined}
                className="grid h-full content-start justify-items-center"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, auto)`,
                  gap: gridGap,
                }}
                role="grid"
                aria-label={`Apps page ${pageIndex + 1}`}
              >
                {getPageItems(pageIndex).map((item, index) => (
                  <motion.div
                    key={item.id}
                    role="gridcell"
                    initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : {
                      delay: index * 0.03,
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                  >
                    <AppIcon
                      id={item.id}
                      icon={item.thumbnailUrl || '📁'}
                      label={item.label}
                      onTap={() => onAppTap(item)}
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
      {totalPages > 1 && (
        <PageIndicator
          totalPages={totalPages}
          currentPage={currentPage}
          onPageSelect={setCurrentPage}
        />
      )}
    </div>
  );
}
