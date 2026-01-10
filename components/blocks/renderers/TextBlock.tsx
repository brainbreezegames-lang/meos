'use client';

interface TextBlockData {
  content: string;
}

interface TextBlockRendererProps {
  data: Record<string, unknown>;
}

export default function TextBlockRenderer({ data }: TextBlockRendererProps) {
  const { content } = data as unknown as TextBlockData;

  if (!content) return null;

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <p
        style={{
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--font-size-body)',
          lineHeight: 'var(--line-height-body)',
          letterSpacing: 'var(--letter-spacing-normal)',
        }}
      >
        {content}
      </p>
    </div>
  );
}
