'use client';

interface LinkItem {
  label?: string;
  title?: string;
  url: string;
  description?: string;
  icon?: string;
}

interface LinksBlockData {
  links: LinkItem[];
}

interface LinksBlockRendererProps {
  data: Record<string, unknown>;
}

export default function LinksBlockRenderer({ data }: LinksBlockRendererProps) {
  const { links = [] } = data as unknown as LinksBlockData;

  if (!links.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-2">
        {links.map((link, index) => {
          const displayLabel = link.label || link.title || 'Link';

          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-light)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* Icon */}
              {link.icon && (
                <span className="text-[18px] flex-shrink-0">{link.icon}</span>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-medium group-hover:text-[var(--accent-primary)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {displayLabel}
                </div>
                {link.description && (
                  <p
                    className="text-[11px] mt-0.5 line-clamp-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.description}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ background: 'rgba(0, 122, 255, 0.08)' }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <path
                    d="M3 9L9 3M9 3H4.5M9 3V7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
