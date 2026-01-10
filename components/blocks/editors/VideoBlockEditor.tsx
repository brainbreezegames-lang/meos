'use client';

interface VideoBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function VideoBlockEditor({ data, onChange }: VideoBlockEditorProps) {
  return (
    <div className="space-y-3">
      <input
        type="url"
        value={(data.url as string) || ''}
        onChange={(e) => onChange({ ...data, url: e.target.value })}
        placeholder="YouTube or Vimeo URL"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="flex gap-2">
        {['16:9', '4:3', '1:1'].map((ratio) => (
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
      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        Supports YouTube, Vimeo, and direct video URLs
      </p>
    </div>
  );
}
