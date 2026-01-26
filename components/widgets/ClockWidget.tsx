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

function getTimezoneLabel(timezone: string): string {
  const popular = POPULAR_TIMEZONES.find(tz => tz.id === timezone);
  if (popular) return popular.label;
  return timezone.split('/').pop()?.replace(/_/g, ' ') || '';
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

      return { hourAngle, minuteAngle, secondAngle, seconds };
    } catch {
      return { hourAngle: 0, minuteAngle: 0, secondAngle: 0, seconds: 0 };
    }
  }, [config.timezone]);

  const getFormattedDate = useCallback((date: Date) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: config.timezone,
        day: 'numeric',
        month: 'short',
      });
      return formatter.format(date);
    } catch {
      return '';
    }
  }, [config.timezone]);

  const timezoneLabel = getTimezoneLabel(config.timezone);

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
        <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#999', fontSize: 12 }}>...</div>
        </div>
      </WidgetWrapper>
    );
  }

  const { hourAngle, minuteAngle, secondAngle, seconds } = getTimeAngles(time);
  const formattedDate = getFormattedDate(time);

  // Size of the widget
  const SIZE = 200;
  const FACE_SIZE = 170;
  const CENTER = SIZE / 2;
  const FACE_CENTER = FACE_SIZE / 2;

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
      {/* Outer housing - Braun-style white plastic square with rounded corners */}
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 24,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
          boxShadow: `
            0 2px 4px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.1),
            0 20px 48px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 rgba(0, 0, 0, 0.03)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Top-left button detail */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #f0f0ee 0%, #e4e4e0 100%)',
            boxShadow: `
              inset 0 1px 2px rgba(0, 0, 0, 0.08),
              0 1px 0 rgba(255, 255, 255, 0.8)
            `,
          }}
        />

        {/* Top-right speaker grille */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 20,
            height: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 2,
          }}
        >
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: '#d0d0cc',
              }}
            />
          ))}
        </div>

        {/* Corner screws/feet */}
        {[
          { bottom: 8, left: 8 },
          { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #e8e8e4 0%, #d8d8d4 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          />
        ))}

        {/* Inner clock face - circular */}
        <div
          style={{
            width: FACE_SIZE,
            height: FACE_SIZE,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            boxShadow: `
              inset 0 2px 6px rgba(0, 0, 0, 0.06),
              inset 0 0 0 1px rgba(0, 0, 0, 0.04)
            `,
            position: 'relative',
          }}
        >
          {/* SVG for tick marks, numbers, and orange seconds arc */}
          <svg
            width={FACE_SIZE}
            height={FACE_SIZE}
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            {/* Orange seconds progress arc */}
            <circle
              cx={FACE_CENTER}
              cy={FACE_CENTER}
              r={75}
              fill="none"
              stroke="#ff6b00"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${(seconds / 60) * 471} 471`}
              transform={`rotate(-90 ${FACE_CENTER} ${FACE_CENTER})`}
              style={{ transition: 'stroke-dasharray 0.2s ease-out' }}
            />

            {/* Minute tick marks - 60 marks */}
            {[...Array(60)].map((_, i) => {
              const angle = (i * 6) * (Math.PI / 180);
              const isHour = i % 5 === 0;
              const outerRadius = 70;
              const innerRadius = isHour ? 60 : 65;

              const x1 = FACE_CENTER + Math.sin(angle) * innerRadius;
              const y1 = FACE_CENTER - Math.cos(angle) * innerRadius;
              const x2 = FACE_CENTER + Math.sin(angle) * outerRadius;
              const y2 = FACE_CENTER - Math.cos(angle) * outerRadius;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isHour ? '#1a1a1a' : '#c0c0c0'}
                  strokeWidth={isHour ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Hour numbers */}
            {[12, 3, 6, 9].map((num) => {
              const angle = ((num === 12 ? 0 : num) * 30) * (Math.PI / 180);
              const radius = 48;
              const x = FACE_CENTER + Math.sin(angle) * radius;
              const y = FACE_CENTER - Math.cos(angle) * radius;

              return (
                <text
                  key={num}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#1a1a1a"
                  fontSize={16}
                  fontWeight={600}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {num}
                </text>
              );
            })}

            {/* Small minute numbers (15, 30, 45, 60) */}
            {[
              { num: 60, angle: 0 },
              { num: 15, angle: 90 },
              { num: 30, angle: 180 },
              { num: 45, angle: 270 },
            ].map(({ num, angle }) => {
              const angleRad = angle * (Math.PI / 180);
              const radius = 78;
              const x = FACE_CENTER + Math.sin(angleRad) * radius;
              const y = FACE_CENTER - Math.cos(angleRad) * radius;

              return (
                <text
                  key={num}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#888"
                  fontSize={8}
                  fontWeight={500}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {num}
                </text>
              );
            })}
          </svg>

          {/* Brand text */}
          <div
            style={{
              position: 'absolute',
              top: 48,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1a1a1a',
                letterSpacing: '0.02em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              goOS
            </div>
            <div
              style={{
                fontSize: 7,
                color: '#888',
                letterSpacing: '0.05em',
                marginTop: 1,
              }}
            >
              {timezoneLabel}
            </div>
          </div>

          {/* Hour hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 5,
              height: 40,
              background: '#1a1a1a',
              borderRadius: '2px 2px 1px 1px',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
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
              height: 58,
              background: '#1a1a1a',
              borderRadius: '1.5px 1.5px 1px 1px',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          />

          {/* Second hand - orange */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1.5,
              height: 62,
              background: '#ff6b00',
              borderRadius: '1px',
              transformOrigin: '50% calc(100% - 10px)',
              transform: `translateX(-50%) translateY(calc(-100% + 10px)) rotate(${secondAngle}deg)`,
              transition: 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
            }}
          >
            {/* Counterweight */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 5,
                height: 14,
                background: '#ff6b00',
                borderRadius: '1px',
              }}
            />
          </div>

          {/* Center pin - orange */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 10,
              height: 10,
              background: '#ff6b00',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />

          {/* Date display */}
          <div
            style={{
              position: 'absolute',
              bottom: 36,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 9,
              fontWeight: 500,
              color: '#666',
              letterSpacing: '0.02em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {formattedDate}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
