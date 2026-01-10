'use client';

interface HeadingBlockData {
  text: string;
  level: 1 | 2 | 3;
}

interface HeadingBlockRendererProps {
  data: Record<string, unknown>;
}

export default function HeadingBlockRenderer({ data }: HeadingBlockRendererProps) {
  const { text, level = 2 } = data as unknown as HeadingBlockData;

  if (!text) return null;

  const getFontSize = (lvl: 1 | 2 | 3) => {
    switch (lvl) {
      case 1: return 'var(--font-size-heading-1)';
      case 2: return 'var(--font-size-heading-2)';
      case 3: return 'var(--font-size-heading-3)';
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-window-padding)', paddingBottom: '8px' }}>
      <h3
        style={{
          color: 'var(--text-primary)',
          fontFamily: level === 3 ? 'var(--font-body)' : 'var(--font-display)',
          fontSize: getFontSize(level),
          fontWeight: level === 3 ? 'var(--font-weight-medium)' : 'var(--font-weight-semibold)',
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: level === 3 ? 'var(--letter-spacing-label)' : 'var(--letter-spacing-tight)',
          textTransform: level === 3 ? 'var(--text-transform-label)' as React.CSSProperties['textTransform'] : 'none',
        }}
      >
        {text}
      </h3>
    </div>
  );
}
