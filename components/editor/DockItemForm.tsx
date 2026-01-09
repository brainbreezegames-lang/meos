'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import type { DockItem } from '@/types';

interface DockItemFormProps {
  item?: DockItem | null;
  onSave: (data: Partial<DockItem>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

const EMOJI_SUGGESTIONS = ['🔗', '📧', '📱', '💼', '🎨', '📝', '🌐', '💻', '📸', '🎵', '🎬', '📚'];

export function DockItemForm({ item, onSave, onDelete, onClose }: DockItemFormProps) {
  const [formData, setFormData] = useState({
    icon: '🔗',
    label: '',
    actionType: 'url' as 'url' | 'email' | 'download',
    actionValue: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        icon: item.icon,
        label: item.label,
        actionType: item.actionType,
        actionValue: item.actionValue,
      });
    }
  }, [item]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this dock item?')) return;

    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Icon */}
      <div>
        <label className="text-[12px] font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          Icon
        </label>
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-[32px]"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 247, 0.9) 100%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            {formData.icon}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Emoji or paste image URL"
              className="w-full px-3 py-2 rounded-lg text-[13px] mb-2"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange('icon', emoji)}
                  className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/5 text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Input
        id="label"
        label="Label"
        value={formData.label}
        onChange={(e) => handleChange('label', e.target.value)}
        placeholder="Website, Email, etc."
        maxLength={30}
        required
      />

      {/* Action Type */}
      <div>
        <label className="text-[12px] font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
          Action
        </label>
        <div className="flex gap-2">
          {(['url', 'email', 'download'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('actionType', type)}
              className="flex-1 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: formData.actionType === type ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: formData.actionType === type ? 'white' : 'var(--text-primary)',
                border: `1px solid ${formData.actionType === type ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
              }}
            >
              {type === 'url' ? 'Link' : type === 'email' ? 'Email' : 'Download'}
            </button>
          ))}
        </div>
      </div>

      <Input
        id="actionValue"
        label={formData.actionType === 'email' ? 'Email address' : formData.actionType === 'download' ? 'File URL' : 'URL'}
        type={formData.actionType === 'email' ? 'email' : 'url'}
        value={formData.actionValue}
        onChange={(e) => handleChange('actionValue', e.target.value)}
        placeholder={
          formData.actionType === 'email'
            ? 'you@example.com'
            : formData.actionType === 'download'
            ? 'https://example.com/file.pdf'
            : 'https://example.com'
        }
        required
      />

      <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
        {item && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
            disabled={isSaving || isDeleting}
          >
            Delete
          </Button>
        )}
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSaving || isDeleting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving} disabled={isSaving || isDeleting}>
          {item ? 'Save changes' : 'Add to dock'}
        </Button>
      </div>
    </form>
  );
}
