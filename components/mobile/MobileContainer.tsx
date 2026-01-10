'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MobileNavigationProvider, useMobileNav } from '@/contexts/MobileNavigationContext';
import { LockScreen } from './LockScreen';
import { HomeScreen } from './HomeScreen';
import { AppViewContainer } from './AppView';
import { ControlCenter } from './ControlCenter';
import { QuickActionsMenu } from './QuickActionsMenu';
import { ContactSheet } from './ContactSheet';
import { RecruiterMode } from './RecruiterMode';
import { GuestbookMessages } from './GuestbookMessages';
import { useIOSGestures } from '@/hooks/useIOSGestures';
import { DesktopItem, DockItem, BlockData } from '@/types';

interface Persona {
  id: string;
  name: string;
  title?: string;
  color?: string;
}

interface GuestbookEntry {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  isOwner?: boolean;
}

interface MobileContainerProps {
  // Data
  items: DesktopItem[];
  dockItems: DockItem[];

  // Profile
  profileImage?: string;
  profileName: string;
  profileTitle?: string;
  profileBio?: string;
  username?: string;

  // Background
  backgroundUrl?: string;

  // Features
  personas?: Persona[];
  onSelectPersona?: (personaId: string) => void;

  // Contact info
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  phone?: string;
  calendly?: string;

  // Guestbook
  guestbookEntries?: GuestbookEntry[];
  onGuestbookSubmit?: (message: string, author: string) => void;

  // Theme
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;

  // QR Code
  onQRCodeOpen?: () => void;

  // Resume
  resumeUrl?: string;

  // Block renderer
  renderBlock?: (block: BlockData) => React.ReactNode;

  // Initial state
  startUnlocked?: boolean;
  initialScreen?: 'lock' | 'home' | 'recruiter';
}

export function MobileContainer(props: MobileContainerProps) {
  return (
    <MobileNavigationProvider
      startUnlocked={props.startUnlocked}
      initialScreen={props.initialScreen || 'lock'}
    >
      <MobileContainerInner {...props} />
    </MobileNavigationProvider>
  );
}

function MobileContainerInner({
  items,
  dockItems,
  profileImage,
  profileName,
  profileTitle,
  profileBio,
  username,
  backgroundUrl,
  personas,
  onSelectPersona,
  email,
  twitter,
  linkedin,
  github,
  website,
  phone,
  calendly,
  guestbookEntries = [],
  onGuestbookSubmit,
  theme = 'dark',
  onThemeToggle,
  onQRCodeOpen,
  resumeUrl,
  renderBlock,
}: MobileContainerProps) {
  const { state, goHome, closeApp, toggleControlCenter, showQuickActions } = useMobileNav();
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [brightness, setBrightness] = useState(100);

  // iOS gestures
  useIOSGestures({
    onEdgeSwipeLeft: () => {
      // Back gesture
      if (state.screen === 'app') {
        closeApp();
      }
    },
    onEdgeSwipeBottom: () => {
      // Home gesture
      if (state.screen === 'app') {
        goHome();
      }
    },
    enabled: state.screen !== 'lock',
  });

  // Apply brightness
  useEffect(() => {
    document.body.style.filter = brightness < 100 ? `brightness(${brightness / 100})` : '';
    return () => {
      document.body.style.filter = '';
    };
  }, [brightness]);

  // Handle app-specific actions
  const handleAppLongPress = (item: DesktopItem) => {
    showQuickActions(item);
  };

  const handleShare = async (item: DesktopItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.windowTitle || item.label,
          text: item.windowDescription || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  const handleCopyLink = async (item: DesktopItem) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${username}#${item.id}`);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  // Get portfolio items for recruiter mode (filter to show only "work" items)
  const portfolioItems = items.filter(
    (item) =>
      item.windowType === 'gallery' ||
      item.label.toLowerCase().includes('project') ||
      item.label.toLowerCase().includes('work') ||
      item.label.toLowerCase().includes('portfolio')
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* Lock Screen */}
      <AnimatePresence mode="wait">
        {state.screen === 'lock' && (
          <LockScreen
            profileImage={profileImage}
            profileName={profileName}
            profileTitle={profileTitle}
            backgroundUrl={backgroundUrl}
            personas={personas}
            onSelectPersona={onSelectPersona}
          />
        )}
      </AnimatePresence>

      {/* Home Screen */}
      <AnimatePresence mode="wait">
        {state.screen === 'home' && (
          <HomeScreen
            items={items}
            dockItems={dockItems}
            backgroundUrl={backgroundUrl}
            onAppLongPress={handleAppLongPress}
          />
        )}
      </AnimatePresence>

      {/* App View */}
      <AppViewContainer renderBlock={renderBlock} />

      {/* Recruiter Mode */}
      <AnimatePresence mode="wait">
        {state.screen === 'recruiter' && (
          <RecruiterMode
            profileImage={profileImage}
            profileName={profileName}
            profileTitle={profileTitle}
            profileBio={profileBio}
            resumeUrl={resumeUrl}
            portfolioItems={portfolioItems.length > 0 ? portfolioItems : items.slice(0, 6)}
            contactLinks={dockItems.filter((d) => d.actionType === 'url' || d.actionType === 'email')}
            onContactTap={() => setShowContactSheet(true)}
            onResumeDownload={() => resumeUrl && window.open(resumeUrl, '_blank')}
            backgroundUrl={backgroundUrl}
          />
        )}
      </AnimatePresence>

      {/* Control Center */}
      <ControlCenter
        username={username}
        profileImage={profileImage}
        profileName={profileName}
        theme={theme}
        onThemeToggle={onThemeToggle}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: profileName,
              url: window.location.href,
            });
          }
        }}
        onQRCode={onQRCodeOpen}
        onContact={() => {
          toggleControlCenter();
          setShowContactSheet(true);
        }}
        brightness={brightness}
        onBrightnessChange={setBrightness}
      />

      {/* Quick Actions Menu */}
      <QuickActionsMenu
        onShare={handleShare}
        onCopyLink={handleCopyLink}
      />

      {/* Contact Sheet */}
      <ContactSheet
        isOpen={showContactSheet}
        onClose={() => setShowContactSheet(false)}
        email={email}
        twitter={twitter}
        linkedin={linkedin}
        github={github}
        website={website}
        phone={phone}
        calendly={calendly}
      />

      {/* Guestbook Messages */}
      <GuestbookMessages
        entries={guestbookEntries}
        ownerName={profileName}
        ownerImage={profileImage}
        isVisible={showGuestbook}
        onClose={() => setShowGuestbook(false)}
        onSubmit={onGuestbookSubmit}
      />
    </div>
  );
}
