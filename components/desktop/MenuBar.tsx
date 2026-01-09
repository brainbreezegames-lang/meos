'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatTime, formatDate } from '@/lib/utils';

interface MenuBarProps {
  title?: string;
}

export function MenuBar({ title = 'MeOS' }: MenuBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[100] h-[28px] flex items-center justify-between px-4"
      style={{
        background: `
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.78) 0%,
            rgba(255, 255, 255, 0.68) 100%
          )
        `,
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        boxShadow: `
          0 0.5px 0 rgba(0, 0, 0, 0.05),
          inset 0 -0.5px 0 rgba(0, 0, 0, 0.05)
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
            className="w-4 h-4 rounded-[4px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
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
                fill="white"
                opacity="0.9"
              />
              <rect
                x="7"
                y="1"
                width="4"
                height="4"
                rx="0.8"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="1"
                y="7"
                width="4"
                height="4"
                rx="0.8"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="7"
                y="7"
                width="4"
                height="4"
                rx="0.8"
                fill="white"
                opacity="0.5"
              />
            </svg>
          </div>
          <span
            className="text-[13px] font-semibold tracking-tight select-none"
            style={{ color: 'rgba(0, 0, 0, 0.88)' }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Right side - Date & Time */}
      <div className="flex items-center gap-4">
        {/* WiFi icon placeholder */}
        <svg
          className="w-[15px] h-[15px]"
          viewBox="0 0 24 24"
          fill="none"
          style={{ opacity: 0.7 }}
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
        <div className="flex items-center gap-0.5" style={{ opacity: 0.7 }}>
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
          className="text-[13px] font-medium select-none"
          style={{ color: 'rgba(0, 0, 0, 0.8)' }}
        >
          {formatDate(currentTime)}
        </span>
        <span
          className="text-[13px] font-semibold tabular-nums select-none min-w-[52px] text-right"
          style={{ color: 'rgba(0, 0, 0, 0.88)' }}
        >
          {formatTime(currentTime)}
        </span>
      </div>
    </motion.header>
  );
}
