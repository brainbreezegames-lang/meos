'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

const DEFAULT_CONFIG: ClockWidgetConfig = {
  timezone: 'America/New_York',
  showTimezoneName: true,
  format: '12h',
};

// Popular timezones for remote workers (exported for widget editor)
export const POPULAR_TIMEZONES = [
  { id: 'America/New_York', label: 'New York', abbr: 'EST' },
  { id: 'America/Los_Angeles', label: 'Los Angeles', abbr: 'PST' },
  { id: 'America/Chicago', label: 'Chicago', abbr: 'CST' },
  { id: 'Europe/London', label: 'London', abbr: 'GMT' },
  { id: 'Europe/Paris', label: 'Paris', abbr: 'CET' },
  { id: 'Europe/Berlin', label: 'Berlin', abbr: 'CET' },
  { id: 'Asia/Tokyo', label: 'Tokyo', abbr: 'JST' },
  { id: 'Asia/Singapore', label: 'Singapore', abbr: 'SGT' },
  { id: 'Asia/Dubai', label: 'Dubai', abbr: 'GST' },
  { id: 'Australia/Sydney', label: 'Sydney', abbr: 'AEST' },
  { id: 'Pacific/Auckland', label: 'Auckland', abbr: 'NZST' },
  { id: 'Asia/Kolkata', label: 'Mumbai', abbr: 'IST' },
];

function getTimezoneAbbreviation(timezone: string): string {
  const popular = POPULAR_TIMEZONES.find(tz => tz.id === timezone);
  if (popular) return popular.abbr;

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

export function ClockWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: ClockWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  const config: ClockWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<ClockWidgetConfig>) };

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = useCallback((date: Date): { hours: string; minutes: string; period?: string } => {
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
      return { hours: parts[0], minutes: parts[1]?.substring(0, 2) };
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
  }, [config.timezone, config.format]);

  const getTimeAngles = useCallback((date: Date) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: config.timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const seconds = parseInt(parts.find(p => p.type === 'second')?.value || '0');

      const secondAngle = (seconds / 60) * 360;
      const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
      const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360;

      return { hourAngle, minuteAngle, secondAngle };
    } catch {
      return { hourAngle: 0, minuteAngle: 0, secondAngle: 0 };
    }
  }, [config.timezone]);

  const timezoneAbbr = getTimezoneAbbreviation(config.timezone);

  if (!mounted || !time) {
    return (
      <WidgetWrapper
        widget={widget}
        isOwner={isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
        onPositionChange={onPositionChange}
        onContextMenu={onContextMenu}
        isHighlighted={isHighlighted}
      >
        <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#999', fontSize: 12 }}>...</div>
        </div>
      </WidgetWrapper>
    );
  }

  const { hours, minutes, period } = formatTime(time);
  const { hourAngle, minuteAngle } = getTimeAngles(time);

  return (
    <WidgetWrapper
      widget={widget}
      isOwner={isOwner}
      onEdit={onEdit}
      onDelete={onDelete}
      onPositionChange={onPositionChange}
      onContextMenu={onContextMenu}
      isHighlighted={isHighlighted}
    >
      {/* 3D Clock bezel - the outer ring */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #ffffff 0%, #f0eeea 50%, #e8e6e2 100%)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.1),
            inset 0 2px 4px rgba(255, 255, 255, 0.9),
            inset 0 -4px 8px rgba(0, 0, 0, 0.05)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Inner clock face */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #fafaf8 0%, #f5f4f2 100%)',
            boxShadow: `
              inset 0 2px 8px rgba(0, 0, 0, 0.06),
              inset 0 1px 2px rgba(0, 0, 0, 0.04)
            `,
            position: 'relative',
          }}
        >
          {/* Hour tick marks */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const isMain = i % 3 === 0;
            const outerRadius = 62;
            const length = isMain ? 8 : 4;
            const innerRadius = outerRadius - length;

            const x1 = 70 + Math.sin(angle) * innerRadius;
            const y1 = 70 - Math.cos(angle) * innerRadius;
            const x2 = 70 + Math.sin(angle) * outerRadius;
            const y2 = 70 - Math.cos(angle) * outerRadius;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <svg width="140" height="140" style={{ position: 'absolute', left: 0, top: 0 }}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isMain ? '#888' : '#ccc'}
                    strokeWidth={isMain ? 2 : 1}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            );
          })}

          {/* Hour hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 35,
              background: '#333',
              borderRadius: 2,
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
            }}
          />

          {/* Minute hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 2.5,
              height: 50,
              background: '#444',
              borderRadius: 1.5,
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
            }}
          />

          {/* Center pin */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 10,
              height: 10,
              background: 'linear-gradient(145deg, #555 0%, #333 100%)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />

          {/* Digital time display - inside clock face */}
          <div
            style={{
              position: 'absolute',
              bottom: 25,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                color: '#222',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {hours}:{minutes}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#666',
                letterSpacing: '0.02em',
                marginTop: 2,
              }}
            >
              {period} {timezoneAbbr}
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
