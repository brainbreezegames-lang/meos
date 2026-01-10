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

  const sizes = {
    1: 'text-[18px] font-semibold',
    2: 'text-[15px] font-semibold',
    3: 'text-[13px] font-medium uppercase tracking-wide',
  };

  return (
    <div className="px-5 pt-4 pb-2">
      <h3
        className={`${sizes[level]} leading-tight`}
        style={{ color: 'var(--text-primary)' }}
      >
        {text}
      </h3>
    </div>
  );
}
