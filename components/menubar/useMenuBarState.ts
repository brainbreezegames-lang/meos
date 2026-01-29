'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export type MenuId = string;

export interface UseMenuBarReturn {
  activeMenu: MenuId | null;
  toggleMenu: (id: MenuId) => void;
  closeAll: () => void;
  isOpen: (id: MenuId) => boolean;
  getTriggerProps: (id: MenuId) => {
    onClick: () => void;
    onMouseEnter: () => void;
    'data-menubar-trigger': string;
    'aria-expanded': boolean;
  };
}

export function useMenuBarState(): UseMenuBarReturn {
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const activeMenuRef = useRef<MenuId | null>(null);

  // Keep ref in sync for use in event listeners
  activeMenuRef.current = activeMenu;

  const toggleMenu = useCallback((id: MenuId) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  }, []);

  const closeAll = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const isOpen = useCallback(
    (id: MenuId) => activeMenu === id,
    [activeMenu]
  );

  // Hover-to-switch: when a menu is already open and user hovers
  // another trigger, switch to that menu instantly
  const handleTriggerHover = useCallback((id: MenuId) => {
    if (activeMenuRef.current !== null && activeMenuRef.current !== id) {
      setActiveMenu(id);
    }
  }, []);

  // Global click-outside + Escape key handler
  useEffect(() => {
    if (activeMenu === null) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Walk up the DOM to check for menubar attributes
      let el: HTMLElement | null = target;
      while (el) {
        if (
          el.hasAttribute('data-menubar-trigger') ||
          el.hasAttribute('data-menubar-dropdown')
        ) {
          return;
        }
        el = el.parentElement;
      }

      setActiveMenu(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveMenu(null);
      }
    };

    // Use rAF to avoid closing on the same click that opened
    const raf = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('keydown', handleKeyDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenu]);

  const getTriggerProps = useCallback(
    (id: MenuId) => ({
      onClick: () => toggleMenu(id),
      onMouseEnter: () => handleTriggerHover(id),
      'data-menubar-trigger': id,
      'aria-expanded': activeMenu === id,
    }),
    [activeMenu, toggleMenu, handleTriggerHover]
  );

  return {
    activeMenu,
    toggleMenu,
    closeAll,
    isOpen,
    getTriggerProps,
  };
}
