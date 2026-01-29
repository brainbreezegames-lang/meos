'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Play } from 'lucide-react';
import type { ThemeId } from '@/contexts/ThemeContext';

/**
 * Belle Duffner-style Case Study Page View
 *
 * Reference: https://belleduffner.com/reforgerobotics
 *
 * Features:
 * - Full-bleed hero image with title overlay and curved wave transition
 * - Sticky sidebar with scroll-spy navigation
 * - Serif display typography for headings
 * - Full-width images that break out of container
 * - "More Case Studies" section at bottom
 */

// Brand Appart design tokens (aligned with useWidgetTheme)
const tokens = {
  colors: {
    background: '#fbf9ef',    // Brand cream
    text: {
      primary: '#171412',     // Brand base
      secondary: '#8e827c',   // Brand grey
      muted: 'rgba(23, 20, 18, 0.4)',
    },
    border: 'rgba(23, 20, 18, 0.1)',
    overlay: 'rgba(23, 20, 18, 0.3)',
    accent: '#ff7722',        // Brand orange
  },
  fonts: {
    display: 'var(--font-display)',
    body: 'var(--font-body)',
  },
  spacing: {
    contentMaxWidth: '680px',
    sidebarWidth: '200px',
    sidebarLeft: '48px',
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
    icon?: string | null;
  };
  author: {
    username: string;
    name: string;
    image: string | null;
  };
  theme?: ThemeId;
  otherNotes?: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    headerImage: string | null;
  }>;
}

// Parse H2 headings from HTML content for sidebar navigation
function parseHeadings(htmlContent: string): Array<{ id: string; text: string }> {
  const headings: Array<{ id: string; text: string }> = [];
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  let index = 0;

  while ((match = h2Regex.exec(htmlContent)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text) {
      headings.push({
        id: `section-${index}`,
        text,
      });
      index++;
    }
  }

  return headings;
}

// Extract first image from content for hero if no header image
function extractFirstImage(htmlContent: string): string | null {
  const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : null;
}

// Remove first image from content if it's being used as hero
function removeFirstImage(htmlContent: string): string {
  return htmlContent.replace(/<p>\s*<img[^>]+>\s*<\/p>|<img[^>]+>/i, '');
}

// Add IDs to H2 headings for scroll navigation
function addHeadingIds(htmlContent: string): string {
  let index = 0;
  return htmlContent.replace(/<h2([^>]*)>/gi, () => {
    const id = `section-${index}`;
    index++;
    return `<h2 id="${id}"$1>`;
  });
}

export function NotePageView({ note, author, theme = 'sketch', otherNotes = [] }: NotePageViewProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Parse headings for sidebar
  const headings = useMemo(() => parseHeadings(note.content), [note.content]);

  // Determine hero image
  const heroImage = note.headerImage || extractFirstImage(note.content);

  // Process content - remove first image if used as hero, add IDs to headings
  const processedContent = useMemo(() => {
    let content = note.content;
    if (!note.headerImage && heroImage) {
      content = removeFirstImage(content);
    }
    return addHeadingIds(content);
  }, [note.content, note.headerImage, heroImage]);

  // Format date
  const publishDate = note.publishedAt
    ? new Date(note.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Scroll spy effect
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: tokens.colors.background,
      }}
    >
      {/* Hero Section - Full Bleed with Title Overlay */}
      <section
        style={{
          position: 'relative',
          width: '100vw',
          height: heroImage ? '70vh' : '40vh',
          minHeight: heroImage ? '500px' : '300px',
          overflow: 'hidden',
          background: heroImage ? 'transparent' : tokens.colors.text.primary,
        }}
      >
        {/* Hero Image */}
        {heroImage && (
          <img
            src={heroImage}
            alt={note.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}

        {/* Overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: heroImage
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)'
              : 'transparent',
          }}
        />

        {/* Hero Title - Centered on image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: tokens.fonts.display,
              fontSize: 'clamp(48px, 8vw, 80px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#FFFFFF',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              textShadow: '0 2px 40px rgba(0,0,0,0.3)',
              maxWidth: '900px',
            }}
          >
            {note.title}
          </h1>

          {/* Decorative dot */}
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#FFFFFF',
              marginTop: '24px',
              opacity: 0.8,
            }}
          />
        </div>

        {/* Curved wave at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '80px',
            background: tokens.colors.background,
            borderTopLeftRadius: '50% 100%',
            borderTopRightRadius: '50% 100%',
          }}
        />
      </section>

      {/* Main Layout - Sidebar + Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: headings.length > 0 ? `${tokens.spacing.sidebarWidth} 1fr` : '1fr',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Sticky Sidebar */}
        {headings.length > 0 && (
          <aside
            style={{
              position: 'sticky',
              top: '120px',
              height: 'fit-content',
              paddingLeft: tokens.spacing.sidebarLeft,
              paddingTop: '40px',
            }}
          >
            {/* Back link */}
            <Link
              href={`/${author.username}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: tokens.colors.text.muted,
                textDecoration: 'none',
                fontFamily: tokens.fonts.body,
                marginBottom: '32px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = tokens.colors.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = tokens.colors.text.muted;
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>

            {/* Section navigation */}
            <nav
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {headings.map(({ id, text }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: tokens.fonts.body,
                    color: activeSection === id
                      ? tokens.colors.text.primary
                      : tokens.colors.text.muted,
                    fontWeight: activeSection === id ? 500 : 400,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== id) {
                      e.currentTarget.style.color = 'rgba(26, 26, 26, 0.7)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== id) {
                      e.currentTarget.style.color = tokens.colors.text.muted;
                    }
                  }}
                >
                  {text}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main
          style={{
            maxWidth: tokens.spacing.contentMaxWidth,
            padding: '0 24px 120px',
            margin: headings.length > 0 ? '0' : '0 auto',
          }}
        >
          {/* Project Meta - Icon + Name + Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '32px',
              paddingTop: '40px',
            }}
          >
            {/* Project icon */}
            {note.icon && (
              <img
                src={note.icon}
                alt=""
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                }}
              />
            )}
            <div>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: tokens.fonts.body,
                  color: tokens.colors.text.primary,
                  marginBottom: '4px',
                }}
              >
                {note.title}
              </h2>
              {note.subtitle && (
                <p
                  style={{
                    fontSize: '14px',
                    fontFamily: tokens.fonts.body,
                    color: tokens.colors.text.muted,
                  }}
                >
                  {note.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div
            ref={contentRef}
            className="case-study-content"
            style={{
              fontFamily: tokens.fonts.body,
              fontSize: '18px',
              lineHeight: 1.7,
              color: tokens.colors.text.primary,
            }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </main>
      </div>

      {/* More Case Studies Section */}
      {otherNotes.length > 0 && (
        <section
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '96px 24px 64px',
            borderTop: `1px solid ${tokens.colors.border}`,
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: tokens.colors.text.muted,
              textAlign: 'center',
              marginBottom: '48px',
              fontFamily: tokens.fonts.body,
            }}
          >
            More Case Studies
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '32px',
              marginBottom: '48px',
            }}
          >
            {otherNotes.slice(0, 4).map((otherNote) => (
              <Link
                key={otherNote.id}
                href={`/${author.username}/${otherNote.id}`}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {otherNote.headerImage && (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 10',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '20px',
                    }}
                  >
                    <img
                      src={otherNote.headerImage}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
                <h4
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    fontFamily: tokens.fonts.body,
                    color: tokens.colors.text.primary,
                    marginBottom: '6px',
                  }}
                >
                  {otherNote.title}
                </h4>
                {otherNote.subtitle && (
                  <p
                    style={{
                      fontSize: '15px',
                      fontFamily: tokens.fonts.body,
                      color: tokens.colors.text.muted,
                    }}
                  >
                    {otherNote.subtitle}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <Link
            href={`/${author.username}`}
            style={{
              display: 'block',
              width: '100%',
              padding: '20px',
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '8px',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: tokens.fonts.body,
              color: tokens.colors.text.primary,
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            View all work
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          maxWidth: tokens.spacing.contentMaxWidth,
          margin: '0 auto',
          padding: '64px 24px',
          textAlign: 'center',
          borderTop: `1px solid ${tokens.colors.border}`,
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: tokens.colors.text.muted,
            fontFamily: tokens.fonts.body,
            marginBottom: '16px',
          }}
        >
          {author.name}
        </p>
        <Link
          href={`/${author.username}`}
          style={{
            fontSize: '14px',
            color: tokens.colors.text.primary,
            fontFamily: tokens.fonts.body,
            textDecoration: 'none',
          }}
        >
          ← Back to Desktop
        </Link>
      </footer>

      {/* Case Study Content Styles */}
      <style jsx global>{`
        /* Import Playfair Display for serif headings */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

        .case-study-content {
          overflow: hidden;
        }

        /* Section Labels - H4 becomes small uppercase label */
        .case-study-content h4 {
          font-size: 12px;
          font-weight: 500;
          font-family: ${tokens.fonts.body};
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: ${tokens.colors.text.muted};
          margin: 64px 0 16px;
        }

        .case-study-content h4:first-child {
          margin-top: 0;
        }

        /* Main Headings - H2 in serif */
        .case-study-content h2 {
          font-family: ${tokens.fonts.display};
          font-size: 36px;
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: ${tokens.colors.text.primary};
          margin: 24px 0;
          max-width: 600px;
        }

        /* Sub Headings - H3 */
        .case-study-content h3 {
          font-family: ${tokens.fonts.display};
          font-size: 28px;
          font-weight: 400;
          line-height: 1.2;
          color: ${tokens.colors.text.primary};
          margin: 48px 0 16px;
        }

        /* Body text */
        .case-study-content p {
          margin: 0 0 24px;
        }

        .case-study-content p:last-child {
          margin-bottom: 0;
        }

        /* Links */
        .case-study-content a {
          color: ${tokens.colors.text.primary};
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
        }

        .case-study-content a:hover {
          text-decoration-thickness: 2px;
        }

        /* Links with external arrow (deliverables) */
        .case-study-content a[href^="http"]::after {
          content: " ↗";
          font-size: 0.9em;
        }

        /* Bold text */
        .case-study-content strong {
          font-weight: 600;
        }

        /* Italic text */
        .case-study-content em {
          font-style: italic;
        }

        /* Lists */
        .case-study-content ul,
        .case-study-content ol {
          margin: 24px 0;
          padding-left: 28px;
        }

        .case-study-content li {
          margin: 8px 0;
        }

        /* Blockquotes */
        .case-study-content blockquote {
          border-left: 3px solid ${tokens.colors.text.primary};
          margin: 32px 0;
          padding: 4px 0 4px 24px;
          font-family: ${tokens.fonts.display};
          font-size: 24px;
          font-style: italic;
          line-height: 1.4;
          color: ${tokens.colors.text.secondary};
        }

        /* Images - Full width by default */
        .case-study-content img {
          display: block;
          width: 100vw;
          max-width: none;
          height: auto;
          margin: 48px calc(-50vw + 50%);
          object-fit: cover;
        }

        /* Image grids - when two images are adjacent */
        .case-study-content p + p img,
        .case-study-content img + img {
          margin-top: 16px;
        }

        /* Code */
        .case-study-content code {
          font-family: "SF Mono", Monaco, Consolas, monospace;
          font-size: 0.9em;
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .case-study-content pre {
          background: #1a1a1a;
          color: #f5f5f5;
          padding: 24px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 32px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .case-study-content pre code {
          background: none;
          padding: 0;
          font-size: inherit;
        }

        /* Horizontal rules - section dividers */
        .case-study-content hr {
          border: none;
          height: 1px;
          background: ${tokens.colors.border};
          margin: 64px 0;
        }

        /* Tables */
        .case-study-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 32px 0;
          font-size: 16px;
        }

        .case-study-content th,
        .case-study-content td {
          border: 1px solid ${tokens.colors.border};
          padding: 12px 16px;
          text-align: left;
        }

        .case-study-content th {
          background: rgba(0, 0, 0, 0.02);
          font-weight: 600;
        }

        /* Responsive - Hide sidebar on tablets */
        @media (max-width: 1024px) {
          .case-study-content img {
            width: calc(100% + 48px);
            margin-left: -24px;
            margin-right: -24px;
          }
        }

        /* Responsive - Mobile typography */
        @media (max-width: 640px) {
          .case-study-content h2 {
            font-size: 28px;
          }

          .case-study-content h3 {
            font-size: 22px;
          }

          .case-study-content {
            font-size: 16px;
          }

          .case-study-content blockquote {
            font-size: 20px;
            padding-left: 16px;
          }

          .case-study-content img {
            width: calc(100% + 32px);
            margin-left: -16px;
            margin-right: -16px;
          }
        }
      `}</style>
    </div>
  );
}
