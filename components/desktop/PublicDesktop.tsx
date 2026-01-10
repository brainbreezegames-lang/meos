'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, type ThemeId } from '@/contexts/ThemeContext';
import { DesktopCanvas, MenuBar, Dock, MadeWithBadge } from '@/components/desktop';
import { PersonaLoginScreen, useVisitorPersona, PersonaModeToggle, type VisitorPersona } from './PersonaLoginScreen';
import type { Desktop } from '@/types';

interface PublicDesktopProps {
  desktop: Desktop;
  title: string;
  theme: ThemeId;
  ownerImage?: string | null;
  ownerTitle?: string | null;
  enableLoginScreen?: boolean;
}

export function PublicDesktop({
  desktop,
  title,
  theme,
  ownerImage,
  ownerTitle,
  enableLoginScreen = true,
}: PublicDesktopProps) {
  const { persona, hasChecked, selectPersona, needsSelection } = useVisitorPersona();
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  // Check URL params for auto-detection
  useEffect(() => {
    if (!hasChecked) return;

    const params = new URLSearchParams(window.location.search);

    // Auto-detect recruiter mode from URL params
    if (params.get('mode') === 'recruiter' || params.get('ref') === 'linkedin') {
      selectPersona('recruiter');
      return;
    }

    // Direct links to items skip login screen
    if (params.get('item') || params.get('open')) {
      selectPersona('guest');
      return;
    }

    // Show login screen if enabled and no persona selected
    if (enableLoginScreen && needsSelection) {
      setShowLoginScreen(true);
    }
  }, [hasChecked, enableLoginScreen, needsSelection, selectPersona]);

  const handlePersonaSelect = (selectedPersona: VisitorPersona) => {
    selectPersona(selectedPersona);
    setShowLoginScreen(false);
  };

  const handleModeChange = (newMode: VisitorPersona) => {
    selectPersona(newMode);
  };

  // Don't render until we've checked localStorage
  if (!hasChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        }}
      />
    );
  }

  return (
    <ThemeProvider initialTheme={theme}>
      {/* Login screen overlay */}
      {showLoginScreen && (
        <PersonaLoginScreen
          profileImage={ownerImage}
          name={title}
          title={ownerTitle}
          onSelect={handlePersonaSelect}
        />
      )}

      {/* Main desktop (hidden during login screen) */}
      {!showLoginScreen && (
        <main className="min-h-screen overflow-hidden">
          <MenuBar
            title={title}
            rightContent={
              persona && persona !== 'guest' && (
                <PersonaModeToggle
                  currentMode={persona}
                  onChange={handleModeChange}
                />
              )
            }
          />
          <DesktopCanvas
            desktop={desktop}
            viewMode={persona === 'recruiter' ? 'recruiter' : 'visitor'}
          />
          <Dock items={desktop.dockItems} />
          <MadeWithBadge />
        </main>
      )}
    </ThemeProvider>
  );
}
