'use client';

interface DetailsItem {
  label: string;
  value: string;
  color?: string;
}

interface DetailsBlockData {
  items: DetailsItem[];
}

interface DetailsBlockRendererProps {
  data: Record<string, unknown>;
}

export default function DetailsBlockRenderer({ data }: DetailsBlockRendererProps) {
  const { items = [] } = data as unknown as DetailsBlockData;

  if (!items.length) return null;

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <div className="flex flex-col" style={{ gap: 'var(--spacing-block-gap)' }}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center" style={{ gap: 'var(--spacing-inline-gap)' }}>
            <span
              className="flex-shrink-0"
              style={{
                width: 'var(--detail-dot-size)',
                height: 'var(--detail-dot-size)',
                borderRadius: 'var(--radius-detail-dot)',
                backgroundColor: item.color || 'var(--accent-success)',
              }}
            />
            <span
              className="flex-shrink-0"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-label)',
                fontWeight: 'var(--font-weight-medium)',
                letterSpacing: 'var(--letter-spacing-label)',
                textTransform: 'var(--text-transform-label)' as React.CSSProperties['textTransform'],
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-label)',
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
