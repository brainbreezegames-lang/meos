'use client';

import Image from 'next/image';

interface TestimonialItem {
  quote: string;
  name: string;
  title?: string;
  image?: string;
  company?: string;
  companyLogo?: string;
}

interface TestimonialBlockData {
  testimonials: TestimonialItem[];
  style: 'cards' | 'simple' | 'carousel';
}

interface TestimonialBlockRendererProps {
  data: Record<string, unknown>;
}

export default function TestimonialBlockRenderer({ data }: TestimonialBlockRendererProps) {
  const { testimonials = [], style = 'simple' } = data as unknown as TestimonialBlockData;

  if (!testimonials.length) return null;

  if (style === 'cards') {
    return (
      <div className="px-5 py-3">
        <div className="flex flex-col gap-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-4 rounded-xl"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-light)'
              }}
            >
              <p
                className="text-[13px] leading-relaxed mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {testimonial.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {testimonial.name}
                  </div>
                  {(testimonial.title || testimonial.company) && (
                    <div
                      className="text-[11px]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {testimonial.title}
                      {testimonial.title && testimonial.company && ' at '}
                      {testimonial.company}
                    </div>
                  )}
                </div>
                {testimonial.companyLogo && (
                  <img
                    src={testimonial.companyLogo}
                    alt={testimonial.company || 'Company'}
                    className="h-6 w-auto object-contain opacity-60"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple style (default)
  return (
    <div className="px-5 py-3">
      {testimonials.map((testimonial, index) => (
        <div key={index} className={index > 0 ? 'mt-4 pt-4 border-t border-[var(--border-light)]' : ''}>
          <blockquote className="relative">
            <span
              className="absolute -left-1 -top-2 text-[36px] leading-none opacity-20"
              style={{ color: 'var(--accent-primary)' }}
            >
              &ldquo;
            </span>
            <p
              className="text-[14px] leading-relaxed pl-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {testimonial.quote}
            </p>
          </blockquote>
          <div className="flex items-center gap-3 mt-3 pl-4">
            {testimonial.image && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <div
                className="text-[12px] font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {testimonial.name}
              </div>
              {(testimonial.title || testimonial.company) && (
                <div
                  className="text-[11px]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {testimonial.title}
                  {testimonial.title && testimonial.company && ', '}
                  {testimonial.company}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
