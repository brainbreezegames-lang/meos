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

// Popular timezones for remote workers
const POPULAR_TIMEZONES = [
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
  // Check if it's in our popular list first
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

function getTimezoneCity(timezone: string): string {
  const popular = POPULAR_TIMEZONES.find(tz => tz.id === timezone);
  if (popular) return popular.label;
  return timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
}

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
};

export function ClockWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: ClockWidgetProps) {
  // Start with null to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [localConfig, setLocalConfig] = useState<ClockWidgetConfig>({ ...DEFAULT_CONFIG, ...(widget.config as Partial<ClockWidgetConfig>) });

  const config = localConfig;

  // Only start clock after mount (client-side only)
  useEffect(() => {
    setMounted(true);
    setTime(new Date());

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update local config when widget config changes
  useEffect(() => {
    setLocalConfig({ ...DEFAULT_CONFIG, ...(widget.config as Partial<ClockWidgetConfig>) });
  }, [widget.config]);

  const handleTimezoneChange = useCallback((newTimezone: string) => {
    setLocalConfig(prev => ({ ...prev, timezone: newTimezone }));
    setShowSelector(false);
    // If onEdit is available and owner, could persist this change
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

  // Get current time components for analog clock hands
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
  const timezoneCity = getTimezoneCity(config.timezone);

  // Show loading state until mounted
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
        <div
          style={{
            ...WIDGET_CONTAINER,
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: '#999', fontSize: 12 }}>Loading...</div>
        </div>
      </WidgetWrapper>
    );
  }

  const { hours, minutes, period } = formatTime(time);
  const { hourAngle, minuteAngle, secondAngle } = getTimeAngles(time);

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
      <div
        style={{
          ...WIDGET_CONTAINER,
          width: 140,
          height: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Analog clock face */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f4f1 100%)',
            boxShadow: `
              0 3px 12px rgba(0, 0, 0, 0.1),
              inset 0 2px 4px rgba(255, 255, 255, 1),
              inset 0 -2px 4px rgba(0, 0, 0, 0.05)
            `,
            border: '2px solid #e8e6e1',
            position: 'relative',
            marginBottom: 8,
          }}
        >
          {/* Hour markers - dots */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const radius = 28;
            const x = 36 + Math.sin(angle) * radius;
            const y = 36 - Math.cos(angle) * radius;
            const isMainHour = i % 3 === 0;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - (isMainHour ? 2.5 : 1.5),
                  top: y - (isMainHour ? 2.5 : 1.5),
                  width: isMainHour ? 5 : 3,
                  height: isMainHour ? 5 : 3,
                  borderRadius: '50%',
                  background: isMainHour ? '#333' : '#bbb',
                }}
              />
            );
          })}

          {/* Hour hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 20,
              background: 'linear-gradient(to bottom, #222 0%, #444 100%)',
              borderRadius: 2,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${hourAngle}deg)`,
              marginTop: -20,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />

          {/* Minute hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 3,
              height: 26,
              background: 'linear-gradient(to bottom, #333 0%, #555 100%)',
              borderRadius: 1.5,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
              marginTop: -26,
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          />

          {/* Second hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1.5,
              height: 28,
              background: '#e53935',
              borderRadius: 1,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${secondAngle}deg)`,
              marginTop: -28,
            }}
          />

          {/* Center dot */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 8,
              height: 8,
              background: 'linear-gradient(145deg, #444 0%, #222 100%)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* Digital time display */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              color: '#222',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {hours}:{minutes}
            {period && (
              <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 2, color: '#666' }}>
                {period}
              </span>
            )}
          </div>

          {/* Timezone button - click to switch */}
          <button
            onClick={() => setShowSelector(!showSelector)}
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#666',
              letterSpacing: '0.03em',
              marginTop: 4,
              textTransform: 'uppercase',
              background: showSelector ? '#f0ede8' : 'transparent',
              border: 'none',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!showSelector) e.currentTarget.style.background = '#f5f3ee';
            }}
            onMouseLeave={(e) => {
              if (!showSelector) e.currentTarget.style.background = 'transparent';
            }}
          >
            {timezoneCity} · {timezoneAbbr}
          </button>
        </div>

        {/* Timezone selector dropdown */}
        {showSelector && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: 8,
              background: '#FDFBF7',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.08)',
              padding: 8,
              zIndex: 100,
              width: 160,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {POPULAR_TIMEZONES.map((tz) => (
              <button
                key={tz.id}
                onClick={() => handleTimezoneChange(tz.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: 11,
                  fontWeight: config.timezone === tz.id ? 600 : 400,
                  color: config.timezone === tz.id ? '#222' : '#555',
                  background: config.timezone === tz.id ? '#f0ede8' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (config.timezone !== tz.id) {
                    e.currentTarget.style.background = '#f5f3ee';
                  }
                }}
                onMouseLeave={(e) => {
                  if (config.timezone !== tz.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span>{tz.label}</span>
                <span style={{ color: '#999', fontSize: 10 }}>{tz.abbr}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
