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

function getTimezoneInfo(timezone: string): { label: string; abbr: string } {
  const popular = POPULAR_TIMEZONES.find(tz => tz.id === timezone);
  if (popular) return { label: popular.label, abbr: popular.abbr };

  const label = timezone.split('/').pop()?.replace(/_/g, ' ') || '';
  return { label, abbr: label.substring(0, 3).toUpperCase() };
}

// Theme colors - light and dark
const THEMES = {
  light: {
    housing: 'linear-gradient(180deg, #ffffff 0%, #f8f8f6 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.1),
      0 20px 48px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.03)
    `,
    face: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    faceShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
    tickMain: '#1a1a1a',
    tickMinor: '#c0c0c0',
    handColor: '#1a1a1a',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    detailBg: 'linear-gradient(180deg, #f0f0ee 0%, #e4e4e0 100%)',
    detailDot: '#d0d0cc',
  },
  dark: {
    housing: 'linear-gradient(180deg, #2a2a28 0%, #1e1e1c 100%)',
    housingShadow: `
      0 2px 4px rgba(0, 0, 0, 0.2),
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 20px 48px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
    face: 'linear-gradient(180deg, #242422 0%, #1a1a18 100%)',
    faceShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
    tickMain: '#e0e0dc',
    tickMinor: '#4a4a48',
    handColor: '#e8e8e4',
    textPrimary: '#f0f0ec',
    textSecondary: '#a0a09c',
    textMuted: '#6a6a68',
    detailBg: 'linear-gradient(180deg, #3a3a38 0%, #2a2a28 100%)',
    detailDot: '#4a4a48',
  },
};

export function ClockWidget({ widget, isOwner, onEdit, onDelete, onPositionChange, onContextMenu, isHighlighted }: ClockWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [isDark, setIsDark] = useState(false);

  const config: ClockWidgetConfig = { ...DEFAULT_CONFIG, ...(widget.config as Partial<ClockWidgetConfig>) };

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const themeElement = document.querySelector('.theme-sketch');
      const hasDarkClass = themeElement?.classList.contains('dark') || false;
      setIsDark(hasDarkClass);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    const themeElement = document.querySelector('.theme-sketch');
    if (themeElement) {
      observer.observe(themeElement, { attributes: true, attributeFilter: ['class'] });
    }
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

    return () => observer.disconnect();
  }, [mounted]);

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

  const theme = isDark ? THEMES.dark : THEMES.light;
  const { label: timezoneLabel, abbr: timezoneAbbr } = getTimezoneInfo(config.timezone);

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
          <div style={{ color: theme.textMuted, fontSize: 12 }}>...</div>
        </div>
      </WidgetWrapper>
    );
  }

  const { hourAngle, minuteAngle, secondAngle, seconds } = getTimeAngles(time);

  const SIZE = 200;
  const FACE_SIZE = 170;
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
      {/* Outer housing - Braun-style plastic */}
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 24,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top-left button */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: theme.detailBg,
            boxShadow: `inset 0 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.08}), 0 1px 0 rgba(255, 255, 255, ${isDark ? 0.05 : 0.8})`,
            transition: 'all 0.3s ease',
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
                background: theme.detailDot,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Corner feet */}
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
              background: theme.detailBg,
              boxShadow: `inset 0 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
              transition: 'all 0.3s ease',
            }}
          />
        ))}

        {/* Clock face */}
        <div
          style={{
            width: FACE_SIZE,
            height: FACE_SIZE,
            borderRadius: '50%',
            background: theme.face,
            boxShadow: theme.faceShadow,
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          {/* SVG for tick marks and orange arc */}
          <svg
            width={FACE_SIZE}
            height={FACE_SIZE}
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            {/* Orange seconds arc */}
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

            {/* 60 tick marks */}
            {[...Array(60)].map((_, i) => {
              const angle = (i * 6) * (Math.PI / 180);
              const isHour = i % 5 === 0;
              const outerRadius = 70;
              const innerRadius = isHour ? 60 : 65;

              return (
                <line
                  key={i}
                  x1={FACE_CENTER + Math.sin(angle) * innerRadius}
                  y1={FACE_CENTER - Math.cos(angle) * innerRadius}
                  x2={FACE_CENTER + Math.sin(angle) * outerRadius}
                  y2={FACE_CENTER - Math.cos(angle) * outerRadius}
                  stroke={isHour ? theme.tickMain : theme.tickMinor}
                  strokeWidth={isHour ? 2 : 1}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s ease' }}
                />
              );
            })}

            {/* Hour numbers */}
            {[12, 3, 6, 9].map((num) => {
              const angle = ((num === 12 ? 0 : num) * 30) * (Math.PI / 180);
              const radius = 48;
              return (
                <text
                  key={num}
                  x={FACE_CENTER + Math.sin(angle) * radius}
                  y={FACE_CENTER - Math.cos(angle) * radius}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={theme.textPrimary}
                  fontSize={14}
                  fontWeight={600}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {num}
                </text>
              );
            })}
          </svg>

          {/* TIMEZONE - THE HERO */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            {/* City name - BIG */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: theme.textPrimary,
                letterSpacing: '-0.01em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'color 0.3s ease',
              }}
            >
              {timezoneLabel}
            </div>
            {/* Abbreviation */}
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#ff6b00',
                letterSpacing: '0.08em',
                marginTop: 2,
              }}
            >
              {timezoneAbbr}
            </div>
          </div>

          {/* Hour hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 5,
              height: 36,
              background: theme.handColor,
              borderRadius: '2px 2px 1px 1px',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
              boxShadow: `0 1px 2px rgba(0,0,0,${isDark ? 0.4 : 0.2})`,
              transition: 'background 0.3s ease',
            }}
          />

          {/* Minute hand */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 3,
              height: 52,
              background: theme.handColor,
              borderRadius: '1.5px 1.5px 1px 1px',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
              boxShadow: `0 1px 2px rgba(0,0,0,${isDark ? 0.3 : 0.15})`,
              transition: 'background 0.3s ease',
            }}
          />

          {/* Second hand - orange */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1.5,
              height: 58,
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
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as CLOCK_WIDGET_DEFAULT_CONFIG };
