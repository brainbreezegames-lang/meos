'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatTime, formatDate } from '@/lib/utils';

interface MenuBarProps {
  title?: string;
  onSettingsClick?: () => void;
  rightContent?: React.ReactNode;
}

export function MenuBar({ title = 'MeOS', onSettingsClick, rightContent }: MenuBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header
      className="menubar fixed top-0 left-0 right-0 z-[100] h-[32px] flex items-center justify-between px-5"
      style={{
        background: 'var(--color-bg-glass, rgba(251, 249, 239, 0.92))',
        backdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
        WebkitBackdropFilter: 'var(--blur-glass, blur(20px) saturate(180%))',
        borderBottom: '1px solid var(--color-border-subtle, rgba(23, 20, 18, 0.06))',
        boxShadow: 'var(--shadow-xs, 0 1px 3px rgba(23, 20, 18, 0.04))',
      }}
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30
      }}
    >
      {/* Left side - Logo & Title */}
      <div className="flex items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="menubar-logo w-[18px] h-[18px] rounded-md flex items-center justify-center"
            style={{
              background: 'var(--color-accent-primary, #ff7722)',
              boxShadow: '0 1px 2px rgba(255, 119, 34, 0.2)',
            }}
          >
            <svg
              className="w-2.5 h-2.5"
              viewBox="0 0 12 12"
              fill="none"
            >
              <rect
                x="1"
                y="1"
                width="4"
                height="4"
                rx="1"
                fill="white"
                opacity="0.95"
              />
              <rect
                x="7"
                y="1"
                width="4"
                height="4"
                rx="1"
                fill="white"
                opacity="0.75"
              />
              <rect
                x="1"
                y="7"
                width="4"
                height="4"
                rx="1"
                fill="white"
                opacity="0.75"
              />
              <rect
                x="7"
                y="7"
                width="4"
                height="4"
                rx="1"
                fill="white"
                opacity="0.55"
              />
            </svg>
          </div>
          <span
            className="menubar-title text-[13px] font-semibold tracking-tight select-none"
            style={{ color: 'var(--color-text-primary, #171412)' }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Right side - Status Icons & Time */}
      <div className="flex items-center gap-4">
        {/* Custom right content (like persona toggle) */}
        {rightContent}

        {/* Settings gear icon (for owners) */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="menubar-item w-[22px] h-[22px] flex items-center justify-center rounded-md transition-colors"
            style={{
              color: 'var(--color-text-secondary, #4a4744)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-subtle, rgba(23, 20, 18, 0.05))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Settings"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* WiFi icon */}
        <svg
          className="menubar-item w-[14px] h-[14px]"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--color-text-muted, #8e827c)' }}
        >
          <path
            d="M12 18.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"
            fill="currentColor"
          />
          <path
            d="M12 14c2.21 0 4 1.79 4 4h-1.5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5H8c0-2.21 1.79-4 4-4z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M12 10c3.87 0 7 3.13 7 7h-1.5c0-3.04-2.46-5.5-5.5-5.5S6.5 13.96 6.5 17H5c0-3.87 3.13-7 7-7z"
            fill="currentColor"
            opacity="0.65"
          />
          <path
            d="M12 6c5.52 0 10 4.48 10 10h-1.5c0-4.69-3.81-8.5-8.5-8.5S3.5 11.31 3.5 16H2c0-5.52 4.48-10 10-10z"
            fill="currentColor"
            opacity="0.45"
          />
        </svg>

        {/* Battery icon */}
        <div className="menubar-item flex items-center gap-0.5" style={{ color: 'var(--color-text-muted, #8e827c)' }}>
          <div
            className="w-[20px] h-[9px] rounded-[2.5px] border flex items-center p-[1.5px]"
            style={{ borderColor: 'currentColor', borderWidth: '1.5px' }}
          >
            <div
              className="h-full rounded-[1px]"
              style={{ width: '80%', background: 'currentColor' }}
            />
          </div>
          <div
            className="w-[2px] h-[4px] rounded-r-full"
            style={{ background: 'currentColor' }}
          />
        </div>

        {/* Date */}
        <span
          className="menubar-clock text-[12px] font-medium select-none"
          style={{ color: 'var(--color-text-secondary, #4a4744)' }}
        >
          {formatDate(currentTime)}
        </span>

        {/* Time */}
        <span
          className="menubar-clock text-[12px] font-semibold tabular-nums select-none min-w-[50px] text-right"
          style={{ color: 'var(--color-text-primary, #171412)' }}
        >
          {formatTime(currentTime)}
        </span>
      </div>
    </motion.header>
  );
}
