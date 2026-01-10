'use client';

import { ThemeProvider, type ThemeId } from '@/contexts/ThemeContext';
import { DesktopCanvas, MenuBar, Dock, MadeWithBadge } from '@/components/desktop';
import type { Desktop, DockItem } from '@/types';

interface PublicDesktopProps {
  desktop: Desktop;
  title: string;
  theme: ThemeId;
}

export function PublicDesktop({ desktop, title, theme }: PublicDesktopProps) {
  return (
    <ThemeProvider initialTheme={theme}>
      <main className="min-h-screen overflow-hidden">
        <MenuBar title={title} />
        <DesktopCanvas desktop={desktop} />
        <Dock items={desktop.dockItems} />
        <MadeWithBadge />
      </main>
    </ThemeProvider>
  );
}
