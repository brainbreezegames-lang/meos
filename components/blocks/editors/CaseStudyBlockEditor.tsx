'use client';

interface MetricItem {
  label: string;
  value: string;
}

interface CaseStudySections {
  challenge?: string;
  approach?: string;
  solution?: string;
  result?: string;
  metrics?: MetricItem[];
}

interface CaseStudyBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export default function CaseStudyBlockEditor({ data, onChange }: CaseStudyBlockEditorProps) {
  const sections = (data.sections as CaseStudySections) || {};
  const metrics = sections.metrics || [];

  const updateSection = (field: keyof CaseStudySections, value: unknown) => {
    onChange({
      ...data,
      sections: { ...sections, [field]: value },
    });
  };

  const addMetric = () => {
    updateSection('metrics', [...metrics, { label: '', value: '' }]);
  };

  const updateMetric = (index: number, field: keyof MetricItem, value: string) => {
    const newMetrics = metrics.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    updateSection('metrics', newMetrics);
  };

  const removeMetric = (index: number) => {
    updateSection('metrics', metrics.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-tertiary)' }}>
          Challenge
        </label>
        <textarea
          value={sections.challenge || ''}
          onChange={(e) => updateSection('challenge', e.target.value)}
          placeholder="What problem were you solving?"
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div>
        <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-tertiary)' }}>
          Approach
        </label>
        <textarea
          value={sections.approach || ''}
          onChange={(e) => updateSection('approach', e.target.value)}
          placeholder="How did you tackle it?"
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div>
        <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--text-tertiary)' }}>
          Result
        </label>
        <textarea
          value={sections.result || ''}
          onChange={(e) => updateSection('result', e.target.value)}
          placeholder="What was the outcome?"
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-[13px] resize-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div>
        <label className="text-[11px] font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
          Key Metrics
        </label>
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={metric.label}
                onChange={(e) => updateMetric(index, 'label', e.target.value)}
                placeholder="Metric name"
                className="flex-1 px-3 py-1.5 rounded text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type="text"
                value={metric.value}
                onChange={(e) => updateMetric(index, 'value', e.target.value)}
                placeholder="Value"
                className="w-24 px-3 py-1.5 rounded text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => removeMetric(index)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-black/5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMetric}
            className="w-full py-1.5 rounded text-[12px] font-medium"
            style={{
              background: 'var(--bg-glass)',
              color: 'var(--accent-primary)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            + Add metric
          </button>
        </div>
      </div>
    </div>
  );
}
