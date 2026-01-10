'use client';

import { ImageUpload } from '@/components/ui';

interface ImageBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function ImageBlockEditor({ data, onChange, onUpload }: ImageBlockEditorProps) {
  return (
    <div className="space-y-3">
      <ImageUpload
        label="Image"
        value={(data.url as string) || ''}
        onChange={(url) => onChange({ ...data, url })}
        onUpload={onUpload}
        aspectRatio="wide"
      />
      <input
        type="text"
        value={(data.caption as string) || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <input
        type="text"
        value={(data.alt as string) || ''}
        onChange={(e) => onChange({ ...data, alt: e.target.value })}
        placeholder="Alt text (for accessibility)"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="flex gap-2">
        {['auto', '16:9', '4:3', '1:1'].map((ratio) => (
          <button
            key={ratio}
            type="button"
            onClick={() => onChange({ ...data, aspectRatio: ratio })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: data.aspectRatio === ratio ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: data.aspectRatio === ratio ? 'white' : 'var(--text-secondary)',
            }}
          >
            {ratio}
          </button>
        ))}
      </div>
    </div>
  );
}
