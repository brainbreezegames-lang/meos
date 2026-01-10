'use client';

interface TimelineItem {
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
}

interface TimelineBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function TimelineBlockEditor({ data, onChange }: TimelineBlockEditorProps) {
  const items = (data.items as TimelineItem[]) || [];

  const addItem = () => {
    onChange({ ...data, items: [...items, { date: '', title: '' }] });
  };

  const updateItem = (index: number, field: keyof TimelineItem, value: string) => {
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
              Event {index + 1}
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
          <input
            type="text"
            value={item.date}
            onChange={(e) => updateItem(index, 'date', e.target.value)}
            placeholder="Date (e.g., 2024, Jan 2024)"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateItem(index, 'title', e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="text"
            value={item.subtitle || ''}
            onChange={(e) => updateItem(index, 'subtitle', e.target.value)}
            placeholder="Subtitle (optional)"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <textarea
            value={item.description || ''}
            onChange={(e) => updateItem(index, 'description', e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-1.5 rounded text-[13px] resize-none"
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
        + Add event
      </button>
    </div>
  );
}
