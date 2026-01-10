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
      <div className="px-5 py-3 flex justify-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
        <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="px-5 py-2">
      <div
        className="h-px w-full"
        style={{ background: 'var(--border-light)' }}
      />
    </div>
  );
}
