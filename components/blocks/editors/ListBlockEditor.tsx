'use client';

interface ListBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function ListBlockEditor({ data, onChange }: ListBlockEditorProps) {
  const items = (data.items as string[]) || [];
  const style = (data.style as string) || 'bullet';

  const addItem = () => {
    onChange({ ...data, items: [...items, ''] });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = items.map((item, i) => (i === index ? value : item));
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['bullet', 'numbered', 'check'].map((s) => (
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
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="flex-1 px-3 py-2 rounded-lg text-[13px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add item
      </button>
    </div>
  );
}
