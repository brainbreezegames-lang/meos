'use client';

import React, { useMemo } from 'react';
import type { DesktopItem, GoOSFileType } from '@/types';
import { FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/lib/goos/fileTypeMapping';

// Clean, distraction-free design tokens
const pageStyles = {
  colors: {
    background: '#FAFAFA',
    paper: '#FFFFFF',
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      muted: '#999999',
    },
    accent: '#2B4AE2',
    border: '#E5E5E5',
    divider: '#EEEEEE',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"SF Pro Text", Georgia, "Times New Roman", serif',
    mono: '"SF Mono", Menlo, Monaco, monospace',
  },
};

interface PageViewProps {
  items: DesktopItem[];
  pageOrder?: string[];
  onItemClick?: (item: DesktopItem) => void;
  isOwner?: boolean;
  author?: {
    name: string;
    username: string;
    image?: string | null;
  };
}

export function PageView({
  items,
  pageOrder,
  onItemClick,
  isOwner = false,
  author,
}: PageViewProps) {
  // Filter to notes and case studies only, sort by pageOrder or date
  const sortedItems = useMemo(() => {
    const filteredItems = items.filter(item => {
      // Only show notes and case-studies
      if (item.itemVariant !== 'goos-file') return false;
      if (item.goosFileType === 'folder') return false;
      // For visitors, only show published
      if (!isOwner && item.publishStatus !== 'published') return false;
      return true;
    });

    if (pageOrder && pageOrder.length > 0) {
      const orderMap = new Map(pageOrder.map((id, index) => [id, index]));
      return [...filteredItems].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Infinity;
        const orderB = orderMap.get(b.id) ?? Infinity;
        return orderA - orderB;
      });
    }
    // Default: sort by publishedAt or updatedAt, newest first
    return [...filteredItems].sort((a, b) => {
      const dateA = a.publishedAt || a.updatedAt || a.createdAt;
      const dateB = b.publishedAt || b.updatedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [items, pageOrder, isOwner]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: pageStyles.colors.background,
      }}
    >
      {/* Clean header */}
      <header
        style={{
          background: pageStyles.colors.paper,
          borderBottom: `1px solid ${pageStyles.colors.border}`,
          padding: '24px 0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {author?.image && (
              <img
                src={author.image}
                alt={author.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            )}
            <div>
              <h1
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: pageStyles.colors.text.primary,
                  fontFamily: pageStyles.fonts.heading,
                  margin: 0,
                }}
              >
                {author?.name || 'Portfolio'}
              </h1>
              {author?.username && (
                <span
                  style={{
                    fontSize: '13px',
                    color: pageStyles.colors.text.muted,
                    fontFamily: pageStyles.fonts.heading,
                  }}
                >
                  @{author.username}
                </span>
              )}
            </div>
          </div>
          <span
            style={{
              fontSize: '12px',
              color: pageStyles.colors.text.muted,
              fontFamily: pageStyles.fonts.heading,
            }}
          >
            {sortedItems.length} {sortedItems.length === 1 ? 'article' : 'articles'}
          </span>
        </div>
      </header>

      {/* Articles */}
      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '48px 24px 120px',
        }}
      >
        {sortedItems.map((item, index) => (
          <Article
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === sortedItems.length - 1}
            isOwner={isOwner}
            onClick={() => onItemClick?.(item)}
          />
        ))}

        {sortedItems.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
            }}
          >
            <p
              style={{
                fontSize: '18px',
                color: pageStyles.colors.text.secondary,
                fontFamily: pageStyles.fonts.body,
                fontStyle: 'italic',
              }}
            >
              {isOwner ? 'No published content yet' : 'Nothing here yet'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${pageStyles.colors.border}`,
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: pageStyles.colors.text.muted,
            fontFamily: pageStyles.fonts.heading,
          }}
        >
          Built with goOS
        </span>
      </footer>
    </div>
  );
}

interface ArticleProps {
  item: DesktopItem;
  isFirst: boolean;
  isLast: boolean;
  isOwner: boolean;
  onClick?: () => void;
}

function Article({ item, isFirst, isLast, isOwner, onClick }: ArticleProps) {
  const isDraft = item.publishStatus === 'draft';
  const fileType = (item.goosFileType || 'note') as GoOSFileType;
  const title = item.windowTitle || item.label;
  const subtitle = item.windowSubtitle;
  const content = item.goosContent || '';
  const headerImage = item.windowHeaderImage;
  const publishedAt = item.publishedAt || item.updatedAt || item.createdAt;

  // Format date
  const formattedDate = useMemo(() => {
    if (!publishedAt) return null;
    const date = new Date(publishedAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [publishedAt]);

  return (
    <article
      style={{
        marginBottom: isLast ? 0 : '80px',
        opacity: isDraft ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Draft badge for owners */}
      {isDraft && isOwner && (
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#FEF3C7',
            color: '#92400E',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: pageStyles.fonts.heading,
            marginBottom: '16px',
          }}
        >
          Draft
        </div>
      )}

      {/* Header image */}
      {headerImage && (
        <div
          style={{
            marginBottom: '32px',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <img
            src={headerImage}
            alt=""
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Type + Date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: pageStyles.colors.accent,
            fontFamily: pageStyles.fonts.heading,
          }}
        >
          {FILE_TYPE_LABELS[fileType] || 'Article'}
        </span>
        {formattedDate && (
          <>
            <span style={{ color: pageStyles.colors.text.muted }}>·</span>
            <span
              style={{
                fontSize: '13px',
                color: pageStyles.colors.text.muted,
                fontFamily: pageStyles.fonts.heading,
              }}
            >
              {formattedDate}
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: '32px',
          fontWeight: 700,
          color: pageStyles.colors.text.primary,
          fontFamily: pageStyles.fonts.heading,
          lineHeight: 1.25,
          marginBottom: subtitle ? '12px' : '24px',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: '20px',
            color: pageStyles.colors.text.secondary,
            fontFamily: pageStyles.fonts.body,
            lineHeight: 1.5,
            marginBottom: '24px',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Full content */}
      <div
        className="prose-content"
        style={{
          fontSize: '18px',
          lineHeight: 1.75,
          color: pageStyles.colors.text.primary,
          fontFamily: pageStyles.fonts.body,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Divider between articles */}
      {!isLast && (
        <div
          style={{
            marginTop: '80px',
            height: '1px',
            background: pageStyles.colors.divider,
          }}
        />
      )}

      {/* Global styles for prose content */}
      <style jsx global>{`
        .prose-content h1 {
          font-size: 28px;
          font-weight: 700;
          font-family: ${pageStyles.fonts.heading};
          color: ${pageStyles.colors.text.primary};
          margin: 40px 0 20px;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }
        .prose-content h2 {
          font-size: 24px;
          font-weight: 700;
          font-family: ${pageStyles.fonts.heading};
          color: ${pageStyles.colors.text.primary};
          margin: 36px 0 16px;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }
        .prose-content h3 {
          font-size: 20px;
          font-weight: 600;
          font-family: ${pageStyles.fonts.heading};
          color: ${pageStyles.colors.text.primary};
          margin: 32px 0 12px;
          line-height: 1.4;
        }
        .prose-content p {
          margin: 0 0 20px;
        }
        .prose-content p:last-child {
          margin-bottom: 0;
        }
        .prose-content a {
          color: ${pageStyles.colors.accent};
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-content a:hover {
          text-decoration-thickness: 2px;
        }
        .prose-content strong {
          font-weight: 600;
          color: ${pageStyles.colors.text.primary};
        }
        .prose-content em {
          font-style: italic;
        }
        .prose-content ul, .prose-content ol {
          margin: 20px 0;
          padding-left: 24px;
        }
        .prose-content li {
          margin: 8px 0;
        }
        .prose-content blockquote {
          border-left: 3px solid ${pageStyles.colors.accent};
          margin: 24px 0;
          padding: 4px 0 4px 20px;
          color: ${pageStyles.colors.text.secondary};
          font-style: italic;
        }
        .prose-content code {
          font-family: ${pageStyles.fonts.mono};
          font-size: 0.9em;
          background: #F5F5F5;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .prose-content pre {
          background: #1a1a1a;
          color: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 24px 0;
          font-family: ${pageStyles.fonts.mono};
          font-size: 14px;
          line-height: 1.6;
        }
        .prose-content pre code {
          background: none;
          padding: 0;
          font-size: inherit;
        }
        .prose-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 24px 0;
        }
        .prose-content hr {
          border: none;
          height: 1px;
          background: ${pageStyles.colors.divider};
          margin: 40px 0;
        }
        .prose-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 16px;
        }
        .prose-content th, .prose-content td {
          border: 1px solid ${pageStyles.colors.border};
          padding: 12px;
          text-align: left;
        }
        .prose-content th {
          background: #F9F9F9;
          font-weight: 600;
          font-family: ${pageStyles.fonts.heading};
        }
      `}</style>
    </article>
  );
}
