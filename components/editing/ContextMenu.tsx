'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!position) return null;

  // Adjust position to stay in viewport
  const adjustedPosition = { ...position };
  const menuWidth = 180;
  const menuHeight = items.length * 36 + 16;

  if (position.x + menuWidth > window.innerWidth - 16) {
    adjustedPosition.x = window.innerWidth - menuWidth - 16;
  }
  if (position.y + menuHeight > window.innerHeight - 16) {
    adjustedPosition.y = window.innerHeight - menuHeight - 16;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-[9999]"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -4 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="py-2 rounded-lg overflow-hidden min-w-[180px]"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: `
              0 20px 60px -15px rgba(0, 0, 0, 0.3),
              0 10px 20px -10px rgba(0, 0, 0, 0.2),
              0 0 0 0.5px rgba(0, 0, 0, 0.1),
              inset 0 0 0 0.5px rgba(255, 255, 255, 0.5)
            `,
          }}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && (
                <div className="h-px my-1 mx-3 bg-black/10" />
              )}
              {!item.separator && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.disabled) {
                      item.onClick();
                      onClose();
                    }
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-[13px]
                    transition-colors duration-75
                    ${item.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : item.danger
                        ? 'hover:bg-red-500/10 text-red-600'
                        : 'hover:bg-blue-500/10 text-[#1d1d1f]'
                    }
                  `}
                >
                  {item.icon && (
                    <span className="w-4 h-4 flex items-center justify-center opacity-70">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for using context menu
export function useContextMenu() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const showContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const hideContextMenu = useCallback(() => {
    setPosition(null);
  }, []);

  return {
    position,
    showContextMenu,
    hideContextMenu,
  };
}
