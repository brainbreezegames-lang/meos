'use client';

import { useState, useEffect } from 'react';
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
    <header
      className="fixed top-0 left-0 right-0 z-[100] h-7 flex items-center justify-between px-4"
      style={{
        background: 'var(--bg-menubar)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-[13px] font-semibold tracking-tight"
          style={{ color: 'var(--text-on-glass)' }}
        >
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="text-[13px] font-medium"
          style={{ color: 'var(--text-on-glass)' }}
        >
          {formatDate(currentTime)}
        </span>
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: 'var(--text-on-glass)' }}
        >
          {formatTime(currentTime)}
        </span>
      </div>
    </header>
  );
}
