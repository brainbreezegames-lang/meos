'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/types';

interface Habit {
  id: string;
  name: string;
  completedDays: string[]; // ISO dates like '2026-01-30'
}

interface HabitTrackerWidgetConfig {
  habits: Habit[];
}

interface HabitTrackerWidgetProps {
  widget: Widget;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  onConfigChange?: (config: Record<string, unknown>) => void;
}

const DEFAULT_CONFIG: HabitTrackerWidgetConfig = {
  habits: [
    { id: 'h1', name: 'Exercise', completedDays: [] },
    { id: 'h2', name: 'Read', completedDays: [] },
    { id: 'h3', name: 'Meditate', completedDays: [] },
  ],
};

// Theme colors
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
    contentBg: 'linear-gradient(180deg, #fafaf8 0%, #f6f6f2 100%)',
    contentShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.04)',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    inputBg: 'transparent',
    inputBorder: 'rgba(0,0,0,0.06)',
    dotEmpty: 'rgba(0,0,0,0.06)',
    dotColor: '#d0d0cc',
    separatorColor: 'rgba(0,0,0,0.04)',
    addBorder: 'rgba(0,0,0,0.1)',
    deleteBg: 'rgba(0,0,0,0.04)',
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
    contentBg: 'linear-gradient(180deg, #262624 0%, #1e1e1c 100%)',
    contentShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f0f0ec',
    textSecondary: '#a0a09c',
    textMuted: '#6a6a68',
    inputBg: 'transparent',
    inputBorder: 'rgba(255,255,255,0.06)',
    dotEmpty: 'rgba(255,255,255,0.06)',
    dotColor: '#4a4a48',
    separatorColor: 'rgba(255,255,255,0.04)',
    addBorder: 'rgba(255,255,255,0.1)',
    deleteBg: 'rgba(255,255,255,0.06)',
  },
};

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'narrow' });
}

function generateId(): string {
  return 'h' + Math.random().toString(36).substring(2, 9);
}

export function HabitTrackerWidget({
  widget,
  isOwner = false,
  onEdit,
  onDelete,
  onPositionChange,
  onContextMenu,
  isHighlighted = false,
  onConfigChange,
}: HabitTrackerWidgetProps) {
  const rawConfig = widget.config as Partial<HabitTrackerWidgetConfig>;
  const [habits, setHabits] = useState<Habit[]>(rawConfig?.habits?.length ? rawConfig.habits : DEFAULT_CONFIG.habits);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Dark mode detection
  useEffect(() => {
    setMounted(true);
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync habits from config when it changes externally
  useEffect(() => {
    if (rawConfig?.habits?.length) {
      setHabits(rawConfig.habits);
    }
  }, [rawConfig?.habits]);

  // Debounced save
  const saveHabits = useCallback((updated: Habit[]) => {
    setHabits(updated);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onConfigChange?.({ habits: updated });
    }, 500);
  }, [onConfigChange]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const toggleDay = useCallback((habitId: string, dateStr: string) => {
    if (!isOwner) return;
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const has = h.completedDays.includes(dateStr);
      return {
        ...h,
        completedDays: has
          ? h.completedDays.filter(d => d !== dateStr)
          : [...h.completedDays, dateStr],
      };
    });
    saveHabits(updated);
  }, [habits, isOwner, saveHabits]);

  const renameHabit = useCallback((habitId: string, name: string) => {
    const updated = habits.map(h => h.id === habitId ? { ...h, name } : h);
    saveHabits(updated);
  }, [habits, saveHabits]);

  const addHabit = useCallback(() => {
    if (!isOwner) return;
    const updated = [...habits, { id: generateId(), name: 'New habit', completedDays: [] }];
    saveHabits(updated);
  }, [habits, isOwner, saveHabits]);

  const removeHabit = useCallback((habitId: string) => {
    if (!isOwner) return;
    const updated = habits.filter(h => h.id !== habitId);
    saveHabits(updated);
  }, [habits, isOwner, saveHabits]);

  const theme = isDark ? THEMES.dark : THEMES.light;
  const last7Days = getLastNDays(7);
  const today = new Date().toISOString().split('T')[0];

  // Consistent square sizing — shared between header labels and day grid
  const SQ = 16;
  const SQ_GAP = 5;
  const GRID_W = 7 * SQ + 6 * SQ_GAP; // 142px

  if (!mounted) {
    return (
      <WidgetWrapper widget={widget} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} onPositionChange={onPositionChange} onContextMenu={onContextMenu} isHighlighted={isHighlighted}>
        <div style={{ width: 240, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: theme.textMuted, fontSize: 12 }}>...</div>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper widget={widget} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} onPositionChange={onPositionChange} onContextMenu={onContextMenu} isHighlighted={isHighlighted}>
      {/* Outer housing */}
      <div
        style={{
          width: 240,
          minHeight: 200,
          borderRadius: 22,
          background: theme.housing,
          boxShadow: theme.housingShadow,
          padding: '16px 16px 26px',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Corner dots */}
        {[
          { top: 10, left: 10 },
          { top: 10, right: 10 },
        ].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 4, height: 4, borderRadius: '50%', background: theme.dotColor, transition: 'all 0.3s ease' }} />
        ))}

        {/* Header — title left, individual day labels right aligned to squares */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, paddingTop: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.textPrimary, letterSpacing: '-0.01em', fontFamily: 'system-ui, -apple-system, sans-serif', transition: 'color 0.3s ease' }}>
            Habits
          </div>
          {/* Day-of-week letters — each centered on its column */}
          <div style={{ display: 'flex', gap: SQ_GAP, width: GRID_W, flexShrink: 0 }}>
            {last7Days.map(d => (
              <div
                key={d}
                style={{
                  width: SQ,
                  textAlign: 'center',
                  fontSize: 9,
                  fontWeight: 600,
                  color: d === today ? '#ff6b00' : theme.textMuted,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.02em',
                }}
              >
                {getDayLabel(d)}
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            background: theme.contentBg,
            borderRadius: 14,
            boxShadow: theme.contentShadow,
            padding: '10px 12px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Habits list */}
          {habits.map((habit, idx) => (
            <div
              key={habit.id}
              className="habit-row"
              style={{ position: 'relative' }}
              onMouseEnter={e => {
                const btn = e.currentTarget.querySelector<HTMLElement>('.habit-delete');
                if (btn) btn.style.opacity = '1';
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget.querySelector<HTMLElement>('.habit-delete');
                if (btn) btn.style.opacity = '0';
              }}
            >
              {idx > 0 && (
                <div style={{ height: 1, background: theme.separatorColor, margin: '8px 0' }} />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 32,
                }}
              >
                {/* Habit name — flexible width */}
                {editingId === habit.id && isOwner ? (
                  <input
                    autoFocus
                    value={habit.name}
                    onChange={e => renameHabit(habit.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingId(null); }}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 11,
                      fontWeight: 500,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: theme.textPrimary,
                      background: theme.inputBg,
                      border: `1px solid ${theme.inputBorder}`,
                      borderRadius: 4,
                      padding: '3px 6px',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isOwner && setEditingId(habit.id)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 11,
                      fontWeight: 500,
                      color: theme.textPrimary,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      cursor: isOwner ? 'text' : 'default',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {habit.name}
                  </div>
                )}

                {/* Day squares — fixed grid aligned with header */}
                <div style={{ display: 'flex', gap: SQ_GAP, width: GRID_W, flexShrink: 0 }}>
                  {last7Days.map(day => {
                    const isCompleted = habit.completedDays.includes(day);
                    const isToday = day === today;
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(habit.id, day)}
                        disabled={!isOwner}
                        aria-label={`${habit.name} - ${day}${isCompleted ? ' (completed)' : ''}`}
                        style={{
                          width: SQ,
                          height: SQ,
                          borderRadius: 4,
                          border: isToday ? `1.5px solid ${isCompleted ? '#ff6b00' : theme.textMuted}` : 'none',
                          background: isCompleted ? '#ff6b00' : theme.dotEmpty,
                          cursor: isOwner ? 'pointer' : 'default',
                          padding: 0,
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Delete — only visible on row hover */}
                {isOwner && (
                  <button
                    className="habit-delete"
                    onClick={() => removeHabit(habit.id)}
                    style={{
                      width: 18, height: 18, borderRadius: 5,
                      border: 'none', cursor: 'pointer',
                      background: theme.deleteBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: theme.textMuted,
                      fontSize: 10,
                      padding: 0,
                      opacity: 0,
                      transition: 'opacity 0.15s ease',
                      flexShrink: 0,
                    }}
                    aria-label={`Remove ${habit.name}`}
                  >
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add habit */}
          {isOwner && habits.length < 8 && (
            <>
              <div style={{ height: 1, background: theme.separatorColor, margin: '8px 0' }} />
              <button
                onClick={addHabit}
                style={{
                  width: '100%',
                  height: 30,
                  borderRadius: 7,
                  border: `1.5px dashed ${theme.addBorder}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  color: theme.textMuted,
                  fontSize: 11,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'all 0.15s ease',
                }}
                aria-label="Add new habit"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add habit
              </button>
            </>
          )}
        </div>

        {/* Bottom dots */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: theme.dotColor, transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>
    </WidgetWrapper>
  );
}

export { DEFAULT_CONFIG as HABITS_WIDGET_DEFAULT_CONFIG };
