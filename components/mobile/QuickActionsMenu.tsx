'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileNav } from '@/contexts/MobileNavigationContext';
import { DesktopItem } from '@/types';

interface QuickAction {
  icon: string;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}

interface QuickActionsMenuProps {
  actions?: QuickAction[];
  onOpenInNewTab?: (item: DesktopItem) => void;
  onShare?: (item: DesktopItem) => void;
  onCopyLink?: (item: DesktopItem) => void;
  onAddToFavorites?: (item: DesktopItem) => void;
}

export function QuickActionsMenu({
  actions,
  onOpenInNewTab,
  onShare,
  onCopyLink,
  onAddToFavorites,
}: QuickActionsMenuProps) {
  const { state, hideQuickActions, openApp } = useMobileNav();
  const item = state.quickActionItem;

  const defaultActions: QuickAction[] = item
    ? [
        {
          icon: '📖',
          label: 'Open',
          onClick: () => {
            openApp(item);
            hideQuickActions();
          },
        },
        ...(onOpenInNewTab
          ? [
              {
                icon: '↗️',
                label: 'Open in New Tab',
                onClick: () => {
                  onOpenInNewTab(item);
                  hideQuickActions();
                },
              },
            ]
          : []),
        ...(onShare
          ? [
              {
                icon: '📤',
                label: 'Share',
                onClick: () => {
                  onShare(item);
                  hideQuickActions();
                },
              },
            ]
          : []),
        ...(onCopyLink
          ? [
              {
                icon: '🔗',
                label: 'Copy Link',
                onClick: () => {
                  onCopyLink(item);
                  hideQuickActions();
                },
              },
            ]
          : []),
        ...(onAddToFavorites
          ? [
              {
                icon: '⭐',
                label: 'Add to Favorites',
                onClick: () => {
                  onAddToFavorites(item);
                  hideQuickActions();
                },
              },
            ]
          : []),
      ]
    : [];

  const menuActions = actions || defaultActions;

  return (
    <AnimatePresence>
      {state.quickActionItem && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            className="fixed inset-0 z-[300]"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideQuickActions}
          />

          {/* Menu container */}
          <motion.div
            className="fixed inset-0 z-[301] flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Preview card */}
            <motion.div
              className="mb-4 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            >
              {/* App icon */}
              <div
                className="w-20 h-20 rounded-[22px] overflow-hidden flex items-center justify-center mb-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                {item?.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📁</span>
                )}
              </div>
              <p
                className="text-white font-medium text-center"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                {item?.label}
              </p>
            </motion.div>

            {/* Actions list */}
            <motion.div
              className="w-full max-w-[280px] rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(50, 50, 55, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: 0.05,
              }}
            >
              {menuActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5"
                  style={{
                    borderBottom:
                      index < menuActions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                  }}
                  whileTap={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span
                    className={`text-sm ${action.destructive ? 'text-red-400' : 'text-white'}`}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                  >
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            {/* Cancel button */}
            <motion.button
              onClick={hideQuickActions}
              className="mt-3 w-full max-w-[280px] py-3.5 rounded-2xl"
              style={{
                background: 'rgba(50, 50, 55, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                delay: 0.1,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className="text-blue-400 font-semibold"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                Cancel
              </span>
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
