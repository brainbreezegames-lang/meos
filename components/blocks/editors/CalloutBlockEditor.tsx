'use client';

interface CalloutBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const calloutStyles = [
  { value: 'info', label: 'Info', icon: 'ℹ️' },
  { value: 'warning', label: 'Warning', icon: '⚠️' },
  { value: 'success', label: 'Success', icon: '✓' },
  { value: 'note', label: 'Note', icon: '📝' },
];

export default function CalloutBlockEditor({ data, onChange }: CalloutBlockEditorProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={(data.text as string) || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Callout text..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
      <div className="flex gap-2">
        {calloutStyles.map((style) => (
          <button
            key={style.value}
            type="button"
            onClick={() => onChange({ ...data, style: style.value, icon: style.icon })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: data.style === style.value ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: data.style === style.value ? 'white' : 'var(--text-secondary)',
            }}
          >
            {style.icon} {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}
