'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import type { StatusWidget, StatusType } from '@/types';
import { STATUS_CONFIG } from './StatusWidget';

interface StatusWidgetEditorProps {
  statusWidget: StatusWidget | null;
  onSave: (data: Partial<StatusWidget>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const STATUS_OPTIONS: { value: StatusType; label: string; description: string }[] = [
  { value: 'available', label: 'Available', description: 'Open for new opportunities' },
  { value: 'looking', label: 'Looking for', description: 'Actively seeking something specific' },
  { value: 'taking', label: 'Taking', description: 'Accepting specific types of work' },
  { value: 'open', label: 'Open to', description: 'Interested in certain opportunities' },
  { value: 'consulting', label: 'Consulting on', description: 'Offering expertise in a domain' },
];

export function StatusWidgetEditor({ statusWidget, onSave, onClose, isOpen }: StatusWidgetEditorProps) {
  const [statusType, setStatusType] = useState<StatusType>(statusWidget?.statusType as StatusType || 'available');
  const [title, setTitle] = useState(statusWidget?.title || '');
  const [description, setDescription] = useState(statusWidget?.description || '');
  const [ctaUrl, setCtaUrl] = useState(statusWidget?.ctaUrl || '');
  const [ctaLabel, setCtaLabel] = useState(statusWidget?.ctaLabel || '');
  const [isVisible, setIsVisible] = useState(statusWidget?.isVisible ?? true);

  // Reset form when statusWidget changes
  useEffect(() => {
    if (statusWidget) {
      setStatusType(statusWidget.statusType as StatusType || 'available');
      setTitle(statusWidget.title || '');
      setDescription(statusWidget.description || '');
      setCtaUrl(statusWidget.ctaUrl || '');
      setCtaLabel(statusWidget.ctaLabel || '');
      setIsVisible(statusWidget.isVisible ?? true);
    }
  }, [statusWidget]);

  const handleSave = () => {
    onSave({
      statusType,
      title: title || 'Available for work',
      description: description || null,
      ctaUrl: ctaUrl || null,
      ctaLabel: ctaLabel || null,
      isVisible,
    });
    onClose();
  };

  const config = STATUS_CONFIG[statusType];

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
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-xl)',
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
              style={{ borderBottom: '1px solid var(--border-light)' }}
            >
              <h2
                className="text-lg font-semibold"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Edit Availability Status
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Status Type Selector */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Status Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const optionConfig = STATUS_CONFIG[option.value];
                    const isSelected = statusType === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setStatusType(option.value)}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? optionConfig.bgColor : 'var(--bg-secondary)',
                          border: `1px solid ${isSelected ? optionConfig.color : 'var(--border-light)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: optionConfig.color }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: isSelected ? optionConfig.color : 'var(--text-primary)' }}
                          >
                            {option.label}
                          </span>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Design collaborations"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell visitors what you're looking for..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              {/* CTA URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    CTA URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Learn more"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>
              </div>

              {/* Visibility Toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-3">
                  {isVisible ? (
                    <Eye size={20} style={{ color: 'var(--text-secondary)' }} />
                  ) : (
                    <EyeOff size={20} style={{ color: 'var(--text-tertiary)' }} />
                  )}
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Show on desktop
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {isVisible ? 'Visitors can see your status' : 'Status is hidden'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="relative w-12 h-7 rounded-full transition-colors"
                  style={{
                    background: isVisible ? config.color : 'var(--bg-tertiary)',
                  }}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ left: isVisible ? '24px' : '4px' }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex justify-end gap-3"
              style={{ borderTop: '1px solid var(--border-light)' }}
            >
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors text-white"
                style={{
                  background: config.color,
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

export type { StatusWidgetEditorProps };
