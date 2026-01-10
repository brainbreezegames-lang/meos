'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DesktopItem } from '@/types';

export type MobileScreen = 'lock' | 'home' | 'app' | 'control-center' | 'recruiter';

export interface MobileNavState {
  screen: MobileScreen;
  activeApp: DesktopItem | null;
  activePage: number;
  previousScreen: MobileScreen | null;
  isUnlocked: boolean;
  showControlCenter: boolean;
  quickActionItem: DesktopItem | null;
}

interface MobileNavContextValue {
  state: MobileNavState;
  unlock: () => void;
  lock: () => void;
  openApp: (app: DesktopItem) => void;
  closeApp: () => void;
  goHome: () => void;
  setPage: (page: number) => void;
  toggleControlCenter: () => void;
  showQuickActions: (item: DesktopItem) => void;
  hideQuickActions: () => void;
  enterRecruiterMode: () => void;
  exitRecruiterMode: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error('useMobileNav must be used within MobileNavigationProvider');
  }
  return ctx;
}

interface MobileNavigationProviderProps {
  children: ReactNode;
  initialScreen?: MobileScreen;
  startUnlocked?: boolean;
}

export function MobileNavigationProvider({
  children,
  initialScreen = 'lock',
  startUnlocked = false,
}: MobileNavigationProviderProps) {
  const [state, setState] = useState<MobileNavState>({
    screen: startUnlocked ? 'home' : initialScreen,
    activeApp: null,
    activePage: 0,
    previousScreen: null,
    isUnlocked: startUnlocked,
    showControlCenter: false,
    quickActionItem: null,
  });

  const unlock = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'home',
      isUnlocked: true,
      previousScreen: 'lock',
    }));
  }, []);

  const lock = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'lock',
      isUnlocked: false,
      activeApp: null,
      showControlCenter: false,
    }));
  }, []);

  const openApp = useCallback((app: DesktopItem) => {
    setState(prev => ({
      ...prev,
      screen: 'app',
      activeApp: app,
      previousScreen: prev.screen,
      showControlCenter: false,
      quickActionItem: null,
    }));
  }, []);

  const closeApp = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'home',
      activeApp: null,
      previousScreen: 'app',
    }));
  }, []);

  const goHome = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'home',
      activeApp: null,
      showControlCenter: false,
      quickActionItem: null,
      previousScreen: prev.screen,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      activePage: page,
    }));
  }, []);

  const toggleControlCenter = useCallback(() => {
    setState(prev => ({
      ...prev,
      showControlCenter: !prev.showControlCenter,
      quickActionItem: null,
    }));
  }, []);

  const showQuickActions = useCallback((item: DesktopItem) => {
    setState(prev => ({
      ...prev,
      quickActionItem: item,
      showControlCenter: false,
    }));
  }, []);

  const hideQuickActions = useCallback(() => {
    setState(prev => ({
      ...prev,
      quickActionItem: null,
    }));
  }, []);

  const enterRecruiterMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'recruiter',
      previousScreen: prev.screen,
      showControlCenter: false,
      quickActionItem: null,
    }));
  }, []);

  const exitRecruiterMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'home',
      previousScreen: 'recruiter',
    }));
  }, []);

  return (
    <MobileNavContext.Provider
      value={{
        state,
        unlock,
        lock,
        openApp,
        closeApp,
        goHome,
        setPage,
        toggleControlCenter,
        showQuickActions,
        hideQuickActions,
        enterRecruiterMode,
        exitRecruiterMode,
      }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}
