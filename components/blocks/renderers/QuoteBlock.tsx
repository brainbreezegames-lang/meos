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
      <div style={{ padding: 'var(--spacing-window-padding)' }}>
        <blockquote className="relative">
          <span
            className="absolute -left-1 -top-2 leading-none opacity-20"
            style={{
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
            }}
          >
            &ldquo;
          </span>
          <p
            className="pl-4 leading-relaxed"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-quote-large)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: 'var(--line-height-body)',
            }}
          >
            {text}
          </p>
          {(attribution || source) && (
            <footer
              className="mt-3 pl-4"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--font-size-label)',
              }}
            >
              {attribution && <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{attribution}</span>}
              {source && <span className="opacity-70"> — {source}</span>}
            </footer>
          )}
        </blockquote>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-window-padding)' }}>
      <blockquote
        className="pl-4"
        style={{
          borderLeft: `var(--quote-border-width) solid var(--accent-primary)`,
        }}
      >
        <p
          className="leading-relaxed italic"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-quote)',
            lineHeight: 'var(--line-height-body)',
          }}
        >
          &ldquo;{text}&rdquo;
        </p>
        {(attribution || source) && (
          <footer
            className="mt-2"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--font-size-label)',
            }}
          >
            {attribution && <span>{attribution}</span>}
            {source && <span className="opacity-70">, {source}</span>}
          </footer>
        )}
      </blockquote>
    </div>
  );
}
