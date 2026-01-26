'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Globe } from 'lucide-react';
import type { Widget } from '@/types';
import { POPULAR_TIMEZONES } from './ClockWidget';

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
  const [showTimezoneName, setShowTimezoneName] = useState(config.showTimezoneName ?? true);

  // Reset form when widget changes
  useEffect(() => {
    if (widget?.config) {
      const cfg = widget.config as { timezone?: string; format?: '12h' | '24h'; showTimezoneName?: boolean };
      setTimezone(cfg.timezone || 'America/New_York');
      setFormat(cfg.format || '12h');
      setShowTimezoneName(cfg.showTimezoneName ?? true);
    }
  }, [widget]);

  const handleSave = () => {
    onSave({
      timezone,
      format,
      showTimezoneName,
    });
    onClose();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-[201] top-1/2 left-1/2 w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: '#FDFBF7',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <Clock size={20} style={{ color: '#3b82f6' }} />
                </div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: '#222' }}
                >
                  Edit Clock Widget
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                style={{ color: '#666' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Time Preview */}
            <div
              className="px-6 py-6 text-center"
              style={{ background: 'rgba(0,0,0,0.02)' }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 600,
                  color: '#222',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {getTimePreview()}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#666',
                  marginTop: 4,
                }}
              >
                {selectedTz?.label || timezone} ({selectedTz?.abbr || ''})
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Timezone Selector */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: '#888' }}
                >
                  <Globe size={14} />
                  Timezone
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {POPULAR_TIMEZONES.map((tz) => {
                    const isSelected = timezone === tz.id;
                    return (
                      <button
                        key={tz.id}
                        onClick={() => setTimezone(tz.id)}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                          border: `1px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-medium"
                            style={{ color: isSelected ? '#3b82f6' : '#333' }}
                          >
                            {tz.label}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: '#999' }}
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
                  className="block text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: '#888' }}
                >
                  Time Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('12h')}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: format === '12h' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${format === '12h' ? '#3b82f6' : 'transparent'}`,
                      color: format === '12h' ? '#3b82f6' : '#666',
                    }}
                  >
                    12-hour (AM/PM)
                  </button>
                  <button
                    onClick={() => setFormat('24h')}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: format === '24h' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${format === '24h' ? '#3b82f6' : 'transparent'}`,
                      color: format === '24h' ? '#3b82f6' : '#666',
                    }}
                  >
                    24-hour
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex justify-end gap-3"
              style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
            >
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: '#666',
                  background: 'rgba(0,0,0,0.05)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors text-white"
                style={{
                  background: '#3b82f6',
                }}
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
