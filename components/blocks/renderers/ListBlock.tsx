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
            className="font-bold flex items-center justify-center flex-shrink-0"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-stat-label)',
              fontFamily: 'var(--font-body)',
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%)',
              color: 'var(--accent-primary)',
            }}
          >
            {index + 1}
          </span>
        );
      case 'check':
        return (
          <span
            className="flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-sm)',
              background: item.checked !== false
                ? 'linear-gradient(135deg, var(--accent-success) 0%, var(--accent-success) 100%)'
                : 'var(--bg-glass)',
              border: item.checked !== false ? 'none' : '1.5px solid var(--border-light)',
              boxShadow: item.checked !== false ? 'var(--shadow-sm)' : 'none',
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
            className="flex-shrink-0 mt-[6px]"
            style={{
              width: 'var(--detail-dot-size)',
              height: 'var(--detail-dot-size)',
              borderRadius: 'var(--radius-detail-dot)',
              background: 'var(--accent-primary)',
              opacity: 0.7,
            }}
          />
        );
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <ul className="flex flex-col" style={{ gap: 'var(--spacing-block-gap)' }}>
        {normalizedItems.map((item, index) => (
          <li key={index} className="flex items-start" style={{ gap: 'var(--spacing-inline-gap)' }}>
            {getBullet(index, item)}
            <span
              className="leading-relaxed"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height-body)',
                textDecoration: style === 'check' && item.checked === false ? 'line-through' : 'none',
                opacity: style === 'check' && item.checked === false ? 0.5 : 1,
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
