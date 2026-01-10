'use client';

interface DetailItem {
  label: string;
  value: string;
  color?: string;
}

interface DetailsBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function DetailsBlockEditor({ data, onChange }: DetailsBlockEditorProps) {
  const items = (data.items as DetailItem[]) || [];

  const addItem = () => {
    onChange({ ...data, items: [...items, { label: '', value: '' }] });
  };

  const updateItem = (index: number, field: keyof DetailItem, value: string) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item.label}
            onChange={(e) => updateItem(index, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1 px-3 py-2 rounded-lg text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => updateItem(index, 'value', e.target.value)}
            placeholder="Value"
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
        + Add detail
      </button>
    </div>
  );
}
