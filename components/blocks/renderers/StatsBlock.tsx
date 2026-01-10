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
    <div className="px-5 py-4">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`
        }}
      >
        {items.map((item, index) => (
          <div key={index} className="text-center">
            <div
              className="text-[24px] font-bold leading-none"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.prefix}
              {item.value}
              {item.suffix}
            </div>
            <div
              className="text-[11px] mt-1 uppercase tracking-wide font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
