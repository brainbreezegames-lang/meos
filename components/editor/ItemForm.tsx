'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, ImageUpload } from '@/components/ui';
import type { DesktopItem, DetailItem, LinkItem } from '@/types';

interface ItemFormProps {
  item?: DesktopItem | null;
  onSave: (data: Partial<DesktopItem>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
  onUpload: (file: File) => Promise<string>;
}

export function ItemForm({ item, onSave, onDelete, onClose, onUpload }: ItemFormProps) {
  const [formData, setFormData] = useState({
    thumbnailUrl: '',
    label: '',
    windowTitle: '',
    windowSubtitle: '',
    windowDescription: '',
    windowDetails: [] as DetailItem[],
    windowLinks: [] as LinkItem[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        thumbnailUrl: item.thumbnailUrl,
        label: item.label,
        windowTitle: item.windowTitle,
        windowSubtitle: item.windowSubtitle || '',
        windowDescription: item.windowDescription,
        windowDetails: item.windowDetails || [],
        windowLinks: item.windowLinks || [],
      });
    }
  }, [item]);

  const handleChange = (field: string, value: string | DetailItem[] | LinkItem[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDetail = () => {
    setFormData((prev) => ({
      ...prev,
      windowDetails: [...prev.windowDetails, { label: '', value: '' }],
    }));
  };

  const handleUpdateDetail = (index: number, field: 'label' | 'value', value: string) => {
    setFormData((prev) => ({
      ...prev,
      windowDetails: prev.windowDetails.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    }));
  };

  const handleRemoveDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      windowDetails: prev.windowDetails.filter((_, i) => i !== index),
    }));
  };

  const handleAddLink = () => {
    setFormData((prev) => ({
      ...prev,
      windowLinks: [...prev.windowLinks, { label: '', url: '' }],
    }));
  };

  const handleUpdateLink = (index: number, field: 'label' | 'url', value: string) => {
    setFormData((prev) => ({
      ...prev,
      windowLinks: prev.windowLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const handleRemoveLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      windowLinks: prev.windowLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        ...formData,
        windowSubtitle: formData.windowSubtitle || null,
        windowDetails: formData.windowDetails.length > 0 ? formData.windowDetails : null,
        windowLinks: formData.windowLinks.length > 0 ? formData.windowLinks : null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

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
      <ImageUpload
        label="Thumbnail"
        value={formData.thumbnailUrl}
        onChange={(url) => handleChange('thumbnailUrl', url)}
        onUpload={onUpload}
        aspectRatio="square"
        className="w-24"
      />

      <Input
        id="label"
        label="Label"
        value={formData.label}
        onChange={(e) => handleChange('label', e.target.value)}
        placeholder="Project name"
        maxLength={30}
        required
      />

      <div className="h-px" style={{ background: 'var(--border-light)' }} />

      <h4 className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
        Window Content
      </h4>

      <Input
        id="windowTitle"
        label="Title"
        value={formData.windowTitle}
        onChange={(e) => handleChange('windowTitle', e.target.value)}
        placeholder="Project Title"
        required
      />

      <Input
        id="windowSubtitle"
        label="Subtitle (optional)"
        value={formData.windowSubtitle}
        onChange={(e) => handleChange('windowSubtitle', e.target.value)}
        placeholder="Brief subtitle"
      />

      <Textarea
        id="windowDescription"
        label="Description"
        value={formData.windowDescription}
        onChange={(e) => handleChange('windowDescription', e.target.value)}
        placeholder="Describe your project..."
        rows={4}
        required
      />

      {/* Details */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Details
          </label>
          <button
            type="button"
            onClick={handleAddDetail}
            className="text-[12px] font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            + Add detail
          </button>
        </div>
        <div className="space-y-2">
          {formData.windowDetails.map((detail, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={detail.label}
                onChange={(e) => handleUpdateDetail(index, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1 px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type="text"
                value={detail.value}
                onChange={(e) => handleUpdateDetail(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveDetail(index)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Links
          </label>
          <button
            type="button"
            onClick={handleAddLink}
            className="text-[12px] font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            + Add link
          </button>
        </div>
        <div className="space-y-2">
          {formData.windowLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => handleUpdateLink(index, 'label', e.target.value)}
                placeholder="Label"
                className="w-1/3 px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-lg text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

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
          {item ? 'Save changes' : 'Add item'}
        </Button>
      </div>
    </form>
  );
}
