'use client';

interface ButtonItem {
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'ghost';
  icon?: string;
  newTab?: boolean;
}

interface ButtonsBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function ButtonsBlockEditor({ data, onChange }: ButtonsBlockEditorProps) {
  const buttons = (data.buttons as ButtonItem[]) || [];

  const addButton = () => {
    onChange({ ...data, buttons: [...buttons, { label: '', url: '', style: 'primary', newTab: true }] });
  };

  const updateButton = (index: number, field: keyof ButtonItem, value: unknown) => {
    const newButtons = buttons.map((btn, i) =>
      i === index ? { ...btn, [field]: value } : btn
    );
    onChange({ ...data, buttons: newButtons });
  };

  const removeButton = (index: number) => {
    onChange({ ...data, buttons: buttons.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {buttons.map((button, index) => (
        <div key={index} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-glass)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Button {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeButton(index)}
              className="text-[12px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={button.label}
            onChange={(e) => updateButton(index, 'label', e.target.value)}
            placeholder="Button label"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="url"
            value={button.url}
            onChange={(e) => updateButton(index, 'url', e.target.value)}
            placeholder="URL"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex gap-2">
            {(['primary', 'secondary', 'ghost'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => updateButton(index, 'style', style)}
                className="flex-1 py-1 rounded text-[11px] font-medium capitalize transition-colors"
                style={{
                  background: button.style === style ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: button.style === style ? 'white' : 'var(--text-secondary)',
                }}
              >
                {style}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={button.newTab !== false}
              onChange={(e) => updateButton(index, 'newTab', e.target.checked)}
            />
            Open in new tab
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={addButton}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add button
      </button>
    </div>
  );
}
