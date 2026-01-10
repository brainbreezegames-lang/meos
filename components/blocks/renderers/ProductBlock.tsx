'use client';

import Image from 'next/image';

interface ProductItem {
  image: string;
  name: string;
  description: string;
  url: string;
  status?: 'active' | 'acquired' | 'shutdown';
  metrics?: string;
}

interface ProductBlockData {
  products: ProductItem[];
}

interface ProductBlockRendererProps {
  data: Record<string, unknown>;
}

const statusColors = {
  active: { bg: 'rgba(52, 199, 89, 0.1)', text: '#34C759', label: 'Active' },
  acquired: { bg: 'rgba(0, 122, 255, 0.1)', text: '#007AFF', label: 'Acquired' },
  shutdown: { bg: 'rgba(142, 142, 147, 0.1)', text: '#8E8E93', label: 'Shutdown' },
};

export default function ProductBlockRenderer({ data }: ProductBlockRendererProps) {
  const { products = [] } = data as unknown as ProductBlockData;

  if (!products.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-4">
        {products.map((product, index) => (
          <div key={index}>
            {index > 0 && (
              <div className="h-px w-full mb-4" style={{ background: 'var(--border-light)' }} />
            )}
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[14px] font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {product.name}
                </div>
                <p
                  className="text-[12px] mt-0.5 line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {product.status && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: statusColors[product.status].bg,
                        color: statusColors[product.status].text,
                      }}
                    >
                      {statusColors[product.status].label}
                    </span>
                  )}
                  {product.metrics && (
                    <span
                      className="text-[11px]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {product.metrics}
                    </span>
                  )}
                </div>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[12px] font-medium hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Visit
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M3.5 3a.5.5 0 0 0 0 1h3.793L3.146 8.146a.5.5 0 1 0 .708.708L8 4.707V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
