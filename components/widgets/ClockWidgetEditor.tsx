'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock, Globe } from 'lucide-react';
import type { Widget } from '@/types';
import { POPULAR_TIMEZONES } from './ClockWidget';
import { WindowShell } from '@/components/desktop/WindowShell';

interface ClockWidgetEditorProps {
  widget: Widget | null;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ClockWidgetEditor({ widget, onSave, onClose, isOpen }: ClockWidgetEditorProps) {
  const config = widget?.config as { timezone?: string; format?: '12h' | '24h'; showTimezoneName?: boolean } || {};

  const [timezone, setTimezone] = useState(config.timezone || 'America/New_York');
  const [format, setFormat] = useState<'12h' | '24h'>(config.format || '12h');

  // Reset form when widget changes
  useEffect(() => {
    if (widget?.config) {
      const cfg = widget.config as { timezone?: string; format?: '12h' | '24h'; showTimezoneName?: boolean };
      setTimezone(cfg.timezone || 'America/New_York');
      setFormat(cfg.format || '12h');
    }
  }, [widget]);

  const handleSave = () => {
    onSave({
      timezone,
      format,
      showTimezoneName: true,
    });
  };

  // Get current time preview for selected timezone
  const getTimePreview = () => {
    try {
      const now = new Date();
      return now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: format === '12h',
      });
    } catch {
      return '--:--';
    }
  };

  const selectedTz = POPULAR_TIMEZONES.find(tz => tz.id === timezone);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <WindowShell
          title="Edit Clock"
          icon={<Clock size={16} />}
          onClose={onClose}
          variant="light"
          width={400}
          height="auto"
          minHeight={400}
          showAllTrafficLights={false}
          zIndex={10000}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Time Preview */}
            <div
              style={{
                padding: '24px 20px',
                textAlign: 'center',
                background: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
                borderBottom: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #222)',
                  fontFamily: 'var(--font-display, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif)',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}
              >
                {getTimePreview()}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--color-text-secondary, #666)',
                  marginTop: 8,
                }}
              >
                {selectedTz?.label || timezone} ({selectedTz?.abbr || ''})
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
              {/* Timezone Selector */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-tertiary, #888)',
                    marginBottom: 12,
                  }}
                >
                  <Globe size={14} />
                  Timezone
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                    maxHeight: 200,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}
                >
                  {POPULAR_TIMEZONES.map((tz) => {
                    const isSelected = timezone === tz.id;
                    return (
                      <button
                        key={tz.id}
                        onClick={() => setTimezone(tz.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          textAlign: 'left',
                          background: isSelected
                            ? 'var(--color-accent-primary, #ff7722)'
                            : 'var(--color-bg-secondary, rgba(0,0,0,0.04))',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: isSelected ? '#fff' : 'var(--color-text-primary, #333)',
                            }}
                          >
                            {tz.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-tertiary, #999)',
                            }}
                          >
                            {tz.abbr}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Format */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-tertiary, #888)',
                    marginBottom: 12,
                  }}
                >
                  Time Format
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setFormat('12h')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 500,
                      background: format === '12h'
                        ? 'var(--color-accent-primary, #ff7722)'
                        : 'var(--color-bg-secondary, rgba(0,0,0,0.04))',
                      color: format === '12h' ? '#fff' : 'var(--color-text-primary, #666)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    12-hour (AM/PM)
                  </button>
                  <button
                    onClick={() => setFormat('24h')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 500,
                      background: format === '24h'
                        ? 'var(--color-accent-primary, #ff7722)'
                        : 'var(--color-bg-secondary, rgba(0,0,0,0.04))',
                      color: format === '24h' ? '#fff' : 'var(--color-text-primary, #666)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    24-hour
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                borderTop: '1px solid var(--color-border-subtle, rgba(0,0,0,0.06))',
                background: 'var(--color-bg-subtle, rgba(0,0,0,0.02))',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-secondary, #666)',
                  background: 'var(--color-bg-secondary, rgba(0,0,0,0.05))',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'var(--color-accent-primary, #ff7722)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </WindowShell>
      )}
    </AnimatePresence>
  );
}
