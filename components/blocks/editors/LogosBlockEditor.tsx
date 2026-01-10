'use client';

import { ImageUpload } from '@/components/ui';

interface LogoItem {
  image: string;
  name: string;
  url?: string;
}

interface LogosBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function LogosBlockEditor({ data, onChange, onUpload }: LogosBlockEditorProps) {
  const logos = (data.logos as LogoItem[]) || [];
  const style = (data.style as string) || 'grid';

  const addLogo = () => {
    onChange({ ...data, logos: [...logos, { image: '', name: '' }] });
  };

  const updateLogo = (index: number, field: keyof LogoItem, value: string) => {
    const newLogos = logos.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    );
    onChange({ ...data, logos: newLogos });
  };

  const removeLogo = (index: number) => {
    onChange({ ...data, logos: logos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={(data.title as string) || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Section title (e.g., Clients)"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />

      <div className="flex gap-2">
        {['grid', 'row'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...data, style: s })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors"
            style={{
              background: style === s ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: style === s ? 'white' : 'var(--text-secondary)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={(data.grayscale as boolean) || false}
          onChange={(e) => onChange({ ...data, grayscale: e.target.checked })}
        />
        Grayscale (color on hover)
      </label>

      {logos.map((logo, index) => (
        <div key={index} className="flex gap-2 items-start">
          <ImageUpload
            value={logo.image}
            onChange={(url) => updateLogo(index, 'image', url)}
            onUpload={onUpload}
            aspectRatio="wide"
            className="w-20"
          />
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={logo.name}
              onChange={(e) => updateLogo(index, 'name', e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-1.5 rounded text-[13px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
            <input
              type="url"
              value={logo.url || ''}
              onChange={(e) => updateLogo(index, 'url', e.target.value)}
              placeholder="URL (optional)"
              className="w-full px-3 py-1.5 rounded text-[13px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => removeLogo(index)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-black/5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLogo}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add logo
      </button>
    </div>
  );
}
