'use client';

import Image from 'next/image';

interface BookItem {
  cover: string;
  title: string;
  subtitle?: string;
  description?: string;
  buyUrl?: string;
  amazonUrl?: string;
  year?: string;
}

interface BookBlockData {
  books: BookItem[];
}

interface BookBlockRendererProps {
  data: Record<string, unknown>;
}

export default function BookBlockRenderer({ data }: BookBlockRendererProps) {
  const { books = [] } = data as unknown as BookBlockData;

  if (!books.length) return null;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-col gap-4">
        {books.map((book, index) => (
          <div key={index}>
            {index > 0 && (
              <div className="h-px w-full mb-4" style={{ background: 'var(--border-light)' }} />
            )}
            <div className="flex gap-4">
              <div
                className="relative w-20 flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  aspectRatio: '2/3',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[15px] font-semibold leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {book.title}
                </div>
                {book.subtitle && (
                  <div
                    className="text-[12px] mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {book.subtitle}
                  </div>
                )}
                {book.year && (
                  <div
                    className="text-[11px] mt-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {book.year}
                  </div>
                )}
                {book.description && (
                  <p
                    className="text-[12px] mt-2 line-clamp-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {book.description}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {book.buyUrl && (
                    <a
                      href={book.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md text-[11px] font-medium"
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'white'
                      }}
                    >
                      Buy Now
                    </a>
                  )}
                  {book.amazonUrl && (
                    <a
                      href={book.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md text-[11px] font-medium"
                      style={{
                        background: 'rgba(255, 153, 0, 0.1)',
                        color: '#FF9900'
                      }}
                    >
                      Amazon
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
