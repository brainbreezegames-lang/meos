'use client';

interface DividerBlockData {
  style?: 'line' | 'dots' | 'space';
}

interface DividerBlockRendererProps {
  data: Record<string, unknown>;
}

export default function DividerBlockRenderer({ data }: DividerBlockRendererProps) {
  const { style = 'line' } = data as unknown as DividerBlockData;

  if (style === 'space') {
    return <div className="h-4" />;
  }

  if (style === 'dots') {
    return (
      <div
        className="flex justify-center"
        style={{ padding: 'var(--spacing-window-padding)', gap: 'var(--spacing-block-gap)' }}
      >
        <span
          style={{
            width: 'var(--detail-dot-size)',
            height: 'var(--detail-dot-size)',
            borderRadius: 'var(--radius-detail-dot)',
            backgroundColor: 'var(--text-tertiary)',
          }}
        />
        <span
          style={{
            width: 'var(--detail-dot-size)',
            height: 'var(--detail-dot-size)',
            borderRadius: 'var(--radius-detail-dot)',
            backgroundColor: 'var(--text-tertiary)',
          }}
        />
        <span
          style={{
            width: 'var(--detail-dot-size)',
            height: 'var(--detail-dot-size)',
            borderRadius: 'var(--radius-detail-dot)',
            backgroundColor: 'var(--text-tertiary)',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-window-padding)', paddingTop: '8px', paddingBottom: '8px' }}>
      <div
        className="w-full"
        style={{
          height: 'var(--border-width)',
          background: 'var(--border-light)',
        }}
      />
    </div>
  );
}
