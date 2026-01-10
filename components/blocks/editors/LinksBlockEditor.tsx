'use client';

interface LinkItem {
  title: string;
  url: string;
  description?: string;
}

interface LinksBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function LinksBlockEditor({ data, onChange }: LinksBlockEditorProps) {
  const links = (data.links as LinkItem[]) || [];

  const addLink = () => {
    onChange({ ...data, links: [...links, { title: '', url: '' }] });
  };

  const updateLink = (index: number, field: keyof LinkItem, value: string) => {
    const newLinks = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    onChange({ ...data, links: newLinks });
  };

  const removeLink = (index: number) => {
    onChange({ ...data, links: links.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-glass)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Link {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="text-[12px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={link.title}
            onChange={(e) => updateLink(index, 'title', e.target.value)}
            placeholder="Link title"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="url"
            value={link.url}
            onChange={(e) => updateLink(index, 'url', e.target.value)}
            placeholder="URL"
            className="w-full px-3 py-1.5 rounded text-[13px]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="text"
            value={link.description || ''}
            onChange={(e) => updateLink(index, 'description', e.target.value)}
            placeholder="Description (optional)"
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
        onClick={addLink}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add link
      </button>
    </div>
  );
}
