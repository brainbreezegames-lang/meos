'use client';

interface EmbedBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const embedTypes = [
  { value: 'figma', label: 'Figma' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'codepen', label: 'CodePen' },
  { value: 'custom', label: 'Custom' },
];

export default function EmbedBlockEditor({ data, onChange }: EmbedBlockEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {embedTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange({ ...data, embedType: type.value })}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: data.embedType === type.value ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: data.embedType === type.value ? 'white' : 'var(--text-secondary)',
            }}
          >
            {type.label}
          </button>
        ))}
      </div>
      <input
        type="url"
        value={(data.url as string) || ''}
        onChange={(e) => onChange({ ...data, url: e.target.value })}
        placeholder="Embed URL"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="flex gap-2">
        {['16:9', '4:3', '1:1', 'auto'].map((ratio) => (
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
      <input
        type="number"
        value={(data.height as number) || ''}
        onChange={(e) => onChange({ ...data, height: e.target.value ? parseInt(e.target.value) : undefined })}
        placeholder="Custom height (px)"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}
