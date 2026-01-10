'use client';

import { ImageUpload } from '@/components/ui';

interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

interface GalleryBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function GalleryBlockEditor({ data, onChange, onUpload }: GalleryBlockEditorProps) {
  const images = (data.images as GalleryImage[]) || [];
  const columns = (data.columns as number) || 2;

  const addImage = () => {
    onChange({ ...data, images: [...images, { url: '' }] });
  };

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    );
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    onChange({ ...data, images: images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[2, 3, 4].map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => onChange({ ...data, columns: col })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: columns === col ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: columns === col ? 'white' : 'var(--text-secondary)',
            }}
          >
            {col} cols
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={index} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-glass)' }}>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Image {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-[12px]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Remove
              </button>
            </div>
            <ImageUpload
              value={image.url}
              onChange={(url) => updateImage(index, 'url', url)}
              onUpload={onUpload}
              aspectRatio="square"
              className="w-full"
            />
            <input
              type="text"
              value={image.caption || ''}
              onChange={(e) => updateImage(index, 'caption', e.target.value)}
              placeholder="Caption (optional)"
              className="w-full px-3 py-1.5 rounded text-[13px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addImage}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add image
      </button>

      <label className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={(data.expandable as boolean) !== false}
          onChange={(e) => onChange({ ...data, expandable: e.target.checked })}
        />
        Allow click to expand
      </label>
    </div>
  );
}
