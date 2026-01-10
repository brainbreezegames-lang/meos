'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileNav } from '@/contexts/MobileNavigationContext';
import { DesktopItem, DockItem } from '@/types';

interface RecruiterModeProps {
  profileImage?: string;
  profileName: string;
  profileTitle?: string;
  profileBio?: string;
  resumeUrl?: string;
  portfolioItems: DesktopItem[];
  contactLinks?: DockItem[];
  onContactTap?: () => void;
  onResumeDownload?: () => void;
  backgroundUrl?: string;
}

export function RecruiterMode({
  profileImage,
  profileName,
  profileTitle,
  profileBio,
  resumeUrl,
  portfolioItems,
  contactLinks = [],
  onContactTap,
  onResumeDownload,
  backgroundUrl,
}: RecruiterModeProps) {
  const { exitRecruiterMode, openApp } = useMobileNav();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col select-none"
      style={{
        background: backgroundUrl
          ? `url(${backgroundUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Blur overlay */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          background: 'rgba(0, 0, 0, 0.6)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Safe area top */}
        <div style={{ height: 'env(safe-area-inset-top, 44px)' }} />

        {/* Header with close button */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2">
          <motion.button
            onClick={exitRecruiterMode}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-white/70"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span
              className="text-sm text-white/70"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
            >
              Back
            </span>
          </motion.button>

          <span
            className="text-xs font-medium text-white/50 uppercase tracking-wider"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
          >
            Recruiter View
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain" ref={scrollRef}>
          {/* Profile card */}
          <motion.div
            className="mx-4 mt-4 p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-4">
              {/* Profile image */}
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                }}
              >
                {profileImage ? (
                  <img src={profileImage} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-white/50">
                    {profileName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
                >
                  {profileName}
                </h1>
                {profileTitle && (
                  <p
                    className="text-sm text-white/60 mt-0.5"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                  >
                    {profileTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profileBio && (
              <p
                className="mt-4 text-white/70 leading-relaxed"
                style={{
                  fontSize: 14,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}
              >
                {profileBio}
              </p>
            )}

            {/* CTA buttons */}
            <div className="mt-5 flex gap-3">
              <motion.button
                onClick={onContactTap}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{
                  background: 'rgba(59, 130, 246, 0.8)',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                }}
                whileTap={{ scale: 0.98 }}
              >
                Get in Touch
              </motion.button>
              {resumeUrl && (
                <motion.button
                  onClick={onResumeDownload}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Resume
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Portfolio section */}
          {portfolioItems.length > 0 && (
            <div className="mt-6">
              <h2
                className="px-4 mb-3 text-sm font-medium text-white/50 uppercase tracking-wider"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                Selected Work
              </h2>

              {/* Horizontal scroll */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-3 px-4">
                  {portfolioItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => openApp(item)}
                      className="flex-shrink-0 w-64"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {/* Preview image */}
                        <div className="aspect-video bg-black/30 overflow-hidden">
                          {item.windowHeaderImage || item.thumbnailUrl ? (
                            <img
                              src={item.windowHeaderImage || item.thumbnailUrl}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {item.thumbnailUrl || '📁'}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <h3
                            className="font-medium text-white truncate"
                            style={{
                              fontSize: 14,
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                            }}
                          >
                            {item.windowTitle || item.label}
                          </h3>
                          {item.windowSubtitle && (
                            <p
                              className="text-xs text-white/50 truncate mt-0.5"
                              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                            >
                              {item.windowSubtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick links */}
          {contactLinks.length > 0 && (
            <div className="mt-2 mb-8">
              <h2
                className="px-4 mb-3 text-sm font-medium text-white/50 uppercase tracking-wider"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
              >
                Connect
              </h2>

              <div className="px-4 flex flex-wrap gap-2">
                {contactLinks.map((link, index) => (
                  <motion.a
                    key={link.id}
                    href={link.actionType === 'email' ? `mailto:${link.actionValue}` : link.actionValue}
                    target={link.actionType === 'url' ? '_blank' : undefined}
                    rel={link.actionType === 'url' ? 'noopener noreferrer' : undefined}
                    className="px-4 py-2.5 rounded-xl flex items-center gap-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span
                      className="text-sm text-white"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                    >
                      {link.label}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div className="flex-shrink-0 flex justify-center pb-2 pt-1">
          <div
            className="w-32 h-1 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          />
        </div>

        {/* Safe area bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 8px)' }} />
      </div>
    </motion.div>
  );
}
