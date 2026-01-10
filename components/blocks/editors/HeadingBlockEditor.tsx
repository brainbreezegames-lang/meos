'use client';

interface HeadingBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function HeadingBlockEditor({ data, onChange }: HeadingBlockEditorProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={(data.text as string) || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Heading text"
        className="w-full px-3 py-2 rounded-lg text-[13px]"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="flex gap-2">
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange({ ...data, level })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: data.level === level ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: data.level === level ? 'white' : 'var(--text-secondary)',
            }}
          >
            H{level}
          </button>
        ))}
      </div>
    </div>
  );
}
