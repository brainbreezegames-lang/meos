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

// Theme colors for light and dark modes
const THEME = {
  light: {
    // Outer bezel - warm cream with depth
    bezelGradient: 'linear-gradient(145deg, #fdfcfa 0%, #f5f3ef 40%, #ebe8e3 100%)',
    bezelShadow: `
      0 5px 20px rgba(120, 100, 80, 0.08),
      0 2px 6px rgba(120, 100, 80, 0.04),
      inset 0 1px 2px rgba(255, 255, 255, 0.9),
      inset 0 -2px 4px rgba(180, 160, 140, 0.04)
    `,
    // Inner face - clean cream white
    faceGradient: 'linear-gradient(180deg, #faf9f7 0%, #f3f1ed 100%)',
    faceShadow: `
      inset 0 1px 6px rgba(100, 80, 60, 0.03),
      inset 0 1px 2px rgba(100, 80, 60, 0.02)
    `,
    // Tick marks
    tickMain: '#6b5c4d',
    tickMinor: '#c4b8a8',
    // Hands - dark walnut
    hourHand: 'linear-gradient(180deg, #3d3428 0%, #2a241c 100%)',
    minuteHand: 'linear-gradient(180deg, #4a4036 0%, #3d3428 100%)',
    centerPin: 'linear-gradient(145deg, #5c5040 0%, #3d3428 100%)',
    centerPinShadow: '0 1px 2px rgba(60, 50, 40, 0.2)',
    // Text
    timeColor: '#2a241c',
    timezoneColor: '#7a6c5c',
  },
  dark: {
    // Outer bezel - deep charcoal with metallic sheen
    bezelGradient: 'linear-gradient(145deg, #3a3632 0%, #2a2724 40%, #1e1c1a 100%)',
    bezelShadow: `
      0 10px 40px rgba(0, 0, 0, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 2px 3px rgba(255, 255, 255, 0.08),
      inset 0 -3px 6px rgba(0, 0, 0, 0.2)
    `,
    // Inner face - matte dark slate
    faceGradient: 'linear-gradient(180deg, #2d2a27 0%, #242220 100%)',
    faceShadow: `
      inset 0 2px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 3px rgba(0, 0, 0, 0.2)
    `,
    // Tick marks - subtle champagne gold
    tickMain: '#c9b896',
    tickMinor: '#5a5450',
    // Hands - brushed silver
    hourHand: 'linear-gradient(180deg, #e8e4dc 0%, #ccc8c0 100%)',
    minuteHand: 'linear-gradient(180deg, #dcd8d0 0%, #c4c0b8 100%)',
    centerPin: 'linear-gradient(145deg, #c9b896 0%, #a89870 100%)',
    centerPinShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(201, 184, 150, 0.2)',
    // Text - warm off-white
    timeColor: '#f0ece4',
    timezoneColor: '#a89880',
  },
};

export function ClockWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: ClockWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [isDark, setIsDark] = useState(false);

  const config: ClockWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<ClockWidgetConfig>) };

  // Detect dark mode - specifically check for theme-sketch.dark class
  useEffect(() => {
    const checkDarkMode = () => {
      // Check for .dark class specifically on the theme-sketch element (goOS desktop)
      const themeElement = document.querySelector('.theme-sketch');
      const hasDarkClass = themeElement?.classList.contains('dark') || false;
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    // Listen for class changes on the theme element
    const observer = new MutationObserver(checkDarkMode);
    const themeElement = document.querySelector('.theme-sketch');
    if (themeElement) {
      observer.observe(themeElement, { attributes: true, attributeFilter: ['class'] });
    }
    // Also observe document in case theme element is added later
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [mounted]); // Re-run when mounted to ensure theme element exists

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

      const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
      const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360;

      return { hourAngle, minuteAngle };
    } catch {
      return { hourAngle: 0, minuteAngle: 0 };
    }
  }, [config.timezone]);

  const timezoneAbbr = getTimezoneAbbreviation(config.timezone);
  const theme = isDark ? THEME.dark : THEME.light;

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
          <div style={{ color: isDark ? '#666' : '#999', fontSize: 12 }}>...</div>
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
      {/* Outer bezel - luxury desk clock frame */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: theme.bezelGradient,
          boxShadow: theme.bezelShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Inner clock face */}
        <div
          style={{
            width: 142,
            height: 142,
            borderRadius: '50%',
            background: theme.faceGradient,
            boxShadow: theme.faceShadow,
            position: 'relative',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Hour tick marks - rendered as single SVG for performance */}
          <svg
            width="142"
            height="142"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
            }}
          >
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const isMain = i % 3 === 0;
              const outerRadius = 64;
              const length = isMain ? 10 : 5;
              const innerRadius = outerRadius - length;

              const x1 = 71 + Math.sin(angle) * innerRadius;
              const y1 = 71 - Math.cos(angle) * innerRadius;
              const x2 = 71 + Math.sin(angle) * outerRadius;
              const y2 = 71 - Math.cos(angle) * outerRadius;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMain ? theme.tickMain : theme.tickMinor}
                  strokeWidth={isMain ? 2.5 : 1.5}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.4s ease' }}
                />
              );
            })}
          </svg>

          {/* Hour hand - tapered design */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 5,
              height: 36,
              background: theme.hourHand,
              borderRadius: '2px 2px 1px 1px',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
              boxShadow: isDark
                ? '0 2px 4px rgba(0,0,0,0.4), 0 0 6px rgba(255,255,255,0.05)'
                : '0 1px 3px rgba(60,50,40,0.25)',
              transition: 'background 0.4s ease, box-shadow 0.4s ease',
            }}
          />

          {/* Minute hand - elegant thin */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 3,
              height: 52,
              background: theme.minuteHand,
              borderRadius: '1.5px 1.5px 1px 1px',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
              boxShadow: isDark
                ? '0 2px 4px rgba(0,0,0,0.4), 0 0 4px rgba(255,255,255,0.03)'
                : '0 1px 2px rgba(60,50,40,0.2)',
              transition: 'background 0.4s ease, box-shadow 0.4s ease',
            }}
          />

          {/* Center pin - jewel-like accent */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 12,
              height: 12,
              background: theme.centerPin,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: theme.centerPinShadow,
              transition: 'all 0.4s ease',
            }}
          />

          {/* Digital time display */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 600,
                fontFamily: 'var(--font-display, -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif)',
                color: theme.timeColor,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.4s ease',
              }}
            >
              {hours}:{minutes}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: theme.timezoneColor,
                letterSpacing: '0.04em',
                marginTop: 3,
                textTransform: 'uppercase',
                transition: 'color 0.4s ease',
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
