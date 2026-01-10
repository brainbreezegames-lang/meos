'use client';

interface ListItem {
  text: string;
  checked?: boolean;
}

interface ListBlockData {
  style: 'bullet' | 'numbered' | 'check';
  items: (string | ListItem)[];
}

interface ListBlockRendererProps {
  data: Record<string, unknown>;
}

export default function ListBlockRenderer({ data }: ListBlockRendererProps) {
  const { style = 'bullet', items = [] } = data as unknown as ListBlockData;

  if (!items.length) return null;

  // Normalize items - support both string[] and object[]
  const normalizedItems = items.map(item =>
    typeof item === 'string' ? { text: item, checked: true } : item
  );

  const getBullet = (index: number, item: { text: string; checked?: boolean }) => {
    switch (style) {
      case 'numbered':
        return (
          <span
            className="text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%)',
              color: 'var(--accent-primary)'
            }}
          >
            {index + 1}
          </span>
        );
      case 'check':
        return (
          <span
            className="w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: item.checked !== false
                ? 'linear-gradient(135deg, #34C759 0%, #30B350 100%)'
                : 'var(--bg-glass)',
              border: item.checked !== false ? 'none' : '1.5px solid var(--border-light)',
              boxShadow: item.checked !== false ? '0 1px 2px rgba(52, 199, 89, 0.25)' : 'none'
            }}
          >
            {item.checked !== false && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5L4 7L8 3"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        );
      default:
        return (
          <span
            className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[6px]"
            style={{
              background: 'var(--accent-primary)',
              opacity: 0.7
            }}
          />
        );
    }
  };

  return (
    <div className="px-5 py-3">
      <ul className="flex flex-col gap-2">
        {normalizedItems.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5">
            {getBullet(index, item)}
            <span
              className="text-[13px] leading-relaxed"
              style={{
                color: 'var(--text-primary)',
                textDecoration: style === 'check' && item.checked === false ? 'line-through' : 'none',
                opacity: style === 'check' && item.checked === false ? 0.5 : 1
              }}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
