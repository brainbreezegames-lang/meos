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
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <div className="relative">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative flex last:pb-0"
            style={{ gap: 'var(--spacing-inline-gap)', paddingBottom: 'var(--spacing-block-gap)' }}
          >
            {/* Timeline line */}
            {index < items.length - 1 && (
              <div
                className="absolute w-px"
                style={{
                  left: `calc(var(--timeline-dot-size) / 2)`,
                  top: 'calc(var(--timeline-dot-size) + 4px)',
                  height: 'calc(100% - var(--timeline-dot-size))',
                  background: 'var(--border-light)',
                }}
              />
            )}

            {/* Timeline dot */}
            <div
              className="flex-shrink-0 mt-[2px]"
              style={{
                width: 'var(--timeline-dot-size)',
                height: 'var(--timeline-dot-size)',
                borderRadius: 'var(--radius-detail-dot)',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'var(--accent-primary)',
                background: index === 0 ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className="mb-0.5"
                style={{
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-timeline-date)',
                  fontWeight: 'var(--font-weight-medium)',
                  textTransform: 'var(--text-transform-label)' as React.CSSProperties['textTransform'],
                  letterSpacing: 'var(--letter-spacing-label)',
                }}
              >
                {item.date}
              </div>
              <div
                className="leading-tight"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--font-size-timeline-title)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {item.title}
              </div>
              {item.subtitle && (
                <div
                  className="mt-0.5"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-timeline-subtitle)',
                  }}
                >
                  {item.subtitle}
                </div>
              )}
              {item.description && (
                <p
                  className="mt-1.5 leading-relaxed"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--font-size-timeline-subtitle)',
                    lineHeight: 'var(--line-height-body)',
                  }}
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
