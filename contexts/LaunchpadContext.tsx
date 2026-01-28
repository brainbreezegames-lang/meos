'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface LaunchpadContextType {
  isOpen: boolean;
  openLaunchpad: () => void;
  closeLaunchpad: () => void;
  toggleLaunchpad: () => void;
}

const LaunchpadContext = createContext<LaunchpadContextType | null>(null);

export function useLaunchpad() {
  const context = useContext(LaunchpadContext);
  if (!context) {
    throw new Error('useLaunchpad must be used within LaunchpadProvider');
  }
  return context;
}

export function useLaunchpadSafe() {
  return useContext(LaunchpadContext);
}

interface LaunchpadProviderProps {
  children: ReactNode;
}

export function LaunchpadProvider({ children }: LaunchpadProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openLaunchpad = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLaunchpad = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleLaunchpad = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    isOpen,
    openLaunchpad,
    closeLaunchpad,
    toggleLaunchpad,
  }), [isOpen, openLaunchpad, closeLaunchpad, toggleLaunchpad]);

  return (
    <LaunchpadContext.Provider value={contextValue}>
      {children}
    </LaunchpadContext.Provider>
  );
}
