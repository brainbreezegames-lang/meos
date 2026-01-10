'use client';

import { ImageUpload } from '@/components/ui';

interface TestimonialItem {
  quote: string;
  name: string;
  title?: string;
  image?: string;
  company?: string;
}

interface TestimonialBlockEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}

export default function TestimonialBlockEditor({ data, onChange, onUpload }: TestimonialBlockEditorProps) {
  const testimonials = (data.testimonials as TestimonialItem[]) || [];
  const style = (data.style as string) || 'simple';

  const addTestimonial = () => {
    onChange({ ...data, testimonials: [...testimonials, { quote: '', name: '' }] });
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string) => {
    const newTestimonials = testimonials.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    );
    onChange({ ...data, testimonials: newTestimonials });
  };

  const removeTestimonial = (index: number) => {
    onChange({ ...data, testimonials: testimonials.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['simple', 'cards'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...data, style: s })}
            className="flex-1 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors"
            style={{
              background: style === s ? 'var(--accent-primary)' : 'var(--bg-glass)',
              color: style === s ? 'white' : 'var(--text-secondary)',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {testimonials.map((testimonial, index) => (
        <div key={index} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-glass)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
              Testimonial {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeTestimonial(index)}
              className="text-[12px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Remove
            </button>
          </div>
          <textarea
            value={testimonial.quote}
            onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
            placeholder="Quote text..."
            rows={2}
            className="w-full px-3 py-1.5 rounded text-[13px] resize-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex gap-2">
            <ImageUpload
              value={testimonial.image || ''}
              onChange={(url) => updateTestimonial(index, 'image', url)}
              onUpload={onUpload}
              aspectRatio="square"
              className="w-12"
            />
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={testimonial.name}
                onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-1.5 rounded text-[13px]"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testimonial.title || ''}
                  onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="flex-1 px-3 py-1.5 rounded text-[13px]"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                  }}
                />
                <input
                  type="text"
                  value={testimonial.company || ''}
                  onChange={(e) => updateTestimonial(index, 'company', e.target.value)}
                  placeholder="Company"
                  className="flex-1 px-3 py-1.5 rounded text-[13px]"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addTestimonial}
        className="w-full py-2 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--bg-glass)',
          color: 'var(--accent-primary)',
          border: '1px dashed var(--border-medium)',
        }}
      >
        + Add testimonial
      </button>
    </div>
  );
}
