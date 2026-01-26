'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowInstance {
  id: string;
  itemId: string;
  state: WindowState;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface WindowContextType {
  windows: WindowInstance[];
  activeWindowId: string | null;
  openWindow: (itemId: string) => string;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  getWindowByItemId: (itemId: string) => WindowInstance | undefined;
  isItemOpen: (itemId: string) => boolean;
  getMinimizedWindows: () => WindowInstance[];
}

const WindowContext = createContext<WindowContextType | null>(null);

export function useWindowContext() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowContext must be used within WindowProvider');
  }
  return context;
}

export function useWindowContextSafe() {
  return useContext(WindowContext);
}

interface WindowProviderProps {
  children: ReactNode;
}

export function WindowProvider({ children }: WindowProviderProps) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);

  const openWindow = useCallback((itemId: string): string => {
    // Check if window for this item already exists
    const existingWindow = windows.find(w => w.itemId === itemId);
    if (existingWindow) {
      // If minimized, restore it
      if (existingWindow.state === 'minimized') {
        setWindows(prev => prev.map(w =>
          w.id === existingWindow.id
            ? { ...w, state: 'normal' as WindowState, zIndex: nextZIndex }
            : w
        ));
        setNextZIndex(prev => prev + 1);
      } else {
        // Just focus it
        setWindows(prev => prev.map(w =>
          w.id === existingWindow.id
            ? { ...w, zIndex: nextZIndex }
            : w
        ));
        setNextZIndex(prev => prev + 1);
      }
      setActiveWindowId(existingWindow.id);
      return existingWindow.id;
    }

    // Create new window
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWindow: WindowInstance = {
      id: windowId,
      itemId,
      state: 'normal',
      zIndex: nextZIndex,
      position: { x: 0, y: 0 }, // Will be set by the component
      size: { width: 440, height: 500 },
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
    setNextZIndex(prev => prev + 1);
    return windowId;
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      // Focus the next highest z-index window
      setWindows(prev => {
        const remaining = prev.filter(w => w.id !== windowId);
        if (remaining.length > 0) {
          const topWindow = remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b);
          setActiveWindowId(topWindow.id);
        } else {
          setActiveWindowId(null);
        }
        return remaining;
      });
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId
        ? { ...w, state: 'minimized' as WindowState }
        : w
    ));
    if (activeWindowId === windowId) {
      // Focus the next visible window
      const visibleWindows = windows.filter(w => w.id !== windowId && w.state !== 'minimized');
      if (visibleWindows.length > 0) {
        const topWindow = visibleWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b);
        setActiveWindowId(topWindow.id);
      } else {
        setActiveWindowId(null);
      }
    }
  }, [activeWindowId, windows]);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId
        ? { ...w, state: w.state === 'maximized' ? 'normal' as WindowState : 'maximized' as WindowState }
        : w
    ));
  }, []);

  const restoreWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId
        ? { ...w, state: 'normal' as WindowState, zIndex: nextZIndex }
        : w
    ));
    setActiveWindowId(windowId);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const focusWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId
        ? { ...w, zIndex: nextZIndex }
        : w
    ));
    setActiveWindowId(windowId);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((windowId: string, x: number, y: number) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId
        ? { ...w, position: { x, y } }
        : w
    ));
  }, []);

  const getWindowByItemId = useCallback((itemId: string) => {
    return windows.find(w => w.itemId === itemId);
  }, [windows]);

  const isItemOpen = useCallback((itemId: string) => {
    return windows.some(w => w.itemId === itemId && w.state !== 'minimized');
  }, [windows]);

  const getMinimizedWindows = useCallback(() => {
    return windows.filter(w => w.state === 'minimized');
  }, [windows]);

  const contextValue = useMemo(() => ({
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    getWindowByItemId,
    isItemOpen,
    getMinimizedWindows,
  }), [
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    getWindowByItemId,
    isItemOpen,
    getMinimizedWindows,
  ]);

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
    </WindowContext.Provider>
  );
}
