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
      className="menubar fixed top-0 left-0 right-0 z-[100] h-[28px] flex items-center justify-between px-4"
      style={{
        background: 'var(--bg-menubar)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        boxShadow: `
          0 0.5px 0 var(--border-light),
          inset 0 -0.5px 0 var(--border-light)
        `,
      }}
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30
      }}
    >
      {/* Left side - Logo & Title */}
      <div className="flex items-center gap-5">
        {/* Apple-style logo */}
        <div className="flex items-center gap-1.5">
          <div
            className="menubar-logo w-4 h-4 rounded-[4px] flex items-center justify-center"
            style={{
              background: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
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
                rx="0.8"
                fill="var(--bg-elevated)"
                opacity="0.9"
              />
              <rect
                x="7"
                y="1"
                width="4"
                height="4"
                rx="0.8"
                fill="var(--bg-elevated)"
                opacity="0.7"
              />
              <rect
                x="1"
                y="7"
                width="4"
                height="4"
                rx="0.8"
                fill="var(--bg-elevated)"
                opacity="0.7"
              />
              <rect
                x="7"
                y="7"
                width="4"
                height="4"
                rx="0.8"
                fill="var(--bg-elevated)"
                opacity="0.5"
              />
            </svg>
          </div>
          <span
            className="menubar-title text-[13px] font-semibold tracking-tight select-none"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Right side - Date & Time */}
      <div className="flex items-center gap-4">
        {/* Custom right content (like persona toggle) */}
        {rightContent}

        {/* Settings gear icon (for owners) */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="menubar-item w-[18px] h-[18px] flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Settings"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* WiFi icon placeholder */}
        <svg
          className="menubar-item w-[15px] h-[15px]"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--text-secondary)' }}
        >
          <path
            d="M12 18.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"
            fill="currentColor"
          />
          <path
            d="M12 14c2.21 0 4 1.79 4 4h-1.5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5H8c0-2.21 1.79-4 4-4z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M12 10c3.87 0 7 3.13 7 7h-1.5c0-3.04-2.46-5.5-5.5-5.5S6.5 13.96 6.5 17H5c0-3.87 3.13-7 7-7z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M12 6c5.52 0 10 4.48 10 10h-1.5c0-4.69-3.81-8.5-8.5-8.5S3.5 11.31 3.5 16H2c0-5.52 4.48-10 10-10z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>

        {/* Battery icon placeholder */}
        <div className="menubar-item flex items-center gap-0.5" style={{ color: 'var(--text-secondary)' }}>
          <div
            className="w-[22px] h-[10px] rounded-[3px] border flex items-center p-[1.5px]"
            style={{ borderColor: 'currentColor' }}
          >
            <div
              className="h-full rounded-[1.5px]"
              style={{ width: '80%', background: 'currentColor' }}
            />
          </div>
          <div
            className="w-[2px] h-[4px] rounded-r-full"
            style={{ background: 'currentColor' }}
          />
        </div>

        <span
          className="menubar-clock text-[13px] font-medium select-none"
          style={{ color: 'var(--text-secondary)' }}
        >
          {formatDate(currentTime)}
        </span>
        <span
          className="menubar-clock text-[13px] font-semibold tabular-nums select-none min-w-[52px] text-right"
          style={{ color: 'var(--text-primary)' }}
        >
          {formatTime(currentTime)}
        </span>
      </div>
    </motion.header>
  );
}
