'use client';

interface TimelineItem {
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
}

interface TimelineBlockData {
  items: TimelineItem[];
}

interface TimelineBlockRendererProps {
  data: Record<string, unknown>;
}

export default function TimelineBlockRenderer({ data }: TimelineBlockRendererProps) {
  const { items = [] } = data as unknown as TimelineBlockData;

  if (!items.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="relative">
        {items.map((item, index) => (
          <div key={index} className="relative flex gap-4 pb-4 last:pb-0">
            {/* Timeline line */}
            {index < items.length - 1 && (
              <div
                className="absolute left-[5px] top-[12px] w-px h-[calc(100%-4px)]"
                style={{ background: 'var(--border-light)' }}
              />
            )}

            {/* Timeline dot */}
            <div
              className="w-[11px] h-[11px] rounded-full flex-shrink-0 mt-[2px] border-2"
              style={{
                borderColor: 'var(--accent-primary)',
                background: index === 0 ? 'var(--accent-primary)' : 'var(--bg-elevated)'
              }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-medium uppercase tracking-wide mb-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {item.date}
              </div>
              <div
                className="text-[14px] font-medium leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.title}
              </div>
              {item.subtitle && (
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.subtitle}
                </div>
              )}
              {item.description && (
                <p
                  className="text-[12px] mt-1.5 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
