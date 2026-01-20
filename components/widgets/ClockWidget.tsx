'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface ClockWidgetConfig {
  timezone: string;
  showTimezoneName: boolean;
  format: '12h' | '24h';
}

interface ClockWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onPositionChange?: (x: number, y: number) => void;
}

const DEFAULT_CONFIG: ClockWidgetConfig = {
  timezone: 'America/New_York',
  showTimezoneName: true,
  format: '12h',
};

function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || timezone.split('/').pop() || '';
  } catch {
    return timezone.split('/').pop() || '';
  }
}

export function ClockWidget({ widget, isOwner, onEdit, onPositionChange }: ClockWidgetProps) {
  const [time, setTime] = useState<Date>(new Date());
  const config: ClockWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<ClockWidgetConfig>) };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): string => {
    try {
      return date.toLocaleTimeString('en-US', {
        timeZone: config.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: config.format === '12h',
      });
    } catch {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: config.format === '12h',
      });
    }
  };

  const timezoneAbbr = getTimezoneAbbreviation(config.timezone);

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onPositionChange={onPositionChange}
    >
      <motion.div
        className="relative"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
        }}
        whileHover={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Glass background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-glass-elevated, rgba(255,255,255,0.92))',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        />

        {/* Content */}
        <div
          className="relative flex items-center gap-2"
          style={{
            padding: '10px 14px',
          }}
        >
          <Clock
            size={16}
            style={{ color: 'var(--text-tertiary, #888)' }}
          />
          <div className="flex flex-col">
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary, #1a1a1a)',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.02em',
              }}
            >
              {formatTime(time)}
            </span>
            {config.showTimezoneName && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: 'var(--text-tertiary, #888)',
                  fontFamily: 'var(--font-body, system-ui)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {timezoneAbbr}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
