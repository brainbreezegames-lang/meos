'use client';

interface AwardItem {
  badge?: string;
  name: string;
  issuer?: string;
  year?: string;
  description?: string;
}

interface AwardBlockData {
  awards: AwardItem[];
}

interface AwardBlockRendererProps {
  data: Record<string, unknown>;
}

export default function AwardBlockRenderer({ data }: AwardBlockRendererProps) {
  const awards = (data.awards as AwardItem[] | undefined) || [];

  if (!awards.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-3">
        {awards.map((award, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 193, 7, 0.04) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.15)'
            }}
          >
            <div className="text-2xl flex-shrink-0">
              {award.badge || '🏆'}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[14px] font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {award.name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {award.issuer && (
                  <span
                    className="text-[12px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {award.issuer}
                  </span>
                )}
                {award.issuer && award.year && (
                  <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                )}
                {award.year && (
                  <span
                    className="text-[12px]"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {award.year}
                  </span>
                )}
              </div>
              {award.description && (
                <p
                  className="text-[12px] mt-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {award.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
