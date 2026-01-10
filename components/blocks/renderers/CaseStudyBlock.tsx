'use client';

interface CaseStudySections {
  challenge?: string;
  approach?: string;
  solution?: string;
  result?: string;
  metrics?: Array<{ label: string; value: string }>;
}

interface CaseStudyBlockData {
  sections: CaseStudySections;
}

interface CaseStudyBlockRendererProps {
  data: Record<string, unknown>;
}

export default function CaseStudyBlockRenderer({ data }: CaseStudyBlockRendererProps) {
  const { sections = {} } = data as unknown as CaseStudyBlockData;

  const hasContent = sections.challenge || sections.approach || sections.solution || sections.result;
  if (!hasContent) return null;

  const sectionItems = [
    { key: 'challenge', label: 'CHALLENGE', content: sections.challenge },
    { key: 'approach', label: 'APPROACH', content: sections.approach },
    { key: 'solution', label: 'SOLUTION', content: sections.solution },
    { key: 'result', label: 'RESULT', content: sections.result },
  ].filter(item => item.content);

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-4">
        {sectionItems.map((section, index) => (
          <div key={section.key}>
            {index > 0 && (
              <div className="h-px w-full mb-4" style={{ background: 'var(--border-light)' }} />
            )}
            <div
              className="text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              {section.label}
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}
            >
              {section.content}
            </p>
          </div>
        ))}

        {sections.metrics && sections.metrics.length > 0 && (
          <>
            <div className="h-px w-full" style={{ background: 'var(--border-light)' }} />
            <div
              className="grid gap-3 pt-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(sections.metrics.length, 3)}, 1fr)`
              }}
            >
              {sections.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(52, 199, 89, 0.08)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-success)' }}
                  />
                  <div>
                    <div
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {metric.label}
                    </div>
                    <div
                      className="text-[14px] font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {metric.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
