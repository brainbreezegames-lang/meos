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

  // Keep ref in sync for use in event listener
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

  // Global click-outside handler
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
          return; // Click is inside a menu trigger or dropdown — don't close
        }
        el = el.parentElement;
      }

      // Click is outside all menus
      setActiveMenu(null);
    };

    // Use requestAnimationFrame to avoid closing on the same click that opened
    const raf = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleMouseDown);
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', handleMouseDown);
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
