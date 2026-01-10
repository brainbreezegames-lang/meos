'use client';

interface TextBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function TextBlockEditor({ data, onChange }: TextBlockEditorProps) {
  return (
    <div>
      <textarea
        value={(data.content as string) || ''}
        onChange={(e) => onChange({ ...data, content: e.target.value })}
        placeholder="Enter text content..."
        rows={4}
        className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}
