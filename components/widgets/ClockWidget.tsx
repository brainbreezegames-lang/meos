'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

import { useWidgetTheme } from '@/hooks/useWidgetTheme';

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

  const theme = useWidgetTheme();

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
          background: theme.colors.paper,
          border: `2px solid ${theme.colors.border}`,
          borderRadius: theme.radii.card,
          boxShadow: theme.shadows.solid,
          padding: '12px 16px',
          minWidth: '120px',
        }}
      >
        <div className="flex items-center gap-3">
          <Clock
            size={18}
            strokeWidth={2}
            style={{ color: theme.colors.text.accent || theme.colors.text.primary }}
          />
          <div className="flex flex-col">
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: theme.colors.text.primary,
                fontFamily: theme.fonts.mono,
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
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fonts.heading,
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
