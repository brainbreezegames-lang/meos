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
    <div className="px-5 py-3">
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <span
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color || 'var(--accent-success)' }}
            />
            <span
              className="text-[12px] font-medium flex-shrink-0"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.label}
            </span>
            <span
              className="text-[12px]"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
