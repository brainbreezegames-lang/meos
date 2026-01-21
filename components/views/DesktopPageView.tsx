'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, FileText, Presentation, Lock, Mail, DollarSign } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import type { ThemeId } from '@/contexts/ThemeContext';

// Brand Appart design tokens (aligned with useWidgetTheme)
const goOS = {
  colors: {
    paper: '#fbf9ef',         // Brand cream
    border: '#171412',        // Brand base dark
    background: '#fbf9ef',    // Brand cream
    text: {
      primary: '#171412',     // Brand base
      secondary: '#8e827c',   // Brand grey
      muted: '#8e827c',
      accent: '#ff7722',      // Brand orange
    },
  },
  shadows: {
    solid: '4px 4px 0 rgba(23, 20, 18, 0.1)',
    hover: '6px 6px 0 rgba(23, 20, 18, 0.15)',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

interface DesktopPageViewProps {
  items: {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;
    headerImage: string | null;
    publishedAt: Date | null;
    fileType: 'note' | 'case-study';
    accessLevel: 'free' | 'paid' | 'email';
    priceAmount: number | null;
  }[];
  pageOrder: string[];
  author: {
    username: string;
    name: string;
    image: string | null;
    title: string | null;
    description: string | null;
  };
  theme?: ThemeId;
}

export function DesktopPageView({ items, pageOrder, author, theme = 'sketch' }: DesktopPageViewProps) {
  // Sort items by pageOrder if provided
  const sortedItems = useMemo(() => {
    if (pageOrder && pageOrder.length > 0) {
      const orderMap = new Map(pageOrder.map((id, index) => [id, index]));
      return [...items].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? Infinity;
        const orderB = orderMap.get(b.id) ?? Infinity;
        return orderA - orderB;
      });
    }
    // Default: sort by publishedAt descending
    return [...items].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [items, pageOrder]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: goOS.colors.background,
      }}
    >
      {/* Navigation bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: goOS.colors.paper,
          borderBottom: `2px solid ${goOS.colors.border}`,
          padding: '12px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href={`/${author.username}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: goOS.colors.text.accent,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: goOS.fonts.heading,
            }}
          >
            <ArrowLeft size={18} strokeWidth={2} />
            <span>Back to Desktop</span>
          </Link>

          <span
            style={{
              fontSize: '12px',
              color: goOS.colors.text.muted,
              fontFamily: goOS.fonts.body,
            }}
          >
            Page View
          </span>
        </div>
      </nav>

      {/* Header */}
      <header
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '48px 24px 32px',
          borderBottom: `2px solid ${goOS.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          {author.image ? (
            <img
              src={author.image}
              alt={author.name}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: `2px solid ${goOS.colors.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: goOS.colors.border,
                color: goOS.colors.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                fontFamily: goOS.fonts.heading,
              }}
            >
              {author.name[0]}
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: goOS.colors.text.primary,
                fontFamily: goOS.fonts.heading,
                marginBottom: '4px',
              }}
            >
              {author.title || author.name}
            </h1>
            {author.description && (
              <p
                style={{
                  fontSize: '14px',
                  color: goOS.colors.text.secondary,
                  fontFamily: goOS.fonts.body,
                }}
              >
                {author.description}
              </p>
            )}
          </div>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: goOS.colors.text.muted,
            fontFamily: goOS.fonts.body,
          }}
        >
          {sortedItems.length} {sortedItems.length === 1 ? 'article' : 'articles'}
        </p>
      </header>

      {/* Articles list */}
      <main
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '32px 24px 96px',
        }}
      >
        {sortedItems.map((item, index) => (
          <ArticleCard
            key={item.id}
            item={item}
            username={author.username}
            isFirst={index === 0}
          />
        ))}

        {sortedItems.length === 0 && (
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              background: goOS.colors.paper,
              border: `2px solid ${goOS.colors.border}`,
              borderRadius: '8px',
              boxShadow: goOS.shadows.solid,
            }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📭</span>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: goOS.colors.text.primary,
                fontFamily: goOS.fonts.heading,
                marginBottom: '8px',
              }}
            >
              No content yet
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
              }}
            >
              Nothing published yet. Check back later.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `2px solid ${goOS.colors.border}`,
          background: goOS.colors.paper,
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: goOS.colors.text.muted,
            fontFamily: goOS.fonts.body,
          }}
        >
          Built with goOS
        </p>
      </footer>
    </div>
  );
}

interface ArticleCardProps {
  item: {
    id: string;
    title: string;
    subtitle: string | null;
    content: string;
    headerImage: string | null;
    publishedAt: Date | null;
    fileType: 'note' | 'case-study';
    accessLevel: 'free' | 'paid' | 'email';
    priceAmount: number | null;
  };
  username: string;
  isFirst?: boolean;
}

function ArticleCard({ item, username, isFirst }: ArticleCardProps) {
  const FileIcon = item.fileType === 'case-study' ? Presentation : FileText;

  // Get content preview
  const contentPreview = useMemo(() => {
    if (item.content) {
      const text = item.content.replace(/<[^>]*>/g, '').trim();
      return text.length > 200 ? text.slice(0, 200) + '...' : text;
    }
    return '';
  }, [item.content]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    const wordCount = item.content
      .replace(/<[^>]*>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [item.content]);

  // Format date
  const publishDate = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const slug = generateSlug(item.title) || item.id;

  return (
    <Link
      href={`/${username}/${item.id}`}
      style={{ textDecoration: 'none' }}
    >
      <article
        style={{
          marginBottom: '24px',
          background: goOS.colors.paper,
          border: `2px solid ${goOS.colors.border}`,
          borderRadius: '8px',
          boxShadow: goOS.shadows.solid,
          overflow: 'hidden',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-2px, -2px)';
          e.currentTarget.style.boxShadow = goOS.shadows.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)';
          e.currentTarget.style.boxShadow = goOS.shadows.solid;
        }}
      >
        {/* Header image */}
        {item.headerImage && (
          <div
            style={{
              aspectRatio: '2.5/1',
              background: `url(${item.headerImage}) center/cover no-repeat`,
              borderBottom: `2px solid ${goOS.colors.border}`,
            }}
          />
        )}

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Type and meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileIcon size={16} strokeWidth={2} style={{ color: goOS.colors.text.accent }} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: goOS.colors.text.accent,
                  fontFamily: goOS.fonts.heading,
                }}
              >
                {item.fileType === 'case-study' ? 'Case Study' : 'Note'}
              </span>
            </div>

            {/* Access badge */}
            {item.accessLevel !== 'free' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: goOS.colors.border,
                  color: goOS.colors.paper,
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: goOS.fonts.heading,
                }}
              >
                {item.accessLevel === 'paid' ? (
                  <>
                    <DollarSign size={12} strokeWidth={2} />
                    <span>${item.priceAmount || '0'}</span>
                  </>
                ) : (
                  <>
                    <Mail size={12} strokeWidth={2} />
                    <span>Email</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: goOS.colors.text.primary,
              fontFamily: goOS.fonts.heading,
              marginBottom: '8px',
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </h2>

          {/* Subtitle */}
          {item.subtitle && (
            <p
              style={{
                fontSize: '15px',
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
                marginBottom: '12px',
                lineHeight: 1.5,
              }}
            >
              {item.subtitle}
            </p>
          )}

          {/* Preview */}
          {contentPreview && (
            <p
              style={{
                fontSize: '14px',
                color: goOS.colors.text.muted,
                fontFamily: goOS.fonts.body,
                lineHeight: 1.6,
                marginBottom: '16px',
              }}
            >
              {contentPreview}
            </p>
          )}

          {/* Footer meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingTop: '16px',
              borderTop: `1px solid rgba(43, 74, 226, 0.2)`,
            }}
          >
            {publishDate && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: goOS.colors.text.muted,
                  fontSize: '12px',
                  fontFamily: goOS.fonts.body,
                }}
              >
                <Calendar size={14} strokeWidth={2} />
                <span>{publishDate}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: goOS.colors.text.muted,
                fontSize: '12px',
                fontFamily: goOS.fonts.body,
              }}
            >
              <Clock size={14} strokeWidth={2} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
