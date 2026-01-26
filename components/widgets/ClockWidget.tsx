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
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
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

// Widget container styles matching the spec
const WIDGET_CONTAINER = {
  background: '#FDFBF7',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
  border: '1px solid rgba(255,255,255,0.5)',
};

export function ClockWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: ClockWidgetProps) {
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

  // Get current time components for analog clock hands
  const getTimeAngles = () => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: config.timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(time);
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
  };

  const timezoneAbbr = getTimezoneAbbreviation(config.timezone);
  const { hours, minutes, period } = formatTime(time);
  const { hourAngle, minuteAngle } = getTimeAngles();

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
      {/* Small widget: 120x120 */}
      <div
        style={{
          ...WIDGET_CONTAINER,
          width: 120,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Analog clock face */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f7f4 100%)',
            boxShadow: `
              0 2px 8px rgba(0, 0, 0, 0.08),
              inset 0 1px 2px rgba(255, 255, 255, 0.9),
              inset 0 -1px 2px rgba(0, 0, 0, 0.03)
            `,
            position: 'relative',
            marginBottom: 6,
          }}
        >
          {/* Hour markers - dots */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const radius = 26;
            const x = 32 + Math.sin(angle) * radius;
            const y = 32 - Math.cos(angle) * radius;
            const isMainHour = i % 3 === 0;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - (isMainHour ? 2 : 1.5),
                  top: y - (isMainHour ? 2 : 1.5),
                  width: isMainHour ? 4 : 3,
                  height: isMainHour ? 4 : 3,
                  borderRadius: '50%',
                  background: isMainHour ? '#555' : '#ccc',
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
              width: 3,
              height: 18,
              background: '#333',
              borderRadius: 2,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${hourAngle}deg)`,
              marginTop: -18,
            }}
          />

          {/* Minute hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 2,
              height: 24,
              background: '#555',
              borderRadius: 1,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
              marginTop: -24,
            }}
          />

          {/* Center dot */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 6,
              height: 6,
              background: '#444',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Digital time */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              color: '#333',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {hours}:{minutes} {period}
          </div>
          {config.showTimezoneName && (
            <div
              style={{
                fontSize: 9,
                fontWeight: 500,
                color: '#888',
                letterSpacing: '0.05em',
                marginTop: 2,
                textTransform: 'uppercase',
              }}
            >
              {timezoneAbbr}
            </div>
          )}
        </div>

        {/* Tiny plant decoration */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            right: 8,
            fontSize: 12,
          }}
        >
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            {/* Pot */}
            <path d="M4 12H10L9 16H5L4 12Z" fill="#c4825a"/>
            <path d="M3 11H11V12H3V11Z" fill="#d4926a"/>
            {/* Leaves */}
            <ellipse cx="7" cy="8" rx="2" ry="4" fill="#7cb342"/>
            <ellipse cx="5" cy="9" rx="1.5" ry="3" fill="#8bc34a" transform="rotate(-20 5 9)"/>
            <ellipse cx="9" cy="9" rx="1.5" ry="3" fill="#8bc34a" transform="rotate(20 9 9)"/>
          </svg>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
