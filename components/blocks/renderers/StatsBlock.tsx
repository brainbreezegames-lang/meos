'use client';

interface StatsItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatsBlockData {
  items: StatsItem[];
}

interface StatsBlockRendererProps {
  data: Record<string, unknown>;
}

export default function StatsBlockRenderer({ data }: StatsBlockRendererProps) {
  const { items = [] } = data as unknown as StatsBlockData;

  if (!items.length) return null;

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
          gap: 'var(--spacing-block-gap)',
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="text-center">
            <div
              className="font-bold leading-none"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-stat-value)',
                letterSpacing: 'var(--letter-spacing-tight)',
              }}
            >
              {item.prefix}
              {item.value}
              {item.suffix}
            </div>
            <div
              className="mt-1"
              style={{
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-stat-label)',
                fontWeight: 'var(--font-weight-medium)',
                textTransform: 'var(--text-transform-label)' as React.CSSProperties['textTransform'],
                letterSpacing: 'var(--letter-spacing-label)',
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
