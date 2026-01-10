'use client';

interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatsBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function StatsBlockEditor({ data, onChange }: StatsBlockEditorProps) {
  const items = (data.items as StatItem[]) || [];

  const addItem = () => {
    onChange({ ...data, items: [...items, { value: '', label: '' }] });
  };

  const updateItem = (index: number, field: keyof StatItem, value: string) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-glass)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Stat {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-[12px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Remove
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={item.prefix || ''}
              onChange={(e) => updateItem(index, 'prefix', e.target.value)}
              placeholder="$"
              className="w-12 px-2 py-1.5 rounded text-[13px] text-center"
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
              className="flex-1 px-3 py-1.5 rounded text-[13px]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
            <input
              type="text"
              value={item.suffix || ''}
              onChange={(e) => updateItem(index, 'suffix', e.target.value)}
              placeholder="%"
              className="w-12 px-2 py-1.5 rounded text-[13px] text-center"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <input
            type="text"
            value={item.label}
            onChange={(e) => updateItem(index, 'label', e.target.value)}
            placeholder="Label (e.g., Users, Revenue)"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
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
        + Add stat
      </button>
    </div>
  );
}
