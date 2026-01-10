'use client';

interface DividerBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const styles = [
  { value: 'line', label: 'Line' },
  { value: 'dots', label: 'Dots' },
  { value: 'space', label: 'Space' },
];

export default function DividerBlockEditor({ data, onChange }: DividerBlockEditorProps) {
  return (
    <div className="flex gap-2">
      {styles.map((style) => (
        <button
          key={style.value}
          type="button"
          onClick={() => onChange({ ...data, style: style.value })}
          className="flex-1 py-2 rounded-md text-[12px] font-medium transition-colors"
          style={{
            background: data.style === style.value ? 'var(--accent-primary)' : 'var(--bg-glass)',
            color: data.style === style.value ? 'white' : 'var(--text-secondary)',
          }}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}
