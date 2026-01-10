'use client';

interface QuoteBlockData {
  text: string;
  attribution?: string;
  source?: string;
  style: 'simple' | 'large' | 'testimonial';
}

interface QuoteBlockRendererProps {
  data: Record<string, unknown>;
}

export default function QuoteBlockRenderer({ data }: QuoteBlockRendererProps) {
  const { text, attribution, source, style = 'simple' } = data as unknown as QuoteBlockData;

  if (!text) return null;

  if (style === 'large') {
    return (
      <div className="px-5 py-4">
        <blockquote className="relative">
          <span
            className="absolute -left-1 -top-2 text-[48px] leading-none opacity-20"
            style={{ color: 'var(--accent-primary)' }}
          >
            &ldquo;
          </span>
          <p
            className="text-[17px] font-medium leading-relaxed pl-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {text}
          </p>
          {(attribution || source) && (
            <footer className="mt-3 pl-4 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {attribution && <span className="font-medium">{attribution}</span>}
              {source && <span className="opacity-70"> — {source}</span>}
            </footer>
          )}
        </blockquote>
      </div>
    );
  }

  return (
    <div className="px-5 py-3">
      <blockquote
        className="border-l-2 pl-4"
        style={{ borderColor: 'var(--accent-primary)' }}
      >
        <p
          className="text-[13px] leading-relaxed italic"
          style={{ color: 'var(--text-primary)' }}
        >
          &ldquo;{text}&rdquo;
        </p>
        {(attribution || source) && (
          <footer className="mt-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            {attribution && <span>{attribution}</span>}
            {source && <span className="opacity-70">, {source}</span>}
          </footer>
        )}
      </blockquote>
    </div>
  );
}
