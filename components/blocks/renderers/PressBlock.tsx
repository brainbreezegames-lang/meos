'use client';

interface PressMention {
  publication: string;
  logo?: string;
  headline: string;
  url: string;
  date?: string;
}

interface PressBlockData {
  mentions: PressMention[];
}

interface PressBlockRendererProps {
  data: Record<string, unknown>;
}

export default function PressBlockRenderer({ data }: PressBlockRendererProps) {
  const { mentions = [] } = data as unknown as PressBlockData;

  if (!mentions.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-3">
        {mentions.map((mention, index) => (
          <a
            key={index}
            href={mention.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-xl transition-all"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-light)'
            }}
          >
            {mention.logo ? (
              <img
                src={mention.logo}
                alt={mention.publication}
                className="w-10 h-10 object-contain flex-shrink-0 rounded"
              />
            ) : (
              <div
                className="w-10 h-10 flex items-center justify-center rounded flex-shrink-0 text-[14px] font-bold"
                style={{
                  background: 'var(--bg-glass)',
                  color: 'var(--text-secondary)'
                }}
              >
                {mention.publication.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {mention.publication}
              </div>
              <div
                className="text-[13px] font-medium mt-0.5 line-clamp-2 group-hover:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                &ldquo;{mention.headline}&rdquo;
              </div>
              {mention.date && (
                <div
                  className="text-[11px] mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {mention.date}
                </div>
              )}
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="var(--text-tertiary)"
              className="flex-shrink-0 mt-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            >
              <path d="M3.5 3a.5.5 0 0 0 0 1h3.793L3.146 8.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5Z"/>
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
