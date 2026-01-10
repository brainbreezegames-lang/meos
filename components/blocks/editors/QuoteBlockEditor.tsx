'use client';

interface QuoteBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function QuoteBlockEditor({ data, onChange }: QuoteBlockEditorProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={(data.text as string) || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Quote text..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={(data.attribution as string) || ''}
          onChange={(e) => onChange({ ...data, attribution: e.target.value })}
          placeholder="Attribution"
          className="px-3 py-2 rounded-lg text-[13px]"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
        <input
          type="text"
          value={(data.source as string) || ''}
          onChange={(e) => onChange({ ...data, source: e.target.value })}
          placeholder="Source (optional)"
          className="px-3 py-2 rounded-lg text-[13px]"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <div className="flex gap-2">
        {['simple', 'large'].map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onChange({ ...data, style })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors"
            style={{
              background: data.style === style ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: data.style === style ? 'white' : 'var(--text-secondary)',
            }}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
}
