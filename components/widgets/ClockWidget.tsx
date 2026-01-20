'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

// goOS Design Tokens - Mediterranean Blue
const goOS = {
  colors: {
    paper: '#FFFFFF',
    border: '#2B4AE2',
    text: {
      primary: '#2B4AE2',
      secondary: '#2B4AE2',
    },
  },
  shadows: {
    solid: '4px 4px 0 #2B4AE2',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", monospace',
  },
};

interface ClockWidgetConfig {
  timezone: string;
  showTimezoneName: boolean;
  format: '12h' | '24h';
}

interface ClockWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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

export function ClockWidget({ widget, isOwner, onEdit, onDelete, onPositionChange }: ClockWidgetProps) {
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
      onDelete={onDelete}
      onPositionChange={onPositionChange}
    >
      <div
        style={{
          background: goOS.colors.paper,
          border: `2px solid ${goOS.colors.border}`,
          borderRadius: '8px',
          boxShadow: goOS.shadows.solid,
          padding: '12px 16px',
          minWidth: '120px',
        }}
      >
        <div className="flex items-center gap-3">
          <Clock
            size={18}
            strokeWidth={2}
            style={{ color: goOS.colors.text.primary }}
          />
          <div className="flex flex-col">
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: goOS.colors.text.primary,
                fontFamily: goOS.fonts.mono,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {formatTime(time)}
            </span>
            {config.showTimezoneName && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: goOS.colors.text.secondary,
                  fontFamily: goOS.fonts.heading,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginTop: '2px',
                }}
              >
                {timezoneAbbr}
              </span>
            )}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
