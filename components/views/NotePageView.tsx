'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, FileText, Presentation, Play } from 'lucide-react';
import type { ThemeId } from '@/contexts/ThemeContext';

// goOS Design Tokens - Mediterranean Blue (default theme for article pages)
const goOS = {
  colors: {
    paper: '#FFFFFF',
    border: '#2B4AE2',
    background: '#F8F9FE',
    text: {
      primary: '#1a1a2e',
      secondary: '#4a4a6a',
      muted: '#8a8aaa',
      accent: '#2B4AE2',
    },
  },
  shadows: {
    solid: '4px 4px 0 #2B4AE2',
    subtle: '0 4px 24px rgba(43, 74, 226, 0.1)',
  },
  fonts: {
    heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
    serif: '"New York", "Iowan Old Style", Georgia, serif',
  },
};

interface NotePageViewProps {
  note: {
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
  author: {
    username: string;
    name: string;
    image: string | null;
  };
  theme?: ThemeId;
}

export function NotePageView({ note, author, theme = 'sketch' }: NotePageViewProps) {
  // Calculate reading time
  const wordCount = note.content
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Format date
  const publishDate = note.publishedAt
    ? new Date(note.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const FileIcon = note.fileType === 'case-study' ? Presentation : FileText;

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
            maxWidth: '800px',
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
            <span>Back to {author.name}&apos;s Desktop</span>
          </Link>

          {/* Present button */}
          <Link
            href={`/${author.username}/${note.id}/present`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: goOS.colors.paper,
              border: `2px solid ${goOS.colors.border}`,
              color: goOS.colors.text.accent,
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: goOS.fonts.heading,
              boxShadow: '2px 2px 0 ' + goOS.colors.border,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = '3px 3px 0 ' + goOS.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '2px 2px 0 ' + goOS.colors.border;
            }}
          >
            <Play size={14} strokeWidth={2} />
            <span>Present</span>
          </Link>
        </div>
      </nav>

      {/* Article content */}
      <article
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '48px 24px 96px',
        }}
      >
        {/* Header image */}
        {note.headerImage && (
          <div
            style={{
              marginBottom: '32px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `2px solid ${goOS.colors.border}`,
              boxShadow: goOS.shadows.solid,
            }}
          >
            <img
              src={note.headerImage}
              alt={note.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Article header */}
        <header style={{ marginBottom: '32px' }}>
          {/* Type badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              background: goOS.colors.border,
              color: goOS.colors.paper,
              marginBottom: '16px',
            }}
          >
            <FileIcon size={14} strokeWidth={2} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: goOS.fonts.heading,
              }}
            >
              {note.fileType === 'case-study' ? 'Case Study' : 'Note'}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 700,
              color: goOS.colors.text.primary,
              fontFamily: goOS.fonts.heading,
              lineHeight: 1.2,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            {note.title}
          </h1>

          {/* Subtitle */}
          {note.subtitle && (
            <p
              style={{
                fontSize: '18px',
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              {note.subtitle}
            </p>
          )}

          {/* Meta info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              paddingTop: '16px',
              borderTop: `2px solid ${goOS.colors.border}`,
            }}
          >
            {/* Author */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {author.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${goOS.colors.border}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: goOS.colors.border,
                    color: goOS.colors.paper,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    fontFamily: goOS.fonts.heading,
                  }}
                >
                  {author.name[0]}
                </div>
              )}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: goOS.colors.text.primary,
                  fontFamily: goOS.fonts.heading,
                }}
              >
                {author.name}
              </span>
            </div>

            {/* Date */}
            {publishDate && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: goOS.colors.text.muted,
                  fontSize: '13px',
                  fontFamily: goOS.fonts.body,
                }}
              >
                <Calendar size={14} strokeWidth={2} />
                <span>{publishDate}</span>
              </div>
            )}

            {/* Reading time */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: goOS.colors.text.muted,
                fontSize: '13px',
                fontFamily: goOS.fonts.body,
              }}
            >
              <Clock size={14} strokeWidth={2} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        {/* Access gate for paid/email content */}
        {note.accessLevel !== 'free' && (
          <div
            style={{
              padding: '24px',
              borderRadius: '8px',
              background: goOS.colors.paper,
              border: `2px solid ${goOS.colors.border}`,
              boxShadow: goOS.shadows.solid,
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>
              {note.accessLevel === 'paid' ? '💰' : '✉️'}
            </span>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: goOS.colors.text.primary,
                fontFamily: goOS.fonts.heading,
                marginBottom: '8px',
              }}
            >
              {note.accessLevel === 'paid' ? 'Premium Content' : 'Email Required'}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: goOS.colors.text.secondary,
                fontFamily: goOS.fonts.body,
                marginBottom: '16px',
              }}
            >
              {note.accessLevel === 'paid'
                ? `This content is available for $${note.priceAmount || '0'}`
                : 'Enter your email to unlock this content'}
            </p>
            <button
              style={{
                padding: '12px 24px',
                borderRadius: '6px',
                background: goOS.colors.border,
                color: goOS.colors.paper,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: goOS.fonts.heading,
              }}
            >
              {note.accessLevel === 'paid' ? 'Purchase Access' : 'Enter Email'}
            </button>
          </div>
        )}

        {/* Article body */}
        <div
          className="goos-article-content"
          style={{
            fontFamily: goOS.fonts.serif,
            fontSize: '18px',
            lineHeight: 1.8,
            color: goOS.colors.text.primary,
          }}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </article>

      {/* Footer */}
      <footer
        style={{
          borderTop: `2px solid ${goOS.colors.border}`,
          background: goOS.colors.paper,
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <Link
          href={`/${author.username}`}
          style={{
            display: 'inline-flex',
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
          <span>View more from {author.name}</span>
        </Link>
        <p
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: goOS.colors.text.muted,
            fontFamily: goOS.fonts.body,
          }}
        >
          Built with goOS
        </p>
      </footer>

      {/* Article styling */}
      <style jsx global>{`
        .goos-article-content h1 {
          font-family: ${goOS.fonts.heading};
          font-size: 32px;
          font-weight: 700;
          margin: 32px 0 16px;
          color: ${goOS.colors.text.primary};
          letter-spacing: -0.02em;
        }
        .goos-article-content h2 {
          font-family: ${goOS.fonts.heading};
          font-size: 26px;
          font-weight: 600;
          margin: 28px 0 14px;
          color: ${goOS.colors.text.primary};
        }
        .goos-article-content h3 {
          font-family: ${goOS.fonts.heading};
          font-size: 20px;
          font-weight: 600;
          margin: 24px 0 12px;
          color: ${goOS.colors.text.primary};
        }
        .goos-article-content p {
          margin-bottom: 20px;
        }
        .goos-article-content ul,
        .goos-article-content ol {
          margin-bottom: 20px;
          padding-left: 28px;
        }
        .goos-article-content li {
          margin-bottom: 8px;
        }
        .goos-article-content a {
          color: ${goOS.colors.text.accent};
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .goos-article-content a:hover {
          text-decoration-thickness: 2px;
        }
        .goos-article-content blockquote {
          border-left: 4px solid ${goOS.colors.border};
          padding-left: 20px;
          margin: 24px 0;
          font-style: italic;
          color: ${goOS.colors.text.secondary};
        }
        .goos-article-content code {
          background: rgba(43, 74, 226, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 15px;
          font-family: "SF Mono", Monaco, monospace;
        }
        .goos-article-content pre {
          background: ${goOS.colors.paper};
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 24px 0;
          border: 2px solid ${goOS.colors.border};
          box-shadow: ${goOS.shadows.solid};
        }
        .goos-article-content pre code {
          background: none;
          padding: 0;
        }
        .goos-article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 24px 0;
          border: 2px solid ${goOS.colors.border};
          box-shadow: ${goOS.shadows.solid};
        }
        .goos-article-content hr {
          border: none;
          border-top: 2px dashed ${goOS.colors.border};
          margin: 40px 0;
        }
      `}</style>
    </div>
  );
}
