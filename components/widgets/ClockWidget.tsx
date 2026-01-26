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
      {/* Main clock container with 3D effect */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f0 50%, #e8e8e0 100%)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.15),
            0 10px 20px rgba(0, 0, 0, 0.1),
            inset 0 2px 4px rgba(255, 255, 255, 0.9),
            inset 0 -2px 4px rgba(0, 0, 0, 0.05)
          `,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer bezel ring */}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #fafafa 0%, #e5e5e0 100%)',
            boxShadow: `
              inset 0 4px 8px rgba(0, 0, 0, 0.08),
              inset 0 -2px 4px rgba(255, 255, 255, 0.8)
            `,
          }}
        />

        {/* Inner clock face */}
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafaf8 100%)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180);
            const isMainHour = i % 3 === 0;
            const radius = 62;
            const x = 50 + Math.sin(angle) * (radius / 78 * 50);
            const y = 50 - Math.cos(angle) * (radius / 78 * 50);

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: isMainHour ? 3 : 2,
                  height: isMainHour ? 10 : 6,
                  background: isMainHour ? '#555' : '#bbb',
                  borderRadius: 1,
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  transformOrigin: 'center center',
                }}
              />
            );
          })}

          {/* Clock hands */}
          {/* Hour hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 36,
              background: '#444',
              borderRadius: 2,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${hourAngle}deg)`,
              marginTop: -36,
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
              height: 50,
              background: '#555',
              borderRadius: 1.5,
              transformOrigin: 'center top',
              transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
              marginTop: -50,
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          />

          {/* Center cap */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 10,
              height: 10,
              background: 'linear-gradient(145deg, #666, #444)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />

          {/* Digital time overlay */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '38%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 300,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                color: '#333',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              }}
            >
              {hours}:{minutes}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#777',
                letterSpacing: '0.08em',
                marginTop: 2,
                textTransform: 'uppercase',
              }}
            >
              {period} {config.showTimezoneName && timezoneAbbr}
            </div>
          </div>
        </div>

        {/* Decorative plant at the bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          {/* Pot */}
          <div
            style={{
              width: 22,
              height: 16,
              background: 'linear-gradient(180deg, #c4825a 0%, #a86b45 100%)',
              borderRadius: '2px 2px 4px 4px',
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            {/* Pot rim */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: -1,
                right: -1,
                height: 4,
                background: 'linear-gradient(180deg, #d4926a 0%, #c4825a 100%)',
                borderRadius: '2px 2px 0 0',
              }}
            />
          </div>

          {/* Plant leaves */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Center leaf */}
            <div
              style={{
                width: 8,
                height: 16,
                background: 'linear-gradient(180deg, #7cb342 0%, #558b2f 100%)',
                borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
                position: 'absolute',
                left: '50%',
                bottom: 0,
                transform: 'translateX(-50%)',
              }}
            />
            {/* Left leaf */}
            <div
              style={{
                width: 7,
                height: 13,
                background: 'linear-gradient(180deg, #8bc34a 0%, #689f38 100%)',
                borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
                position: 'absolute',
                left: '50%',
                bottom: 2,
                transform: 'translateX(-50%) rotate(-25deg)',
                transformOrigin: 'bottom center',
                marginLeft: -6,
              }}
            />
            {/* Right leaf */}
            <div
              style={{
                width: 7,
                height: 13,
                background: 'linear-gradient(180deg, #8bc34a 0%, #689f38 100%)',
                borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
                position: 'absolute',
                left: '50%',
                bottom: 2,
                transform: 'translateX(-50%) rotate(25deg)',
                transformOrigin: 'bottom center',
                marginLeft: 6,
              }}
            />
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
