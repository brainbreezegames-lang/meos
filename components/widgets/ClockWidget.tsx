'use client';

import React, { useState, useEffect } from 'react';
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

  const formatTime = (date: Date): { hours: string; minutes: string; period?: string } => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: config.timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: config.format === '12h',
      };
      const formatted = date.toLocaleTimeString('en-US', options);

      if (config.format === '12h') {
        const match = formatted.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          return { hours: match[1], minutes: match[2], period: match[3] };
        }
      }

      const parts = formatted.split(':');
      return { hours: parts[0], minutes: parts[1] };
    } catch {
      const h = date.getHours();
      const m = date.getMinutes().toString().padStart(2, '0');
      if (config.format === '12h') {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return { hours: hour12.toString(), minutes: m, period };
      }
      return { hours: h.toString().padStart(2, '0'), minutes: m };
    }
  };

  const timezoneAbbr = getTimezoneAbbreviation(config.timezone);
  const { hours, minutes, period } = formatTime(time);

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
          background: 'var(--color-bg-base, #fbf9ef)',
          border: '2px solid var(--color-text-primary, #171412)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md, 0 4px 20px rgba(23, 20, 18, 0.08))',
          padding: '14px 18px',
          minWidth: '140px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle accent line at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40%',
            height: 2,
            background: 'var(--color-accent-primary, #ff7722)',
            borderRadius: '0 0 2px 2px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'center' }}>
          {/* Hours */}
          <span
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: 'var(--color-text-primary, #171412)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {hours}
          </span>

          {/* Colon with pulse animation */}
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: 'var(--color-accent-primary, #ff7722)',
              lineHeight: 1,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            :
          </span>

          {/* Minutes */}
          <span
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: 'var(--color-text-primary, #171412)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {minutes}
          </span>

          {/* AM/PM */}
          {period && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-muted, #8e827c)',
                marginLeft: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {period}
            </span>
          )}
        </div>

        {/* Timezone */}
        {config.showTimezoneName && (
          <div
            style={{
              marginTop: 6,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--color-text-muted, #8e827c)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'var(--color-bg-subtle, #f2f0e7)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full, 9999px)',
              }}
            >
              {timezoneAbbr}
            </span>
          </div>
        )}
      </div>

      {/* Keyframe animation for colon pulse */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
