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
    <div className="px-5 py-3">
      <p
        className="text-[13px] leading-relaxed"
        style={{
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap'
        }}
      >
        {content}
      </p>
    </div>
  );
}
