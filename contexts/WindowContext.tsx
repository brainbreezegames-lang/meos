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
  // Use ref for z-index counter to avoid recreating callbacks on every z-index bump
  const nextZIndexRef = React.useRef(1);
  const getNextZ = () => nextZIndexRef.current++;

  const openWindow = useCallback((itemId: string): string => {
    let resultId = '';
    setWindows(prev => {
      const existingWindow = prev.find(w => w.itemId === itemId);
      if (existingWindow) {
        resultId = existingWindow.id;
        const z = getNextZ();
        if (existingWindow.state === 'minimized') {
          return prev.map(w =>
            w.id === existingWindow.id
              ? { ...w, state: 'normal' as WindowState, zIndex: z }
              : w
          );
        }
        return prev.map(w =>
          w.id === existingWindow.id ? { ...w, zIndex: z } : w
        );
      }
      const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      resultId = windowId;
      return [...prev, {
        id: windowId,
        itemId,
        state: 'normal' as WindowState,
        zIndex: getNextZ(),
        position: { x: 0, y: 0 },
        size: { width: 440, height: 500 },
      }];
    });
    setActiveWindowId(resultId);
    return resultId;
  }, []);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const remaining = prev.filter(w => w.id !== windowId);
      // Focus next highest z-index window
      if (remaining.length > 0) {
        const topWindow = remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b);
        setActiveWindowId(topWindow.id);
      } else {
        setActiveWindowId(null);
      }
      return remaining;
    });
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const updated = prev.map(w =>
        w.id === windowId ? { ...w, state: 'minimized' as WindowState } : w
      );
      // Focus next visible window
      const visibleWindows = updated.filter(w => w.id !== windowId && w.state !== 'minimized');
      if (visibleWindows.length > 0) {
        const topWindow = visibleWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b);
        setActiveWindowId(topWindow.id);
      } else {
        setActiveWindowId(null);
      }
      return updated;
    });
  }, []);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId
        ? { ...w, state: w.state === 'maximized' ? 'normal' as WindowState : 'maximized' as WindowState }
        : w
    ));
  }, []);

  const restoreWindow = useCallback((windowId: string) => {
    const z = getNextZ();
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, state: 'normal' as WindowState, zIndex: z } : w
    ));
    setActiveWindowId(windowId);
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    const z = getNextZ();
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, zIndex: z } : w
    ));
    setActiveWindowId(windowId);
  }, []);

  const updateWindowPosition = useCallback((windowId: string, x: number, y: number) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, position: { x, y } } : w
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
